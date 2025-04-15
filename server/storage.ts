import { 
  users, type User, type InsertUser,
  polls, type Poll, type InsertPoll,
  votes, type Vote, type InsertVote,
  PollOption, PollRanking
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  hasUserVoted(pollId: number, userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private polls: Map<number, Poll>;
  private votes: Map<number, Vote>;
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private pollIdCounter: number;
  private voteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.polls = new Map();
    this.votes = new Map();
    this.userIdCounter = 1;
    this.pollIdCounter = 1;
    this.voteIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Poll operations
  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    const id = this.pollIdCounter++;
    // Initialize empty results object based on options
    const results: Record<string, number> = {};
    insertPoll.options.forEach(option => {
      results[option.text] = 0;
    });
    
    const poll: Poll = { 
      ...insertPoll, 
      id, 
      results,
      active: true 
    };
    this.polls.set(id, poll);
    return poll;
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    return this.polls.get(id);
  }

  async getAllPolls(): Promise<Poll[]> {
    return Array.from(this.polls.values());
  }

  async updatePollStatus(id: number, active: boolean): Promise<Poll | undefined> {
    const poll = this.polls.get(id);
    if (!poll) return undefined;
    
    const updatedPoll = { ...poll, active };
    this.polls.set(id, updatedPoll);
    return updatedPoll;
  }

  async updatePollResults(id: number, results: Record<string, number>): Promise<Poll | undefined> {
    const poll = this.polls.get(id);
    if (!poll) return undefined;
    
    const updatedPoll = { ...poll, results };
    this.polls.set(id, updatedPoll);
    return updatedPoll;
  }

  async deletePoll(id: number): Promise<boolean> {
    return this.polls.delete(id);
  }

  // Vote operations
  async createVote(vote: InsertVote): Promise<Vote> {
    const id = this.voteIdCounter++;
    const newVote: Vote = { ...vote, id };
    this.votes.set(id, newVote);
    
    // Update poll results
    const poll = await this.getPoll(vote.pollId);
    if (poll) {
      const results = { ...poll.results };
      
      // Calculate points based on rankings (reverse order - highest rank gets most points)
      const pointsForRank = (rank: number, totalOptions: number) => totalOptions - rank + 1;
      
      vote.rankings.forEach(({ optionId, rank }) => {
        const option = poll.options.find(opt => opt.id === optionId);
        if (option) {
          const optionText = option.text;
          const points = pointsForRank(rank, poll.options.length);
          results[optionText] = (results[optionText] || 0) + points;
        }
      });
      
      await this.updatePollResults(poll.id, results);
    }
    
    return newVote;
  }

  async getVotesByPoll(pollId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(vote => vote.pollId === pollId);
  }

  async hasUserVoted(pollId: number, userId: number): Promise<boolean> {
    return Array.from(this.votes.values()).some(
      vote => vote.pollId === pollId && vote.userId === userId
    );
  }
}

export const storage = new MemStorage();
