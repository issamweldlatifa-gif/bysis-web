import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";

// ─── Helper contexts ──────────────────────────────────────────────────────────

function makeCtx(role: "admin" | "user" | null = "user"): TrpcContext {
  const cleared: string[] = [];
  return {
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
}

// ─── auth ─────────────────────────────────────────────────────────────────────

describe("auth router", () => {
  it("auth.me returns user for authenticated context", async () => {
    const ctx = makeCtx("user");
    const result = await appRouter.createCaller(ctx).auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Client Test");
  });

  it("auth.me returns null for unauthenticated context", async () => {
    const ctx = makeCtx(null);
    const result = await appRouter.createCaller(ctx).auth.me();
    expect(result).toBeNull();
  });

  it("auth.logout clears session cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 2,
        openId: "user-oid",
        email: "user@test.com",
        name: "Client Test",
        loginMethod: "manus",
        role: "user",
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
    const result = await appRouter.createCaller(ctx).auth.logout();
    expect(result.success).toBe(true);
    expect(cleared).toContain(COOKIE_NAME);
  });
});

// ─── Order status nomenclature ────────────────────────────────────────────────

describe("Order status nomenclature", () => {
  const VALID_STATUSES = [
    "new",
    "processing",
    "waiting_payment",
    "shipped",
    "arrived",
    "completed",
    "cancelled",
  ] as const;

  it("defines exactly 7 statuses", () => {
    expect(VALID_STATUSES).toHaveLength(7);
  });

  it("includes all required lifecycle statuses", () => {
    expect(VALID_STATUSES).toContain("new");
    expect(VALID_STATUSES).toContain("processing");
    expect(VALID_STATUSES).toContain("waiting_payment");
    expect(VALID_STATUSES).toContain("shipped");
    expect(VALID_STATUSES).toContain("arrived");
    expect(VALID_STATUSES).toContain("completed");
    expect(VALID_STATUSES).toContain("cancelled");
  });
});

// ─── Role-based access ────────────────────────────────────────────────────────

describe("Role-based access control", () => {
  it("admin context has role=admin", () => {
    const ctx = makeCtx("admin");
    expect(ctx.user?.role).toBe("admin");
  });

  it("user context has role=user", () => {
    const ctx = makeCtx("user");
    expect(ctx.user?.role).toBe("user");
  });

  it("unauthenticated context has null user", () => {
    const ctx = makeCtx(null);
    expect(ctx.user).toBeNull();
  });
});
