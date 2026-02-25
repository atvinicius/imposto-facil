# Effectiveness Factor Methodology

> Last updated: 2026-02-24
> Purpose: Explains how each `FATOR_EFETIVIDADE` value was derived.

---

## What is the Effectiveness Factor?

The effectiveness factor (0 to 1) represents the ratio between what businesses in a given sector/regime *actually pay* in taxes versus what they're *legally required* to pay.

A factor of 0.65 means the average business in that segment effectively pays 65% of the statutory burden.

This is not a measure of intentional evasion. The gap includes:
- Cash transactions without nota fiscal (common in retail, services)
- Informal operations alongside formal ones
- Strategic threshold gaming (staying under Simples limits)
- Tax debt cycles (parcelamento)
- Legal tax planning and optimization
- System complexity causing unintentional errors

---

## Data Sources

1. **Receita Federal** — Annual arrecadacao reports comparing actual collection vs theoretical tax base
2. **IBGE PNAD Continua** — Informal employment rates by sector
3. **McKinsey Global Institute** — Sector-specific tax evasion estimates for Brazil
4. **PGFN** — Active debt statistics by taxpayer category
5. **SEBRAE** — Simples Nacional dependency research
6. **CIAT** — Tax compliance cost studies
7. **MDPI Economics** — "Tax Evasion and Company Survival: A Brazilian Case Study"

---

## Derivation by Sector

### Comercio (Retail)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.65 | 80% of retail food sales involve underreporting (McKinsey). Cash-heavy sector. MEI threshold gaming common. |
| Lucro Presumido | 0.70 | Slightly more formal due to accounting requirements, but still significant cash economy. |
| Lucro Real | 0.85 | Full accounting requirements force higher compliance. Credit chain documentation helps. |
| Nao sei | 0.70 | Weighted average across regimes. |

### Servicos (Services)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.72 | Mixed sector. Personal services (beauty, food) very informal. Professional services (consulting, legal) more formal. Weighted average. |
| Lucro Presumido | 0.75 | ISS municipal variation creates compliance gaps. Service-heavy cash transactions. |
| Lucro Real | 0.85 | Full documentation requirements. Fewer cash transactions. |
| Nao sei | 0.75 | Weighted average. |

### Construcao (Construction)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.60 | Highest informality across all sectors. Heavy cash payments to subcontractors. Informal labor widespread (IBGE: 50%+ informal in construction). |
| Lucro Presumido | 0.65 | Better than Simples but still significant informal practices. |
| Lucro Real | 0.80 | Large projects require documentation. Still informal subcontracting. |
| Nao sei | 0.65 | Weighted average. |

### Agronegocio (Agriculture)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.70 | Small producers often operate informally. Multiple exemptions create complexity. |
| Lucro Presumido | 0.72 | Somewhat more formal due to supply chain requirements. |
| Lucro Real | 0.82 | Large agribusiness is well-documented. Small-medium still has gaps. |
| Nao sei | 0.72 | Weighted average. |

### Saude (Healthcare)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.80 | Regulated sector with licensing requirements. Lower informality. Some cash payments for individual practitioners. |
| Lucro Presumido | 0.82 | Hospital/clinic accounting requirements. Regulated insurance payments. |
| Lucro Real | 0.90 | Full documentation, regulated payments. |
| Nao sei | 0.82 | Weighted average. |

### Tecnologia (Technology)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.90 | Highly digital sector. Nearly all transactions documented electronically. SaaS/subscription models leave clear trails. |
| Lucro Presumido | 0.90 | Same digital documentation advantage. |
| Lucro Real | 0.95 | Full accounting + digital nature = near-full compliance. |
| Nao sei | 0.90 | Weighted average. |

### Educacao (Education)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.82 | Moderate formalization. Some tutoring/courses operate informally. Schools generally formal. |
| Lucro Presumido | 0.82 | Similar dynamics. |
| Lucro Real | 0.88 | Full accounting requirements. |
| Nao sei | 0.82 | Weighted average. |

### Financeiro (Financial Services)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.95 | Heavily regulated by BACEN. Nearly full compliance due to regulatory oversight. |
| Lucro Presumido | 0.95 | Same regulatory framework. |
| Lucro Real | 0.98 | Maximum compliance. Banks/insurers under constant audit. |
| Nao sei | 0.95 | Weighted average. |

### Industria (Manufacturing)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.85 | Supply chain documentation forces compliance (buyers need invoices for credit). Some informal raw material sourcing. |
| Lucro Presumido | 0.85 | Same supply chain dynamics. |
| Lucro Real | 0.90 | Full documentation + credit chain = high compliance. |
| Nao sei | 0.85 | Weighted average. |

### Outro (Other/Generic)

| Regime | Factor | Rationale |
|--------|--------|-----------|
| Simples | 0.75 | Conservative average across all sectors. |
| Lucro Presumido | 0.78 | Slightly higher than Simples due to accounting requirements. |
| Lucro Real | 0.88 | Full accounting baseline. |
| Nao sei | 0.78 | Weighted average. |

---

## Formalization Pressure Classification

Based on the gap between effective and statutory rates:

| Gap (1 - factor) | Classification | Label (PT-BR) |
|-------------------|---------------|----------------|
| > 30% | critica | Muito alta |
| > 20% | alta | Alta |
| > 10% | media | Moderada |
| <= 10% | baixa | Baixa |

---

## Confidence Levels

All effectiveness factors use confidence level `"estimativa_oficial"` or `"derivada"`:

- `estimativa_oficial`: Based directly on Receita Federal arrecadacao data or IBGE surveys
- `derivada`: Calculated by combining multiple data sources (informal employment rates, sector evasion studies, PGFN debt data)

No effectiveness factor has `"legislada"` confidence — these are statistical estimates, not legal rates.

---

## Update Schedule

These factors should be reviewed:
- When Receita Federal publishes new arrecadacao reports (annually)
- When IBGE releases updated informal economy data
- After major enforcement changes (e.g., split payment launch in 2027)
- When user feedback suggests calibration issues (via the feedback system)

---

## Limitations

1. These are sector-level averages — individual businesses may be fully compliant or significantly less compliant
2. ~~The factors don't capture regional variation~~ — **Partially addressed** (Feb 2026): State-specific ICMS modal rates (17%-23%) now adjust `CARGA_ATUAL` for goods-based sectors on non-Simples regimes via `calcularAjusteIcmsUf()`. However, effectiveness factors themselves remain national averages — regional informality variation (e.g., Northeast vs Southeast) is not yet modeled
3. MEI vs ME vs EPP likely have different effectiveness profiles, but we don't differentiate by size within Simples
4. Factors will need recalibration as the reform enforcement ramps up (2027-2033)

---

## Related: State ICMS Rate Adjustment

> Added: 2026-02-25

The effectiveness factors above model the *compliance gap* (how much of the statutory burden is actually paid). A separate system now models *state-level rate variation* for ICMS:

- `ICMS_ALIQUOTA_MODAL` in `tax-data.ts`: 27-state modal ICMS rates, each citing specific state law
- `ICMS_REFERENCIA_NACIONAL`: 19% GDP-weighted national average
- `MARGEM_BRUTA_ESTIMADA`: Sector gross margins from IBGE (how ICMS rate differences translate to burden-on-revenue)
- Formula: `ajustePp = (ufRate - refRate) × sectorMargin`
- Example: MA (23%) comercio (margin 30%) → (23 - 19) × 0.30 = **+1.2pp** on `CARGA_ATUAL`

This is orthogonal to effectiveness factors — ICMS adjustment changes the *legal* baseline, while effectiveness factors model the *compliance gap* against that baseline. Both are applied together in `calcularImpacto()`.

**Scope**: Only goods-based sectors (`comercio`, `industria`, `construcao`, `agronegocio`) on non-Simples regimes. Services use ISS (municipal, not state ICMS). Simples DAS is nationally uniform.

**Limitation**: Uses sector-average gross margins. A business's actual margin may differ significantly, making the ICMS adjustment more or less impactful than estimated.
