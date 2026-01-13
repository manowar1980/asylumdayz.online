import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
// @ts-ignore
import DiscordStrategyModule from "passport-discord";

const DiscordStrategy = DiscordStrategyModule.Strategy;

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

  // Always set up serialize/deserialize even if Discord OAuth isn't configured
  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  const clientID = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.warn("Discord OAuth not configured: missing DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET");
    
    // Fallback routes when Discord is not configured
    app.get("/api/login", (req, res) => {
      res.status(503).json({ message: "Discord login not configured. Please add DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET." });
    });
    app.get("/api/logout", (req, res) => {
      req.logout(() => res.redirect("/"));
    });
    return;
  }

  // Use dynamic callback URL based on request hostname
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

  // Register strategy per-request to use dynamic callback URL
  app.get("/api/login", (req, res, next) => {
    const callbackURL = `https://${req.hostname}/api/callback`;
    const strategyName = `discord-${req.hostname}`;
    
    // Register strategy if not already registered
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
    passport.authenticate(strategyName, { failureRedirect: "/" })(req, res, () => {
      // Ensure session is saved before redirect (fixes mobile browsers)
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
        res.redirect("/");
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
