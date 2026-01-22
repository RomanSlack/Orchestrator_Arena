-- Orchestrator Arena - Initial Database Schema

-- No extensions needed - using gen_random_uuid() which is built-in

-- Create enum for competition status
CREATE TYPE competition_status AS ENUM ('upcoming', 'live', 'voting', 'completed');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  github_username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for username lookups
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_github_username ON profiles(github_username);

-- ============================================
-- COMPETITIONS TABLE
-- ============================================
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status competition_status DEFAULT 'upcoming' NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure proper time ordering
  CONSTRAINT valid_times CHECK (starts_at < ends_at AND ends_at < voting_ends_at)
);

-- Indexes for common queries
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_starts_at ON competitions(starts_at);
CREATE INDEX idx_competitions_ends_at ON competitions(ends_at);
CREATE INDEX idx_competitions_voting_ends_at ON competitions(voting_ends_at);

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One participation per user per competition
  UNIQUE(competition_id, user_id)
);

-- Indexes
CREATE INDEX idx_participants_competition_id ON participants(competition_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);

-- ============================================
-- SUBMISSIONS TABLE
-- ============================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  repo_url TEXT NOT NULL,
  demo_url TEXT,
  repo_created_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  yes_votes INTEGER DEFAULT 0 NOT NULL,
  no_votes INTEGER DEFAULT 0 NOT NULL,

  -- One submission per user per competition
  UNIQUE(competition_id, user_id)
);

-- Indexes
CREATE INDEX idx_submissions_competition_id ON submissions(competition_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_yes_votes ON submissions(yes_votes DESC);

-- ============================================
-- VOTES TABLE
-- ============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote BOOLEAN NOT NULL, -- true = yes, false = no
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One vote per user per submission
  UNIQUE(submission_id, user_id)
);

-- Indexes
CREATE INDEX idx_votes_submission_id ON votes(submission_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get effective status based on time
CREATE OR REPLACE FUNCTION get_effective_status(
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_voting_ends_at TIMESTAMPTZ
) RETURNS competition_status AS $$
BEGIN
  IF NOW() < p_starts_at THEN
    RETURN 'upcoming';
  ELSIF NOW() < p_ends_at THEN
    RETURN 'live';
  ELSIF NOW() < p_voting_ends_at THEN
    RETURN 'voting';
  ELSE
    RETURN 'completed';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update vote counts on submission
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote THEN
      UPDATE submissions SET yes_votes = yes_votes + 1 WHERE id = NEW.submission_id;
    ELSE
      UPDATE submissions SET no_votes = no_votes + 1 WHERE id = NEW.submission_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote THEN
      UPDATE submissions SET yes_votes = yes_votes - 1 WHERE id = OLD.submission_id;
    ELSE
      UPDATE submissions SET no_votes = no_votes - 1 WHERE id = OLD.submission_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote != NEW.vote THEN
      IF OLD.vote THEN
        UPDATE submissions SET yes_votes = yes_votes - 1, no_votes = no_votes + 1 WHERE id = NEW.submission_id;
      ELSE
        UPDATE submissions SET yes_votes = yes_votes + 1, no_votes = no_votes - 1 WHERE id = NEW.submission_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote count updates
CREATE TRIGGER trigger_update_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_competitions_updated_at
BEFORE UPDATE ON competitions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- COMPETITIONS POLICIES
-- Anyone can view competitions
CREATE POLICY "Competitions are viewable by everyone"
ON competitions FOR SELECT
USING (true);

-- Only admins can create/update competitions (for now, allow authenticated users)
CREATE POLICY "Authenticated users can create competitions"
ON competitions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Competition creators can update"
ON competitions FOR UPDATE
USING (auth.uid() = created_by);

-- PARTICIPANTS POLICIES
-- Anyone can view participants
CREATE POLICY "Participants are viewable by everyone"
ON participants FOR SELECT
USING (true);

-- Users can join competitions (when upcoming)
CREATE POLICY "Users can join competitions"
ON participants FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM competitions c
    WHERE c.id = competition_id
    AND get_effective_status(c.starts_at, c.ends_at, c.voting_ends_at) = 'upcoming'
  )
);

-- Users can leave competitions they joined
CREATE POLICY "Users can leave competitions"
ON participants FOR DELETE
USING (auth.uid() = user_id);

-- SUBMISSIONS POLICIES
-- Anyone can view submissions
CREATE POLICY "Submissions are viewable by everyone"
ON submissions FOR SELECT
USING (true);

-- Users can submit during live competition if they're participants
CREATE POLICY "Participants can submit during live"
ON submissions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM participants p
    WHERE p.competition_id = submissions.competition_id
    AND p.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM competitions c
    WHERE c.id = competition_id
    AND get_effective_status(c.starts_at, c.ends_at, c.voting_ends_at) = 'live'
  )
);

-- Users can update their own submissions during live
CREATE POLICY "Users can update own submission during live"
ON submissions FOR UPDATE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM competitions c
    WHERE c.id = competition_id
    AND get_effective_status(c.starts_at, c.ends_at, c.voting_ends_at) = 'live'
  )
);

-- VOTES POLICIES
-- Anyone can view votes
CREATE POLICY "Votes are viewable by everyone"
ON votes FOR SELECT
USING (true);

-- Users can vote during voting phase (but not on own submission)
CREATE POLICY "Users can vote during voting phase"
ON votes FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM submissions s
    WHERE s.id = submission_id
    AND s.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM submissions s
    JOIN competitions c ON c.id = s.competition_id
    WHERE s.id = submission_id
    AND get_effective_status(c.starts_at, c.ends_at, c.voting_ends_at) = 'voting'
  )
);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
ON votes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE competitions;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
