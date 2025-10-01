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
  type UserBadge, type InsertUserBadge
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
    const user: User = { ...insertUser, id: randomUUID(), createdAt: new Date() };
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
    const memberRecords = Array.from(this.unionMembers.values()).filter(m => m.userId === userId);
    return memberRecords.map(m => this.unions.get(m.unionId)!).filter(Boolean);
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
}

export const storage = new MemStorage();
