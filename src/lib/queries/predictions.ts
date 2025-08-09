import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReplicatePrediction } from '@/types/prediction'

// This type should ideally be in `src/types/run.ts`, but defining here for now.
export interface Run {
  id: string // prediction id
  deployment_id: string
  replicate_prediction_id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  input_payload: Record<string, any>
  output_payload: any
  error_message: string | null
  created_at: string
  completed_at: string | null
}


// Query Keys
export const predictionQueryKeys = {
  all: ['predictions'] as const,
  details: () => [...predictionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...predictionQueryKeys.details(), id] as const,
  runs: (deploymentId: string) => [...predictionQueryKeys.all, 'runs', deploymentId] as const,
}

// API Functions
async function fetchPrediction(id: string): Promise<ReplicatePrediction> {
  const response = await fetch(`/api/predictions/${id}`)
  if (!response.ok) throw new Error('Failed to fetch prediction')
  return response.json()
}

// This assumes a GET /api/runs?deploymentId=... endpoint exists.
async function fetchRunsForDeployment(deploymentId: string): Promise<Run[]> {
  const response = await fetch(`/api/runs?deploymentId=${deploymentId}`)
  if (!response.ok) throw new Error('Failed to fetch runs for deployment')
  return response.json()
}

async function runPrediction(params: {
  deploymentId: string
  input: Record<string, any>
}): Promise<ReplicatePrediction> {
  const response = await fetch('/api/predictions/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to run prediction')
  }
  return response.json()
}

async function cancelPrediction(id: string): Promise<ReplicatePrediction> {
  const response = await fetch(`/api/predictions/${id}/cancel`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to cancel prediction')
  return response.json()
}


// React Query Hooks
export function usePrediction(id: string | null | undefined, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: predictionQueryKeys.detail(id!),
    queryFn: () => fetchPrediction(id!),
    enabled: !!id && (options?.enabled ?? true),
    refetchInterval: (query) => {
      const data = query.state.data as ReplicatePrediction | undefined
      if (data?.status === 'succeeded' || data?.status === 'failed' || data?.status === 'canceled') {
        return false // stop polling
      }
      return options?.refetchInterval ?? 2000 // poll every 2 seconds
    },
  })
}

export function useRunsForDeployment(deploymentId: string | null | undefined) {
  return useQuery({
    queryKey: predictionQueryKeys.runs(deploymentId!),
    queryFn: () => fetchRunsForDeployment(deploymentId!),
    enabled: !!deploymentId,
    refetchInterval: 5000,
  })
}

export function useRunPredictionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: runPrediction,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: predictionQueryKeys.runs(variables.deploymentId) })
    },
  })
}

export function useCancelPredictionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelPrediction,
    onSuccess: (data) => {
      queryClient.setQueryData(predictionQueryKeys.detail(data.id), data)
    },
  })
}