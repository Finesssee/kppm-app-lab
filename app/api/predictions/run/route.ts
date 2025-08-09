import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { auth } from '@/lib/auth/auth'
import { runPrediction } from '@/lib/services/predictionService'
import { errorResponse } from '@/lib/api-error'

const RunPredictionSchema = z.object({
  deploymentId: z.string().uuid('Invalid deployment ID.'),
  input: z.record(z.any()),
})

export const POST = rateLimitMiddleware(async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = RunPredictionSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error)
    }

    const { deploymentId, input } = parsed.data
    const prediction = await runPrediction(deploymentId, input, session.user.id)

    return NextResponse.json(prediction)
  } catch (error) {
    return errorResponse(error)
  }
})