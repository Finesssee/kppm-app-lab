-- Phase 1: Core Library enhancements
-- Add stats columns and search indexes

-- Add statistics columns to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS fork_count INT DEFAULT 0;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS run_count INT DEFAULT 0;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2) DEFAULT 0;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS author TEXT;

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apps_search 
  ON apps USING GIST (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));

-- Create GIN index for JSONB tags search
CREATE INDEX IF NOT EXISTS idx_apps_tags ON apps USING GIN(tags);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_apps_featured ON apps(featured) WHERE featured = true;

-- Create trigger to auto-increment run_count when runs are created
CREATE OR REPLACE FUNCTION increment_run_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE apps 
  SET run_count = run_count + 1 
  WHERE id = (
    SELECT app_id 
    FROM deployments 
    WHERE id = NEW.deployment_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_run_count ON runs;
CREATE TRIGGER trg_increment_run_count
AFTER INSERT ON runs
FOR EACH ROW EXECUTE FUNCTION increment_run_count();

-- Create view for trending apps (last 7 days)
CREATE OR REPLACE VIEW trending_apps_last7d AS
SELECT 
  a.id,
  a.name,
  a.slug,
  a.description,
  a.category,
  a.tags,
  a.cover_image,
  a.fork_count,
  a.run_count,
  a.rating_avg,
  a.featured,
  a.author,
  COUNT(r.id) as recent_runs
FROM apps a
LEFT JOIN deployments d ON d.app_id = a.id
LEFT JOIN runs r ON r.deployment_id = d.id 
  AND r.created_at >= NOW() - INTERVAL '7 days'
GROUP BY a.id
ORDER BY recent_runs DESC, a.run_count DESC;

-- Create view for app categories with counts
CREATE OR REPLACE VIEW app_categories AS
SELECT 
  category,
  COUNT(*) as app_count
FROM apps
GROUP BY category
ORDER BY app_count DESC;