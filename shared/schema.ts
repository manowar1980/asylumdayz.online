import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export * from "./models/auth";

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  map: text("map").notNull(),
  description: text("description").notNull(),
  multiplier: text("multiplier").notNull(),
  features: text("features").array(),
  connectionInfo: text("connection_info"),
});

export const battlepassConfig = pgTable("battlepass_config", {
  id: serial("id").primaryKey(),
  seasonName: text("season_name").notNull().default("Genesis"),
  daysLeft: integer("days_left").notNull().default(25),
  themeColor: text("theme_color").notNull().default("tech-blue"),
});

export const battlepassLevels = pgTable("battlepass_levels", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(),
  freeReward: text("free_reward").notNull(),
  premiumReward: text("premium_reward").notNull(),
  imageUrl: text("image_url"),
  freeImageUrl: text("free_image_url"),
  premiumImageUrl: text("premium_image_url"),
});

export const insertServerSchema = createInsertSchema(servers);
export const insertBattlepassConfigSchema = createInsertSchema(battlepassConfig);
export const insertBattlepassLevelSchema = createInsertSchema(battlepassLevels);

export const supportRequests = pgTable("support_requests", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  discordUsername: text("discord_username"),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

export const insertSupportRequestSchema = createInsertSchema(supportRequests);

export const weeklyChallenges = pgTable("weekly_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertWeeklyChallengeSchema = createInsertSchema(weeklyChallenges);

export type Server = typeof servers.$inferSelect;
export type BattlepassConfig = typeof battlepassConfig.$inferSelect;
export type BattlepassLevel = typeof battlepassLevels.$inferSelect;
export type SupportRequest = typeof supportRequests.$inferSelect;
export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
