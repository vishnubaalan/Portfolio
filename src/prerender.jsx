/**
 * Build-time render entry. Used only by `vite-prerender-plugin` — never shipped
 * to the browser.
 *
 * The point is that the homepage's real text (hero, about, projects, FAQ,
 * experience, contact) lands in `dist/index.html` as static markup. Googlebot
 * renders JS and would have found it anyway; Bing, LinkedIn, Slack and the LLM
 * crawlers largely do not, and until now they saw an empty `#root`.
 *
 * Browser-only work is safe here because it all sits behind `useEffect` or a
 * `typeof window` guard — see `themeSlice` and `chatStorage`. Anything added
 * later that touches `window` during render has to be guarded the same way or
 * this build step will fail loudly, which is the intended behaviour.
 */
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App.jsx';

export async function prerender() {
  const html = renderToString(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  return { html };
}
