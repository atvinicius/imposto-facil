-- Migration: Fix overly permissive newsletter RLS policies
-- Depends on: 00004_analytics_checklist_newsletter.sql
--
-- SECURITY FIX: The original policies allowed anyone with the public
-- anon key to read ALL subscriber emails and update ANY record.
-- Since the newsletter action uses createAdminClient() (service role),
-- which bypasses RLS, we only need the INSERT policy for the public.

-- Drop dangerous SELECT policy (exposed all subscriber emails)
DROP POLICY IF EXISTS "Anyone can read newsletter subscriptions" ON newsletter_subscribers;

-- Drop dangerous UPDATE policy (allowed mass-unsubscribe)
DROP POLICY IF EXISTS "Anyone can update newsletter subscription" ON newsletter_subscribers;

-- Service role (admin client) bypasses RLS, so no replacement policies needed.
-- The application code in newsletter.ts already uses createAdminClient() for
-- reads and updates. Only the public INSERT policy remains.
