'use client'

import { useRunsForDeployment } from '@/lib/queries/predictions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface RunHistoryProps {
  deploymentId: string
}

export function RunHistory({ deploymentId }: RunHistoryProps) {
  const { data: runs, isLoading, error } = useRunsForDeployment(deploymentId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive text-sm">Failed to load run history.</p>
  }

  if (!runs || runs.length === 0) {
    return <p className="text-muted-foreground text-sm">No runs yet.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Run ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <Badge variant={
                    run.status === 'succeeded' ? 'default' :
                    run.status === 'failed' || run.status === 'canceled' ? 'destructive' : 'secondary'
                  } className="capitalize">{run.status}</Badge>
                </TableCell>
                <TableCell>{new Date(run.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-xs">{run.id.slice(0, 12)}...</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}