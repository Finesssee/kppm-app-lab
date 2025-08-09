'use client'

import { usePredictionStream } from '@/hooks/use-prediction-stream'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Terminal } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface StreamingOutputProps {
  predictionId: string | null
  className?: string
}

export function StreamingOutput({
  predictionId,
  className,
}: StreamingOutputProps) {
  const { output, status, error, isRunning } =
    usePredictionStream(predictionId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom as new output arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [output])

  const renderStatusBadge = () => {
    if (!status) return null

    let variant: 'secondary' | 'default' | 'destructive' | 'outline' =
      'secondary'
    let text: string;

    switch (status) {
      case 'starting':
        variant = 'secondary'
        text = 'Starting...'
        break
      case 'processing':
        variant = 'secondary'
        text = 'Processing...'
        break
      case 'succeeded':
        variant = 'default'
        text = 'Succeeded'
        break
      case 'failed':
      case 'canceled':
        variant = 'destructive'
        text = status === 'failed' ? 'Failed' : 'Canceled'
        break
      default:
        text = status
        break
    }

    return (
      <Badge variant={variant} className="capitalize">
        {text}
      </Badge>
    )
  }

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Output</h3>
        <div className="flex items-center space-x-2">
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
          {renderStatusBadge()}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto rounded-md border bg-muted p-4 font-mono text-sm transition-colors"
      >
        {output.length > 0 ? (
          <pre className="whitespace-pre-wrap break-words">{output.join('')}</pre>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {isRunning ? 'Waiting for output...' : 'No output generated yet.'}
          </div>
        )}
      </div>
    </div>
  )
}