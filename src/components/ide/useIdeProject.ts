import { useEffect, useState } from 'react'

export interface IdeFileIndexItem {
  id: string
  path: string
  url: string
  storage: 'supabase' | 's3'
  version: number
  size_bytes: number | null
  content_type: string | null
  checksum_sha256: string | null
}

export interface IdeFileContent {
  content: string
  metadata: IdeFileIndexItem & {
    content_type: string
  }
}

export function useIdeProject(projectId?: string) {
  const [files, setFiles] = useState<IdeFileIndexItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setFiles([])
      return
    }
    let cancelled = false
    const handler = (e: Event) => {
      const pid = (e as CustomEvent<{ projectId: string }>).detail?.projectId
      if (!pid || pid !== projectId) return
      load()
    }
    window.addEventListener('ide-reload-index', handler as EventListener)
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/ide/projects/${projectId}/files`)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        if (!cancelled) setFiles(json.files || [])
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true; window.removeEventListener('ide-reload-index', handler as EventListener) }
  }, [projectId])

  return { files, loading, error }
}

/**
 * Fetch file content from the API
 */
export async function fetchFileContent(projectId: string, filePath: string): Promise<IdeFileContent> {
  const encodedPath = encodeURIComponent(filePath)
  const res = await fetch(`/api/ide/projects/${projectId}/files/${encodedPath}`)
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to fetch file: ${res.status} ${errorText}`)
  }
  return res.json()
}

export function buildExplorerTree(files: IdeFileIndexItem[]) {
  type Node = { name: string; type: 'folder'|'file'; children?: Record<string, Node>; file?: IdeFileIndexItem }
  const root: Record<string, Node> = {}
  for (const f of files) {
    const parts = f.path.split('/').filter(Boolean)
    let cur = root
    parts.forEach((segment, idx) => {
      const isFile = idx === parts.length - 1
      if (!cur[segment]) {
        cur[segment] = isFile ? { name: segment, type: 'file', file: f } : { name: segment, type: 'folder', children: {} }
      }
      if (!isFile) {
        cur = cur[segment].children as Record<string, Node>
      }
    })
  }
  return root
}


