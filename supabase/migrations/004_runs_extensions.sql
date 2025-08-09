-- Add new columns to the runs table
ALTER TABLE runs
ADD COLUMN replicate_prediction_id TEXT UNIQUE,
ADD COLUMN output_payload JSONB,
ADD COLUMN error_message TEXT,
ADD COLUMN completed_at TIMESTAMPTZ;

-- Add an index for the new replicate_prediction_id column
CREATE INDEX idx_runs_replicate_prediction_id ON runs(replicate_prediction_id);

-- Drop existing policies to redefine them. This is safer than ALTER.
DROP POLICY IF EXISTS "Users can view runs for their deployments" ON runs;
DROP POLICY IF EXISTS "Users can create runs for their deployments" ON runs;

-- Recreate policies for authenticated user access on the runs table
CREATE POLICY "Users can view their own runs" ON runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deployments
      WHERE deployments.id = runs.deployment_id
      AND deployments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own runs" ON runs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deployments
      WHERE deployments.id = runs.deployment_id
      AND deployments.user_id = auth.uid()
    )
  );

-- Add a new policy for updating runs
CREATE POLICY "Users can update their own runs" ON runs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deployments
      WHERE deployments.id = runs.deployment_id
      AND deployments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deployments
      WHERE deployments.id = runs.deployment_id
      AND deployments.user_id = auth.uid()
    )
  );