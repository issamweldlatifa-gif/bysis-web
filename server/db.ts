import { and, desc, eq, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  orders, InsertOrder, Order,
  clients, Client, InsertClient,
  auditLogs, AuditLog, InsertAuditLog,
  chatConversations, chatMessages, ChatConversation, ChatMessage,
  appSettings, arrivageItems, ArrivageItem, InsertArrivageItem,
  calculationHistory, CalculationHistory, InsertCalculationHistory,
  carouselSlides, CarouselSlide, InsertCarouselSlide,
  categories, Category, InsertCategory,
  products, Product, InsertProduct,
  aiOrders, AiOrder, InsertAiOrder
} from "../drizzle/schema";
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

// ===== User Helpers =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
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
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
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

export async function updateOrderStatus(
  id: number,
  status: "new" | "processing" | "waiting_payment" | "shipped" | "arrived" | "completed" | "cancelled"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderFull(id: number, updates: Partial<InsertOrder>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(updates).where(eq(orders.id, id));
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

export async function getOrdersByClientId(clientId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.createdAt));
}

export async function searchOrdersByCustomerName(name: string): Promise<Order[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).where(like(orders.customerName, `%${name}%`)).orderBy(desc(orders.createdAt));
}

export async function searchOrdersByPhone(phone: string): Promise<Order[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).where(like(orders.customerPhone, `%${phone}%`)).orderBy(desc(orders.createdAt));
}

// ===== Analytics Helpers =====

export async function getOrderStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
  const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekStart);
  const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= monthStart);

  const activeStatuses = ["new", "processing", "waiting_payment", "shipped", "arrived"];
  const activeShipments = allOrders.filter(o => activeStatuses.includes(o.status));
  const completedOrders = allOrders.filter(o => o.status === "completed");

  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.profitTnd || 0), 0);
  const monthRevenue = monthOrders.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.profitTnd || 0), 0);

  // Daily breakdown for last 7 days
  const dailyStats: { date: string; count: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(todayStart); day.setDate(day.getDate() - i);
    const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
    const dayOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= day && d < nextDay;
    });
    dailyStats.push({
      date: day.toISOString().split('T')[0],
      count: dayOrders.length,
      revenue: dayOrders.filter(o => o.status === "completed").reduce((s, o) => s + (o.profitTnd || 0), 0),
    });
  }

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  for (const o of allOrders) {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
  }

  return {
    total: allOrders.length,
    today: todayOrders.length,
    thisWeek: weekOrders.length,
    thisMonth: monthOrders.length,
    activeShipments: activeShipments.length,
    completed: completedOrders.length,
    totalRevenue,
    monthRevenue,
    dailyStats,
    statusBreakdown,
  };
}

// ===== CRM / Clients Helpers =====

export async function getAllClients(): Promise<Client[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function getClientByPhone(phone: string): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(clients).where(eq(clients.phone, phone)).limit(1);
  return result[0];
}

export async function upsertClient(data: InsertClient): Promise<Client> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clients).values(data).onDuplicateKeyUpdate({
    set: { name: data.name, email: data.email, address: data.address, gouvernorat: data.gouvernorat }
  });
  const result = await db.select().from(clients).where(eq(clients.phone, data.phone)).limit(1);
  return result[0];
}

export async function updateClientStatus(id: number, accountStatus: "active" | "banned" | "suspended"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set({ accountStatus }).where(eq(clients.id, id));
}

export async function updateClientNotes(id: number, notes: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set({ notes }).where(eq(clients.id, id));
}

export async function incrementClientOrders(clientId: number, amount: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set({
    totalOrders: sql`${clients.totalOrders} + 1`,
    totalSpent: sql`${clients.totalSpent} + ${amount}`,
  }).where(eq(clients.id, clientId));
}

export async function searchClients(query: string): Promise<Client[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(clients).where(
    like(clients.name, `%${query}%`)
  ).orderBy(desc(clients.createdAt)).limit(50);
}

// ===== Audit Log Helpers =====

export async function createAuditLog(log: InsertAuditLog): Promise<void> {
  const db = await getDb();
  if (!db) { console.warn("[Audit] DB not available, skipping log"); return; }
  await db.insert(auditLogs).values(log);
}

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

export async function getAuditLogsByEntity(entityType: string, entityId: number): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(auditLogs)
    .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.createdAt));
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
  await db.insert(chatMessages).values({ conversationId, role, content, imageUrl: imageUrl || null, audioUrl: audioUrl || null, fileUrl: fileUrl || null, orderId: orderId || null });
  await db.update(chatConversations).set({ messageCount: sql`${chatConversations.messageCount} + 1` }).where(eq(chatConversations.id, conversationId));
}

export async function updateConversationCustomer(conversationId: number, name?: string, phone?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: any = {};
  if (name) updates.customerName = name;
  if (phone) updates.customerPhone = phone;
  if (Object.keys(updates).length > 0) await db.update(chatConversations).set(updates).where(eq(chatConversations.id, conversationId));
}

export async function markConversationHasOrder(conversationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(chatConversations).set({ hasOrder: 1 }).where(eq(chatConversations.id, conversationId));
}

export async function getConversationBySessionId(sessionId: string): Promise<ChatConversation | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(chatConversations).where(eq(chatConversations.sessionId, sessionId)).limit(1);
  return result[0] ?? null;
}

export async function clearConversationHistory(sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conv = await getConversationBySessionId(sessionId);
  if (!conv) return;
  await db.delete(chatMessages).where(eq(chatMessages.conversationId, conv.id));
  await db.update(chatConversations).set({ messageCount: 0, updatedAt: new Date() }).where(eq(chatConversations.id, conv.id));
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
  await db.insert(appSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
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
  await db.delete(calculationHistory).where(and(eq(calculationHistory.id, id), eq(calculationHistory.deviceId, deviceId)));
}

export async function getCalculationHistoryByDevice(deviceId: string, limit: number = 50): Promise<CalculationHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(calculationHistory).where(eq(calculationHistory.deviceId, deviceId)).orderBy(desc(calculationHistory.createdAt)).limit(limit);
}

// ===== Carousel Slides Helpers =====

export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(carouselSlides).orderBy(carouselSlides.displayOrder);
}

export async function getActiveCarouselSlides(): Promise<CarouselSlide[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(carouselSlides)
    .where(eq(carouselSlides.active, 1))
    .orderBy(carouselSlides.displayOrder);
}

export async function createCarouselSlide(slide: InsertCarouselSlide): Promise<CarouselSlide> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(carouselSlides).values(slide);
  const insertId = (result as any)[0]?.insertId;
  const created = await db.select().from(carouselSlides).where(eq(carouselSlides.id, insertId)).limit(1);
  return created[0];
}

export async function updateCarouselSlide(id: number, updates: Partial<InsertCarouselSlide>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(carouselSlides).set(updates).where(eq(carouselSlides.id, id));
}

export async function deleteCarouselSlide(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(carouselSlides).where(eq(carouselSlides.id, id));
}

// ===== Categories Helpers =====

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(categories).orderBy(categories.displayOrder);
}

export async function getActiveCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(categories)
    .where(eq(categories.active, 1))
    .orderBy(categories.displayOrder);
}

export async function createCategory(cat: InsertCategory): Promise<Category> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(cat);
  const insertId = (result as any)[0]?.insertId;
  const created = await db.select().from(categories).where(eq(categories.id, insertId)).limit(1);
  return created[0];
}

export async function updateCategory(id: number, updates: Partial<InsertCategory>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(updates).where(eq(categories.id, id));
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ===== Products Helpers =====

export async function getAllProducts(limit = 50, offset = 0): Promise<Product[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(products).orderBy(desc(products.createdAt)).limit(limit).offset(offset);
}

export async function getActiveProducts(limit = 50, offset = 0): Promise<Product[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(products)
    .where(eq(products.active, 1))
    .orderBy(desc(products.createdAt))
    .limit(limit).offset(offset);
}

export async function getProductsByCategory(categoryId: number, limit = 50): Promise<Product[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.active, 1)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(products)
    .where(and(like(products.name, `%${query}%`), eq(products.active, 1)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function createProduct(product: InsertProduct): Promise<Product> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  const insertId = (result as any)[0]?.insertId;
  const created = await db.select().from(products).where(eq(products.id, insertId)).limit(1);
  return created[0];
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(updates).where(eq(products.id, id));
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function countProducts(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({ count: sql<number>`count(*)` }).from(products);
  return result[0]?.count ?? 0;
}

// ===== AI Orders Helpers =====

function generateTrackingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BY';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createAiOrder(data: Omit<InsertAiOrder, 'trackingCode'>): Promise<AiOrder> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let trackingCode = generateTrackingCode();
  // Ensure uniqueness
  for (let i = 0; i < 5; i++) {
    const existing = await db.select().from(aiOrders).where(eq(aiOrders.trackingCode, trackingCode)).limit(1);
    if (existing.length === 0) break;
    trackingCode = generateTrackingCode();
  }
  const result = await db.insert(aiOrders).values({ ...data, trackingCode });
  const insertId = (result as any)[0]?.insertId;
  const created = await db.select().from(aiOrders).where(eq(aiOrders.id, insertId)).limit(1);
  return created[0];
}

export async function getAiOrderByTracking(trackingCode: string): Promise<AiOrder | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(aiOrders).where(eq(aiOrders.trackingCode, trackingCode.toUpperCase())).limit(1);
  return result[0];
}

export async function getAiOrdersByUserId(userId: number): Promise<AiOrder[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(aiOrders).where(eq(aiOrders.userId, userId)).orderBy(desc(aiOrders.createdAt));
}

export async function getAllAiOrders(): Promise<AiOrder[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(aiOrders).orderBy(desc(aiOrders.createdAt));
}

export async function updateAiOrderStatus(id: number, status: string, adminNotes?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Partial<InsertAiOrder> = { status };
  if (adminNotes !== undefined) updates.adminNotes = adminNotes;
  await db.update(aiOrders).set(updates).where(eq(aiOrders.id, id));
}

export async function updateAiOrderPaymentProof(id: number, paymentProofUrl: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiOrders).set({ paymentProofUrl, status: 'deposit_received' }).where(eq(aiOrders.id, id));
}

export async function searchAiOrdersByName(name: string): Promise<AiOrder[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(aiOrders).where(
    like(aiOrders.customerName, `%${name}%`)
  ).orderBy(desc(aiOrders.createdAt)).limit(20);
}
