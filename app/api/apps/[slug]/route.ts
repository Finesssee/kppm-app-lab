import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { errorResponse, generateCorrelationId, checkRequiredEnvVars } from '@/lib/api-error'
import { rateLimitMiddleware } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function getAppHandler(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const correlationId = generateCorrelationId()
  
  try {
    // Check env vars
    const envError = checkRequiredEnvVars()
    if (envError) {
      return errorResponse(envError, correlationId)
    }
    
    const { slug } = params
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get app with latest version
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (appError || !app) {
      return errorResponse(
        {
          code: 'NOT_FOUND',
          message: `App with slug "${slug}" not found`,
          status: 404,
        },
        correlationId
      )
    }
    
    // Get latest app version
    const { data: version, error: versionError } = await supabase
      .from('app_versions')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (versionError || !version) {
      console.warn(`No version found for app ${app.id}`)
    }
    
    return NextResponse.json({
      ...app,
      version,
      correlationId,
    })
    
  } catch (error) {
    return errorResponse(error, correlationId)
  }
}

export const GET = rateLimitMiddleware(getAppHandler)