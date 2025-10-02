import { 
  type User, type InsertUser,
  type Union, type InsertUnion,
  type UnionMember, type InsertUnionMember,
  type UnionDemand, type InsertUnionDemand,
  type Pledge, type InsertPledge,
  type Candidate, type InsertCandidate,
  type CandidateCommitment, type InsertCandidateCommitment,
  type Event, type InsertEvent,
  type EventAttendee, type InsertEventAttendee,
  type Ballot, type InsertBallot,
  type Vote, type InsertVote,
  type UserBadge, type InsertUserBadge,
  type UnionChannel, type InsertUnionChannel,
  type DiscussionPost, type InsertDiscussionPost,
  type PostComment, type InsertPostComment,
  type PostVote, type InsertPostVote,
  type ChannelSession, type InsertChannelSession,
  type SessionParticipant, type InsertSessionParticipant
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Unions
  getUnion(id: string): Promise<Union | undefined>;
  getUnions(filters?: { category?: string; scope?: string; search?: string }): Promise<Union[]>;
  createUnion(union: InsertUnion): Promise<Union>;
  updateUnion(id: string, union: Partial<Union>): Promise<Union>;
  
  // Union Members
  getUnionMembers(unionId: string): Promise<UnionMember[]>;
  getUserUnions(userId: string): Promise<Union[]>;
  getUnionMembership(unionId: string, userId: string): Promise<UnionMember | undefined>;
  joinUnion(member: InsertUnionMember): Promise<UnionMember>;
  leaveUnion(unionId: string, userId: string): Promise<void>;
  
  // Union Demands
  getUnionDemands(unionId: string): Promise<UnionDemand[]>;
  createUnionDemand(demand: InsertUnionDemand): Promise<UnionDemand>;
  updateUnionDemand(id: string, demand: Partial<UnionDemand>): Promise<UnionDemand>;
  
  // Pledges
  getUserPledges(userId: string): Promise<Pledge[]>;
  getUnionPledges(unionId: string): Promise<Pledge[]>;
  createPledge(pledge: InsertPledge): Promise<Pledge>;
  withdrawPledge(id: string): Promise<Pledge>;
  
  // Candidates
  getCandidate(id: string): Promise<Candidate | undefined>;
  getCandidates(filters?: { district?: string; state?: string }): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  
  // Candidate Commitments
  getCandidateCommitments(candidateId: string): Promise<CandidateCommitment[]>;
  createCandidateCommitment(commitment: InsertCandidateCommitment): Promise<CandidateCommitment>;
  updateCommitmentStatus(id: string, status: string, notes?: string): Promise<CandidateCommitment>;
  
  // Events
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(filters?: { unionId?: string; eventType?: string }): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Event Attendees
  rsvpEvent(attendee: InsertEventAttendee): Promise<EventAttendee>;
  getEventAttendees(eventId: string): Promise<EventAttendee[]>;
  
  // Ballots
  getActiveBallots(unionId: string): Promise<Ballot[]>;
  createBallot(ballot: InsertBallot): Promise<Ballot>;
  
  // Votes
  castVote(vote: InsertVote): Promise<Vote>;
  getUserVote(ballotId: string, userId: string): Promise<Vote | undefined>;
  
  // Badges
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(badge: InsertUserBadge): Promise<UserBadge>;
  
  // Discussion System
  // Channels
  getChannel(id: string): Promise<UnionChannel | undefined>;
  getUnionChannels(unionId: string): Promise<UnionChannel[]>;
  createChannel(channel: InsertUnionChannel): Promise<UnionChannel>;
  deleteChannel(id: string): Promise<void>;
  
  // Posts
  getChannelPosts(channelId: string): Promise<DiscussionPost[]>;
  getPost(id: string): Promise<DiscussionPost | undefined>;
  createPost(post: InsertDiscussionPost): Promise<DiscussionPost>;
  updatePost(id: string, updates: Partial<InsertDiscussionPost>): Promise<DiscussionPost>;
  deletePost(id: string): Promise<void>;
  
  // Comments
  getPostComments(postId: string): Promise<PostComment[]>;
  createComment(comment: InsertPostComment): Promise<PostComment>;
  updateComment(id: string, updates: Partial<InsertPostComment>): Promise<PostComment>;
  deleteComment(id: string): Promise<void>;
  
  // Votes
  getUserVoteForPost(userId: string, postId: string): Promise<PostVote | undefined>;
  getUserVoteForComment(userId: string, commentId: string): Promise<PostVote | undefined>;
  votePost(vote: InsertPostVote): Promise<PostVote>;
  deleteVote(id: string): Promise<void>;
  
  // Voice/Video Sessions
  createSession(channelId: string, sessionToken: string, roomUrl: string, roomName: string): Promise<ChannelSession>;
  getSession(sessionId: string): Promise<ChannelSession | null>;
  getActiveSession(channelId: string): Promise<ChannelSession | null>;
  endSession(sessionId: string): Promise<void>;
  joinSession(sessionId: string, userId: string): Promise<SessionParticipant>;
  leaveSession(participantId: string): Promise<void>;
  getSessionParticipants(sessionId: string): Promise<SessionParticipant[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private unions: Map<string, Union> = new Map();
  private unionMembers: Map<string, UnionMember> = new Map();
  private unionDemands: Map<string, UnionDemand> = new Map();
  private pledges: Map<string, Pledge> = new Map();
  private candidates: Map<string, Candidate> = new Map();
  private candidateCommitments: Map<string, CandidateCommitment> = new Map();
  private events: Map<string, Event> = new Map();
  private eventAttendees: Map<string, EventAttendee> = new Map();
  private ballots: Map<string, Ballot> = new Map();
  private votes: Map<string, Vote> = new Map();
  private userBadges: Map<string, UserBadge> = new Map();
  private unionChannels: Map<string, UnionChannel> = new Map();
  private discussionPosts: Map<string, DiscussionPost> = new Map();
  private postComments: Map<string, PostComment> = new Map();
  private postVotes: Map<string, PostVote> = new Map();
  private channelSessions: Map<string, ChannelSession> = new Map();
  private sessionParticipants: Map<string, SessionParticipant> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: randomUUID(), 
      createdAt: new Date(),
      fullName: insertUser.fullName ?? null,
      zipCode: insertUser.zipCode ?? null,
      district: insertUser.district ?? null,
      state: insertUser.state ?? null
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Unions
  async getUnion(id: string): Promise<Union | undefined> {
    return this.unions.get(id);
  }

  async getUnions(filters?: { category?: string; scope?: string; search?: string }): Promise<Union[]> {
    let unions = Array.from(this.unions.values());
    if (filters?.category) {
      unions = unions.filter(u => u.category === filters.category);
    }
    if (filters?.scope) {
      unions = unions.filter(u => u.scope === filters.scope);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      unions = unions.filter(u => 
        u.name.toLowerCase().includes(search) || 
        u.description?.toLowerCase().includes(search)
      );
    }
    return unions;
  }

  async createUnion(insertUnion: InsertUnion): Promise<Union> {
    const union: Union = { 
      ...insertUnion, 
      id: randomUUID(), 
      createdAt: new Date(),
      description: insertUnion.description ?? null,
      scopeValue: insertUnion.scopeValue ?? null,
      memberCount: 0,
      pledgedCount: 0,
      districtCount: 0,
      powerIndex: "0"
    };
    this.unions.set(union.id, union);
    return union;
  }

  async updateUnion(id: string, updates: Partial<Union>): Promise<Union> {
    const union = this.unions.get(id);
    if (!union) throw new Error("Union not found");
    const updated = { ...union, ...updates };
    this.unions.set(id, updated);
    return updated;
  }

  // Union Members
  async getUnionMembers(unionId: string): Promise<UnionMember[]> {
    return Array.from(this.unionMembers.values()).filter(m => m.unionId === unionId);
  }

  async getUserUnions(userId: string): Promise<Union[]> {
    const memberRecords = Array.from(this.unionMembers.values()).filter((m: UnionMember) => m.userId === userId);
    return memberRecords.map((m: UnionMember) => this.unions.get(m.unionId)!).filter(Boolean);
  }

  async getUnionMembership(unionId: string, userId: string): Promise<UnionMember | undefined> {
    return Array.from(this.unionMembers.values()).find((m: UnionMember) => m.unionId === unionId && m.userId === userId);
  }

  async joinUnion(insertMember: InsertUnionMember): Promise<UnionMember> {
    const member: UnionMember = { ...insertMember, id: randomUUID(), joinedAt: new Date() };
    this.unionMembers.set(member.id, member);
    
    // Update union member count
    const union = this.unions.get(member.unionId);
    if (union) {
      union.memberCount = (union.memberCount || 0) + 1;
      this.unions.set(union.id, union);
    }
    
    return member;
  }

  async leaveUnion(unionId: string, userId: string): Promise<void> {
    const member = Array.from(this.unionMembers.values()).find(
      m => m.unionId === unionId && m.userId === userId
    );
    if (member) {
      this.unionMembers.delete(member.id);
      
      // Update union member count
      const union = this.unions.get(unionId);
      if (union && union.memberCount) {
        union.memberCount = union.memberCount - 1;
        this.unions.set(union.id, union);
      }
    }
  }

  // Union Demands
  async getUnionDemands(unionId: string): Promise<UnionDemand[]> {
    return Array.from(this.unionDemands.values())
      .filter(d => d.unionId === unionId)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async createUnionDemand(insertDemand: InsertUnionDemand): Promise<UnionDemand> {
    const demand: UnionDemand = { 
      ...insertDemand, 
      id: randomUUID(), 
      createdAt: new Date(),
      supportPercentage: "0",
      voteCount: 0,
      priority: 0
    };
    this.unionDemands.set(demand.id, demand);
    return demand;
  }

  async updateUnionDemand(id: string, updates: Partial<UnionDemand>): Promise<UnionDemand> {
    const demand = this.unionDemands.get(id);
    if (!demand) throw new Error("Demand not found");
    const updated = { ...demand, ...updates };
    this.unionDemands.set(id, updated);
    return updated;
  }

  // Pledges
  async getUserPledges(userId: string): Promise<Pledge[]> {
    return Array.from(this.pledges.values()).filter(p => p.userId === userId);
  }

  async getUnionPledges(unionId: string): Promise<Pledge[]> {
    return Array.from(this.pledges.values()).filter(p => p.unionId === unionId);
  }

  async createPledge(insertPledge: InsertPledge): Promise<Pledge> {
    const pledge: Pledge = { ...insertPledge, id: randomUUID(), createdAt: new Date() };
    this.pledges.set(pledge.id, pledge);
    
    // Update union pledged count
    const union = this.unions.get(pledge.unionId);
    if (union) {
      union.pledgedCount = (union.pledgedCount || 0) + 1;
      this.unions.set(union.id, union);
    }
    
    return pledge;
  }

  async withdrawPledge(id: string): Promise<Pledge> {
    const pledge = this.pledges.get(id);
    if (!pledge) throw new Error("Pledge not found");
    
    const updated = { ...pledge, status: "withdrawn" };
    this.pledges.set(id, updated);
    
    // Update union pledged count
    const union = this.unions.get(pledge.unionId);
    if (union && union.pledgedCount) {
      union.pledgedCount = union.pledgedCount - 1;
      this.unions.set(union.id, union);
    }
    
    return updated;
  }

  // Candidates
  async getCandidate(id: string): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async getCandidates(filters?: { district?: string; state?: string }): Promise<Candidate[]> {
    let candidates = Array.from(this.candidates.values());
    if (filters?.district) {
      candidates = candidates.filter(c => c.district === filters.district);
    }
    if (filters?.state) {
      candidates = candidates.filter(c => c.state === filters.state);
    }
    return candidates;
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const candidate: Candidate = { 
      ...insertCandidate, 
      id: randomUUID(), 
      createdAt: new Date(),
      pledgeCount: 0,
      alignmentScore: "0"
    };
    this.candidates.set(candidate.id, candidate);
    return candidate;
  }

  // Candidate Commitments
  async getCandidateCommitments(candidateId: string): Promise<CandidateCommitment[]> {
    return Array.from(this.candidateCommitments.values()).filter(c => c.candidateId === candidateId);
  }

  async createCandidateCommitment(insertCommitment: InsertCandidateCommitment): Promise<CandidateCommitment> {
    const commitment: CandidateCommitment = { ...insertCommitment, id: randomUUID(), createdAt: new Date() };
    this.candidateCommitments.set(commitment.id, commitment);
    return commitment;
  }

  async updateCommitmentStatus(id: string, status: string, notes?: string): Promise<CandidateCommitment> {
    const commitment = this.candidateCommitments.get(id);
    if (!commitment) throw new Error("Commitment not found");
    const updated = { ...commitment, status, verificationNotes: notes };
    this.candidateCommitments.set(id, updated);
    return updated;
  }

  // Events
  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEvents(filters?: { unionId?: string; eventType?: string }): Promise<Event[]> {
    let events = Array.from(this.events.values());
    if (filters?.unionId) {
      events = events.filter(e => e.unionId === filters.unionId);
    }
    if (filters?.eventType) {
      events = events.filter(e => e.eventType === filters.eventType);
    }
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const event: Event = { 
      ...insertEvent, 
      id: randomUUID(), 
      createdAt: new Date(),
      attendeeCount: 0
    };
    this.events.set(event.id, event);
    return event;
  }

  // Event Attendees
  async rsvpEvent(insertAttendee: InsertEventAttendee): Promise<EventAttendee> {
    const attendee: EventAttendee = { ...insertAttendee, id: randomUUID(), rsvpedAt: new Date() };
    this.eventAttendees.set(attendee.id, attendee);
    
    // Update event attendee count
    const event = this.events.get(attendee.eventId);
    if (event) {
      event.attendeeCount = (event.attendeeCount || 0) + 1;
      this.events.set(event.id, event);
    }
    
    return attendee;
  }

  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    return Array.from(this.eventAttendees.values()).filter(a => a.eventId === eventId);
  }

  // Ballots
  async getActiveBallots(unionId: string): Promise<Ballot[]> {
    const now = new Date();
    return Array.from(this.ballots.values()).filter(
      b => b.unionId === unionId && b.status === "active" && b.endDate > now
    );
  }

  async createBallot(insertBallot: InsertBallot): Promise<Ballot> {
    const ballot: Ballot = { ...insertBallot, id: randomUUID(), createdAt: new Date() };
    this.ballots.set(ballot.id, ballot);
    return ballot;
  }

  // Votes
  async castVote(insertVote: InsertVote): Promise<Vote> {
    const vote: Vote = { ...insertVote, id: randomUUID(), votedAt: new Date() };
    this.votes.set(vote.id, vote);
    return vote;
  }

  async getUserVote(ballotId: string, userId: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      v => v.ballotId === ballotId && v.userId === userId
    );
  }

  // Badges
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(b => b.userId === userId);
  }

  async awardBadge(insertBadge: InsertUserBadge): Promise<UserBadge> {
    const badge: UserBadge = { ...insertBadge, id: randomUUID(), earnedAt: new Date() };
    this.userBadges.set(badge.id, badge);
    return badge;
  }

  // Discussion System - Channels
  async getChannel(id: string): Promise<UnionChannel | undefined> {
    return this.unionChannels.get(id);
  }

  async getUnionChannels(unionId: string): Promise<UnionChannel[]> {
    return Array.from(this.unionChannels.values()).filter(c => c.unionId === unionId);
  }

  async createChannel(insertChannel: InsertUnionChannel): Promise<UnionChannel> {
    const channel: UnionChannel = { ...insertChannel, id: randomUUID(), createdAt: new Date() };
    this.unionChannels.set(channel.id, channel);
    return channel;
  }

  async deleteChannel(id: string): Promise<void> {
    this.unionChannels.delete(id);
  }

  // Discussion System - Posts
  async getChannelPosts(channelId: string): Promise<DiscussionPost[]> {
    return Array.from(this.discussionPosts.values())
      .filter(p => p.channelId === channelId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPost(id: string): Promise<DiscussionPost | undefined> {
    return this.discussionPosts.get(id);
  }

  async createPost(insertPost: InsertDiscussionPost): Promise<DiscussionPost> {
    const post: DiscussionPost = { 
      ...insertPost, 
      id: randomUUID(), 
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.discussionPosts.set(post.id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<InsertDiscussionPost>): Promise<DiscussionPost> {
    const post = this.discussionPosts.get(id);
    if (!post) throw new Error("Post not found");
    const updated = { ...post, ...updates, updatedAt: new Date() };
    this.discussionPosts.set(id, updated);
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    this.discussionPosts.delete(id);
  }

  // Discussion System - Comments
  async getPostComments(postId: string): Promise<PostComment[]> {
    return Array.from(this.postComments.values())
      .filter(c => c.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(insertComment: InsertPostComment): Promise<PostComment> {
    const comment: PostComment = { 
      ...insertComment, 
      id: randomUUID(), 
      upvotes: 0,
      downvotes: 0,
      depth: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.postComments.set(comment.id, comment);
    
    // Increment post comment count
    const post = this.discussionPosts.get(comment.postId);
    if (post) {
      post.commentCount++;
      this.discussionPosts.set(post.id, post);
    }
    
    return comment;
  }

  async updateComment(id: string, updates: Partial<InsertPostComment>): Promise<PostComment> {
    const comment = this.postComments.get(id);
    if (!comment) throw new Error("Comment not found");
    const updated = { ...comment, ...updates, updatedAt: new Date() };
    this.postComments.set(id, updated);
    return updated;
  }

  async deleteComment(id: string): Promise<void> {
    const comment = this.postComments.get(id);
    if (comment) {
      // Decrement post comment count
      const post = this.discussionPosts.get(comment.postId);
      if (post && post.commentCount > 0) {
        post.commentCount--;
        this.discussionPosts.set(post.id, post);
      }
    }
    this.postComments.delete(id);
  }

  // Discussion System - Votes
  async getUserVoteForPost(userId: string, postId: string): Promise<PostVote | undefined> {
    return Array.from(this.postVotes.values())
      .find(v => v.userId === userId && v.postId === postId);
  }

  async getUserVoteForComment(userId: string, commentId: string): Promise<PostVote | undefined> {
    return Array.from(this.postVotes.values())
      .find(v => v.userId === userId && v.commentId === commentId);
  }

  async votePost(insertVote: InsertPostVote): Promise<PostVote> {
    const vote: PostVote = { ...insertVote, id: randomUUID(), createdAt: new Date() };
    this.postVotes.set(vote.id, vote);
    
    // Update vote counts
    if (vote.postId) {
      const post = this.discussionPosts.get(vote.postId);
      if (post) {
        if (vote.voteType === 'upvote') post.upvotes++;
        else post.downvotes++;
        this.discussionPosts.set(post.id, post);
      }
    } else if (vote.commentId) {
      const comment = this.postComments.get(vote.commentId);
      if (comment) {
        if (vote.voteType === 'upvote') comment.upvotes++;
        else comment.downvotes++;
        this.postComments.set(comment.id, comment);
      }
    }
    
    return vote;
  }

  async deleteVote(id: string): Promise<void> {
    const vote = this.postVotes.get(id);
    if (vote) {
      // Update vote counts
      if (vote.postId) {
        const post = this.discussionPosts.get(vote.postId);
        if (post) {
          if (vote.voteType === 'upvote' && post.upvotes > 0) post.upvotes--;
          else if (vote.voteType === 'downvote' && post.downvotes > 0) post.downvotes--;
          this.discussionPosts.set(post.id, post);
        }
      } else if (vote.commentId) {
        const comment = this.postComments.get(vote.commentId);
        if (comment) {
          if (vote.voteType === 'upvote' && comment.upvotes > 0) comment.upvotes--;
          else if (vote.voteType === 'downvote' && comment.downvotes > 0) comment.downvotes--;
          this.postComments.set(comment.id, comment);
        }
      }
    }
    this.postVotes.delete(id);
  }

  // Voice/Video Sessions
  async getSession(sessionId: string): Promise<ChannelSession | null> {
    return this.channelSessions.get(sessionId) || null;
  }

  async createSession(channelId: string, sessionToken: string, roomUrl: string, roomName: string): Promise<ChannelSession> {
    const session: ChannelSession = {
      id: randomUUID(),
      channelId,
      sessionToken,
      roomUrl,
      roomName,
      startedAt: new Date(),
      endedAt: null,
      isActive: true
    };
    this.channelSessions.set(session.id, session);
    return session;
  }

  async getActiveSession(channelId: string): Promise<ChannelSession | null> {
    const sessions = Array.from(this.channelSessions.values());
    const activeSession = sessions.find(s => s.channelId === channelId && s.isActive);
    return activeSession || null;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.channelSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.endedAt = new Date();
      this.channelSessions.set(sessionId, session);
      
      const participants = Array.from(this.sessionParticipants.values())
        .filter(p => p.sessionId === sessionId && p.isActive);
      
      participants.forEach(p => {
        p.isActive = false;
        p.leftAt = new Date();
        this.sessionParticipants.set(p.id, p);
      });
    }
  }

  async joinSession(sessionId: string, userId: string): Promise<SessionParticipant> {
    const existingParticipant = Array.from(this.sessionParticipants.values())
      .find(p => p.sessionId === sessionId && p.userId === userId);

    if (existingParticipant) {
      if (existingParticipant.isActive) {
        return existingParticipant;
      } else {
        existingParticipant.isActive = true;
        existingParticipant.leftAt = null;
        existingParticipant.joinedAt = new Date();
        this.sessionParticipants.set(existingParticipant.id, existingParticipant);
        return existingParticipant;
      }
    }

    const participant: SessionParticipant = {
      id: randomUUID(),
      sessionId,
      userId,
      joinedAt: new Date(),
      leftAt: null,
      isActive: true,
      isMuted: false,
      isVideoOn: false
    };
    this.sessionParticipants.set(participant.id, participant);
    return participant;
  }

  async leaveSession(participantId: string): Promise<void> {
    const participant = this.sessionParticipants.get(participantId);
    if (participant) {
      participant.isActive = false;
      participant.leftAt = new Date();
      this.sessionParticipants.set(participantId, participant);
    }
  }

  async getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
    return Array.from(this.sessionParticipants.values())
      .filter(p => p.sessionId === sessionId && p.isActive);
  }
}

import { db, rawClient } from "./db";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const result = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  // Unions
  async getUnion(id: string): Promise<Union | undefined> {
    const result = await db.select().from(schema.unions).where(eq(schema.unions.id, id));
    return result[0];
  }

  async getUnions(filters?: { category?: string; scope?: string; search?: string }): Promise<Union[]> {
    let query = db.select().from(schema.unions);
    
    const conditions = [];
    if (filters?.category) conditions.push(eq(schema.unions.category, filters.category));
    if (filters?.scope) conditions.push(eq(schema.unions.scope, filters.scope));
    if (filters?.search) {
      conditions.push(
        or(
          like(schema.unions.name, `%${filters.search}%`),
          like(schema.unions.description, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async createUnion(union: InsertUnion): Promise<Union> {
    const result = await db.insert(schema.unions).values(union).returning();
    return result[0];
  }

  async updateUnion(id: string, updates: Partial<Union>): Promise<Union> {
    const result = await db.update(schema.unions).set(updates).where(eq(schema.unions.id, id)).returning();
    if (!result[0]) throw new Error("Union not found");
    return result[0];
  }

  // Union Members
  async getUnionMembers(unionId: string): Promise<UnionMember[]> {
    return await db.select().from(schema.unionMembers).where(eq(schema.unionMembers.unionId, unionId));
  }

  async getUserUnions(userId: string): Promise<Union[]> {
    const members = await db.select().from(schema.unionMembers).where(eq(schema.unionMembers.userId, userId));
    const unionIds = members.map(m => m.unionId);
    if (unionIds.length === 0) return [];
    return await db.select().from(schema.unions).where(sql`${schema.unions.id} = ANY(${unionIds})`);
  }

  async getUnionMembership(unionId: string, userId: string): Promise<UnionMember | undefined> {
    const result = await db.select().from(schema.unionMembers)
      .where(and(eq(schema.unionMembers.unionId, unionId), eq(schema.unionMembers.userId, userId)));
    return result[0];
  }

  async joinUnion(member: InsertUnionMember): Promise<UnionMember> {
    const result = await db.insert(schema.unionMembers).values(member).returning();
    await db.update(schema.unions)
      .set({ memberCount: sql`${schema.unions.memberCount} + 1` })
      .where(eq(schema.unions.id, member.unionId));
    return result[0];
  }

  async leaveUnion(unionId: string, userId: string): Promise<void> {
    await db.delete(schema.unionMembers)
      .where(and(eq(schema.unionMembers.unionId, unionId), eq(schema.unionMembers.userId, userId)));
    await db.update(schema.unions)
      .set({ memberCount: sql`GREATEST(${schema.unions.memberCount} - 1, 0)` })
      .where(eq(schema.unions.id, unionId));
  }

  // Union Demands
  async getUnionDemands(unionId: string): Promise<UnionDemand[]> {
    return await db.select().from(schema.unionDemands)
      .where(eq(schema.unionDemands.unionId, unionId))
      .orderBy(desc(schema.unionDemands.priority));
  }

  async createUnionDemand(demand: InsertUnionDemand): Promise<UnionDemand> {
    const result = await db.insert(schema.unionDemands).values(demand).returning();
    return result[0];
  }

  async updateUnionDemand(id: string, updates: Partial<UnionDemand>): Promise<UnionDemand> {
    const result = await db.update(schema.unionDemands).set(updates).where(eq(schema.unionDemands.id, id)).returning();
    if (!result[0]) throw new Error("Demand not found");
    return result[0];
  }

  // Pledges
  async getUserPledges(userId: string): Promise<Pledge[]> {
    return await db.select().from(schema.pledges).where(eq(schema.pledges.userId, userId));
  }

  async getUnionPledges(unionId: string): Promise<Pledge[]> {
    return await db.select().from(schema.pledges).where(eq(schema.pledges.unionId, unionId));
  }

  async createPledge(pledge: InsertPledge): Promise<Pledge> {
    const result = await db.insert(schema.pledges).values(pledge).returning();
    await db.update(schema.unions)
      .set({ pledgedCount: sql`${schema.unions.pledgedCount} + 1` })
      .where(eq(schema.unions.id, pledge.unionId));
    return result[0];
  }

  async withdrawPledge(id: string): Promise<Pledge> {
    const result = await db.update(schema.pledges)
      .set({ status: "withdrawn" })
      .where(eq(schema.pledges.id, id))
      .returning();
    if (!result[0]) throw new Error("Pledge not found");
    await db.update(schema.unions)
      .set({ pledgedCount: sql`GREATEST(${schema.unions.pledgedCount} - 1, 0)` })
      .where(eq(schema.unions.id, result[0].unionId));
    return result[0];
  }

  // Candidates
  async getCandidate(id: string): Promise<Candidate | undefined> {
    const result = await db.select().from(schema.candidates).where(eq(schema.candidates.id, id));
    return result[0];
  }

  async getCandidates(filters?: { district?: string; state?: string }): Promise<Candidate[]> {
    let query = db.select().from(schema.candidates);
    const conditions = [];
    if (filters?.district) conditions.push(eq(schema.candidates.district, filters.district));
    if (filters?.state) conditions.push(eq(schema.candidates.state, filters.state));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return await query;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const result = await db.insert(schema.candidates).values(candidate).returning();
    return result[0];
  }

  // Candidate Commitments
  async getCandidateCommitments(candidateId: string): Promise<CandidateCommitment[]> {
    return await db.select().from(schema.candidateCommitments)
      .where(eq(schema.candidateCommitments.candidateId, candidateId));
  }

  async createCandidateCommitment(commitment: InsertCandidateCommitment): Promise<CandidateCommitment> {
    const result = await db.insert(schema.candidateCommitments).values(commitment).returning();
    return result[0];
  }

  async updateCommitmentStatus(id: string, status: string, notes?: string): Promise<CandidateCommitment> {
    const result = await db.update(schema.candidateCommitments)
      .set({ status, verificationNotes: notes })
      .where(eq(schema.candidateCommitments.id, id))
      .returning();
    if (!result[0]) throw new Error("Commitment not found");
    return result[0];
  }

  // Events
  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(schema.events).where(eq(schema.events.id, id));
    return result[0];
  }

  async getEvents(filters?: { unionId?: string; eventType?: string }): Promise<Event[]> {
    let query = db.select().from(schema.events);
    const conditions = [];
    if (filters?.unionId) conditions.push(eq(schema.events.unionId, filters.unionId));
    if (filters?.eventType) conditions.push(eq(schema.events.eventType, filters.eventType));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return await query.orderBy(schema.events.date);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(schema.events).values(event).returning();
    return result[0];
  }

  // Event Attendees
  async rsvpEvent(attendee: InsertEventAttendee): Promise<EventAttendee> {
    const result = await db.insert(schema.eventAttendees).values(attendee).returning();
    await db.update(schema.events)
      .set({ attendeeCount: sql`${schema.events.attendeeCount} + 1` })
      .where(eq(schema.events.id, attendee.eventId));
    return result[0];
  }

  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    return await db.select().from(schema.eventAttendees).where(eq(schema.eventAttendees.eventId, eventId));
  }

  // Ballots
  async getActiveBallots(unionId: string): Promise<Ballot[]> {
    return await db.select().from(schema.ballots)
      .where(and(
        eq(schema.ballots.unionId, unionId),
        eq(schema.ballots.status, "active"),
        sql`${schema.ballots.endDate} > NOW()`
      ));
  }

  async createBallot(ballot: InsertBallot): Promise<Ballot> {
    const result = await db.insert(schema.ballots).values(ballot).returning();
    return result[0];
  }

  // Votes
  async castVote(vote: InsertVote): Promise<Vote> {
    const result = await db.insert(schema.votes).values(vote).returning();
    return result[0];
  }

  async getUserVote(ballotId: string, userId: string): Promise<Vote | undefined> {
    const result = await db.select().from(schema.votes)
      .where(and(eq(schema.votes.ballotId, ballotId), eq(schema.votes.userId, userId)));
    return result[0];
  }

  // Badges
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db.select().from(schema.userBadges).where(eq(schema.userBadges.userId, userId));
  }

  async awardBadge(badge: InsertUserBadge): Promise<UserBadge> {
    const result = await db.insert(schema.userBadges).values(badge).returning();
    return result[0];
  }

  // Discussion System - Channels
  async getChannel(id: string): Promise<UnionChannel | undefined> {
    const result = await db.select().from(schema.unionChannels)
      .where(eq(schema.unionChannels.id, id))
      .limit(1);
    return result[0];
  }

  async getUnionChannels(unionId: string): Promise<UnionChannel[]> {
    return await db.select().from(schema.unionChannels)
      .where(eq(schema.unionChannels.unionId, unionId))
      .orderBy(schema.unionChannels.createdAt);
  }

  async createChannel(channel: InsertUnionChannel): Promise<UnionChannel> {
    const result = await db.insert(schema.unionChannels).values(channel).returning();
    return result[0];
  }

  async deleteChannel(id: string): Promise<void> {
    await db.delete(schema.unionChannels).where(eq(schema.unionChannels.id, id));
  }

  // Discussion System - Posts
  async getChannelPosts(channelId: string): Promise<DiscussionPost[]> {
    return await db.select().from(schema.discussionPosts)
      .where(eq(schema.discussionPosts.channelId, channelId))
      .orderBy(desc(schema.discussionPosts.createdAt));
  }

  async getPost(id: string): Promise<DiscussionPost | undefined> {
    const result = await db.select().from(schema.discussionPosts)
      .where(eq(schema.discussionPosts.id, id));
    return result[0];
  }

  async createPost(post: InsertDiscussionPost): Promise<DiscussionPost> {
    const result = await db.insert(schema.discussionPosts).values(post).returning();
    return result[0];
  }

  async updatePost(id: string, updates: Partial<InsertDiscussionPost>): Promise<DiscussionPost> {
    const result = await db.update(schema.discussionPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.discussionPosts.id, id))
      .returning();
    if (!result[0]) throw new Error("Post not found");
    return result[0];
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(schema.discussionPosts).where(eq(schema.discussionPosts.id, id));
  }

  // Discussion System - Comments
  async getPostComments(postId: string): Promise<PostComment[]> {
    return await db.select().from(schema.postComments)
      .where(eq(schema.postComments.postId, postId))
      .orderBy(schema.postComments.createdAt);
  }

  async createComment(comment: InsertPostComment): Promise<PostComment> {
    const result = await db.insert(schema.postComments).values(comment).returning();
    return result[0];
  }

  async updateComment(id: string, updates: Partial<InsertPostComment>): Promise<PostComment> {
    const result = await db.update(schema.postComments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.postComments.id, id))
      .returning();
    if (!result[0]) throw new Error("Comment not found");
    return result[0];
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(schema.postComments).where(eq(schema.postComments.id, id));
  }

  // Discussion System - Votes
  async getUserVoteForPost(userId: string, postId: string): Promise<PostVote | undefined> {
    const result = await db.select().from(schema.postVotes)
      .where(and(
        eq(schema.postVotes.userId, userId),
        eq(schema.postVotes.postId, postId)
      ));
    return result[0];
  }

  async getUserVoteForComment(userId: string, commentId: string): Promise<PostVote | undefined> {
    const result = await db.select().from(schema.postVotes)
      .where(and(
        eq(schema.postVotes.userId, userId),
        eq(schema.postVotes.commentId, commentId)
      ));
    return result[0];
  }

  async votePost(vote: InsertPostVote): Promise<PostVote> {
    const result = await db.insert(schema.postVotes).values(vote).returning();
    return result[0];
  }

  async deleteVote(id: string): Promise<void> {
    await db.delete(schema.postVotes).where(eq(schema.postVotes.id, id));
  }

  // Voice/Video Sessions
  async getSession(sessionId: string): Promise<ChannelSession | null> {
    const result = await db.select().from(schema.channelSessions)
      .where(eq(schema.channelSessions.id, sessionId))
      .limit(1);
    return result[0] || null;
  }

  async createSession(channelId: string, sessionToken: string, roomUrl: string, roomName: string): Promise<ChannelSession> {
    if (!rawClient) throw new Error("Database not available");
    
    // Use raw SQL with explicit schema prefix and map to camelCase
    const result = await rawClient`
      INSERT INTO public.channel_sessions (channel_id, session_token, room_url, room_name)
      VALUES (${channelId}, ${sessionToken}, ${roomUrl}, ${roomName})
      RETURNING 
        id,
        channel_id as "channelId",
        session_token as "sessionToken",
        room_url as "roomUrl",
        room_name as "roomName",
        started_at as "startedAt",
        ended_at as "endedAt",
        is_active as "isActive"
    `;
    return result[0];
  }

  async getActiveSession(channelId: string): Promise<ChannelSession | null> {
    if (!rawClient) return null;
    
    // Use raw SQL with explicit schema prefix to bypass search_path issues
    const result = await rawClient`
      SELECT 
        id,
        channel_id as "channelId",
        session_token as "sessionToken",
        room_url as "roomUrl",
        room_name as "roomName",
        started_at as "startedAt",
        ended_at as "endedAt",
        is_active as "isActive"
      FROM public.channel_sessions
      WHERE channel_id = ${channelId} 
      AND is_active = true
      LIMIT 1
    `;
    return result[0] || null;
  }

  async endSession(sessionId: string): Promise<void> {
    await db.update(schema.channelSessions)
      .set({ 
        isActive: false, 
        endedAt: new Date() 
      })
      .where(eq(schema.channelSessions.id, sessionId));
    
    await db.update(schema.sessionParticipants)
      .set({ 
        isActive: false, 
        leftAt: new Date() 
      })
      .where(and(
        eq(schema.sessionParticipants.sessionId, sessionId),
        eq(schema.sessionParticipants.isActive, true)
      ));
  }

  async joinSession(sessionId: string, userId: string): Promise<SessionParticipant> {
    if (!rawClient) throw new Error("Database not available");
    
    // Check for existing participant using raw SQL with camelCase mapping
    const existingParticipant = await rawClient`
      SELECT 
        id,
        session_id as "sessionId",
        user_id as "userId",
        joined_at as "joinedAt",
        left_at as "leftAt",
        is_active as "isActive",
        is_muted as "isMuted",
        is_video_on as "isVideoOn"
      FROM public.session_participants
      WHERE session_id = ${sessionId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (existingParticipant[0]) {
      if (existingParticipant[0].isActive) {
        return existingParticipant[0];
      } else {
        const reactivated = await rawClient`
          UPDATE public.session_participants
          SET is_active = true,
              left_at = NULL,
              joined_at = NOW()
          WHERE id = ${existingParticipant[0].id}
          RETURNING 
            id,
            session_id as "sessionId",
            user_id as "userId",
            joined_at as "joinedAt",
            left_at as "leftAt",
            is_active as "isActive",
            is_muted as "isMuted",
            is_video_on as "isVideoOn"
        `;
        return reactivated[0];
      }
    }

    const result = await rawClient`
      INSERT INTO public.session_participants (session_id, user_id)
      VALUES (${sessionId}, ${userId})
      RETURNING 
        id,
        session_id as "sessionId",
        user_id as "userId",
        joined_at as "joinedAt",
        left_at as "leftAt",
        is_active as "isActive",
        is_muted as "isMuted",
        is_video_on as "isVideoOn"
    `;
    return result[0];
  }

  async leaveSession(participantId: string): Promise<void> {
    await db.update(schema.sessionParticipants)
      .set({ 
        isActive: false, 
        leftAt: new Date() 
      })
      .where(eq(schema.sessionParticipants.id, participantId));
  }

  async getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
    return await db.select().from(schema.sessionParticipants)
      .where(and(
        eq(schema.sessionParticipants.sessionId, sessionId),
        eq(schema.sessionParticipants.isActive, true)
      ));
  }
}

// Using DbStorage with Supabase PostgreSQL
// Falls back to MemStorage if connection fails
export const storage = db ? new DbStorage() : new MemStorage();
