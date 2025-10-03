-- =====================================================
-- Multi-Channel Posts & Advanced Filtering Migration
-- =====================================================
-- Run this SQL in the Supabase SQL Editor
-- This adds support for:
-- 1. Posts appearing in multiple channels (via tagging)
-- 2. Trending/Top post filtering with time ranges
-- 3. "All Posts" aggregated view
-- =====================================================

-- Step 1: Add trending_score column to discussion_posts
ALTER TABLE discussion_posts 
ADD COLUMN IF NOT EXISTS trending_score DECIMAL(10, 2) DEFAULT 0;

-- Step 2: Make channel_id nullable (posts can now be multi-channel via tags)
ALTER TABLE discussion_posts 
ALTER COLUMN channel_id DROP NOT NULL;

-- Step 3: Create post_channel_tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS post_channel_tags (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  post_id VARCHAR NOT NULL,
  channel_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT post_channel_tags_post_id_fkey 
    FOREIGN KEY (post_id) 
    REFERENCES discussion_posts(id) 
    ON DELETE CASCADE,
  CONSTRAINT post_channel_tags_channel_id_fkey 
    FOREIGN KEY (channel_id) 
    REFERENCES union_channels(id) 
    ON DELETE CASCADE,
  CONSTRAINT post_channel_tags_unique 
    UNIQUE(post_id, channel_id)
);

-- Step 4: Create indexes for performance

-- Index for post-to-channels lookups
CREATE INDEX IF NOT EXISTS idx_post_channel_tags_post 
ON post_channel_tags(post_id);

-- Index for channel-to-posts lookups
CREATE INDEX IF NOT EXISTS idx_post_channel_tags_channel 
ON post_channel_tags(channel_id);

-- Index for trending queries (high engagement posts)
CREATE INDEX IF NOT EXISTS idx_posts_trending 
ON discussion_posts(union_id, comment_count DESC, created_at DESC);

-- Index for top queries (highly voted posts)
CREATE INDEX IF NOT EXISTS idx_posts_upvotes 
ON discussion_posts(union_id, upvotes DESC, created_at DESC);

-- Index for filtering by creation time
CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON discussion_posts(created_at DESC);

-- Index for trending score sorting
CREATE INDEX IF NOT EXISTS idx_posts_trending_score 
ON discussion_posts(union_id, trending_score DESC);

-- Step 5: Migrate existing single-channel posts to use tags
-- This ensures backward compatibility by creating tags for all existing posts
INSERT INTO post_channel_tags (post_id, channel_id, created_at)
SELECT id, channel_id, created_at
FROM discussion_posts
WHERE channel_id IS NOT NULL
ON CONFLICT (post_id, channel_id) DO NOTHING;

-- Step 6: Create helper function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(
  p_upvotes INTEGER,
  p_downvotes INTEGER,
  p_comment_count INTEGER,
  p_created_at TIMESTAMP
) RETURNS DECIMAL(10, 2) AS $$
DECLARE
  net_votes INTEGER;
  hours_since_post DECIMAL;
  time_decay DECIMAL;
  comment_weight CONSTANT INTEGER := 2;
  vote_weight CONSTANT INTEGER := 1;
  score DECIMAL;
BEGIN
  -- Calculate net votes
  net_votes := p_upvotes - p_downvotes;
  
  -- Calculate hours since post (minimum 1 to avoid division issues)
  hours_since_post := GREATEST(
    EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 3600,
    1
  );
  
  -- Calculate time decay (gravity factor)
  time_decay := POWER(hours_since_post + 2, 1.5);
  
  -- Calculate trending score
  score := ((p_comment_count * comment_weight) + (net_votes * vote_weight))::DECIMAL / time_decay;
  
  RETURN ROUND(score, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 7: Create function to update trending scores
CREATE OR REPLACE FUNCTION update_trending_scores(p_union_id VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE discussion_posts
  SET trending_score = calculate_trending_score(
    upvotes,
    downvotes,
    comment_count,
    created_at
  )
  WHERE union_id = p_union_id;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Calculate initial trending scores for all posts
UPDATE discussion_posts
SET trending_score = calculate_trending_score(
  upvotes,
  downvotes,
  comment_count,
  created_at
);

-- Step 9: Enable Row Level Security (RLS) on new table
-- Note: RLS is enabled for future-proofing, though current app uses Express auth
ALTER TABLE post_channel_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view post-channel tags
CREATE POLICY "Anyone can view post channel tags"
ON post_channel_tags FOR SELECT
TO PUBLIC
USING (true);

-- RLS Policy: Authenticated users can create tags (handled by backend)
CREATE POLICY "Authenticated users can create post channel tags"
ON post_channel_tags FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- RLS Policy: Users can delete their own post's tags
CREATE POLICY "Users can delete their post channel tags"
ON post_channel_tags FOR DELETE
TO PUBLIC
USING (
  post_id IN (
    SELECT id FROM discussion_posts WHERE author_id = auth.uid()
  )
);

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Run: npm run db:push
-- 2. Verify the schema is synced with Drizzle
-- 3. Test multi-channel post creation via the API
-- =====================================================
