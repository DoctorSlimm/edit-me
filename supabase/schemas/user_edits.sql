-- Create user_edits table for storing user feedback and edit requests
CREATE TABLE IF NOT EXISTS user_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET,
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on created_at for faster querying by date
CREATE INDEX IF NOT EXISTS idx_user_edits_created_at ON user_edits(created_at DESC);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_edits_email ON user_edits(email);

-- Enable Row Level Security
ALTER TABLE user_edits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for form submissions)
CREATE POLICY "Allow public inserts" ON user_edits
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow only authenticated users to read
CREATE POLICY "Allow authenticated reads" ON user_edits
  FOR SELECT
  USING (auth.role() = 'authenticated');
