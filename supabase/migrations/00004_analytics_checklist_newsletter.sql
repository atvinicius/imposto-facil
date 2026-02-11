-- Migration: analytics_events, newsletter_subscribers, checklist_progress
-- Depends on: 00003_diagnostico.sql

-- ============================================================
-- 1. Analytics Events table
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- RLS: users can insert their own events, service role can read all
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 2. Newsletter Subscribers table
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT NOT NULL CHECK (source IN ('landing', 'dashboard'))
);

ALTER TABLE newsletter_subscribers ADD CONSTRAINT newsletter_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- RLS: anyone can subscribe (insert), only service role manages
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update newsletter subscription"
  ON newsletter_subscribers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read newsletter subscriptions"
  ON newsletter_subscribers FOR SELECT
  USING (true);

-- ============================================================
-- 3. Add checklist_progress to user_profiles
-- ============================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS checklist_progress JSONB DEFAULT '{"completed":[],"updated_at":null}';
