"use client";
import { useState, useEffect } from "react";

export function DigiCraftBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("dc-banner-hidden") === "1") return;
    } catch {}
    setHidden(false);
  }, []);

  if (hidden) return null;

  return (
    <>
      <div style={{ height: 32 }} />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(17,24,39,0.92)",
          backdropFilter: "blur(8px)",
          color: "#d1d5db",
          fontSize: 12,
          fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
          zIndex: 2147483647,
          borderTop: "1px solid rgba(75,85,99,0.4)",
        }}
      >
        <span>
          Built with{" "}
          <a
            href="https://digicraft.leyton-cognitx.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#a78bfa", textDecoration: "underline" }}
          >
            Digicraft
          </a>
        </span>
        <button
          onClick={() => {
            setHidden(true);
            try {
              sessionStorage.setItem("dc-banner-hidden", "1");
            } catch {}
          }}
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            fontSize: 16,
            padding: "0 0 0 12px",
          }}
        >
          &times;
        </button>
      </div>
    </>
  );
}
