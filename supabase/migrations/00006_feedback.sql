-- Migration: Feedback collection system
-- Depends on: 00005_deep_personalization.sql

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL
    CHECK (feedback_type IN ('pre_purchase', 'post_purchase')),
  rating INTEGER
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  selected_options TEXT[],
  comment TEXT,
  page_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_prompt_id ON feedback(prompt_id);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
