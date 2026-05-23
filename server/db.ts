import { and, desc, eq, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, InsertOrder, Order, chatConversations, chatMessages, ChatConversation, ChatMessage, appSettings, arrivageItems, ArrivageItem, InsertArrivageItem, calculationHistory, CalculationHistory, InsertCalculationHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Order Helpers =====

export async function createOrder(order: InsertOrder): Promise<Order> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  const insertId = (result as any)[0]?.insertId;
  const created = await db.select().from(orders).where(eq(orders.id, insertId)).limit(1);
  return created[0];
}

export async function getOrderByTrackingCode(trackingCode: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orders).where(eq(orders.trackingCode, trackingCode)).limit(1);
  return result[0];
}

export async function getAllOrders(): Promise<Order[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function updateOrderStatus(id: number, status: "new" | "processing" | "waiting_payment" | "shipped" | "arrived" | "completed" | "cancelled"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderNotes(id: number, adminNotes: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ adminNotes }).where(eq(orders.id, id));
}

export async function getOrdersByUserId(userId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function searchOrdersByCustomerName(name: string): Promise<Order[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).where(like(orders.customerName, `%${name}%`)).orderBy(desc(orders.createdAt));
}

// ===== Chat Helpers =====

export async function getOrCreateConversation(sessionId: string): Promise<ChatConversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(chatConversations).where(eq(chatConversations.sessionId, sessionId)).limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(chatConversations).values({ sessionId });
  const created = await db.select().from(chatConversations).where(eq(chatConversations.sessionId, sessionId)).limit(1);
  return created[0];
}

export async function addChatMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string,
  imageUrl?: string | null,
  orderId?: number | null,
  audioUrl?: string | null,
  fileUrl?: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(chatMessages).values({
    conversationId,
    role,
    content,
    imageUrl: imageUrl || null,
    audioUrl: audioUrl || null,
    fileUrl: fileUrl || null,
    orderId: orderId || null,
  });
  await db.update(chatConversations)
    .set({ messageCount: sql`${chatConversations.messageCount} + 1` })
    .where(eq(chatConversations.id, conversationId));
}

export async function updateConversationCustomer(conversationId: number, name?: string, phone?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: any = {};
  if (name) updates.customerName = name;
  if (phone) updates.customerPhone = phone;
  if (Object.keys(updates).length > 0) {
    await db.update(chatConversations).set(updates).where(eq(chatConversations.id, conversationId));
  }
}

export async function markConversationHasOrder(conversationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(chatConversations).set({ hasOrder: 1 }).where(eq(chatConversations.id, conversationId));
}

export async function getAllConversations(): Promise<ChatConversation[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(chatConversations).orderBy(desc(chatConversations.updatedAt));
}

export async function getConversationMessages(conversationId: number): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId)).orderBy(chatMessages.createdAt);
}

// ===== App Settings Helpers =====

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
  return result.length > 0 ? result[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appSettings).values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

export async function searchOrdersByPhone(phone: string): Promise<Order[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).where(like(orders.customerPhone, `%${phone}%`)).orderBy(desc(orders.createdAt));
}

// ===== Arrivage Helpers =====

export async function getAllArrivageItems(): Promise<ArrivageItem[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(arrivageItems).orderBy(desc(arrivageItems.createdAt));
}

export async function getAvailableArrivageItems(): Promise<ArrivageItem[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(arrivageItems).where(eq(arrivageItems.available, 1)).orderBy(desc(arrivageItems.createdAt));
}

export async function createArrivageItem(item: InsertArrivageItem): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(arrivageItems).values(item);
}

export async function updateArrivageItem(id: number, updates: Partial<InsertArrivageItem>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(arrivageItems).set(updates).where(eq(arrivageItems.id, id));
}

export async function deleteArrivageItem(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(arrivageItems).where(eq(arrivageItems.id, id));
}

export async function getArrivageItems(): Promise<ArrivageItem[]> {
  return getAvailableArrivageItems();
}


// ===== Calculation History Helpers =====

export async function saveCalculation(calc: InsertCalculationHistory): Promise<CalculationHistory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(calculationHistory).values(calc);
  const saved = await db.select().from(calculationHistory).orderBy(desc(calculationHistory.createdAt)).limit(1);
  return saved[0];
}

export async function getCalculationHistory(limit: number = 50): Promise<CalculationHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(calculationHistory).orderBy(desc(calculationHistory.createdAt)).limit(limit);
}

export async function getCalculationHistoryBySession(sessionId: string): Promise<CalculationHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(calculationHistory).where(eq(calculationHistory.sessionId, sessionId)).orderBy(desc(calculationHistory.createdAt));
}

export async function getCalculationHistoryByUser(userId: number): Promise<CalculationHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(calculationHistory).where(eq(calculationHistory.userId, userId)).orderBy(desc(calculationHistory.createdAt));
}

export async function deleteCalculationById(id: number, deviceId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(calculationHistory).where(
    and(eq(calculationHistory.id, id), eq(calculationHistory.deviceId, deviceId))
  );
}

export async function getCalculationHistoryByDevice(deviceId: string, limit: number = 50): Promise<CalculationHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(calculationHistory)
    .where(eq(calculationHistory.deviceId, deviceId))
    .orderBy(desc(calculationHistory.createdAt))
    .limit(limit);
}
