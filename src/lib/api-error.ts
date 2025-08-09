import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiError } from './schemas'

export function generateCorrelationId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function normalizeApiError(
  error: unknown,
  correlationId?: string
): ApiError {
  // Zod validation errors
  if (error instanceof ZodError) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors,
      status: 400,
      correlationId,
    }
  }
  
  // API errors
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError
    return {
      ...apiError,
      correlationId: correlationId || apiError.correlationId,
    }
  }
  
  // Generic errors
  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
      status: 500,
      correlationId,
    }
  }
  
  // Unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error,
    status: 500,
    correlationId,
  }
}

export function errorResponse(
  error: unknown,
  correlationId?: string
): NextResponse {
  const apiError = normalizeApiError(error, correlationId)
  
  console.error(`[${apiError.correlationId}] API Error:`, {
    code: apiError.code,
    message: apiError.message,
    details: apiError.details,
  })
  
  return NextResponse.json(apiError, { status: apiError.status })
}

export function checkRequiredEnvVars(): ApiError | null {
  const missing: string[] = []
  
  if (!process.env.REPLICATE_API_TOKEN) {
    missing.push('REPLICATE_API_TOKEN')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY')
  }
  
  if (missing.length > 0) {
    return {
      code: 'SETUP_ERROR',
      message: 'Missing required environment variables',
      details: {
        missing,
        help: 'Please copy .env.local.example to .env.local and fill in the required values',
      },
      status: 500,
    }
  }
  
  return null
}