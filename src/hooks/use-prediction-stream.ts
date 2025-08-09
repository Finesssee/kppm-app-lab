'use client'

import { useState, useEffect } from 'react'
import { PredictionStreamEvent, ReplicateStatus } from '@/types/prediction'

export interface StreamState {
  output: string[]
  status: ReplicateStatus | null
  error: string | null
  isRunning: boolean
}

const initialState: StreamState = {
  output: [],
  status: null,
  error: null,
  isRunning: false,
}

/**
 * A hook to consume a prediction stream from the backend SSE endpoint.
 *
 * @param predictionId The ID of the prediction to stream.
 * @param options Hook options, e.g., `enabled` to conditionally start the stream.
 * @returns The current state of the stream, including output, status, and errors.
 */
export function usePredictionStream(
  predictionId: string | null,
  options: { enabled?: boolean } = { enabled: true }
): StreamState {
  const [state, setState] = useState<StreamState>(initialState)

  useEffect(() => {
    if (!predictionId || !options.enabled) {
      setState(initialState)
      return
    }

    setState({ ...initialState, isRunning: true, status: 'starting' })

    const eventSource = new EventSource(`/api/predictions/${predictionId}/stream`)

    const handleEvent = (event: MessageEvent) => {
      try {
        const eventData = event.data
        switch (event.type) {
          case 'output':
            setState(prevState => ({
              ...prevState,
              output: [...prevState.output, eventData],
              status: 'processing',
            }))
            break

          case 'log':
            // You can handle logs here if needed, e.g., for debugging
            // console.log('Stream log:', eventData)
            break

          case 'error': {
            const errorPayload = JSON.parse(eventData)
            setState(prevState => ({
              ...prevState,
              error: errorPayload.detail || 'An unknown error occurred.',
              status: 'failed',
              isRunning: false,
            }))
            eventSource.close()
            break
          }

          case 'done': {
            const finalPrediction = JSON.parse(eventData)
            setState(prevState => ({
              ...prevState,
              status: finalPrediction.status,
              isRunning: false,
            }))
            eventSource.close()
            break
          }
        }
      } catch (e) {
        console.error('Failed to parse stream event:', e)
        setState(prevState => ({
          ...prevState,
          error: 'Failed to process stream event.',
          status: 'failed',
          isRunning: false,
        }))
        eventSource.close()
      }
    }

    eventSource.addEventListener('output', handleEvent)
    eventSource.addEventListener('log', handleEvent)
    eventSource.addEventListener('error', handleEvent)
    eventSource.addEventListener('done', handleEvent)

    eventSource.onerror = err => {
      console.error('EventSource connection error:', err)
      setState(prevState => ({
        ...prevState,
        error: 'Failed to connect to the prediction stream.',
        status: 'failed',
        isRunning: false,
      }))
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [predictionId, options.enabled])

  return state
}