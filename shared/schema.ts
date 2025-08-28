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
  phone: varchar("phone"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  dateOfBirth: varchar("date_of_birth"),
  address: text("address"),
  bio: text("bio"),
  interests: text("interests"),
  profileImageUrl: varchar("profile_image_url"),
  // Authentication fields
  passwordHash: varchar("password_hash"),
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  // Permissions
  notificationsEnabled: boolean("notifications_enabled").default(true),
  contactsAccessEnabled: boolean("contacts_access_enabled").default(false),
  // 2FA
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret"),
  // Metadata
  onboardingCompleted: boolean("onboarding_completed").default(false),
  authMethod: varchar("auth_method"), // 'email', 'phone', 'social'
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

// User onboarding schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true, // Handle separately for security
});
export type InsertUser = z.infer<typeof insertUserSchema>;

// Profile setup schemas
export const profileCoreSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
});
export type ProfileCore = z.infer<typeof profileCoreSchema>;

export const profileAdditionalSchema = z.object({
  bio: z.string().optional(),
  interests: z.string().optional(),
});
export type ProfileAdditional = z.infer<typeof profileAdditionalSchema>;

export const permissionsSchema = z.object({
  notificationsEnabled: z.boolean().default(true),
  contactsAccessEnabled: z.boolean().default(false),
});
export type Permissions = z.infer<typeof permissionsSchema>;

// Authentication schemas
export const signupCredentialsSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  authMethod: z.enum(['email', 'phone', 'social']),
}).refine((data) => {
  if (data.authMethod === 'email' && !data.email) {
    return false;
  }
  if (data.authMethod === 'phone' && !data.phone) {
    return false;
  }
  return true;
}, {
  message: "Email or phone is required based on auth method",
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export type SignupCredentials = z.infer<typeof signupCredentialsSchema>;

export const loginCredentialsSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const verificationCodeSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});
export type VerificationCode = z.infer<typeof verificationCodeSchema>;

export const twoFactorCodeSchema = z.object({
  code: z.string().length(6, "2FA code must be 6 digits"),
});
export type TwoFactorCode = z.infer<typeof twoFactorCodeSchema>;

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
