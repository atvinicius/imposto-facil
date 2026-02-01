# Changelog

All notable changes to ImpostoFacil are documented in this file.

---

## [2025-02-01] Landing Page Redesign

### Overview
Transformed the generic landing page into a high-converting, credible page with urgency messaging, social proof, pricing tiers, and compelling copy in Brazilian Portuguese.

### New Files Created

#### Data Layer
- `src/lib/landing-data.ts` - Centralized content data including:
  - `STATS` - Usage statistics (companies, simulations, satisfaction, articles)
  - `FEATURES` - 4 feature cards with icons, titles, descriptions, benefits
  - `TESTIMONIALS` - 3 customer testimonials with avatars
  - `PRICING_TIERS` - 4 pricing plans (Gratuito, Profissional, Empresarial, Contador)
  - `FAQ_ITEMS` - 6 frequently asked questions
  - `HOW_IT_WORKS_STEPS` - 3-step onboarding process
  - `PROBLEM_STATS` - Pain point statistics
  - `BEFORE_AFTER` - Tax system comparison
  - `TRUST_BADGES` - Credibility indicators
  - `TARGET_DATE` - January 1, 2026 countdown target

#### Components (`src/components/landing/`)

| Component | Type | Description |
|-----------|------|-------------|
| `countdown-timer.tsx` | Client | Live countdown to Jan 1, 2026 with hydration handling |
| `hero-section.tsx` | Server | Hero with urgency badge, countdown, headline, CTAs |
| `problem-section.tsx` | Server | Pain points, stats, before/after comparison |
| `solution-section.tsx` | Server | 4 feature cards with benefit lists |
| `social-proof-section.tsx` | Server | Stats bar, testimonials, trust badges |
| `how-it-works-section.tsx` | Server | 3-step process visualization with connector line |
| `pricing-card.tsx` | Server | Reusable pricing tier card |
| `pricing-section.tsx` | Server | 4 pricing tiers with 7-day guarantee |
| `faq-item.tsx` | Client | Collapsible accordion item with animation |
| `faq-section.tsx` | Server | FAQ wrapper with 6 questions |
| `final-cta-section.tsx` | Server | Final urgency CTA with compact countdown |
| `landing-footer.tsx` | Server | 4-column footer with legal links |

### Modified Files
- `src/app/page.tsx` - Refactored to compose all section components with:
  - Sticky header with backdrop blur
  - Navigation links (Como funciona, Precos, Conhecimento)
  - All landing sections in order

### Technical Decisions

#### No New Dependencies
- FAQ accordion uses custom `useState` implementation (no @radix-ui/react-accordion)
- Countdown uses native `setInterval`
- All animations via Tailwind CSS transitions

#### Hydration Handling
The countdown timer required special handling for server/client rendering differences:
- Initial state is `null` (renders "--" placeholder)
- `useEffect` populates actual values on client mount
- `suppressHydrationWarning` on dynamic elements prevents React warnings

#### Component Architecture
- Data centralized in `landing-data.ts` for easy content updates
- Section components are self-contained and composable
- Client components (`"use client"`) only where interactivity is needed

### Key Copy (Brazilian Portuguese)

- **Hero Headline**: "Sua empresa esta preparada para a maior mudanca tributaria dos ultimos 50 anos?"
- **Problem Stakes**: "Empresas despreparadas podem perder R$ 50.000 a R$ 500.000 em creditos tributarios"
- **Final CTA**: "Nao deixe sua empresa para tras"
- **Trust signals**: "Baseado na EC 132/2023", "Fontes oficiais: Receita Federal"

### Pricing Structure

| Tier | Price | Target Audience |
|------|-------|-----------------|
| Gratuito | R$ 0/mes | Getting started |
| Profissional | R$ 49/mes | Business owners (highlighted) |
| Empresarial | R$ 199/mes | Teams with fiscal departments |
| Contador | R$ 399/mes | Accounting firms |

### Git Commits
- `9a76d24` - feat: redesign landing page with urgency messaging and social proof
- `0ce19e7` - fix: resolve hydration error in countdown timer

### Verification Completed
- [x] `npm run build` - No TypeScript errors
- [x] `npm run lint` - No ESLint errors in landing components
- [x] Dev server renders all sections
- [x] Vercel deployment successful after hydration fix
