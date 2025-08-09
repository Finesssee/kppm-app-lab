import 'server-only'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const REPLICATE_API_URL = 'https://api.replicate.com'

export const RetryableStatusCodes = [429] // Too Many Requests

// Types
export type DeploymentCreateReq = {
  name: string
  model: string
  version: string
  hardware: string
  min_instances: number
  max_instances: number
}

export type DeploymentRef = {
  owner: string
  name: string
}

export type DeploymentUpdateReq = Partial<
  Omit<DeploymentCreateReq, 'name' | 'model' | 'version'>
> & {
  version?: string
}

export type PredictionCreateReq = DeploymentRef & {
  input: Record<string, unknown>
  preferWaitSeconds?: number
  stream?: boolean
}

export type ReplicateError = {
  code: string
  message: string
  details?: unknown
  status: number
}

// Error normalization
function normalizeError(error: unknown, status = 500): ReplicateError {
  if (error instanceof Error) {
    return {
      code: 'REPLICATE_ERROR',
      message: error.message,
      status,
    }
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as any
    return {
      code: err.code || 'REPLICATE_ERROR',
      message: err.message || err.detail || 'Unknown error',
      details: err,
      status: err.status || status,
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
    status,
  }
}

// Retry with exponential backoff and jitter
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on client errors (4xx) except for specified ones
      if (
        error.status >= 400 &&
        error.status < 500 &&
        !RetryableStatusCodes.includes(error.status)
      ) {
        throw error
      }
      
      if (i < maxRetries) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// Base fetch with auth and timeout
async function replicateFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN is not configured')
  }
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout
  
  try {
    const response = await fetch(`${REPLICATE_API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    clearTimeout(timeout)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw {
        ...normalizeError(error, response.status),
        status: response.status,
      }
    }
    
    return response
  } catch (error: any) {
    clearTimeout(timeout)
    
    if (error.name === 'AbortError') {
      throw normalizeError(new Error('Request timeout after 30 seconds'), 408)
    }
    
    throw error
  }
}

// Create a deployment
export async function createDeployment(req: DeploymentCreateReq) {
  return withRetry(async () => {
    const response = await replicateFetch('/v1/deployments', {
      method: 'POST',
      body: JSON.stringify(req),
    })
    
    return response.json()
  })
}

// Get a deployment
export async function getDeployment(ref: DeploymentRef) {
  return withRetry(async () => {
    const response = await replicateFetch(
      `/v1/deployments/${ref.owner}/${ref.name}`
    )
    
    return response.json()
  })
}

// Update a deployment
export async function updateDeployment(
  ref: DeploymentRef,
  req: DeploymentUpdateReq
) {
  return withRetry(async () => {
    const response = await replicateFetch(
      `/v1/deployments/${ref.owner}/${ref.name}`,
      {
        method: 'PATCH',
        body: JSON.stringify(req),
      }
    )
    
    return response.json()
  })
}

// Delete a deployment
export async function deleteDeployment(ref: DeploymentRef) {
  return withRetry(async () => {
    const response = await replicateFetch(
      `/v1/deployments/${ref.owner}/${ref.name}`,
      {
        method: 'DELETE',
      }
    )

    // DELETE returns 204 No Content, so no body to parse
    if (response.status === 204) {
      return null
    }

    return response.json()
  })
}

// Create a prediction on a deployment
export async function createPrediction(req: PredictionCreateReq) {
  const { owner, name, input, preferWaitSeconds, stream } = req
  
  const headers: HeadersInit = {}
  if (preferWaitSeconds) {
    headers['Prefer'] = `wait=${preferWaitSeconds}`
  }
  
  return withRetry(async () => {
    const response = await replicateFetch(
      `/v1/deployments/${owner}/${name}/predictions`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          input,
          stream,
        }),
      }
    )
    
    return response.json()
  })
}

// Create a generic prediction (direct model)
export async function createGenericPrediction(
  model: string,
  input: Record<string, unknown>,
  options?: {
    version?: string
    preferWaitSeconds?: number
    stream?: boolean
  }
) {
  const headers: HeadersInit = {}
  if (options?.preferWaitSeconds) {
    headers['Prefer'] = `wait=${options.preferWaitSeconds}`
  }
  
  const body: any = {
    input,
    stream: options?.stream,
  }
  
  // If model includes owner/name, use model predictions endpoint
  if (model.includes('/')) {
    const [owner, name] = model.split('/')
    return withRetry(async () => {
      const response = await replicateFetch(
        `/v1/models/${owner}/${name}/predictions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        }
      )
      
      return response.json()
    })
  }
  
  // Otherwise use generic predictions endpoint
  body.model = model
  if (options?.version) {
    body.version = options.version
  }
  
  return withRetry(async () => {
    const response = await replicateFetch('/v1/predictions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    
    return response.json()
  })
}

// Search models
export async function searchModels(query: string) {
  return withRetry(async () => {
    const params = new URLSearchParams({ query })
    const response = await replicateFetch(`/v1/models?${params}`)
    
    return response.json()
  })
}

// Get a prediction status
export async function getPrediction(id: string) {
  return withRetry(async () => {
    const response = await replicateFetch(`/v1/predictions/${id}`)
    
    return response.json()
  })
}

// Cancel a prediction
export async function cancelPrediction(id: string) {
  return withRetry(async () => {
    const response = await replicateFetch(`/v1/predictions/${id}/cancel`, {
      method: 'POST',
    })
    
    return response.json()
  })
}

// Stream prediction output (for LLMs)
export async function* streamPrediction(streamUrl: string) {
  const response = await fetch(streamUrl, {
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Accept': 'text/event-stream',
    },
  })
  
  if (!response.ok) {
    throw normalizeError(
      new Error(`Stream failed: ${response.statusText}`),
      response.status
    )
  }
  
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }
  
  const decoder = new TextDecoder()
  let buffer = ''
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        
        try {
          const event = JSON.parse(data)
          yield event
        } catch (e) {
          console.error('Failed to parse SSE event:', e)
        }
      }
    }
  }
}