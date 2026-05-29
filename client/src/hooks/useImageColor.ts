import { useEffect, useCallback } from 'react';

/**
 * Extracts the background color from an image by sampling the corners and edges.
 * This gives the background color (like the cream/white in fashion photos),
 * not the dominant color (which would be the clothing).
 *
 * Strategy: sample the 4 corners + top/bottom edges (20% strips) and average them.
 * This works well for e-commerce images where the background is in the corners.
 */
export function useImageColor(
  imageUrl: string | null | undefined,
  onColor: (hex: string) => void
) {
  const extract = useCallback(
    (url: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Scale down for performance
          const scale = Math.min(1, 200 / Math.max(img.naturalWidth || img.width, 1));
          canvas.width = Math.round((img.naturalWidth || img.width) * scale);
          canvas.height = Math.round((img.naturalHeight || img.height) * scale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const w = canvas.width;
          const h = canvas.height;

          // Sample zones: top-left corner, top-right corner, top strip
          // These areas typically contain the background in product/fashion photos
          const zones = [
            // Top-left corner (10% x 10%)
            { x: 0, y: 0, w: Math.max(1, Math.floor(w * 0.15)), h: Math.max(1, Math.floor(h * 0.15)) },
            // Top-right corner
            { x: Math.floor(w * 0.85), y: 0, w: Math.max(1, Math.floor(w * 0.15)), h: Math.max(1, Math.floor(h * 0.15)) },
            // Top center strip (avoid subject)
            { x: Math.floor(w * 0.1), y: 0, w: Math.max(1, Math.floor(w * 0.8)), h: Math.max(1, Math.floor(h * 0.08)) },
          ];

          let rSum = 0, gSum = 0, bSum = 0, totalCount = 0;

          for (const zone of zones) {
            try {
              const data = ctx.getImageData(zone.x, zone.y, zone.w, zone.h).data;
              for (let i = 0; i < data.length; i += 4) {
                const a = data[i + 3];
                if (a < 128) continue; // skip transparent pixels
                rSum += data[i];
                gSum += data[i + 1];
                bSum += data[i + 2];
                totalCount++;
              }
            } catch {
              // skip zone on CORS error
            }
          }

          if (totalCount > 0) {
            const r = Math.round(rSum / totalCount);
            const g = Math.round(gSum / totalCount);
            const b = Math.round(bSum / totalCount);
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            onColor(hex);
          }
        } catch {
          // silently ignore CORS or canvas errors
        }
      };

      img.onerror = () => {
        // silently ignore — keep current color
      };

      img.src = url;
    },
    [onColor]
  );

  useEffect(() => {
    if (!imageUrl) return;
    extract(imageUrl);
  }, [imageUrl, extract]);
}
