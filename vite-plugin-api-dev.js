/**
 * Runs the Vercel-style `api/*.js` handlers on the Vite dev server so
 * `npm run dev` behaves like production — same handler, same quota, same
 * streaming — instead of needing `vercel dev`.
 *
 * Dev only: `vite build` never touches this. On Vercel the files in api/ are
 * deployed as real functions and this plugin is irrelevant.
 */

import { statSync } from 'node:fs';
import { loadEnv } from 'vite';

const ROUTES = { '/api/chat': '/api/chat.js' };

/**
 * Vite only exposes VITE_* to the app, so server-side secrets like
 * GEMINI_API_KEY have to be pushed into the handler's process.env by hand.
 *
 * Re-read whenever .env changes on disk: loading once at startup means editing
 * a key leaves the running server holding the stale one, and the only symptom
 * is a confusing 502 from a file that already looks correct.
 */
let envLoadedAt = 0;
let resolvedMode = 'development';

function syncEnv(mode, root) {
  let mtime = 0;
  try {
    mtime = statSync(`${root}/.env`).mtimeMs;
  } catch {
    // No .env — nothing to sync.
  }
  if (mtime === envLoadedAt) return;
  envLoadedAt = mtime;

  for (const [key, value] of Object.entries(loadEnv(mode, root, ''))) {
    if (!key.startsWith('VITE_')) process.env[key] = value;
  }
}

export function apiDev() {
  return {
    name: 'api-dev',
    apply: 'serve',

    config(_, { mode }) {
      resolvedMode = mode;
      syncEnv(mode, process.cwd());
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.originalUrl || req.url || '').split('?')[0];
        const entry = ROUTES[path];
        if (!entry) return next();

        syncEnv(resolvedMode, server.config.root);

        try {
          const mod = await server.ssrLoadModule(entry);
          const handler = mod.default;

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(',') : value);
          }

          let body;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            body = Buffer.concat(chunks);
          }

          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers,
            body,
            duplex: 'half',
          });

          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));

          if (response.body) {
            const reader = response.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(Buffer.from(value));
            }
          }
          res.end();
        } catch (err) {
          server.config.logger.error(`[api-dev] ${path} failed: ${err?.stack || err}`);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'dev_handler_failed', message: String(err?.message || err) }));
        }
      });
    },
  };
}
