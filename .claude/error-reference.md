# Common Build Errors — Prevention Guide

These are real errors that have occurred repeatedly in Digicraft projects. Read this BEFORE writing code to avoid them.

## 1. Module not found: Can't resolve 'package-name'
**Frequency**: VERY HIGH
**Cause**: Importing a package that is not in package.json or not installed in node_modules.
**Common offenders**: `recharts`, `date-fns`, `tailwind-merge`, `@radix-ui/*`, `cmdk`, `sonner`, `react-hook-form`, `zod`
**Fix**:
- ALWAYS check package.json before importing any package
- If a package is needed, add it to package.json AND run `npm install --legacy-peer-deps`
- Pre-installed packages that are ALWAYS available: `framer-motion`, `lucide-react`, `tailwind-merge`, `class-variance-authority`, `clsx`
- If `tailwind-merge` is missing from an older project, add it: `npm install tailwind-merge --legacy-peer-deps`
- For charts, use CSS-based charts or add recharts to package.json + install BEFORE importing

## 2. Module not found: Can't resolve '@/components/...' or '@/lib/...'
**Frequency**: HIGH
**Cause**: Importing a component or utility file that hasn't been created yet.
**Fix**:
- Create ALL files before importing them
- Double-check every `@/` import path matches an actual file you've created
- Common mistake: importing `@/components/sections/about-section` but the file is at `@/components/AboutSection`
- Common mistake: importing `@/lib/types` or `@/lib/utils` without creating the file first

## 3. CSS @import must precede all rules
**Frequency**: MEDIUM
**Cause**: Placing `@import url('https://fonts.googleapis.com/...')` AFTER `@tailwind base;` in globals.css
**Fix**:
- NEVER use `@import` in globals.css
- ALWAYS use `<link>` tags in `app/layout.tsx` `<head>` for Google Fonts:
```tsx
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=FontName:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
```

## 4. Missing "use client" directive
**Frequency**: HIGH
**Cause**: Using hooks (useState, useEffect, useRef), event handlers (onClick, onChange), or browser APIs in a file without "use client" at the top.
**Fix**:
- Add `"use client";` as the VERY FIRST LINE of any file using hooks, events, or browser APIs
- It must come BEFORE all imports
- Server Components (default) CANNOT use hooks or event handlers

## 5. Importing from next/router instead of next/navigation
**Frequency**: MEDIUM
**Cause**: Using the Pages Router import path in an App Router project.
**Fix**:
- ALWAYS use `import { useRouter, usePathname, useSearchParams } from "next/navigation"`
- NEVER use `import { useRouter } from "next/router"`

## 6. params/searchParams not awaited in Next.js 16
**Frequency**: MEDIUM
**Cause**: In Next.js 16, `params` and `searchParams` are Promises that must be awaited.
**Fix**:
```tsx
// CORRECT
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}

// WRONG — will cause runtime error
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params; // Error: params is a Promise
}
```

## 7. cn() utility not found / tailwind-merge missing
**Frequency**: HIGH
**Cause**: Using `cn()` from `@/lib/utils` without creating the file or installing tailwind-merge.
**Fix**:
- Always create `lib/utils.ts` with:
```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```
- Ensure `tailwind-merge` and `clsx` are in package.json (they are pre-installed)
- If missing, run: `npm install tailwind-merge clsx --legacy-peer-deps`

## 8. Invalid import paths (wrong casing, wrong structure)
**Frequency**: MEDIUM
**Cause**: File system is case-sensitive on Linux. `@/components/heroSection` ≠ `@/components/HeroSection`
**Fix**:
- Use consistent PascalCase for component files: `HeroSection.tsx`, `PricingCard.tsx`
- Match the import path EXACTLY to the file name including casing
- Use kebab-case for directories if preferred, but be consistent

## 9. Using libraries that don't support React 19
**Frequency**: LOW-MEDIUM
**Cause**: Some older packages have peer dependency conflicts with React 19.
**Fix**:
- Always use `--legacy-peer-deps` flag when installing
- The `.npmrc` file in the project root already has `legacy-peer-deps=true`
- If a package truly doesn't work with React 19, find an alternative

## 10. Turbopack: Unable to watch directory
**Frequency**: LOW
**Cause**: System inotify watcher limit exhausted.
**Fix**: This is a platform issue, not a code issue. The platform handles it automatically.

## 11. Turbopack FATAL panic / crash
**Frequency**: LOW
**Cause**: Turbopack internal cache corruption (`.next/dev/cache/*.sst` files). NOT a code error.
**Symptoms**: "FATAL: An unexpected Turbopack error occurred", "panicked at", "Failed to lookup task id", "Unable to open static sorted file"
**Fix**: This is NOT a code error — do NOT try to fix it by changing source files. The platform auto-detects this and recovers by clearing the `.next` cache and restarting the preview. If you see this error in auto-fix context, respond with "This is a cache issue, not a code error. The preview will restart automatically."

## 12. Metadata "generate is not a function" / metadata not working
**Frequency**: HIGH
**Cause**: AI mistakenly thinks `export const metadata` doesn't work in Next.js 16 and tries to replace it with manual `<meta>` tags or `generateMetadata`, causing more errors.
**Reality**: `export const metadata` works perfectly fine in Next.js 16. It's the standard API.
**Fix**:
- USE `export const metadata: Metadata = { title: "...", description: "..." }` in layout.tsx and page.tsx
- Do NOT replace it with manual HTML `<meta>` tags
- Do NOT use `generateMetadata` unless you need dynamic values from params
- Metadata exports ONLY work in Server Components — if layout.tsx has "use client", REMOVE IT
- The layout.tsx file should NEVER have "use client" — it must be a Server Component
- If you get a metadata error during auto-fix, the fix is: ensure layout.tsx does NOT have "use client", NOT switching to HTML meta tags

## 13. Tailwind crash: @apply border-border / text-foreground / bg-background
**Frequency**: HIGH
**Cause**: AI uses shadcn/ui CSS variable conventions (`border-border`, `text-foreground`, `bg-background`) but the project does NOT have shadcn installed or its CSS variables defined.
**Symptoms**: Tailwind crashes during PostCSS processing. Preview server repeatedly restarts and fails.
**Fix**:
- NEVER use `@apply border-border`, `@apply text-foreground`, `@apply bg-background` unless shadcn/ui is installed
- Use actual hex colors instead: `@apply border-[#2a3041]`, `@apply text-[#e2e8f0]`, `@apply bg-[#0f1419]`
- Do NOT define CSS variables like `--background: 15 20 25` (HSL without hsl() wrapper) — use hex values directly
- If you need a base style in globals.css, use: `body { margin: 0; min-height: 100vh; }` and apply colors via Tailwind classes in components

## 14. "Another next build process is already running" (stale .next/lock)
**Frequency**: MEDIUM
**Cause**: A previous `next build` was killed / interrupted / crashed before it could clean up. The leftover `.next/lock` file makes the next build refuse to start.
**Symptoms**:
```
⨯ Another next build process is already running.
  This could be:
  - A next build still in progress
  - A previous build that didn't exit cleanly
  Suggestion: Wait for the build to complete.
```
**Fix**: Delete the stale lock and retry. One command:
```bash
rm -f .next/lock && npm run build
```
**Do NOT**:
- Theorize about Next.js internals (`generateBuildId`, config loader, nanoid, etc.) — this error is about a leftover file, not about Next.js config.
- Modify `next.config.js` to add a `generateBuildId` function — undefined `generateBuildId` is the normal default and is handled by Next.js.
- Reinstall `node_modules` — it's not a dependency issue.
**Prevention**: If you start a build and need to abort it, use Ctrl+C in the same terminal so Next.js cleans up its lock; if a previous session left a stale lock, just delete it.
