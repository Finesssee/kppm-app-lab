import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SearchAppsSchema } from '@/lib/schemas'
import { errorResponse, generateCorrelationId, checkRequiredEnvVars } from '@/lib/api-error'
import { rateLimitMiddleware } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function searchHandler(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    // Check env vars
    const envError = checkRequiredEnvVars()
    if (envError) {
      return errorResponse(envError, correlationId)
    }
    
    // Parse and validate request body
    const body = await request.json()
    const params = SearchAppsSchema.parse(body)
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Build query
    let query = supabase
      .from('apps')
      .select('*', { count: 'exact' })
    
    // Apply filters
    if (params.query) {
      query = query.or(
        `name.ilike.%${params.query}%,description.ilike.%${params.query}%`
      )
    }
    
    if (params.category) {
      query = query.eq('category', params.category)
    }
    
    if (params.tags && params.tags.length > 0) {
      query = query.contains('tags', params.tags)
    }
    
    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(params.offset, params.offset + params.limit - 1)
    
    // Execute query
    const { data, error, count } = await query
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      apps: data || [],
      total: count || 0,
      limit: params.limit,
      offset: params.offset,
      correlationId,
    })
    
  } catch (error) {
    return errorResponse(error, correlationId)
  }
}

export const POST = rateLimitMiddleware(searchHandler)