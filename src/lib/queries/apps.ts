import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface AppListResponse {
  apps: any[]
  total: number
  limit: number
  offset: number
}

export interface AppSearchParams {
  query?: string
  category?: string
  tags?: string
  limit?: number
  offset?: number
  sort?: 'recent' | 'popular' | 'trending' | 'alphabetical'
}

export interface CategoryResponse {
  categories: Array<{
    id: string
    name: string
    count: number
    icon: string
  }>
  total: number
}

// Query keys
export const appQueryKeys = {
  all: ['apps'] as const,
  lists: () => [...appQueryKeys.all, 'list'] as const,
  list: (params: AppSearchParams) => [...appQueryKeys.lists(), params] as const,
  details: () => [...appQueryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...appQueryKeys.details(), slug] as const,
  stats: (slug: string) => [...appQueryKeys.all, 'stats', slug] as const,
  categories: () => ['categories'] as const,
  trending: () => [...appQueryKeys.all, 'trending'] as const,
}

// API functions
async function fetchApps(params: AppSearchParams): Promise<AppListResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.query) searchParams.set('query', params.query)
  if (params.category) searchParams.set('category', params.category)
  if (params.tags) searchParams.set('tags', params.tags)
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.offset) searchParams.set('offset', params.offset.toString())
  if (params.sort) searchParams.set('sort', params.sort)
  
  const response = await fetch(`/api/apps?${searchParams}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch apps')
  }
  
  return response.json()
}

async function fetchAppDetail(slug: string) {
  const response = await fetch(`/api/apps/${slug}`)
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('App not found')
    }
    throw new Error('Failed to fetch app details')
  }
  
  return response.json()
}

async function fetchAppStats(slug: string) {
  const response = await fetch(`/api/apps/${slug}/stats`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch app stats')
  }
  
  return response.json()
}

async function fetchCategories(): Promise<CategoryResponse> {
  const response = await fetch('/api/apps/categories')
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  
  return response.json()
}

async function searchApps(params: AppSearchParams): Promise<AppListResponse> {
  const response = await fetch('/api/apps/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  
  if (!response.ok) {
    throw new Error('Failed to search apps')
  }
  
  return response.json()
}

// React Query hooks
export function useApps(params: AppSearchParams = {}) {
  return useQuery({
    queryKey: appQueryKeys.list(params),
    queryFn: () => fetchApps(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useAppDetail(slug: string) {
  return useQuery({
    queryKey: appQueryKeys.detail(slug),
    queryFn: () => fetchAppDetail(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useAppStats(slug: string) {
  return useQuery({
    queryKey: appQueryKeys.stats(slug),
    queryFn: () => fetchAppStats(slug),
    enabled: !!slug,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

export function useCategories() {
  return useQuery({
    queryKey: appQueryKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useSearchApps() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: searchApps,
    onSuccess: (data, variables) => {
      // Cache the search results
      queryClient.setQueryData(appQueryKeys.list(variables), data)
    },
  })
}