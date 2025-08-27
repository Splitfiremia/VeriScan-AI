import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Search history table
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  searchType: varchar("search_type").notNull(), // 'name', 'phone', 'address'
  searchQuery: jsonb("search_query").notNull(),
  searchResults: jsonb("search_results"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feature flags table
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: varchar("name").unique().notNull(),
  description: text("description"),
  enabled: boolean("enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User feature flag overrides table
export const userFeatureFlags = pgTable("user_feature_flags", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  featureFlagId: integer("feature_flag_id").references(() => featureFlags.id).notNull(),
  enabled: boolean("enabled").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// People profiles table (for search results)
export const peopleProfiles = pgTable("people_profiles", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  middleName: varchar("middle_name"),
  lastName: varchar("last_name").notNull(),
  age: integer("age"),
  currentAddress: text("current_address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  phoneNumbers: jsonb("phone_numbers"), // array of phone numbers
  emailAddresses: jsonb("email_addresses"), // array of emails
  relatives: jsonb("relatives"), // array of relative objects
  associates: jsonb("associates"), // array of associate objects
  addressHistory: jsonb("address_history"), // array of previous addresses
  occupation: varchar("occupation"),
  employer: varchar("employer"),
  education: jsonb("education"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

export const insertUserFeatureFlagSchema = createInsertSchema(userFeatureFlags).omit({
  id: true,
  createdAt: true,
});
export type InsertUserFeatureFlag = z.infer<typeof insertUserFeatureFlagSchema>;

export const insertPeopleProfileSchema = createInsertSchema(peopleProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPeopleProfile = z.infer<typeof insertPeopleProfileSchema>;
export type PeopleProfile = typeof peopleProfiles.$inferSelect;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type UserFeatureFlag = typeof userFeatureFlags.$inferSelect;
