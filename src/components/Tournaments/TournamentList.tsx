import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tournament } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const TournamentList = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userParticipations, setUserParticipations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTournaments();
    if (user) {
      fetchUserParticipations();
    }

    const channel = supabase
      .channel('tournaments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          fetchTournaments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserParticipations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('tournament_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserParticipations(new Set(data?.map(p => p.tournament_id) || []));
    } catch (err: any) {
      console.error('Error fetching participations:', err);
    }
  };

  const joinTournament = async (tournamentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
        });

      if (error) throw error;
      setUserParticipations(prev => new Set(prev).add(tournamentId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const leaveTournament = async (tournamentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserParticipations(prev => {
        const newSet = new Set(prev);
        newSet.delete(tournamentId);
        return newSet;
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-400';
      case 'ongoing':
        return 'text-green-400 animate-pulse';
      case 'completed':
        return 'text-gray-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-aqua text-xl">Loading tournaments...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-aqua bg-clip-text text-transparent">
          Tournaments
        </h1>
        <p className="text-gray-300">Join upcoming tournaments and compete for prizes</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No tournaments available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => {
            const isJoined = userParticipations.has(tournament.id);
            const isPast = new Date(tournament.end_date) < new Date();

            return (
              <div key={tournament.id} className="card hover:border-aqua/40 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{tournament.name}</h3>
                  <span className={`text-xs uppercase font-bold ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {tournament.description || 'No description available'}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Date</span>
                    <span className="text-white">
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">End Date</span>
                    <span className="text-white">
                      {new Date(tournament.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Players</span>
                    <span className="text-white">{tournament.max_participants}</span>
                  </div>
                  {tournament.prize_pool && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prize Pool</span>
                      <span className="text-aqua font-bold">{tournament.prize_pool}</span>
                    </div>
                  )}
                </div>

                {user && !isPast && tournament.status !== 'cancelled' && (
                  <button
                    onClick={() => isJoined ? leaveTournament(tournament.id) : joinTournament(tournament.id)}
                    className={isJoined ? 'w-full py-2 px-4 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-all' : 'btn-aqua w-full'}
                  >
                    {isJoined ? 'Leave Tournament' : 'Join Tournament'}
                  </button>
                )}

                {isJoined && (
                  <div className="mt-2 text-center text-aqua text-sm font-bold animate-pulse">
                    You're registered!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
