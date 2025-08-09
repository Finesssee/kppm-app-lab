import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { generateCorrelationId, errorResponse } from '@/lib/api-error'
import { z } from 'zod'

// Query schema for GET requests
const ListAppsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(['recent', 'popular', 'trending', 'alphabetical']).default('recent'),
})

async function listAppsHandler(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = ListAppsSchema.parse({
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      tags: searchParams.get('tags') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      sort: searchParams.get('sort') || undefined,
    })

    // Build query
    let query = supabaseServer
      .from('apps')
      .select('id, name, slug, description, category, tags, cover_image, author, fork_count, run_count, rating_avg, featured, created_at', { count: 'exact' })

    // Apply filters
    if (params.query) {
      // Use full-text search
      query = query.textSearch('name', params.query, { type: 'websearch' })
    }

    if (params.category) {
      query = query.eq('category', params.category)
    }

    if (params.tags) {
      // Filter by tags (JSONB contains)
      const tagList = params.tags.split(',').map(t => t.trim())
      query = query.contains('tags', tagList)
    }

    // Apply sorting
    switch (params.sort) {
      case 'popular':
        query = query.order('run_count', { ascending: false })
        break
      case 'trending':
        // For trending, we'd ideally use the trending_apps_last7d view
        // For now, sort by run_count as a proxy
        query = query.order('run_count', { ascending: false })
        break
      case 'alphabetical':
        query = query.order('name', { ascending: true })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(params.offset, params.offset + params.limit - 1)

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

export const GET = rateLimitMiddleware(listAppsHandler)