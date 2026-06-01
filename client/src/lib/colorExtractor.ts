/**
 * colorExtractor.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracts the dominant color from any image URL using Canvas API.
 *
 * Usage:
 *   import { extractDominantColor } from '@/lib/colorExtractor';
 *
 *   const color = await extractDominantColor('https://example.com/image.jpg');
 *   // Returns '#f5c518' (hex string)
 *
 * How it works:
 *   1. Loads the image into a hidden <canvas>
 *   2. Samples pixels in a grid (fast, ~64 samples)
 *   3. Clusters colors using a simplified k-means approach
 *   4. Returns the most saturated dominant color (avoids grays/whites)
 *
 * Notes:
 *   - Works with CORS-enabled images (same-origin or crossOrigin="anonymous")
 *   - Falls back to '#f5c518' (Bysis yellow) on error
 *   - Results are cached in memory to avoid re-processing
 */

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface ColorResult {
  hex: string;
  rgb: [number, number, number];
  /** 0–1, how saturated the color is */
  saturation: number;
  /** true if the color is light (good for dark text) */
  isLight: boolean;
}

/* ── Cache ─────────────────────────────────────────────────────────────────── */
const cache = new Map<string, ColorResult>();

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

function getLuminance(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function colorDistance(
  a: [number, number, number],
  b: [number, number, number]
): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

/* ── Main extractor ────────────────────────────────────────────────────────── */
export async function extractDominantColor(
  imageUrl: string,
  options: {
    /** Number of color clusters (default: 5) */
    clusters?: number;
    /** Prefer saturated colors over neutral ones (default: true) */
    preferSaturated?: boolean;
    /** Fallback color if extraction fails */
    fallback?: string;
  } = {}
): Promise<ColorResult> {
  const { clusters = 5, preferSaturated = true, fallback = '#f5c518' } = options;

  // Check cache
  const cacheKey = `${imageUrl}:${clusters}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const result = await new Promise<ColorResult>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // Draw image on small canvas for fast sampling
          const canvas = document.createElement('canvas');
          const SIZE = 64; // Sample at 64×64 for speed
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('No canvas context');

          ctx.drawImage(img, 0, 0, SIZE, SIZE);
          const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

          // Collect pixel samples (skip transparent pixels)
          const pixels: [number, number, number][] = [];
          for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha < 128) continue; // skip transparent
            pixels.push([data[i], data[i + 1], data[i + 2]]);
          }

          if (pixels.length === 0) {
            resolve(parseColor(fallback));
            return;
          }

          // Simple k-means clustering
          const centroids = kMeans(pixels, clusters);

          // Score each centroid
          const scored = centroids.map(c => {
            const sat = getSaturation(c[0], c[1], c[2]);
            const lum = getLuminance(c[0], c[1], c[2]);
            // Penalize very dark (< 20) and very light (> 235) colors
            const darkPenalty = lum < 20 ? 0.2 : 1;
            const lightPenalty = lum > 235 ? 0.2 : 1;
            const score = preferSaturated
              ? sat * darkPenalty * lightPenalty
              : darkPenalty * lightPenalty;
            return { color: c, score, sat };
          });

          // Pick highest score
          scored.sort((a, b) => b.score - a.score);
          const best = scored[0].color;
          const [r, g, b] = best;

          const colorResult: ColorResult = {
            hex: rgbToHex(r, g, b),
            rgb: [r, g, b],
            saturation: getSaturation(r, g, b),
            isLight: getLuminance(r, g, b) > 155,
          };

          cache.set(cacheKey, colorResult);
          resolve(colorResult);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    });

    return result;
  } catch (err) {
    console.warn('[colorExtractor] Failed to extract color:', err);
    const fallbackResult = parseColor(fallback);
    cache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }
}

/* ── K-Means clustering ────────────────────────────────────────────────────── */
function kMeans(
  pixels: [number, number, number][],
  k: number,
  maxIterations = 10
): [number, number, number][] {
  // Initialize centroids by picking spread-out pixels
  const step = Math.floor(pixels.length / k);
  let centroids: [number, number, number][] = Array.from(
    { length: k },
    (_, i) => [...pixels[i * step]] as [number, number, number]
  );

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    const clusters: [number, number, number][][] = Array.from({ length: k }, () => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let nearest = 0;
      for (let i = 0; i < k; i++) {
        const d = colorDistance(pixel, centroids[i]);
        if (d < minDist) { minDist = d; nearest = i; }
      }
      clusters[nearest].push(pixel);
    }

    // Recompute centroids
    let changed = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;
      const newCentroid: [number, number, number] = [
        Math.round(clusters[i].reduce((s, p) => s + p[0], 0) / clusters[i].length),
        Math.round(clusters[i].reduce((s, p) => s + p[1], 0) / clusters[i].length),
        Math.round(clusters[i].reduce((s, p) => s + p[2], 0) / clusters[i].length),
      ];
      if (colorDistance(newCentroid, centroids[i]) > 1) changed = true;
      centroids[i] = newCentroid;
    }

    if (!changed) break;
  }

  return centroids;
}

/* ── Parse color string ────────────────────────────────────────────────────── */
function parseColor(hex: string): ColorResult {
  const c = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return {
    hex,
    rgb: [r, g, b],
    saturation: getSaturation(r, g, b),
    isLight: getLuminance(r, g, b) > 155,
  };
}

/* ── React hook ────────────────────────────────────────────────────────────── */
/**
 * React hook that extracts the dominant color from an image URL.
 *
 * @example
 * const { color, loading } = useDominantColor(imageUrl);
 * // color.hex = '#f5c518'
 */
export function useDominantColor(
  imageUrl: string | null | undefined,
  fallback = '#f5c518'
) {
  // Lazy import to avoid circular deps
  const { useState, useEffect } = require('react') as typeof import('react');
  const [color, setColor] = useState<ColorResult>(parseColor(fallback));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    setLoading(true);
    extractDominantColor(imageUrl, { fallback })
      .then(result => { setColor(result); setLoading(false); })
      .catch(() => { setColor(parseColor(fallback)); setLoading(false); });
  }, [imageUrl, fallback]);

  return { color, loading };
}
