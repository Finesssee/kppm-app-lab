import { useState } from 'react'
import { createWorkspaceFromZip, buildGithubZipUrl, buildHuggingFaceZipUrl } from '../lib/workspaces'
import { useNavigate } from 'react-router-dom'

const Index: React.FC = () => {
  const [sourceType, setSourceType] = useState<'zip'|'github'|'huggingface'>('zip')
  const [zipUrl, setZipUrl] = useState('')
  const [ghOwner, setGhOwner] = useState('')
  const [ghRepo, setGhRepo] = useState('')
  const [ghRef, setGhRef] = useState('main')
  const [hfNamespace, setHfNamespace] = useState('')
  const [hfRepo, setHfRepo] = useState('')
  const [hfRef, setHfRef] = useState('main')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleClone = async () => {
    setLoading(true)
    try {
      let url = zipUrl
      if (sourceType === 'github') {
        url = buildGithubZipUrl(ghOwner, ghRepo, ghRef)
      } else if (sourceType === 'huggingface') {
        url = buildHuggingFaceZipUrl(hfNamespace, hfRepo, hfRef)
      }
      const ws = await createWorkspaceFromZip(url, title)
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
        <p className="text-sm text-muted-foreground">Choose a source and create a customizable workspace.</p>

        <div className="flex gap-2">
          <button onClick={()=>setSourceType('zip')} className={`px-3 py-1 rounded border ${sourceType==='zip'?'bg-secondary':''}`}>Zip URL</button>
          <button onClick={()=>setSourceType('github')} className={`px-3 py-1 rounded border ${sourceType==='github'?'bg-secondary':''}`}>GitHub</button>
          <button onClick={()=>setSourceType('huggingface')} className={`px-3 py-1 rounded border ${sourceType==='huggingface'?'bg-secondary':''}`}>Hugging Face</button>
        </div>

        {sourceType==='zip' && (
          <input className="w-full border rounded px-3 py-2" placeholder="https://github.com/user/repo/archive/refs/heads/main.zip" value={zipUrl} onChange={(e)=>setZipUrl(e.target.value)} />
        )}

        {sourceType==='github' && (
          <div className="grid grid-cols-3 gap-2">
            <input className="border rounded px-3 py-2" placeholder="owner" value={ghOwner} onChange={(e)=>setGhOwner(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="repo" value={ghRepo} onChange={(e)=>setGhRepo(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="ref (main)" value={ghRef} onChange={(e)=>setGhRef(e.target.value)} />
            <div className="col-span-3 text-xs text-muted-foreground">URL: {ghOwner && ghRepo ? buildGithubZipUrl(ghOwner, ghRepo, ghRef) : '—'}</div>
          </div>
        )}

        {sourceType==='huggingface' && (
          <div className="grid grid-cols-3 gap-2">
            <input className="border rounded px-3 py-2" placeholder="namespace" value={hfNamespace} onChange={(e)=>setHfNamespace(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="repo" value={hfRepo} onChange={(e)=>setHfRepo(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="ref (main)" value={hfRef} onChange={(e)=>setHfRef(e.target.value)} />
            <div className="col-span-3 text-xs text-muted-foreground">URL: {hfNamespace && hfRepo ? buildHuggingFaceZipUrl(hfNamespace, hfRepo, hfRef) : '—'}</div>
          </div>
        )}

        <input className="w-full border rounded px-3 py-2" placeholder="Optional title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <button disabled={(sourceType==='zip' && !zipUrl) || (sourceType==='github' && (!ghOwner||!ghRepo)) || (sourceType==='huggingface' && (!hfNamespace||!hfRepo)) || loading} onClick={handleClone} className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50">{loading? 'Cloning...' : 'Clone & Customize'}</button>
      </div>
    </div>
  );
};

export default Index;
