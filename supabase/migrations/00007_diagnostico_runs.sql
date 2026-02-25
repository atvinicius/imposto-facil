-- Migration: Add diagnostico_runs_remaining to user_profiles
-- Each purchase grants 3 runs. Default 0 = no paid runs remaining.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diagnostico_runs_remaining INTEGER DEFAULT 0;
