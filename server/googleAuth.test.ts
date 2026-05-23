import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock ENV to simulate Google OAuth configured
vi.mock("./_core/env", () => ({
  ENV: {
    googleClientId: "test-client-id",
    googleClientSecret: "test-client-secret",
    appId: "test-app-id",
    isProduction: false,
    cookieSecret: "test-secret-at-least-32-chars-long!!",
    googleRedirectUri: "https://bysisecom-qchtqpc8.manus.space/api/auth/google/callback",
  },
}));

// Mock db module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

// Mock sdk
vi.mock("./_core/sdk", () => ({
  sdk: {
    signSession: vi.fn().mockResolvedValue("mock-session-token"),
  },
}));

// Mock cookies
vi.mock("./_core/cookies", () => ({
  getSessionCookieOptions: vi.fn().mockReturnValue({
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: false,
  }),
}));

// Mock shared/const
vi.mock("../shared/const", () => ({
  COOKIE_NAME: "manus_session",
  AXIOS_TIMEOUT_MS: 5000,
  ONE_YEAR_MS: 31536000000,
}));

import express from "express";
import request from "supertest";
import { registerGoogleAuthRoutes } from "./googleAuth";

describe("Google OAuth Routes", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    registerGoogleAuthRoutes(app);
  });

  it("GET /api/auth/google redirects to Google OAuth URL", async () => {
    const res = await request(app).get("/api/auth/google").redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("accounts.google.com/o/oauth2/v2/auth");
    expect(res.headers.location).toContain("client_id=test-client-id");
    expect(res.headers.location).toContain("scope=openid+email+profile");
    // Verify redirect_uri uses the env var (not dynamic host)
    expect(res.headers.location).toContain(encodeURIComponent("https://bysisecom-qchtqpc8.manus.space/api/auth/google/callback"));
  });

  it("GET /api/auth/google includes returnTo in state", async () => {
    const res = await request(app)
      .get("/api/auth/google?returnTo=/order")
      .redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("state=");
    // state should be encoded returnTo path
    const url = new URL(res.headers.location);
    const state = decodeURIComponent(url.searchParams.get("state") || "");
    expect(state).toBe("/order");
  });

  it("GET /api/auth/google/callback with error redirects to home with error", async () => {
    const res = await request(app)
      .get("/api/auth/google/callback?error=access_denied")
      .redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("auth_error=google_failed");
  });

  it("GET /api/auth/google/callback without code redirects with error", async () => {
    const res = await request(app)
      .get("/api/auth/google/callback")
      .redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("auth_error=google_failed");
  });
});
