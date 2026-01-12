# Asylum DayZ - Gaming Community Website

## Overview

This is a full-stack web application for the Asylum DayZ gaming community. It serves as a community hub featuring server information, a battlepass rewards system, donation options, and support request functionality. The application has a dark, tactical gaming aesthetic with DayZ-inspired theming.

**Core Features:**
- Server listing with connection details
- Battlepass system with configurable seasons and reward tiers
- Donation integration with PayPal and Discord rewards
- Support ticket submission system
- Admin dashboard for managing battlepass configuration and support requests
- Replit Auth integration for user authentication

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack React Query for server state caching and synchronization
- **Styling:** Tailwind CSS with custom gaming-themed design system
- **UI Components:** Shadcn/ui component library (New York style variant)
- **Animations:** Framer Motion for complex UI animations
- **Build Tool:** Vite with HMR support

**Design Pattern:** The frontend follows a page-based architecture with shared components. Custom hooks (`use-auth`, `use-battlepass`, `use-servers`) abstract API interactions. The UI uses a tactical/military gaming aesthetic with custom fonts (Oxanium, Share Tech Mono, Black Ops One).

### Backend Architecture
- **Runtime:** Node.js with Express
- **Language:** TypeScript with ESM modules
- **API Design:** RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Session Management:** Express sessions with PostgreSQL session store (connect-pg-simple)

**API Structure:** Routes are centrally defined in `shared/routes.ts` with type-safe request/response schemas. The storage layer (`server/storage.ts`) implements a repository pattern abstracting database operations.

### Data Layer
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM with drizzle-zod for schema validation
- **Schema Location:** `shared/schema.ts` contains all table definitions
- **Migrations:** Managed via `drizzle-kit push`

**Key Tables:**
- `users` - User accounts with admin flag
- `sessions` - Authentication session storage
- `servers` - Game server configurations
- `battlepass_config` - Season configuration
- `battlepass_levels` - Reward tier definitions
- `support_requests` - Customer support tickets

### Authentication
- **Provider:** Discord OAuth2
- **Implementation:** Passport.js with passport-discord strategy
- **Session Storage:** PostgreSQL-backed sessions with 7-day TTL
- **Admin Authorization:** Role-based access via `isAdmin` boolean on user records
- **User Data:** Discord ID, username, avatar, and email stored in users table
- **Required Secrets:** DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, SESSION_SECRET

### Build System
- **Development:** Vite dev server with Express backend proxy
- **Production:** Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Optimization:** Server dependencies are selectively bundled to reduce cold start times

## External Dependencies

### Database
- **PostgreSQL:** Primary data store, connection via `DATABASE_URL` environment variable

### Authentication Services
- **Replit Auth:** OpenID Connect provider at `https://replit.com/oidc`
- **Required Secrets:** `SESSION_SECRET`, `REPL_ID` (auto-provided by Replit)

### Frontend Libraries
- **@tanstack/react-query:** Server state management
- **framer-motion:** Animation library for gaming aesthetic effects
- **react-icons:** Additional icon sets (FaDiscord, FaPaypal)
- **Radix UI:** Headless component primitives (via Shadcn)

### Development Tools
- **Vite Plugins:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`

### External Services (UI/UX)
- **Google Fonts:** Oxanium, Share Tech Mono, Black Ops One font families
- **Discord:** Community integration via invite links (`discord.gg/asylumdayz`)
- **PayPal:** Donation processing (external redirect)