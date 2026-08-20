import { useState } from 'react'
import { generateDocumentation, saveDocumentation, getDocumentation, DOC_TYPES } from '../services/documentationService'
import { notify } from '../services/toast'

function DocumentationWriter({ idea, components }) {
  const [selectedType, setSelectedType] = useState('README')
  const [docs, setDocs] = useState({})
  const [loading, setLoading] = useState(false)

  const currentDoc = docs[selectedType] || getDocumentation(idea, selectedType)

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateDocumentation(idea, components, selectedType)
      const newDocs = Object.assign({}, docs, { [selectedType]: data })
      setDocs(newDocs)
      saveDocumentation(idea, selectedType, data)
      notify.success(selectedType + ' documentation generated!')
    } catch { notify.error('Generation failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleDownload() {
    if (!currentDoc) return
    const lines = ['# ' + currentDoc.title, '']
    ;(currentDoc.sections || []).forEach(function(section) {
      lines.push('## ' + section.heading)
      lines.push('')
      lines.push(section.content)
      if (section.code) {
        lines.push('')
        lines.push('```')
        lines.push(section.code)
        lines.push('```')
      }
      lines.push('')
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = selectedType.replace(/\s+/g, '_') + '.md'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Downloaded!')
  }

  function handleCopyAll() {
    if (!currentDoc) return
    const lines = ['# ' + currentDoc.title, '']
    ;(currentDoc.sections || []).forEach(function(section) {
      lines.push('## ' + section.heading)
      lines.push(section.content)
      if (section.code) { lines.push('```'); lines.push(section.code); lines.push('```') }
      lines.push('')
    })
    navigator.clipboard.writeText(lines.join('\n'))
    notify.success('Copied to clipboard!')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap">
        {DOC_TYPES.map(function(dt) {
          const hasDoc = !!docs[dt.value] || !!getDocumentation(idea, dt.value)
          return (
            <button key={dt.value} onClick={function() { setSelectedType(dt.value) }}
              className={'text-xs px-3 py-2 rounded-xl border transition relative ' + (
                selectedType === dt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
              )}>
              {dt.label}
              {hasDoc && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500" />}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50">
          {loading ? '📝 Writing...' : '📝 Generate ' + selectedType}
        </button>
        {currentDoc && (
          <>
            <button onClick={handleCopyAll} className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">📋</button>
            <button onClick={handleDownload} className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">⬇️</button>
          </>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Writing {selectedType} documentation...</p>
        </div>
      )}

      {currentDoc && !loading && (
        <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-500 text-xs ml-2">{selectedType}.md</span>
          </div>
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            <h2 className="text-indigo-400 font-black text-lg"># {currentDoc.title}</h2>
            {(currentDoc.sections || []).map(function(section, i) {
              return (
                <div key={i}>
                  <p className="text-yellow-400 font-bold text-sm">## {section.heading}</p>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">{section.content}</p>
                  {section.code && (
                    <pre className="mt-2 bg-[#13131f] border border-[#2e2e4e] rounded-lg p-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {section.code}
                    </pre>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!currentDoc && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-white font-semibold mb-1">AI Documentation Writer</p>
          <p className="text-slate-500 text-sm">Generate README, API docs, user manual and more</p>
        </div>
      )}
    </div>
  )
}

export default DocumentationWriter
