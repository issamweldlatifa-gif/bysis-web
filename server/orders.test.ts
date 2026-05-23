import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@example.com`,
      name: `User ${userId}`,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("orders router", () => {
  it("creates an order successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      customerName: "Test Customer",
      customerPhone: "123456789",
      customerEmail: "test@example.com",
      quantity: 2,
      productType: "t-shirt",
      productCategory: "clothing",
      sourcePrice: "5.00",
      calculatedPrice: "15.00",
      notes: "Test order",
    });

    expect(result).toHaveProperty("trackingCode");
    expect(result.status).toBe("new");
    expect(result.customerName).toBe("Test Customer");
  });

  it("lists orders for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an order first
    await caller.orders.create({
      customerName: "Test Customer",
      customerPhone: "123456789",
      customerEmail: "test@example.com",
      quantity: 1,
      productType: "shoes",
      productCategory: "footwear",
      sourcePrice: "10.00",
      calculatedPrice: "25.00",
    });

    // List orders
    const orders = await caller.orders.list();

    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
  });

  it("updates order status as admin", async () => {
    const ctx = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    // Create an order
    const order = await caller.orders.create({
      customerName: "Test Customer",
      customerPhone: "123456789",
      customerEmail: "test@example.com",
      quantity: 1,
      productType: "shoes",
      productCategory: "footwear",
      sourcePrice: "10.00",
      calculatedPrice: "25.00",
    });

    // Update status
    const updated = await caller.orders.updateStatus({
      id: order.id,
      status: "processing",
    });

    expect(updated.status).toBe("processing");
  });

  it("retrieves order by tracking code", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an order
    const order = await caller.orders.create({
      customerName: "Test Customer",
      customerPhone: "123456789",
      customerEmail: "test@example.com",
      quantity: 1,
      productType: "shoes",
      productCategory: "footwear",
      sourcePrice: "10.00",
      calculatedPrice: "25.00",
    });

    // Retrieve by tracking code
    const retrieved = await caller.orders.getByTrackingCode({
      trackingCode: order.trackingCode,
    });

    expect(retrieved).toBeDefined();
    expect(retrieved?.trackingCode).toBe(order.trackingCode);
  });
});

describe("calculator router", () => {
  it("calculates price based on product type", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calculator.calculatePrice({
      sourcePrice: "5.00",
      productType: "t-shirt",
      productCategory: "clothing",
      qualityLevel: "medium",
    });

    expect(result).toHaveProperty("calculatedPrice");
    expect(result).toHaveProperty("markup");
    expect(parseFloat(result.calculatedPrice)).toBeGreaterThan(5);
  });

  it("saves calculation to history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sessionId = "test-session-123";

    const result = await caller.calculator.calculatePrice({
      sourcePrice: "5.00",
      productType: "t-shirt",
      productCategory: "clothing",
      qualityLevel: "medium",
    });

    // Save to history
    await caller.calculator.saveCalculationHistory({
      sessionId,
      sourcePrice: "5.00",
      calculatedPrice: result.calculatedPrice,
      productType: "t-shirt",
      productCategory: "clothing",
    });

    // Retrieve history
    const history = await caller.calculator.getHistory({ sessionId });

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
  });
});

describe("arrivage router", () => {
  it("creates an arrivage item as admin", async () => {
    const ctx = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.arrivage.create({
      name: "Test Product",
      description: "Test Description",
      category: "clothing",
      price: "15.00",
      quantity: 10,
      available: 5,
    });

    expect(result).toHaveProperty("id");
    expect(result.name).toBe("Test Product");
  });

  it("lists all arrivage items", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.arrivage.listAll();

    expect(Array.isArray(items)).toBe(true);
  });
});
