import { useAuth } from '../../contexts/AuthContext';

export const UserProfile = () => {
  const { profile, signOut } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-aqua">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-24 h-24 rounded-full border-4 border-aqua shadow-glow-aqua"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-aqua flex items-center justify-center text-3xl font-bold text-black">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            {profile.is_admin && (
              <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-bold">
                ADMIN
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{profile.display_name}</h1>
            <p className="text-gray-400">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>

          <button
            onClick={signOut}
            className="btn-aqua"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/50 rounded-lg p-6 text-center border border-accent/20">
            <div className="text-4xl font-bold text-aqua mb-2">{profile.total_wins}</div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">Total Wins</div>
          </div>

          <div className="bg-primary/50 rounded-lg p-6 text-center border border-accent/20">
            <div className="text-4xl font-bold text-aqua mb-2">{profile.total_points.toLocaleString()}</div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">Total Points</div>
          </div>

          <div className="bg-primary/50 rounded-lg p-6 text-center border border-accent/20">
            <div className="text-4xl font-bold text-aqua mb-2">{profile.kdr.toFixed(2)}</div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">K/D Ratio</div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-accent/20">
          <h2 className="text-xl font-bold mb-4">Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Win Rate</span>
              <span className="text-aqua font-bold">
                {profile.total_wins > 0 ? '100%' : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Average Points per Game</span>
              <span className="text-aqua font-bold">
                {profile.total_wins > 0 ? Math.round(profile.total_points / profile.total_wins) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Rank</span>
              <span className="text-aqua font-bold">TBD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
