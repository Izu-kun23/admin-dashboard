-- Simple quiz_submissions table setup
-- Run this in Supabase SQL Editor

CREATE TABLE quiz_submissions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL
);

-- Insert sample data
INSERT INTO quiz_submissions (user_id, quiz_id, score, total_questions, status) VALUES
  ('user-001', 'quiz-basics', 8, 10, 'completed'),
  ('user-002', 'quiz-advanced', 12, 15, 'completed'),
  ('user-003', 'quiz-basics', 4, 10, 'failed'),
  ('user-004', 'quiz-intermediate', 7, 8, 'completed'),
  ('user-005', 'quiz-advanced', 9, 15, 'completed');

-- Grant permissions
GRANT ALL ON quiz_submissions TO authenticated;
GRANT USAGE ON SEQUENCE quiz_submissions_id_seq TO authenticated;
