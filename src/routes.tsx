import type { RouteObject } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Works from './pages/Works';
import Category from './pages/Category';
import PaintingPage from './pages/PaintingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/works', element: <Works /> },
      { path: '/works/:category', element: <Category /> },
      { path: '/work/:slug', element: <PaintingPage /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
