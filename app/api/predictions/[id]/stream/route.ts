import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getPrediction, streamPrediction } from '@/lib/replicate'

interface RouteContext {
  params: {
    id: string // predictionId
  }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id: predictionId } = params

  try {
    const prediction = await getPrediction(predictionId)
    // Note: Ownership is assumed to be handled by RLS in the `getPrediction` service.

    const streamUrl = prediction.urls?.stream
    if (!streamUrl) {
      return new Response('Stream URL not available for this prediction.', {
        status: 404,
      })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          for await (const event of streamPrediction(streamUrl)) {
            // SSE format requires `event:` and `data:` fields, followed by two newlines.
            controller.enqueue(encoder.encode(`event: ${event.type}\n`))
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            )
          }
          // After the loop, the Replicate stream is done. Send a final 'done' event.
          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({ status: 'done' })}\n\n`
            )
          )
        } catch (error) {
          console.error(`SSE stream failed for prediction ${predictionId}:`, error)
          const errorEvent = {
            type: 'error',
            error: (error as Error).message,
          }
          controller.enqueue(encoder.encode(`event: error\n`))
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        // Disabling buffering for NGINX proxies, etc.
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error(`Failed to get prediction ${predictionId}`, error)
    return new Response('Failed to retrieve prediction details.', { status: 500 })
  }
}