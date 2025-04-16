import { pgTable, text, serial, integer, boolean, jsonb, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  options: jsonb("options").notNull().$type<PollOption[]>(),
  active: boolean("active").notNull().default(true),
  createdBy: integer("created_by").notNull().references(() => users.id),
  results: jsonb("results").$type<Record<string, number>>().default({}),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull().references(() => polls.id),
  voterName: text("voter_name").notNull(),
  rankings: jsonb("rankings").notNull().$type<PollRanking[]>(),
  // Note: createdAt field is commented out as it doesn't exist in the actual database
  // createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  voterName: text("voter_name").notNull().unique(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  votesCount: integer("votes_count").notNull().default(0),
  pollsCreatedCount: integer("polls_created_count").notNull().default(0),
  firstVoteDate: timestamp("first_vote_date"),
  lastVoteDate: timestamp("last_vote_date"),
  achievements: jsonb("achievements").$type<string[]>().default([]),
  badges: jsonb("badges").$type<UserBadge[]>().default([]),
});

// Types
export type UserBadge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
};

export type PollOption = {
  id: number;
  text: string;
};

export type PollRanking = {
  optionId: number;
  rank: number;
};

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertPollSchema = createInsertSchema(polls).pick({
  title: true,
  description: true,
  options: true,
  createdBy: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  pollId: true,
  voterName: true,
  rankings: true,
});

export const insertUserPointsSchema = createInsertSchema(userPoints).pick({
  voterName: true,
  points: true,
  level: true,
  votesCount: true,
  pollsCreatedCount: true,
  firstVoteDate: true,
  lastVoteDate: true,
  achievements: true,
  badges: true,
});

// Types for the above schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;

export type User = typeof users.$inferSelect;
export type Poll = typeof polls.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type UserPoints = typeof userPoints.$inferSelect;
