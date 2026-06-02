import { int, mysqlEnum, mysqlTable, text, timestamp, tinyint, varchar, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with profile fields for client-facing features.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  gouvernorat: varchar("gouvernorat", { length: 128 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["active", "suspended", "banned"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clients table - CRM: one record per unique phone number
 * Linked to users table when client creates an account
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatarUrl"),
  address: text("address"),
  gouvernorat: varchar("gouvernorat", { length: 128 }),
  accountStatus: mysqlEnum("accountStatus", ["active", "banned", "suspended"]).default("active").notNull(),
  totalOrders: int("totalOrders").default(0).notNull(),
  totalSpent: int("totalSpent").default(0).notNull(),
  notes: text("notes"),
  requiresVerification: tinyint("requiresVerification").default(0).notNull(),
  verificationReason: text("verificationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Orders table - stores customer orders for products from Shein/AliExpress/Temu
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 64 }),
  trackingCode: varchar("trackingCode", { length: 32 }).unique(),
  productLink: text("productLink").notNull(),
  quantity: int("quantity").notNull().default(1),
  size: varchar("size", { length: 64 }),
  color: varchar("color", { length: 64 }),
  customerAddress: text("customerAddress"),
  gouvernorat: varchar("gouvernorat", { length: 64 }),
  screenshotUrl: text("screenshotUrl"),
  paymentReceiptUrl: text("paymentReceiptUrl"),
  paymentMethod: varchar("paymentMethod", { length: 32 }),
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  rejectionReason: text("rejectionReason"),
  status: mysqlEnum("status", ["new", "processing", "waiting_payment", "shipped", "arrived", "completed", "cancelled"]).default("new").notNull(),
  /** FK to clients table */
  clientId: int("clientId"),
  /** FK to users table */
  userId: int("userId"),
  /** Flag to request ID/payment verification from customer */
  requiresVerification: tinyint("requiresVerification").default(0).notNull(),
  verificationReason: text("verificationReason"),
  /** Cost paid to platform (TND) */
  costTnd: int("costTnd").default(0),
  /** Profit margin (TND) */
  profitTnd: int("profitTnd").default(0),
  /** Platform source */
  platform: mysqlEnum("platform", ["shein", "aliexpress", "temu"]).default("shein"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Audit logs - records every admin action for accountability
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId"),
  adminName: varchar("adminName", { length: 255 }),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: int("entityId"),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Chat conversations - groups messages by session
 */
export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  customerPhone: varchar("customerPhone", { length: 64 }),
  hasOrder: int("hasOrder").default(0).notNull(),
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
 * App settings - key/value store for global settings
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
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priceTnd: int("priceTnd").notNull(),
  priceEur: int("priceEur"),
  imageUrl: text("imageUrl"),
  platform: mysqlEnum("platform", ["shein", "aliexpress", "temu"]).default("shein").notNull(),
  available: int("available").default(1).notNull(),
  productLink: text("productLink"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArrivageItem = typeof arrivageItems.$inferSelect;
export type InsertArrivageItem = typeof arrivageItems.$inferInsert;

/**
 * Push notification subscriptions
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  customerPhone: varchar("customerPhone", { length: 64 }),
  sessionId: varchar("sessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Product Categories
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  icon: varchar("icon", { length: 64 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  active: tinyint("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products - main product catalog (500+)
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  priceTnd: int("priceTnd").notNull(),
  priceEur: int("priceEur"),
  originalPrice: int("originalPrice"),
  discount: int("discount").default(0),
  imageUrl: text("imageUrl"),
  images: json("images").$type<string[]>().default([]),
  platform: mysqlEnum("platform", ["shein", "aliexpress", "temu", "local"]).default("local"),
  platformLink: text("platformLink"),
  stock: int("stock").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: int("reviewCount").default(0),
  active: tinyint("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product Reviews
 */
export const productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 255 }),
  rating: int("rating").notNull(),
  comment: text("comment"),
  imageUrl: text("imageUrl"),
  verified: tinyint("verified").default(0).notNull(),
  helpful: int("helpful").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

/**
 * Shopping Cart
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 128 }),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders with product purchases (not just Shein orders)
 */
export const productOrders = mysqlTable("product_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull().unique(),
  totalPrice: int("totalPrice").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }).default("image_upload"),
  paymentProofUrl: text("paymentProofUrl"),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  shippingAddress: text("shippingAddress"),
  gouvernorat: varchar("gouvernorat", { length: 128 }),
  customerNotes: text("customerNotes"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductOrder = typeof productOrders.$inferSelect;
export type InsertProductOrder = typeof productOrders.$inferInsert;

/**
 * Product Order Items (line items in an order)
 */
export const productOrderItems = mysqlTable("product_order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  pricePerUnit: int("pricePerUnit").notNull(),
  totalPrice: int("totalPrice").notNull(),
});

export type ProductOrderItem = typeof productOrderItems.$inferSelect;
export type InsertProductOrderItem = typeof productOrderItems.$inferInsert;

/**
 * Custom Orders (with 4 images + 2 links)
 */
export const customOrders = mysqlTable("custom_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull().unique(),
  description: text("description"),
  image1Url: text("image1Url"),
  image2Url: text("image2Url"),
  image3Url: text("image3Url"),
  image4Url: text("image4Url"),
  link1: text("link1"),
  link2: text("link2"),
  estimatedPrice: int("estimatedPrice"),
  finalPrice: int("finalPrice"),
  paymentProofUrl: text("paymentProofUrl"),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  shippingAddress: text("shippingAddress"),
  gouvernorat: varchar("gouvernorat", { length: 128 }),
  customerNotes: text("customerNotes"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomOrder = typeof customOrders.$inferSelect;
export type InsertCustomOrder = typeof customOrders.$inferInsert;

/**
 * Calculator history - stores price calculations from images
 */
export const calculationHistory = mysqlTable("calculation_history", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  originalPrice: varchar("originalPrice", { length: 20 }).notNull(),
  originalCurrency: varchar("originalCurrency", { length: 10 }).notNull(),
  priceEur: varchar("priceEur", { length: 20 }).notNull(),
  priceTnd: varchar("priceTnd", { length: 20 }).notNull(),
  sessionId: varchar("sessionId", { length: 128 }),
  deviceId: varchar("deviceId", { length: 128 }),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalculationHistory = typeof calculationHistory.$inferSelect;
export type InsertCalculationHistory = typeof calculationHistory.$inferInsert;

/**
 * Carousel Slides - managed by admin, displayed on home page
 */
export const carouselSlides = mysqlTable("carousel_slides", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  bgColor: varchar("bgColor", { length: 32 }).default("#E8192C").notNull(),
  textColor: varchar("textColor", { length: 32 }).default("#ffffff"),
  imageUrl: text("imageUrl"),
  card1Label: varchar("card1Label", { length: 128 }),
  card1Image: text("card1Image"),
  card1Link: text("card1Link"),
  card2Label: varchar("card2Label", { length: 128 }),
  card2Image: text("card2Image"),
  card2Link: text("card2Link"),
  card3Label: varchar("card3Label", { length: 128 }),
  card3Image: text("card3Image"),
  card3Link: text("card3Link"),
  card4Label: varchar("card4Label", { length: 128 }),
  card4Image: text("card4Image"),
  card4Link: text("card4Link"),
  displayOrder: int("displayOrder").default(0).notNull(),
  active: tinyint("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CarouselSlide = typeof carouselSlides.$inferSelect;
export type InsertCarouselSlide = typeof carouselSlides.$inferInsert;
