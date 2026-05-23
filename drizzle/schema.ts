import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
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
 * Orders table for tracking customer orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trackingCode: varchar("trackingCode", { length: 64 }).notNull().unique(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  productType: varchar("productType", { length: 255 }),
  productCategory: varchar("productCategory", { length: 255 }),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 255 }),
  sourceUrl: text("sourceUrl"),
  sourcePrice: varchar("sourcePrice", { length: 20 }),
  calculatedPrice: varchar("calculatedPrice", { length: 20 }),
  finalPrice: varchar("finalPrice", { length: 20 }),
  quantity: int("quantity").default(1),
  status: mysqlEnum("status", ["new", "processing", "waiting_payment", "shipped", "arrived", "completed", "cancelled"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  customerNotes: text("customerNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Chat conversations table
 */
export const chatConversations = mysqlTable("chatConversations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull().unique(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 255 }),
  customerPhone: varchar("customerPhone", { length: 20 }),
  hasOrder: int("hasOrder").default(0),
  messageCount: int("messageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

/**
 * Chat messages table
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  audioUrl: text("audioUrl"),
  fileUrl: text("fileUrl"),
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * App settings table for storing configuration
 */
export const appSettings = mysqlTable("appSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;

/**
 * Arrivage items table - local stock management
 */
export const arrivageItems = mysqlTable("arrivageItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 255 }),
  price: varchar("price", { length: 20 }).notNull(),
  quantity: int("quantity").notNull().default(0),
  available: int("available").default(1),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArrivageItem = typeof arrivageItems.$inferSelect;
export type InsertArrivageItem = typeof arrivageItems.$inferInsert;

/**
 * Calculation history table - track all price calculations
 */
export const calculationHistory = mysqlTable("calculationHistory", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  userId: int("userId"),
  deviceId: varchar("deviceId", { length: 255 }),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 255 }),
  productType: varchar("productType", { length: 255 }),
  productCategory: varchar("productCategory", { length: 255 }),
  sourcePrice: varchar("sourcePrice", { length: 20 }),
  calculatedPrice: varchar("calculatedPrice", { length: 20 }),
  analysisData: json("analysisData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalculationHistory = typeof calculationHistory.$inferSelect;
export type InsertCalculationHistory = typeof calculationHistory.$inferInsert;
