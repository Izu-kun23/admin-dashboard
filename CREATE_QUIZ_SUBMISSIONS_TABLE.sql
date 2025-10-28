-- Create quiz_submissions table for Supabase
-- This table stores quiz submission data for the activity page

-- Drop table if it exists (for clean setup)
DROP TABLE IF EXISTS quiz_submissions CASCADE;

-- Create the quiz_submissions table
CREATE TABLE quiz_submissions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('completed', 'in_progress', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id ON quiz_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_id ON quiz_submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_submitted_at ON quiz_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_status ON quiz_submissions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_submissions table
-- Policy for admins to view all submissions
CREATE POLICY "Admins can view all quiz submissions" ON quiz_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Policy for users to view their own submissions
CREATE POLICY "Users can view their own quiz submissions" ON quiz_submissions
  FOR SELECT USING (user_id = auth.uid()::text);

-- Policy for users to insert their own submissions
CREATE POLICY "Users can insert their own quiz submissions" ON quiz_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policy for users to update their own submissions
CREATE POLICY "Users can update their own quiz submissions" ON quiz_submissions
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Insert some sample data for testing
INSERT INTO quiz_submissions (user_id, quiz_id, score, total_questions, status, submitted_at) VALUES
  ('sample-user-1', 'quiz-basics', 8, 10, 'completed', NOW() - INTERVAL '1 hour'),
  ('sample-user-2', 'quiz-advanced', 12, 15, 'completed', NOW() - INTERVAL '2 hours'),
  ('sample-user-3', 'quiz-basics', 4, 10, 'failed', NOW() - INTERVAL '3 hours'),
  ('sample-user-4', 'quiz-intermediate', 7, 8, 'completed', NOW() - INTERVAL '4 hours'),
  ('sample-user-5', 'quiz-advanced', 9, 15, 'completed', NOW() - INTERVAL '5 hours');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_quiz_submissions_updated_at 
  BEFORE UPDATE ON quiz_submissions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON quiz_submissions TO authenticated;
GRANT USAGE ON SEQUENCE quiz_submissions_id_seq TO authenticated;
