/**
 * usePrefetch — Amazon-style route prefetching on hover/touch
 *
 * Usage:
 *   const prefetch = usePrefetch();
 *   <Link href="/catalogue" onMouseEnter={() => prefetch('catalogue')}>Catalogue</Link>
 *
 * Preloads the lazy chunk before the user clicks, so navigation feels instant.
 */

// Map of route names to their lazy import functions
const PREFETCH_MAP: Record<string, () => Promise<unknown>> = {
  catalogue: () => import('@/pages/Catalogue'),
  arrivage: () => import('@/pages/Arrivage'),
  calculator: () => import('@/pages/Calculator'),
  order: () => import('@/pages/OrderForm'),
  history: () => import('@/pages/History'),
  orders: () => import('@/pages/Orders'),
  panier: () => import('@/pages/Panier'),
  track: () => import('@/pages/TrackOrder'),
  confirmation: () => import('@/pages/OrderConfirmation'),
  scanner: () => import('@/pages/Scanner'),
  admin: () => import('@/pages/AdminDashboard'),
  shipmaster: () => import('@/pages/ShipMasterDashboard'),
  parametres: () => import('@/pages/Parametres'),
  chat: () => import('@/pages/Chat'),
};

// Track already-prefetched routes to avoid duplicate fetches
const prefetched = new Set<string>();

export function prefetchRoute(route: string): void {
  if (prefetched.has(route)) return;
  const loader = PREFETCH_MAP[route];
  if (!loader) return;
  prefetched.add(route);
  // Fire-and-forget — we don't need the result
  loader().catch(() => {
    // Remove from set so it can be retried
    prefetched.delete(route);
  });
}

/**
 * Returns a prefetch function to call on hover/focus
 * Automatically deduplicates — safe to call multiple times
 */
export function usePrefetch() {
  return prefetchRoute;
}

/**
 * Prefetch multiple routes at once (e.g., on app mount for critical paths)
 */
export function prefetchCriticalRoutes(): void {
  // Prefetch the most commonly visited pages after home
  const critical = ['catalogue', 'arrivage', 'panier', 'calculator'];
  // Stagger prefetches to avoid network congestion
  critical.forEach((route, i) => {
    setTimeout(() => prefetchRoute(route), i * 300);
  });
}
