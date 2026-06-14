import { eq, asc } from "drizzle-orm";
import { getDb } from "./db";
import { homepageSettings, homepageVideos, homepageStores } from "../drizzle/schema";

async function db() {
  const d = await getDb();
  if (!d) throw new Error("Database not available");
  return d;
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function getHomepageSettings() {
  const d = await db();
  const rows = await d.select().from(homepageSettings).where(eq(homepageSettings.id, 1)).limit(1);
  return rows[0] ?? null;
}

export async function updateHomepageSettings(data: Partial<typeof homepageSettings.$inferInsert>) {
  const d = await db();
  await d.update(homepageSettings).set(data).where(eq(homepageSettings.id, 1));
  return getHomepageSettings();
}

// ─── VIDEOS ──────────────────────────────────────────────────────────────────

export async function getHeroVideo() {
  const d = await db();
  const rows = await d
    .select()
    .from(homepageVideos)
    .where(eq(homepageVideos.type, "hero"))
    .orderBy(asc(homepageVideos.displayOrder))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSliderVideos() {
  const d = await db();
  return d
    .select()
    .from(homepageVideos)
    .where(eq(homepageVideos.type, "slider"))
    .orderBy(asc(homepageVideos.displayOrder));
}

export async function getAllHomepageVideos() {
  const d = await db();
  return d.select().from(homepageVideos).orderBy(asc(homepageVideos.displayOrder));
}

export async function createHomepageVideo(data: typeof homepageVideos.$inferInsert) {
  const d = await db();
  const result = await d.insert(homepageVideos).values(data);
  const id = (result as any).insertId ?? (result as any)[0]?.insertId;
  const rows = await d.select().from(homepageVideos).where(eq(homepageVideos.id, Number(id))).limit(1);
  return rows[0];
}

export async function updateHomepageVideo(id: number, data: Partial<typeof homepageVideos.$inferInsert>) {
  const d = await db();
  await d.update(homepageVideos).set(data).where(eq(homepageVideos.id, id));
  const rows = await d.select().from(homepageVideos).where(eq(homepageVideos.id, id)).limit(1);
  return rows[0];
}

export async function deleteHomepageVideo(id: number) {
  const d = await db();
  await d.delete(homepageVideos).where(eq(homepageVideos.id, id));
}

// ─── STORES ──────────────────────────────────────────────────────────────────

export async function getActiveHomepageStores() {
  const d = await db();
  return d
    .select()
    .from(homepageStores)
    .where(eq(homepageStores.isActive, 1))
    .orderBy(asc(homepageStores.displayOrder));
}

export async function getAllHomepageStores() {
  const d = await db();
  return d.select().from(homepageStores).orderBy(asc(homepageStores.displayOrder));
}

export async function createHomepageStore(data: typeof homepageStores.$inferInsert) {
  const d = await db();
  const result = await d.insert(homepageStores).values(data);
  const id = (result as any).insertId ?? (result as any)[0]?.insertId;
  const rows = await d.select().from(homepageStores).where(eq(homepageStores.id, Number(id))).limit(1);
  return rows[0];
}

export async function updateHomepageStore(id: number, data: Partial<typeof homepageStores.$inferInsert>) {
  const d = await db();
  await d.update(homepageStores).set(data).where(eq(homepageStores.id, id));
  const rows = await d.select().from(homepageStores).where(eq(homepageStores.id, id)).limit(1);
  return rows[0];
}

export async function deleteHomepageStore(id: number) {
  const d = await db();
  await d.delete(homepageStores).where(eq(homepageStores.id, id));
}
