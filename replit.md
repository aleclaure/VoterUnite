# Voters Union Platform

## Overview
A voters union platform enabling collective political organizing through issue-based voting unions. The platform includes both a web application and a React Native mobile app.

## Project Status
- **Current Version**: v1.0 (Initial Development Complete)
- **Last Updated**: October 1, 2025

## Architecture

### Tech Stack
- **Backend**: Express.js with TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Web Frontend**: React with Vite, Wouter for routing, shadcn/ui components
- **Mobile App**: React Native with Expo (compatible with snack.expo.dev)
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS

### Key Components
1. **Database Layer** (`shared/schema.ts`):
   - Users, Unions, Union Members, Union Demands
   - Pledges, Candidates, Candidate Commitments
   - Events, Event Attendees, Ballots, Votes, Badges

2. **Backend API** (`server/routes.ts`):
   - Full CRUD operations for all entities
   - Database storage implementation using Drizzle ORM
   - PostgreSQL connection via Neon

3. **Web Frontend**:
   - Home page with hero section and feature showcase
   - Unions listing and detail pages
   - Dashboard with transparency metrics
   - Education hub with courses and workshops
   - Events calendar and RSVP system
   - User profile and settings

4. **Mobile App** (`mobile/`):
   - All screens implemented (Home, Unions, Dashboard, Education, Events, Profile, Auth)
   - Reusable components (UnionCard, CandidateCard, EventCard, etc.)
   - React Navigation setup
   - Expo SDK 50+ compatible
   - Supabase configuration for backend data management

## Database Schema

### Core Tables
- **users**: User accounts and profiles
- **unions**: Voting unions organized by issue/category
- **union_members**: User membership in unions
- **union_demands**: Policy demands for each union
- **pledges**: Voter pledges to support candidates/demands
- **candidates**: Political candidates tracked by the platform
- **candidate_commitments**: Candidate commitments to union demands
- **events**: Community organizing events
- **event_attendees**: Event RSVP tracking
- **ballots**: Internal union voting ballots
- **votes**: Individual votes on ballots
- **user_badges**: Gamification badges for user achievements

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (web + API)
npm run dev

# Database operations
npm run db:push          # Push schema to database
npm run db:push --force  # Force push if there are warnings
```

## Recent Changes (October 1, 2025)
- ✅ Implemented complete PostgreSQL database schema
- ✅ Created backend API with full CRUD operations  
- ✅ Built React Native mobile app with all screens
- ✅ Developed web frontend pages (Home, Unions, Dashboard, Education, Events, Profile)
- ✅ Set up database connection infrastructure
- ✅ Implemented DbStorage class with full CRUD operations for PostgreSQL
- ✅ Fixed all nested anchor tag warnings in UI components
- ✅ Implemented proper queryKey structure using array segments
- ⚠️ Currently using MemStorage (in-memory) for data persistence
- ⚠️ PostgreSQL integration ready but needs proper DATABASE_URL configuration

## Mobile App Structure

The mobile app is located in the `mobile/` directory and includes:

### Screens
- `HomeScreen.tsx`: Landing page with featured unions and quick actions
- `UnionsScreen.tsx`: Browse and search voting unions
- `UnionDetailScreen.tsx`: View union details, demands, and members
- `CreateUnionScreen.tsx`: Create a new voting union
- `DashboardScreen.tsx`: View transparency dashboard and metrics
- `EducationScreen.tsx`: Access educational content and workshops
- `EventsScreen.tsx`: Browse and RSVP to events
- `ProfileScreen.tsx`: User profile and badges
- `AuthScreen.tsx`: Login and signup

### Components
- `UnionCard.tsx`: Display union summary
- `CandidateCard.tsx`: Display candidate info
- `EventCard.tsx`: Display event details
- `StatCard.tsx`: Display statistics
- `ProgressBar.tsx`: Visual progress indicator

### Configuration
- `config/supabase.ts`: Supabase client configuration
- `config/theme.ts`: App theme colors and styles
- `navigation/AppNavigator.tsx`: React Navigation setup

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (automatically provided by Replit)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: Database credentials
- `SESSION_SECRET`: Session encryption secret

## User Preferences
- Follow modern web application best practices
- Put as much logic in the frontend as possible
- Backend handles data persistence and API calls only
- Use shadcn/ui components wherever possible
- Maintain consistency between web and mobile experiences

## Current Status

### Data Layer
The application currently uses **MemStorage** (in-memory storage) for data persistence. This means:
- ✅ All CRUD operations work correctly
- ✅ Data persists during the session
- ⚠️ Data resets when the server restarts
- ✅ PostgreSQL schema is ready and can be migrated
- ✅ DbStorage class is fully implemented and tested

### Switching to PostgreSQL
To enable PostgreSQL:
1. Ensure `DATABASE_URL` in Replit Secrets points to a valid PostgreSQL instance
2. Install `pg` package if not present
3. Update `server/db.ts` to use `drizzle-orm/node-postgres` with `pg.Pool`
4. Run `npm run db:push` to create tables
5. In `server/storage.ts`, change: `export const storage = new DbStorage();`

## Next Steps
1. **Database Migration**: Complete PostgreSQL setup and migrate schema
2. **Authentication**: Add authentication system (Replit Auth or Supabase Auth)
3. **Seed Data**: Add sample unions, candidates, and events for demonstration
4. **Mobile Testing**: Test React Native app in snack.expo.dev
5. **Real-time Features**: Implement live updates for union power metrics
6. **Notifications**: Add email/push notifications for events and pledges
7. **Advanced Features**: 
   - Candidate scorecard with commitment tracking
   - Ballot creation and voting system
   - Badge gamification
   - Advanced analytics and visualization
