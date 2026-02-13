-- Migration: Deep Personalization Profile Fields
-- Adds progressive profiling data for enhanced diagnostic accuracy

-- Tier 1: Core personalization (post-signup)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fator_r_estimado NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pct_b2b NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tipo_custo_principal TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pct_interestadual NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tem_incentivo_icms TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS num_funcionarios TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS exporta_servicos BOOLEAN;

-- Tier 2: Paid diagnostic deep dive
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mix_pix NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mix_cartao NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mix_boleto NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mix_dinheiro NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fornecedores_regime TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tem_contratos_lp BOOLEAN;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS importa_bens BOOLEAN;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS imovel_proprio BOOLEAN;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS faturamento_exato NUMERIC(15,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cnae_principal TEXT;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.fator_r_estimado IS 'Payroll/revenue ratio (0-100%). Critical for credit gap modeling';
COMMENT ON COLUMN user_profiles.pct_b2b IS 'B2B sales percentage (0-100%). Determines credit chain vs cash flow focus';
COMMENT ON COLUMN user_profiles.tipo_custo_principal IS 'Primary cost type: materiais, servicos, folha, misto';
COMMENT ON COLUMN user_profiles.pct_interestadual IS 'Interstate sales percentage (0-100%). Destination principle impact';
COMMENT ON COLUMN user_profiles.tem_incentivo_icms IS 'Has ICMS incentive: sim, nao, nao_sei';
COMMENT ON COLUMN user_profiles.num_funcionarios IS 'Employee count bracket: 0, 1_5, 6_20, 21_100, 100_mais';
COMMENT ON COLUMN user_profiles.exporta_servicos IS 'Exports services (zero-rate benefit)';
