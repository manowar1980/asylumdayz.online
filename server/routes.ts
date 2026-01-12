import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, supportRequestSchema } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { z } from "zod";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import OpenAI from "openai";

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

  // Stripe Routes
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error getting Stripe publishable key:", error);
      res.status(500).json({ message: "Stripe not configured" });
    }
  });

  app.get("/api/battlepass/product", async (req, res) => {
    try {
      const result = await db.execute(
        sql`SELECT p.id, p.name, p.description, pr.id as price_id, pr.unit_amount, pr.currency 
            FROM stripe.products p 
            LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true 
            WHERE p.active = true AND p.metadata->>'type' = 'battlepass' 
            LIMIT 1`
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Battlepass product not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching battlepass product:", error);
      res.status(500).json({ message: "Failed to fetch battlepass product" });
    }
  });

  app.post("/api/checkout/battlepass", async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      
      const result = await db.execute(
        sql`SELECT pr.id as price_id FROM stripe.products p 
            JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true 
            WHERE p.active = true AND p.metadata->>'type' = 'battlepass' 
            LIMIT 1`
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Battlepass product not found" });
      }

      const priceId = result.rows[0].price_id as string;
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.get('host') || process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
      const baseUrl = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        success_url: `${baseUrl}/battlepass?success=true`,
        cancel_url: `${baseUrl}/battlepass?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Asylum AI Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ response: "Please provide a message." });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ response: "AI service not configured." });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const systemPrompt = `You are Asylum AI, a tactical assistant for the Asylum DayZ gaming community. You help players with:
- DayZ gameplay tips, survival strategies, and base building advice
- Information about Asylum DayZ servers (Livonia 101x and Chernarus 102x)
- Community rules and guidelines
- Technical support for server connection issues
- General gaming questions

Keep responses concise, tactical, and in-character as a military/survival AI assistant. Use tactical terminology when appropriate. Be helpful and friendly while maintaining the dark, survivalist theme of DayZ.`;

      const sanitizedHistory: { role: "user" | "assistant"; content: string }[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-10)) {
          if (item && typeof item === "object" && typeof item.content === "string") {
            const role = item.role === "user" ? "user" : "assistant";
            sanitizedHistory.push({ role, content: item.content.slice(0, 2000) });
          }
        }
      }

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...sanitizedHistory,
        { role: "user", content: message.slice(0, 2000) }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
