/**
 * Heartbeat handler for real-time price tracking
 * POST /api/scheduled/priceCheck
 *
 * Triggered by the Manus Heartbeat cron every hour.
 * Checks prices for all active price_tracking entries, compares with
 * the current product price in the DB, and sends push notifications when
 * a price drop is detected.
 */
import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { priceTracking, products, pushSubscriptions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

export async function priceCheckHandler(req: Request, res: Response) {
  try {
    // Authenticate as cron
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "DB not available" });
    }

    // Find all active price tracking entries
    const trackingEntries = await db
      .select()
      .from(priceTracking)
      .where(and(eq(priceTracking.isActive, 1)));

    let checked = 0;
    let alerts = 0;

    for (const entry of trackingEntries) {
      if (!entry.productId) continue;

      // Get current product price from DB
      const [product] = await db
        .select({ priceTnd: products.priceTnd, name: products.name })
        .from(products)
        .where(eq(products.id, entry.productId))
        .limit(1);

      if (!product) continue;

      const currentPrice = product.priceTnd;
      const previousPrice = entry.currentPrice ? parseFloat(entry.currentPrice) : null;

      // Update lastCheckedAt and currentPrice
      await db
        .update(priceTracking)
        .set({
          currentPrice: String(currentPrice),
          lastCheckedAt: new Date(),
        })
        .where(eq(priceTracking.id, entry.id));

      checked++;

      // Check if price dropped and alert not yet sent
      if (
        previousPrice !== null &&
        currentPrice < previousPrice &&
        entry.alertSent === 0
      ) {
        const drop = previousPrice - currentPrice;
        const dropPct = Math.round((drop / previousPrice) * 100);

        // Mark alert as sent
        await db
          .update(priceTracking)
          .set({ alertSent: 1 })
          .where(eq(priceTracking.id, entry.id));

        alerts++;

        // Send push notification to all subscriptions for this session
        if (entry.sessionId) {
          const subs = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.sessionId, entry.sessionId));

          for (const sub of subs) {
            try {
              const payload = JSON.stringify({
                title: `💰 Baisse de prix: ${entry.productName}`,
                body: `Prix réduit de ${dropPct}% — maintenant ${currentPrice} DT (était ${previousPrice} DT)`,
                icon: "/favicon.ico",
                data: { productId: entry.productId },
              });

              // Call the built-in push notification service
              await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/push/v1/send`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
                },
                body: JSON.stringify({
                  endpoint: sub.endpoint,
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                  payload,
                }),
              }).catch(() => {}); // Best-effort
            } catch {
              // Ignore individual push failures
            }
          }
        }

        // Also notify admin
        await notifyOwner({
          title: `📉 Baisse de prix détectée`,
          content: `${entry.productName}: ${previousPrice} DT → ${currentPrice} DT (-${dropPct}%)`,
        }).catch(() => {});
      }
    }

    return res.json({ ok: true, checked, alerts, timestamp: new Date().toISOString() });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return res.status(500).json({
      error,
      stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
