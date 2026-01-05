"use client"

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Settings, FileCode, Coffee, Wrench, Hash, Circle, Code, Globe, Palette, Database, Terminal, Apple, Moon, Edit, Ban, Lock, File } from 'lucide-react'
import MonacoEditor from 'react-monaco-editor'
import * as monaco from 'monaco-editor'
import { useTheme } from 'next-themes'
import { Course, Lesson } from '@/types/index'
import { useIdeProject, fetchFileContent, type IdeFileIndexItem } from '@/components/ide/useIdeProject'
// Monaco basic languages (static imports to ensure availability and typings via our d.ts)
import * as MonacoPython from 'monaco-editor/esm/vs/basic-languages/python/python'
import * as MonacoMarkdown from 'monaco-editor/esm/vs/basic-languages/markdown/markdown'
import * as MonacoShell from 'monaco-editor/esm/vs/basic-languages/shell/shell'

interface IDEEditorProps {
  course?: Course
  currentLesson?: Lesson
}

interface FileWithContent {
  id: string
  name: string
  language: string
  content: string
  path?: string
}

// Comprehensive language detection based on filename and extension
const getLanguageFromFileName = (fileName: string): string => {
  if (!fileName) return 'plaintext'
  const lower = fileName.toLowerCase()

  // Special filename-only matches (no extension)
  const specialByName: { [name: string]: string } = {
    'dockerfile': 'dockerfile',
    'makefile': 'makefile',
    'readme': 'markdown',
    'license': 'plaintext',
    '.gitignore': 'ignore',
    '.gitattributes': 'gitattributes',
    '.editorconfig': 'editorconfig',
    '.npmrc': 'properties',
    '.yarnrc': 'properties',
    '.bashrc': 'shell',
    '.zshrc': 'shell',
    '.profile': 'shell',
  }
  const baseName = lower.replace(/^.*\//, '') // strip any path
  if (!baseName.includes('.')) {
    const special = specialByName[baseName]
    if (special) return special
  }

  // Known exact filename matches (config files)
  const specialExact: { [name: string]: string } = {
    'package.json': 'json',
    'package-lock.json': 'json',
    'pnpm-lock.yaml': 'yaml',
    'yarn.lock': 'plaintext',
    'tsconfig.json': 'json',
    'jsconfig.json': 'json',
    '.eslintrc': 'json',
    '.eslintrc.json': 'json',
    '.eslintrc.yaml': 'yaml',
    '.eslintrc.yml': 'yaml',
    '.prettierrc': 'json',
    '.prettierrc.json': 'json',
    '.prettierrc.yaml': 'yaml',
    '.prettierrc.yml': 'yaml',
    '.prettierignore': 'ignore',
    'babel.config.js': 'javascript',
    'babel.config.cjs': 'javascript',
    'vite.config.ts': 'typescript',
    'vite.config.js': 'javascript',
    'next.config.js': 'javascript',
    'next.config.mjs': 'javascript',
    'tailwind.config.js': 'javascript',
    'tailwind.config.ts': 'typescript',
    'postcss.config.js': 'javascript',
    'docker-compose.yml': 'yaml',
  }
  if (specialExact[baseName]) return specialExact[baseName]

  // Handle multi-part extensions first (e.g., .d.ts)
  if (lower.endsWith('.d.ts')) return 'typescript'
  if (lower.endsWith('.tsx')) return 'typescript'
  if (lower.endsWith('.jsx')) return 'javascript'

  // Last extension after final dot
  const ext = baseName.split('.').pop() || ''

  const byExt: { [ext: string]: string } = {
    // Web
    'js': 'javascript', 'mjs': 'javascript', 'cjs': 'javascript', 'jsx': 'javascript',
    'ts': 'typescript', 'tsx': 'typescript',
    'html': 'html', 'htm': 'html',
    'css': 'css', 'scss': 'scss', 'sass': 'scss', 'less': 'less',
    'vue': 'html', 'svelte': 'html', 'astro': 'html', 'pug': 'pug', 'hbs': 'handlebars',

    // Backend & general languages
    'py': 'python', 'rb': 'ruby', 'php': 'php', 'java': 'java',
    'kt': 'kotlin', 'kts': 'kotlin',
    'swift': 'swift', 'go': 'go', 'rs': 'rust',
    'c': 'c', 'h': 'c', 'hpp': 'cpp', 'hh': 'cpp', 'cc': 'cpp', 'cpp': 'cpp', 'cxx': 'cpp',
    'm': 'objective-c', 'mm': 'objective-c',
    'cs': 'csharp', 'vb': 'vb', 'fs': 'fsharp', 'fsi': 'fsharp', 'fsx': 'fsharp',
    'r': 'r', 'lua': 'lua', 'dart': 'dart',

    // Data / config
    'json': 'json', 'jsonc': 'json', 'ndjson': 'json',
    'yaml': 'yaml', 'yml': 'yaml',
    'xml': 'xml', 'svg': 'xml',
    'toml': 'toml', 'ini': 'ini', 'properties': 'properties', 'env': 'properties',

    // Shell / scripts
    'sh': 'shell', 'bash': 'shell', 'zsh': 'shell', 'ksh': 'shell', 'fish': 'shell',
    'ps1': 'powershell', 'psm1': 'powershell', 'psd1': 'powershell',
    'bat': 'bat', 'cmd': 'bat',

    // Database / schemas
    'sql': 'sql', 'prisma': 'json', 'graphql': 'graphql', 'gql': 'graphql', 'proto': 'protobuf',

    // Docs
    'md': 'markdown', 'mdx': 'markdown', 'rst': 'markdown', 'txt': 'plaintext',

    // Build / tooling
    'makefile': 'makefile', 'mk': 'makefile',
    'dockerfile': 'dockerfile', 'docker': 'dockerfile',

    // Other
    'vim': 'vim', 'vimrc': 'vim', 'diff': 'diff', 'patch': 'diff',
    'log': 'plaintext'
  }

  return byExt[ext] || 'plaintext'
}

export function IDEEditor({ course, currentLesson }: IDEEditorProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [editorError, setEditorError] = useState(false)
  const { theme } = useTheme()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null)
  
  // Get project ID from lesson or course
  const projectId = (currentLesson as unknown as { ide_project_id?: string })?.ide_project_id
  const { files: ideFiles, loading: filesLoading } = useIdeProject(projectId)
  
  // Map IDE files to editor files with content
  const [filesWithContent, setFilesWithContent] = useState<Map<string, FileWithContent>>(new Map())
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set())
  
  // Initialize sample files when project loads
  useEffect(() => {
    if (projectId && ideFiles.length === 0 && !filesLoading) {
      // Initialize sample files if project has no files yet
      fetch(`/api/ide/projects/${projectId}/files/init-samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false }),
      }).catch(err => {
        console.warn('Failed to initialize sample files:', err)
      })
    }
  }, [projectId, ideFiles.length, filesLoading])
  
  // Load file content when files are available
  useEffect(() => {
    if (!projectId || ideFiles.length === 0) return
    
    const loadFileContents = async () => {
      let firstFileOpened = false
      for (const file of ideFiles) {
        if (filesWithContent.has(file.path)) continue // Already loaded
        
        setLoadingFiles(prev => new Set(prev).add(file.path))
        try {
          const fileContent = await fetchFileContent(projectId, file.path)
          const language = getLanguageFromFileName(file.path)
          const fileName = file.path.split('/').pop() || file.path
          
          setFilesWithContent(prev => {
            const newMap = new Map(prev)
            newMap.set(file.path, {
              id: file.id,
              name: fileName,
              language,
              content: fileContent.content,
              path: file.path,
            })
            return newMap
          })
          
          // Auto-open first file if no tabs are open
          if (!firstFileOpened && openTabs.length === 0) {
            setOpenTabs([file.path])
            setActiveTab(file.path)
            firstFileOpened = true
          }
        } catch (err) {
          console.error(`Failed to load file ${file.path}:`, err)
        } finally {
          setLoadingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(file.path)
            return newSet
          })
        }
      }
    }
    
    loadFileContents()
  }, [projectId, ideFiles.length]) // Only depend on length to avoid infinite loops
  
  const files = useMemo(() => Array.from(filesWithContent.values()), [filesWithContent])
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for sidebar open-file events and open the matching file by name.
  // Fetch file content from API if not already loaded.
  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent<{ name: string; path?: string; content?: string }>).detail
      if (!detail?.name || !projectId) return
      
      const filePath = detail.path || detail.name
      let file = filesWithContent.get(filePath)
      
      // If file not loaded, try to find it in IDE files and load it
      if (!file) {
        const ideFile = ideFiles.find(f => f.path === filePath || f.path.endsWith(`/${filePath}`))
        if (ideFile) {
          setLoadingFiles(prev => new Set(prev).add(ideFile.path))
          try {
            const fileContent = await fetchFileContent(projectId, ideFile.path)
            const language = getLanguageFromFileName(ideFile.path)
            file = {
              id: ideFile.id,
              name: ideFile.path.split('/').pop() || ideFile.path,
              language,
              content: fileContent.content,
              path: ideFile.path,
            }
            setFilesWithContent(prev => {
              const newMap = new Map(prev)
              newMap.set(ideFile.path, file!)
              return newMap
            })
          } catch (err) {
            console.error(`Failed to load file ${ideFile.path}:`, err)
            return
          } finally {
            setLoadingFiles(prev => {
              const newSet = new Set(prev)
              newSet.delete(ideFile.path)
              return newSet
            })
          }
        } else {
          // File doesn't exist in IDE, create placeholder (for new files)
          const language = getLanguageFromFileName(detail.name)
          const placeholderByLang: { [k: string]: string } = {
            javascript: `// ${detail.name}\nconsole.log('New file');\n`,
            typescript: `// ${detail.name}\nexport {};\n`,
            python: `# ${detail.name}\nprint('New file')\n`,
            json: `{}\n`,
            markdown: `# ${detail.name}\n`,
            html: `<!doctype html>\n<html>\n  <head><meta charset="utf-8"><title>${detail.name}</title></head>\n  <body></body>\n</html>\n`,
            css: `/* ${detail.name} */\n`,
            plaintext: ''
          }
          const content = detail.content ?? (placeholderByLang[language] ?? '')
          const id = `dyn-${filePath}`
          file = { id, name: detail.name, language, content, path: filePath }
          setFilesWithContent(prev => {
            const newMap = new Map(prev)
            newMap.set(filePath, file!)
            return newMap
          })
        }
      }
      
      if (file) {
        const fileId = file.path || file.id
        setOpenTabs(prev => (prev.includes(fileId) ? prev : [...prev, fileId]))
        setActiveTab(fileId)
      }
    }
    window.addEventListener('ide-open-file', handler as EventListener)
    return () => window.removeEventListener('ide-open-file', handler as EventListener)
  }, [projectId, filesWithContent, ideFiles])

  // Handle window resize to refresh minimap
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getFileById = (id: string) => {
    // Try to find by path first, then by id
    return files.find(file => (file.path || file.id) === id) || files.find(file => file.id === id)
  }
  
  const closeTab = (id: string) => {
    const newTabs = openTabs.filter(tabId => tabId !== id)
    setOpenTabs(newTabs)
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1])
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const iconMap: { [key: string]: React.ComponentType<{ size?: number }> } = {
      'md': FileText,
      'json': Settings,
      'js': FileCode,
      'jsx': FileCode,
      'ts': FileCode,
      'tsx': FileCode,
      'py': Code,
      'java': Coffee,
      'cpp': Wrench,
      'c': Wrench,
      'cs': Hash,
      'php': Code,
      'rb': Circle,
      'go': Code,
      'rs': Code,
      'swift': Apple,
      'kt': Circle,
      'html': Globe,
      'css': Palette,
      'scss': Palette,
      'sass': Palette,
      'less': Palette,
      'xml': FileText,
      'yaml': Settings,
      'yml': Settings,
      'sql': Database,
      'sh': Terminal,
      'bash': Terminal,
      'dockerfile': Code,
      'docker': Code,
      'r': Code,
      'm': Apple,
      'mm': Apple,
      'pl': Code,
      'lua': Moon,
      'vim': Edit,
      'gitignore': Ban,
      'gitattributes': FileText,
      'editorconfig': Settings,
      'env': Lock,
      'ini': Settings,
      'cfg': Settings,
      'conf': Settings,
      'toml': Settings,
      'lock': Lock,
      'log': File,
      'txt': FileText,
      'text': FileText
    }
    const IconComponent = iconMap[extension || ''] || FileText
    return <IconComponent size={14} />
  }

  const currentFile = getFileById(activeTab)
  
  // Get the correct language for the current file
  const currentLanguage = currentFile ? getLanguageFromFileName(currentFile.name) : 'plaintext'
  
  // Get the appropriate theme based on the current theme
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light'

  // Force Monaco to re-apply language on tab/language change
  useEffect(() => {
    try {
      if (editorRef.current && currentLanguage) {
        const model = editorRef.current.getModel?.()
        if (model) {
          monaco.editor.setModelLanguage(model, currentLanguage)
        }
      }
    } catch (e) {
      console.warn('Failed to set model language:', e)
    }
  }, [activeTab, currentLanguage])

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--vscode-editor-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--vscode-foreground)] mx-auto mb-4"></div>
          <p className="text-[var(--vscode-foreground)]">Loading Editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[var(--vscode-editor-background)]">
      {/* Tab Bar */}
      <div className="flex items-center bg-[var(--vscode-tab-activeBackground)] border-b border-[var(--vscode-tab-border)]">
        <div className="flex overflow-x-auto">
          {openTabs.map(tabId => {
            const file = getFileById(tabId)
            if (!file) return null
            
            return (
              <motion.div
                key={tabId}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-[var(--vscode-tab-border)] min-w-0 ${
                  activeTab === tabId 
                    ? 'bg-[var(--vscode-tab-activeBackground)] text-[var(--vscode-tab-activeForeground)]' 
                    : 'bg-[var(--vscode-tab-inactiveBackground)] text-[var(--vscode-tab-inactiveForeground)] hover:bg-[var(--vscode-tab-hoverBackground)]'
                }`}
                onClick={() => setActiveTab(tabId)}
                whileHover={{ backgroundColor: 'var(--vscode-tab-hoverBackground)' }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm">{getFileIcon(file.name)}</span>
                <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tabId)
                  }}
                  className="ml-2 hover:bg-[var(--vscode-tab-hoverBackground)] rounded p-1"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          {currentFile && (
            <motion.div
              key={activeTab}
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--vscode-editor-background)] border-b border-[var(--vscode-panel-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getFileIcon(currentFile.name)}</span>
                  <span className="text-sm font-medium">{currentFile.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--vscode-descriptionForeground)]">
                  <span>{currentFile.content.split('\n').length} lines</span>
                  <span>{currentFile.language}</span>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={async () => {
                      try {
                        if (!projectId) {
                          console.warn('No ide_project_id on lesson; cannot upload')
                          return
                        }
                        
                        // Get current content from editor
                        const editor = editorRef.current
                        const content = editor?.getValue() || currentFile?.content || ''
                        const filePath = currentFile?.path || currentFile?.name || 'untitled.txt'
                        
                        // Determine content type from file extension
                        const ext = filePath.split('.').pop()?.toLowerCase()
                        const contentTypeMap: { [key: string]: string } = {
                          'js': 'application/javascript',
                          'jsx': 'application/javascript',
                          'ts': 'application/typescript',
                          'tsx': 'application/typescript',
                          'py': 'text/x-python',
                          'md': 'text/markdown',
                          'json': 'application/json',
                          'html': 'text/html',
                          'css': 'text/css',
                        }
                        const contentType = contentTypeMap[ext || ''] || 'text/plain'
                        
                        const base64 = typeof btoa !== 'undefined' 
                          ? btoa(unescape(encodeURIComponent(content))) 
                          : Buffer.from(content, 'utf-8').toString('base64')
                        
                        const res = await fetch(`/api/ide/projects/${projectId}/files/upload`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            path: filePath, 
                            contentBase64: base64, 
                            contentType,
                            storage: 's3' // Prefer S3 if available
                          })
                        })
                        if (!res.ok) throw new Error(await res.text())
                        
                        // Update local file content
                        setFilesWithContent(prev => {
                          const newMap = new Map(prev)
                          const existing = newMap.get(filePath)
                          if (existing) {
                            newMap.set(filePath, { ...existing, content })
                          }
                          return newMap
                        })
                        
                        console.log('Saved file to backend index')
                        // Trigger a re-index event for sidebar
                        window.dispatchEvent(new CustomEvent('ide-reload-index', { detail: { projectId } }))
                      } catch (e) {
                        console.error('Save failed', e)
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div className="h-full">
                {editorError ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm">
                      <strong>Editor Fallback:</strong> Monaco Editor failed to load. Using basic text editor.
                    </div>
                    <textarea
                      className="flex-1 w-full p-4 font-mono text-sm bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] border-0 resize-none focus:outline-none"
                      value={currentFile.content}
                      onChange={(e) => {
                        console.log('Content changed:', e.target.value)
                      }}
                      placeholder="Start typing your code here..."
                    />
                  </div>
                ) : (
                  <MonacoEditor
                  ref={editorRef}
                  height="100%"
                  language={currentLanguage}
                  value={currentFile.content}
                  theme={editorTheme}
                  editorWillMount={(m) => {
                    try {
                      const { language: pyLang, conf: pyConf } = MonacoPython as unknown as { language: unknown; conf: unknown }
                      if (!m.languages.getEncodedLanguageId('python')) {
                        m.languages.register({ id: 'python' })
                      }
                      m.languages.setMonarchTokensProvider('python', pyLang as never)
                      m.languages.setLanguageConfiguration('python', pyConf as never)

                      const { language: mdLang, conf: mdConf } = MonacoMarkdown as unknown as { language: unknown; conf: unknown }
                      if (!m.languages.getEncodedLanguageId('markdown')) {
                        m.languages.register({ id: 'markdown' })
                      }
                      m.languages.setMonarchTokensProvider('markdown', mdLang as never)
                      m.languages.setLanguageConfiguration('markdown', mdConf as never)

                      const { language: shLang, conf: shConf } = MonacoShell as unknown as { language: unknown; conf: unknown }
                      if (!m.languages.getEncodedLanguageId('shell')) {
                        m.languages.register({ id: 'shell' })
                      }
                      m.languages.setMonarchTokensProvider('shell', shLang as never)
                      m.languages.setLanguageConfiguration('shell', shConf as never)

                      console.log('Monaco languages registered:', m.languages.getLanguages().map(l => l.id))
                    } catch (e) {
                      console.warn('Failed to register languages for Monaco:', e)
                    }
                  }}
                  options={{
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    automaticLayout: true,
                    minimap: { 
                      enabled: true,
                      maxColumn: 120,
                      renderCharacters: true,
                      showSlider: 'always',
                      side: 'right',
                      size: 'proportional'
                    },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineHeight: 22,
                    fontFamily: "'JetBrains Mono', 'Monaco', 'Consolas', monospace",
                    fontLigatures: true,
                    wordWrap: 'on',
                    renderWhitespace: 'selection',
                    bracketPairColorization: { enabled: true },
                    guides: {
                      bracketPairs: true,
                      indentation: true
                    },
                    suggest: {
                      showKeywords: true,
                      showSnippets: true,
                      showFunctions: true,
                      showVariables: true,
                      showClasses: true
                    },
                    quickSuggestions: {
                      other: true,
                      comments: true,
                      strings: true
                    },
                    parameterHints: {
                      enabled: true
                    },
                    hover: {
                      enabled: true
                    },
                    contextmenu: true,
                    mouseWheelZoom: true,
                    smoothScrolling: true,
                    cursorBlinking: 'blink',
                    renderLineHighlight: 'all',
                    occurrencesHighlight: 'multiFile',
                    selectionHighlight: true,
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'always',
                    matchBrackets: 'always'
                  }}
                  onChange={(value) => {
                    // Update file content in state when user edits
                    if (currentFile && projectId) {
                      const filePath = currentFile.path || currentFile.id
                      setFilesWithContent(prev => {
                        const newMap = new Map(prev)
                        const existing = newMap.get(filePath)
                        if (existing) {
                          newMap.set(filePath, { ...existing, content: value || '' })
                        }
                        return newMap
                      })
                    }
                  }}
                  editorDidMount={(editor) => {
                    // Handle editor mount
                    editorRef.current = editor
                    
                    // Configure editor properly
                    try {
                      // Set up editor configuration
                      editor.updateOptions({
                        minimap: { 
                          enabled: true,
                          maxColumn: 120,
                          renderCharacters: true,
                          showSlider: 'always',
                          side: 'right',
                          size: 'proportional'
                        }
                      })
                      
                      // Force minimap refresh
                      setTimeout(() => {
                        editor.layout()
                      }, 100)
                      
                      // Add error handling
                      editor.onDidChangeModel(() => {
                        console.log('Model changed')
                        // Ensure minimap is visible after model change
                        setTimeout(() => {
                          editor.layout()
                        }, 50)
                      })
                      
                    } catch (error) {
                      console.warn('Editor configuration error:', error)
                      setEditorError(true)
                    }
                  }}
                />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}