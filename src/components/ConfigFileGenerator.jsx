import { useState } from 'react'
import { generateConfigFiles, saveConfigFiles, getConfigFiles } from '../services/configGeneratorService'
import { notify } from '../services/toast'

const FORMAT_COLORS = {
  json: '#f59e0b', yaml: '#22c55e', ini: '#6366f1',
  toml: '#0ea5e9', env: '#a855f7', xml: '#ef4444',
}

function ConfigFileGenerator({ idea, components }) {
  const [result, setResult] = useState(getConfigFiles(idea))
  const [loading, setLoading] = useState(false)
  const [activeFile, setActiveFile] = useState(0)
  const [copiedIdx, setCopiedIdx] = useState(null)

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateConfigFiles(idea, components)
      setResult(data)
      saveConfigFiles(idea, data)
      setActiveFile(0)
      notify.success((data.files?.length || 0) + ' config files generated!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleCopy(content, idx) {
    navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    setTimeout(function() { setCopiedIdx(null) }, 2000)
    notify.success('Config copied!')
  }

  function handleDownload(file) {
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = file.filename; link.click()
    URL.revokeObjectURL(url)
    notify.success(file.filename + ' downloaded!')
  }

  function handleDownloadAll() {
    if (!result?.files) return
    result.files.forEach(function(file) { handleDownload(file) })
  }

  const files = result?.files || []
  const activeF = files[activeFile]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate JSON, YAML, .env and other config files for your prototype</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Generating...' : 'Generate Configs'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Generating config files...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex items-center gap-2">
            <p className="text-white font-bold">{files.length} Config Files</p>
            <button onClick={handleDownloadAll}
              className="ml-auto px-4 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
              Download All
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {files.map(function(file, i) {
              const ext = file.format || file.filename.split('.').pop() || 'txt'
              const color = FORMAT_COLORS[ext.toLowerCase()] || '#6366f1'
              return (
                <button key={i} onClick={function() { setActiveFile(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (activeFile === i ? 'text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}
                  style={activeFile === i ? { backgroundColor: color } : {}}>
                  {file.filename}
                </button>
              )
            })}
          </div>

          {activeF && (
            <div className="space-y-2">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                <p className="text-white font-bold text-sm">{activeF.filename}</p>
                <p className="text-slate-400 text-xs">{activeF.description}</p>
              </div>

              <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-slate-500 text-xs">{activeF.filename}</span>
                  <div className="ml-auto flex gap-2">
                    <button onClick={function() { handleCopy(activeF.content, activeFile) }}
                      className="text-xs text-slate-500 hover:text-white">{copiedIdx === activeFile ? 'Copied!' : 'Copy'}</button>
                    <button onClick={function() { handleDownload(activeF) }}
                      className="text-xs text-slate-500 hover:text-white">Download</button>
                  </div>
                </div>
                <pre className="px-4 py-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64">
                  {activeF.content}
                </pre>
              </div>
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">⚙️</div>
          <p className="text-white font-semibold mb-1">Config File Generator</p>
          <p className="text-slate-500 text-sm">Generate JSON, YAML, .env and INI config files for your prototype</p>
        </div>
      )}
    </div>
  )
}

export default ConfigFileGenerator
