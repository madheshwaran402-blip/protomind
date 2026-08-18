import { useState } from 'react'
import { findFootprints, saveFootprints, getFootprints } from '../services/pcbFootprintService'
import { notify } from '../services/toast'

const MOUNT_STYLES = {
  'Through-hole': 'text-blue-400 bg-blue-950 border-blue-800',
  'SMD': 'text-purple-400 bg-purple-950 border-purple-800',
  'SMT': 'text-purple-400 bg-purple-950 border-purple-800',
  'Module': 'text-green-400 bg-green-950 border-green-800',
}

function FootprintCard({ fp, index }) {
  const [copied, setCopied] = useState(null)
  const mountStyle = MOUNT_STYLES[fp.mountingType] || MOUNT_STYLES['Through-hole']

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(function() { setCopied(null) }, 2000)
    notify.success(label + ' copied!')
  }

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-xs font-black text-indigo-400 shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{fp.component}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="text-indigo-400 text-xs font-medium">{fp.package}</span>
            <span className={'text-xs px-1.5 py-0.5 rounded border ' + mountStyle}>{fp.mountingType}</span>
            {fp.pinCount && <span className="text-slate-500 text-xs">{fp.pinCount} pins</span>}
          </div>
        </div>
      </div>

      {fp.dimensions && (
        <div className="bg-[#0d0d1a] rounded-lg p-2">
          <p className="text-xs text-slate-500">Dimensions: <span className="text-white font-mono">{fp.dimensions}</span></p>
        </div>
      )}

      <div className="space-y-1">
        {fp.kicadName && (
          <div className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg p-2">
            <span className="text-blue-400 text-xs font-semibold shrink-0">KiCad:</span>
            <code className="text-green-400 text-xs font-mono flex-1 truncate">{fp.kicadName}</code>
            <button onClick={function() { copyToClipboard(fp.kicadName, 'KiCad') }}
              className="text-slate-500 hover:text-white text-xs shrink-0">
              {copied === 'KiCad' ? '✅' : '📋'}
            </button>
          </div>
        )}
        {fp.altiumName && (
          <div className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg p-2">
            <span className="text-orange-400 text-xs font-semibold shrink-0">Altium:</span>
            <code className="text-green-400 text-xs font-mono flex-1 truncate">{fp.altiumName}</code>
            <button onClick={function() { copyToClipboard(fp.altiumName, 'Altium') }}
              className="text-slate-500 hover:text-white text-xs shrink-0">
              {copied === 'Altium' ? '✅' : '📋'}
            </button>
          </div>
        )}
        {fp.footprintName && (
          <div className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg p-2">
            <span className="text-slate-500 text-xs font-semibold shrink-0">Name:</span>
            <code className="text-green-400 text-xs font-mono flex-1 truncate">{fp.footprintName}</code>
            <button onClick={function() { copyToClipboard(fp.footprintName, 'Footprint') }}
              className="text-slate-500 hover:text-white text-xs shrink-0">
              {copied === 'Footprint' ? '✅' : '📋'}
            </button>
          </div>
        )}
      </div>

      {fp.library && (
        <p className="text-slate-500 text-xs">Library: <span className="text-slate-300">{fp.library}</span></p>
      )}
      {fp.notes && (
        <p className="text-yellow-400 text-xs">⚠️ {fp.notes}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={function() { window.open('https://www.google.com/search?q=' + encodeURIComponent(fp.component + ' PCB footprint ' + fp.package), '_blank') }}
          className="flex-1 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
        >
          🔍 Search Footprint
        </button>
        <button
          onClick={function() { window.open('https://www.snapeda.com/search/?q=' + encodeURIComponent(fp.component), '_blank') }}
          className="flex-1 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
        >
          📦 SnapEDA
        </button>
      </div>
    </div>
  )
}

function PCBFootprintFinder({ idea, components }) {
  const [result, setResult] = useState(getFootprints(idea))
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')

  async function handleFind() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await findFootprints(components)
      setResult(data)
      saveFootprints(idea, data)
      notify.success('Found ' + (data.footprints?.length || 0) + ' footprints!')
    } catch {
      notify.error('Search failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const filtered = (result?.footprints || []).filter(function(fp) {
    if (!filter) return true
    const q = filter.toLowerCase()
    return fp.component?.toLowerCase().includes(q) || fp.package?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Find KiCad and Altium PCB footprints for all components</p>
        <button
          onClick={handleFind}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🔍 Finding...' : '🔍 Find Footprints'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Finding PCB footprints...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex items-center gap-2">
            <p className="text-white font-bold">{result.footprints?.length || 0} Footprints Found</p>
            <div className="flex gap-1 ml-auto">
              {['Through-hole', 'SMD', 'Module'].map(function(type) {
                const count = (result.footprints || []).filter(function(fp) {
                  return fp.mountingType === type || (type === 'SMD' && fp.mountingType === 'SMT')
                }).length
                if (!count) return null
                const style = MOUNT_STYLES[type] || ''
                return (
                  <span key={type} className={'text-xs px-2 py-0.5 rounded border ' + style}>
                    {type}: {count}
                  </span>
                )
              })}
            </div>
          </div>

          <input
            value={filter}
            onChange={function(e) { setFilter(e.target.value) }}
            placeholder="Filter by component or package..."
            className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
          />

          <div className="space-y-3">
            {filtered.map(function(fp, i) {
              return <FootprintCard key={fp.component || i} fp={fp} index={i} />
            })}
          </div>

          <button onClick={handleFind}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Refresh
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-white font-semibold mb-1">PCB Footprint Finder</p>
          <p className="text-slate-500 text-sm">Find KiCad and Altium footprints with copy buttons</p>
        </div>
      )}
    </div>
  )
}

export default PCBFootprintFinder