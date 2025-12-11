-- Gamification Schema for Supabase
-- Isolated tables for points, badges, and leaderboard data
-- No modifications to existing production tables

-- Table: user_points
-- Tracks cumulative points and point history for each user
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  points_balance BIGINT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  points_lifetime BIGINT NOT NULL DEFAULT 0 CHECK (points_lifetime >= 0),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_points CHECK (points_balance >= 0 AND points_lifetime >= 0)
);

-- Table: user_badges
-- Tracks earned badges for each user (one record per badge per user)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, badge_id),
  CONSTRAINT valid_badge_id CHECK (badge_id ~ '^[a-z_]+$')
);

-- Table: user_leaderboard_ranking
-- Denormalized leaderboard rankings (updated periodically)
CREATE TABLE IF NOT EXISTS user_leaderboard_ranking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_rank INT NOT NULL DEFAULT 0 CHECK (current_rank >= 0),
  rank_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ranking_period VARCHAR(20) DEFAULT 'alltime' CHECK (ranking_period IN ('weekly', 'alltime')),
  points_snapshot BIGINT DEFAULT 0,
  UNIQUE(user_id, ranking_period)
);

-- Table: point_events
-- Audit log of point award events
CREATE TABLE IF NOT EXISTS point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_amount BIGINT NOT NULL CHECK (points_amount > 0),
  action_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deduplication_key VARCHAR(255) UNIQUE,
  INDEX point_events_user_id (user_id),
  INDEX point_events_created_at (created_at),
  INDEX point_events_action_type (action_type)
);

-- Trigger: Update user_points.last_updated on insert
CREATE OR REPLACE FUNCTION update_user_points_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_points
  SET last_updated = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER point_events_timestamp_trigger
AFTER INSERT ON point_events
FOR EACH ROW
EXECUTE FUNCTION update_user_points_timestamp();

-- Enable RLS (Row Level Security) for tables
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_leaderboard_ranking ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow users to read their own data, authenticated users can read leaderboard
CREATE POLICY user_points_read ON user_points
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_badges_read ON user_badges
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_leaderboard_read ON user_leaderboard_ranking
  FOR SELECT
  USING (true); -- Public leaderboard

CREATE POLICY point_events_read ON point_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indices for performance
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_leaderboard_rank ON user_leaderboard_ranking(current_rank) WHERE ranking_period = 'alltime';
CREATE INDEX idx_leaderboard_period ON user_leaderboard_ranking(ranking_period);
CREATE INDEX idx_point_events_user_created ON point_events(user_id, created_at);
