export type ReplicateStatus =
  | 'starting'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

// Based on the response from Replicate's prediction API
export interface ReplicatePrediction {
  id: string;
  version: string;
  urls: {
    get: string;
    cancel: string;
    stream?: string;
  };
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  source: 'api' | 'web';
  status: ReplicateStatus;
  input: Record<string, unknown>;
  output: any;
  error: any;
  logs: string | null;
  metrics: {
    predict_time?: number;
  };
}

// Events from Replicate's SSE stream
export type PredictionStreamEvent =
  | { type: 'log'; data: string }
  | { type: 'output'; data: string }
  | { type: 'error'; data: { error: string } }
  | { type: 'done'; data: ReplicatePrediction };