import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export function initializeDatabase() {
  const dbPath = path.join(process.cwd(), "local.db");
  
  // If database already exists, we're good
  if (fs.existsSync(dbPath)) {
    return;
  }

  console.log("Initializing database...");
  
  const sqlite = new Database(dbPath);
  
  // Create all tables
  const statements = [
    `CREATE TABLE IF NOT EXISTS "battlepass_config" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "season_name" text DEFAULT 'Genesis' NOT NULL,
      "days_left" integer DEFAULT 25 NOT NULL,
      "theme_color" text DEFAULT 'tech-blue' NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "battlepass_levels" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "level" integer NOT NULL,
      "free_reward" text NOT NULL,
      "premium_reward" text NOT NULL,
      "image_url" text,
      "free_image_url" text,
      "premium_image_url" text
    )`,
    `CREATE TABLE IF NOT EXISTS "servers" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text NOT NULL,
      "map" text NOT NULL,
      "description" text NOT NULL,
      "multiplier" text NOT NULL,
      "features" text,
      "connection_info" text
    )`,
    `CREATE TABLE IF NOT EXISTS "support_requests" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text,
      "email" text,
      "discord_username" text,
      "category" text NOT NULL,
      "subject" text NOT NULL,
      "message" text NOT NULL,
      "status" text DEFAULT 'pending' NOT NULL,
      "created_at" text NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "user_challenge_progress" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "discord_id" text NOT NULL,
      "challenge_id" integer NOT NULL,
      "progress" integer DEFAULT 0 NOT NULL,
      "claimed" integer DEFAULT false NOT NULL,
      "week_start" text NOT NULL,
      "created_at" text NOT NULL,
      "updated_at" text NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" text PRIMARY KEY NOT NULL,
      "username" text NOT NULL,
      "email" text,
      "avatar" text,
      "is_admin" integer DEFAULT false NOT NULL,
      "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "weekly_challenges" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "title" text NOT NULL,
      "description" text NOT NULL,
      "xp_reward" integer DEFAULT 100 NOT NULL,
      "is_active" integer DEFAULT 1 NOT NULL,
      "target_count" integer DEFAULT 1 NOT NULL,
      "challenge_type" text DEFAULT 'manual' NOT NULL
    )`
  ];
  
  for (const statement of statements) {
    try {
      sqlite.exec(statement);
    } catch (error) {
      console.error("Error executing statement:", error);
    }
  }
  
  sqlite.close();
  console.log("Database initialized successfully");
}


