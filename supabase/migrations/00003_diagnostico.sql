-- Add diagnostic-related columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS faturamento TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS simulator_result JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diagnostico_purchased_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'diagnostico', 'pro'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
