import { useState } from 'react'
import { findLibraries, saveLibraries, getLibraries } from '../services/libraryFinderService'
import { notify } from '../services/toast'

const DIFFICULTY_STYLES = {
  Beginner: 'text-green-400 bg-green-950 border-green-800',
  Intermediate: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Advanced: 'text-red-400 bg-red-950 border-red-800',
}

function LibraryCard({ lib, index }) {
  const [copied, setCopied] = useState(false)
  const diffStyle = DIFFICULTY_STYLES[lib.difficulty] || DIFFICULTY_STYLES.Beginner

  function handleCopy() {
    navigator.clipboard.writeText(lib.installCommand || lib.name)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Install command copied!')
  }

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-2">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-xs font-black text-indigo-400 shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-bold text-sm">{lib.name}</p>
            <span className={'text-xs px-1.5 py-0.5 rounded border ' + diffStyle}>{lib.difficulty}</span>
          </div>
          {lib.author && <p className="text-slate-500 text-xs">by {lib.author}</p>}
        </div>
      </div>

      <p className="text-slate-400 text-xs">{lib.purpose}</p>

      {lib.installCommand && (
        <div className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg p-2">
          <code className="text-green-400 text-xs font-mono flex-1 truncate">{lib.installCommand}</code>
          <button onClick={handleCopy}
            className="text-xs text-slate-500 hover:text-white transition shrink-0">
            {copied ? '✅' : '📋'}
          </button>
        </div>
      )}

      {lib.example && (
        <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-2">
          <p className="text-xs text-slate-500 mb-1">Example include:</p>
          <code className="text-indigo-400 text-xs font-mono">{lib.example}</code>
        </div>
      )}

      {lib.url && (
        <button
          onClick={function() { window.open(lib.url, '_blank') }}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition"
        >
          📦 View on Arduino Library Manager →
        </button>
      )}
    </div>
  )
}

function LibraryFinder({ idea, components }) {
  const [result, setResult] = useState(getLibraries(idea))
  const [loading, setLoading] = useState(false)

  async function handleFind() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await findLibraries(idea, components)
      setResult(data)
      saveLibraries(idea, data)
      notify.success('Found ' + (data.libraries?.length || 0) + ' libraries!')
    } catch {
      notify.error('Search failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyAll() {
    if (!result?.libraries) return
    const commands = result.libraries.map(function(l) { return l.installCommand || l.name }).join('\n')
    navigator.clipboard.writeText(commands)
    notify.success('All install commands copied!')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Find all Arduino libraries needed for your prototype</p>
        <button
          onClick={handleFind}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '📦 Finding...' : '📦 Find Libraries'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Finding libraries...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex items-center gap-2">
            <p className="text-white font-bold">{result.libraries?.length || 0} Libraries Found</p>
            <button onClick={handleCopyAll}
              className="ml-auto px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition">
              📋 Copy All Commands
            </button>
          </div>

          {result.installOrder && result.installOrder.length > 0 && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">📋 Install Order</p>
              <ol className="space-y-1">
                {result.installOrder.map(function(lib, i) {
                  return (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-indigo-600 font-bold">{i + 1}.</span>
                      <span className="text-slate-300">{lib}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          <div className="space-y-3">
            {(result.libraries || []).map(function(lib, i) {
              return <LibraryCard key={lib.name || i} lib={lib} index={i} />
            })}
          </div>

          {result.notes && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-slate-300 text-sm">{result.notes}</p>
            </div>
          )}

          <button onClick={handleFind}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Refresh
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-white font-semibold mb-1">Library Finder</p>
          <p className="text-slate-500 text-sm">Find all Arduino libraries with install commands</p>
        </div>
      )}
    </div>
  )
}

export default LibraryFinder