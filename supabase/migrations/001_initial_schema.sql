-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create apps table
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  repo_url TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID
);

-- Create app_versions table
CREATE TABLE app_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  replicate_model TEXT NOT NULL,
  version_id TEXT NOT NULL,
  schema JSONB NOT NULL,
  default_hardware TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deployments table
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  replicate_owner TEXT NOT NULL,
  deployment_name TEXT NOT NULL,
  hardware TEXT NOT NULL,
  min_instances INT NOT NULL DEFAULT 0,
  max_instances INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, user_id)
);

-- Create runs table
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  input_payload JSONB NOT NULL,
  status TEXT NOT NULL,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_apps_category ON apps(category);
CREATE INDEX idx_apps_created_at ON apps(created_at DESC);
CREATE INDEX idx_app_versions_app_id ON app_versions(app_id);
CREATE INDEX idx_deployments_app_id ON deployments(app_id);
CREATE INDEX idx_deployments_user_id ON deployments(user_id);
CREATE INDEX idx_runs_deployment_id_created_at ON runs(deployment_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Apps are viewable by everyone" ON apps
  FOR SELECT USING (true);

CREATE POLICY "App versions are viewable by everyone" ON app_versions
  FOR SELECT USING (true);

-- Create policies for authenticated user access
CREATE POLICY "Users can view their own deployments" ON deployments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deployments" ON deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deployments" ON deployments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deployments" ON deployments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view runs for their deployments" ON runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deployments
      WHERE deployments.id = runs.deployment_id
      AND deployments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create runs for their deployments" ON runs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deployments
      WHERE deployments.id = runs.deployment_id
      AND deployments.user_id = auth.uid()
    )
  );