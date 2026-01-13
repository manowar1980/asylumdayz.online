import { db } from "./db";
import {
  servers,
  battlepassConfig,
  battlepassLevels,
  supportRequests,
  weeklyChallenges,
  type Server,
  type BattlepassConfig,
  type BattlepassLevel,
  type SupportRequest,
  type WeeklyChallenge,
  users
} from "@shared/schema";
import { eq, asc, desc } from "drizzle-orm";

export interface IStorage {
  // Servers
  getServers(): Promise<Server[]>;
  createServer(server: typeof servers.$inferInsert): Promise<Server>;

  // Battlepass
  getBattlepassConfig(): Promise<BattlepassConfig>;
  updateBattlepassConfig(config: Partial<typeof battlepassConfig.$inferInsert>): Promise<BattlepassConfig>;
  
  getBattlepassLevels(): Promise<BattlepassLevel[]>;
  getBattlepassLevel(id: number): Promise<BattlepassLevel | undefined>;
  createBattlepassLevel(level: typeof battlepassLevels.$inferInsert): Promise<BattlepassLevel>;
  updateBattlepassLevel(id: number, level: Partial<typeof battlepassLevels.$inferInsert>): Promise<BattlepassLevel>;
  
  // Support
  getSupportRequests(): Promise<SupportRequest[]>;
  createSupportRequest(request: typeof supportRequests.$inferInsert): Promise<SupportRequest>;
  updateSupportRequestStatus(id: number, status: string): Promise<SupportRequest>;
  
  // User (Admin check)
  getUser(id: string): Promise<typeof users.$inferSelect | undefined>;
  
  // Weekly Challenges
  getWeeklyChallenges(): Promise<WeeklyChallenge[]>;
  createWeeklyChallenge(challenge: typeof weeklyChallenges.$inferInsert): Promise<WeeklyChallenge>;
  updateWeeklyChallenge(id: number, challenge: Partial<typeof weeklyChallenges.$inferInsert>): Promise<WeeklyChallenge>;
  deleteWeeklyChallenge(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Servers
  async getServers(): Promise<Server[]> {
    return await db.select().from(servers);
  }

  async createServer(server: typeof servers.$inferInsert): Promise<Server> {
    const [newServer] = await db.insert(servers).values(server).returning();
    return newServer;
  }

  // Battlepass
  async getBattlepassConfig(): Promise<BattlepassConfig> {
    const [config] = await db.select().from(battlepassConfig).limit(1);
    if (!config) {
      const [newConfig] = await db.insert(battlepassConfig).values({}).returning();
      return newConfig;
    }
    return config;
  }

  async updateBattlepassConfig(config: Partial<typeof battlepassConfig.$inferInsert>): Promise<BattlepassConfig> {
    const existing = await this.getBattlepassConfig();
    const [updated] = await db
      .update(battlepassConfig)
      .set(config)
      .where(eq(battlepassConfig.id, existing.id))
      .returning();
    return updated;
  }

  async getBattlepassLevels(): Promise<BattlepassLevel[]> {
    return await db.select().from(battlepassLevels).orderBy(asc(battlepassLevels.level));
  }

  async getBattlepassLevel(id: number): Promise<BattlepassLevel | undefined> {
    const [level] = await db.select().from(battlepassLevels).where(eq(battlepassLevels.id, id));
    return level;
  }

  async createBattlepassLevel(level: typeof battlepassLevels.$inferInsert): Promise<BattlepassLevel> {
    const [newLevel] = await db.insert(battlepassLevels).values(level).returning();
    return newLevel;
  }

  async updateBattlepassLevel(id: number, level: Partial<typeof battlepassLevels.$inferInsert>): Promise<BattlepassLevel> {
    const [updated] = await db
      .update(battlepassLevels)
      .set(level)
      .where(eq(battlepassLevels.id, id))
      .returning();
    return updated;
  }

  // Support
  async getSupportRequests(): Promise<SupportRequest[]> {
    return await db.select().from(supportRequests).orderBy(desc(supportRequests.id));
  }

  async createSupportRequest(request: typeof supportRequests.$inferInsert): Promise<SupportRequest> {
    const [newRequest] = await db.insert(supportRequests).values(request).returning();
    return newRequest;
  }

  async updateSupportRequestStatus(id: number, status: string): Promise<SupportRequest> {
    const [updated] = await db
      .update(supportRequests)
      .set({ status })
      .where(eq(supportRequests.id, id))
      .returning();
    return updated;
  }

  async getUser(id: string): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // Weekly Challenges
  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    return await db.select().from(weeklyChallenges).orderBy(asc(weeklyChallenges.id));
  }

  async createWeeklyChallenge(challenge: typeof weeklyChallenges.$inferInsert): Promise<WeeklyChallenge> {
    const [newChallenge] = await db.insert(weeklyChallenges).values(challenge).returning();
    return newChallenge;
  }

  async updateWeeklyChallenge(id: number, challenge: Partial<typeof weeklyChallenges.$inferInsert>): Promise<WeeklyChallenge> {
    const [updated] = await db
      .update(weeklyChallenges)
      .set(challenge)
      .where(eq(weeklyChallenges.id, id))
      .returning();
    return updated;
  }

  async deleteWeeklyChallenge(id: number): Promise<void> {
    await db.delete(weeklyChallenges).where(eq(weeklyChallenges.id, id));
  }
}

export const storage = new DatabaseStorage();
