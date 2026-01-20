import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

export * from "./models/auth";

export const servers = sqliteTable("servers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  map: text("map").notNull(),
  description: text("description").notNull(),
  multiplier: text("multiplier").notNull(),
  features: text("features", { mode: "json" }).$type<string[]>(),
  connectionInfo: text("connection_info"),
});

export const battlepassConfig = sqliteTable("battlepass_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seasonName: text("season_name").notNull().default("Genesis"),
  daysLeft: integer("days_left").notNull().default(25),
  themeColor: text("theme_color").notNull().default("tech-blue"),
});

export const battlepassLevels = sqliteTable("battlepass_levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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

export const supportRequests = sqliteTable("support_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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

export const weeklyChallenges = sqliteTable("weekly_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull().default(100),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  targetCount: integer("target_count").notNull().default(1),
  challengeType: text("challenge_type").notNull().default("manual"),
});

export const userChallengeProgress = sqliteTable("user_challenge_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  discordId: text("discord_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  progress: integer("progress").notNull().default(0),
  claimed: integer("claimed", { mode: "boolean" }).notNull().default(false),
  weekStart: text("week_start").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertWeeklyChallengeSchema = createInsertSchema(weeklyChallenges);
export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress);

export type Server = typeof servers.$inferSelect;
export type BattlepassConfig = typeof battlepassConfig.$inferSelect;
export type BattlepassLevel = typeof battlepassLevels.$inferSelect;
export type SupportRequest = typeof supportRequests.$inferSelect;
export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
