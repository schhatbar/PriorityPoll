import { 
  users, type User, type InsertUser,
  polls, type Poll, type InsertPoll,
  votes, type Vote, type InsertVote,
  userPoints, type UserPoints, type InsertUserPoints,
  PollOption, PollRanking, UserBadge
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Poll operations
  createPoll(poll: InsertPoll): Promise<Poll>;
  getPoll(id: number): Promise<Poll | undefined>;
  getAllPolls(): Promise<Poll[]>;
  updatePollStatus(id: number, active: boolean): Promise<Poll | undefined>;
  updatePollResults(id: number, results: Record<string, number>): Promise<Poll | undefined>;
  deletePoll(id: number): Promise<boolean>;
  
  // Vote operations
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByPoll(pollId: number): Promise<Vote[]>;
  hasUserVoted(pollId: number, voterName: string): Promise<boolean>;
  
  // Gamification operations
  getUserPoints(voterName: string): Promise<UserPoints | undefined>;
  updateUserPoints(voterName: string, pointsToAdd: number): Promise<UserPoints>;
  addUserAchievement(voterName: string, achievement: string): Promise<UserPoints | undefined>;
  addUserBadge(voterName: string, badge: UserBadge): Promise<UserPoints | undefined>;
  getTopUsers(limit?: number): Promise<UserPoints[]>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        password: insertUser.password,
        role: insertUser.role || 'user'
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Poll operations
  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    // Initialize empty results object based on options
    const results: Record<string, number> = {};
    const options = insertPoll.options as PollOption[];
    options.forEach(option => {
      results[option.text] = 0;
    });
    
    const [poll] = await db
      .insert(polls)
      .values({
        title: insertPoll.title,
        description: insertPoll.description || null,
        options: insertPoll.options,
        createdBy: insertPoll.createdBy,
        results,
        active: true
      })
      .returning();
    
    return poll;
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    return poll;
  }

  async getAllPolls(): Promise<Poll[]> {
    return db.select().from(polls);
  }

  async updatePollStatus(id: number, active: boolean): Promise<Poll | undefined> {
    const [updatedPoll] = await db
      .update(polls)
      .set({ active })
      .where(eq(polls.id, id))
      .returning();
    
    return updatedPoll;
  }

  async updatePollResults(id: number, results: Record<string, number>): Promise<Poll | undefined> {
    const [updatedPoll] = await db
      .update(polls)
      .set({ results })
      .where(eq(polls.id, id))
      .returning();
    
    return updatedPoll;
  }

  async deletePoll(id: number): Promise<boolean> {
    const [deletedPoll] = await db
      .delete(polls)
      .where(eq(polls.id, id))
      .returning();
    
    return !!deletedPoll;
  }

  // Vote operations
  async createVote(vote: InsertVote): Promise<Vote> {
    // Create the vote
    const [newVote] = await db
      .insert(votes)
      .values({
        pollId: vote.pollId,
        voterName: vote.voterName,
        rankings: vote.rankings
      })
      .returning();
    
    // Update poll results
    const poll = await this.getPoll(vote.pollId);
    if (poll) {
      const results = { ...poll.results };
      
      // Calculate points based on rankings (reverse order - highest rank gets most points)
      const pointsForRank = (rank: number, totalOptions: number) => totalOptions - rank + 1;
      
      // Safely type the rankings array
      const typedRankings = vote.rankings as PollRanking[];
      const pollOptions = poll.options as PollOption[];
      
      typedRankings.forEach(({ optionId, rank }) => {
        const option = pollOptions.find(opt => opt.id === optionId);
        if (option) {
          const optionText = option.text;
          const points = pointsForRank(rank, pollOptions.length);
          results[optionText] = (results[optionText] || 0) + points;
        }
      });
      
      await this.updatePollResults(poll.id, results);
    }
    
    return newVote;
  }

  async getVotesByPoll(pollId: number): Promise<Vote[]> {
    return db.select().from(votes).where(eq(votes.pollId, pollId));
  }

  async hasUserVoted(pollId: number, voterName: string): Promise<boolean> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.pollId, pollId),
          eq(votes.voterName, voterName)
        )
      );
    
    return !!vote;
  }

  // Gamification operations
  async getUserPoints(voterName: string): Promise<UserPoints | undefined> {
    const [userPointsRecord] = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.voterName, voterName));
    
    return userPointsRecord;
  }

  async updateUserPoints(voterName: string, pointsToAdd: number): Promise<UserPoints> {
    // Get existing user points or create a new record
    const existingPoints = await this.getUserPoints(voterName);
    
    if (existingPoints) {
      // Update existing record
      const newPoints = existingPoints.points + pointsToAdd;
      const newLevel = Math.floor(newPoints / 100) + 1; // Simple level calculation: 1 level per 100 points
      
      const [updatedPoints] = await db
        .update(userPoints)
        .set({ 
          points: newPoints,
          level: newLevel,
          lastVoteDate: new Date()
        })
        .where(eq(userPoints.voterName, voterName))
        .returning();
      
      return updatedPoints;
    } else {
      // Create new record
      const newLevel = Math.floor(pointsToAdd / 100) + 1;
      const now = new Date();
      
      const [newUserPoints] = await db
        .insert(userPoints)
        .values({
          voterName,
          points: pointsToAdd,
          level: newLevel,
          votesCount: 1,
          firstVoteDate: now,
          lastVoteDate: now
        })
        .returning();
      
      return newUserPoints;
    }
  }

  async addUserAchievement(voterName: string, achievement: string): Promise<UserPoints | undefined> {
    const existingPoints = await this.getUserPoints(voterName);
    
    if (!existingPoints) {
      return undefined;
    }
    
    const achievements = [...(existingPoints.achievements as string[] || [])];
    
    // Only add if it doesn't already exist
    if (!achievements.includes(achievement)) {
      achievements.push(achievement);
      
      const [updatedPoints] = await db
        .update(userPoints)
        .set({ achievements })
        .where(eq(userPoints.voterName, voterName))
        .returning();
      
      return updatedPoints;
    }
    
    return existingPoints;
  }

  async addUserBadge(voterName: string, badge: UserBadge): Promise<UserPoints | undefined> {
    const existingPoints = await this.getUserPoints(voterName);
    
    if (!existingPoints) {
      return undefined;
    }
    
    const badges = [...(existingPoints.badges as UserBadge[] || [])];
    
    // Check if badge with this ID already exists
    if (!badges.some(b => b.id === badge.id)) {
      badges.push(badge);
      
      const [updatedPoints] = await db
        .update(userPoints)
        .set({ badges })
        .where(eq(userPoints.voterName, voterName))
        .returning();
      
      return updatedPoints;
    }
    
    return existingPoints;
  }

  async getTopUsers(limit: number = 10): Promise<UserPoints[]> {
    return db
      .select()
      .from(userPoints)
      .orderBy(userPoints.points, "desc")
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
