import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, supportRequestSchema } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper for admin check
  const requireAdmin = async (req: any, res: any, next: any) => {
    // Check for secret code bypass in header (for easier admin access)
    const authHeader = req.headers["x-admin-code"];
    
    if (authHeader === "1327") {
      return next();
    }

    if (!req.isAuthenticated()) {
      console.log("Admin access denied: Not authenticated");
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userProfile = req.user as any;
    const userId = userProfile.claims?.sub || userProfile.id;
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // Servers
  app.get(api.servers.list.path, async (req, res) => {
    const servers = await storage.getServers();
    res.json(servers);
  });

  // Battlepass
  app.get(api.battlepass.getConfig.path, async (req, res) => {
    const config = await storage.getBattlepassConfig();
    res.json(config);
  });

  app.patch(api.battlepass.updateConfig.path, requireAdmin, async (req, res) => {
    try {
      const config = api.battlepass.updateConfig.input.parse(req.body);
      const updated = await storage.updateBattlepassConfig(config);
      res.json(updated);
    } catch (e: any) {
      console.error("Error updating battlepass config:", e);
      res.status(400).json({ message: e.message || "Invalid input" });
    }
  });

  app.get(api.battlepass.listLevels.path, async (req, res) => {
    const levels = await storage.getBattlepassLevels();
    res.json(levels);
  });

  app.post(api.battlepass.createLevel.path, requireAdmin, async (req, res) => {
    try {
      const level = api.battlepass.createLevel.input.parse(req.body);
      const created = await storage.createBattlepassLevel(level);
      res.status(201).json(created);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.battlepass.updateLevel.path, requireAdmin, async (req, res) => {
    try {
      const level = api.battlepass.updateLevel.input.parse(req.body);
      const updated = await storage.updateBattlepassLevel(Number(req.params.id), level);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e: any) {
      console.error("Error updating battlepass level:", e);
      res.status(400).json({ message: e.message || "Invalid input" });
    }
  });

  // Support - Submit new request (public)
  app.post(api.support.submit.path, async (req, res) => {
    try {
      const data = supportRequestSchema.parse(req.body);
      
      await storage.createSupportRequest({
        name: data.name || null,
        email: data.email || null,
        discordUsername: data.discordUsername || null,
        category: data.category,
        subject: data.subject,
        message: data.message,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      
      res.json({ 
        success: true, 
        message: "Support request submitted successfully" 
      });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Battlepass image upload
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueName = `bp-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
  
  const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|gif|webp/;
      const ext = allowed.test(path.extname(file.originalname).toLowerCase());
      const mime = allowed.test(file.mimetype);
      cb(null, ext && mime);
    }
  });

  app.post("/api/upload/battlepass-image", requireAdmin, imageUpload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Secret Admin Access
  app.post("/api/admin/verify-code", async (req, res) => {
    const { code } = req.body;
    const adminCode = "1327";
    
    // Using a more robust comparison to handle hidden characters or formatting
    const normalizedInput = String(code || "").trim();
    const normalizedSecret = adminCode;
    
    if (normalizedInput && normalizedSecret && normalizedInput === normalizedSecret) {
      // If user is logged in, we can promote them to admin for this session
      if (req.isAuthenticated()) {
        const userProfile = req.user as any;
        const userId = userProfile.claims?.sub || userProfile.id;
        const user = await storage.getUser(userId);
        if (user && !user.isAdmin) {
          // This is a temporary elevation or we could make it permanent
          // For owner convenience, let's make it permanent if they have the code
          await db.update(users).set({ isAdmin: true }).where(eq(users.id, userId));
        }
      }
      return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: "Invalid code" });
  });

  // Support - List all requests (admin only)
  app.get(api.support.list.path, requireAdmin, async (req, res) => {
    const requests = await storage.getSupportRequests();
    res.json(requests);
  });

  // Support - Update status (admin only)
  app.patch(api.support.updateStatus.path, requireAdmin, async (req, res) => {
    try {
      const { status } = api.support.updateStatus.input.parse(req.body);
      const updated = await storage.updateSupportRequestStatus(Number(req.params.id), status);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Asylum AI Chat with image support
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
  });

  app.post("/api/chat", upload.single("image"), async (req, res) => {
    try {
      const message = req.body.message;
      let history = req.body.history;
      
      if (typeof history === "string") {
        try {
          history = JSON.parse(history);
        } catch {
          history = [];
        }
      }
      
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ response: "Please provide a message." });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ response: "AI service not configured." });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const systemPrompt = `You are an AI helper for a DayZ server on PS4/PS5. Keep responses short and natural - sound human, not robotic. Avoid overly formal phrases like "Respectfully" and don't keep repeating the server name.

SERVER NAMES:
101x | ASYLUM™ | PvPvE | Full cars | Economy
102x | ASYLUM™ | PvPvE | Full cars | Economy

RAIDING RULES:
- Raiding during weekdays is strictly prohibited. Weekdays are for gathering, building, and general gameplay.
- Raids only occur on weekends to maintain server balance and fairness.
- Raiding hours: 5:00 PM EST to 1:00 AM EST only.

GENERAL RULES:
- Crates are not allowed - they despawn after every reset.
- No griefing: no blowing up tents/storage, no blocking entrances with tents/cars, no spamming traps (landmines/beartraps).

BASE MAINTENANCE:
- For containers and tents: take an object out, wait 10 seconds, put it back.
- For walls: put a camo net on, leave 5 seconds, remove it.
- Flags automatically refresh structures, but every 10 days you must remove and reattach the flag to refresh it. This prevents lag and keeps the base system healthy. Unattended bases despawn automatically.

HOW TO SHOP (in Discord):
1. Go to 🛒┆shop-commands
2. Use /shop list items (click the popup)
3. Type the exact item name, provide coordinates and payment method
4. If items don't spawn, make a support ticket

TRADING RULES (in #🔂┆trading):
- No scams - if scammed, open a ticket in #🎫┆support
- No real money trades
- No KOS while trading
- No fake trades or wasting members' time

CUSTOM NPCs:
- Default (no explosives): 35k
- Upgraded (explosives + unreleased items): 50k
- To buy: make a shop ticket in Discord. After paying the creation fee, you pay spawn fees like any other NPC.

CUSTOM BASES (monthly):
- Medium Castle Base: 30,000
- Large Castle Base: 50,000
- Extras: Water Pump 5k, Greenhouse 5k, VIP Entrance 10k

FACTIONS:
- Creation: 10k
- Rename existing: 3k
- Cancellation: 1k

If the user sends an image, analyze it and respond helpfully. For DayZ-related images (maps, bases, gear, gameplay), provide tactical advice.`;

      const sanitizedHistory: { role: "user" | "assistant"; content: string }[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-10)) {
          if (item && typeof item === "object" && typeof item.content === "string") {
            const role = item.role === "user" ? "user" : "assistant";
            sanitizedHistory.push({ role, content: item.content.slice(0, 2000) });
          }
        }
      }

      let userContent: any;
      
      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype || "image/jpeg";
        userContent = [
          { type: "text", text: message.slice(0, 2000) },
          { 
            type: "image_url", 
            image_url: { 
              url: `data:${mimeType};base64,${base64Image}`,
              detail: "low"
            } 
          }
        ];
      } else {
        userContent = message.slice(0, 2000);
      }

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...sanitizedHistory,
        { role: "user", content: userContent }
      ];

      const completion = await openai.chat.completions.create({
        model: req.file ? "gpt-4o" : "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "No response generated.";
      res.json({ response });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ response: "Sorry, I encountered an error. Please try again." });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const servers = await storage.getServers();
  if (servers.length === 0) {
    await storage.createServer({
      name: "Livonia 101x | ASYLUM™",
      map: "Livonia",
      description: "High loot, full cars, PvPvE experience in Livonia.",
      multiplier: "101x",
      features: ["PvPvE", "Full cars", "Economy"],
      connectionInfo: "127.0.0.1:2302"
    });
    await storage.createServer({
      name: "Chernarus 102x | ASYLUM™",
      map: "Chernarus",
      description: "Extreme survival with boosted economy.",
      multiplier: "102x",
      features: ["PvPvE", "Full cars", "Economy"],
      connectionInfo: "127.0.0.1:2302"
    });
  }

  const levels = await storage.getBattlepassLevels();
  if (levels.length === 0) {
    for (let i = 1; i <= 50; i++) {
      await storage.createBattlepassLevel({
        level: i,
        freeReward: `Level ${i} Scrap`,
        premiumReward: `Level ${i} Tactical Gear`,
        imageUrl: null
      });
    }
  }
}
