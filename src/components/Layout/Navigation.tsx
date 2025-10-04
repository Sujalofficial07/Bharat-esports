import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export const Navigation = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/tournaments', label: 'Tournaments' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/profile', label: 'Profile' },
  ];

  if (profile?.is_admin) {
    navLinks.push({ path: '/admin', label: 'Admin' });
  }

  return (
    <nav className="bg-secondary/80 backdrop-blur-md border-b border-accent/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-aqua bg-clip-text text-transparent">
              FF Esports
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-aqua'
                    : 'text-gray-300 hover:text-aqua'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-aqua"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-4 rounded-lg font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-aqua/20 text-aqua'
                    : 'text-gray-300 hover:bg-primary/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
