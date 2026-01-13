import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import crypto from "crypto";
// @ts-ignore
import DiscordStrategyModule from "passport-discord";

const DiscordStrategy = DiscordStrategyModule.Strategy;

// Long-lived auth tokens stored in DB-like structure (in production, use Redis or DB)
const authTokens = new Map<string, { discordId: string; expiresAt: number }>();

function generateAuthToken(discordId: string): string {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 1 week
  authTokens.set(token, { discordId, expiresAt });
  return token;
}

function validateAuthToken(token: string): string | null {
  const data = authTokens.get(token);
  if (!data) return null;
  if (data.expiresAt < Date.now()) {
    authTokens.delete(token);
    return null;
  }
  return data.discordId;
}

function revokeAuthToken(token: string): void {
  authTokens.delete(token);
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      maxAge: sessionTtl,
    },
  });
}

export async function setupDiscordAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  const clientID = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.warn("Discord OAuth not configured");
    app.get("/api/login", (req, res) => {
      res.status(503).json({ message: "Discord login not configured." });
    });
    app.get("/api/logout", (req, res) => res.redirect("/"));
    return;
  }

  const verifyCallback = async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const user = await authStorage.upsertUser({
        id: profile.id,
        email: profile.email || null,
        firstName: profile.username,
        lastName: null,
        profileImageUrl: profile.avatar 
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : null,
        discordId: profile.id,
        discordUsername: profile.username,
      });
      done(null, { ...user, discordId: profile.id });
    } catch (error) {
      done(error, null);
    }
  };

  let baseUrl: string | null = null;
  
  app.get("/api/login", (req, res, next) => {
    if (!baseUrl) {
      baseUrl = `https://${req.hostname}`;
    }
    const callbackURL = `${baseUrl}/api/callback`;
    
    if (!(passport as any)._strategies["discord"]) {
      passport.use("discord", new DiscordStrategy({
        clientID,
        clientSecret,
        callbackURL,
        scope: ["identify", "email"]
      }, verifyCallback));
    }
    
    passport.authenticate("discord")(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate("discord", { failureRedirect: "/?auth=failed" })(req, res, () => {
      const user = req.user as any;
      
      if (user && user.discordId) {
        // Generate long-lived token for localStorage auth
        const token = generateAuthToken(user.discordId);
        
        // Also try to establish session (works on desktop)
        req.login(user, (err) => {
          if (err) console.error("Session login error:", err);
          req.session.save(() => {
            // Redirect with token - frontend will store in localStorage
            res.redirect(`/?authToken=${token}`);
          });
        });
      } else {
        res.redirect("/?auth=failed");
      }
    });
  });

  // Token-based user endpoint - checks both session AND Authorization header
  app.get("/api/auth/user", async (req, res) => {
    // First check session (works on desktop)
    if (req.isAuthenticated() && req.user) {
      const sessionUser = req.user as any;
      const user = await authStorage.getUser(sessionUser.discordId);
      if (user) {
        return res.json(user);
      }
    }
    
    // Then check Authorization header (works on mobile)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const discordId = validateAuthToken(token);
      if (discordId) {
        const user = await authStorage.getUser(discordId);
        if (user) {
          return res.json(user);
        }
      }
    }
    
    return res.status(401).json({ message: "Unauthorized" });
  });

  app.get("/api/logout", (req, res) => {
    // Revoke token if provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      revokeAuthToken(authHeader.substring(7));
    }
    
    req.logout(() => {
      res.redirect("/");
    });
  });

  app.post("/api/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      revokeAuthToken(authHeader.substring(7));
    }
    req.logout(() => {
      res.json({ success: true });
    });
  });
}

// Updated middleware that checks both session and token
export const isAuthenticated: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  // Check session first
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const discordId = validateAuthToken(token);
    if (discordId) {
      const user = await authStorage.getUser(discordId);
      if (user) {
        (req as any).user = user;
        return next();
      }
    }
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};
