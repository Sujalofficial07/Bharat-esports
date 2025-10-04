import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  total_wins: number;
  total_points: number;
  kdr: number;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  max_participants: number;
  prize_pool: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  joined_at: string;
  placement: number | null;
  points_earned: number;
}

export interface Match {
  id: string;
  tournament_id: string;
  match_number: number;
  status: 'scheduled' | 'ongoing' | 'completed';
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface MatchResult {
  id: string;
  match_id: string;
  user_id: string;
  kills: number;
  deaths: number;
  placement: number;
  points: number;
}
