import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/supabase';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'points' | 'wins' | 'kdr'>('points');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      let query = supabase.from('profiles').select('*');

      switch (sortBy) {
        case 'points':
          query = query.order('total_points', { ascending: false });
          break;
        case 'wins':
          query = query.order('total_wins', { ascending: false });
          break;
        case 'kdr':
          query = query.order('kdr', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-aqua text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-aqua bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-gray-300">Top players in the Free Fire Esports community</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy('points')}
            className={sortBy === 'points' ? 'btn-aqua' : 'px-6 py-2 rounded-lg bg-primary border border-accent/30 hover:border-aqua/50 transition-all'}
          >
            Total Points
          </button>
          <button
            onClick={() => setSortBy('wins')}
            className={sortBy === 'wins' ? 'btn-aqua' : 'px-6 py-2 rounded-lg bg-primary border border-accent/30 hover:border-aqua/50 transition-all'}
          >
            Total Wins
          </button>
          <button
            onClick={() => setSortBy('kdr')}
            className={sortBy === 'kdr' ? 'btn-aqua' : 'px-6 py-2 rounded-lg bg-primary border border-accent/30 hover:border-aqua/50 transition-all'}
          >
            K/D Ratio
          </button>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No players on leaderboard yet</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-accent/20">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">Rank</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">Player</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold">Wins</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold">Points</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold">K/D</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={player.id}
                      className="border-b border-accent/10 hover:bg-primary/50 transition-colors"
                    >
                      <td className={`py-4 px-4 font-bold ${getRankColor(rank)}`}>
                        {getRankIcon(rank)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {player.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              alt={player.display_name}
                              className="w-10 h-10 rounded-full border-2 border-aqua/50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-aqua flex items-center justify-center text-sm font-bold text-black">
                              {player.display_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{player.display_name}</div>
                            {player.is_admin && (
                              <span className="text-xs text-accent font-bold">ADMIN</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-aqua">
                        {player.total_wins}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-aqua">
                        {player.total_points.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-aqua">
                        {player.kdr.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
