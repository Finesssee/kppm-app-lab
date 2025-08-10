import { useState } from 'react'
import { createWorkspaceFromZip } from '../lib/workspaces'
import { useNavigate } from 'react-router-dom'

const Index: React.FC = () => {
  const [zipUrl, setZipUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleClone = async () => {
    setLoading(true)
    try {
      const ws = await createWorkspaceFromZip(zipUrl, title)
      navigate(`/studio?w=${ws.id}`)
    } catch (e) {
      alert(`Clone failed: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border rounded-lg p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Clone AI App</h1>
        <p className="text-sm text-muted-foreground">Paste a zip URL of the source code (e.g., GitHub repository archive URL) to create a customizable workspace.</p>
        <input className="w-full border rounded px-3 py-2" placeholder="https://github.com/user/repo/archive/refs/heads/main.zip" value={zipUrl} onChange={(e)=>setZipUrl(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Optional title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <button disabled={!zipUrl || loading} onClick={handleClone} className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50">{loading? 'Cloning...' : 'Clone & Customize'}</button>
      </div>
    </div>
  );
};

export default Index;
