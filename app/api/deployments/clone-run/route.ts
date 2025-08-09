import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { auth } from '@/lib/auth/auth'
import { ensureDeployment } from '@/lib/services/deploymentService'
import { runPrediction } from '@/lib/services/predictionService'
import { errorResponse } from '@/lib/api-error'
import { getSupabaseUserClient } from '@/lib/db'

const CloneRunSchema = z.object({
  slug: z.string().min(1, 'Slug is required.'),
  input: z.record(z.any()),
})

export const POST = rateLimitMiddleware(async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = CloneRunSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error)
    }

    const { slug, input } = parsed.data
    const userId = session.user.id

    // 1. Get app_id from slug
    const supabase = await getSupabaseUserClient()
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', slug)
      .single()

    if (appError || !app) {
      throw {
        code: 'NOT_FOUND',
        message: 'App not found',
        details: { slug, error: appError },
        status: 404,
      }
    }

    // 2. Ensure deployment exists for the user and app
    const deployment = await ensureDeployment({ appId: app.id, userId })

    // 3. Run a prediction on the deployment
    const prediction = await runPrediction(deployment.id, input, userId)

    return NextResponse.json(prediction)
  } catch (error) {
    return errorResponse(error)
  }
})