import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table - stores customer orders for products from Shein/AliExpress
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  /** Customer name */
  customerName: varchar("customerName", { length: 255 }).notNull(),
  /** Customer phone or contact */
  customerPhone: varchar("customerPhone", { length: 64 }),
  /** Unique tracking code generated on order creation (e.g. BSS-A1B2C3D4) */
  trackingCode: varchar("trackingCode", { length: 16 }).unique(),
  /** Product link from Shein or AliExpress */
  productLink: text("productLink").notNull(),
  /** Quantity requested */
  quantity: int("quantity").notNull().default(1),
  /** Size requested */
  size: varchar("size", { length: 64 }),
  /** Color requested */
  color: varchar("color", { length: 64 }),
  /** Customer address */
  customerAddress: text("customerAddress"),
  /** Tunisian gouvernorat for delivery */
  gouvernorat: varchar("gouvernorat", { length: 64 }),
  /** Screenshot URL stored in S3 */
  screenshotUrl: text("screenshotUrl"),
  /** Payment receipt image URL stored in S3 */
  paymentReceiptUrl: text("paymentReceiptUrl"),
  /** Payment method: 'bank' or 'mandat' */
  paymentMethod: varchar("paymentMethod", { length: 32 }),
  /** Additional notes from customer */
  notes: text("notes"),
  /** Admin internal notes */
  adminNotes: text("adminNotes"),
  /** Order status */
  status: mysqlEnum("status", ["new", "processing", "waiting_payment", "shipped", "arrived", "completed", "cancelled"]).default("new").notNull(),
  /** User ID if logged in (nullable for guest orders) */
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Chat conversations - groups messages by session
 */
export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  /** Session identifier (random UUID per browser session) */
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  /** Customer name if provided during chat */
  customerName: varchar("customerName", { length: 255 }),
  /** Customer phone if provided */
  customerPhone: varchar("customerPhone", { length: 64 }),
  /** Whether an order was placed via this conversation */
  hasOrder: int("hasOrder").default(0).notNull(),
  /** Number of messages in conversation */
  messageCount: int("messageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

/**
 * Chat messages - individual messages in a conversation
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to conversation */
  conversationId: int("conversationId").notNull(),
  /** 'user' or 'assistant' */
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  /** Message text content */
  content: text("content").notNull(),
  /** Optional image URL (for user uploads) */
  imageUrl: text("imageUrl"),
  /** Optional audio URL (for voice messages) */
  audioUrl: text("audioUrl"),
  /** Optional file URL (for file uploads) */
  fileUrl: text("fileUrl"),
  /** If this message triggered an order, store order ID */
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * App settings - key/value store for global settings like busy mode
 */
export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;

/**
 * Arrivage items - products added by admin for upcoming arrivals
 */
export const arrivageItems = mysqlTable("arrivage_items", {
  id: int("id").autoincrement().primaryKey(),
  /** Product name in Arabic/French */
  name: varchar("name", { length: 255 }).notNull(),
  /** Optional description */
  description: text("description"),
  /** Price in TND */
  priceTnd: int("priceTnd").notNull(),
  /** Original price in EUR (optional) */
  priceEur: int("priceEur"),
  /** Image URL stored in S3 */
  imageUrl: text("imageUrl"),
  /** Platform: shein, aliexpress, temu */
  platform: mysqlEnum("platform", ["shein", "aliexpress", "temu"]).default("shein").notNull(),
  /** Whether this item is currently available */
  available: int("available").default(1).notNull(),
  /** Optional product link */
  productLink: text("productLink"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArrivageItem = typeof arrivageItems.$inferSelect;
export type InsertArrivageItem = typeof arrivageItems.$inferInsert;

/**
 * Push notification subscriptions - stores browser push subscriptions
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  /** Browser push endpoint URL */
  endpoint: text("endpoint").notNull(),
  /** P256DH key */
  p256dh: text("p256dh").notNull(),
  /** Auth key */
  auth: text("auth").notNull(),
  /** Customer phone (to match with orders) */
  customerPhone: varchar("customerPhone", { length: 64 }),
  /** Session ID from chat */
  sessionId: varchar("sessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Calculator history - stores price calculations from images
 */
export const calculationHistory = mysqlTable("calculation_history", {
  id: int("id").autoincrement().primaryKey(),
  /** Original image URL (screenshot from product page) */
  imageUrl: text("imageUrl").notNull(),
  /** Original price extracted from image */
  originalPrice: varchar("originalPrice", { length: 20 }).notNull(),
  /** Original currency (USD, EUR, CNY, GBP, etc.) */
  originalCurrency: varchar("originalCurrency", { length: 10 }).notNull(),
  /** Price in EUR after conversion */
  priceEur: varchar("priceEur", { length: 20 }).notNull(),
  /** Price in TND (multiplied by 4) */
  priceTnd: varchar("priceTnd", { length: 20 }).notNull(),
  /** Session ID from chat (if calculated from chat) */
  sessionId: varchar("sessionId", { length: 128 }),
  /** Device ID from localStorage — isolates history per browser/device */
  deviceId: varchar("deviceId", { length: 128 }),
  /** User ID if logged in (nullable for guest) */
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalculationHistory = typeof calculationHistory.$inferSelect;
export type InsertCalculationHistory = typeof calculationHistory.$inferInsert;
