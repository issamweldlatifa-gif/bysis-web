/**
 * Simple in-memory query cache for frequently accessed data
 * TTL: 5 minutes for most queries, 1 hour for settings
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

const cache = new Map<string, CacheEntry<any>>();

// Cache TTLs
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const SETTINGS_TTL = 60 * 60 * 1000; // 1 hour
const SHORT_TTL = 30 * 1000; // 30 seconds

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  // Invalidate keys matching pattern
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
    })),
  };
}

// Cache key builders
export const cacheKeys = {
  user: (openId: string) => `user:${openId}`,
  order: (id: number) => `order:${id}`,
  orders: (userId?: string) => `orders:${userId || 'all'}`,
  setting: (key: string) => `setting:${key}`,
  arrivage: () => `arrivage:items`,
  conversation: (sessionId: string) => `conversation:${sessionId}`,
};

export const cacheTTLs = {
  user: DEFAULT_TTL,
  order: DEFAULT_TTL,
  orders: SHORT_TTL,
  setting: SETTINGS_TTL,
  arrivage: DEFAULT_TTL,
  conversation: SHORT_TTL,
};
