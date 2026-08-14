/**
 * Post-build step: render the homepage to static markup and inject it into
 * dist/index.html.
 *
 * Why this exists
 * ---------------
 * The site is a client-rendered SPA. Googlebot executes JS and sees everything,
 * but Bingbot does so unreliably and LinkedIn, Slack and the LLM crawlers not at
 * all — they all used to get an empty `<div id="root">` and the `<noscript>`
 * summary. This puts the real hero, about, projects, FAQ, experience and contact
 * copy into the HTML file itself.
 *
 * Why not `vite-prerender-plugin`
 * -------------------------------
 * Tried it first. Under Vite 8's rolldown backend its SSR bundle leaks into the
 * client graph as a `modulepreload`, so the browser downloads ~600 KB of
 * server-only code — strictly worse than not prerendering. Building the SSR
 * bundle to its own directory here keeps the two graphs completely separate.
 *
 * Note on hydration
 * -----------------
 * `main.jsx` deliberately still uses `createRoot`, not `hydrateRoot`. React
 * discards this markup and renders fresh on the client, which costs a little
 * work but makes hydration mismatches structurally impossible. The SEO benefit
 * is in the shipped HTML file and does not depend on hydration.
 */
import { build } from 'vite';
import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SSR_OUT = path.join(root, '.prerender-tmp');
const DIST_HTML = path.join(root, 'dist/index.html');
const MOUNT = '<div id="root"></div>';

/**
 * Framer Motion renders its `initial` state during SSR, which means most of the
 * page comes out as `opacity:0` with a translate. On the client that animates
 * away immediately — but for a visitor with JS disabled, or a crawler applying
 * hidden-content heuristics, an invisible page is worse than no page. Strip the
 * entrance-animation inline styles and let the markup stand on its own.
 */
function unhideEntranceAnimations(html) {
  return html.replace(/style="([^"]*)"/g, (whole, decls) => {
    const kept = decls
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .filter((d) => {
        const [prop, value] = d.split(':').map((s) => s.trim());
        if (prop === 'opacity' && parseFloat(value) === 0) return false;
        if (prop === 'filter' && value.startsWith('blur')) return false;
        if (prop === 'transform' && value.includes('translate')) return false;
        return true;
      });
    return kept.length ? `style="${kept.join(';')}"` : '';
  });
}

async function main() {
  await build({
    root,
    logLevel: 'warn',
    build: {
      ssr: path.join(root, 'src/prerender.jsx'),
      outDir: SSR_OUT,
      emptyOutDir: true,
      copyPublicDir: false,
      // The client build already emitted the real stylesheet; anything CSS-ish
      // produced here is a byproduct we throw away with the temp directory.
      cssCodeSplit: false,
      sourcemap: false,
    },
  });

  const entry = pathToFileURL(path.join(SSR_OUT, 'prerender.js')).href;
  const { prerender } = await import(entry);
  const { html } = await prerender();

  const template = await readFile(DIST_HTML, 'utf8');
  if (!template.includes(MOUNT)) {
    throw new Error(`Mount point ${MOUNT} not found in dist/index.html — did index.html change?`);
  }

  const rendered = unhideEntranceAnimations(html);
  await writeFile(DIST_HTML, template.replace(MOUNT, `<div id="root">${rendered}</div>`), 'utf8');
  await rm(SSR_OUT, { recursive: true, force: true });

  const kb = (Buffer.byteLength(rendered) / 1024).toFixed(0);
  console.log(`prerender: injected ${kb} kB of static markup into dist/index.html`);
}

main().then(
  // Vite keeps handles open after a programmatic build; exit explicitly so CI
  // and Vercel don't sit waiting on a finished build.
  () => process.exit(0),
  (err) => {
    console.error('prerender failed:', err);
    process.exit(1);
  },
);
