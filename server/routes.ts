import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { 
  insertUserSchema, insertUnionSchema, insertUnionMemberSchema, 
  insertUnionDemandSchema, insertPledgeSchema, insertCandidateSchema,
  insertCandidateCommitmentSchema, insertEventSchema, insertEventAttendeeSchema,
  insertBallotSchema, insertVoteSchema, insertUserBadgeSchema,
  insertUnionChannelSchema, insertDiscussionPostSchema, insertPostCommentSchema, insertPostVoteSchema
} from "@shared/schema";
import { createDailyRoom } from "./daily";

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
      console.error("Join union error:", error);
      // Check if it's a duplicate key error (user already joined)
      if (error.code === '23505' && error.constraint_name === 'union_members_union_id_user_id_key') {
        return res.status(400).json({ message: "You've already joined this union" });
      }
      res.status(400).json({ message: error.message, details: error.errors || error });
    }
  });

  app.get("/api/users/:id/unions", async (req, res) => {
    const unions = await storage.getUserUnions(req.params.id);
    res.json(unions);
  });

  app.get("/api/unions/:unionId/members/:userId", async (req, res) => {
    try {
      const membership = await storage.getUnionMembership(req.params.unionId, req.params.userId);
      res.json(membership || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
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

  // Discussion System - Channels
  app.get("/api/unions/:id/channels", async (req, res) => {
    const channels = await storage.getUnionChannels(req.params.id);
    res.json(channels);
  });

  app.post("/api/unions/:id/channels", requireAuth, async (req, res) => {
    try {
      const channelData = insertUnionChannelSchema.parse({
        unionId: req.params.id,
        createdBy: req.userId,
        ...req.body
      });
      const channel = await storage.createChannel(channelData);
      res.json(channel);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/channels/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteChannel(req.params.id);
      res.json({ message: "Channel deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Discussion System - Posts
  app.get("/api/channels/:id/posts", async (req, res) => {
    const posts = await storage.getChannelPosts(req.params.id);
    res.json(posts);
  });

  app.get("/api/posts/:id", async (req, res) => {
    const post = await storage.getPost(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.post("/api/channels/:id/posts", requireAuth, async (req, res) => {
    try {
      const postData = insertDiscussionPostSchema.parse({
        channelId: req.params.id,
        authorId: req.userId,
        ...req.body
      });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const post = await storage.updatePost(req.params.id, req.body);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.json({ message: "Post deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Discussion System - Comments
  app.get("/api/posts/:id/comments", async (req, res) => {
    const comments = await storage.getPostComments(req.params.id);
    res.json(comments);
  });

  app.post("/api/posts/:id/comments", requireAuth, async (req, res) => {
    try {
      const commentData = insertPostCommentSchema.parse({
        postId: req.params.id,
        authorId: req.userId,
        ...req.body
      });
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const comment = await storage.updateComment(req.params.id, req.body);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.json({ message: "Comment deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Discussion System - Votes
  app.post("/api/posts/:id/vote", requireAuth, async (req, res) => {
    try {
      const voteData = insertPostVoteSchema.parse({
        postId: req.params.id,
        userId: req.userId,
        voteType: req.body.voteType
      });
      const vote = await storage.votePost(voteData);
      res.json(vote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/comments/:id/vote", requireAuth, async (req, res) => {
    try {
      const voteData = insertPostVoteSchema.parse({
        commentId: req.params.id,
        userId: req.userId,
        voteType: req.body.voteType
      });
      const vote = await storage.votePost(voteData);
      res.json(vote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/votes/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteVote(req.params.id);
      res.json({ message: "Vote removed" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Voice/Video Sessions
  app.post("/api/channels/:channelId/session", requireAuth, async (req, res) => {
    try {
      const { channelId } = req.params;

      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      if (channel.channelType !== 'voice' && channel.channelType !== 'video') {
        return res.status(400).json({ message: "Channel type must be 'voice' or 'video'" });
      }

      const membership = await storage.getUnionMembership(channel.unionId, req.userId!);
      if (!membership) {
        return res.status(403).json({ message: "You must be a union member to join this channel" });
      }

      const existingSession = await storage.getActiveSession(channelId);
      if (existingSession) {
        const participant = await storage.joinSession(existingSession.id, req.userId!);
        return res.json({ session: existingSession, participant });
      }

      const { roomUrl, roomName, sessionToken } = await createDailyRoom(channelId, channel.name, channel.channelType);
      const session = await storage.createSession(channelId, sessionToken, roomUrl, roomName);
      const participant = await storage.joinSession(session.id, req.userId!);

      res.json({ session, participant });
    } catch (error: any) {
      console.error("Create/join session error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/channels/:channelId/session", requireAuth, async (req, res) => {
    try {
      const { channelId } = req.params;
      
      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      const membership = await storage.getUnionMembership(channel.unionId, req.userId!);
      if (!membership) {
        return res.status(403).json({ message: "You must be a union member to view this session" });
      }
      
      const session = await storage.getActiveSession(channelId);
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/channels/:channelId/session", requireAuth, async (req, res) => {
    try {
      const { channelId } = req.params;
      const session = await storage.getActiveSession(channelId);
      
      if (!session) {
        return res.status(404).json({ message: "No active session found" });
      }

      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      if (channel.createdBy !== req.userId) {
        return res.status(403).json({ message: "Only channel creator can end the session" });
      }

      await storage.endSession(session.id);
      res.json({ message: "Session ended" });
    } catch (error: any) {
      console.error("End session error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sessions/:sessionId/join", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await storage.getSession(sessionId);
      if (!session || !session.isActive) {
        return res.status(404).json({ message: "Session not found or inactive" });
      }
      
      const channel = await storage.getChannel(session.channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      const membership = await storage.getUnionMembership(channel.unionId, req.userId!);
      if (!membership) {
        return res.status(403).json({ message: "You must be a union member to join this session" });
      }
      
      const participant = await storage.joinSession(sessionId, req.userId!);
      res.json(participant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/sessions/:sessionId/leave", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const participants = await storage.getSessionParticipants(sessionId);
      const participant = participants.find(p => p.userId === req.userId && p.isActive);
      
      if (!participant) {
        return res.status(404).json({ message: "Participant not found in session" });
      }

      await storage.leaveSession(participant.id);
      res.json({ message: "Left session" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sessions/:sessionId/participants", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const participants = await storage.getSessionParticipants(sessionId);
      res.json(participants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
