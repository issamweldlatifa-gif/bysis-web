import { getDb } from "./db";
import { sliders } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get all active sliders ordered by displayOrder
 */
export async function getActiveSliders() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(sliders)
    .where(eq(sliders.isActive, 1))
    .orderBy(sliders.displayOrder)
    .execute();
}

/**
 * Get all sliders (including inactive)
 */
export async function getAllSliders() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(sliders)
    .orderBy(desc(sliders.updatedAt))
    .execute();
}

/**
 * Get slider by ID
 */
export async function getSliderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sliders).where(eq(sliders.id, id)).execute();
  return result[0] || null;
}

/**
 * Create new slider
 */
export async function createSlider(data: {
  title: string;
  description?: string;
  videoUrl?: string;
  videoKey?: string;
  countdownEndTime?: Date;
  backgroundColor?: string;
  backgroundGradient?: string;
  displayOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sliders).values({
    title: data.title,
    description: data.description,
    videoUrl: data.videoUrl,
    videoKey: data.videoKey,
    countdownEndTime: data.countdownEndTime,
    backgroundColor: data.backgroundColor || "#FFC107",
    backgroundGradient: data.backgroundGradient,
    displayOrder: data.displayOrder || 0,
    isActive: 1,
  });
  return result;
}

/**
 * Update slider
 */
export async function updateSlider(
  id: number,
  data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    videoKey?: string;
    countdownEndTime?: Date;
    backgroundColor?: string;
    backgroundGradient?: string;
    isActive?: number;
    displayOrder?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
  if (data.videoKey !== undefined) updateData.videoKey = data.videoKey;
  if (data.countdownEndTime !== undefined)
    updateData.countdownEndTime = data.countdownEndTime;
  if (data.backgroundColor !== undefined)
    updateData.backgroundColor = data.backgroundColor;
  if (data.backgroundGradient !== undefined)
    updateData.backgroundGradient = data.backgroundGradient;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

  return db.update(sliders).set(updateData).where(eq(sliders.id, id));
}

/**
 * Delete slider
 */
export async function deleteSlider(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(sliders).where(eq(sliders.id, id));
}

/**
 * Toggle slider active status
 */
export async function toggleSliderActive(id: number) {
  const slider = await getSliderById(id);
  if (!slider) throw new Error("Slider not found");

  return updateSlider(id, { isActive: (slider.isActive as number) === 1 ? 0 : 1 });
}
