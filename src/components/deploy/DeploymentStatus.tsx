'use client'

import { useDeployment } from '@/lib/queries/deployments'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface DeploymentStatusProps {
  deploymentId: string
}

export function DeploymentStatus({ deploymentId }: DeploymentStatusProps) {
  const { data: deployment, isLoading, error } = useDeployment(deploymentId, {
    refetchInterval: 5000,
  })

  if (isLoading) {
    return <Skeleton className="h-6 w-24 rounded-full" />
  }

  if (error || !deployment) {
    return <Badge variant="destructive">Unknown</Badge>
  }

  const status = deployment.replicate_status?.status

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'succeeded':
        return 'default' // Using default for success (often green)
      case 'starting':
      case 'processing':
        return 'secondary'
      case 'failed':
      case 'canceled':
        return 'destructive'
      default:
        return 'outline'
    }
  }
  
  const getStatusText = () => {
    switch (status) {
      case 'succeeded': return 'Ready'
      case 'starting': return 'Starting'
      case 'processing': return 'Building'
      case 'failed': return 'Failed'
      case 'canceled': return 'Canceled'
      default: return 'Unknown'
    }
  }

  return (
    <Badge variant={getStatusVariant()} className="capitalize">
      {getStatusText()}
    </Badge>
  )
}