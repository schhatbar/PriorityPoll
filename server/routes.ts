import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPollSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes for admin access only
  setupAuth(app);

  // Poll routes
  
  // Create a new poll (admin only)
  app.post("/api/polls", isAdmin, async (req, res) => {
    try {
      const validatedData = insertPollSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const poll = await storage.createPoll(validatedData);
      res.status(201).json(poll);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create poll" });
      }
    }
  });

  // Get all polls - public access
  app.get("/api/polls", async (req, res) => {
    try {
      const polls = await storage.getAllPolls();
      
      // If user is not admin, filter out inactive polls
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        const activePolls = polls.filter(poll => poll.active);
        return res.json(activePolls);
      }
      
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  // Get a specific poll - public access
  app.get("/api/polls/:id", async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      if (isNaN(pollId)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }
      
      const poll = await storage.getPoll(pollId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      // Only allow access to active polls unless user is admin
      if (!poll.active && (!req.isAuthenticated() || req.user?.role !== "admin")) {
        return res.status(403).json({ message: "This poll is no longer active" });
      }
      
      res.json(poll);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch poll" });
    }
  });

  // Update poll status (admin only)
  app.patch("/api/polls/:id/status", isAdmin, async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      if (isNaN(pollId)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }
      
      const { active } = req.body;
      if (typeof active !== "boolean") {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updatedPoll = await storage.updatePollStatus(pollId, active);
      if (!updatedPoll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      res.json(updatedPoll);
    } catch (error) {
      res.status(500).json({ message: "Failed to update poll status" });
    }
  });

  // Delete a poll (admin only)
  app.delete("/api/polls/:id", isAdmin, async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      if (isNaN(pollId)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }
      
      const success = await storage.deletePoll(pollId);
      if (!success) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete poll" });
    }
  });

  // Vote routes
  
  // Submit a vote
  app.post("/api/votes", async (req, res) => {
    try {
      const pollId = parseInt(req.body.pollId);
      if (isNaN(pollId)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }
      
      // Check if poll exists and is active
      const poll = await storage.getPoll(pollId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      if (!poll.active) {
        return res.status(400).json({ message: "This poll is no longer active" });
      }
      
      const { voterName } = req.body;
      if (!voterName || typeof voterName !== 'string' || voterName.trim() === '') {
        return res.status(400).json({ message: "Please provide your name to vote" });
      }
      
      // Check if user has already voted
      const hasVoted = await storage.hasUserVoted(pollId, voterName);
      if (hasVoted) {
        return res.status(400).json({ message: "You have already voted in this poll" });
      }
      
      // Validate vote
      const validatedData = insertVoteSchema.parse({
        pollId,
        voterName,
        rankings: req.body.rankings
      });
      
      const vote = await storage.createVote(validatedData);
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit vote" });
      }
    }
  });

  // Check if user has voted
  app.get("/api/polls/:id/has-voted", async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      if (isNaN(pollId)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }
      
      const { voterName } = req.query;
      if (!voterName || typeof voterName !== 'string') {
        return res.status(400).json({ message: "Please provide a name to check vote status" });
      }
      
      const hasVoted = await storage.hasUserVoted(pollId, voterName);
      res.json({ hasVoted });
    } catch (error) {
      res.status(500).json({ message: "Failed to check vote status" });
    }
  });

  // Get votes by poll ID (admin only)
  app.get("/api/polls/:id/votes", isAdmin, async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      if (isNaN(pollId)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }
      
      const votes = await storage.getVotesByPoll(pollId);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });

  // User routes (admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return password hashes
      const sanitizedUsers = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Gamification routes
  
  // Get leaderboard (public)
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topUsers = await storage.getTopUsers(limit);
      res.json(topUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get user profile with points and achievements
  app.get("/api/user-profile/:name", async (req, res) => {
    try {
      const voterName = req.params.name;
      const userPoints = await storage.getUserPoints(voterName);
      
      if (!userPoints) {
        return res.status(404).json({ message: "User profile not found" });
      }
      
      res.json(userPoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Award achievement (admin only)
  app.post("/api/user-profile/:name/achievements", isAdmin, async (req, res) => {
    try {
      const voterName = req.params.name;
      const { achievement } = req.body;
      
      if (!achievement || typeof achievement !== 'string') {
        return res.status(400).json({ message: "Invalid achievement" });
      }
      
      const updatedProfile = await storage.addUserAchievement(voterName, achievement);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to award achievement" });
    }
  });

  // Award badge (admin only)
  app.post("/api/user-profile/:name/badges", isAdmin, async (req, res) => {
    try {
      const voterName = req.params.name;
      const { badge } = req.body;
      
      if (!badge || typeof badge !== 'object' || !badge.id || !badge.name) {
        return res.status(400).json({ message: "Invalid badge data" });
      }
      
      const updatedProfile = await storage.addUserBadge(voterName, badge);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to award badge" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
