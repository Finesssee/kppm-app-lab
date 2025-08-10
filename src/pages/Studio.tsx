import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getWorkspaceFile, listWorkspaceFiles, saveWorkspaceFile } from '../lib/workspaces'

export default function Studio() {
  const [params] = useSearchParams()
  const workspaceId = params.get('w') ?? ''
  const [files, setFiles] = useState<{ path: string; size: number }[]>([])
  const [activePath, setActivePath] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!workspaceId) return
    listWorkspaceFiles(workspaceId).then(setFiles).catch(console.error)
  }, [workspaceId])

  const openFile = async (p: string) => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const res = await getWorkspaceFile(workspaceId, p)
      setActivePath(res.path)
      setContent(res.content)
    } finally {
      setLoading(false)
    }
  }

  const saveFile = async () => {
    if (!workspaceId || !activePath) return
    setLoading(true)
    try {
      await saveWorkspaceFile(workspaceId, activePath, content)
    } finally {
      setLoading(false)
    }
  }

  if (!workspaceId) return <div className="p-6">Missing workspace id</div>

  return (
    <div className="grid grid-cols-12 h-[calc(100vh-64px)]">
      <div className="col-span-3 border-r overflow-y-auto p-3">
        <div className="text-sm font-medium mb-2">Files</div>
        <ul className="space-y-1">
          {files.map(f => (
            <li key={f.path}>
              <button className={`text-left w-full rounded px-2 py-1 hover:bg-secondary ${activePath===f.path?'bg-secondary':''}`} onClick={() => openFile(f.path)}>
                {f.path}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-9 flex flex-col">
        <div className="border-b p-2 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{activePath || 'Select a file to edit'}</div>
          <button disabled={!activePath || loading} onClick={saveFile} className="px-3 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50">Save</button>
        </div>
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} className="flex-1 p-3 font-mono text-sm outline-none" placeholder="" />
      </div>
    </div>
  )
}


