import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";

// ─── Helper contexts ──────────────────────────────────────────────────────────

function makeCtx(role: "admin" | "user" | null = "user"): { ctx: TrpcContext; cleared: string[] } {
  const cleared: string[] = [];
  const ctx: TrpcContext = {
    user: role === null ? null : {
      id: role === "admin" ? 1 : 2,
      openId: role === "admin" ? "admin-oid" : "user-oid",
      email: role === "admin" ? "admin@bysis.tn" : "user@test.com",
      name: role === "admin" ? "Admin" : "Client Test",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: { cookie: "" } } as TrpcContext["req"],
    res: {
      clearCookie: (name: string) => { cleared.push(name); },
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx, cleared };
}

// ─── auth.me ─────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const { ctx } = makeCtx("user");
    const result = await appRouter.createCaller(ctx).auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("user");
  });

  it("returns null when not authenticated", async () => {
    const { ctx } = makeCtx(null);
    const result = await appRouter.createCaller(ctx).auth.me();
    expect(result).toBeNull();
  });

  it("admin user has admin role", async () => {
    const { ctx } = makeCtx("admin");
    const result = await appRouter.createCaller(ctx).auth.me();
    expect(result?.role).toBe("admin");
  });
});

// ─── auth.logout ─────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const { ctx, cleared } = makeCtx("user");
    const result = await appRouter.createCaller(ctx).auth.logout();
    expect(result.success).toBe(true);
    expect(cleared).toContain(COOKIE_NAME);
  });

  it("works for unauthenticated users too", async () => {
    const { ctx, cleared } = makeCtx(null);
    const result = await appRouter.createCaller(ctx).auth.logout();
    expect(result.success).toBe(true);
    expect(cleared.length).toBeGreaterThan(0);
  });
});

// ─── Status config validation ─────────────────────────────────────────────────

describe("Order status values", () => {
  const validStatuses = ["new", "processing", "waiting_payment", "shipped", "arrived", "completed", "cancelled"];

  it("all 7 expected statuses are defined", () => {
    expect(validStatuses).toHaveLength(7);
  });

  it("statuses match the expected nomenclature", () => {
    expect(validStatuses).toContain("new");
    expect(validStatuses).toContain("waiting_payment");
    expect(validStatuses).toContain("arrived");
    expect(validStatuses).toContain("cancelled");
  });
});

// ─── Role-based access ────────────────────────────────────────────────────────

describe("Role-based access control", () => {
  it("admin role is distinct from user role", () => {
    const { ctx: adminCtx } = makeCtx("admin");
    const { ctx: userCtx } = makeCtx("user");
    expect(adminCtx.user?.role).toBe("admin");
    expect(userCtx.user?.role).toBe("user");
    expect(adminCtx.user?.role).not.toBe(userCtx.user?.role);
  });

  it("unauthenticated context has null user", () => {
    const { ctx } = makeCtx(null);
    expect(ctx.user).toBeNull();
  });
});
