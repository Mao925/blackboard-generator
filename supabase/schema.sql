-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  school_name VARCHAR(200),
  subjects TEXT[] DEFAULT '{}',
  plan_type VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blackboards table
CREATE TABLE blackboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  unit_name VARCHAR(100),
  class_duration INTEGER,
  key_points TEXT,
  layout_type VARCHAR(50),
  text_size VARCHAR(20),
  color_scheme VARCHAR(20),
  diagram_ratio VARCHAR(20),
  
  -- File URLs
  original_image_url TEXT,
  generated_image_url TEXT,
  generated_pdf_url TEXT,
  
  -- AI processing
  ocr_text TEXT,
  ai_analysis JSONB,
  generation_status VARCHAR(20) DEFAULT 'pending',
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage statistics table
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  generations_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Plan limits table
CREATE TABLE plan_limits (
  plan_type VARCHAR(20) PRIMARY KEY,
  max_generations_per_month INTEGER,
  max_storage_mb INTEGER,
  max_file_size_mb INTEGER,
  ai_features_enabled BOOLEAN DEFAULT true,
  priority_processing BOOLEAN DEFAULT false
);

-- Insert initial plan data
INSERT INTO plan_limits (plan_type, max_generations_per_month, max_storage_mb, max_file_size_mb, ai_features_enabled, priority_processing) VALUES 
('free', 10, 100, 10, true, false),
('pro', 100, 1000, 50, true, true),
('premium', 1000, 10000, 100, true, true);

-- Indexes for performance
CREATE INDEX idx_blackboards_user_id ON blackboards(user_id);
CREATE INDEX idx_blackboards_subject ON blackboards(subject);
CREATE INDEX idx_blackboards_created_at ON blackboards(created_at DESC);
CREATE INDEX idx_blackboards_status ON blackboards(generation_status);
CREATE INDEX idx_usage_stats_user_date ON usage_stats(user_id, date);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Blackboards policies
CREATE POLICY "Users can view own blackboards" ON blackboards
  FOR SELECT USING (auth.uid()::text = user_id::text OR is_public = true);

CREATE POLICY "Users can insert own blackboards" ON blackboards
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own blackboards" ON blackboards
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own blackboards" ON blackboards
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Usage stats policies
CREATE POLICY "Users can view own usage stats" ON usage_stats
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blackboards_updated_at BEFORE UPDATE ON blackboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'ユーザー'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blackboard-images', 'blackboard-images', true);

-- Storage policies
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blackboard-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blackboard-images');

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blackboard-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'blackboard-images' AND auth.uid()::text = (storage.foldername(name))[1]);
