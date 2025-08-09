// Based on the response from Replicate's prediction API
export interface ReplicatePrediction {
  id: string;
  version: string;
  urls: {
    get: string;
    cancel: string;
  };
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  source: 'api' | 'web';
  status:
    | 'starting'
    | 'processing'
    | 'succeeded'
    | 'failed'
    | 'canceled';
  input: Record<string, unknown>;
  output: any;
  error: any;
  logs: string | null;
  metrics: {
    predict_time?: number;
  };
}