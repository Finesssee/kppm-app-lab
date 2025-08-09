import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { auth } from '@/lib/auth/auth'
import { getPredictionStatus } from '@/lib/services/predictionService'
import { errorResponse } from '@/lib/api-error'

interface RouteContext {
  params: {
    id: string // predictionId
  }
}

export const GET = rateLimitMiddleware(
  async (req: NextRequest, { params }: RouteContext) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { id: predictionId } = params
      const prediction = await getPredictionStatus(predictionId, session.user.id)

      return NextResponse.json(prediction)
    } catch (error) {
      return errorResponse(error)
    }
  }
)