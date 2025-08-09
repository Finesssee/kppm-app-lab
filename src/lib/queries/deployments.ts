import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DatabaseDeployment, DeploymentCombined } from '@/types/deployment'
import { ReplicatePrediction } from '@/types/prediction'

// Query Keys
export const deploymentQueryKeys = {
  all: ['deployments'] as const,
  lists: () => [...deploymentQueryKeys.all, 'list'] as const,
  list: () => [...deploymentQueryKeys.lists()] as const,
  details: () => [...deploymentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...deploymentQueryKeys.details(), id] as const,
}

// API Functions
async function fetchDeployments(): Promise<DatabaseDeployment[]> {
  const response = await fetch('/api/deployments')
  if (!response.ok) throw new Error('Failed to fetch deployments')
  return response.json()
}

async function fetchDeployment(id: string): Promise<DeploymentCombined> {
  const response = await fetch(`/api/deployments/${id}`)
  if (!response.ok) throw new Error('Failed to fetch deployment details')
  return response.json()
}

async function cloneAndRun(params: {
  slug: string
  input: Record<string, any>
  stream?: boolean
}): Promise<ReplicatePrediction> {
  const response = await fetch('/api/deployments/clone-run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to clone and run')
  }
  return response.json()
}

async function deleteDeployment(id: string): Promise<void> {
  const response = await fetch(`/api/deployments/${id}`, { method: 'DELETE' })
  if (response.status !== 202) throw new Error('Failed to delete deployment')
}

// React Query Hooks
export function useDeployments() {
  return useQuery({
    queryKey: deploymentQueryKeys.list(),
    queryFn: fetchDeployments,
  })
}

export function useDeployment(id: string | null | undefined, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: deploymentQueryKeys.detail(id!),
    queryFn: () => fetchDeployment(id!),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  })
}

export function useCloneRunMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ReplicatePrediction,
    Error,
    { slug: string; input: Record<string, any>; stream?: boolean }
  >({
    mutationFn: cloneAndRun,
    onSuccess: () => {
      // After a run, deployments and predictions data are stale.
      queryClient.invalidateQueries({ queryKey: deploymentQueryKeys.all })
    },
  })
}

export function useDeleteDeploymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDeployment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deploymentQueryKeys.all })
    },
  })
}