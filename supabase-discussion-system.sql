-- ====================================
-- UNION DISCUSSION SYSTEM - SUPABASE SQL
-- Discord-like channels + Reddit-style threaded discussions
-- ====================================

-- 1. UNION CHANNELS (Discord-like tabs)
CREATE TABLE IF NOT EXISTS union_channels (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  union_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  channel_type TEXT DEFAULT 'text' CHECK (channel_type IN ('text', 'voice', 'video')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign keys
ALTER TABLE union_channels 
  ADD CONSTRAINT union_channels_union_id_fkey 
  FOREIGN KEY (union_id) 
  REFERENCES unions(id) 
  ON DELETE CASCADE;

ALTER TABLE union_channels 
  ADD CONSTRAINT union_channels_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 2. DISCUSSION POSTS (Reddit-style posts)
CREATE TABLE IF NOT EXISTS discussion_posts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  union_id VARCHAR NOT NULL,
  channel_id VARCHAR NOT NULL,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign keys
ALTER TABLE discussion_posts 
  ADD CONSTRAINT discussion_posts_union_id_fkey 
  FOREIGN KEY (union_id) 
  REFERENCES unions(id) 
  ON DELETE CASCADE;

ALTER TABLE discussion_posts 
  ADD CONSTRAINT discussion_posts_channel_id_fkey 
  FOREIGN KEY (channel_id) 
  REFERENCES union_channels(id) 
  ON DELETE CASCADE;

ALTER TABLE discussion_posts 
  ADD CONSTRAINT discussion_posts_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 3. POST COMMENTS (Nested threading like Reddit)
CREATE TABLE IF NOT EXISTS post_comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  post_id VARCHAR NOT NULL,
  parent_comment_id VARCHAR,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign keys
ALTER TABLE post_comments 
  ADD CONSTRAINT post_comments_post_id_fkey 
  FOREIGN KEY (post_id) 
  REFERENCES discussion_posts(id) 
  ON DELETE CASCADE;

ALTER TABLE post_comments 
  ADD CONSTRAINT post_comments_parent_comment_id_fkey 
  FOREIGN KEY (parent_comment_id) 
  REFERENCES post_comments(id) 
  ON DELETE CASCADE;

ALTER TABLE post_comments 
  ADD CONSTRAINT post_comments_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 4. POST VOTES (Track upvotes/downvotes)
CREATE TABLE IF NOT EXISTS post_votes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  user_id UUID NOT NULL,
  post_id VARCHAR,
  comment_id VARCHAR,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Add foreign keys
ALTER TABLE post_votes 
  ADD CONSTRAINT post_votes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE post_votes 
  ADD CONSTRAINT post_votes_post_id_fkey 
  FOREIGN KEY (post_id) 
  REFERENCES discussion_posts(id) 
  ON DELETE CASCADE;

ALTER TABLE post_votes 
  ADD CONSTRAINT post_votes_comment_id_fkey 
  FOREIGN KEY (comment_id) 
  REFERENCES post_comments(id) 
  ON DELETE CASCADE;

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

CREATE INDEX IF NOT EXISTS idx_union_channels_union ON union_channels(union_id);
CREATE INDEX IF NOT EXISTS idx_union_channels_created_by ON union_channels(created_by);

CREATE INDEX IF NOT EXISTS idx_discussion_posts_union ON discussion_posts(union_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_channel ON discussion_posts(channel_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_author ON discussion_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_created_at ON discussion_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author ON post_comments(author_id);

CREATE INDEX IF NOT EXISTS idx_post_votes_user ON post_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_post ON post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_comment ON post_votes(comment_id);

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

-- Enable RLS
ALTER TABLE union_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;

-- UNION CHANNELS POLICIES
-- Anyone can view channels
CREATE POLICY "Anyone can view union channels"
  ON union_channels FOR SELECT
  USING (true);

-- Union admins/organizers can create channels
CREATE POLICY "Union admins can create channels"
  ON union_channels FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM union_members
      WHERE union_members.union_id = union_channels.union_id
      AND union_members.user_id = auth.uid()
      AND union_members.role IN ('admin', 'organizer')
    )
  );

-- Creators can update/delete their channels
CREATE POLICY "Channel creators can manage channels"
  ON union_channels FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Channel creators can delete channels"
  ON union_channels FOR DELETE
  USING (auth.uid() = created_by);

-- DISCUSSION POSTS POLICIES
-- Anyone can view posts
CREATE POLICY "Anyone can view discussion posts"
  ON discussion_posts FOR SELECT
  USING (true);

-- Authenticated union members can create posts
CREATE POLICY "Union members can create posts"
  ON discussion_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM union_members
      WHERE union_members.union_id = discussion_posts.union_id
      AND union_members.user_id = auth.uid()
    )
  );

-- Authors can update their own posts
CREATE POLICY "Authors can update their posts"
  ON discussion_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete their posts"
  ON discussion_posts FOR DELETE
  USING (auth.uid() = author_id);

-- POST COMMENTS POLICIES
-- Anyone can view comments
CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own comments
CREATE POLICY "Authors can update their comments"
  ON post_comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "Authors can delete their comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = author_id);

-- POST VOTES POLICIES
-- Users can view their own votes
CREATE POLICY "Users can view their own votes"
  ON post_votes FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
  ON post_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes (change upvote to downvote)
CREATE POLICY "Users can update their votes"
  ON post_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own votes (unvote)
CREATE POLICY "Users can delete their votes"
  ON post_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================
-- UTILITY FUNCTIONS
-- ====================================

-- Function to update post upvote/downvote counts
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE discussion_posts
      SET 
        upvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = NEW.post_id AND vote_type = 'upvote'),
        downvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = NEW.post_id AND vote_type = 'downvote')
      WHERE id = NEW.post_id;
    END IF;
    
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE post_comments
      SET 
        upvotes = (SELECT COUNT(*) FROM post_votes WHERE comment_id = NEW.comment_id AND vote_type = 'upvote'),
        downvotes = (SELECT COUNT(*) FROM post_votes WHERE comment_id = NEW.comment_id AND vote_type = 'downvote')
      WHERE id = NEW.comment_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE discussion_posts
      SET 
        upvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = OLD.post_id AND vote_type = 'upvote'),
        downvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = OLD.post_id AND vote_type = 'downvote')
      WHERE id = OLD.post_id;
    END IF;
    
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE post_comments
      SET 
        upvotes = (SELECT COUNT(*) FROM post_votes WHERE comment_id = OLD.comment_id AND vote_type = 'upvote'),
        downvotes = (SELECT COUNT(*) FROM post_votes WHERE comment_id = OLD.comment_id AND vote_type = 'downvote')
      WHERE id = OLD.comment_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update vote counts
CREATE TRIGGER update_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON post_votes
FOR EACH ROW EXECUTE FUNCTION update_post_vote_counts();

-- Function to update comment count on posts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE discussion_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE discussion_posts
    SET comment_count = comment_count - 1
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update comment counts
CREATE TRIGGER update_comment_count_trigger
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Function to set comment depth
CREATE OR REPLACE FUNCTION set_comment_depth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_comment_id IS NULL THEN
    NEW.depth := 0;
  ELSE
    SELECT depth + 1 INTO NEW.depth
    FROM post_comments
    WHERE id = NEW.parent_comment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set comment depth
CREATE TRIGGER set_comment_depth_trigger
BEFORE INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION set_comment_depth();

-- ====================================
-- VERIFICATION QUERIES
-- ====================================

-- Verify all tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('union_channels', 'discussion_posts', 'post_comments', 'post_votes')
ORDER BY table_name;

-- Count RLS policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('union_channels', 'discussion_posts', 'post_comments', 'post_votes')
GROUP BY tablename
ORDER BY tablename;
