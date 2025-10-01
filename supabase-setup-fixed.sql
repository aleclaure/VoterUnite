-- ====================================
-- VOTERS UNION PLATFORM - SUPABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (run this first if tables exist with errors)
-- DROP TABLE IF EXISTS user_badges CASCADE;
-- DROP TABLE IF EXISTS votes CASCADE;
-- DROP TABLE IF EXISTS ballots CASCADE;
-- DROP TABLE IF EXISTS event_attendees CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS candidate_commitments CASCADE;
-- DROP TABLE IF EXISTS pledges CASCADE;
-- DROP TABLE IF EXISTS candidates CASCADE;
-- DROP TABLE IF EXISTS union_demands CASCADE;
-- DROP TABLE IF EXISTS union_members CASCADE;
-- DROP TABLE IF EXISTS unions CASCADE;

-- Create tables first
CREATE TABLE unions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  scope TEXT NOT NULL,
  scope_value TEXT,
  creator_id UUID NOT NULL,
  governance_rules JSONB,
  member_count INTEGER DEFAULT 0,
  pledged_count INTEGER DEFAULT 0,
  district_count INTEGER DEFAULT 0,
  power_index DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE union_members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  union_id VARCHAR NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(union_id, user_id)
);

CREATE TABLE union_demands (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  union_id VARCHAR NOT NULL,
  demand_text TEXT NOT NULL,
  support_percentage DECIMAL(5,2) DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE candidates (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  name TEXT NOT NULL,
  party TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  position TEXT NOT NULL,
  stances JSONB,
  pledge_count INTEGER DEFAULT 0,
  alignment_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE pledges (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  user_id UUID NOT NULL,
  union_id VARCHAR NOT NULL,
  candidate_id VARCHAR,
  is_public BOOLEAN DEFAULT false,
  conditions JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE candidate_commitments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  candidate_id VARCHAR NOT NULL,
  union_id VARCHAR NOT NULL,
  demand_id VARCHAR NOT NULL,
  commitment_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  organizer_id UUID NOT NULL,
  union_id VARCHAR,
  attendee_count INTEGER DEFAULT 0,
  max_attendees INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE event_attendees (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  event_id VARCHAR NOT NULL,
  user_id UUID NOT NULL,
  rsvp_status TEXT DEFAULT 'going',
  rsvped_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

CREATE TABLE ballots (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  union_id VARCHAR NOT NULL,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ballot_type TEXT NOT NULL,
  options JSONB,
  voting_method TEXT DEFAULT 'simple_majority',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE votes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  ballot_id VARCHAR NOT NULL,
  user_id UUID NOT NULL,
  choice JSONB,
  voted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(ballot_id, user_id)
);

CREATE TABLE user_badges (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign key constraints to auth.users
ALTER TABLE unions 
  ADD CONSTRAINT unions_creator_id_fkey 
  FOREIGN KEY (creator_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE union_members 
  ADD CONSTRAINT union_members_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE union_members 
  ADD CONSTRAINT union_members_union_id_fkey 
  FOREIGN KEY (union_id) 
  REFERENCES unions(id) 
  ON DELETE CASCADE;

ALTER TABLE union_demands 
  ADD CONSTRAINT union_demands_union_id_fkey 
  FOREIGN KEY (union_id) 
  REFERENCES unions(id) 
  ON DELETE CASCADE;

ALTER TABLE pledges 
  ADD CONSTRAINT pledges_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE pledges 
  ADD CONSTRAINT pledges_union_id_fkey 
  FOREIGN KEY (union_id) 
  REFERENCES unions(id) 
  ON DELETE CASCADE;

ALTER TABLE pledges 
  ADD CONSTRAINT pledges_candidate_id_fkey 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE SET NULL;

ALTER TABLE candidate_commitments 
  ADD CONSTRAINT candidate_commitments_candidate_id_fkey 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE CASCADE;

ALTER TABLE candidate_commitments 
  ADD CONSTRAINT candidate_commitments_union_id_fkey 
  FOREIGN KEY (union_id) 
  REFERENCES unions(id) 
  ON DELETE CASCADE;

ALTER TABLE candidate_commitments 
  ADD CONSTRAINT candidate_commitments_demand_id_fkey 
  FOREIGN KEY (demand_id) 
  REFERENCES union_demands(id) 
  ON DELETE CASCADE;

ALTER TABLE events 
  ADD CONSTRAINT events_organizer_id_fkey 
  FOREIGN KEY (organizer_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE events 
  ADD CONSTRAINT events_union_id_fkey 
  FOREIGN KEY (union_id) 
  REFERENCES unions(id) 
  ON DELETE SET NULL;

ALTER TABLE event_attendees 
  ADD CONSTRAINT event_attendees_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE event_attendees 
  ADD CONSTRAINT event_attendees_event_id_fkey 
  FOREIGN KEY (event_id) 
  REFERENCES events(id) 
  ON DELETE CASCADE;

ALTER TABLE ballots 
  ADD CONSTRAINT ballots_creator_id_fkey 
  FOREIGN KEY (creator_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE ballots 
  ADD CONSTRAINT ballots_union_id_fkey 
  FOREIGN KEY (union_id) 
  REFERENCES unions(id) 
  ON DELETE CASCADE;

ALTER TABLE votes 
  ADD CONSTRAINT votes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE votes 
  ADD CONSTRAINT votes_ballot_id_fkey 
  FOREIGN KEY (ballot_id) 
  REFERENCES ballots(id) 
  ON DELETE CASCADE;

ALTER TABLE user_badges 
  ADD CONSTRAINT user_badges_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_unions_creator ON unions(creator_id);
CREATE INDEX idx_union_members_union ON union_members(union_id);
CREATE INDEX idx_union_members_user ON union_members(user_id);
CREATE INDEX idx_pledges_user ON pledges(user_id);
CREATE INDEX idx_pledges_union ON pledges(union_id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX idx_ballots_union ON ballots(union_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Enable RLS
ALTER TABLE unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE union_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE union_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballots ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Unions
CREATE POLICY "Anyone can view unions" ON unions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create unions" ON unions FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update unions" ON unions FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete unions" ON unions FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for Union Members
CREATE POLICY "Anyone can view memberships" ON union_members FOR SELECT USING (true);
CREATE POLICY "Users can join unions" ON union_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own membership" ON union_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave unions" ON union_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Union Demands
CREATE POLICY "Anyone can view demands" ON union_demands FOR SELECT USING (true);
CREATE POLICY "Members can create demands" ON union_demands FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM union_members WHERE union_members.union_id = union_demands.union_id AND union_members.user_id = auth.uid())
);

-- RLS Policies for Candidates
CREATE POLICY "Anyone can view candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create candidates" ON candidates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for Pledges
CREATE POLICY "Users can view own pledges" ON pledges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public pledges viewable" ON pledges FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create pledges" ON pledges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pledges" ON pledges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pledges" ON pledges FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Events
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update events" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete events" ON events FOR DELETE USING (auth.uid() = organizer_id);

-- RLS Policies for Event Attendees
CREATE POLICY "Users can view own RSVPs" ON event_attendees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can RSVP" ON event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update RSVPs" ON event_attendees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can cancel RSVPs" ON event_attendees FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Ballots
CREATE POLICY "Members can view ballots" ON ballots FOR SELECT USING (
  EXISTS (SELECT 1 FROM union_members WHERE union_members.union_id = ballots.union_id AND union_members.user_id = auth.uid())
);
CREATE POLICY "Admins can create ballots" ON ballots FOR INSERT WITH CHECK (
  auth.uid() = creator_id AND
  EXISTS (SELECT 1 FROM union_members WHERE union_members.union_id = ballots.union_id AND union_members.user_id = auth.uid())
);

-- RLS Policies for Votes
CREATE POLICY "Users can view own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Members can vote" ON votes FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM ballots
    JOIN union_members ON union_members.union_id = ballots.union_id
    WHERE ballots.id = votes.ballot_id
    AND union_members.user_id = auth.uid()
    AND ballots.status = 'active'
  )
);

-- RLS Policies for User Badges
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('unions', 'union_members', 'pledges', 'events', 'candidates')
ORDER BY table_name;
