import { useState } from 'react'
import { generateConnectionDiagram, saveDiagram, getDiagram } from '../services/diagramService'
import { notify } from '../services/toast'

const WIRE_COLORS = {
  red: '#ef4444',
  black: '#1f2937',
  yellow: '#f59e0b',
  green: '#22c55e',
  blue: '#3b82f6',
  white: '#f8fafc',
  orange: '#f97316',
  purple: '#a855f7',
  gray: '#6b7280',
}

const PROTOCOL_COLORS = {
  I2C: '#6366f1',
  SPI: '#0ea5e9',
  UART: '#22c55e',
  PWM: '#f59e0b',
  Analog: '#a855f7',
  Digital: '#14b8a6',
}

function WireDot({ color }) {
  const hexColor = WIRE_COLORS[color?.toLowerCase()] || '#6366f1'
  return (
    <div className="w-3 h-3 rounded-full shrink-0 border border-[#2e2e4e]"
      style={{ backgroundColor: hexColor }} />
  )
}

function ConnectionRow({ conn, index }) {
  const [expanded, setExpanded] = useState(false)
  const wireColor = WIRE_COLORS[conn.color?.toLowerCase()] || '#6366f1'

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#1e1e2e] transition"
        onClick={function() { setExpanded(!expanded) }}
      >
        <span className="text-slate-500 text-xs w-5 shrink-0 font-mono">{index + 1}</span>
        <WireDot color={conn.color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-indigo-400 font-medium">{conn.from}</span>
            <span className="text-slate-600">pin</span>
            <span className="text-white font-mono font-bold">{conn.fromPin}</span>
            <span className="text-slate-600">→</span>
            <span className="text-green-400 font-medium">{conn.to}</span>
            <span className="text-slate-600">pin</span>
            <span className="text-white font-mono font-bold">{conn.toPin}</span>
          </div>
          {conn.wire && (
            <p className="text-slate-600 text-xs">{conn.wire} wire</p>
          )}
        </div>
        <span className="text-slate-600 text-xs">{expanded ? '↑' : '↓'}</span>
      </div>
      {expanded && conn.note && (
        <div className="px-4 pb-3 border-t border-[#2e2e4e] bg-[#0d0d1a] pt-2">
          <p className="text-slate-400 text-xs">{conn.note}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-0.5 rounded" style={{ backgroundColor: wireColor }} />
            <span className="text-xs" style={{ color: wireColor }}>{conn.color || 'wire'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ConnectionDiagram({ idea, components }) {
  const [diagram, setDiagram] = useState(getDiagram(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('connections')
  const [filter, setFilter] = useState('')

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await generateConnectionDiagram(idea, components)
      setDiagram(data)
      saveDiagram(idea, data)
      notify.success('Connection diagram ready — ' + (data.connections?.length || 0) + ' connections!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleExportText() {
    if (!diagram) return
    const lines = [
      'CONNECTION DIAGRAM: ' + idea,
      '='.repeat(50),
      '',
      'CONNECTIONS:',
      ...(diagram.connections || []).map(function(c, i) {
        return (i + 1) + '. ' + c.from + ' [' + c.fromPin + '] -> ' + c.to + ' [' + c.toPin + '] (' + (c.color || 'wire') + ')'
      }),
      '',
      'POWER RAILS:',
      ...(diagram.powerRails || []).map(function(r) {
        return r.voltage + ': ' + (r.components || []).join(', ')
      }),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Connections.txt'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Diagram exported!')
  }

  const TABS = [
    { id: 'connections', label: '🔌 Connections' },
    { id: 'power', label: '⚡ Power' },
    { id: 'buses', label: '📡 Buses' },
  ]

  const filteredConns = (diagram?.connections || []).filter(function(c) {
    if (!filter) return true
    const q = filter.toLowerCase()
    return c.from?.toLowerCase().includes(q) || c.to?.toLowerCase().includes(q) ||
      c.fromPin?.toLowerCase().includes(q) || c.toPin?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">AI generates a complete pin-by-pin connection diagram</p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🔌 Building...' : '🔌 Build Diagram'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building connection diagram...</p>
        </div>
      )}

      {diagram && !loading && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{diagram.summary}</p>
            <button onClick={handleExportText}
              className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition">
              ⬇️ Export
            </button>
          </div>

          {/* Wire legend */}
          <div className="flex flex-wrap gap-2">
            {[...new Set((diagram.connections || []).map(function(c) { return c.color }).filter(Boolean))].map(function(color) {
              return (
                <div key={color} className="flex items-center gap-1 text-xs">
                  <WireDot color={color} />
                  <span className="text-slate-500 capitalize">{color}</span>
                </div>
              )
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'connections' && (
            <>
              <input
                value={filter}
                onChange={function(e) { setFilter(e.target.value) }}
                placeholder="Filter by component or pin..."
                className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
              />
              <div className="space-y-2">
                {filteredConns.map(function(conn, i) {
                  return <ConnectionRow key={i} conn={conn} index={i} />
                })}
                {filteredConns.length === 0 && (
                  <p className="text-slate-600 text-xs text-center py-4">No connections match filter</p>
                )}
              </div>
            </>
          )}

          {activeTab === 'power' && (
            <div className="space-y-2">
              {(diagram.powerRails || []).map(function(rail, i) {
                const color = rail.voltage?.includes('3.3') ? '#0ea5e9' : rail.voltage?.includes('5') ? '#22c55e' : '#f59e0b'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <p className="text-white font-bold text-sm">{rail.voltage}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(rail.components || []).map(function(comp, j) {
                        return (
                          <span key={j} className="text-xs px-2 py-0.5 rounded-full border"
                            style={{ borderColor: color + '40', color, backgroundColor: color + '15' }}>
                            {comp}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {(!diagram.powerRails || diagram.powerRails.length === 0) && (
                <p className="text-slate-600 text-xs text-center py-4">No power rail data</p>
              )}
            </div>
          )}

          {activeTab === 'buses' && (
            <div className="space-y-2">
              {(diagram.communicationBuses || []).map(function(bus, i) {
                const color = PROTOCOL_COLORS[bus.protocol] || '#6366f1'
                return (
                  <div key={i} className="rounded-xl border p-4"
                    style={{ backgroundColor: color + '10', borderColor: color + '40' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ color, backgroundColor: color + '20' }}>
                        {bus.protocol}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(bus.components || []).map(function(comp, j) {
                        return (
                          <span key={j} className="text-xs text-slate-300 bg-[#0d0d1a] border border-[#2e2e4e] px-2 py-0.5 rounded-full">
                            {comp}
                          </span>
                        )
                      })}
                    </div>
                    {bus.pins && (
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(bus.pins).map(function(entry) {
                          return (
                            <div key={entry[0]} className="flex gap-2 text-xs">
                              <span style={{ color }}>{entry[0]}:</span>
                              <span className="text-slate-400">{entry[1]}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              {(!diagram.communicationBuses || diagram.communicationBuses.length === 0) && (
                <p className="text-slate-600 text-xs text-center py-4">No communication bus data</p>
              )}
            </div>
          )}

          <button onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Regenerate
          </button>
        </>
      )}

      {!diagram && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔌</div>
          <p className="text-white font-semibold mb-1">Connection Diagram Builder</p>
          <p className="text-slate-500 text-sm">AI generates pin-by-pin connections with wire colors</p>
        </div>
      )}
    </div>
  )
}

export default ConnectionDiagram