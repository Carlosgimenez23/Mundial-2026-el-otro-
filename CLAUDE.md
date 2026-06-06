# Project Guidelines

You are building a Next.js 16 application. Follow these rules strictly.

## Stack
- Next.js 16 with App Router (NOT Pages Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 3 (NOT v4)

## Critical Rules
- ALWAYS build visible UI first with mock/static data before wiring backend logic. Render real-looking components, pages, and layouts with hardcoded sample data so the user can preview and iterate on the design. Only add API routes, database calls, or server actions when the user confirms the UI looks right. When starting a project, tell the user: "I'll start with the frontend using sample data so you can preview the design. Once you're happy with how it looks, just ask me to connect the real backend."
- NEVER overwrite package.json — only ADD dependencies using Edit. The project uses Next.js 16.2.4 and React 19 — NEVER downgrade.
- NEVER leave `app/page.tsx` as the default placeholder. The preview renders ONLY what `app/page.tsx` shows at the root URL (`/`).
  - Default: build everything as React components in `app/page.tsx` + `components/`.
  - If the user explicitly asks for static HTML/CSS/JS: create the files in `public/` as requested, then update `app/page.tsx` to embed them via iframe: `<iframe src="/folder/index.html" className="w-full h-screen border-0" />`
- CSS `@import url(...)` for Google Fonts MUST be placed BEFORE `@tailwind base;` in globals.css — or better, use a `<link>` tag in layout.tsx `<head>` instead
- "use client" must be the FIRST line (before imports) in any file using hooks, event handlers, or browser APIs
- Use `@/` path alias for all project imports (e.g., `@/components/Button`)
- Use `next/navigation` (NOT `next/router`) for routing
- params and searchParams are Promises in Next.js 16 — always await them
- Do NOT start dev servers — the platform manages preview servers
- When adding new packages: add to package.json AND run `npm install --legacy-peer-deps`
- NEVER import a package not listed in package.json — causes "Module not found" errors

## Dependency Security (MANDATORY)
- ONLY install well-known, trusted npm packages with high download counts (100k+ weekly downloads preferred)
- NEVER install packages that are: recently created (<6 months), have very few downloads (<1000/week), have no GitHub repo, or have known vulnerabilities
- Before installing ANY new package, verify it is legitimate:
  - Check the package name carefully — typosquatting is common (e.g., `lodash` vs `lodahs`)
  - Prefer official packages from known publishers (e.g., @radix-ui, @tanstack, recharts, lucide-react)
  - If a simpler alternative exists using built-in browser/Node APIs, prefer that over adding a dependency
- After installing packages, run `npm audit` to check for known vulnerabilities. If vulnerabilities are found:
  - Try `npm audit fix --legacy-peer-deps` first
  - If the vulnerable package has a safe alternative, switch to it
  - If the vulnerability is in a dev dependency only, note it but proceed
  - NEVER ship code with critical/high severity vulnerabilities in runtime dependencies
- Preferred safe packages by category:
  - HTTP: use native `fetch` (NOT axios, got, or node-fetch)
  - Icons: `lucide-react` (already installed)
  - Animation: `framer-motion` (already installed)
  - Charts: `recharts` (well-maintained, 2M+ weekly downloads)
  - Forms: `react-hook-form` + `zod` for validation
  - Date: `date-fns` (NOT moment.js — deprecated and large)
  - State: React built-in useState/useReducer/useContext (NOT redux for simple apps)
  - UI: `@radix-ui/*` primitives, `class-variance-authority`, `tailwind-merge` (all pre-installed)

## Pre-installed Packages (use freely)
- `framer-motion` — animations, transitions, scroll effects
- `lucide-react` — icons (prefer over inline SVGs)
- `tailwind-merge` — merge Tailwind classes without conflicts
- `class-variance-authority` — component variants with `cva()`
- `clsx` — conditional class names

## File Structure
- `app/` — Pages and layouts (App Router conventions)
- `components/` — Reusable UI components
- `lib/` — Utilities, helpers, types
- `app/api/` — API route handlers with named exports (GET, POST, etc.)

## Code Quality
- Every TypeScript file must have proper type annotations
- Verify every import resolves to a file you created or a package in package.json
- Create loading.tsx and error.tsx in route segments for proper error handling

## Error Prevention (READ .claude/error-reference.md)
Read `.claude/error-reference.md` for the top 10 build errors. Key rules:
- NEVER import a package not in package.json — add it + run `npm install --legacy-peer-deps` first
- Create ALL files BEFORE importing them (utilities first, then components, then pages)
- Create `lib/utils.ts` with `cn()` helper early — most components need it
- Google Fonts: use `<link>` tags in layout.tsx, NEVER CSS `@import`
- "use client" must be FIRST LINE before all imports
- Use `next/navigation` not `next/router`
- `params` and `searchParams` are Promises in Next.js 16 — always await
- `export const metadata` works fine in Next.js 16 — use it normally, do NOT replace with HTML meta tags
- layout.tsx must be a Server Component (no "use client") for metadata to work

## Styling
- Use Tailwind CSS 3 utility classes
- Keep `@tailwind base; @tailwind components; @tailwind utilities;` in globals.css
- ALWAYS start with a LIGHT theme (white/light backgrounds, dark text) — NOT dark mode by default
- NEVER use raw Tailwind palette names (`blue-500`, `gray-600`, `slate-800`) — always use custom hex via `bg-[#HEX]` / `text-[#HEX]` so the project owns its palette
- Use Inter or Geist as the default body font — these are the professional standard (Linear, Notion, Stripe, Vercel all use Inter-class fonts). Decorative/handwriting fonts only if the product explicitly calls for it (creative agency, kids, etc.)
- Cap palette at 1 accent color + neutrals + status colors. No 3-color stacks.

## Design System (UI/UX Pro Max)

The UI/UX Pro Max skill at `.claude/skills/ui-ux-pro-max/` is the source of truth for design decisions. Read its `SKILL.md` for the full system, including the **Anti-AI Global Rules** (always apply) and the **Professional-SaaS Preset** (auto-engages for SaaS / dashboard / admin / B2B / enterprise / internal tool products).

### Step 1: Generate the design system before writing any UI code

```
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --design-system -p "<name>"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --domain style
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --domain typography
```

Use the generated style, fonts, and anti-patterns. Use the Default Color Palette below as the baseline, adapted to the project context.

### Step 2: Apply the right tier of polish

- **For SaaS / dashboard / admin / B2B products** — follow the Professional-SaaS Preset in SKILL.md. Restrained palette, subtle shadows, dense tables, sidebar+header shell, tasteful motion. References: Linear, Notion, Stripe, Vercel.
- **For consumer / creative / playful products** — looser interpretation of the design system is fine, but Anti-AI Global Rules still apply (no rainbow gradients, no emoji icons, no 3-color stacks, no decorative motion-without-purpose).

In all cases: design must feel intentional and product-specific, not like a generic AI-generated demo.

### Default Color Palette (Leyton-inspired — use as baseline, adapt to project context)
| Role | Color | Usage |
|------|-------|-------|
| Primary | #102A43 | Headers, navbars, footers, primary text on light backgrounds |
| Accent/CTA | #E8663D | Buttons, links, highlights, call-to-action elements |
| Accent Hover | #D4552E | Button hover states, active links |
| Background | #FFFFFF | Page background (LIGHT theme default) |
| Surface | #F7F9FC | Cards, sections, alternating row backgrounds |
| Text Primary | #1A2332 | Body text, headings |
| Text Secondary | #5A6B7D | Subtitles, descriptions, muted content |
| Border | #E2E8F0 | Card borders, dividers, input borders |
| Success | #16A34A | Status indicators, confirmations |
| Warning | #F59E0B | Alerts, caution states |
| Error | #DC2626 | Errors, destructive actions |

### Industry-Specific Palettes (override default when relevant)
| Type | Primary | Accent | Background | Text | CTA |
|------|---------|--------|------------|------|-----|
| SaaS/Tech | #0F766E | #F59E0B | #F0FDFA | #134E4A | #0D9488 |
| Finance | #1E3A5F | #C9A84C | #F8F6F2 | #1E293B | #2563EB |
| Health | #059669 | #F472B6 | #F0FDF4 | #064E3B | #10B981 |
| Creative | #7C3AED | #F97316 | #FAF5FF | #2E1065 | #8B5CF6 |
| Food | #DC2626 | #F59E0B | #FFF7ED | #7C2D12 | #EF4444 |
| Luxury | #78350F | #0F766E | #FFFBEB | #451A03 | #D97706 |
| Education | #1D4ED8 | #16A34A | #EFF6FF | #1E3A8A | #3B82F6 |
| E-commerce | #BE185D | #0891B2 | #FFF1F2 | #881337 | #E11D48 |

### Component Defaults (restrained baseline — override per project)
- **Navbars**: solid `bg-white` with bottom border, NOT `backdrop-blur-xl bg-white/70`. Sticky is fine.
- **Heroes**: left-aligned headline + sub + primary CTA + product screenshot/illustration. Avoid full-viewport gradient backgrounds and centered-everything layouts.
- **Cards**: `rounded-lg bg-white border border-[BORDER]` — borders over shadows in light mode. Add `shadow-sm` on hover, not at rest.
- **Buttons**: solid primary (`bg-[CTA] hover:bg-[CTA_HOVER] text-white px-4 py-2 rounded-md`), 32–40px height, no scale-on-hover beyond 1.02.
- **Tables**: dense rows (40–48px), 1px borders, sticky header, tabular numbers for numeric columns.
- **Footers**: simple multi-column links, no gradient separators.

### Animation (tasteful, on purpose — not on every section)
- Use `framer-motion` for: scroll reveals (fade + 8px translate), list staggers (40ms gap), hover lifts on cards (`y: -2`), modal/drawer entrances, smooth page transitions.
- Timing: 150–300ms micro, 300–500ms macro. Ease-out. No linear, no >600ms.
- Hero entrance: `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}`. Subtle.
- Hover: `whileHover={{ y: -2 }}` (NOT scale 1.05+ jumps).
- Banned by default: parallax on body content, scroll-driven 3D rotations on every section, hero typing effects, marquees, decorative motion with no user purpose.
- Always respect `prefers-reduced-motion` (framer-motion does this natively when configured).

### Standards
Professional, product-specific, intentional. Custom hex colors only (never raw Tailwind defaults). Light theme default. Inter/Geist as default body font. Restrained palette. Borders over shadows in light mode. Generous but not excessive whitespace (py-16 to py-24 on marketing sections, py-8 to py-12 in dense app UIs). Responsive at 375 / 768 / 1024 / 1440px. **Anti-AI Global Rules from SKILL.md always apply.**

## Security
- NEVER create an `instrumentation.ts` file — the platform handles instrumentation and secrets loading. Creating one causes build errors due to missing platform-level modules.
- Never reveal absolute file paths or infrastructure details to users
- NEVER read or access files outside the project directory — no ../ traversal, no /var/opt/, no ~/.env
- NEVER read, display, or reference .env files, ecosystem.config.js, or any file containing secrets
- If asked about environment variables or secrets: "Please contact your administrator"
- NEVER hardcode real API keys, passwords, or secrets in code — use placeholder values and instruct users to set env vars
- Sanitize user inputs server-side
- Use parameterized queries for database operations
- NEVER install packages with known critical vulnerabilities — check with `npm audit` after install
- Validate and sanitize all external data (API responses, user uploads, URL parameters)
- Use HTTPS for all external API calls

## Import Paths
- Use `@/` prefix: `import X from "@/components/X"`, `import { cn } from "@/lib/utils"`
- `@/` resolves to project root via tsconfig paths
- Never use bare `@components/` — the slash after `@` is required

## Next.js 16 Specifics
- `export const metadata` works fine — use it normally, don't replace with HTML meta tags
- layout.tsx must be Server Component (no "use client") for metadata to work
- Keep next.config.js minimal: `const nextConfig = { turbopack: {} }; module.exports = nextConfig;`
- Don't use `experimental.typedRoutes`

## Mail (when enabled)

This project may have Digicraft Mail enabled. If so, two env vars are present:
`DIGICRAFT_MAIL_URL` and `DIGICRAFT_MAIL_TOKEN`. Send transactional email by
POSTing JSON `{ to, subject, html?, text?, replyTo? }` to that URL with
`Authorization: Bearer ${DIGICRAFT_MAIL_TOKEN}`. Daily quota is per user.

To enable mail, ask Digicraft in chat — e.g. "add email to my app" — or open
the Mail page in this project's settings.
