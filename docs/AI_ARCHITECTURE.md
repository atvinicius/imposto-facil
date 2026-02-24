# AI Architecture: Ground Truth & Consistency

## Overview

ImpostoFacil uses a **two-layer AI architecture** built on a shared ground truth data layer:

1. **Deterministic Layer** — The Impact Simulator and Diagnostic Report (`src/lib/simulator/`). Produces exact, reproducible results from cited tax data. This is the source of truth for all tax impact numbers.

2. **Probabilistic Layer** — The AI chat assistant "Duda" (`src/app/api/chat/`, `src/lib/openrouter/`). Uses RAG over the knowledge base + user diagnostic data to answer questions conversationally.

Both layers share the same ground truth: `src/lib/simulator/tax-data.ts` (for rates and calculations) and `src/content/` (for explanatory content).

## Ground Truth Design

### CitedValue Pattern

All tax data in `tax-data.ts` is wrapped in `CitedValue<T>`:

```typescript
interface CitedValue<T> {
  value: T
  source: string       // Legislative reference (e.g., "PLP 68/2024, Art. 302")
  confidence: "legislada" | "estimativa_oficial" | "derivada"
  notes?: string
}
```

**Confidence tiers:**
- `legislada` — Enacted in law (EC 132/2023, LC 214/2025, LC 227/2026)
- `estimativa_oficial` — Official government estimates (Receita Federal, BNDES studies)
- `derivada` — Calculated from legislated values using documented methodology

### Provenance Tracking

Each `SimuladorResult` includes a `metodologia` field with:
- `confianca`: overall confidence level
- `fontes`: list of legislative/data sources used
- `limitacoes`: known limitations of the estimate
- `ultimaAtualizacao`: last verification date

Additionally, `confiancaPerfil` (0-100) scores how complete the user's profile data is, affecting estimate precision.

## Current Implementation

### Chat-Diagnostic Data Flow

The chat API (`src/app/api/chat/route.ts`) injects the user's full `SimuladorResult` into the conversation context:

- Risk level, impact range, confidence scores
- First 3 alerts and first 2 recommended actions (free tier data)
- Key dates from the transition timeline
- Split payment impact (if available)
- For paid users: regime analysis summary and year-by-year projection

### System Prompt Guardrails

The system prompt (`src/lib/openrouter/client.ts`) includes:

1. **Diagnostic data routing** — Duda is instructed to use diagnostic data exclusively for factual questions about the user's tax impact, rather than generating its own estimates.

2. **Anti-hallucination rules** — Explicit prohibition against inventing tax rates, percentages, monetary values, or dates not present in provided contexts. When no data is available, Duda must use qualifiers ("geralmente", "em media", "depende do caso").

3. **Source attribution** — When citing diagnostic numbers, Duda prefixes with "De acordo com seu diagnostico, ..." to distinguish calculated data from AI-generated content.

4. **Upsell routing** — When free-tier users ask about gated content, Duda suggests unlocking the full diagnostic at `/checkout`.

## Future Improvements

### High Priority, Low Effort

- **C1: Add `lastVerified` to individual CitedValues** — Currently only `metodologia.ultimaAtualizacao` tracks freshness at the result level. Adding per-value timestamps would allow detecting stale individual rates. Useful when regulatory updates affect only specific rates.

### High Priority, High Effort (Pro Tier)

- **A3: Unify tax-data.ts and MDX articles as single data source** — Currently the simulator uses `tax-data.ts` while the knowledge base uses MDX articles. Numbers could theoretically diverge. A shared data layer would guarantee consistency. Best implemented when chat becomes a paid feature.

- **B2: Post-generation grounding check** — After Duda generates a response, run a lightweight check comparing any numbers in the response against `tax-data.ts` values. Flag or suppress responses that contain numbers not traceable to ground truth. Implement when chat becomes a paid feature.

### Medium Priority

- **C2: Legislative change detection** — Monitor official gazette (DOU) for regulatory updates affecting tax-data.ts values. Could be a scheduled job that flags values needing review. Reduces risk of serving outdated data.

- **B3: Structured output mode for factual questions** — For questions that have deterministic answers (e.g., "qual a aliquota do IBS em 2027?"), bypass the LLM entirely and return data directly from tax-data.ts. Implement when building Pro tier features.

### Low Priority

- **C3: Content freshness admin dashboard** — Simple page showing all CitedValues with their sources, confidence levels, and last-verified dates. Helps maintain data quality as regulations evolve.

- **D1: Source confidence badges on chat messages** — Visual indicators in the chat UI showing whether a response is backed by `legislada`, `estimativa_oficial`, or `derivada` data.

- **D2: "Powered by your diagnostic" visual indicator** — When Duda uses diagnostic data in a response, show a small badge/chip indicating the numbers come from the user's personalized diagnostic, not generic AI output.
