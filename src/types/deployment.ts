import { ReplicateDeployment } from "@/lib/replicate";

// Corresponds to the 'deployments' table in the database
export interface DatabaseDeployment {
  id: string; // uuid
  app_id: string; // uuid
  user_id: string; // uuid
  replicate_owner: string;
  deployment_name: string;
  hardware: string;
  min_instances: number;
  max_instances: number;
  created_at: string; // timestamptz
}

// A combined type that includes both database and Replicate API data
export interface DeploymentCombined extends DatabaseDeployment {
  replicate_status: ReplicateDeployment;
}

// Expose the ReplicateDeployment type from here as well for consistency
export type { ReplicateDeployment };