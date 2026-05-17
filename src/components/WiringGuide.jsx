import { useState } from 'react'
import { generateWiringGuide, exportWiringGuide } from '../services/wiringGuideService'
import { notify } from '../services/toast'

const WIRE_COLORS = {
  red: { bg: '#ef4444', label: 'Red — Power (VCC)' },
  black: { bg: '#1f2937', label: 'Black — Ground (GND)' },
  orange: { bg: '#f97316', label: 'Orange — Data/Signal' },
  yellow: { bg: '#eab308', label: 'Yellow — Clock (SCL)' },
  green: { bg: '#22c55e', label: 'Green — Data (SDA)' },
  blue: { bg: '#3b82f6', label: 'Blue — TX/RX Serial' },
  white: { bg: '#f1f5f9', label: 'White — General' },
  purple: { bg: '#a855f7', label: 'Purple — PWM/Analog' },
  brown: { bg: '#92400e', label: 'Brown — General' },
  gray: { bg: '#6b7280', label: 'Gray — General' },
}

function WireColorDot({ color }) {
  const wireColor = WIRE_COLORS[color ? color.toLowerCase() : 'gray']
  return (
    <div
      className="w-4 h-4 rounded-full border-2 border-[#2e2e4e] shrink-0"
      style={{ backgroundColor: wireColor ? wireColor.bg : '#6b7280' }}
      title={wireColor ? wireColor.label : color}
    />
  )
}

function ConnectionStep({ conn, index, isLast }) {
  const [done, setDone] = useState(false)

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={function() { setDone(!done) }}
          className={'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ' + (
            done
              ? 'bg-green-600 border-green-500 text-white'
              : 'bg-[#13131f] border-[#2e2e4e] text-slate-500 hover:border-indigo-600'
          )}
        >
          {done ? '✓' : conn.step}
        </button>
        {!isLast && (
          <div className={'w-0.5 flex-1 mt-1 min-h-6 ' + (done ? 'bg-green-800' : 'bg-[#2e2e4e]')} />
        )}
      </div>
      <div className={'flex-1 pb-4 ' + (done ? 'opacity-50' : '')}>
        <div className={'bg-[#13131f] border rounded-xl p-4 ' + (done ? 'border-green-900' : 'border-[#2e2e4e]')}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <WireColorDot color={conn.wireColor} />
            <span className="text-white text-xs font-semibold">
              {conn.fromComponent}
            </span>
            <span className="text-indigo-400 text-xs font-mono bg-indigo-950 px-1.5 py-0.5 rounded">
              {conn.fromPin}
            </span>
            <span className="text-slate-500 text-xs">→</span>
            <span className="text-white text-xs font-semibold">
              {conn.toComponent}
            </span>
            <span className="text-indigo-400 text-xs font-mono bg-indigo-950 px-1.5 py-0.5 rounded">
              {conn.toPin}
            </span>
            {conn.wireColor && (
              <span className="text-xs text-slate-500 ml-auto capitalize">{conn.wireColor} wire</span>
            )}
          </div>
          {conn.notes && (
            <p className="text-slate-400 text-xs">{conn.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function WiringGuide({ idea, components }) {
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('connections')
  const [activeGroup, setActiveGroup] = useState('all')

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setGuide(null)
    try {
      const data = await generateWiringGuide(idea, components)
      setGuide(data)
      notify.success('Wiring guide ready — ' + (data.connections || []).length + ' connections')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'connections', label: '🔌 Wiring' },
    { id: 'power', label: '⚡ Power' },
    { id: 'testing', label: '🧪 Testing' },
    { id: 'tips', label: '💡 Tips' },
  ]

  const filteredConnections = guide ? (
    activeGroup === 'all'
      ? (guide.connections || [])
      : (guide.connections || []).filter(function(c) {
          const group = (guide.groups || []).find(function(g) { return g.groupName === activeGroup })
          return group && group.connectionIds && group.connectionIds.includes(c.step)
        })
  ) : []

  const doneCount = 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          Step-by-step wiring instructions with exact pin connections
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '📐 Generating...' : '📐 Generate Wiring Guide'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is generating wiring instructions...</p>
        </div>
      )}

      {guide && !loading && (
        <>
          {/* Header */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white font-bold text-base">{guide.title}</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{guide.overview}</p>
              </div>
              <button
                onClick={function() { exportWiringGuide(guide, idea); notify.success('Guide exported!') }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0 transition"
              >
                ⬇️ Export
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'Connections', value: (guide.connections || []).length, icon: '🔌' },
                { label: 'Power Lines', value: (guide.powerConnections || []).length, icon: '⚡' },
                { label: 'Test Steps', value: (guide.testingSteps || []).length, icon: '🧪' },
                { label: 'Tools', value: (guide.toolsNeeded || []).length, icon: '🔧' },
              ].map(function(stat) {
                return (
                  <div key={stat.label} className="bg-[#0d0d1a] rounded-xl p-2 text-center">
                    <p className="text-sm mb-0.5">{stat.icon}</p>
                    <p className="text-white font-bold text-sm">{stat.value}</p>
                    <p className="text-slate-600 text-xs">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Safety warnings */}
          {guide.safetyWarnings && guide.safetyWarnings.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold mb-2">⚠️ Safety Warnings — Read Before Wiring</p>
              <ul className="space-y-1">
                {guide.safetyWarnings.map(function(warning, i) {
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-red-400 shrink-0">!</span>
                      <p className="text-red-200">{warning}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Wire colour legend */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-xs text-slate-500 font-semibold mb-2">Wire Colour Legend</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(WIRE_COLORS).slice(0, 6).map(function(entry) {
                const colorName = entry[0]
                const colorInfo = entry[1]
                return (
                  <div key={colorName} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorInfo.bg }} />
                    <span className="text-slate-400 text-xs">{colorInfo.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Group filters */}
          {guide.groups && guide.groups.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={function() { setActiveGroup('all') }}
                className={'text-xs px-3 py-1.5 rounded-xl border transition ' + (
                  activeGroup === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-600'
                )}
              >
                All Connections
              </button>
              {guide.groups.map(function(group, i) {
                return (
                  <button
                    key={i}
                    onClick={function() { setActiveGroup(group.groupName) }}
                    className={'text-xs px-3 py-1.5 rounded-xl border transition ' + (
                      activeGroup === group.groupName
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-600'
                    )}
                  >
                    {group.groupName}
                  </button>
                )
              })}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button
                  key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Connections tab */}
          {activeTab === 'connections' && (
            <div className="space-y-1">
              <p className="text-slate-600 text-xs mb-2">
                Click each step circle to mark as done
              </p>
              {filteredConnections.length > 0 ? (
                filteredConnections.map(function(conn, i) {
                  return (
                    <ConnectionStep
                      key={conn.step || i}
                      conn={conn}
                      index={i}
                      isLast={i === filteredConnections.length - 1}
                    />
                  )
                })
              ) : (
                <p className="text-center text-slate-600 text-sm py-6">No connections in this group</p>
              )}
            </div>
          )}

          {/* Power tab */}
          {activeTab === 'power' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs mb-2">Connect power before signal wires</p>
              {(guide.powerConnections || []).map(function(power, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-semibold text-sm mb-2">{power.component}</p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-[#0d0d1a] rounded-lg p-2">
                        <p className="text-slate-500 mb-1">VCC Pin</p>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <p className="text-white font-mono">{power.vccPin}</p>
                        </div>
                      </div>
                      <div className="bg-[#0d0d1a] rounded-lg p-2">
                        <p className="text-slate-500 mb-1">GND Pin</p>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                          <p className="text-white font-mono">{power.gndPin}</p>
                        </div>
                      </div>
                      <div className="bg-[#0d0d1a] rounded-lg p-2">
                        <p className="text-slate-500 mb-1">Voltage</p>
                        <p className="text-yellow-400 font-bold">{power.voltage}</p>
                      </div>
                    </div>
                    {power.notes && (
                      <p className="text-slate-400 text-xs mt-2">{power.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Testing tab */}
          {activeTab === 'testing' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs mb-2">
                Follow these tests after wiring to verify connections
              </p>
              {(guide.testingSteps || []).map(function(test, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                        {test.step || i + 1}
                      </div>
                      <div>
                        <p className="text-white text-sm mb-1">{test.description}</p>
                        <p className="text-green-400 text-xs">
                          Expected: {test.expectedResult}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tips tab */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              {guide.toolsNeeded && guide.toolsNeeded.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    🔧 Tools Needed
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {guide.toolsNeeded.map(function(tool, i) {
                      return (
                        <span key={i} className="text-xs bg-[#0d0d1a] text-slate-300 border border-[#2e2e4e] px-2 py-1 rounded-lg">
                          {tool}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {guide.commonMistakes && guide.commonMistakes.length > 0 && (
                <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">
                    ❌ Common Mistakes to Avoid
                  </p>
                  <ul className="space-y-1">
                    {guide.commonMistakes.map(function(mistake, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-orange-400 shrink-0">×</span>
                          <p className="text-orange-200">{mistake}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {guide.tips && guide.tips.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">
                    💡 Pro Tips
                  </p>
                  <ul className="space-y-1">
                    {guide.tips.map(function(tip, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-indigo-400 shrink-0">→</span>
                          <p className="text-slate-300">{tip}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Guide
          </button>
        </>
      )}

      {!guide && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📐</div>
          <p className="text-white font-semibold mb-1">Wiring Guide Generator</p>
          <p className="text-slate-500 text-sm mb-4">
            Get step-by-step wiring instructions with exact pin connections
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Pin-by-pin steps</span>
            <span>✓ Wire colours</span>
            <span>✓ Power connections</span>
            <span>✓ Testing steps</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WiringGuide