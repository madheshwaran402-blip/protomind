import { useState } from 'react'
import { describeWiring, saveWiringData, getWiringData } from '../services/wiringDiagramService'
import { notify } from '../services/toast'

const WIRE_COLORS = {
  red: '#ef4444', black: '#1f2937', yellow: '#eab308', green: '#22c55e',
  blue: '#3b82f6', white: '#f8fafc', orange: '#f97316', purple: '#a855f7',
  brown: '#92400e', gray: '#6b7280',
}

function WiringDiagramDescriber({ idea, components }) {
  const [result, setResult] = useState(getWiringData(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('connections')
  const [filter, setFilter] = useState('')

  async function handleDescribe() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await describeWiring(idea, components)
      setResult(data)
      saveWiringData(idea, data)
      notify.success('Wiring diagram described!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleExport() {
    if (!result) return
    const lines = ['WIRING DIAGRAM\n', result.overview, '\nCONNECTIONS:']
    ;(result.connections || []).forEach(function(c) {
      lines.push(c.from + ' [' + c.fromPin + '] -> ' + c.to + ' [' + c.toPin + '] (' + c.wire + ')')
      if (c.notes) lines.push('  Note: ' + c.notes)
    })
    lines.push('\nPOWER:')
    ;(result.powerConnections || []).forEach(function(p) {
      lines.push(p.component + ': VCC=' + p.vcc + ', GND=' + p.gnd + ', ' + p.voltage)
    })
    if (result.warnings?.length) {
      lines.push('\nWARNINGS:')
      result.warnings.forEach(function(w) { lines.push('! ' + w) })
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'wiring_diagram.txt'; link.click()
    URL.revokeObjectURL(url)
    notify.success('Wiring diagram exported!')
  }

  const TABS = [{ id: 'connections', label: 'Connections' }, { id: 'power', label: 'Power' }, { id: 'warnings', label: 'Warnings' }]
  const filtered = (result?.connections || []).filter(function(c) {
    return !filter || c.from.toLowerCase().includes(filter.toLowerCase()) || c.to.toLowerCase().includes(filter.toLowerCase())
  })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Get complete wiring instructions with pin connections and wire colors</p>
        <button onClick={handleDescribe} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-rose-700 hover:bg-rose-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Describing...' : 'Describe Wiring'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Describing wiring connections...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Overview</p>
            <p className="text-white text-sm">{result.overview}</p>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span>{(result.connections || []).length} connections</span>
              <span>{(result.powerConnections || []).length} power rails</span>
              {result.warnings?.length > 0 && <span className="text-red-400">{result.warnings.length} warnings</span>}
            </div>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-rose-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'connections' && (
            <div className="space-y-2">
              <input value={filter} onChange={function(e) { setFilter(e.target.value) }}
                placeholder="Filter by component name..."
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-rose-500" />
              {filtered.map(function(conn, i) {
                const wireColor = WIRE_COLORS[conn.wire?.toLowerCase()] || '#6b7280'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: wireColor }} />
                      <span className="text-xs text-slate-500 capitalize">{conn.wire} wire</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="bg-[#0d0d1a] rounded-lg px-2 py-1">
                        <p className="text-white font-bold text-xs">{conn.from}</p>
                        <p className="text-rose-400 text-xs font-mono">{conn.fromPin}</p>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: wireColor }} />
                      <div className="bg-[#0d0d1a] rounded-lg px-2 py-1 text-right">
                        <p className="text-white font-bold text-xs">{conn.to}</p>
                        <p className="text-rose-400 text-xs font-mono">{conn.toPin}</p>
                      </div>
                    </div>
                    {conn.notes && <p className="text-slate-500 text-xs mt-1">{conn.notes}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'power' && (
            <div className="space-y-2">
              {(result.powerConnections || []).map(function(p, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">{p.component}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-red-950 border border-red-800 rounded-lg p-2 text-center">
                        <p className="text-red-400 font-bold">VCC</p>
                        <p className="text-white font-mono">{p.vcc}</p>
                      </div>
                      <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-2 text-center">
                        <p className="text-slate-400 font-bold">GND</p>
                        <p className="text-white font-mono">{p.gnd}</p>
                      </div>
                      <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-2 text-center">
                        <p className="text-yellow-400 font-bold">Volt</p>
                        <p className="text-white font-mono">{p.voltage}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'warnings' && (
            <div className="space-y-2">
              {(result.warnings || []).length === 0 ? (
                <p className="text-green-400 text-center py-4">No warnings!</p>
              ) : (
                (result.warnings || []).map(function(w, i) {
                  return (
                    <div key={i} className="bg-red-950 border border-red-800 rounded-xl p-3 flex gap-2">
                      <span className="text-red-400 shrink-0">!</span>
                      <p className="text-slate-300 text-sm">{w}</p>
                    </div>
                  )
                })
              )}
            </div>
          )}

          <button onClick={handleExport} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Export Wiring Diagram</button>
          <button onClick={handleDescribe} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔴</div>
          <p className="text-white font-semibold mb-1">Wiring Diagram Describer</p>
          <p className="text-slate-500 text-sm">Get complete pin-by-pin wiring instructions with wire colors</p>
        </div>
      )}
    </div>
  )
}

export default WiringDiagramDescriber
