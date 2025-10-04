/*
  # Free Fire Esports App Database Schema

  ## Overview
  This migration creates the complete database structure for a Free Fire Esports platform
  including user profiles, tournaments, matches, and leaderboard functionality.

  ## New Tables

  ### 1. `profiles`
  Extends auth.users with additional user information
  - `id` (uuid, references auth.users) - User ID
  - `display_name` (text) - User's display name
  - `avatar_url` (text) - Profile picture URL
  - `is_admin` (boolean) - Admin status flag
  - `total_wins` (integer) - Total tournament wins
  - `total_points` (integer) - Accumulated points
  - `kdr` (decimal) - Kill/Death ratio
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. `tournaments`
  Stores tournament information
  - `id` (uuid) - Tournament ID
  - `name` (text) - Tournament name
  - `description` (text) - Tournament description
  - `start_date` (timestamptz) - Tournament start time
  - `end_date` (timestamptz) - Tournament end time
  - `max_participants` (integer) - Maximum number of participants
  - `prize_pool` (text) - Prize information
  - `status` (text) - Tournament status (upcoming, ongoing, completed)
  - `created_by` (uuid) - Admin who created the tournament
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `tournament_participants`
  Tracks user participation in tournaments
  - `id` (uuid) - Participation ID
  - `tournament_id` (uuid) - Reference to tournament
  - `user_id` (uuid) - Reference to user profile
  - `joined_at` (timestamptz) - Join timestamp
  - `placement` (integer) - Final placement/rank
  - `points_earned` (integer) - Points earned in tournament

  ### 4. `matches`
  Records individual match results
  - `id` (uuid) - Match ID
  - `tournament_id` (uuid) - Reference to tournament
  - `match_number` (integer) - Match sequence number
  - `status` (text) - Match status (scheduled, ongoing, completed)
  - `started_at` (timestamptz) - Match start time
  - `ended_at` (timestamptz) - Match end time
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. `match_results`
  Stores individual player performance in matches
  - `id` (uuid) - Result ID
  - `match_id` (uuid) - Reference to match
  - `user_id` (uuid) - Reference to user
  - `kills` (integer) - Number of kills
  - `deaths` (integer) - Number of deaths
  - `placement` (integer) - Final placement in match
  - `points` (integer) - Points earned

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile and update non-admin fields
  - Users can view all tournaments and public leaderboard data
  - Only admins can create, update, or delete tournaments
  - Users can join tournaments and view participation data
  - Match results are readable by all authenticated users

  ## Indexes
  - Index on tournament status for quick filtering
  - Index on tournament dates for chronological queries
  - Index on leaderboard stats for ranking queries
  - Composite indexes for tournament participants

  ## Important Notes
  1. Admin privileges must be manually granted by setting `is_admin = true`
  2. KDR is automatically calculated via triggers when match results are added
  3. Realtime is enabled on tournaments table for live updates
  4. All timestamps use timestamptz for proper timezone handling
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  is_admin boolean DEFAULT false NOT NULL,
  total_wins integer DEFAULT 0 NOT NULL,
  total_points integer DEFAULT 0 NOT NULL,
  kdr decimal(10, 2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  max_participants integer DEFAULT 100 NOT NULL,
  prize_pool text,
  status text DEFAULT 'upcoming' NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create tournament_participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  placement integer,
  points_earned integer DEFAULT 0 NOT NULL,
  UNIQUE(tournament_id, user_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  match_number integer NOT NULL,
  status text DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'ongoing', 'completed')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create match_results table
CREATE TABLE IF NOT EXISTS match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  kills integer DEFAULT 0 NOT NULL,
  deaths integer DEFAULT 0 NOT NULL,
  placement integer NOT NULL,
  points integer DEFAULT 0 NOT NULL,
  UNIQUE(match_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_kdr ON profiles(kdr DESC);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Tournaments policies
CREATE POLICY "Tournaments are viewable by everyone"
  ON tournaments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete tournaments"
  ON tournaments FOR DELETE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- Tournament participants policies
CREATE POLICY "Tournament participants are viewable by everyone"
  ON tournament_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON tournament_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave tournaments"
  ON tournament_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage matches"
  ON matches FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- Match results policies
CREATE POLICY "Match results are viewable by everyone"
  ON match_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage match results"
  ON match_results FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', new.email, 'Player'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update KDR automatically
CREATE OR REPLACE FUNCTION public.update_user_kdr()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET kdr = (
    SELECT CASE
      WHEN SUM(deaths) = 0 THEN SUM(kills)::decimal
      ELSE ROUND((SUM(kills)::decimal / NULLIF(SUM(deaths), 0)), 2)
    END
    FROM match_results
    WHERE user_id = NEW.user_id
  ),
  updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update KDR when match results are added/updated
DROP TRIGGER IF EXISTS on_match_result_changed ON match_results;
CREATE TRIGGER on_match_result_changed
  AFTER INSERT OR UPDATE ON match_results
  FOR EACH ROW EXECUTE FUNCTION public.update_user_kdr();

-- Function to update profile stats when tournament completes
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS trigger AS $$
BEGIN
  IF NEW.placement = 1 THEN
    UPDATE profiles
    SET total_wins = total_wins + 1,
        total_points = total_points + NEW.points_earned,
        updated_at = now()
    WHERE id = NEW.user_id;
  ELSE
    UPDATE profiles
    SET total_points = total_points + NEW.points_earned,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile stats
DROP TRIGGER IF EXISTS on_tournament_placement_set ON tournament_participants;
CREATE TRIGGER on_tournament_placement_set
  AFTER UPDATE OF placement ON tournament_participants
  FOR EACH ROW
  WHEN (NEW.placement IS NOT NULL AND OLD.placement IS NULL)
  EXECUTE FUNCTION public.update_profile_stats();

-- Enable realtime for tournaments
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_participants;
