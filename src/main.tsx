import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './index.css';
import './i18n';

/**
 * Vite-React-SSG entry. At build time the lib walks the routes, pre-renders
 * each one to a real HTML file (so crawlers and link-preview bots see meta
 * tags without running JavaScript), and at runtime the same routes hydrate
 * exactly like a normal SPA. `<Head>` (from this lib) inside any page
 * component collects into the document head in both modes — the lib
 * mounts `HelmetProvider` for us.
 */
export const createRoot = ViteReactSSG({ routes });
