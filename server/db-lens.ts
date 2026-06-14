import { getDb } from "./db";
import { lensHistory, products, priceTracking, arTryOnResults } from "../drizzle/schema";
import { like, or, desc, eq, and, gt } from "drizzle-orm";

async function db() {
  const d = await getDb();
  if (!d) throw new Error("Database not available");
  return d;
}

/* ─── Save lens search to history ─────────────────────────────────────── */
export async function saveLensSearch(data: {
  userId?: string;
  sessionId?: string;
  queryType: "image" | "text" | "barcode";
  queryText?: string;
  imageUrl?: string;
  aiAnalysis?: {
    productType: string;
    colors: string[];
    keywords: string[];
    estimatedPrice?: number;
    confidence: number;
    platform?: string;
  };
  resultCount?: number;
}) {
  const d = await db();
  await d.insert(lensHistory).values({
    userId: data.userId,
    sessionId: data.sessionId,
    queryType: data.queryType,
    queryText: data.queryText,
    imageUrl: data.imageUrl,
    aiAnalysis: data.aiAnalysis ?? null,
    resultCount: data.resultCount ?? 0,
  });
}

/* ─── Get lens history for a session/user ─────────────────────────────── */
export async function getLensHistory(sessionId: string, limit = 10) {
  const d = await db();
  return d
    .select()
    .from(lensHistory)
    .where(eq(lensHistory.sessionId, sessionId))
    .orderBy(desc(lensHistory.createdAt))
    .limit(limit);
}

/* ─── Search products by keywords (AI-extracted) ─────────────────────── */
export async function searchProductsByKeywords(keywords: string[], limit = 12) {
  const d = await db();
  if (!keywords.length) return [];

  const conditions = keywords.flatMap((kw) => [
    like(products.name, `%${kw}%`),
    like(products.description, `%${kw}%`),
  ]);

  return d
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      priceTnd: products.priceTnd,
      priceEur: products.priceEur,
      originalPrice: products.originalPrice,
      discount: products.discount,
      imageUrl: products.imageUrl,
      platform: products.platform,
      stock: products.stock,
      rating: products.rating,
      categoryId: products.categoryId,
    })
    .from(products)
    .where(and(eq(products.active, 1), gt(products.stock, 0), or(...conditions)))
    .orderBy(desc(products.rating))
    .limit(limit);
}

/* ─── Search products by text query ──────────────────────────────────── */
export async function searchProductsByText(query: string, limit = 12) {
  const terms = query.split(/\s+/).filter(Boolean).slice(0, 5);
  return searchProductsByKeywords(terms, limit);
}

/* ─── Get trending/featured products for empty state ─────────────────── */
export async function getTrendingProducts(limit = 8) {
  const d = await db();
  return d
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      priceTnd: products.priceTnd,
      priceEur: products.priceEur,
      originalPrice: products.originalPrice,
      discount: products.discount,
      imageUrl: products.imageUrl,
      platform: products.platform,
      stock: products.stock,
      rating: products.rating,
      categoryId: products.categoryId,
    })
    .from(products)
    .where(and(eq(products.active, 1), gt(products.stock, 0)))
    .orderBy(desc(products.rating))
    .limit(limit);
}

/* ─── Price Tracking helpers ──────────────────────────────────────────── */

export async function addPriceTracking(data: {
  userId?: string;
  sessionId?: string;
  productId?: number;
  productName: string;
  productUrl?: string;
  productImageUrl?: string;
  platform?: string;
  targetPrice?: number;
  currentPrice?: number;
}) {
  const d = await db();
  const [result] = await d.insert(priceTracking).values({
    userId: data.userId,
    sessionId: data.sessionId,
    productId: data.productId,
    productName: data.productName,
    productUrl: data.productUrl,
    productImageUrl: data.productImageUrl,
    platform: data.platform ?? "bysis",
    targetPrice: data.targetPrice?.toString(),
    currentPrice: data.currentPrice?.toString(),
    isActive: 1,
    alertSent: 0,
  });
  return result;
}

export async function getUserPriceTracking(sessionId: string, limit = 20) {
  const d = await db();
  return d
    .select()
    .from(priceTracking)
    .where(and(eq(priceTracking.sessionId, sessionId), eq(priceTracking.isActive, 1)))
    .orderBy(desc(priceTracking.createdAt))
    .limit(limit);
}

export async function removePriceTracking(id: number, sessionId: string) {
  const d = await db();
  await d
    .delete(priceTracking)
    .where(and(eq(priceTracking.id, id), eq(priceTracking.sessionId, sessionId)));
}

/* ─── AR Try-On helpers ───────────────────────────────────────────────── */

export async function saveArTryOn(data: {
  userId?: string;
  sessionId?: string;
  userPhotoUrl: string;
  productImageUrl: string;
  productName?: string;
}) {
  const d = await db();
  const [result] = await d.insert(arTryOnResults).values({
    userId: data.userId,
    sessionId: data.sessionId,
    userPhotoUrl: data.userPhotoUrl,
    productImageUrl: data.productImageUrl,
    productName: data.productName,
    status: "pending",
  });
  return result;
}

export async function updateArTryOnResult(id: number, resultImageUrl: string, status: "done" | "failed") {
  const d = await db();
  await d
    .update(arTryOnResults)
    .set({ resultImageUrl, status })
    .where(eq(arTryOnResults.id, id));
}

export async function getArTryOnResult(id: number) {
  const d = await db();
  const rows = await d
    .select()
    .from(arTryOnResults)
    .where(eq(arTryOnResults.id, id))
    .limit(1);
  return rows[0] ?? null;
}
