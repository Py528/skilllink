-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('instructor', 'learner')) DEFAULT 'learner',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  bio TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (if you want row-level security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;