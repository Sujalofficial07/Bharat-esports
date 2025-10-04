# Free Fire Esports App - Setup Guide

A mobile-friendly Free Fire Esports tournament platform with Supabase backend, Google OAuth, Phone OTP authentication, and real-time updates.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Styling**: Tailwind CSS (black + purple theme, glowing aqua buttons)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Authentication**: Google OAuth & Phone OTP
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (optional)

## Features

### User Features
- Sign in with Google or Phone OTP
- User profile with stats (wins, points, K/D ratio)
- Browse and join tournaments
- View real-time leaderboard
- Receive real-time tournament updates

### Admin Features
- Admin dashboard (requires `is_admin=true` in database)
- Create, edit, delete tournaments
- Manage tournament status (upcoming, ongoing, completed, cancelled)

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- A Supabase account
- Git for version control

## Local Development Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd <project-directory>
npm install
```

### 2. Environment Variables

The project already has a `.env` file with Supabase credentials configured. Verify it contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Database Setup

You need to run the database migration to create all required tables. Save the following SQL migration and execute it in your Supabase SQL Editor:

#### Database Schema

The schema includes these tables:
- `profiles` - User profiles extending auth.users
- `tournaments` - Tournament information
- `tournament_participants` - User participation tracking
- `matches` - Individual match records
- `match_results` - Player performance in matches

**To apply the schema:**

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the SQL from `docs/database-migration.sql` (create this file with the migration content)
4. Execute the SQL

Key features:
- Row Level Security (RLS) enabled on all tables
- Automatic profile creation on user signup
- Automatic KDR calculation
- Real-time subscriptions for tournaments

### 4. Configure Supabase Authentication

#### Enable Google OAuth:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your OAuth credentials from Google Cloud Console
4. Set redirect URL: `http://localhost:5173` (for local dev)

#### Enable Phone Authentication:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Phone provider
3. Configure your SMS provider (Twilio recommended)
4. Add your Twilio credentials

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Create Admin User

To access the admin dashboard:

1. Sign up/in to the app
2. Go to Supabase Dashboard → Table Editor → profiles
3. Find your user record
4. Set `is_admin = true`
5. Refresh the app - you'll now see the Admin link in navigation

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### GitHub Actions CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs on every push to main/master
- Installs dependencies
- Runs linting
- Builds the project
- Optionally deploys to Vercel

**Required GitHub Secrets:**
- `VITE_SUPABASE_URL` - Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VERCEL_TOKEN` - (Optional) Your Vercel token for deployment
- `VERCEL_ORG_ID` - (Optional) Your Vercel organization ID
- `VERCEL_PROJECT_ID` - (Optional) Your Vercel project ID

## Mobile-Friendly Development

This app is optimized for mobile devices:
- Responsive design with mobile-first approach
- Touch-friendly buttons and navigation
- Mobile menu for small screens
- Works on StackBlitz, Replit, and similar platforms

### Testing on Mobile:
1. Start dev server: `npm run dev`
2. Find your local IP address
3. Access from mobile: `http://YOUR_IP:5173`

Or use online platforms:
- **StackBlitz**: Import GitHub repo directly
- **Replit**: Fork and run
- **CodeSandbox**: Import and deploy

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   └── AdminDashboard.tsx     # Admin tournament management
│   │   ├── Auth/
│   │   │   └── Login.tsx              # Google & Phone auth
│   │   ├── Leaderboard/
│   │   │   └── Leaderboard.tsx        # Rankings display
│   │   ├── Layout/
│   │   │   └── Navigation.tsx         # Navigation bar
│   │   ├── Profile/
│   │   │   └── UserProfile.tsx        # User stats page
│   │   └── Tournaments/
│   │       └── TournamentList.tsx     # Tournament browsing
│   ├── contexts/
│   │   └── AuthContext.tsx            # Auth state management
│   ├── lib/
│   │   └── supabase.ts                # Supabase client & types
│   ├── App.tsx                        # Main app & routing
│   ├── index.css                      # Global styles
│   └── main.tsx                       # App entry point
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions config
├── .env                               # Environment variables
├── tailwind.config.js                 # Tailwind configuration
├── postcss.config.js                  # PostCSS configuration
└── vite.config.ts                     # Vite configuration
```

## Design System

### Colors
- **Primary Background**: Black (#0a0a0f)
- **Secondary Background**: Dark Purple (#1a0b2e, #2d1654)
- **Accent**: Purple (#7b2cbf, #9d4edd)
- **Aqua Buttons**: Cyan (#00f5ff, #6efff9)

### Components
- `.btn-aqua` - Glowing aqua gradient buttons with hover effects
- `.card` - Translucent cards with purple borders
- `.input-field` - Dark input fields with aqua focus states

## Troubleshooting

### Authentication Issues
- Verify OAuth credentials are correct
- Check redirect URLs match your domain
- Ensure Email confirmation is disabled in Supabase for testing

### Database Connection Issues
- Verify `.env` variables are correct
- Check Supabase project is not paused
- Ensure RLS policies are properly set up

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall if needed
- Check Node.js version is 18 or higher

## Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

## License

MIT
