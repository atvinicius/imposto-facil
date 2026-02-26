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
- `src/components/ui/` - shadcn/ui components
- `src/components/landing/` - Landing page section components
- `src/lib/supabase/` - Supabase clients (server.ts for SSR with PKCE, client.ts for browser, admin.ts for service role)
- `src/lib/openrouter/` - LLM client with system prompt template
- `src/lib/embeddings/` - OpenAI embeddings and hybrid search logic
- `src/content/` - Static MDX articles organized by category (ibs, cbs, is, transicao, glossario, setores, regimes, faq) — 36 articles total
- `src/hooks/use-chat.ts` - Client-side chat state management with SSE streaming
- `src/hooks/use-conversations.ts` - Conversation list management
- `src/lib/simulator/tax-data.ts` - Cited tax data registry with legislative sources
- `src/lib/stripe/client.ts` - Stripe client initialization
- `src/lib/pdf/diagnostico-pdf.tsx` - PDF generation for diagnostic report
- `src/lib/analytics/` - Event tracking (track.ts for client, track-server.ts for server)
- `src/lib/readiness/score.ts` - Readiness score calculation for dashboard
- `src/components/chat/` - Chat UI (container, messages, sidebar, avatar/welcome, follow-up suggestions)
- `src/components/feedback/` - Inline feedback collection (`FeedbackPrompt` reusable component)
- `src/app/actions/feedback.ts` - Server action for feedback submission
- `supabase/migrations/` - SQL migration files for database setup

### Chat System Architecture
1. **API Route** (`src/app/api/chat/route.ts`): Edge Runtime endpoint that:
   - **Paywalled**: returns 403 for free users (requires `diagnostico` or `pro` subscription tier)
   - Fetches full user profile for personalized context (nome, UF, setor, porte, regime, faturamento, experiencia, interesses, simulator results, formalization pressure data)
   - Injects diagnostic data into context: impact, risk, alerts, dates, actions, split payment, formalization pressure (effective vs legal rates, enforcement cost)
   - Injects **common mistakes context** via `getErrosComunsParaChat()` for proactive error coaching
   - Performs hybrid search (70% semantic + 30% full-text) on knowledge base
   - Streams responses via Server-Sent Events
   - Persists messages to Supabase
   - Parses follow-up suggestions from assistant responses

2. **Client Hook** (`src/hooks/use-chat.ts`): Manages streaming response parsing, message queue, and conversation state

3. **Chat UI** (`src/components/chat/`): AI assistant with conversation sidebar, follow-up suggestion chips, and category-colored source badges

4. **System Prompt**: Located in `src/lib/openrouter/client.ts` with `{{USER_CONTEXT}}` and `{{KNOWLEDGE_CONTEXT}}` placeholders. Includes compliance reality guidelines (non-judgmental sector-level framing, e-CAC/PGFN guidance, formalization-as-opportunity positioning). Model selection in `src/lib/openrouter/models.ts`

### Search Implementation
Hybrid search in `src/lib/embeddings/search.ts` combines:
- Semantic search via `match_content_chunks` RPC (OpenAI embeddings)
- Full-text search via `search_content` RPC (PostgreSQL)

### Authentication & Routing Flow
- **Proxy** in `src/proxy.ts` handles route protection (Next.js 16 convention)
- **Session logic** in `src/lib/supabase/middleware.ts` with `updateSession()`:
  - Protects dashboard, diagnostico, and other app routes
  - Redirects unauthenticated users to `/login`
  - Redirects authenticated users away from auth pages
- **Auth callback** at `src/app/auth/callback/route.ts` — server-side route handler with two flows:
  1. `token_hash` + `type` → `verifyOtp()` — Email auth (magic link, signup). Supabase-recommended SSR approach, works cross-device. Requires custom email templates that send `token_hash` directly as a query parameter.
  2. `code` → `exchangeCodeForSession()` — OAuth (Google sign-in). Uses PKCE code_verifier from cookies (same-device).
  - `resolveRedirect()` reads destination from `?next=` URL param, then falls back to `user.user_metadata.redirect_to`
- **Auth confirm** at `src/app/auth/confirm/route.ts` — redirects to `/auth/callback` preserving all query params (fallback for old email templates)
- **Auth actions** in `src/app/(auth)/actions.ts` — uses standard SSR PKCE client (`createClient()`) for `signInWithOtp()`. Stores `redirect_to` in user metadata for cross-device support. Signup accepts `from=simulador` to set redirect to `/diagnostico`.
- **Supabase email templates** (configured in dashboard) must use `token_hash` format: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup` (not `{{ .ConfirmationURL }}`)

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

Simulator users' profiles are auto-filled from simulator data (`simulatorInputToProfile()` in `src/lib/simulator/storage.ts`). There is no onboarding wizard — profile data comes from the simulator flow or the `/perfil` page.

### Simulator System
- `src/lib/simulator/tax-data.ts` — **Cited data registry**: all tax rates wrapped in `CitedValue<T>` with `source` (legislation reference), `confidence` (legislada/estimativa_oficial/derivada), and optional `notes`. Includes `FATURAMENTO_MEDIO`, `CARGA_ATUAL`, `CARGA_NOVA`, `AJUSTE_REGIME`, `TRANSICAO_TIMELINE`, `UF_INCENTIVOS_FISCAIS`, `FATOR_EFETIVIDADE` (sector/regime effectiveness ratios), **`ICMS_ALIQUOTA_MODAL`** (27-state modal ICMS rates, 17%-23%, each citing state law), **`ICMS_REFERENCIA_NACIONAL`** (19% GDP-weighted avg), **`MARGEM_BRUTA_ESTIMADA`** (sector gross margins from IBGE), and **`SETORES_ICMS`** (goods-based sectors: comercio, industria, construcao, agronegocio)
- `src/lib/simulator/types.ts` — All types (`SimuladorInput`, `SimuladorResult`, `SimuladorTeaser`). Result includes `metodologia` field, `confiancaPerfil`, `efetividadeTributaria` (formalization pressure decomposition), **`ajusteIcmsUf`** (state-specific ICMS rate adjustment data), and **`impactoFluxoCaixa`** (cash flow impact: `retencaoMensal`, `porCadaDezMil`, `capitalGiroAdicional`)
- `src/lib/simulator/calculator.ts` — Core calculation engine, imports all data from `tax-data.ts`. **`calcularAjusteIcmsUf()`** adjusts `CARGA_ATUAL` based on state ICMS rate vs national average (goods sectors, non-Simples only). `calcularImpacto()` decomposes impact into rate change + formalization pressure using effectiveness factors, with state ICMS adjustment applied. **`calcularImpactoFluxoCaixa()`** computes concrete cash flow numbers (per R$10k retained, monthly retention, annual working capital). UF-aware alerts with quantitative ICMS data, formalization-specific alerts for high-gap sectors
- `src/lib/simulator/common-mistakes.ts` — **Common Mistakes Engine**: 15 cataloged errors matched by sector, regime, faturamento, UF, and formalization pressure. Returns personalized `ErroComum[]` sorted by severity. Used by diagnostic report, simulator results, and chat context. Exports: `getErrosComuns(input, result, maxItems)` and `getErrosComunsParaChat(input, result)`
- `src/lib/simulator/storage.ts` — localStorage bridge (`saveSimulatorData`, `getStoredSimulatorData`, `clearStoredSimulatorData`, `simulatorInputToProfile`)
- `src/components/ui/methodology-card.tsx` — Reusable transparency component: compact mode (expandable line) on simulator, full mode (card with sources/limitations) on diagnostic
- `src/app/simulador/page.tsx` — 4-step public quiz, persists results to localStorage, shows methodology card and **common mistakes teaser** on results. CTAs route to `/signup?from=simulador`

### Compliance Reality / Formalization Pressure System
The simulator accounts for the fact that Brazilian SMEs don't always pay 100% of statutory tax obligations. The reform's automated collection (split payment, 2027+) will close this gap, creating a "hidden cost" beyond rate changes.

- `src/lib/simulator/tax-data.ts` — `FATOR_EFETIVIDADE`: 40 sector/regime combinations (10 sectors x 4 regimes), each a `CitedValue<{medio, min, max}>` where `medio` is the ratio of actual vs statutory tax payment (e.g., 0.65 for comércio/simples = 65% effective compliance)
- `src/lib/simulator/calculator.ts` — `calcularImpacto()` computes: current burden = `faturamento * (cargaAtual + icmsAjuste) * fatorEfetividade` (effective), new burden = `faturamento * cargaNova * 1.0` (statutory, because split payment enforces full compliance). Impact decomposed into `impactoMudancaAliquota` (rate change only) + `impactoFormalizacao` (enforcement gap closure) = `impactoTotalEstimado`. State ICMS adjustment applied via `calcularAjusteIcmsUf()` for goods-based sectors on non-Simples regimes
- `src/lib/simulator/types.ts` — `efetividadeTributaria` field on `SimuladorResult` with: `fatorEfetividade`, `cargaEfetivaAtualPct`, `cargaLegalAtualPct`, `impactoMudancaAliquota`, `impactoFormalizacao`, `impactoTotalEstimado`, `pressaoFormalizacao` (baixa/moderada/alta/muito_alta). **`ajusteIcmsUf`** field with: `ufAliquota`, `referenciaAliquota`, `margemEstimada`, `ajustePp`, `direcao` (favoravel/desfavoravel/neutro), `fonteUf`
- Year-by-year projections model formalization ramp-up: 2026 test year (no change), 2027+ effectiveness trends toward 1.0 as enforcement tightens through 2033
- All customer-facing language is non-judgmental (sector-level public data, never individual accusations), uses plain Portuguese (no "split payment" — says "retenção automática" or "cobrança mais rigorosa")
- Research docs: `docs/COMPLIANCE_RESEARCH.md` (statistics + sources), `docs/EFFECTIVENESS_METHODOLOGY.md` (derivation of each factor value)

### Common Mistakes Engine
Profile-matched common errors surfaced across multiple product surfaces to drive engagement and conversion.

- `src/lib/simulator/common-mistakes.ts` — Core engine: 15 cataloged errors with profile-matching functions. Each error has `match(ctx)` (boolean filter), `severity(ctx)` (alta/media/baixa), and `build(ctx)` (generates title, description, article link, suggested question). Categories: regime mistakes (LP to LR, Simples hybrid, unknown regime), pricing/contract issues, cash flow planning, MEI-specific (CPF/CNPJ mixing, nanoempreendedor), formalization pressure, state incentives, sector-specific (construction, agro, education)
- **Diagnostic report**: "Erros Comuns do Seu Perfil" free section with severity dots, descriptions, links to articles and assistant
- **Simulator results**: Teaser showing top 2 mistakes with locked CTA driving signup
- **Chat context**: `getErrosComunsParaChat()` injected into system prompt for proactive error coaching
- **System prompt** (`openrouter/client.ts`): Guidelines for non-accusatory, sector-level error coaching

### Dashboard Urgency Signals
- `src/app/(dashboard)/dashboard/page.tsx` — Formalization pressure warning banner (alta/muito_alta), low confidence prompt (< 50%), "Proximo Marco: Janeiro 2027" deadline card

### Diagnostic Report System (`/diagnostico`)
Protected route (requires auth, does NOT require onboarding completion).

- `src/app/(dashboard)/diagnostico/page.tsx` — Server component: loads profile, runs simulation server-side, checks `isPaid` status. **Strips gated data for free users** (alertas → 2, timeline → 2, actions → 1, gatedContent emptied) so paid content never reaches client RSC payload. Passes `fullCounts` prop with real totals for CTAs
- `src/app/(dashboard)/diagnostico/diagnostico-client.tsx` — Client bridge: reads localStorage, saves to profile via server action, triggers page refresh
- `src/app/(dashboard)/diagnostico/diagnostico-report.tsx` — Client component with analytics tracking. Full report UI with sections:
  1. Impact Summary (FREE) — risk badge, R$ range, state ICMS info in profile text
  2. **State ICMS Adjustment Card (FREE)** — shown when |ajustePp| > 0.3; displays state rate, national reference, margin used, and adjustment direction
  3. **O Custo Oculto da Reforma (FREE)** — decomposed impact: rate change + stricter enforcement = total; effective vs legal rates side-by-side; sector context; action guidance for high-pressure sectors
  4. **Impacto no Fluxo de Caixa (FREE)** — 3-column grid: per R$10k retained, monthly retention, annual working capital needed
  5. **Erros Comuns do Seu Perfil (FREE)** — profile-matched common mistakes with severity dots, descriptions, links to articles and assistant
  6. Methodology (FREE) — `<MethodologyCard>` with sources, confidence, limitations
  7. Alerts (PARTIAL) — first 2 free, rest gated with `<GatedSection>`
  8. Timeline (PARTIAL) — first 2 free, rest gated
  9. Action Checklist (PARTIAL) — first 1 free, rest + full interactive checklist gated (uses `<ChecklistItem>`)
  10. Regime Comparison (PAID) — full analysis gated
  11. Year-by-Year Projection (PAID) — 2026-2033 projection with formalization ramp-up gated
  12. **AI Assistant CTA (PAID)** — `<AssistantCTA>` links to `/assistente`
  13. PDF Export (PAID) — `<PdfDownloadButton>` generates PDF via `/api/diagnostico/pdf`
  14. **Recalculate (PAID)** — `<RerunGatedCTA>` at bottom, gated behind paywall
  15. Upgrade CTA — links to `/checkout`, shows alert count + action count
- `src/app/(dashboard)/diagnostico/actions.ts` — `saveSimulatorDataToProfile()` and `toggleChecklistItem()` server actions
- `src/app/(dashboard)/diagnostico/checklist-item.tsx` — Interactive checkbox with optimistic UI
- `src/components/ui/gated-section.tsx` — Reusable `<GatedSection locked={boolean} placeholderLines={number}>` component: when locked, renders skeleton placeholder bars + lock icon overlay (**no real content in DOM** — prevents DevTools bypass). When unlocked, renders `{children}` normally

### Checkout & Payment Flow (`/checkout`)
Protected route. Stripe Checkout integration + promo code bypass.

- `src/app/(dashboard)/checkout/page.tsx` — Client component: side-by-side Free vs Paid tier comparison, Stripe checkout button, promo code input, profile-based urgency banners (formalization pressure, high impact %), money-back guarantee
- `src/app/(dashboard)/checkout/actions.ts` — `redeemPromoCode()` server action: validates against `VALID_PROMO_CODES` map (currently: "amigos"), updates `subscription_tier` + `diagnostico_purchased_at`
- `src/app/api/stripe/checkout/route.ts` — Creates Stripe Checkout Session, redirects to Stripe
- `src/app/api/stripe/webhook/route.ts` — Handles `checkout.session.completed` webhook, updates user profile. Hardened: generic error responses (no internal details leaked), env var validation, idempotency check (skips if `diagnostico_purchased_at` already set)
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
5. **Pricing** — 3 tiers: Básico (free), Completo (R$49), Pro (R$199/mês — "Em breve")
6. **FAQ** — BotRTC comparison, accountant relationship, pricing, data security, compliance assumption explanation
7. **Final CTA** — "A reforma não espera. Simule agora."

Landing page styles are in `src/app/globals.css` (`.landing-root`, `.landing-backdrop`, `.landing-grid`, `.landing-reveal` animations).

### Programmatic SEO (`/reforma/`)
~308 statically generated public pages targeting long-tail keywords like "reforma tributaria comercio sao paulo". Each page has unique content from the calculator (ICMS rates, effectiveness factors, risk levels, formalization pressure). All pages are pure SSG — no API calls at build time, calculator runs in <1ms per call.

**Route tiers:**
- **Tier 1 — Sector × State (243 pages)**: `/reforma/[setor]/[uf]` — 9 sectors × 27 UFs. Each has unique ICMS rate, sector margin, effectiveness factor, and conditional narratives
- **Tier 2 — Sector × Regime (27 pages)**: `/reforma/[setor]/regime/[regime]` — 9 sectors × 3 regimes (slugs: `simples-nacional`, `lucro-presumido`, `lucro-real`)
- **Tier 3 — State ICMS (27 pages)**: `/reforma/icms/[uf]` — ICMS extinction impact per state across goods sectors
- **Hub pages (11)**: `/reforma` (master), `/reforma/[setor]` (9 sector hubs), `/reforma/icms` (ICMS hub)

**Key directories:**
- `src/lib/seo/slug-maps.ts` — Display name/slug/preposition mappings for sectors, regimes, UFs. Validation helpers (`isValidSetor`, `isValidUf`, `isValidRegimeSlug`). `REGIME_SLUG_TO_KEY` maps URL slugs to `RegimeTributario` keys
- `src/lib/seo/reforma-data.ts` — Data computation: `computeSetorUfData()`, `computeSetorRegimeData()`, `computeIcmsUfData()`. Combination generators: `getAllSetorUfCombinations()`, `getAllSetorRegimeCombinations()`. Reuses `calcularSimulacao()` from calculator
- `src/lib/seo/content-blocks.ts` — Portuguese narrative generators (template-driven, no AI). Builds overview, burden analysis, hidden cost, ICMS impact, action items, FAQ entries. JSON-LD builders for Article, BreadcrumbList, FAQPage schemas
- `src/components/reforma/` — Server-only components: `reforma-header`, `burden-comparison`, `effectiveness-card`, `icms-card`, `timeline-highlights`, `action-list`, `sources-section`, `internal-links`, `reforma-cta`, `reforma-breadcrumbs`

**Design decisions:**
- "outro" sector and "nao_sei" regime excluded (no unique data → thin content)
- Representative faturamento bracket: `360k_4.8m` (EPP midpoint) for all SEO pages
- All narratives are conditional logic from calculator outputs — not AI-generated (Google penalizes AI content at scale)
- Every page cites EC 132/2023, LC 214/2025, and state ICMS laws
- CTA links to `/simulador` ("Estes dados são médias. Simule o impacto exato para sua empresa")
- Internal linking: same-sector/other-states, same-state/other-sectors, regime links, hub links

**Sitemap:** All ~308 URLs added to `src/app/sitemap.ts` with priority 0.7 and monthly changeFrequency.

### Feedback Collection System
Inline `<FeedbackPrompt>` cards at key decision points — non-intrusive, appear after a delay, dismissed via localStorage.

- `src/components/feedback/feedback-prompt.tsx` — Reusable component with three modes: `options` (multi-select pills), `rating` (emoji scale), `rating_comment` (rating + contextual follow-up questions + text)
- `src/app/actions/feedback.ts` — `submitFeedback()` server action, uses `createAdminClient()`
- Three placements:
  1. **Checkout page** (`checkout_objection`, 15s delay) — "What's holding you back?" with 5 objection options
  2. **Diagnostic free user** (`diagnostic_free_objection`, 20s delay) — "What's missing to unlock?" with 4 options
  3. **Diagnostic paid user** (`diagnostic_satisfaction`, no delay) — Emoji rating → contextual follow-ups (low: "What to improve?", high: "What helped most?") + free text

### Monetization Tiers
- **Free**: Simulator + basic diagnostic (3 alerts, 2 actions, timeline)
- **Diagnóstico Completo (R$49 one-time)**: All alerts, full checklist, year-by-year projection, regime analysis, PDF export — currently unlockable via promo code "amigos" at `/checkout`
- **Pro (R$199/month)**: Unlimited AI chat, updated diagnostics, priority models — coming later

Database columns: `diagnostico_purchased_at`, `subscription_tier`, `stripe_customer_id` in `user_profiles`. Stripe Checkout is live.

### Security
- **Security headers** (`next.config.ts`): `X-Frame-Options: DENY` (clickjacking), `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (HSTS, 2 years), `Referrer-Policy: strict-origin-when-cross-origin`. No CSP (Supabase/Stripe/Google Fonts compatibility)
- **Paywall hardening**: GatedSection renders skeleton placeholders (not blurred real content) when locked. Server-side data stripping in `diagnostico/page.tsx` ensures paid content never reaches the RSC payload for free users
- **Stripe webhook**: Generic error responses, env var validation, idempotency (won't double-process)
- **Newsletter RLS**: SELECT and UPDATE policies restricted to service role only (migration `00008`). Public retains INSERT-only access. App uses `createAdminClient()` for reads/updates
- **Rate limiting** (`src/lib/rate-limit.ts`): In-memory per-instance rate limiter (Edge Runtime compatible). Applied to: chat API (30 msgs/hr per user, 429 + Retry-After), analytics API (60 events/min per session, silent drop). For global consistency across serverless instances, upgrade to Upstash Redis

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
- `content_chunks` - RAG knowledge base with embeddings (from 36 articles; re-ingest after adding articles)
- `analytics_events` - Custom event tracking
- `newsletter_subscribers` - Email collection
- `checklist_progress` - Diagnostic checklist completion state per user
- `feedback` - Structured feedback (prompt_id, rating, selected_options, comment, metadata)

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
5. `supabase/migrations/00005_deep_personalization.sql` — Deep personalization columns on `user_profiles`
6. `supabase/migrations/00006_feedback.sql` — Feedback collection table
7. `supabase/migrations/00007_diagnostico_runs.sql` — Adds `diagnostico_runs_remaining` to `user_profiles`
8. `supabase/migrations/00008_fix_newsletter_rls.sql` — Drops overly permissive SELECT/UPDATE RLS on `newsletter_subscribers`

### Knowledge Base Ingestion
```bash
npx tsx scripts/knowledge-base/ingest.ts --force --verbose  # Ingest all 36 articles into Supabase
npx tsx scripts/knowledge-base/ingest.ts --dry-run          # Preview without writing
```
Loads `.env.local` for credentials. Generates OpenAI embeddings and writes to `content_chunks` table.

## Path Alias

TypeScript path alias `@/*` maps to `./src/*`
