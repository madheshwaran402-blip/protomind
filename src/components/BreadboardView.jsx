import { useState } from 'react'
import { generateBreadboardLayout } from '../services/breadboardGenerator'
import { notify } from '../services/toast'

const WIRE_COLORS = {
  red: '#ef4444',
  black: '#1f2937',
  yellow: '#eab308',
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
  white: '#f8fafc',
  brown: '#92400e',
  purple: '#a855f7',
  gray: '#6b7280',
}

function BreadboardDiagram({ layout }) {
  const ROWS = 30
  const COLS = ['a', 'b', 'c', 'd', 'e', 'gap', 'f', 'g', 'h', 'i', 'j']

  return (
    <div className="bg-[#e8f5e9] rounded-xl p-4 overflow-x-auto">
      <div className="min-w-max">
        {/* Power rails top */}
        <div className="flex gap-1 mb-2">
          <div className="w-8" />
          <div className="flex gap-0.5">
            {Array.from({ length: ROWS }, (_, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="w-4 h-3 bg-red-400 rounded-sm opacity-80" />
                <div className="w-4 h-3 bg-gray-800 rounded-sm opacity-80" />
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="flex gap-1">
          {/* Row numbers */}
          <div className="flex flex-col gap-0.5">
            {COLS.filter(c => c !== 'gap').map(col => (
              <div key={col} className="w-8 h-4 flex items-center justify-center text-xs text-gray-500 font-mono uppercase">
                {col}
              </div>
            ))}
          </div>

          {/* Holes grid */}
          <div>
            {COLS.map(col => {
              if (col === 'gap') {
                return <div key="gap" className="h-3" />
              }
              return (
                <div key={col} className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: ROWS }, (_, rowIdx) => {
                    const row = rowIdx + 1
                    const isUsed = layout?.components?.some(comp =>
                      comp.pins?.some(pin => pin.row === row)
                    )
                    return (
                      <div
                        key={row}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isUsed
                            ? 'bg-indigo-400 border-indigo-600'
                            : 'bg-white border-gray-300'
                        }`}
                        title={isUsed ? 'Component pin here' : 'Row ' + row + ', Col ' + col}
                      >
                        {isUsed && <div className="w-1.5 h-1.5 bg-indigo-700 rounded-full" />}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Power rails bottom */}
        <div className="flex gap-1 mt-2">
          <div className="w-8" />
          <div className="flex gap-0.5">
            {Array.from({ length: ROWS }, (_, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="w-4 h-3 bg-red-400 rounded-sm opacity-80" />
                <div className="w-4 h-3 bg-gray-800 rounded-sm opacity-80" />
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-4 h-4 rounded-full bg-red-400 border border-red-600" />
            Power (+)
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-900" />
            Ground (-)
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-4 h-4 rounded-full bg-indigo-400 border border-indigo-600" />
            Component Pin
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-4 h-4 rounded-full bg-white border border-gray-300" />
            Empty Hole
          </div>
        </div>
      </div>
    </div>
  )
}

function BreadboardView({ idea, components }) {
  const [layout, setLayout] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('diagram')

  async function handleGenerate() {
    setLoading(true)
    setLayout(null)
    try {
      const data = await generateBreadboardLayout(idea, components)
      setLayout(data)
      notify.success('Breadboard layout generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-xs">
          Visual top-down breadboard wiring guide for physical building
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? '🔌 Generating...' : '🔌 Generate Breadboard View'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is planning the breadboard layout...</p>
        </div>
      )}

      {layout && !loading && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Difficulty', value: layout.difficulty || 'Beginner', icon: '📊' },
              { label: 'Est. Time', value: layout.estimatedTime || '30 min', icon: '⏱️' },
              { label: 'Connections', value: (layout.connections?.length || 0) + ' wires', icon: '🔌' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                <p className="text-lg mb-1">{stat.icon}</p>
                <p className="text-white font-bold text-sm">{stat.value}</p>
                <p className="text-slate-600 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {[
              { id: 'diagram', label: '🔌 Diagram' },
              { id: 'placement', label: '📍 Placement' },
              { id: 'wiring', label: '🔗 Wiring' },
              { id: 'tips', label: '💡 Tips' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Diagram tab */}
          {activeTab === 'diagram' && (
            <BreadboardDiagram layout={layout} />
          )}

          {/* Placement tab */}
          {activeTab === 'placement' && (
            <div className="space-y-3">
              {layout.components?.map((comp, i) => (
                <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-semibold text-sm">{comp.name}</p>
                    <span className="text-xs bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-900">
                      {comp.placement}
                    </span>
                  </div>
                  {comp.pins?.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {comp.pins.map((pin, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <span className="text-slate-400 font-mono">{pin.pin}</span>
                          <span className="text-slate-600">→</span>
                          <span className="text-slate-300">{pin.rail || ('Row ' + pin.row)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Wiring tab */}
          {activeTab === 'wiring' && (
            <div className="space-y-3">
              {/* Power rails */}
              {layout.powerRails?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 mb-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Power Rails</h4>
                  <div className="space-y-2">
                    {layout.powerRails.map((rail, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-4 h-4 rounded-full ${rail.rail === '+' ? 'bg-red-500' : 'bg-gray-700'}`} />
                        <span className="text-white font-mono">{rail.rail === '+' ? '+' : '-'} Rail</span>
                        <span className="text-slate-500">{rail.voltage}</span>
                        <span className="text-slate-600">from {rail.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections */}
              {layout.connections?.map((conn, i) => (
                <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 shrink-0"
                      style={{
                        backgroundColor: WIRE_COLORS[conn.wire] || '#6b7280',
                        borderColor: WIRE_COLORS[conn.wire] || '#6b7280',
                      }}
                    />
                    <span className="text-xs font-semibold uppercase" style={{ color: WIRE_COLORS[conn.wire] || '#6b7280' }}>
                      {conn.wire} wire
                    </span>
                    <span className="text-slate-600 text-xs ml-auto">Step {i + 1}</span>
                  </div>
                  <p className="text-white text-sm mb-1">
                    <span className="text-indigo-400">{conn.from}</span>
                    <span className="text-slate-500 mx-2">→</span>
                    <span className="text-green-400">{conn.to}</span>
                  </p>
                  {conn.steps && (
                    <p className="text-slate-500 text-xs">{conn.steps}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tips tab */}
          {activeTab === 'tips' && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-5">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">
                💡 Breadboard Building Tips
              </h4>
              <ul className="space-y-3">
                {layout.tips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!layout && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🔌</div>
          <p className="text-white font-semibold mb-1">Breadboard View</p>
          <p className="text-slate-500 text-sm">Click Generate to create a visual wiring guide</p>
        </div>
      )}
    </div>
  )
}

export default BreadboardView