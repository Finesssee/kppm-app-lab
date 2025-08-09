import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'
import { SearchAppsSchema } from '@/lib/schemas'
import { errorResponse, generateCorrelationId } from '@/lib/api-error'
import { rateLimitMiddleware } from '@/lib/rate-limit'

async function searchHandler(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    // Parse and validate request body
    const body = await request.json()
    const params = SearchAppsSchema.parse(body)
    
    // Build query
    let query = supabaseServer
      .from('apps')
      .select('id, name, slug, description, category, tags, cover_image, author, fork_count, run_count, rating_avg, featured, created_at', { count: 'exact' })
    
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
    }, {
      headers: {
        'X-Correlation-Id': correlationId,
      },
    })
    
  } catch (error) {
    return errorResponse(error, correlationId)
  }
}

export const POST = rateLimitMiddleware(searchHandler)