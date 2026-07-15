import type { RouteRecord } from 'vite-react-ssg';
import Layout from './components/layout/Layout';
// Re-innovated landing page (deep-sea WebGL hero). The previous Home.tsx is
// kept in the repo, unused, until the new design is locked at deployment.
import HomeLanding from './pages/HomeLanding';
import Works from './pages/Works';
import Category from './pages/Category';
import PaintingPage from './pages/PaintingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import NavbarDemo from './pages/NavbarDemo';
import { sanityClient } from './sanity/client';
import {
  CATEGORIES_QUERY,
  HOME_MEDIA_QUERY,
  PAINTING_BY_SLUG_QUERY,
} from './sanity/queries';
import type {
  Category as CategoryDoc,
  HomeMedia,
  Painting,
} from './sanity/types';

/*
  Routes use vite-react-ssg's `RouteRecord` (a superset of react-router's
  `RouteObject`) so we can attach two extras:
    - `getStaticPaths` — tells the build which dynamic URLs to pre-render
    - `loader` — fetches data *at build time* so the rendered HTML
      already contains the right meta tags / title / OG image
*/

async function paintingSlugs(): Promise<string[]> {
  return (
    (await sanityClient.fetch<string[]>(
      `*[_type == "painting" && defined(slug.current)].slug.current`,
    )) ?? []
  );
}

async function categorySlugs(): Promise<string[]> {
  return (
    (await sanityClient.fetch<string[]>(
      `*[_type == "category" && defined(slug.current)].slug.current`,
    )) ?? []
  );
}

export const routes: RouteRecord[] = [
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomeLanding />,
        loader: async () => {
          // Pull the homeMedia singleton + the category list at build time.
          // homeMedia provides the hero carousel images and the OG share
          // image; the categories feed the focus-rail showcase between the
          // secondary photo and the footer. The showcase is progressive
          // enhancement, so a failed categories fetch degrades to an empty
          // list instead of failing the whole landing build.
          const [homeMedia, categories] = await Promise.all([
            sanityClient.fetch<HomeMedia | null>(HOME_MEDIA_QUERY),
            sanityClient
              .fetch<CategoryDoc[]>(CATEGORIES_QUERY)
              .catch(() => null),
          ]);
          return { homeMedia, categories: categories ?? [] };
        },
      },
      { path: '/works', element: <Works /> },
      {
        path: '/works/:category',
        element: <Category />,
        loader: async ({ params }) => {
          // Pull the full category list so the page can both render the
          // current category's title and feed the filter strip — single
          // round trip to Sanity instead of two.
          const categories =
            (await sanityClient.fetch<CategoryDoc[]>(CATEGORIES_QUERY)) ?? [];
          const current =
            categories.find((c) => c.slug === params.category) ?? null;
          return { categories, current };
        },
        getStaticPaths: async () => {
          const slugs = await categorySlugs();
          return slugs.map((slug) => `/works/${slug}`);
        },
      },
      {
        path: '/work/:slug',
        element: <PaintingPage />,
        loader: async ({ params }) => {
          if (!params.slug) return null;
          const painting = await sanityClient.fetch<Painting | null>(
            PAINTING_BY_SLUG_QUERY,
            { slug: params.slug },
          );
          return painting;
        },
        getStaticPaths: async () => {
          const slugs = await paintingSlugs();
          return slugs.map((slug) => `/work/${slug}`);
        },
      },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      // Israeli legal pages (Hebrew primary, English translation) — linked
      // from the footer and the accessibility widget. Route-level lazy so
      // their ~45KB of bilingual legal text ships as its own chunk instead
      // of weighing down the landing bundle.
      {
        path: '/terms',
        lazy: async () => ({
          Component: (await import('./pages/legal/Terms')).default,
        }),
      },
      {
        path: '/privacy',
        lazy: async () => ({
          Component: (await import('./pages/legal/Privacy')).default,
        }),
      },
      {
        path: '/accessibility',
        lazy: async () => ({
          Component: (await import('./pages/legal/AccessibilityStatement'))
            .default,
        }),
      },
      { path: '/navbar-demo', element: <NavbarDemo /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
