import { db } from "./db";
import {
  servers,
  battlepassConfig,
  battlepassLevels,
  supportRequests,
  weeklyChallenges,
  userChallengeProgress,
  type Server,
  type BattlepassConfig,
  type BattlepassLevel,
  type SupportRequest,
  type WeeklyChallenge,
  type UserChallengeProgress,
  users
} from "@shared/schema";
import { eq, asc, desc, and } from "drizzle-orm";

// Helper to get last inserted row id (SQLite-specific)
async function getLastInsertedId(table: any, idField: any) {
  const result = await db.select().from(table).orderBy(desc(idField)).limit(1);
  return result[0];
}

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
  
  // User Challenge Progress
  getUserChallengeProgress(discordId: string, weekStart: string): Promise<UserChallengeProgress[]>;
  getOrCreateUserChallengeProgress(discordId: string, challengeId: number, weekStart: string): Promise<UserChallengeProgress>;
  updateUserChallengeProgress(id: number, data: Partial<typeof userChallengeProgress.$inferInsert>): Promise<UserChallengeProgress>;
  claimChallengeReward(discordId: string, challengeId: number, weekStart: string): Promise<UserChallengeProgress>;
  getAllUserProgress(weekStart: string): Promise<UserChallengeProgress[]>;
}

export class DatabaseStorage implements IStorage {
  // Servers
  async getServers(): Promise<Server[]> {
    return await db.select().from(servers);
  }

  async createServer(server: typeof servers.$inferInsert): Promise<Server> {
    await db.insert(servers).values(server);
    return await getLastInsertedId(servers, servers.id);
  }

  // Battlepass
  async getBattlepassConfig(): Promise<BattlepassConfig> {
    const [config] = await db.select().from(battlepassConfig).limit(1);
    if (!config) {
      await db.insert(battlepassConfig).values({});
      return await getLastInsertedId(battlepassConfig, battlepassConfig.id);
    }
    return config;
  }

  async updateBattlepassConfig(config: Partial<typeof battlepassConfig.$inferInsert>): Promise<BattlepassConfig> {
    const existing = await this.getBattlepassConfig();
    await db
      .update(battlepassConfig)
      .set(config)
      .where(eq(battlepassConfig.id, existing.id));
    const [updated] = await db.select().from(battlepassConfig).where(eq(battlepassConfig.id, existing.id));
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
    await db.insert(battlepassLevels).values(level);
    return await getLastInsertedId(battlepassLevels, battlepassLevels.id);
  }

  async updateBattlepassLevel(id: number, level: Partial<typeof battlepassLevels.$inferInsert>): Promise<BattlepassLevel> {
    await db
      .update(battlepassLevels)
      .set(level)
      .where(eq(battlepassLevels.id, id));
    const [updated] = await db.select().from(battlepassLevels).where(eq(battlepassLevels.id, id));
    return updated;
  }

  // Support
  async getSupportRequests(): Promise<SupportRequest[]> {
    return await db.select().from(supportRequests).orderBy(desc(supportRequests.id));
  }

  async createSupportRequest(request: typeof supportRequests.$inferInsert): Promise<SupportRequest> {
    await db.insert(supportRequests).values(request);
    return await getLastInsertedId(supportRequests, supportRequests.id);
  }

  async updateSupportRequestStatus(id: number, status: string): Promise<SupportRequest> {
    await db
      .update(supportRequests)
      .set({ status })
      .where(eq(supportRequests.id, id));
    const [updated] = await db.select().from(supportRequests).where(eq(supportRequests.id, id));
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
    await db.insert(weeklyChallenges).values(challenge);
    return await getLastInsertedId(weeklyChallenges, weeklyChallenges.id);
  }

  async updateWeeklyChallenge(id: number, challenge: Partial<typeof weeklyChallenges.$inferInsert>): Promise<WeeklyChallenge> {
    await db
      .update(weeklyChallenges)
      .set(challenge)
      .where(eq(weeklyChallenges.id, id));
    const [updated] = await db.select().from(weeklyChallenges).where(eq(weeklyChallenges.id, id));
    return updated;
  }

  async deleteWeeklyChallenge(id: number): Promise<void> {
    await db.delete(weeklyChallenges).where(eq(weeklyChallenges.id, id));
  }

  // User Challenge Progress
  async getUserChallengeProgress(discordId: string, weekStart: string): Promise<UserChallengeProgress[]> {
    return await db.select().from(userChallengeProgress)
      .where(and(
        eq(userChallengeProgress.discordId, discordId),
        eq(userChallengeProgress.weekStart, weekStart)
      ));
  }

  async getOrCreateUserChallengeProgress(discordId: string, challengeId: number, weekStart: string): Promise<UserChallengeProgress> {
    const [existing] = await db.select().from(userChallengeProgress)
      .where(and(
        eq(userChallengeProgress.discordId, discordId),
        eq(userChallengeProgress.challengeId, challengeId),
        eq(userChallengeProgress.weekStart, weekStart)
      ));
    
    if (existing) return existing;
    
    const now = new Date().toISOString();
    await db.insert(userChallengeProgress).values({
      discordId,
      challengeId,
      progress: 0,
      claimed: false,
      weekStart,
      createdAt: now,
      updatedAt: now
    });
    return await getLastInsertedId(userChallengeProgress, userChallengeProgress.id);
  }

  async updateUserChallengeProgress(id: number, data: Partial<typeof userChallengeProgress.$inferInsert>): Promise<UserChallengeProgress> {
    await db.update(userChallengeProgress)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(userChallengeProgress.id, id));
    const [updated] = await db.select().from(userChallengeProgress).where(eq(userChallengeProgress.id, id));
    return updated;
  }

  async claimChallengeReward(discordId: string, challengeId: number, weekStart: string): Promise<UserChallengeProgress> {
    const progress = await this.getOrCreateUserChallengeProgress(discordId, challengeId, weekStart);
    await db.update(userChallengeProgress)
      .set({ claimed: true, updatedAt: new Date().toISOString() })
      .where(eq(userChallengeProgress.id, progress.id));
    const [updated] = await db.select().from(userChallengeProgress).where(eq(userChallengeProgress.id, progress.id));
    return updated;
  }

  async getAllUserProgress(weekStart: string): Promise<UserChallengeProgress[]> {
    return await db.select().from(userChallengeProgress)
      .where(eq(userChallengeProgress.weekStart, weekStart));
  }
}

export const storage = new DatabaseStorage();
