/**
 * Digicraft Visual Editor Hook
 *
 * Injected into preview apps. Dormant by default — activates when parent
 * frame sends 'editor:enable' via postMessage. Handles element selection,
 * hover highlights, drag, and resize. Never mutates app DOM or styles
 * except for temporary previews triggered by parent.
 */

(function () {
  "use strict";

  // ─── State ──────────────────────────────────────────────────────────────────
  let active = false;
  let selectedEl = null;
  let hoveredEl = null;
  let dragState = null;
  let resizeState = null;
  let handles = [];
  let ghostEl = null;
  let previewStyles = new Map();

  const IGNORED_TAGS = new Set([
    "HTML", "BODY", "SCRIPT", "STYLE", "LINK", "META", "HEAD", "NOSCRIPT",
  ]);
  const MIN_ELEMENT_SIZE = 8;
  const HANDLE_SIZE = 8;

  // ─── Utility: XPath ─────────────────────────────────────────────────────────

  function getXPath(el) {
    if (!el || el.nodeType !== 1) return "";
    var parts = [];
    var current = el;
    while (current && current.nodeType === 1) {
      var index = 1;
      var sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === current.tagName) index++;
        sibling = sibling.previousElementSibling;
      }
      var tagName = current.tagName.toLowerCase();
      var hasMultiple =
        current.parentElement &&
        Array.from(current.parentElement.children).filter(
          function (c) { return c.tagName === current.tagName; }
        ).length > 1;
      parts.unshift(hasMultiple ? tagName + "[" + index + "]" : tagName);
      current = current.parentElement;
    }
    return "/" + parts.join("/");
  }

  // ─── Utility: Element Data ──────────────────────────────────────────────────

  function getElementData(el) {
    var computed = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || "",
      classes: Array.from(el.classList),
      xpath: getXPath(el),
      computedStyles: {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        padding: computed.padding,
        paddingTop: computed.paddingTop,
        paddingRight: computed.paddingRight,
        paddingBottom: computed.paddingBottom,
        paddingLeft: computed.paddingLeft,
        margin: computed.margin,
        marginTop: computed.marginTop,
        marginRight: computed.marginRight,
        marginBottom: computed.marginBottom,
        marginLeft: computed.marginLeft,
        width: rect.width + "px",
        height: rect.height + "px",
        borderRadius: computed.borderRadius,
        borderWidth: computed.borderWidth,
        borderColor: computed.borderColor,
        display: computed.display,
        flexDirection: computed.flexDirection,
        gap: computed.gap,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems,
        opacity: computed.opacity,
        textAlign: computed.textAlign,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
      },
      boundingRect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
    };
  }

  // ─── Utility: Resolve XPath ─────────────────────────────────────────────────

  function resolveXPath(xpath) {
    try {
      var result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    } catch (e) {
      return null;
    }
  }

  // ─── Utility: Send to Parent ────────────────────────────────────────────────

  function send(data) {
    window.parent.postMessage(data, "*");
  }

  // ─── Utility: Should Ignore ─────────────────────────────────────────────────

  function shouldIgnore(el) {
    if (!el || el.nodeType !== 1) return true;
    if (IGNORED_TAGS.has(el.tagName)) return true;
    var rect = el.getBoundingClientRect();
    if (rect.width < MIN_ELEMENT_SIZE || rect.height < MIN_ELEMENT_SIZE) return true;
    if (el.dataset && el.dataset.editorOverlay) return true;
    return false;
  }

  // ─── Highlight ──────────────────────────────────────────────────────────────

  function setHoverHighlight(el) {
    if (hoveredEl) {
      hoveredEl.style.outline = hoveredEl._editorPrevOutline || "";
      delete hoveredEl._editorPrevOutline;
    }
    hoveredEl = el;
    if (el && el !== selectedEl) {
      el._editorPrevOutline = el.style.outline;
      el.style.outline = "2px solid rgba(99, 102, 241, 0.5)";
    }
  }

  function setSelectionHighlight(el) {
    if (selectedEl) {
      selectedEl.style.outline = selectedEl._editorSelOutline || "";
      delete selectedEl._editorSelOutline;
    }
    removeHandles();
    selectedEl = el;
    if (el) {
      el._editorSelOutline = el.style.outline;
      el.style.outline = "2px solid #6366f1";
      createHandles(el);
    }
  }

  // ─── Resize Handles ─────────────────────────────────────────────────────────

  function createHandles(el) {
    removeHandles();
    var rect = el.getBoundingClientRect();
    var positions = [
      { cursor: "nw-resize", x: rect.left, y: rect.top },
      { cursor: "n-resize", x: rect.left + rect.width / 2, y: rect.top },
      { cursor: "ne-resize", x: rect.right, y: rect.top },
      { cursor: "e-resize", x: rect.right, y: rect.top + rect.height / 2 },
      { cursor: "se-resize", x: rect.right, y: rect.bottom },
      { cursor: "s-resize", x: rect.left + rect.width / 2, y: rect.bottom },
      { cursor: "sw-resize", x: rect.left, y: rect.bottom },
      { cursor: "w-resize", x: rect.left, y: rect.top + rect.height / 2 },
    ];
    positions.forEach(function (pos) {
      var h = document.createElement("div");
      h.dataset.editorOverlay = "true";
      h.style.cssText =
        "position:fixed;z-index:2147483647;width:" +
        HANDLE_SIZE + "px;height:" + HANDLE_SIZE +
        "px;background:#6366f1;border:1px solid white;border-radius:1px;cursor:" +
        pos.cursor + ";pointer-events:auto;";
      h.style.left = (pos.x - HANDLE_SIZE / 2) + "px";
      h.style.top = (pos.y - HANDLE_SIZE / 2) + "px";
      h.addEventListener("mousedown", function (e) {
        e.preventDefault();
        e.stopPropagation();
        startResize(pos.cursor, e);
      });
      document.body.appendChild(h);
      handles.push(h);
    });
  }

  function removeHandles() {
    handles.forEach(function (h) {
      if (h.parentNode) h.parentNode.removeChild(h);
    });
    handles = [];
  }

  // ─── Resize Logic ──────────────────────────────────────────────────────────

  function startResize(cursor, e) {
    if (!selectedEl) return;
    var rect = selectedEl.getBoundingClientRect();
    resizeState = {
      handle: cursor,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
      origWidth: selectedEl.style.width,
      origHeight: selectedEl.style.height,
    };
  }

  function onResizeMove(e) {
    if (!resizeState || !selectedEl) return;
    var dx = e.clientX - resizeState.startX;
    var dy = e.clientY - resizeState.startY;
    var newW = resizeState.startW;
    var newH = resizeState.startH;
    var h = resizeState.handle;

    if (h.includes("e")) newW = resizeState.startW + dx;
    if (h.includes("w")) newW = resizeState.startW - dx;
    if (h.includes("s")) newH = resizeState.startH + dy;
    if (h.includes("n")) newH = resizeState.startH - dy;

    newW = Math.max(20, newW);
    newH = Math.max(20, newH);

    // Apply live size preview on the element itself
    selectedEl.style.width = Math.round(newW) + "px";
    selectedEl.style.height = Math.round(newH) + "px";

    removeHandles();
    selectedEl.style.outline = "2px solid #6366f1";
    createHandles(selectedEl);
    resizeState._currentW = newW;
    resizeState._currentH = newH;
  }

  function endResize() {
    if (!resizeState || !selectedEl) {
      resizeState = null;
      return;
    }
    var newW = resizeState._currentW || resizeState.startW;
    var newH = resizeState._currentH || resizeState.startH;
    if (newW !== resizeState.startW || newH !== resizeState.startH) {
      // Keep the preview inline styles so the user sees the new size
      // They'll be cleared when "Apply" sends changes to the AI
      send({
        type: "editor:resized",
        xpath: getXPath(selectedEl),
        newWidth: Math.round(newW) + "px",
        newHeight: Math.round(newH) + "px",
        oldWidth: Math.round(resizeState.startW) + "px",
        oldHeight: Math.round(resizeState.startH) + "px",
      });
    } else {
      // No change — restore original size
      selectedEl.style.width = "";
      selectedEl.style.height = "";
    }
    resizeState = null;
    if (selectedEl) createHandles(selectedEl);
  }

  // ─── Drag Logic ─────────────────────────────────────────────────────────────

  function startDrag(e) {
    if (!selectedEl || resizeState) return;
    var rect = selectedEl.getBoundingClientRect();
    ghostEl = document.createElement("div");
    ghostEl.dataset.editorOverlay = "true";
    ghostEl.style.cssText =
      "position:fixed;z-index:2147483646;border:2px dashed #6366f1;background:rgba(99,102,241,0.08);pointer-events:none;border-radius:4px;";
    ghostEl.style.left = rect.left + "px";
    ghostEl.style.top = rect.top + "px";
    ghostEl.style.width = rect.width + "px";
    ghostEl.style.height = rect.height + "px";
    document.body.appendChild(ghostEl);

    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
    };
  }

  function onDragMove(e) {
    if (!dragState || !ghostEl) return;
    requestAnimationFrame(function () {
      if (!dragState || !ghostEl) return;
      var dx = e.clientX - dragState.startX;
      var dy = e.clientY - dragState.startY;
      ghostEl.style.left = (dragState.originX + dx) + "px";
      ghostEl.style.top = (dragState.originY + dy) + "px";
    });
  }

  function endDrag(e) {
    if (!dragState || !selectedEl) {
      dragState = null;
      if (ghostEl && ghostEl.parentNode) ghostEl.parentNode.removeChild(ghostEl);
      ghostEl = null;
      return;
    }
    var dx = e.clientX - dragState.startX;
    var dy = e.clientY - dragState.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      var rect = selectedEl.getBoundingClientRect();
      send({
        type: "editor:moved",
        xpath: getXPath(selectedEl),
        deltaX: Math.round(dx),
        deltaY: Math.round(dy),
        newRect: {
          x: Math.round(rect.x + dx),
          y: Math.round(rect.y + dy),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      });
    }
    if (ghostEl && ghostEl.parentNode) ghostEl.parentNode.removeChild(ghostEl);
    ghostEl = null;
    dragState = null;
  }

  // ─── Event Handlers ─────────────────────────────────────────────────────────

  function onMouseMove(e) {
    if (resizeState) { onResizeMove(e); return; }
    if (dragState) { onDragMove(e); return; }
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && !shouldIgnore(el)) {
      setHoverHighlight(el);
    } else {
      setHoverHighlight(null);
    }
  }

  function onClick(e) {
    if (resizeState || dragState) return;
    e.preventDefault();
    e.stopPropagation();
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && !shouldIgnore(el)) {
      setSelectionHighlight(el);
      send({ type: "editor:selected", data: getElementData(el) });
    } else {
      setSelectionHighlight(null);
      send({ type: "editor:deselected" });
    }
  }

  function onMouseDown(e) {
    if (resizeState) return;
    if (selectedEl && e.target === selectedEl) {
      e.preventDefault();
      startDrag(e);
    }
  }

  function onMouseUp(e) {
    if (resizeState) { endResize(); return; }
    if (dragState) { endDrag(e); }
  }

  // ─── Activate / Deactivate ─────────────────────────────────────────────────

  function activate() {
    if (active) return;
    active = true;
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mousedown", onMouseDown, true);
    document.addEventListener("mouseup", onMouseUp, true);
    document.body.style.cursor = "crosshair";
  }

  function deactivate() {
    if (!active) return;
    active = false;
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("mousedown", onMouseDown, true);
    document.removeEventListener("mouseup", onMouseUp, true);
    setHoverHighlight(null);
    setSelectionHighlight(null);
    removeHandles();
    if (ghostEl && ghostEl.parentNode) ghostEl.parentNode.removeChild(ghostEl);
    ghostEl = null;
    dragState = null;
    resizeState = null;
    clearAllPreviewStyles();
    document.body.style.cursor = "";
  }

  // ─── Preview Styles ─────────────────────────────────────────────────────────

  function applyPreviewStyle(xpath, property, value) {
    var el = resolveXPath(xpath);
    if (!el) return;
    if (!previewStyles.has(xpath)) {
      previewStyles.set(xpath, new Map());
    }
    var elStyles = previewStyles.get(xpath);
    if (!elStyles.has(property)) {
      elStyles.set(property, el.style[property]);
    }
    el.style[property] = value;
  }

  function clearAllPreviewStyles() {
    previewStyles.forEach(function (props, xpath) {
      var el = resolveXPath(xpath);
      if (!el) return;
      props.forEach(function (original, property) {
        el.style[property] = original;
      });
    });
    previewStyles.clear();
  }

  // ─── Message Handler ────────────────────────────────────────────────────────

  function onMessage(e) {
    var msg = e.data;
    if (!msg || typeof msg.type !== "string") return;
    switch (msg.type) {
      case "editor:enable":
        activate();
        break;
      case "editor:disable":
        deactivate();
        break;
      case "editor:preview-style":
        if (active && msg.xpath && msg.property && msg.value !== undefined) {
          applyPreviewStyle(msg.xpath, msg.property, msg.value);
        }
        break;
      case "editor:clear-preview":
        clearAllPreviewStyles();
        break;
    }
  }

  // ─── Init ───────────────────────────────────────────────────────────────────

  window.addEventListener("message", onMessage);
  send({ type: "editor:ready" });
})();
