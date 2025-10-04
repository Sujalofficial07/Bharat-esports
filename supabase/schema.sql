-- Users and Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  gamer_id TEXT,
  avatar_url TEXT,
  xp INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  entry_fee INT DEFAULT 0,
  prize_pool INT NOT NULL,
  slots INT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming', -- upcoming, live, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams and Participants
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  captain_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tournament_participants (
  id SERIAL PRIMARY KEY,
  tournament_id INT REFERENCES tournaments(id),
  team_id INT REFERENCES teams(id),
  user_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Wallet
CREATE TABLE wallet (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  balance INT DEFAULT 0
);

CREATE TABLE wallet_transactions (
  id SERIAL PRIMARY KEY,
  wallet_id UUID REFERENCES wallet(id),
  amount INT NOT NULL,
  type TEXT NOT NULL, -- credit, debit
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboards (can be a view or a table updated by triggers)
CREATE VIEW global_leaderboard AS
SELECT
  p.username,
  p.gamer_id,
  p.xp
FROM profiles p
ORDER BY p.xp DESC;

-- Security Policies (Row-Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Enable RLS for other tables...
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own wallet." ON wallet FOR ALL USING (auth.uid() = id);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions." ON wallet_transactions FOR SELECT USING (auth.uid() = wallet_id);
