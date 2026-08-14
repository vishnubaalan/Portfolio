# Vishnu's Portfolio — Build Plan

**Version:** 1.2.0
**Status:** Draft — awaiting user inputs (see Open Items)
**Last updated:** 2026-07-18
**Owner:** Vishnu Baalan
**Author:** Claude Code

---

## Version history

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-07-18 | Initial plan. Locked: JavaScript + JSDoc, Redux Toolkit only, no Zustand, no TypeScript. |
| 1.1.0 | 2026-07-18 | Design tokens upgraded to 2026-premium spec: OKLCH color space, semantic layer (surface/border/text tiers), motion + radius + elevation scales, brand shifted off stock Tailwind defaults. |
| 1.2.0 | 2026-07-18 | Added light/dark theme system: dual token mappings, FOUC-free bootstrap, Redux `themeSlice` wiring, system-preference detection with localStorage persistence, per-mode brand tuning, mode-aware 3D scene. |

---

## Decisions locked in

| Question | Decision |
|----------|----------|
| Language | JavaScript with JSDoc type annotations (no TypeScript) |
| State management | Redux Toolkit only (no Zustand) |
| Scope of this document | Plan only — no code written until approved |

---

## Revised tech stack

| Layer | Choice | Version target | Notes |
|-------|--------|----------------|-------|
| Framework | React | ^19.2.0 | Already scaffolded |
| Bundler | Vite | ^8.1.0 | Already scaffolded |
| Language | JavaScript + JSDoc | ES2024 | `.jsx` files, JSDoc `@typedef` in `types/` |
| Styling | TailwindCSS | ^3.4.0 | With `@tailwindcss/typography` plugin |
| Component library | shadcn/ui (JS variant) | latest | Copy-paste, not npm; JS/JSX only |
| Animation (component) | Framer Motion | ^11.0.0 | Fade, slide, scale, blur-reveal, magnetic |
| Animation (timeline) | GSAP + ScrollTrigger | ^3.12.0 | Scroll-driven timeline in About section |
| Smooth scroll | Lenis | ^1.1.0 | Wrap app root |
| 3D | React Three Fiber | ^8.16.0 | Hero right-side scene |
| 3D helpers | Drei | ^9.100.0 | Environment, orbit, particles |
| State | Redux Toolkit | ^2.2.0 | Slices per feature |
| Forms | React Hook Form | ^7.51.0 | Contact form |
| Validation | Zod | ^3.23.0 | Schema for contact form |
| Email | EmailJS | ^4.3.0 | Client-side send |
| Icons | Lucide React | ^0.400.0 | Consistent icon set |
| Fonts | @fontsource/geist + @fontsource/inter | ^5.0.0 | Self-hosted for perf |

**Removed from original prompt:** TypeScript, Zustand.

---

## Design tokens

Defined in `OKLCH` for perceptual uniformity and wider gamut on modern displays. Raw color primitives sit underneath a **semantic layer** so components reference intent (`--surface`, `--text-muted`) rather than raw hues — palette can be re-themed without touching component code.

### Why not the original hex palette?

The original `#6366F1` / `#38BDF8` / `#F8FAFC` set is stock Tailwind (`indigo-500` / `sky-400` / `slate-50`). Every "we launched an AI product" landing page currently uses this exact combo — reads safe, not distinctive. Pure `slate-50` on a near-black background also runs ~19:1 contrast, which is higher than needed and causes eye strain over long sessions. The v1.1 tokens shift brand hues off the Tailwind defaults, warm the text down to an off-white, and add the semantic + motion + elevation scales that premium 2026 sites (Vercel, Linear, Framer) actually ship with.

### Color — dark theme (default)

```css
[data-theme="dark"] {
  /* Surfaces */
  --bg              oklch(0.13 0.02 265);       /* near-black, subtle indigo tint */
  --surface         oklch(0.17 0.02 265);       /* cards */
  --surface-2       oklch(0.21 0.02 265);       /* elevated: modals, tooltips, popovers */
  --border          oklch(0.28 0.02 265 / 0.6);
  --border-strong   oklch(0.40 0.02 265 / 0.8);

  /* Text */
  --text            oklch(0.96 0.005 265);      /* body — off-white, not pure */
  --text-muted      oklch(0.72 0.02 265);       /* secondary */
  --text-subtle     oklch(0.52 0.02 265);       /* captions, timestamps */
  --text-inverse    oklch(0.15 0.02 265);       /* on primary/accent buttons */

  /* Brand */
  --primary         oklch(0.65 0.22 275);       /* violet-indigo */
  --primary-hover   oklch(0.70 0.22 275);
  --accent          oklch(0.78 0.16 220);       /* softer sky */
  --primary-glow    oklch(0.65 0.22 275 / 0.35);

  /* State */
  --success         oklch(0.72 0.17 155);
  --warning         oklch(0.78 0.16 75);
  --danger          oklch(0.65 0.24 25);
  --info            oklch(0.78 0.16 220);

  /* Effects */
  --scrim           oklch(0.05 0.02 265 / 0.65); /* modal backdrop */
  --focus-ring      oklch(0.78 0.16 220 / 0.5);
}
```

### Color — light theme

```css
[data-theme="light"] {
  /* Surfaces — warm off-white base, NOT pure white (#FFFFFF is too harsh) */
  --bg              oklch(0.985 0.003 265);     /* near-white, cool tint */
  --surface         oklch(0.97 0.004 265);      /* cards sit slightly recessed */
  --surface-2       oklch(0.94 0.005 265);      /* elevated */
  --border          oklch(0.86 0.008 265 / 0.9);
  --border-strong   oklch(0.72 0.010 265 / 0.9);

  /* Text — near-black, NOT #000 (pure black on off-white is over-contrast) */
  --text            oklch(0.20 0.02 265);       /* body */
  --text-muted      oklch(0.44 0.02 265);       /* secondary */
  --text-subtle     oklch(0.60 0.02 265);       /* captions */
  --text-inverse    oklch(0.98 0.003 265);      /* on primary/accent buttons */

  /* Brand — darkened ~10% lightness for contrast on light bg */
  --primary         oklch(0.55 0.22 275);       /* violet-indigo, deeper */
  --primary-hover   oklch(0.50 0.22 275);
  --accent          oklch(0.60 0.16 220);       /* deeper sky */
  --primary-glow    oklch(0.55 0.22 275 / 0.22);

  /* State — slightly darker than dark-mode counterparts for AA contrast */
  --success         oklch(0.55 0.17 155);
  --warning         oklch(0.62 0.16 75);
  --danger          oklch(0.55 0.24 25);
  --info            oklch(0.60 0.16 220);

  /* Effects */
  --scrim           oklch(0.20 0.02 265 / 0.35);
  --focus-ring      oklch(0.55 0.22 275 / 0.4);
}
```

### Contrast guarantees (WCAG AA)

| Pair | Dark | Light |
|------|------|-------|
| `--text` on `--bg` | ~15:1 | ~13:1 |
| `--text-muted` on `--bg` | ~7.5:1 | ~6:1 |
| `--text-inverse` on `--primary` | ~7:1 | ~7:1 |
| `--accent` on `--bg` (links) | ~7:1 | ~5:1 |

All body text ≥ 7:1 (AAA), all interactive elements ≥ 4.5:1 (AA).

### Motion

```css
--ease-out-quart  cubic-bezier(0.25, 1, 0.5, 1)
--ease-spring     cubic-bezier(0.34, 1.56, 0.64, 1)
--dur-fast        150ms
--dur-base        250ms
--dur-slow        400ms
--dur-slower      700ms
```

### Radius (Linear-style tighter scale)

```css
--r-sm   6px
--r      10px
--r-lg   14px
--r-xl   20px
--r-2xl  28px
```

### Elevation (colored shadows, per-mode)

```css
[data-theme="dark"] {
  --shadow-glow-primary  0 0 40px -8px oklch(0.65 0.22 275 / 0.4);
  --shadow-glow-accent   0 0 40px -8px oklch(0.78 0.16 220 / 0.35);
  --shadow-card          0 1px 0 0 oklch(1 0 0 / 0.05) inset,
                         0 8px 24px -12px oklch(0 0 0 / 0.6);
  --shadow-elevated      0 1px 0 0 oklch(1 0 0 / 0.06) inset,
                         0 20px 48px -16px oklch(0 0 0 / 0.7);
}

[data-theme="light"] {
  --shadow-glow-primary  0 0 32px -8px oklch(0.55 0.22 275 / 0.25);
  --shadow-glow-accent   0 0 32px -8px oklch(0.60 0.16 220 / 0.20);
  --shadow-card          0 1px 2px 0 oklch(0.20 0.02 265 / 0.06),
                         0 8px 24px -12px oklch(0.20 0.02 265 / 0.12);
  --shadow-elevated      0 4px 6px -2px oklch(0.20 0.02 265 / 0.08),
                         0 20px 48px -16px oklch(0.20 0.02 265 / 0.18);
}
```

Light-mode shadows use a dark blue tint rather than pure black — pure-black shadows on light backgrounds look muddy and dated.

### Glass morphism

```css
--glass-blur      20px
--glass-saturate  180%
```

### Typography

```
Font Primary      Geist
Font Fallback     Inter, system-ui, sans-serif
Font Mono         Geist Mono, JetBrains Mono, monospace   /* Terminal section, code chips */
```

### Backward-compat hex reference

Kept only so external assets (favicons, OG image, `<meta name="theme-color">`) that need hex have a source of truth. Do NOT use in CSS — use the tokens above.

| Token | Dark (hex) | Light (hex) |
|-------|-----------|-------------|
| `--bg` | `#0A0D1C` | `#F8F9FC` |
| `--surface` | `#12162A` | `#F0F2F7` |
| `--primary` | `#7C6BF5` | `#5B47D9` |
| `--accent` | `#5FB8ED` | `#3F92C7` |
| `--text` | `#EDEEF2` | `#252A38` |
| `--text-muted` | `#9CA3B8` | `#5C6478` |

`<meta name="theme-color">` needs two entries so mobile browser chrome matches the active mode:

```html
<meta name="theme-color" content="#0A0D1C" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#F8F9FC" media="(prefers-color-scheme: light)" />
```

---

## Theming system (light / dark)

Dark is the default and the "showcase" mode. Light exists because ~30% of users have OS-level light preference and some workplaces (banks, hospitals, older monitors) render dark themes poorly. A single tap must switch modes with no flash, no layout shift, and no wrong-colored 3D scene.

### Switching mechanism

- Active theme lives on `<html data-theme="dark|light">`
- All tokens are scoped to `[data-theme="..."]` — swap the attribute, all colors update via CSS custom-property cascade
- **No `.dark` class + Tailwind `dark:` variants** — that pattern doubles class output and doesn't scale to future themes (system, high-contrast, sepia). Attribute-based scales cleanly.

### First-paint algorithm (FOUC-free)

Inline script in `index.html` **before** the React bundle loads. Blocks paint for ~1ms, prevents the white-flash-then-dark-flip that plagues most portfolios.

```html
<!-- index.html, in <head> BEFORE any stylesheet or script -->
<script>
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      var system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      var theme = stored === 'light' || stored === 'dark' ? stored : system;
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme;
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
</script>
```

### Redux `themeSlice`

```js
/** @typedef {'dark' | 'light' | 'system'} ThemeMode */

// store/slices/themeSlice.js
const initial = {
  mode: /** @type {ThemeMode} */ (localStorage.getItem('theme') || 'system'),
  resolved: /** @type {'dark' | 'light'} */ (document.documentElement.dataset.theme),
};

// Actions: setMode(mode), toggleMode()
// Middleware / effect: on setMode, resolve 'system' → matchMedia, write DOM attribute,
// persist to localStorage, update <meta name="theme-color">.
```

Three states in the UI toggle (not just two): **Dark · Light · System**. Users who set "System" get automatic switching when their OS flips at sunset. Store both `mode` (user intent) and `resolved` (currently applied).

### System-preference sync

```js
// hooks/useSystemThemeSync.js
const mql = window.matchMedia('(prefers-color-scheme: light)');
mql.addEventListener('change', (e) => {
  if (store.getState().theme.mode === 'system') {
    dispatch(applyResolved(e.matches ? 'light' : 'dark'));
  }
});
```

### Cross-cutting concerns

| Concern | Handling |
|---------|----------|
| **Transition flash on toggle** | Add `<style>* { transition: background-color 200ms, border-color 200ms, color 200ms; }</style>` scoped to `[data-theme-transitioning="true"]`. Set the attribute for 250ms after switch, then remove. Prevents transitions on initial load. |
| **3D scene (hero AI Core)** | Read `useTheme()` in R3F. Dark: bloom + violet emissive. Light: reduce bloom to 0.3, swap emissive to accent, tone-map exposure down. Otherwise the sphere becomes an invisible white blob on light bg. |
| **Images / illustrations** | Serve mode-specific variants via `<picture>` with `media="(prefers-color-scheme: ...)"`. Screenshots of projects need a light-mode capture too. |
| **Syntax highlighting (Terminal section)** | Two themes: `github-dark` and `github-light` from Shiki. Swap the class on the `<pre>` block based on resolved theme. |
| **Custom cursor blend-mode** | Dark: `mix-blend-mode: difference` with white. Light: use `mix-blend-mode: multiply` with `--text` or drop blend-mode and use solid color. |
| **shadcn/ui components** | Already CSS-var driven — will pick up token changes automatically if we override its default vars with ours. |
| **Command palette shortcut** | Add `Cmd/Ctrl + Shift + L` to toggle theme, listed in the palette itself. |
| **Prefers-reduced-motion** | Disable the 250ms transition when set — flash is preferable to motion for these users. |
| **GitHub contribution graph** | Cell colors interpolate between `--surface-2` (0 contributions) and `--primary` (max) — automatically re-themes. |

### Toggle UI

Icon button in the nav bar. Three-state segmented control inside the command palette (`Dark | Light | System`) with the current choice highlighted. Framer `layoutId` animation on the selection indicator.

### Testing checklist

- [ ] Reload with `localStorage` empty on a light-mode OS → boots light, no flash
- [ ] Reload with `localStorage="dark"` on a light-mode OS → boots dark, no flash
- [ ] Switch OS preference while site is open in `system` mode → live-updates without reload
- [ ] Toggle mode mid-session → colors transition smoothly, 3D scene re-lights, `theme-color` meta updates (visible in mobile Safari address bar)
- [ ] Lighthouse Accessibility 100 in both modes
- [ ] All screenshots in Projects section have both dark + light variants

---

## Folder structure

```
src/
├── components/         # Reusable UI atoms/molecules
│   ├── ui/             # shadcn/ui primitives (Button, Card, Dialog, ...)
│   ├── magnetic/       # MagneticButton wrapper
│   ├── cursor/         # CustomCursor
│   └── palette/        # CommandPalette (⌘K)
├── sections/           # One folder per major section
│   ├── hero/
│   ├── about/
│   ├── skills/
│   ├── projects/
│   ├── ai-assistant/
│   ├── experience/
│   ├── github/
│   ├── learning/
│   ├── philosophy/
│   └── contact/
├── hooks/              # useMagnetic, useScrollProgress, useReducedMotion, redux hooks
├── utils/              # cn(), formatters, GitHub API client
├── animations/         # Framer variants + GSAP timeline builders
├── assets/             # Images, models, textures
├── constants/          # Route names, breakpoints, animation durations
├── data/               # projects.js, skills.js, timeline.js, links.js — SOURCE OF TRUTH
├── layouts/            # RootLayout with providers
├── pages/              # Home.jsx (single-page portfolio)
├── routes/             # React Router config (if multi-page)
├── styles/             # global.css, tailwind.css, theme variables
├── types/              # JSDoc @typedef declarations
├── store/              # Redux store + slices
│   ├── index.js
│   └── slices/
│       ├── themeSlice.js
│       ├── uiSlice.js
│       └── contactSlice.js
├── App.jsx
└── main.jsx

public/
├── resume.pdf          # Vishnu's latest resume (needs upload)
├── favicon.svg
├── og-image.png
└── models/             # GLB files if 3D laptop chosen
```

---

## Phase 0 — Foundation

Set up before any UI work.

1. Install all dependencies from the stack table above.
2. Configure Tailwind: extend theme with color palette, font families, custom keyframes for aurora/gradient.
3. Self-host Geist + Inter via `@fontsource`; preload woff2 in `index.html`.
4. Create the folder tree above; add empty `index.js` barrels.
5. Set up Redux store with three slices (`theme`, `ui`, `contact`); wire `<Provider>` in `main.jsx`.
6. Add JSDoc typedefs in `types/` for `Project`, `Skill`, `TimelineItem`, `SocialLink`, `LearningTopic`.
7. Populate `data/` with all copy from the original prompt so JSX stays clean.
8. Configure ESLint for JSDoc and React hooks.

**Exit criteria:** `npm run dev` boots to a blank page with dark background and correct font.

## Phase 1 — Global chrome

Elements visible on every scroll position.

- `RootLayout` — wraps app with Lenis provider, custom cursor, command palette, scroll progress bar
- Nav bar — fixed top, glass morphism, blurs on scroll, active-section indicator
- Custom cursor — dot + ring, magnetic pull near interactive elements, blend-mode difference on light surfaces
- Command palette (⌘K) — jump to section, toggle theme, download resume, open GitHub/LinkedIn/Email
- Scroll progress bar — top of viewport, gradient fill
- Back-to-top button — appears after 100vh scrolled
- Footer — attribution, tech stack chips, socials

**Exit criteria:** All chrome works across a placeholder scrollable page.

## Phase 2 — Hero section

The most important section. Budget the most polish time here.

- Staggered blur-reveal on entrance: "Hi 👋 I'm Vishnu"
- Typing cycle: React Developer → Frontend Engineer → AI Agent Builder → Problem Solver → Continuous Learner
- **Right side (pick ONE, do not build both):**
  - **Recommended:** Floating AI Core — R3F sphere with distortion shader, orbiting particle ring, subtle bloom. Lighter than a laptop model, thematically stronger for an AI engineer, easier to keep <200KB.
  - Alternative: 3D laptop with GLB model, screen showing a code loop. Heavier, more complex.
- Background layers (stacked, low opacity): gradient mesh + aurora + particles + mouse spotlight
- CTAs: `View Projects` (scroll to section), `Download Resume` (opens `/resume.pdf`), `Contact Me` (scroll to section)
- On mobile: 3D scene replaced by static gradient + subtle Framer float

**Exit criteria:** First 5 seconds feel premium. Lighthouse Performance ≥ 90 on mobile emulation.

## Phase 3 — Content sections

Build in this priority order so early sections stay shippable if you pause.

### 3.1 Featured Projects
Card grid, hover-tilt, filter chips (`All`, `Frontend`, `AI`), "Currently Building" badge on AI Assistant. Each card: preview image, features list, tech tags, live/repo links.

### 3.2 About + Timeline
Vertical timeline driven by GSAP ScrollTrigger. Milestones from your prompt: Started Learning → React → LMS → PPTX Editor → File Mgmt → Health Dashboard → Java Backend → Networking → Personal AI Assistant → Future Goal (AI Engineer).

### 3.3 Skills
Categorized: Frontend, State Management, Cloud, UI Libraries, Tools, Learning. Chips with hover glow and category color coding.

### 3.4 Personal AI Assistant (spotlight)
Full-width cinematic section, separate from projects grid. Vision paragraph, Future Features list, "Currently Building" badge. This is your flagship — make it feel like a product launch page.

### 3.5 Experience
Engineering capability cards (Frontend Dev, Modern UI, State Mgmt, Auth, Cloud, Perf, Responsive, A11y, Interactive Viz). Not employer history.

### 3.6 GitHub
Live pull via GitHub REST API. Contribution heatmap (SVG), pinned repos, top languages ring chart. Cache in `sessionStorage` for 1 hour to avoid rate limits. 4-state handling: loading skeleton, error fallback, empty (no repos yet), success.

### 3.7 Learning Journey
Progress bars for Java, Spring Boot, Networking, System Design, AI Engineering, GOAP, LLMs, Cloud.

### 3.8 Philosophy
Full-viewport quote, large type, subtle parallax on words.

### 3.9 Contact
React Hook Form + Zod schema (name, email, message). EmailJS submit. Animated send button with success/error states. 4-state handling.

## Phase 4 — Polish pass

- 4-states rule (loading, error, empty, success) audited across every async section
- `prefers-reduced-motion` respected on all Framer/GSAP animations
- Focus rings, ARIA labels, keyboard navigation for command palette
- Alt text on all images
- Responsive audit: mobile (<640), tablet (640–1024), desktop (>1024)
- Hero 3D downgrades to static on mobile

## Phase 5 — Performance & SEO

**Reality check:** Perfect 100/100/100/100 with R3F + GSAP + Lenis is very hard. Realistic targets:

| Metric | Target |
|--------|--------|
| Performance (mobile) | 90–95 |
| Performance (desktop) | 95–100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Techniques:
- Lazy-load hero 3D scene (`React.lazy` + Suspense fallback = gradient)
- Preload Geist woff2, defer EmailJS SDK until contact in viewport
- Convert all images to AVIF/WebP with `<picture>` fallback
- Route-split if multi-page
- Meta tags, Open Graph, `sitemap.xml`, `robots.txt`, structured data (`Person` schema)

---

## Open items (blockers before Phase 0 starts)

| # | Item | Why needed |
|---|------|-----------|
| 1 | Updated resume PDF | You asked for the Drive link to be updated. Provide new PDF to host at `/public/resume.pdf`, or new Drive URL. |
| 2 | GitHub username | GitHub section pulls live data. |
| 3 | EmailJS credentials | Service ID, template ID, public key. Otherwise stub with env vars. |
| 4 | LinkedIn URL + contact email | Footer + Contact section. |
| 5 | Hero right-side choice | AI Core (recommended) or 3D laptop? |
| 6 | Personal photo/avatar | Optional but strengthens About. |

---

## Milestones (rough sequencing, not calendar dates)

1. **M1 — Foundation ready** → Phase 0 complete
2. **M2 — Chrome shipped** → Phase 1 complete, blank scrollable page has cursor/nav/palette
3. **M3 — Hero live** → Phase 2 complete, first impression demo-able
4. **M4 — Content sections v1** → Phase 3.1–3.5 complete
5. **M5 — Live integrations** → Phase 3.6–3.9 complete (GitHub, contact form working)
6. **M6 — Polish & perf** → Phase 4–5 complete, Lighthouse targets hit
7. **M7 — Launch** → Deployed, resume linked, socials verified

---

## Non-goals for v1

Explicitly out of scope for the first release so we don't scope-creep:

- Blog / CMS integration
- Multi-language support
- User accounts or auth
- Analytics dashboard (basic Plausible/Umami snippet only)
- Server-side rendering (SPA is enough for a portfolio)

---

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Hitting Lighthouse 100 with 3D + GSAP | Lazy-load, mobile downgrades, honest target of 90–95 mobile |
| GitHub API rate limits | Cache in `sessionStorage`, fall back to static JSON |
| EmailJS quota / spam | Add honeypot field + rate-limit per session |
| 3D scene jank on low-end devices | Detect via `navigator.hardwareConcurrency`, swap for static gradient |
| Font FOUT | Preload woff2 + `font-display: swap` |
| Feature creep from "Extra Features" list | Ship v1 without command palette / terminal / AI chat bubble if timeline slips |
