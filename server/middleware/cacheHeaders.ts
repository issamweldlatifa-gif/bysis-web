/**
 * Cache Headers Middleware — Optimise les performances avec des en-têtes de cache
 */
import { Request, Response, NextFunction } from 'express';

export function cacheHeaders(req: Request, res: Response, next: NextFunction) {
  // Images et assets statiques — 1 an
  if (/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot)$/i.test(req.path)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // CSS et JS — 1 mois
  else if (/\.(css|js)$/i.test(req.path)) {
    res.set('Cache-Control', 'public, max-age=2592000, immutable');
  }
  // HTML — 1 jour (pour les mises à jour)
  else if (/\.html$/i.test(req.path)) {
    res.set('Cache-Control', 'public, max-age=86400');
  }
  // API — pas de cache
  else if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  // Par défaut — 1 heure
  else {
    res.set('Cache-Control', 'public, max-age=3600');
  }

  next();
}

/**
 * Compression Middleware — Compresse les réponses
 */
export function compressionHeaders(req: Request, res: Response, next: NextFunction) {
  // Indiquer au client que nous supportons la compression
  res.set('Vary', 'Accept-Encoding');
  next();
}
