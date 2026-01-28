# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImpostoFacil is a Next.js 16 educational platform helping Brazilian businesses understand the 2023 tax reform (EC 132/2023). It features an AI-powered chat assistant and a knowledge base covering IBS, CBS, and IS taxes.

## Development Commands

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Production build
npm run lint      # ESLint with Next.js + TypeScript rules
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, React 19, TypeScript strict mode)
- **UI**: Tailwind CSS 4, shadcn/ui components, Radix UI primitives
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **AI**: OpenRouter API (Claude 3.5 Sonnet), OpenAI embeddings

### Key Directories
- `src/app/` - Next.js App Router with route groups:
  - `(auth)` - Login, signup, password reset
  - `(dashboard)` - Protected app routes (dashboard, assistente, conhecimento, perfil)
  - `(onboarding)` - Post-signup onboarding wizard
- `src/components/ui/` - shadcn/ui components
- `src/components/onboarding/` - Onboarding-specific components (step indicator)
- `src/lib/supabase/` - Supabase clients (server.ts for SSR, client.ts for browser, admin.ts for service role)
- `src/lib/openrouter/` - LLM client with system prompt template
- `src/lib/embeddings/` - OpenAI embeddings and hybrid search logic
- `src/content/` - Static MDX articles organized by category (ibs, cbs, is, transicao, glossario)
- `src/hooks/use-chat.ts` - Client-side chat state management with SSE streaming
- `supabase/migrations/` - SQL migration files for database setup

### Chat System Architecture
1. **API Route** (`src/app/api/chat/route.ts`): Edge Runtime endpoint that:
   - Fetches user profile for personalized context
   - Performs hybrid search (70% semantic + 30% full-text) on knowledge base
   - Streams responses via Server-Sent Events
   - Persists messages to Supabase

2. **Client Hook** (`src/hooks/use-chat.ts`): Manages streaming response parsing, message queue, and conversation state

3. **System Prompt**: Located in `src/lib/openrouter/client.ts` with `{{USER_CONTEXT}}` and `{{KNOWLEDGE_CONTEXT}}` placeholders

### Search Implementation
Hybrid search in `src/lib/embeddings/search.ts` combines:
- Semantic search via `match_content_chunks` RPC (OpenAI embeddings)
- Full-text search via `search_content` RPC (PostgreSQL)

### Authentication & Routing Flow
- **Proxy** in `src/proxy.ts` handles route protection (Next.js 16 convention)
- **Session logic** in `src/lib/supabase/middleware.ts` with `updateSession()`:
  - Protects dashboard and onboarding routes
  - Redirects unauthenticated users to `/login`
  - Redirects users without completed onboarding to `/onboarding`
  - Redirects authenticated users away from auth pages
- **Auth callback** at `src/app/auth/callback/route.ts` redirects to `/onboarding` after email verification
- **Auth actions** in `src/app/(auth)/actions.ts`

### Onboarding Flow
Post-signup wizard at `/onboarding` collects user profile data in 4 steps:
1. **About You**: Name, experience level with taxation
2. **Your Business**: State (UF), sector, company size
3. **Tax Regime**: Current tax classification (Simples, Lucro Presumido, etc.)
4. **Interests**: Multi-select reform topics (IBS, CBS, transition, etc.)

Key files:
- `src/app/(onboarding)/onboarding/page.tsx` - Server component with auth/redirect logic
- `src/app/(onboarding)/onboarding/onboarding-wizard.tsx` - Client wizard with step state
- `src/app/(onboarding)/onboarding/actions.ts` - Server actions (save, complete, skip)
- `src/app/(onboarding)/onboarding/constants.ts` - All dropdown/select options

Users can skip onboarding but will see a reminder card on the dashboard.

## Database Schema

### user_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | FK to auth.users |
| email | TEXT | User email |
| nome | TEXT | Display name |
| uf | TEXT | State code (2 chars) |
| setor | TEXT | Business sector |
| porte_empresa | TEXT | Company size (MEI, ME, EPP, MEDIO, GRANDE) |
| nivel_experiencia | TEXT | Tax knowledge level |
| regime_tributario | TEXT | Tax regime |
| interesses | TEXT[] | Array of reform topics |
| onboarding_completed_at | TIMESTAMPTZ | Null until onboarding done/skipped |

### Other Tables
- `conversations` - Chat conversation metadata
- `messages` - Individual chat messages with role and sources
- `content_chunks` - RAG knowledge base with embeddings

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
```

## Database Setup

Run `supabase/migrations/00001_initial_schema.sql` in Supabase SQL Editor. Requires extensions:
- `uuid-ossp`
- `vector`

## Path Alias

TypeScript path alias `@/*` maps to `./src/*`
