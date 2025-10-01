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
- `SUPABASE_URL`: Your Supabase project URL (configured)
- `SUPABASE_ANON_KEY`: Supabase anonymous API key (configured)
- `SUPABASE_DB_PASSWORD`: Supabase database password (configured)
- `SESSION_SECRET`: Session encryption secret
- `DATABASE_URL`: Legacy PostgreSQL connection (replaced by Supabase)

## User Preferences
- Follow modern web application best practices
- Put as much logic in the frontend as possible
- Backend handles data persistence and API calls only
- Use shadcn/ui components wherever possible
- Maintain consistency between web and mobile experiences

### Multi-Platform Development Guidelines
**Build feature parity between web and mobile apps.** Whenever you add or modify a feature, implement it in both:

**Web App** (`client/src/`):
- Files: `client/src/pages/`, `client/src/components/`
- Tech: React, Tailwind CSS, shadcn/ui, Wouter routing
- Backend: `server/routes.ts`, `server/storage.ts`

**Mobile App** (`mobile/src/`):
- Files: `mobile/src/screens/`, `mobile/src/components/`
- Tech: React Native, Expo, React Native Paper, React Navigation
- Backend: Same Supabase database (shared with web)

**Standard Feature Implementation Flow:**
1. Update shared schema in `shared/schema.ts` (if database changes needed)
2. Update backend routes in `server/routes.ts` and storage interface in `server/storage.ts`
3. Build web UI in `client/src/pages/` using React + Tailwind
4. Build mobile UI in `mobile/src/screens/` using React Native + Expo
5. Ensure both apps connect to the same Supabase backend for data sync

**Key Principle:** Both apps share the same Supabase PostgreSQL database, so data syncs automatically. Code is maintained separately but features should match across platforms for consistent user experience.

## Mobile Compatibility Guardrails

### ❌ Prohibited in Shared/Backend Code

**No browser-specific APIs:**
- Never use `window`, `document`, `localStorage`, `sessionStorage` directly
- Use platform-specific abstractions or conditional imports
- Backend code must be platform-agnostic

**No web-only libraries:**
- Avoid packages that only work in browsers
- Always verify npm package compatibility with React Native before installation
- Check package documentation for "React Native" or "Expo" support

**No CSS/Tailwind in mobile code:**
- Mobile uses `StyleSheet` from React Native or React Native Paper theming
- Never import Tailwind classes, CSS files, or styled-components in `mobile/` directory
- Keep styling completely separate between web and mobile

### ✅ Required Practices

**Use cross-platform packages:**
- **Storage**: `@react-native-async-storage/async-storage` (NOT localStorage)
- **Navigation**: React Navigation for mobile, Wouter for web (keep separate)
- **HTTP/API**: `fetch` or `axios` (works on all platforms)
- **State Management**: TanStack Query (works everywhere)
- **Date/Time**: `date-fns` (cross-platform friendly)

**Test on both platforms:**
- Every new feature must work in web AND mobile
- Backend APIs must be platform-agnostic
- No platform-specific endpoints unless absolutely necessary

**Shared backend only:**
- All API routes in `server/` must work for both web and mobile
- Use standard HTTP/REST principles
- Return JSON responses (not HTML)

**Keep UI completely separate:**
- Web UI: `client/src/pages/` and `client/src/components/` (React + Tailwind)
- Mobile UI: `mobile/src/screens/` and `mobile/src/components/` (React Native + Paper)
- NEVER import web components in mobile or vice versa
- Shared business logic only in `shared/` directory

### 🔍 Pre-flight Checks for New Libraries

Before adding any new npm package, verify ALL of these:
1. ✅ Works with Expo SDK 50+
2. ✅ Compatible with React Native (check npm page or GitHub issues)
3. ✅ Has no unsupported native dependencies (or is Expo-compatible)
4. ✅ Not browser-specific (no DOM manipulation)
5. ✅ Actively maintained with recent updates

**If installing for web only**: Add to root `package.json` but NEVER import in `mobile/`  
**If installing for mobile only**: Add to `mobile/package.json` exclusively  
**If installing for both**: Verify cross-platform compatibility first

### 🚨 Red Flags to Watch For

**STOP immediately if you see:**
- Importing `window` or `document` in `shared/` or `mobile/` code
- Using `localStorage` instead of AsyncStorage in mobile
- Adding web-only packages to `mobile/package.json`
- DOM manipulation (`.getElementById`, `.querySelector`, etc.)
- Importing Tailwind classes in React Native components
- CSS files in mobile directory
- `react-router` or `wouter` in mobile code
- Using `<div>`, `<span>`, `<img>` tags in mobile (should be `<View>`, `<Text>`, `<Image>`)

### 📱 Expo Compatibility Requirements

**All mobile code must:**
- Use Expo SDK 50+ compatible packages
- Avoid packages requiring custom native code (unless Expo-supported)
- Work on both iOS and Android
- Be testable on snack.expo.dev
- Follow React Native best practices

**Safe Expo packages:**
- `expo-*` packages (expo-router, expo-linear-gradient, etc.)
- `@react-navigation/*`
- `@react-native-async-storage/async-storage`
- `react-native-paper`
- `@supabase/supabase-js`

### ✅ Already Protected

- ✅ Project structure separates web (`client/`) and mobile (`mobile/`)
- ✅ Backend is shared via Supabase (platform-agnostic)
- ✅ Multi-platform development guidelines established
- ✅ Mobile app uses Expo SDK 50 with proper dependencies

## Current Status

### Supabase Integration
The application is **now integrated with Supabase**:
- ✅ Supabase credentials configured (URL, API key, DB password)
- ✅ PostgreSQL connection initialized and working
- ✅ Mobile app configured with Supabase client
- ✅ Backend ready to use DbStorage with Supabase
- ⚠️ Currently using MemStorage (DbStorage enabled but tables not yet created)

### Data Layer
Currently using **MemStorage** (in-memory) as database tables need to be created in Supabase:
- ✅ All CRUD operations work correctly
- ✅ Supabase connection established
- ⚠️ Data resets when server restarts (until tables are created)
- ✅ DbStorage class ready to use Supabase PostgreSQL

### Next: Create Tables in Supabase
To complete the database setup:
1. Go to your Supabase Dashboard → SQL Editor
2. Run the schema creation SQL for all tables (users, unions, candidates, etc.)
3. Or manually create tables using Supabase's Table Editor
4. Once tables exist, the application will automatically use Supabase for persistence

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
