import 'server-only'
import {
  createDeployment as createReplicateDeployment,
  deleteDeployment as deleteReplicateDeployment,
  getDeployment as getReplicateDeployment,
  ReplicateDeployment,
} from '@/lib/replicate'
import { getSupabaseUserClient } from '@/lib/db'
import { DatabaseError } from '@/lib/api-error'
import { DatabaseDeployment } from '@/types/deployment'
import { PostgrestError } from '@supabase/supabase-js'

export interface EnsureDeploymentParams {
  appId: string
  userId: string
}

export async function ensureDeployment({
  appId,
  userId,
}: EnsureDeploymentParams): Promise<DatabaseDeployment> {
  const supabase = await getSupabaseUserClient()

  // 1. Check for an existing deployment for this app and user
  const { data: existingDeployment, error: selectError } = await supabase
    .from('deployments')
    .select('*')
    .eq('app_id', appId)
    .eq('user_id', userId)
    .maybeSingle()

  if (selectError) {
    throw new DatabaseError(selectError)
  }

  if (existingDeployment) {
    return existingDeployment
  }

  // 2. If no deployment exists, create one.
  // First, get the latest version of the app to find the model details.
  const { data: appVersion, error: versionError } = await supabase
    .from('app_versions')
    .select('*')
    .eq('app_id', appId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (versionError || !appVersion) {
    throw new DatabaseError(
      versionError,
      'Failed to find a version for this app.'
    )
  }

  // 3. Create the deployment on Replicate
  const deploymentName = `kppm-${appId.substring(0, 8)}-${userId.substring(
    0,
    8
  )}`

  const replicateDeployment: ReplicateDeployment =
    await createReplicateDeployment({
      name: deploymentName,
      model: appVersion.replicate_model,
      version: appVersion.version_id,
      hardware: appVersion.default_hardware,
      min_instances: 0,
      max_instances: 1,
    })

  // 4. Store the deployment details in our database
  const { data: newDeployment, error: insertError } = await supabase
    .from('deployments')
    .insert({
      app_id: appId,
      user_id: userId,
      replicate_owner: replicateDeployment.owner,
      deployment_name: replicateDeployment.name,
      hardware: appVersion.default_hardware,
      min_instances: 0,
      max_instances: 1,
    })
    .select()
    .single()

  if (insertError) {
    // Handle race condition: another request created the deployment in the meantime.
    if ((insertError as PostgrestError).code === '23505') {
      // unique_violation
      const { data: raceDeployment, error: raceSelectError } = await supabase
        .from('deployments')
        .select('*')
        .eq('app_id', appId)
        .eq('user_id', userId)
        .single()

      if (raceSelectError || !raceDeployment) {
        throw new DatabaseError(
          raceSelectError,
          'Failed to resolve deployment creation race condition.'
        )
      }
      return raceDeployment
    }

    // If insert fails for other reasons, clean up the Replicate deployment.
    await deleteReplicateDeployment({
      owner: replicateDeployment.owner,
      name: replicateDeployment.name,
    })
    throw new DatabaseError(insertError)
  }

  return newDeployment
}

export async function removeDeployment(deploymentId: string, userId: string) {
  const supabase = await getSupabaseUserClient()

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

  // Delete from Replicate
  await deleteReplicateDeployment({
    owner: deployment.replicate_owner,
    name: deployment.deployment_name,
  })

  // Delete from our database (runs will be cascade-deleted)
  const { error: deleteError } = await supabase
    .from('deployments')
    .delete()
    .eq('id', deployment.id)

  if (deleteError) {
    throw new DatabaseError(deleteError)
  }

  return { success: true }
}

export async function listDeployments(
  userId: string
): Promise<DatabaseDeployment[]> {
  const supabase = await getSupabaseUserClient()
  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new DatabaseError(error)
  }
  return data || []
}

export async function describeDeployment(deploymentId: string, userId: string) {
  const supabase = await getSupabaseUserClient()

  const { data: dbDeployment, error: selectError } = await supabase
    .from('deployments')
    .select('*')
    .eq('id', deploymentId)
    .eq('user_id', userId)
    .single()

  if (selectError || !dbDeployment) {
    throw new DatabaseError(
      selectError,
      'Deployment not found or user does not have permission.'
    )
  }

  const replicateStatus = await getReplicateDeployment({
    owner: dbDeployment.replicate_owner,
    name: dbDeployment.deployment_name,
  })

  return {
    ...dbDeployment,
    replicate_status: replicateStatus,
  }
}