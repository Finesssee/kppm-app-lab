import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
}

/**
 * Server-side Supabase client with service role key
 * Use this for admin operations that bypass RLS
 */
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Helper to get app statistics
 */
export async function getAppStats(appId: string) {
  const { data, error } = await supabaseServer
    .from('apps')
    .select('fork_count, run_count, rating_avg')
    .eq('id', appId)
    .single()

  if (error) {
    console.error('Failed to fetch app stats:', error)
    return null
  }

  return {
    forkCount: data.fork_count || 0,
    runCount: data.run_count || 0,
    ratingAvg: data.rating_avg || 0,
  }
}

/**
 * Helper to increment fork count
 */
export async function incrementForkCount(appId: string) {
  const { error } = await supabaseServer.rpc('increment', {
    table_name: 'apps',
    column_name: 'fork_count',
    row_id: appId,
  })

  if (error) {
    console.error('Failed to increment fork count:', error)
    return false
  }

  return true
}

/**
 * Helper to get trending apps
 */
export async function getTrendingApps(limit = 10) {
  const { data, error } = await supabaseServer
    .from('trending_apps_last7d')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Failed to fetch trending apps:', error)
    return []
  }

  return data || []
}

/**
 * Helper to get app categories with counts
 */
export async function getCategories() {
  const { data, error } = await supabaseServer
    .from('app_categories')
    .select('*')

  if (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }

  return data || []
}