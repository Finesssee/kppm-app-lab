import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { auth } from '@/lib/auth/auth'
import { listDeployments } from '@/lib/services/deploymentService'
import { errorResponse } from '@/lib/api-error'

export const GET = rateLimitMiddleware(async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deployments = await listDeployments(session.user.id)
    return NextResponse.json(deployments)
  } catch (error) {
    return errorResponse(error)
  }
})