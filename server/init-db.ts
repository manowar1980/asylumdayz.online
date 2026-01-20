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
  
  // Read and execute the migration
  const migrationPath = path.join(process.cwd(), "migrations", "0000_white_guardian.sql");
  const migration = fs.readFileSync(migrationPath, "utf-8");
  
  // Split by statement-breakpoint and execute each statement
  const statements = migration
    .split("--> statement-breakpoint")
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  for (const statement of statements) {
    sqlite.exec(statement);
  }
  
  sqlite.close();
  console.log("Database initialized successfully");
}
