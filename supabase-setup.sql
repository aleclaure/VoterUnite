-- ====================================
-- VOTERS UNION PLATFORM - SUPABASE SETUP
-- Complete schema with Row Level Security (RLS)
-- ====================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- TABLE CREATION
-- ====================================

-- Unions table
CREATE TABLE IF NOT EXISTS unions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  scope TEXT NOT NULL,
  scope_value TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  governance_rules JSONB,
  member_count INTEGER DEFAULT 0,
  pledged_count INTEGER DEFAULT 0,
  district_count INTEGER DEFAULT 0,
  power_index DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Union Members (tracks membership and roles)
CREATE TABLE IF NOT EXISTS union_members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  union_id VARCHAR NOT NULL REFERENCES unions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'organizer', 'admin')),
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(union_id, user_id)
);

-- Union Demands
CREATE TABLE IF NOT EXISTS union_demands (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  union_id VARCHAR NOT NULL REFERENCES unions(id) ON DELETE CASCADE,
  demand_text TEXT NOT NULL,
  support_percentage DECIMAL(5,2) DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Candidates (public editorial data)
CREATE TABLE IF NOT EXISTS candidates (
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

-- Pledges (user commitments to support candidates/demands)
CREATE TABLE IF NOT EXISTS pledges (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  union_id VARCHAR NOT NULL REFERENCES unions(id) ON DELETE CASCADE,
  candidate_id VARCHAR REFERENCES candidates(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  conditions JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Candidate Commitments
CREATE TABLE IF NOT EXISTS candidate_commitments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  candidate_id VARCHAR NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  union_id VARCHAR NOT NULL REFERENCES unions(id) ON DELETE CASCADE,
  demand_id VARCHAR NOT NULL REFERENCES union_demands(id) ON DELETE CASCADE,
  commitment_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'kept', 'broken')),
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Events (organizing events)
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('canvassing', 'town_hall', 'phone_bank', 'training', 'rally', 'meeting')),
  date TIMESTAMP NOT NULL,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  union_id VARCHAR REFERENCES unions(id) ON DELETE SET NULL,
  attendee_count INTEGER DEFAULT 0,
  max_attendees INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Event Attendees (RSVP tracking)
CREATE TABLE IF NOT EXISTS event_attendees (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  event_id VARCHAR NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rsvp_status TEXT DEFAULT 'going' CHECK (rsvp_status IN ('going', 'maybe', 'not_going')),
  rsvped_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Ballots (for internal union voting)
CREATE TABLE IF NOT EXISTS ballots (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  union_id VARCHAR NOT NULL REFERENCES unions(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ballot_type TEXT NOT NULL CHECK (ballot_type IN ('demand', 'endorsement', 'initiative', 'governance')),
  options JSONB,
  voting_method TEXT DEFAULT 'simple_majority' CHECK (voting_method IN ('simple_majority', 'ranked_choice', 'approval')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Votes (individual votes on ballots)
CREATE TABLE IF NOT EXISTS votes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  ballot_id VARCHAR NOT NULL REFERENCES ballots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  choice JSONB,
  voted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(ballot_id, user_id)
);

-- User Badges (gamification)
CREATE TABLE IF NOT EXISTS user_badges (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('first_union', 'pledged', 'organizer', 'super_voter', 'activist', 'leader')),
  earned_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

CREATE INDEX IF NOT EXISTS idx_unions_creator ON unions(creator_id);
CREATE INDEX IF NOT EXISTS idx_unions_category ON unions(category);
CREATE INDEX IF NOT EXISTS idx_union_members_union ON union_members(union_id);
CREATE INDEX IF NOT EXISTS idx_union_members_user ON union_members(user_id);
CREATE INDEX IF NOT EXISTS idx_union_demands_union ON union_demands(union_id);
CREATE INDEX IF NOT EXISTS idx_pledges_user ON pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_pledges_union ON pledges(union_id);
CREATE INDEX IF NOT EXISTS idx_pledges_candidate ON pledges(candidate_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_union ON events(union_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_ballots_union ON ballots(union_id);
CREATE INDEX IF NOT EXISTS idx_ballots_creator ON ballots(creator_id);
CREATE INDEX IF NOT EXISTS idx_votes_ballot ON votes(ballot_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

-- Enable RLS on all tables
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

-- ====================================
-- UNIONS POLICIES
-- ====================================

-- Anyone can view all unions (public data)
CREATE POLICY "Unions are viewable by everyone"
  ON unions FOR SELECT
  USING (true);

-- Authenticated users can create unions
CREATE POLICY "Authenticated users can create unions"
  ON unions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own unions
CREATE POLICY "Creators can update their own unions"
  ON unions FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their own unions
CREATE POLICY "Creators can delete their own unions"
  ON unions FOR DELETE
  USING (auth.uid() = creator_id);

-- ====================================
-- UNION MEMBERS POLICIES
-- ====================================

-- Anyone can view union memberships
CREATE POLICY "Union memberships are viewable by everyone"
  ON union_members FOR SELECT
  USING (true);

-- Authenticated users can join unions
CREATE POLICY "Authenticated users can join unions"
  ON union_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own membership
CREATE POLICY "Users can update their own membership"
  ON union_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can leave unions (delete membership)
CREATE POLICY "Users can leave unions"
  ON union_members FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================
-- UNION DEMANDS POLICIES
-- ====================================

-- Anyone can view union demands
CREATE POLICY "Union demands are viewable by everyone"
  ON union_demands FOR SELECT
  USING (true);

-- Union members can create demands for their unions
CREATE POLICY "Union members can create demands"
  ON union_demands FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM union_members
      WHERE union_members.union_id = union_demands.union_id
      AND union_members.user_id = auth.uid()
    )
  );

-- Union admins can update demands
CREATE POLICY "Union admins can update demands"
  ON union_demands FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM union_members
      WHERE union_members.union_id = union_demands.union_id
      AND union_members.user_id = auth.uid()
      AND union_members.role IN ('admin', 'organizer')
    )
  );

-- Union admins can delete demands
CREATE POLICY "Union admins can delete demands"
  ON union_demands FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM union_members
      WHERE union_members.union_id = union_demands.union_id
      AND union_members.user_id = auth.uid()
      AND union_members.role IN ('admin', 'organizer')
    )
  );

-- ====================================
-- CANDIDATES POLICIES (Public Data)
-- ====================================

-- Anyone can view candidates
CREATE POLICY "Candidates are viewable by everyone"
  ON candidates FOR SELECT
  USING (true);

-- Only authenticated users can create candidates (for now - could restrict to admins later)
CREATE POLICY "Authenticated users can create candidates"
  ON candidates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update candidates
CREATE POLICY "Authenticated users can update candidates"
  ON candidates FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ====================================
-- PLEDGES POLICIES
-- ====================================

-- Users can view their own pledges
CREATE POLICY "Users can view their own pledges"
  ON pledges FOR SELECT
  USING (auth.uid() = user_id);

-- Public pledges are viewable by everyone
CREATE POLICY "Public pledges are viewable by everyone"
  ON pledges FOR SELECT
  USING (is_public = true);

-- Authenticated users can create pledges
CREATE POLICY "Authenticated users can create pledges"
  ON pledges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pledges
CREATE POLICY "Users can update their own pledges"
  ON pledges FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own pledges
CREATE POLICY "Users can delete their own pledges"
  ON pledges FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================
-- CANDIDATE COMMITMENTS POLICIES
-- ====================================

-- Anyone can view candidate commitments
CREATE POLICY "Candidate commitments are viewable by everyone"
  ON candidate_commitments FOR SELECT
  USING (true);

-- Authenticated users can create commitments
CREATE POLICY "Authenticated users can create commitments"
  ON candidate_commitments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update commitments
CREATE POLICY "Authenticated users can update commitments"
  ON candidate_commitments FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ====================================
-- EVENTS POLICIES
-- ====================================

-- Anyone can view events
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own events
CREATE POLICY "Organizers can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = organizer_id);

-- Organizers can delete their own events
CREATE POLICY "Organizers can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = organizer_id);

-- ====================================
-- EVENT ATTENDEES POLICIES
-- ====================================

-- Users can view their own RSVPs
CREATE POLICY "Users can view their own RSVPs"
  ON event_attendees FOR SELECT
  USING (auth.uid() = user_id);

-- Event organizers can view all RSVPs for their events
CREATE POLICY "Event organizers can view RSVPs"
  ON event_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_attendees.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Authenticated users can RSVP to events
CREATE POLICY "Authenticated users can RSVP to events"
  ON event_attendees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVPs
CREATE POLICY "Users can update their own RSVPs"
  ON event_attendees FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can cancel their own RSVPs
CREATE POLICY "Users can cancel their own RSVPs"
  ON event_attendees FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================
-- BALLOTS POLICIES
-- ====================================

-- Union members can view ballots for their unions
CREATE POLICY "Union members can view ballots"
  ON ballots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM union_members
      WHERE union_members.union_id = ballots.union_id
      AND union_members.user_id = auth.uid()
    )
  );

-- Union admins can create ballots
CREATE POLICY "Union admins can create ballots"
  ON ballots FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM union_members
      WHERE union_members.union_id = ballots.union_id
      AND union_members.user_id = auth.uid()
      AND union_members.role IN ('admin', 'organizer')
    )
  );

-- Ballot creators can update their ballots
CREATE POLICY "Ballot creators can update ballots"
  ON ballots FOR UPDATE
  USING (auth.uid() = creator_id);

-- ====================================
-- VOTES POLICIES
-- ====================================

-- Users can view their own votes
CREATE POLICY "Users can view their own votes"
  ON votes FOR SELECT
  USING (auth.uid() = user_id);

-- Union members can vote on ballots
CREATE POLICY "Union members can vote on ballots"
  ON votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM ballots
      JOIN union_members ON union_members.union_id = ballots.union_id
      WHERE ballots.id = votes.ballot_id
      AND union_members.user_id = auth.uid()
      AND ballots.status = 'active'
      AND NOW() BETWEEN ballots.start_date AND ballots.end_date
    )
  );

-- Votes are immutable (no updates allowed)

-- ====================================
-- USER BADGES POLICIES
-- ====================================

-- Users can view their own badges
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- System can create badges (via service role or authenticated users)
CREATE POLICY "Authenticated users can earn badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- TEST QUERIES
-- ====================================

-- Test 1: User creation and authentication
-- Run after signing up a user via Supabase Auth
-- SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Test 2: Create a union linked to user
-- INSERT INTO unions (name, description, category, scope, creator_id)
-- VALUES ('Climate Action Union', 'Fighting for climate justice', 'climate', 'national', 'YOUR_USER_UUID');

-- Test 3: Join a union
-- INSERT INTO union_members (union_id, user_id, role)
-- VALUES ('YOUR_UNION_ID', 'YOUR_USER_UUID', 'member');

-- Test 4: Create a pledge
-- INSERT INTO pledges (user_id, union_id, is_public, status)
-- VALUES ('YOUR_USER_UUID', 'YOUR_UNION_ID', true, 'active');

-- Test 5: Create an event
-- INSERT INTO events (title, description, event_type, date, organizer_id, union_id)
-- VALUES ('Town Hall Meeting', 'Discuss climate policy', 'town_hall', NOW() + INTERVAL '7 days', 'YOUR_USER_UUID', 'YOUR_UNION_ID');

-- Test 6: RSVP to event
-- INSERT INTO event_attendees (event_id, user_id, rsvp_status)
-- VALUES ('YOUR_EVENT_ID', 'YOUR_USER_UUID', 'going');

-- Test 7: Verify user can only see their own pledges
-- SELECT * FROM pledges WHERE user_id = auth.uid();

-- Test 8: Verify RLS blocks unauthorized access
-- SELECT * FROM pledges WHERE user_id != auth.uid() AND is_public = false;
-- (Should return empty if RLS is working correctly)

-- ====================================
-- UTILITY FUNCTIONS
-- ====================================

-- Function to check if user is union admin
CREATE OR REPLACE FUNCTION is_union_admin(p_union_id VARCHAR, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM union_members
    WHERE union_id = p_union_id
    AND user_id = p_user_id
    AND role IN ('admin', 'organizer')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is union member
CREATE OR REPLACE FUNCTION is_union_member(p_union_id VARCHAR, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM union_members
    WHERE union_id = p_union_id
    AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- VERIFICATION QUERIES
-- ====================================

-- Verify all tables have RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename IN (
--   'unions', 'union_members', 'union_demands', 'candidates', 'pledges',
--   'candidate_commitments', 'events', 'event_attendees', 'ballots', 'votes', 'user_badges'
-- );

-- Count policies per table
-- SELECT schemaname, tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY schemaname, tablename
-- ORDER BY tablename;
