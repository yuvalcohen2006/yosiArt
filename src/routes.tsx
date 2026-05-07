import type { RouteRecord } from 'vite-react-ssg';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Works from './pages/Works';
import Category from './pages/Category';
import PaintingPage from './pages/PaintingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import { sanityClient } from './sanity/client';
import {
  CATEGORIES_QUERY,
  PAINTING_BY_SLUG_QUERY,
} from './sanity/queries';
import type { Category as CategoryDoc, Painting } from './sanity/types';

/*
  Routes use vite-react-ssg's `RouteRecord` (a superset of react-router's
  `RouteObject`) so we can attach two extras:
    - `getStaticPaths` — tells the build which dynamic URLs to pre-render
    - `loader` — fetches data *at build time* so the rendered HTML
      already contains the right meta tags / title / OG image
*/

async function paintingSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(
    `*[_type == "painting" && defined(slug.current)].slug.current`,
  );
}

async function categorySlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(
    `*[_type == "category" && defined(slug.current)].slug.current`,
  );
}

export const routes: RouteRecord[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/works', element: <Works /> },
      {
        path: '/works/:category',
        element: <Category />,
        loader: async ({ params }) => {
          // Pull the full category list so the page can both render the
          // current category's title and feed the filter strip — single
          // round trip to Sanity instead of two.
          const categories =
            await sanityClient.fetch<CategoryDoc[]>(CATEGORIES_QUERY);
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
      { path: '*', element: <NotFound /> },
    ],
  },
];
