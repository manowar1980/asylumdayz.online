import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import crypto from "crypto";
// @ts-ignore
import DiscordStrategyModule from "passport-discord";

const DiscordStrategy = DiscordStrategyModule.Strategy;

const pendingAuthTokens = new Map<string, { discordId: string; expiresAt: number }>();

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
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
      sameSite: "lax",
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
    console.warn("Discord OAuth not configured: missing DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET");
    
    app.get("/api/login", (req, res) => {
      res.status(503).json({ message: "Discord login not configured. Please add DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET." });
    });
    app.get("/api/logout", (req, res) => {
      req.logout(() => res.redirect("/"));
    });
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
      
      done(null, {
        id: user.id,
        discordId: profile.id,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar,
      });
    } catch (error) {
      done(error, null);
    }
  };

  app.get("/api/login", (req, res, next) => {
    const callbackURL = `https://${req.hostname}/api/callback`;
    const strategyName = `discord-${req.hostname}`;
    
    if (!(passport as any)._strategies[strategyName]) {
      passport.use(strategyName, new DiscordStrategy({
        clientID,
        clientSecret,
        callbackURL,
        scope: ["identify", "email"]
      }, verifyCallback));
    }
    
    passport.authenticate(strategyName)(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const strategyName = `discord-${req.hostname}`;
    passport.authenticate(strategyName, { failureRedirect: "/?auth=failed" })(req, res, () => {
      const user = req.user as any;
      
      if (user && user.discordId) {
        const token = crypto.randomBytes(32).toString("hex");
        pendingAuthTokens.set(token, {
          discordId: user.discordId,
          expiresAt: Date.now() + 60000
        });
        
        Array.from(pendingAuthTokens.entries()).forEach(([key, value]) => {
          if (value.expiresAt < Date.now()) {
            pendingAuthTokens.delete(key);
          }
        });
        
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
          }
          res.redirect(`/?authToken=${token}`);
        });
      } else {
        res.redirect("/?auth=failed");
      }
    });
  });

  app.post("/api/auth/exchange-token", async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }
    
    const pending = pendingAuthTokens.get(token);
    if (!pending) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    if (pending.expiresAt < Date.now()) {
      pendingAuthTokens.delete(token);
      return res.status(401).json({ message: "Token expired" });
    }
    
    pendingAuthTokens.delete(token);
    
    const user = await authStorage.getUser(pending.discordId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.login({
      id: user.id,
      discordId: user.discordId,
      username: user.discordUsername,
      email: user.email,
    }, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed" });
      }
      
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
        }
        res.json({ success: true, user });
      });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
