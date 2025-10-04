import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tournament } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboard = () => {
  const { profile } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    max_participants: number;
    prize_pool: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  }>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    max_participants: 100,
    prize_pool: '',
    status: 'upcoming',
  });

  useEffect(() => {
    if (profile?.is_admin) {
      fetchTournaments();
    }
  }, [profile]);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (err: any) {
      console.error('Error fetching tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTournament) {
        const { error } = await supabase
          .from('tournaments')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTournament.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tournaments')
          .insert({
            ...formData,
            created_by: profile?.id,
          });

        if (error) throw error;
      }

      resetForm();
      fetchTournaments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description || '',
      start_date: tournament.start_date.split('T')[0],
      end_date: tournament.end_date.split('T')[0],
      max_participants: tournament.max_participants,
      prize_pool: tournament.prize_pool || '',
      status: tournament.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTournaments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      max_participants: 100,
      prize_pool: '',
      status: 'upcoming',
    });
    setEditingTournament(null);
    setShowForm(false);
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-gray-300">You must be an admin to access this page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-aqua text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-aqua bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-300">Manage tournaments and events</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-aqua"
        >
          {showForm ? 'Cancel' : 'Create Tournament'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tournament Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field w-full"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                  className="input-field w-full"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prize Pool
                </label>
                <input
                  type="text"
                  value={formData.prize_pool}
                  onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                  className="input-field w-full"
                  placeholder="$1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="input-field w-full"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn-aqua flex-1">
                {editingTournament ? 'Update Tournament' : 'Create Tournament'}
              </button>
              {editingTournament && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Tournaments</h2>
        {tournaments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No tournaments created yet</p>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-primary/50 rounded-lg p-4 border border-accent/20 hover:border-aqua/40 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{tournament.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {tournament.description || 'No description'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-300">
                        {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                      </span>
                      <span className={`font-bold ${
                        tournament.status === 'ongoing' ? 'text-green-400' :
                        tournament.status === 'upcoming' ? 'text-blue-400' :
                        tournament.status === 'completed' ? 'text-gray-400' :
                        'text-red-400'
                      }`}>
                        {tournament.status.toUpperCase()}
                      </span>
                      {tournament.prize_pool && (
                        <span className="text-aqua font-bold">{tournament.prize_pool}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tournament)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tournament.id)}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
