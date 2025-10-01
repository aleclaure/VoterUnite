import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { 
  insertUserSchema, insertUnionSchema, insertUnionMemberSchema, 
  insertUnionDemandSchema, insertPledgeSchema, insertCandidateSchema,
  insertCandidateCommitmentSchema, insertEventSchema, insertEventAttendeeSchema,
  insertBallotSchema, insertVoteSchema, insertUserBadgeSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Unions
  app.get("/api/unions", async (req, res) => {
    const { category, scope, search } = req.query;
    const unions = await storage.getUnions({
      category: category as string,
      scope: scope as string,
      search: search as string
    });
    res.json(unions);
  });

  app.get("/api/unions/:id", async (req, res) => {
    const union = await storage.getUnion(req.params.id);
    if (!union) return res.status(404).json({ message: "Union not found" });
    res.json(union);
  });

  app.post("/api/unions", requireAuth, async (req, res) => {
    try {
      const unionData = insertUnionSchema.parse({
        ...req.body,
        creatorId: req.userId
      });
      const union = await storage.createUnion(unionData);
      res.json(union);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Union Members
  app.post("/api/unions/:id/join", requireAuth, async (req, res) => {
    try {
      const memberData = insertUnionMemberSchema.parse({
        unionId: req.params.id,
        userId: req.userId,
        role: req.body.role || "member"
      });
      const member = await storage.joinUnion(memberData);
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/unions", async (req, res) => {
    const unions = await storage.getUserUnions(req.params.id);
    res.json(unions);
  });

  // Union Demands
  app.get("/api/unions/:id/demands", async (req, res) => {
    const demands = await storage.getUnionDemands(req.params.id);
    res.json(demands);
  });

  app.post("/api/unions/:id/demands", async (req, res) => {
    try {
      const demandData = insertUnionDemandSchema.parse({
        unionId: req.params.id,
        ...req.body
      });
      const demand = await storage.createUnionDemand(demandData);
      res.json(demand);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Pledges
  app.get("/api/users/:id/pledges", async (req, res) => {
    const pledges = await storage.getUserPledges(req.params.id);
    res.json(pledges);
  });

  app.post("/api/pledges", requireAuth, async (req, res) => {
    try {
      const pledgeData = insertPledgeSchema.parse({
        ...req.body,
        userId: req.userId
      });
      const pledge = await storage.createPledge(pledgeData);
      res.json(pledge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/pledges/:id/withdraw", async (req, res) => {
    try {
      const pledge = await storage.withdrawPledge(req.params.id);
      res.json(pledge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Candidates
  app.get("/api/candidates", async (req, res) => {
    const { district, state } = req.query;
    const candidates = await storage.getCandidates({
      district: district as string,
      state: state as string
    });
    res.json(candidates);
  });

  app.post("/api/candidates", async (req, res) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(candidateData);
      res.json(candidate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Candidate Commitments
  app.get("/api/candidates/:id/commitments", async (req, res) => {
    const commitments = await storage.getCandidateCommitments(req.params.id);
    res.json(commitments);
  });

  app.post("/api/commitments", async (req, res) => {
    try {
      const commitmentData = insertCandidateCommitmentSchema.parse(req.body);
      const commitment = await storage.createCandidateCommitment(commitmentData);
      res.json(commitment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    const { unionId, eventType } = req.query;
    const events = await storage.getEvents({
      unionId: unionId as string,
      eventType: eventType as string
    });
    res.json(events);
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        creatorId: req.userId
      });
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/events/:id/rsvp", requireAuth, async (req, res) => {
    try {
      const attendeeData = insertEventAttendeeSchema.parse({
        eventId: req.params.id,
        userId: req.userId,
        rsvpStatus: req.body.rsvpStatus || "going"
      });
      const attendee = await storage.rsvpEvent(attendeeData);
      res.json(attendee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Ballots
  app.get("/api/unions/:id/ballots", async (req, res) => {
    const ballots = await storage.getActiveBallots(req.params.id);
    res.json(ballots);
  });

  app.post("/api/ballots", requireAuth, async (req, res) => {
    try {
      const ballotData = insertBallotSchema.parse({
        ...req.body,
        creatorId: req.userId
      });
      const ballot = await storage.createBallot(ballotData);
      res.json(ballot);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Votes
  app.post("/api/votes", requireAuth, async (req, res) => {
    try {
      const voteData = insertVoteSchema.parse({
        ...req.body,
        userId: req.userId
      });
      const vote = await storage.castVote(voteData);
      res.json(vote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Badges
  app.get("/api/users/:id/badges", async (req, res) => {
    const badges = await storage.getUserBadges(req.params.id);
    res.json(badges);
  });

  const httpServer = createServer(app);
  return httpServer;
}
