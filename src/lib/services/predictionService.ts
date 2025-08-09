import 'server-only'
import {
  createPrediction as createReplicatePrediction,
  getPrediction as getReplicatePrediction,
  cancelPrediction as cancelReplicatePrediction,
} from '@/lib/replicate'
import { getSupabaseUserClient } from '@/lib/db'
import { DatabaseError } from '@/lib/api-error'
import { ReplicatePrediction } from '@/types/prediction'

export async function runPrediction(
  deploymentId: string,
  input: Record<string, unknown>,
  userId: string,
  opts?: { stream?: boolean }
): Promise<ReplicatePrediction> {
  const supabase = await getSupabaseUserClient()

  // 1. Verify user has access to this deployment and get its details
  const { data: deployment, error: selectError } = await supabase
    .from('deployments')
    .select('id, replicate_owner, deployment_name')
    .eq('id', deploymentId)
    .eq('user_id', userId)
    .single()

  if (selectError || !deployment) {
    throw new DatabaseError(
      selectError,
      'Deployment not found or user does not have permission.'
    )
  }

  // 2. Create the prediction on Replicate
  const prediction = await createReplicatePrediction({
    owner: deployment.replicate_owner,
    name: deployment.deployment_name,
    input,
    preferWaitSeconds: opts?.stream ? undefined : 10, // Don't wait if streaming
    stream: opts?.stream,
  })

  // 3. Create a run record in our database
  const { error: insertError } = await supabase.from('runs').insert({
    deployment_id: deployment.id,
    replicate_prediction_id: prediction.id,
    input_payload: input,
    status: prediction.status,
  })

  if (insertError) {
    // This is not ideal, as we've already started a prediction.
    // Log this for now. A more robust system might use a queue.
    console.error(
      `Failed to create run record for prediction ${prediction.id}:`,
      insertError
    )
  }

  return prediction
}

export async function getPredictionStatus(
  predictionId: string,
  userId: string
): Promise<ReplicatePrediction> {
  const supabase = await getSupabaseUserClient()

  // 1. Get prediction from Replicate
  const prediction = await getReplicatePrediction(predictionId)

  // 2. Verify user has access by checking the associated deployment
  const { data: run, error: runSelectError } = await supabase
    .from('runs')
    .select('id, deployment_id, deployments(user_id)')
    .eq('replicate_prediction_id', predictionId)
    .single()

  if (runSelectError || !run) {
    throw new DatabaseError(runSelectError, 'Run not found in our database.')
  }

  const deployment = run.deployments as { user_id: string } | null
  if (deployment?.user_id !== userId) {
    throw new Error('User does not have permission to view this prediction.')
  }

  // 3. Update our database record if the prediction is in a terminal state
  if (
    prediction.status === 'succeeded' ||
    prediction.status === 'failed' ||
    prediction.status === 'canceled'
  ) {
    const { error: updateError } = await supabase
      .from('runs')
      .update({
        status: prediction.status,
        output_payload: prediction.output,
        error_message: prediction.error
          ? JSON.stringify(prediction.error)
          : null,
        completed_at: prediction.completed_at,
        duration_ms: prediction.metrics?.predict_time
          ? prediction.metrics.predict_time * 1000
          : null,
      })
      .eq('id', run.id)

    if (updateError) {
      console.error(
        `Failed to update run record ${run.id} for prediction ${prediction.id}:`,
        updateError
      )
    }
  }

  return prediction
}

export async function abortPrediction(
  predictionId: string,
  userId: string
): Promise<ReplicatePrediction> {
  const supabase = await getSupabaseUserClient()

  // 1. Verify user has access (similar to getPredictionStatus)
  const { data: run, error: runSelectError } = await supabase
    .from('runs')
    .select('id, deployment_id, deployments(user_id)')
    .eq('replicate_prediction_id', predictionId)
    .single()

  if (runSelectError || !run) {
    throw new DatabaseError(runSelectError, 'Run not found in our database.')
  }

  const deployment = run.deployments as { user_id: string } | null
  if (deployment?.user_id !== userId) {
    throw new Error('User does not have permission to cancel this prediction.')
  }

  // 2. Send cancel request to Replicate
  const prediction = await cancelReplicatePrediction(predictionId)

  // 3. Update our database record
  const { error: updateError } = await supabase
    .from('runs')
    .update({
      status: 'canceled',
      completed_at: new Date().toISOString(),
    })
    .eq('id', run.id)

  if (updateError) {
    console.error(
      `Failed to update run record ${run.id} to canceled:`,
      updateError
    )
  }

  return prediction
}