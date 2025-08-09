'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer'
import { DynamicForm } from '@/components/forms/DynamicForm'
import { useCloneRunMutation, useDeployments, deploymentQueryKeys } from '@/lib/queries/deployments'
import { DeploymentStatus } from './DeploymentStatus'
import { RunHistory } from './RunHistory'
import { AppManifest } from '@/types/app'
import { toast } from 'sonner'
import { ReplicatePrediction } from '@/types/prediction'
import { predictionQueryKeys } from '@/lib/queries/predictions'

interface DeployButtonProps {
  app: AppManifest
}

export function DeployButton({ app }: DeployButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [latestPrediction, setLatestPrediction] = useState<ReplicatePrediction | null>(null)
  
  const queryClient = useQueryClient()
  const { data: deployments } = useDeployments()

  const cloneRunMutation = useCloneRunMutation()

  const userDeployment = deployments?.find(d => d.app_id === app.id)

  const handleFormSubmit = async (formData: Record<string, any>) => {
    cloneRunMutation.mutate(
      { slug: app.slug, input: formData },
      {
        onSuccess: (data) => {
          toast.success('Prediction started!')
          setLatestPrediction(data)
          // Invalidate queries to refetch deployment list and run history
          queryClient.invalidateQueries({ queryKey: deploymentQueryKeys.all })
          if (userDeployment) {
            queryClient.invalidateQueries({ queryKey: predictionQueryKeys.runs(userDeployment.id) })
          }
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to start prediction.')
        },
      }
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button>
          <Rocket className="mr-2" />
          Deploy & Run
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="container mx-auto py-4 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Run {app.name}</DrawerTitle>
            <DrawerDescription>
              Configure the inputs and run your own instance of this app.
              {userDeployment && <div className="mt-2 flex items-center gap-2">Your deployment status: <DeploymentStatus deploymentId={userDeployment.id} /></div>}
            </DrawerDescription>
          </DrawerHeader>

          <div className="grid md:grid-cols-2 gap-8 px-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Inputs</h3>
              <DynamicForm
                schema={app.form_schema}
                onSubmit={handleFormSubmit}
                isLoading={cloneRunMutation.isPending}
              />
            </div>
            <div className="space-y-6">
                {latestPrediction && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Latest Result</h3>
                    <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(latestPrediction, null, 2)}
                    </pre>
                  </div>
                )}
                {userDeployment && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">History</h3>
                    <RunHistory deploymentId={userDeployment.id} />
                  </div>
                )}
            </div>
          </div>
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}