import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getRedirectUri(req: Request): string {
  const proto = ENV.isProduction ? "https" : req.protocol;
  const host = req.get("host") || "localhost:3000";
  return `${proto}://${host}/api/auth/google/callback`;
}

export function registerGoogleAuthRoutes(app: Express) {
  // Step 1: Redirect to Google
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      return res.status(500).json({ error: "Google OAuth not configured" });
    }

    const redirectUri = getRedirectUri(req);
    const returnTo = (req.query.returnTo as string) || "/";

    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: encodeURIComponent(returnTo),
      access_type: "offline",
      prompt: "select_account",
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  });

  // Step 2: Handle Google callback
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    if (error || !code) {
      console.error("[Google OAuth] Error:", error);
      return res.redirect("/?auth_error=google_failed");
    }

    try {
      const redirectUri = getRedirectUri(req);

      // Exchange code for tokens
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("[Google OAuth] Token exchange failed:", errText);
        return res.redirect("/?auth_error=token_failed");
      }

      const tokenData = (await tokenRes.json()) as { access_token: string };

      // Get user info from Google
      const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        return res.redirect("/?auth_error=userinfo_failed");
      }

      const googleUser = (await userInfoRes.json()) as {
        id: string;
        email: string;
        name: string;
        picture: string;
      };

      const openId = `google_${googleUser.id}`;

      // Upsert user in database
      const db = await getDb();
      if (!db) {
        return res.redirect("/?auth_error=db_unavailable");
      }

      await db
        .insert(users)
        .values({
          openId,
          name: googleUser.name,
          email: googleUser.email,
          loginMethod: "google",
          avatarUrl: googleUser.picture,
          lastSignedIn: new Date(),
        })
        .onDuplicateKeyUpdate({
          set: {
            name: googleUser.name,
            email: googleUser.email,
            avatarUrl: googleUser.picture,
            lastSignedIn: new Date(),
          },
        });

      // Get user from DB
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);

      if (!dbUser) {
        return res.redirect("/?auth_error=user_not_found");
      }

      // Check if user is banned
      if (dbUser.accountStatus === "banned") {
        return res.redirect("/?auth_error=account_banned");
      }

      // Create session token using Manus SDK format (openId + appId + name)
      const sessionToken = await sdk.signSession({
        openId,
        appId: ENV.appId || "bysis",
        name: googleUser.name || googleUser.email || "User",
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

      // Redirect back to original page
      const returnTo = state ? decodeURIComponent(state as string) : "/";
      res.redirect(returnTo);
    } catch (err) {
      console.error("[Google OAuth] Unexpected error:", err);
      res.redirect("/?auth_error=unexpected");
    }
  });
}
