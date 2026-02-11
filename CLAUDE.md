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
- **Payments**: Stripe (Checkout Sessions, webhooks)
- **PDF**: @react-pdf/renderer for diagnostic export
- **Analytics**: Custom event tracking (client + server)

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
- `src/content/` - Static MDX articles organized by category (ibs, cbs, is, transicao, glossario, setores, regimes, faq) — 20 articles total
- `src/hooks/use-chat.ts` - Client-side chat state management with SSE streaming
- `src/hooks/use-conversations.ts` - Conversation list management
- `src/lib/simulator/tax-data.ts` - Cited tax data registry with legislative sources
- `src/lib/stripe/client.ts` - Stripe client initialization
- `src/lib/pdf/diagnostico-pdf.tsx` - PDF generation for diagnostic report
- `src/lib/analytics/` - Event tracking (track.ts for client, track-server.ts for server)
- `src/lib/readiness/score.ts` - Readiness score calculation for dashboard
- `src/components/chat/` - Chat UI (container, messages, sidebar, Duda avatar/welcome, follow-up suggestions)
- `supabase/migrations/` - SQL migration files for database setup

### Chat System Architecture
1. **API Route** (`src/app/api/chat/route.ts`): Edge Runtime endpoint that:
   - Fetches full user profile for personalized context (nome, UF, setor, porte, regime, faturamento, experiencia, interesses, simulator results)
   - Performs hybrid search (70% semantic + 30% full-text) on knowledge base
   - Streams responses via Server-Sent Events
   - Persists messages to Supabase
   - Parses follow-up suggestions from assistant responses

2. **Client Hook** (`src/hooks/use-chat.ts`): Manages streaming response parsing, message queue, and conversation state

3. **Chat UI** (`src/components/chat/`): "Duda" branded assistant with conversation sidebar, follow-up suggestion chips, and category-colored source badges

4. **System Prompt**: Located in `src/lib/openrouter/client.ts` with `{{USER_CONTEXT}}` and `{{KNOWLEDGE_CONTEXT}}` placeholders. Model selection in `src/lib/openrouter/models.ts`

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
- `src/lib/simulator/tax-data.ts` — **Cited data registry**: all tax rates wrapped in `CitedValue<T>` with `source` (legislation reference), `confidence` (legislada/estimativa_oficial/derivada), and optional `notes`. Includes `FATURAMENTO_MEDIO`, `CARGA_ATUAL`, `CARGA_NOVA`, `AJUSTE_REGIME`, `TRANSICAO_TIMELINE`, `UF_INCENTIVOS_FISCAIS`
- `src/lib/simulator/types.ts` — All types (`SimuladorInput`, `SimuladorResult`, `SimuladorTeaser`). Result includes `metodologia` field with confidence level, sources list, limitations, and last-updated date
- `src/lib/simulator/calculator.ts` — Core calculation engine, imports all data from `tax-data.ts`. Populates methodology metadata per calculation. UF-aware alerts for states with major ICMS incentive programs
- `src/lib/simulator/storage.ts` — localStorage bridge (`saveSimulatorData`, `getStoredSimulatorData`, `clearStoredSimulatorData`, `simulatorInputToProfile`)
- `src/components/ui/methodology-card.tsx` — Reusable transparency component: compact mode (expandable line) on simulator, full mode (card with sources/limitations) on diagnostic
- `src/app/simulador/page.tsx` — 4-step public quiz, persists results to localStorage, shows methodology card on results. CTAs route to `/signup?from=simulador`

### Diagnostic Report System (`/diagnostico`)
Protected route (requires auth, does NOT require onboarding completion).

- `src/app/(dashboard)/diagnostico/page.tsx` — Server component: loads profile, runs simulation server-side, checks `isPaid` status
- `src/app/(dashboard)/diagnostico/diagnostico-client.tsx` — Client bridge: reads localStorage, saves to profile via server action, triggers page refresh
- `src/app/(dashboard)/diagnostico/diagnostico-report.tsx` — Client component with analytics tracking. Full report UI with 9 sections:
  1. Impact Summary (FREE) — risk badge, R$ range
  2. Methodology (FREE) — `<MethodologyCard>` with sources, confidence, limitations
  3. Alerts (PARTIAL) — first 3 free, rest gated with `<GatedSection>`
  4. Timeline (FREE) — key dates
  5. Action Checklist (PARTIAL) — first 2 free, rest + full interactive checklist gated (uses `<ChecklistItem>`)
  6. Regime Comparison (PAID) — full analysis gated
  7. Year-by-Year Projection (PAID) — 2026-2033 projection gated
  8. PDF Export (PAID) — `<PdfDownloadButton>` generates PDF via `/api/diagnostico/pdf`
  9. Upgrade CTA — links to `/checkout`, shows alert count + action count
- `src/app/(dashboard)/diagnostico/actions.ts` — `saveSimulatorDataToProfile()` and `toggleChecklistItem()` server actions
- `src/app/(dashboard)/diagnostico/checklist-item.tsx` — Interactive checkbox with optimistic UI
- `src/components/ui/gated-section.tsx` — Reusable `<GatedSection locked={boolean}>` component: renders real content with `blur(5px)` + lock icon overlay when locked

### Checkout & Payment Flow (`/checkout`)
Protected route. Stripe Checkout integration + promo code bypass.

- `src/app/(dashboard)/checkout/page.tsx` — Client component: side-by-side Free vs Paid tier comparison, Stripe checkout button, promo code input
- `src/app/(dashboard)/checkout/actions.ts` — `redeemPromoCode()` server action: validates against `VALID_PROMO_CODES` map (currently: "amigos"), updates `subscription_tier` + `diagnostico_purchased_at`
- `src/app/api/stripe/checkout/route.ts` — Creates Stripe Checkout Session, redirects to Stripe
- `src/app/api/stripe/webhook/route.ts` — Handles `checkout.session.completed` webhook, updates user profile
- `src/lib/stripe/client.ts` — Stripe SDK initialization
- On success: redirects to `/diagnostico?unlocked=true` which shows a success banner

### PDF Export
- `src/app/api/diagnostico/pdf/route.ts` — API route generates PDF from diagnostic data
- `src/lib/pdf/diagnostico-pdf.tsx` — React-PDF document template
- `src/components/pdf-download-button.tsx` — Download button with loading state

### Signup Flow
Two variants based on `?from=simulador` search param:

1. **Simulator flow** (`/signup?from=simulador`): Two-column layout. Left dark panel shows progress indicator (step 5/5), risk badge + impact summary from localStorage, list of what they'll unlock. Right panel has a compact 3-field form (name, email, password — no confirm), "Desbloquear diagnóstico" CTA, and Google OAuth.

2. **Standard flow** (`/signup`): Traditional centered Card layout with name, email, password + confirm password.

Auth layout (`src/app/(auth)/layout.tsx`) uses `max-w-4xl` container; each page constrains its own width.

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

### Monetization Tiers
- **Free**: Simulator + basic diagnostic (3 alerts, 2 actions, timeline)
- **Diagnóstico Completo (R$29 one-time)**: All alerts, full checklist, year-by-year projection, regime analysis, PDF export — currently unlockable via promo code "amigos" at `/checkout`
- **Pro (R$19/month)**: Unlimited AI chat, updated diagnostics, priority models — coming later

Database columns: `diagnostico_purchased_at`, `subscription_tier`, `stripe_customer_id` in `user_profiles`. Stripe Checkout is live.

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
- `content_chunks` - RAG knowledge base with embeddings (177 chunks from 20 articles)
- `analytics_events` - Custom event tracking
- `newsletter_subscribers` - Email collection
- `checklist_progress` - Diagnostic checklist completion state per user

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
```

## Database Setup

Run migrations in order in Supabase SQL Editor:
1. `supabase/migrations/00001_initial_schema.sql` — Base schema (requires extensions: `uuid-ossp`, `vector`)
2. `supabase/migrations/00002_enhanced_content_chunks.sql` — Enhanced content chunks for RAG
3. `supabase/migrations/00003_diagnostico.sql` — Adds diagnostic/monetization columns to `user_profiles`
4. `supabase/migrations/00004_analytics_checklist_newsletter.sql` — Analytics events, checklist progress, newsletter subscribers

### Knowledge Base Ingestion
```bash
npx tsx scripts/knowledge-base/ingest.ts --force --verbose  # Ingest all 20 articles into Supabase
npx tsx scripts/knowledge-base/ingest.ts --dry-run          # Preview without writing
```
Loads `.env.local` for credentials. Generates OpenAI embeddings and writes to `content_chunks` table.

## Path Alias

TypeScript path alias `@/*` maps to `./src/*`
