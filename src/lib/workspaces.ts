export function buildGithubZipUrl(owner: string, repo: string, ref: string = 'main'): string {
  return `https://github.com/${owner}/${repo}/archive/refs/heads/${ref}.zip`
}

export function buildHuggingFaceZipUrl(namespace: string, repo: string, ref: string = 'main'): string {
  // Hugging Face repos can be downloaded via code archive
  // Example: https://huggingface.co/spaces/org/space/resolve/main?download=1 (varies by resource)
  // For generic git repos hosted on HF (models/datasets/spaces) we can use raw git archive endpoints.
  // Fallback to GitHub-style if a mirror URL is provided by user.
  return `https://huggingface.co/${namespace}/${repo}/resolve/${ref}?download=1`
}
export interface Workspace {
  id: string
  title: string
}

export interface WorkspaceFileItem {
  path: string
  size: number
}

export async function createWorkspaceFromZip(sourceUrl: string, title?: string): Promise<Workspace> {
  const res = await fetch('/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_url: sourceUrl, title }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function listWorkspaceFiles(workspaceId: string): Promise<WorkspaceFileItem[]> {
  const res = await fetch(`/api/workspaces/${workspaceId}/files`)
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.files as WorkspaceFileItem[]
}

export async function getWorkspaceFile(workspaceId: string, path: string): Promise<{ path: string; content: string }> {
  const url = new URL(`/api/workspaces/${workspaceId}/file`, window.location.origin)
  url.searchParams.set('path', path)
  const res = await fetch(url)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function saveWorkspaceFile(workspaceId: string, path: string, content: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/file`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  })
  if (!res.ok) throw new Error(await res.text())
}


