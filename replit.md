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
    *   **Discussion System**: Integrated within union detail pages, featuring Discord-like channels, Reddit-style posts with voting and nested comments, and real-time updates. Actions are authentication-gated.
4.  **Mobile App**:
    *   Complete set of screens mirroring web functionality: Home, Unions, Dashboard, Education, Events, Profile, and Auth.
    *   Utilizes reusable components for consistency and React Navigation for routing.
    *   Configured for Expo SDK 50+ compatibility.
    *   **Discussion System**: Union detail screen with Overview/Discussion tabs, horizontal channel tabs, post list with voting, post detail screen with nested comments, and centralized state management for real-time updates.
5.  **Database Schema**: A robust PostgreSQL schema defines relationships for all core entities and the discussion system, including `union_channels`, `discussion_posts`, `post_comments`, `post_votes`, and `comment_votes`.
6.  **Authentication**: Supabase Authentication is fully implemented across web and mobile for user sign-up, sign-in, sign-out, session persistence, and secure JWT-based backend validation.
7.  **Multi-Platform Development**: Emphasizes feature parity between web (`client/`) and mobile (`mobile/`) apps, with shared schema (`shared/`) and backend services (`server/`) communicating with a unified Supabase backend. UI components are kept entirely separate between web (React + Tailwind) and mobile (React Native + Paper).

## External Dependencies

-   **Supabase**: Provides PostgreSQL database hosting, authentication services (Supabase Auth), and real-time capabilities.
-   **Neon**: Powers the PostgreSQL database backend, integrated via Supabase.
-   **Expo**: Framework for building universal React Native apps, used for the mobile client.
-   **shadcn/ui**: Component library for the web frontend, built on Tailwind CSS.