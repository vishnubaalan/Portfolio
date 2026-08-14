# SEO

Canonical domain: **https://vishnubaalan.vercel.app**

## What's in place

| Area | Where | Notes |
| --- | --- | --- |
| Title / description | `index.html` | Name + niche title (61 chars), 150-char description built on the target keywords |
| Positioning copy | `src/constants/index.js` | `TAGLINE`, `PITCH` and `OFFERINGS` — the wording the hero, contact section and meta tags all repeat |
| Canonical URL | `index.html` | Prevents duplicate indexing across Vercel preview/alias domains |
| Robots directives | `index.html` | `index, follow, max-image-preview:large, max-snippet:-1` |
| Open Graph | `index.html` | Absolute `og:image` with width/height/alt — required by LinkedIn, Slack, WhatsApp |
| Twitter card | `index.html` | `summary_large_image` |
| Structured data | `index.html` | JSON-LD `@graph`: `Person` + `WebSite` + `ProfilePage` |
| Crawl files | `public/robots.txt`, `public/sitemap.xml` | Sitemap declared in robots.txt |
| PWA metadata | `public/site.webmanifest` | 192/512 icons, brand theme colour |
| Social card | `public/og-image.png` | 1200×630, generated from the brand tokens |
| Icons | `public/apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | |
| Semantics | `src/sections/*` | One `<h1>`, `<h2>` per section, every `<section>` has `aria-labelledby` |
| Image weight | `public/profile-pic.png` | 1.4 MB → 356 KB (512×512); the original is in git history |
| No-JS fallback | `index.html` `<noscript>` | Mirrors real content for crawlers that don't execute JS |

## Positioning

The site targets one niche — **React + Spring Boot admin dashboards, internal business
tools, CRM systems, analytics dashboards and user management panels** — for startups and
small businesses. Search terms and client-facing copy are deliberately the same words.

Changing the niche means editing these together:

1. `src/constants/index.js` — `TAGLINE`, `PITCH`, `OFFERINGS`, `TYPING_WORDS` (drives the hero and contact section)
2. `index.html` — title, description, OG/Twitter tags, JSON-LD (`jobTitle`, `description`, `hasOccupation`, `makesOffer`, `knowsAbout`), and the `<noscript>` block
3. `src/sections/about/About.jsx` and `src/components/common/Footer.jsx` — the longer-form bio lines
4. `public/site.webmanifest` and `public/sitemap.xml` — name/description and the image title

## Changing the domain

The URL is hardcoded in three places — update all of them together:

1. `index.html` — canonical, `og:url`, `og:image`, `twitter:image`, and all `@id`/`url` fields in the JSON-LD
2. `public/robots.txt` — the `Sitemap:` line
3. `public/sitemap.xml` — `<loc>` and `<image:loc>`

Also update the `vishnubaalan.vercel.app` text baked into `public/og-image.png` (regenerate the card).

## After deploying

1. **Google Search Console** — add the property, verify (Vercel supports a DNS or HTML-tag method), submit `https://vishnubaalan.vercel.app/sitemap.xml`, then "Request indexing" on the homepage.
2. **Bing Webmaster Tools** — import the Search Console property; Bing renders JS less reliably, so the `<noscript>` block matters most here.
3. **Validate** — [Rich Results Test](https://search.google.com/test/rich-results) for the `Person` schema, [Schema Markup Validator](https://validator.schema.org/), and the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to prime the OG image cache.
4. **Update `<lastmod>`** in `public/sitemap.xml` whenever the content changes meaningfully.

## Known gaps

- **Client-rendered only.** Googlebot renders JS and will index the full page, but every other crawler sees `<div id="root">` plus the `<noscript>` block. If ranking on non-Google engines matters later, add build-time prerendering or move to a framework with SSG.
- **Single URL.** Everything is one scrolling page, so there's nothing to rank per-project. Giving projects their own routes would create more indexable surface — a larger structural change.
- **`AICore-*.js` is 912 KB** (247 KB gzipped). It's lazy-loaded, so it doesn't block first paint, but it competes for bandwidth on mobile and shows up in Core Web Vitals field data.
