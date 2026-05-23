import webpush from "web-push";
import { getDb } from "./db";
import { pushSubscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

// Configure VAPID
if (ENV.vapidPublicKey && ENV.vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:contact@bysisshop.com",
    ENV.vapidPublicKey,
    ENV.vapidPrivateKey
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/**
 * Save a push subscription to the database
 */
export async function savePushSubscription(data: {
  endpoint: string;
  p256dh: string;
  auth: string;
  customerPhone?: string;
  sessionId?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  // Check if already exists
  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, data.endpoint))
    .limit(1);

  if (existing.length > 0) {
    if (data.customerPhone || data.sessionId) {
      await db
        .update(pushSubscriptions)
        .set({
          customerPhone: data.customerPhone ?? existing[0].customerPhone ?? undefined,
          sessionId: data.sessionId ?? existing[0].sessionId ?? undefined,
        })
        .where(eq(pushSubscriptions.endpoint, data.endpoint));
    }
    return existing[0];
  }

  await db.insert(pushSubscriptions).values({
    endpoint: data.endpoint,
    p256dh: data.p256dh,
    auth: data.auth,
    customerPhone: data.customerPhone,
    sessionId: data.sessionId,
  });
  return null;
}

/**
 * Send push notification to all subscriptions matching a phone number
 */
export async function sendPushToPhone(phone: string, payload: PushPayload) {
  const db = await getDb();
  if (!db) return 0;

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.customerPhone, phone));

  if (subs.length === 0) return 0;

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  // Clean up expired subscriptions
  const expired: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const err = r.reason as { statusCode?: number };
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        expired.push(subs[i].endpoint);
      }
    }
  });
  for (const ep of expired) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, ep));
  }

  return results.filter((r) => r.status === "fulfilled").length;
}

/**
 * Send push notification to all subscriptions (broadcast)
 */
export async function broadcastPush(payload: PushPayload) {
  const db = await getDb();
  if (!db) return 0;

  const subs = await db.select().from(pushSubscriptions);
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );
  return results.filter((r) => r.status === "fulfilled").length;
}
