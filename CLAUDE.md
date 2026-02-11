# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ImpostoFacil is a Next.js 16 platform helping Brazilian SMEs understand and prepare for the 2023 tax reform (EC 132/2023). It features a product-led growth funnel where the **Impact Simulator** is the public hook and a **Diagnóstico Tributário (Tax Diagnostic Report)** is the paid product (Phase 2). Also includes an AI-powered chat assistant and a knowledge base covering IBS, CBS, and IS taxes.

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
  - `(dashboard)` - Protected app routes (dashboard, diagnostico, assistente, conhecimento, perfil)
  - `(onboarding)` - Post-signup onboarding wizard
- `src/components/ui/` - shadcn/ui components
- `src/components/onboarding/` - Onboarding-specific components (step indicator)
- `src/components/landing/` - Landing page section components
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
  - Protects dashboard, onboarding, and diagnostico routes
  - Redirects unauthenticated users to `/login`
  - Redirects users without completed onboarding to `/onboarding` (except `/diagnostico` — allows bypass)
  - Redirects authenticated users away from auth pages
- **Auth callback** at `src/app/auth/callback/route.ts` supports `?next=` param for flexible post-auth redirects (e.g., `/diagnostico`)
- **Auth actions** in `src/app/(auth)/actions.ts` — signup accepts `from=simulador` to redirect through `/diagnostico` flow

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

### User Funnel (Product-Led Growth)

```
LANDING PAGE → SIMULATOR (public, no login) → RESULTS + localStorage persist
                                                        ↓
                                              SIGNUP (/signup?from=simulador)
                                              [shows simulator teaser card]
                                                        ↓
                                              AUTH CALLBACK → /diagnostico
                                              [simulator data auto-fills profile]
                                                        ↓
                                              DIAGNOSTIC REPORT (/diagnostico)
                                              [free sections + blurred paid sections]
```

Simulator users skip the 4-step onboarding wizard — their profile is auto-filled from simulator data (`simulatorInputToProfile()` in `src/lib/simulator/storage.ts`).

### Simulator System
- `src/lib/simulator/types.ts` — All types (`SimuladorInput`, `SimuladorResult`, `SimuladorTeaser`)
- `src/lib/simulator/calculator.ts` — Core calculation engine with:
  - Tax impact calculation (current vs new system)
  - Risk level determination
  - Alert generation (sector/regime-specific)
  - Timeline generation
  - Action recommendations
  - **Gated content**: 15-20 item checklist, year-by-year projection (2026-2033), regime comparison analysis
- `src/lib/simulator/storage.ts` — localStorage bridge (`saveSimulatorData`, `getStoredSimulatorData`, `clearStoredSimulatorData`, `simulatorInputToProfile`)
- `src/app/simulador/page.tsx` — 4-step public quiz, persists results to localStorage, CTAs route to `/signup?from=simulador`

### Diagnostic Report System (`/diagnostico`)
Protected route (requires auth, does NOT require onboarding completion).

- `src/app/(dashboard)/diagnostico/page.tsx` — Server component: loads profile, runs simulation server-side, checks `isPaid` status
- `src/app/(dashboard)/diagnostico/diagnostico-client.tsx` — Client bridge: reads localStorage, saves to profile via server action, triggers page refresh
- `src/app/(dashboard)/diagnostico/diagnostico-report.tsx` — Full report UI with 8 sections:
  1. Impact Summary (FREE) — risk badge, R$ range
  2. Alerts (PARTIAL) — first 3 free, rest gated with `<GatedSection>`
  3. Timeline (FREE) — key dates
  4. Action Checklist (PARTIAL) — first 2 free, rest + full checklist gated
  5. Regime Comparison (PAID) — full analysis gated
  6. Year-by-Year Projection (PAID) — 2026-2033 projection gated
  7. PDF Export (PAID) — button locked
  8. Upgrade CTA — waitlist email input (Stripe integration in Phase 2)
- `src/app/(dashboard)/diagnostico/actions.ts` — `saveSimulatorDataToProfile()` server action
- `src/components/ui/gated-section.tsx` — Reusable `<GatedSection locked={boolean}>` component: renders real content with `blur(5px)` + lock icon overlay when locked

### Landing Page Architecture
The public landing page (`src/app/page.tsx`) is a conversion-focused single-file page with inline data. Sections:
1. **Hero** — Pain-driven headline, single CTA to `/simulador`, diagnostic report mockup preview
2. **Problem amplification** — Three pain cards with real stats
3. **Product preview** — Diagnostic report feature list + dark mockup
4. **How it works** — 3 steps: simulate → free report → unlock full report
5. **Pricing** — 3 tiers: Básico (free), Completo (R$29), Pro (R$19/mês — "Em breve")
6. **FAQ** — BotRTC comparison, accountant relationship, pricing, data security
7. **Final CTA** — "A reforma não espera. Simule agora."

Landing page styles are in `src/app/globals.css` (`.landing-root`, `.landing-backdrop`, `.landing-grid`, `.landing-reveal` animations).

### Monetization Tiers (Phase 2: Stripe)
- **Free**: Simulator + basic diagnostic (3 alerts, 2 actions, timeline)
- **Diagnóstico Completo (R$29 one-time)**: All alerts, full checklist, year-by-year projection, regime analysis, PDF export
- **Pro (R$19/month)**: Unlimited AI chat, updated diagnostics, priority models

Database columns ready: `diagnostico_purchased_at`, `subscription_tier`, `stripe_customer_id` in `user_profiles`.

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
| faturamento | TEXT | Simulator faturamento bracket (e.g., "ate_81k") |
| simulator_result | JSONB | Cached full simulation result |
| diagnostico_purchased_at | TIMESTAMPTZ | When paid diagnostic was purchased |
| subscription_tier | TEXT | `free` (default), `diagnostico`, or `pro` |
| stripe_customer_id | TEXT | Stripe customer ID (Phase 2) |

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

Run migrations in order in Supabase SQL Editor:
1. `supabase/migrations/00001_initial_schema.sql` — Base schema (requires extensions: `uuid-ossp`, `vector`)
2. `supabase/migrations/00003_diagnostico.sql` — Adds diagnostic/monetization columns to `user_profiles`

## Path Alias

TypeScript path alias `@/*` maps to `./src/*`
