import {
  users,
  searchHistory,
  featureFlags,
  userFeatureFlags,
  peopleProfiles,
  type User,
  type UpsertUser,
  type InsertSearchHistory,
  type SearchHistory,
  type InsertFeatureFlag,
  type FeatureFlag,
  type InsertUserFeatureFlag,
  type UserFeatureFlag,
  type InsertPeopleProfile,
  type PeopleProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Search operations
  createSearchHistory(searchHistory: InsertSearchHistory): Promise<SearchHistory>;
  getUserSearchHistory(userId: string): Promise<SearchHistory[]>;
  
  // Feature flag operations
  getFeatureFlags(): Promise<FeatureFlag[]>;
  getUserFeatureFlags(userId: string): Promise<UserFeatureFlag[]>;
  createFeatureFlag(featureFlag: InsertFeatureFlag): Promise<FeatureFlag>;
  toggleUserFeatureFlag(userFeatureFlag: InsertUserFeatureFlag): Promise<UserFeatureFlag>;
  
  // People search operations
  searchPeople(query: {
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<PeopleProfile[]>;
  getPeopleProfile(id: number): Promise<PeopleProfile | undefined>;
  createPeopleProfile(profile: InsertPeopleProfile): Promise<PeopleProfile>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Search operations
  async createSearchHistory(searchHistoryData: InsertSearchHistory): Promise<SearchHistory> {
    const [history] = await db
      .insert(searchHistory)
      .values(searchHistoryData)
      .returning();
    return history;
  }

  async getUserSearchHistory(userId: string): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(50);
  }

  // Feature flag operations
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return await db.select().from(featureFlags);
  }

  async getUserFeatureFlags(userId: string): Promise<UserFeatureFlag[]> {
    return await db
      .select()
      .from(userFeatureFlags)
      .where(eq(userFeatureFlags.userId, userId));
  }

  async createFeatureFlag(featureFlagData: InsertFeatureFlag): Promise<FeatureFlag> {
    const [flag] = await db
      .insert(featureFlags)
      .values(featureFlagData)
      .returning();
    return flag;
  }

  async toggleUserFeatureFlag(userFeatureFlagData: InsertUserFeatureFlag): Promise<UserFeatureFlag> {
    const [existingFlag] = await db
      .select()
      .from(userFeatureFlags)
      .where(
        and(
          eq(userFeatureFlags.userId, userFeatureFlagData.userId),
          eq(userFeatureFlags.featureFlagId, userFeatureFlagData.featureFlagId)
        )
      );

    if (existingFlag) {
      const [updatedFlag] = await db
        .update(userFeatureFlags)
        .set({ enabled: userFeatureFlagData.enabled })
        .where(eq(userFeatureFlags.id, existingFlag.id))
        .returning();
      return updatedFlag;
    } else {
      const [newFlag] = await db
        .insert(userFeatureFlags)
        .values(userFeatureFlagData)
        .returning();
      return newFlag;
    }
  }

  // People search operations
  async searchPeople(query: {
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<PeopleProfile[]> {
    let queryBuilder = db.select().from(peopleProfiles);
    
    const conditions = [];
    
    if (query.firstName) {
      conditions.push(like(peopleProfiles.firstName, `%${query.firstName}%`));
    }
    
    if (query.lastName) {
      conditions.push(like(peopleProfiles.lastName, `%${query.lastName}%`));
    }
    
    if (query.city) {
      conditions.push(like(peopleProfiles.city, `%${query.city}%`));
    }
    
    if (query.state) {
      conditions.push(eq(peopleProfiles.state, query.state));
    }
    
    if (query.phoneNumber) {
      conditions.push(
        sql`${peopleProfiles.phoneNumbers}::text LIKE ${`%${query.phoneNumber}%`}`
      );
    }
    
    if (query.address) {
      conditions.push(
        or(
          like(peopleProfiles.currentAddress, `%${query.address}%`),
          sql`${peopleProfiles.addressHistory}::text LIKE ${`%${query.address}%`}`
        )
      );
    }
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }
    
    const results = await queryBuilder.limit(50);
    return results;
  }

  async getPeopleProfile(id: number): Promise<PeopleProfile | undefined> {
    const [profile] = await db
      .select()
      .from(peopleProfiles)
      .where(eq(peopleProfiles.id, id));
    return profile;
  }

  async createPeopleProfile(profileData: InsertPeopleProfile): Promise<PeopleProfile> {
    const [profile] = await db
      .insert(peopleProfiles)
      .values(profileData)
      .returning();
    return profile;
  }
}

export const storage = new DatabaseStorage();
