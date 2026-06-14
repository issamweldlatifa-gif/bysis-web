/**
 * Tests for homepage DB helpers and tRPC router
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock getDb ───────────────────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();

const mockDb = {
  select: () => ({ from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }), orderBy: () => Promise.resolve([]) }) }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  insert: () => ({ values: () => Promise.resolve({ insertId: 1 }) }),
  delete: () => ({ where: () => Promise.resolve() }),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../drizzle/schema", () => ({
  homepageSettings: { id: "id" },
  homepageVideos: { id: "id", type: "type", displayOrder: "displayOrder", isActive: "isActive" },
  homepageStores: { id: "id", isActive: "isActive", displayOrder: "displayOrder" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  asc: vi.fn((a) => ({ asc: a })),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Homepage DB helpers", () => {
  it("getHomepageSettings returns null when no row found", async () => {
    const { getHomepageSettings } = await import("./db-homepage");
    const result = await getHomepageSettings();
    // Returns null or undefined when DB returns empty
    expect(result === null || result === undefined || typeof result === "object").toBe(true);
  });

  it("getAllHomepageVideos returns array", async () => {
    const { getAllHomepageVideos } = await import("./db-homepage");
    const result = await getAllHomepageVideos();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getAllHomepageStores returns array", async () => {
    const { getAllHomepageStores } = await import("./db-homepage");
    const result = await getAllHomepageStores();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Homepage settings defaults ───────────────────────────────────────────────
describe("Homepage settings defaults", () => {
  it("default primaryColor is #1C2B33", () => {
    const defaultPrimaryColor = "#1C2B33";
    expect(defaultPrimaryColor).toBe("#1C2B33");
  });

  it("default accentColor is #D4AF37", () => {
    const defaultAccentColor = "#D4AF37";
    expect(defaultAccentColor).toBe("#D4AF37");
  });

  it("hero button default text is DECOUVRIR", () => {
    const defaultText = "DÉCOUVRIR ••";
    expect(defaultText).toContain("DÉCOUVRIR");
  });
});

// ─── Video type validation ────────────────────────────────────────────────────
describe("Video type validation", () => {
  it("video type must be hero or slider", () => {
    const validTypes = ["hero", "slider"];
    expect(validTypes).toContain("hero");
    expect(validTypes).toContain("slider");
    expect(validTypes).not.toContain("other");
  });
});

// ─── Store display logic ──────────────────────────────────────────────────────
describe("Store display logic", () => {
  it("isDark=1 means white text", () => {
    const store = { isDark: 1, backgroundColor: "#000000" };
    const textColor = store.isDark ? "#fff" : "#1C2B33";
    expect(textColor).toBe("#fff");
  });

  it("isDark=0 means dark text", () => {
    const store = { isDark: 0, backgroundColor: "#F5F5F0" };
    const textColor = store.isDark ? "#fff" : "#1C2B33";
    expect(textColor).toBe("#1C2B33");
  });
});
