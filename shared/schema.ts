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
});

export const insertServerSchema = createInsertSchema(servers);
export const insertBattlepassConfigSchema = createInsertSchema(battlepassConfig);
export const insertBattlepassLevelSchema = createInsertSchema(battlepassLevels);

export type Server = typeof servers.$inferSelect;
export type BattlepassConfig = typeof battlepassConfig.$inferSelect;
export type BattlepassLevel = typeof battlepassLevels.$inferSelect;
