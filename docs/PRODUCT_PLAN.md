# ImpostoFacil — Product Plan

*Living document. Last updated: February 2026.*

## Vision

Make Brazil's tax reform understandable and actionable for small business owners who can't afford dedicated tax consultants.

## Target User

**Primary**: Small business owners (MEI, ME, EPP) with low-to-medium tax literacy who are confused by the reform and worried about compliance.

**Profile**:
- Revenue under R$5M/year
- Don't have a dedicated finance team
- Rely on a single external accountant (or none)
- Need answers in simple language, not legal jargon
- Access primarily via mobile
- Price-sensitive — accustomed to free tools or low monthly subscriptions

## Value Proposition

> "Entenda como a reforma tributaria afeta a SUA empresa — sem juridiques, sem consultoria cara."

ImpostoFacil gives you a personalized view of the tax reform's impact on your business, answers your questions in plain language, and helps you plan your next steps.

## What Exists Today (v0 — Beta)

### Working Features

| Feature | Status | Description |
|---------|--------|-------------|
| **AI Chat Assistant** | Functional | RAG-powered with Claude 3.5 Sonnet, hybrid search, streams via SSE, cites sources, personalizes based on user profile |
| **Impact Simulator** | Functional | 4-step wizard (regime, sector, revenue, state). Estimates annual impact, risk level, sector alerts, key dates, recommended actions |
| **Knowledge Base** | Functional (limited) | 5 MDX articles with proper citations (IBS, CBS, IS, transition timeline, glossary). Full-text + semantic search |
| **User Onboarding** | Functional | 4-step profile collection (name, UF, sector, company size, tax regime, interests) |
| **Auth System** | Functional | Email/password via Supabase. Route protection, session management |
| **Dashboard** | Functional | Basic overview page |

### Infrastructure

- Next.js 16 (App Router, React 19, TypeScript strict)
- Supabase (PostgreSQL + Auth + RLS)
- OpenAI embeddings + pgvector for semantic search
- Content ingestion pipeline (MDX → chunks → embeddings → DB)
- Edge Runtime for chat API

## Product Roadmap

### Phase 1: Honest MVP (Current Sprint)

**Goal**: Clean up the product so it's honest, presentable, and demo-ready.

- [x] Remove all fake content (testimonials, stats, pricing tiers)
- [ ] Delete unused landing components and landing-data.ts
- [ ] Revamp landing page — honest, compelling, focused on real features
- [ ] Add "Beta" positioning throughout
- [ ] Add proper disclaimers (educational tool, not professional advice)
- [ ] Audit and fix all app pages
- [ ] Make simulator accessible without login (already is)
- [ ] Ensure knowledge base is accessible without login

### Phase 2: Content & Polish (Next)

**Goal**: Make the existing features genuinely useful and expand content.

- [ ] Expand knowledge base to 15-20 articles covering:
  - Sector-specific impact guides (services, commerce, industry, agriculture)
  - Regime-specific guides (Simples, Lucro Presumido, Lucro Real, MEI)
  - Practical checklists (what to do in 2026, what to do in 2027)
  - Credit management basics
  - Contract review considerations
- [x] Improve simulator with better disclaimers and export (PDF/share)
- [x] State-specific ICMS rate adjustment (27 states, goods-based sectors, non-Simples)
- [ ] Improve AI assistant system prompt with more context
- [ ] Add "Proximos Passos" (next steps) feature to simulator results
- [ ] Mobile optimization pass
- [ ] SEO optimization (meta tags, structured data, sitemap)

### Phase 3: Engagement & Retention

**Goal**: Give users a reason to come back.

- [ ] Email capture for reform updates (newsletter)
- [ ] Deadline tracker / reform calendar
- [ ] Saved simulation results (per user)
- [ ] Bookmark/save knowledge base articles
- [ ] Dashboard with personalized reform readiness score
- [ ] Push notifications for regulatory changes (later)

### Phase 4: Monetization

**Goal**: Introduce paid tier once free tier proves value.

**Free tier** (generous):
- Unlimited knowledge base access
- Impact simulator (unlimited runs)
- AI assistant (N questions/month — exact limit TBD based on cost)
- Basic profile personalization
- Reform calendar / deadline tracker

**Paid tier** (R$19-39/month — price TBD after validation):
- Unlimited AI assistant queries
- Exportable simulation reports (PDF)
- Personalized action plan / checklist
- Priority content updates
- Email digest of regulatory changes relevant to their profile

**Revenue model**: Freemium SaaS. Stripe integration for payments.

**Note**: Pricing and tier structure should be validated through user interviews before building. The numbers above are starting hypotheses.

### Phase 5: Growth

**Goal**: Scale acquisition and explore adjacent revenue.

- [ ] SEO content strategy (target "reforma tributaria + [sector/regime/state]")
- [ ] Referral program (invite your contador)
- [ ] Accountant partnership program (accountants get tools to educate clients)
- [ ] API for third-party integrations (if demand exists)
- [ ] Lead gen for professional consultations (marketplace or referral)

## Principles

1. **Honesty first** — Never claim features that don't exist. Never fabricate social proof. If it's beta, say it's beta.
2. **Simplicity** — Our user is not a tax expert. Everything must be understandable by someone with no tax background.
3. **Actionability** — Don't just explain what changed. Tell them what to DO about it.
4. **Personalization** — Generic advice is worthless. Everything should be filtered through their specific business context.
5. **Free-first** — The free tier should be genuinely useful. Paid tier is for power users who get enough value to justify it.
6. **Build less, learn more** — Talk to users before building features. Validate demand before investing development time.

## Key Metrics to Track (Once Launched)

- Signups / week
- Simulator completions / week
- AI chat messages / user / week
- Return visits (DAU/WAU)
- Knowledge base article views
- Free → Paid conversion (when applicable)
- NPS / qualitative feedback

## Open Questions

- What's the right AI query limit for free tier? (Cost vs. retention)
- Should the simulator require signup? (Currently no — good for acquisition)
- Is there demand for a Portuguese-language reform newsletter?
- Would accountants use this to serve their clients, or would they see it as competition?
- What price point would SME owners actually pay? (R$19? R$29? R$49?)

## Technical Debt to Address

- Old landing components (12 files) need deletion
- landing-data.ts needs deletion
- Dashboard page may have references to nonexistent features
- No payment infrastructure (Stripe) — needed for Phase 4
- No email system — needed for Phase 3 (newsletter, notifications)
- No analytics — needed before launch to track metrics
