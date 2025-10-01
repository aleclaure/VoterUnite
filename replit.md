# Voters Union Platform

## Overview
A platform designed to empower collective political organizing through issue-based voting unions. It includes both a web application and a React Native mobile app, enabling users to form unions, define demands, track candidate commitments, organize events, and engage in community discussions. The platform aims to foster transparency, engagement, and collective action in political processes.

## User Preferences
- Follow modern web application best practices
- Put as much logic in the frontend as possible
- Backend handles data persistence and API calls only
- Use shadcn/ui components wherever possible
- Maintain consistency between web and mobile experiences
- **Multi-Platform Development Guidelines:** Build feature parity between web and mobile apps. Whenever you add or modify a feature, implement it in both.
- **Mobile Compatibility Guardrails:** No browser-specific APIs in shared/backend code, no web-only libraries, no CSS/Tailwind in mobile code. Use cross-platform packages, test on both platforms, and keep UI completely separate. All mobile code must use Expo SDK 50+ compatible packages and work on both iOS and Android.

## Feature Development Checklist

Every new feature MUST follow this complete implementation checklist:

### 1. Database & Schema
- ✅ Create new table(s) in Supabase PostgreSQL
- ✅ Link all records to authenticated user via `author_id` or `user_id` (UUID from `auth.users`)
- ✅ Include proper foreign keys with `ON DELETE CASCADE`
- ✅ Create Row Level Security (RLS) policies so users can only manage their own data
- ✅ Add indexes for performance on frequently queried columns
- ✅ Provide complete SQL code for Supabase SQL Editor

### 2. Authentication & Authorization
- ✅ Require authentication for all creating/editing operations
- ✅ Auto-link all new records to `req.userId` (backend) or `auth.uid()` (database)
- ✅ Use existing Supabase Auth JWT tokens via `Authorization: Bearer` headers
- ✅ Implement `requireAuth` middleware on all protected API routes
- ✅ Validate user ownership before update/delete operations

### 3. Multi-Platform Implementation
- ✅ **Web UI**: Build in `client/src/pages/` using React + Tailwind + shadcn/ui
- ✅ **Mobile UI**: Build in `mobile/src/screens/` using React Native + Expo + React Native Paper
- ✅ Both platforms share the same Supabase PostgreSQL backend
- ✅ Both platforms use the same API routes
- ✅ Maintain feature parity between web and mobile
- ✅ Keep UI components completely separate (no shared UI code)

### 4. Data Persistence & Backend
- ✅ Save to Supabase PostgreSQL (never use in-memory storage)
- ✅ Update `shared/schema.ts` with Drizzle table definitions
- ✅ Add storage methods to `DbStorage` class in `server/storage.ts`
- ✅ Create API routes in `server/routes.ts` with `requireAuth` middleware
- ✅ Use existing queryClient setup for frontend data fetching

### 5. Security & Validation
- ✅ Create RLS policies for data access control:
  - Users can only edit/delete their own content
  - Public content viewable by everyone (if applicable)
  - Validate union/group membership where required
- ✅ Use Zod schemas for request validation (`drizzle-zod`)
- ✅ Never expose sensitive user data
- ✅ Validate all inputs on both client and server

### 6. Code Quality
- ✅ Add `data-testid` attributes to all interactive elements
- ✅ Implement proper error handling with user-friendly messages
- ✅ Show loading states during async operations
- ✅ Invalidate React Query cache after mutations
- ✅ Use proper TypeScript types from schema

### Example SQL Template for New Features:
```sql
-- Create table
CREATE TABLE IF NOT EXISTS feature_name (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  user_id UUID NOT NULL,
  -- other columns
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign key to auth.users
ALTER TABLE feature_name 
  ADD CONSTRAINT feature_name_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE feature_name ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own records"
  ON feature_name FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create records"
  ON feature_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON feature_name FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
  ON feature_name FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_feature_name_user ON feature_name(user_id);
```

## System Architecture

The platform uses a monorepo structure with shared components and distinct web and mobile frontends.

**Tech Stack:**
- **Backend**: Express.js with TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Neon-backed via Replit, integrated with Supabase)
- **Web Frontend**: React with Vite, Wouter for routing, shadcn/ui components, Tailwind CSS
- **Mobile App**: React Native with Expo, React Navigation, React Native Paper
- **State Management**: TanStack Query (React Query)
- **Authentication**: Supabase Auth for both web and mobile

**Key Features & Implementations:**

1.  **Core Entities**: Manages users, voting unions, members, demands, pledges, candidates, commitments, events, attendees, ballots, votes, and user badges.
2.  **Backend API**: Provides full CRUD operations for all entities via Express.js, leveraging Drizzle ORM for PostgreSQL interaction. It includes authentication middleware for protected routes and user ID injection.
3.  **Web Frontend**:
    *   Comprehensive UI including home, union listings/details, dashboard with metrics, education hub, events calendar, user profiles, and an authentication flow.
    *   **Discussion System**: Integrated within union detail pages, featuring Discord-like channels (text/voice/video), Reddit-style posts with voting and nested comments, and real-time updates. Actions are authentication-gated.
    *   **Channel Types**: Supports three channel types with visual indicators:
        - Text Channels: Hash (#) icon for text-based discussions
        - Voice Rooms: Mic icon for audio communication (infrastructure ready)
        - Video Rooms: Video camera icon for video conferencing (infrastructure ready)
4.  **Mobile App**:
    *   Complete set of screens mirroring web functionality: Home, Unions, Dashboard, Education, Events, Profile, and Auth.
    *   Utilizes reusable components for consistency and React Navigation for routing.
    *   Configured for Expo SDK 50+ compatibility.
    *   **Discussion System**: Union detail screen with Overview/Discussion tabs, horizontal channel tabs with type-specific icons (chatbox/mic/videocam), post list with voting, post detail screen with nested comments, and centralized state management for real-time updates.
    *   **Channel Types**: Full feature parity with web - supports text/voice/video channel creation with visual type indicators.
5.  **Database Schema**: A robust PostgreSQL schema defines relationships for all core entities and the discussion system, including `union_channels` (with `channelType` field for text/voice/video), `discussion_posts`, `post_comments`, `post_votes`, and `comment_votes`. The `channelType` column in `union_channels` stores one of three values: 'text', 'voice', or 'video', enabling different communication modes within unions.
6.  **Authentication**: Supabase Authentication is fully implemented across web and mobile for user sign-up, sign-in, sign-out, session persistence, and secure JWT-based backend validation.
7.  **Multi-Platform Development**: Emphasizes feature parity between web (`client/`) and mobile (`mobile/`) apps, with shared schema (`shared/`) and backend services (`server/`) communicating with a unified Supabase backend. UI components are kept entirely separate between web (React + Tailwind) and mobile (React Native + Paper).

## External Dependencies

-   **Supabase**: Provides PostgreSQL database hosting, authentication services (Supabase Auth), and real-time capabilities.
-   **Neon**: Powers the PostgreSQL database backend, integrated via Supabase.
-   **Expo**: Framework for building universal React Native apps, used for the mobile client.
-   **shadcn/ui**: Component library for the web frontend, built on Tailwind CSS.