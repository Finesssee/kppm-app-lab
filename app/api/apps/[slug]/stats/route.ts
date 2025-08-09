import { NextRequest, NextResponse } from 'next/server'
import { getAppStats } from '@/lib/db'
import { supabaseServer } from '@/lib/db'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { generateCorrelationId, errorResponse } from '@/lib/api-error'

async function getAppStatsHandler(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const correlationId = generateCorrelationId()
  
  try {
    const { slug } = params
    
    if (!slug) {
      return errorResponse(
        new Error('Slug is required'),
        correlationId,
        400
      )
    }
    
    // First get the app ID from slug
    const { data: app, error: appError } = await supabaseServer
      .from('apps')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (appError || !app) {
      return NextResponse.json(
        {
          error: {
            code: 'APP_NOT_FOUND',
            message: `App with slug "${slug}" not found`,
            status: 404,
            correlationId,
          },
        },
        { status: 404 }
      )
    }
    
    // Get stats for the app
    const stats = await getAppStats(app.id)
    
    if (!stats) {
      return NextResponse.json(
        {
          forkCount: 0,
          runCount: 0,
          ratingAvg: 0,
        },
        {
          headers: {
            'X-Correlation-Id': correlationId,
          },
        }
      )
    }
    
    return NextResponse.json(stats, {
      headers: {
        'X-Correlation-Id': correlationId,
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    })
    
  } catch (error) {
    return errorResponse(error, correlationId)
  }
}

export const GET = rateLimitMiddleware(getAppStatsHandler)