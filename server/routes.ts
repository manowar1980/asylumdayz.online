import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, supportRequestSchema } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { z } from "zod";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper for admin check
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
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
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
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

  app.put(api.battlepass.updateLevel.path, requireAdmin, async (req, res) => {
    try {
      const level = api.battlepass.updateLevel.input.parse(req.body);
      const updated = await storage.updateBattlepassLevel(Number(req.params.id), level);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
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
