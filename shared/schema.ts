import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
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
  createdBy: integer("created_by").notNull(),
  results: jsonb("results").$type<Record<string, number>>().default({}),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull(),
  userId: integer("user_id").notNull(),
  rankings: jsonb("rankings").notNull().$type<PollRanking[]>(),
});

// Types
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
  userId: true,
  rankings: true,
});

// Types for the above schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type User = typeof users.$inferSelect;
export type Poll = typeof polls.$inferSelect;
export type Vote = typeof votes.$inferSelect;
