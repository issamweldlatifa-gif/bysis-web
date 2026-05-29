/**
 * useImageColor — extracts the DOMINANT color from a product image using
 * a fast canvas-based histogram approach.
 *
 * Strategy:
 *  1. Draw the image into a small 64x64 canvas for speed.
 *  2. Sample every 4th pixel to build a color histogram.
 *  3. Ignore near-white (>230,>230,>230) and near-black (<20,<20,<20) pixels.
 *  4. Ignore very desaturated grays (max-min < 15).
 *  5. Quantize to 32-step bins, find the most-frequent bucket.
 *  6. Return a lightened (pastel) version for readable backgrounds.
 */
import { useEffect, useCallback, useRef } from 'react';

function hexFromRgb(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Lighten a color toward white by amount (0-1). */
function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return hexFromRgb(
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount)
  );
}

export function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const SIZE = 64;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('#cadfe2'); return; }
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        const BIN = 32;
        const hist: Record<string, { r: number; g: number; b: number; count: number }> = {};

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          if (r > 230 && g > 230 && b > 230) continue;
          if (r < 20 && g < 20 && b < 20) continue;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          if (max - min < 15) continue;

          const qr = Math.floor(r / BIN) * BIN;
          const qg = Math.floor(g / BIN) * BIN;
          const qb = Math.floor(b / BIN) * BIN;
          const key = `${qr},${qg},${qb}`;
          if (!hist[key]) hist[key] = { r: 0, g: 0, b: 0, count: 0 };
          hist[key].r += r;
          hist[key].g += g;
          hist[key].b += b;
          hist[key].count++;
        }

        const entries = Object.values(hist);
        if (entries.length === 0) { resolve('#cadfe2'); return; }

        entries.sort((a, b) => b.count - a.count);
        const top = entries[0];
        const dominant = hexFromRgb(
          Math.round(top.r / top.count),
          Math.round(top.g / top.count),
          Math.round(top.b / top.count)
        );
        // Lighten 55% toward white for a pastel background
        resolve(lightenColor(dominant, 0.55));
      } catch {
        resolve('#cadfe2');
      }
    };
    img.onerror = () => resolve('#cadfe2');
    img.src = imageUrl;
  });
}

/**
 * React hook: calls onColor whenever imageUrl changes.
 * Debounced 80ms to avoid rapid re-extraction during scroll.
 */
export function useImageColor(
  imageUrl: string | null | undefined,
  onColor: (hex: string) => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onColorRef = useRef(onColor);
  onColorRef.current = onColor;

  const extract = useCallback((url: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const color = await extractDominantColor(url);
      onColorRef.current(color);
    }, 80);
  }, []);

  useEffect(() => {
    if (!imageUrl) return;
    extract(imageUrl);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [imageUrl, extract]);
}
