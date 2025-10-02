import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  zipCode: text("zip_code"),
  district: text("district"),
  state: text("state"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Unions table
export const unions = pgTable("unions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // climate, housing, healthcare, etc.
  scope: text("scope").notNull(), // national, state, district, city
  scopeValue: text("scope_value"), // state code, district number, city name
  creatorId: uuid("creator_id").notNull(),
  governanceRules: jsonb("governance_rules"), // decision-making method, voting rules
  memberCount: integer("member_count").default(0),
  pledgedCount: integer("pledged_count").default(0),
  districtCount: integer("district_count").default(0),
  powerIndex: decimal("power_index", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Union Members
export const unionMembers = pgTable("union_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unionId: varchar("union_id").references(() => unions.id).notNull(),
  userId: uuid("user_id").notNull(),
  role: text("role").default("member"), // member, organizer, admin
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Union Demands
export const unionDemands = pgTable("union_demands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unionId: varchar("union_id").references(() => unions.id).notNull(),
  demandText: text("demand_text").notNull(),
  supportPercentage: decimal("support_percentage", { precision: 5, scale: 2 }).default("0"),
  voteCount: integer("vote_count").default(0),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pledges
export const pledges = pgTable("pledges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  unionId: varchar("union_id").references(() => unions.id).notNull(),
  candidateId: varchar("candidate_id").references(() => candidates.id),
  isPublic: boolean("is_public").default(false),
  conditions: jsonb("conditions"), // demands that must be met
  status: text("status").default("active"), // active, withdrawn
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Candidates
export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  party: text("party").notNull(),
  district: text("district").notNull(),
  state: text("state").notNull(),
  position: text("position").notNull(), // congress, senate, mayor, etc.
  stances: jsonb("stances"), // {climate: "support", housing: "oppose", ...}
  pledgeCount: integer("pledge_count").default(0),
  alignmentScore: decimal("alignment_score", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Candidate Commitments
export const candidateCommitments = pgTable("candidate_commitments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").references(() => candidates.id).notNull(),
  unionId: varchar("union_id").references(() => unions.id).notNull(),
  demandId: varchar("demand_id").references(() => unionDemands.id).notNull(),
  commitmentText: text("commitment_text").notNull(),
  status: text("status").default("pending"), // pending, kept, broken
  verificationNotes: text("verification_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // canvassing, town_hall, phone_bank, training
  date: timestamp("date").notNull(),
  location: text("location"),
  isVirtual: boolean("is_virtual").default(false),
  organizerId: varchar("organizer_id").references(() => users.id).notNull(),
  unionId: varchar("union_id").references(() => unions.id),
  attendeeCount: integer("attendee_count").default(0),
  maxAttendees: integer("max_attendees"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event Attendees
export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  rsvpStatus: text("rsvp_status").default("going"), // going, maybe, not_going
  rsvpedAt: timestamp("rsvped_at").defaultNow().notNull(),
});

// Ballots (for internal union voting)
export const ballots = pgTable("ballots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unionId: varchar("union_id").references(() => unions.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ballotType: text("ballot_type").notNull(), // demand, endorsement, initiative
  options: jsonb("options"), // array of options to vote on
  votingMethod: text("voting_method").default("simple_majority"), // simple_majority, ranked_choice
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active"), // active, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Votes
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ballotId: varchar("ballot_id").references(() => ballots.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  choice: jsonb("choice"), // can be single choice or ranked choices
  votedAt: timestamp("voted_at").defaultNow().notNull(),
});

// User Badges
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeType: text("badge_type").notNull(), // first_union, pledged, organizer, etc.
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Discussion System Tables

// Union Channels (Discord-like tabs)
export const unionChannels = pgTable("union_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unionId: varchar("union_id").references(() => unions.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  channelType: text("channel_type").default("text"), // text, voice, video
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Discussion Posts (Reddit-style posts)
export const discussionPosts = pgTable("discussion_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unionId: varchar("union_id").references(() => unions.id).notNull(),
  channelId: varchar("channel_id").references(() => unionChannels.id).notNull(),
  authorId: uuid("author_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Post Comments (Nested threading - self-reference handled by SQL)
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => discussionPosts.id).notNull(),
  parentCommentId: varchar("parent_comment_id"), // Self-reference via SQL foreign key
  authorId: uuid("author_id").notNull(),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  depth: integer("depth").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Post Votes (Track upvotes/downvotes)
export const postVotes = pgTable("post_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  postId: varchar("post_id").references(() => discussionPosts.id),
  commentId: varchar("comment_id").references(() => postComments.id),
  voteType: text("vote_type").notNull(), // upvote, downvote
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Voice/Video Session Tables

// Channel Sessions (Active voice/video rooms)
export const channelSessions = pgTable("channel_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").references(() => unionChannels.id).notNull(),
  sessionToken: varchar("session_token").notNull(),
  roomUrl: text("room_url").notNull(),
  roomName: varchar("room_name").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Session Participants (Who's in each room)
export const sessionParticipants = pgTable("session_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => channelSessions.id).notNull(),
  userId: uuid("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true).notNull(),
  isMuted: boolean("is_muted").default(false).notNull(),
  isVideoOn: boolean("is_video_on").default(false).notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertUnionSchema = createInsertSchema(unions).omit({ id: true, createdAt: true, memberCount: true, pledgedCount: true, districtCount: true, powerIndex: true });
export const insertUnionMemberSchema = createInsertSchema(unionMembers).omit({ id: true, joinedAt: true });
export const insertUnionDemandSchema = createInsertSchema(unionDemands).omit({ id: true, createdAt: true, supportPercentage: true, voteCount: true });
export const insertPledgeSchema = createInsertSchema(pledges).omit({ id: true, createdAt: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true, createdAt: true, pledgeCount: true, alignmentScore: true });
export const insertCandidateCommitmentSchema = createInsertSchema(candidateCommitments).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, attendeeCount: true });
export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).omit({ id: true, rsvpedAt: true });
export const insertBallotSchema = createInsertSchema(ballots).omit({ id: true, createdAt: true });
export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, votedAt: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export const insertUnionChannelSchema = createInsertSchema(unionChannels).omit({ id: true, createdAt: true });
export const insertDiscussionPostSchema = createInsertSchema(discussionPosts).omit({ id: true, createdAt: true, updatedAt: true, upvotes: true, downvotes: true, commentCount: true });
export const insertPostCommentSchema = createInsertSchema(postComments).omit({ id: true, createdAt: true, updatedAt: true, upvotes: true, downvotes: true, depth: true });
export const insertPostVoteSchema = createInsertSchema(postVotes).omit({ id: true, createdAt: true });
export const insertChannelSessionSchema = createInsertSchema(channelSessions).omit({ id: true, startedAt: true, isActive: true });
export const insertSessionParticipantSchema = createInsertSchema(sessionParticipants).omit({ id: true, joinedAt: true, isActive: true, isMuted: true, isVideoOn: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Union = typeof unions.$inferSelect;
export type InsertUnion = z.infer<typeof insertUnionSchema>;
export type UnionMember = typeof unionMembers.$inferSelect;
export type InsertUnionMember = z.infer<typeof insertUnionMemberSchema>;
export type UnionDemand = typeof unionDemands.$inferSelect;
export type InsertUnionDemand = z.infer<typeof insertUnionDemandSchema>;
export type Pledge = typeof pledges.$inferSelect;
export type InsertPledge = z.infer<typeof insertPledgeSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type CandidateCommitment = typeof candidateCommitments.$inferSelect;
export type InsertCandidateCommitment = z.infer<typeof insertCandidateCommitmentSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;
export type Ballot = typeof ballots.$inferSelect;
export type InsertBallot = z.infer<typeof insertBallotSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UnionChannel = typeof unionChannels.$inferSelect;
export type InsertUnionChannel = z.infer<typeof insertUnionChannelSchema>;
export type DiscussionPost = typeof discussionPosts.$inferSelect;
export type InsertDiscussionPost = z.infer<typeof insertDiscussionPostSchema>;
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostVote = typeof postVotes.$inferSelect;
export type InsertPostVote = z.infer<typeof insertPostVoteSchema>;
export type ChannelSession = typeof channelSessions.$inferSelect;
export type InsertChannelSession = z.infer<typeof insertChannelSessionSchema>;
export type SessionParticipant = typeof sessionParticipants.$inferSelect;
export type InsertSessionParticipant = z.infer<typeof insertSessionParticipantSchema>;
