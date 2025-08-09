import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { auth } from '@/lib/auth/auth'
import {
  describeDeployment,
  removeDeployment,
} from '@/lib/services/deploymentService'
import { errorResponse } from '@/lib/api-error'

interface RouteContext {
  params: {
    deploymentId: string
  }
}

export const GET = rateLimitMiddleware(
  async (req: NextRequest, { params }: RouteContext) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { deploymentId } = params
      const deployment = await describeDeployment(deploymentId, session.user.id)

      return NextResponse.json(deployment)
    } catch (error) {
      return errorResponse(error)
    }
  }
)

export const DELETE = rateLimitMiddleware(
  async (req: NextRequest, { params }: RouteContext) => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { deploymentId } = params
      await removeDeployment(deploymentId, session.user.id)

      return new NextResponse(null, { status: 202 }) // 202 Accepted
    } catch (error) {
      return errorResponse(error)
    }
  }
)