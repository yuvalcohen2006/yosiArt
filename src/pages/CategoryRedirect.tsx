import { Navigate, useParams } from 'react-router-dom';

/**
 * The old per-category page (`/works/:category`, a second gallery with its own
 * button-row filter) was removed — there is one catalogue now, `/works`, with a
 * sidebar filter. This keeps any lingering `/works/:category` URL (an old
 * bookmark or crawler hit) working by sending it to that catalogue with the
 * collection pre-selected, instead of 404-ing.
 */
export default function CategoryRedirect() {
  const { category } = useParams<{ category: string }>();
  return <Navigate to={`/works?category=${category ?? ''}`} replace />;
}
