import { useState } from 'react'
import { runSimulation } from '../services/simulationService'
import { notify } from '../services/toast'

const RESULT_STYLES = {
  Pass: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅' },
  Warning: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚠️' },
  Fail: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '❌' },
}

const STATUS_COLORS = {
  active: 'text-green-400',
  idle: 'text-slate-400',
  triggered: 'text-yellow-400',
  error: 'text-red-400',
  normal: 'text-green-400',
  high: 'text-yellow-400',
  low: 'text-blue-400',
}

const SEVERITY_COLORS = {
  Low: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Medium: 'text-orange-400 bg-orange-950 border-orange-800',
  High: 'text-red-400 bg-red-950 border-red-800',
  Critical: 'text-red-600 bg-red-950 border-red-700',
}

const PRESET_SCENARIOS = [
  'Normal operation at room temperature',
  'Power surge — voltage spikes to 6V',
  'Sensor failure — DHT22 returns no data',
  'Low battery — voltage drops to 3V',
  'Extreme heat — temperature reaches 80 degrees C',
  'WiFi connection lost during data transmission',
  'Motor stall — mechanical obstruction',
  'I2C bus conflict — multiple devices responding',
]

function TimelineItem({ event, index, isLast }) {
  const statusColor = STATUS_COLORS[event.status] || 'text-slate-400'
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className={'w-3 h-3 rounded-full shrink-0 mt-1 ' + (
          event.status === 'error' ? 'bg-red-500' :
          event.status === 'triggered' ? 'bg-yellow-500' :
          event.status === 'active' ? 'bg-green-500' : 'bg-slate-600'
        )} />
        {!isLast && <div className="w-0.5 flex-1 bg-[#2e2e4e] mt-1 min-h-4" />}
      </div>
      <div className="flex-1 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-slate-500 text-xs font-mono">{event.time}</span>
          <span className={'text-xs font-medium ' + statusColor}>{event.status}</span>
        </div>
        <p className="text-white text-xs">{event.event}</p>
        {event.component && (
          <p className="text-slate-500 text-xs">{event.component}
            {event.value ? ' → ' + event.value : ''}
          </p>
        )}
      </div>
    </div>
  )
}

function SimulationRunner({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState('')
  const [activeTab, setActiveTab] = useState('timeline')
  const [isAnimating, setIsAnimating] = useState(false)
  const [visibleEvents, setVisibleEvents] = useState([])

  async function handleRun() {
    if (components.length === 0) {
      notify.warning('Add components before running simulation')
      return
    }
    setLoading(true)
    setResult(null)
    setVisibleEvents([])
    try {
      const data = await runSimulation(idea, components, scenario)
      setResult(data)
      setActiveTab('timeline')
      animateTimeline(data.timeline || [])
      const resultStyle = RESULT_STYLES[data.overallResult] || RESULT_STYLES.Warning
      notify.success('Simulation complete — ' + (data.overallResult || 'done') + ' (' + (data.passRate || 0) + '%)')
    } catch {
      notify.error('Simulation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function animateTimeline(events) {
    setIsAnimating(true)
    setVisibleEvents([])
    events.forEach(function(event, i) {
      setTimeout(function() {
        setVisibleEvents(function(prev) { return prev.concat([event]) })
        if (i === events.length - 1) setIsAnimating(false)
      }, i * 300)
    })
  }

  const TABS = [
    { id: 'timeline', label: '⏱️ Timeline' },
    { id: 'io', label: '🔌 I/O' },
    { id: 'failures', label: '❌ Failures' },
    { id: 'edge', label: '⚠️ Edge Cases' },
  ]

  const resultStyle = result ? (RESULT_STYLES[result.overallResult] || RESULT_STYLES.Warning) : null

  return (
    <div className="space-y-4">

      {/* Scenario input */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500">Test Scenario</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {PRESET_SCENARIOS.slice(0, 4).map(function(s, i) {
            return (
              <button
                key={i}
                onClick={function() { setScenario(s); setResult(null) }}
                className={'text-xs px-2 py-1 rounded-lg border transition ' + (
                  scenario === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-[#13131f] text-slate-500 border-[#2e2e4e] hover:border-indigo-600'
                )}
              >
                {s.slice(0, 28)}...
              </button>
            )
          })}
        </div>
        <input
          value={scenario}
          onChange={function(e) { setScenario(e.target.value); setResult(null) }}
          placeholder="Describe a test scenario... e.g. Temperature rises rapidly to 85°C"
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 placeholder-slate-600"
        />
      </div>

      <button
        onClick={handleRun}
        disabled={loading || components.length === 0}
        className="w-full py-3 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-bold transition disabled:opacity-50"
      >
        {loading ? '🔬 Simulating...' : '▶️ Run Virtual Simulation'}
      </button>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Running simulation...</p>
          <p className="text-slate-600 text-xs">AI is testing your prototype virtually</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Overall result */}
          <div className={'rounded-2xl border p-5 ' + resultStyle.bg + ' ' + resultStyle.border}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{resultStyle.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className={'font-black text-lg ' + resultStyle.color}>
                    {result.overallResult}
                  </p>
                  <div className="flex-1 bg-[#1e1e2e] rounded-full h-2.5 max-w-32">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: (result.passRate || 0) + '%',
                        backgroundColor: result.passRate >= 80 ? '#22c55e' : result.passRate >= 60 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className={resultStyle.color + ' text-sm font-bold'}>{result.passRate || 0}%</span>
                </div>
                <p className="text-slate-300 text-sm">{result.summary}</p>
                <p className={'text-xs mt-1 font-medium ' + resultStyle.color}>
                  Scenario: {result.scenarioName || scenario || 'Normal operation'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Events', value: (result.timeline || []).length, color: 'text-indigo-400' },
              { label: 'Inputs', value: (result.inputs || []).length, color: 'text-sky-400' },
              { label: 'Outputs', value: (result.outputs || []).length, color: 'text-green-400' },
              { label: 'Failures', value: (result.failures || []).length, color: (result.failures || []).length > 0 ? 'text-red-400' : 'text-slate-600' },
            ].map(function(stat) {
              return (
                <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-2.5 text-center">
                  <p className={'text-xl font-black ' + stat.color}>{stat.value}</p>
                  <p className="text-slate-600 text-xs">{stat.label}</p>
                </div>
              )
            })}
          </div>

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

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                Simulation Event Log {isAnimating ? '⏳' : ''}
              </p>
              {visibleEvents.length > 0 ? (
                visibleEvents.map(function(event, i) {
                  return (
                    <TimelineItem
                      key={i}
                      event={event}
                      index={i}
                      isLast={i === visibleEvents.length - 1}
                    />
                  )
                })
              ) : (
                <p className="text-slate-600 text-sm text-center py-4">No events recorded</p>
              )}
            </div>
          )}

          {/* I/O tab */}
          {activeTab === 'io' && (
            <div className="space-y-3">
              {(result.inputs || []).length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Inputs</p>
                  <div className="space-y-2">
                    {result.inputs.map(function(input, i) {
                      return (
                        <div key={i} className="flex items-center gap-3 bg-[#0d0d1a] rounded-lg px-3 py-2">
                          <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                          <div className="flex-1">
                            <p className="text-white text-xs font-medium">{input.name}</p>
                            <p className="text-slate-500 text-xs">{input.description}</p>
                          </div>
                          <span className="text-sky-400 text-xs font-mono shrink-0">
                            {input.value} {input.unit}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {(result.outputs || []).length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Outputs</p>
                  <div className="space-y-2">
                    {result.outputs.map(function(output, i) {
                      const statusColor = STATUS_COLORS[output.status] || 'text-slate-400'
                      return (
                        <div key={i} className="flex items-center gap-3 bg-[#0d0d1a] rounded-lg px-3 py-2">
                          <div className={'w-2 h-2 rounded-full shrink-0 ' + (
                            output.status === 'active' || output.status === 'normal' ? 'bg-green-500' :
                            output.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                          )} />
                          <div className="flex-1">
                            <p className="text-white text-xs font-medium">{output.name}</p>
                            <p className="text-slate-500 text-xs">{output.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-green-400 text-xs font-mono">{output.value} {output.unit}</p>
                            <p className={'text-xs ' + statusColor}>{output.status}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Failures tab */}
          {activeTab === 'failures' && (
            <div className="space-y-2">
              {(result.failures || []).length === 0 ? (
                <div className="text-center py-8 bg-green-950 border border-green-900 rounded-xl">
                  <p className="text-green-400 font-semibold">✅ No failures detected!</p>
                  <p className="text-green-700 text-xs mt-1">Prototype passed this scenario</p>
                </div>
              ) : (
                result.failures.map(function(failure, i) {
                  const sevClass = SEVERITY_COLORS[failure.severity] || SEVERITY_COLORS.Medium
                  return (
                    <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <p className="text-white text-sm font-semibold flex-1">{failure.component}</p>
                        <span className={'text-xs px-2 py-0.5 rounded-full border ' + sevClass}>
                          {failure.severity}
                        </span>
                      </div>
                      <p className="text-red-300 text-xs mb-2">{failure.issue}</p>
                      {failure.fix && (
                        <div className="bg-green-950 border border-green-900 rounded-lg px-3 py-2">
                          <p className="text-green-400 text-xs font-semibold">Fix:</p>
                          <p className="text-green-200 text-xs">{failure.fix}</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {(result.warnings || []).length > 0 && (
                <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
                  <p className="text-yellow-400 text-xs font-semibold mb-2">⚠️ Warnings</p>
                  <ul className="space-y-1">
                    {result.warnings.map(function(w, i) {
                      return (
                        <li key={i} className="text-yellow-200 text-xs flex items-start gap-2">
                          <span className="shrink-0">•</span> {w}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Edge cases tab */}
          {activeTab === 'edge' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs mb-2">
                Test your prototype with these edge cases before building
              </p>
              {(result.edgeCases || []).map(function(ec, i) {
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                    <span className="text-orange-400 shrink-0 font-bold text-sm">{i + 1}.</span>
                    <p className="text-slate-300 text-sm">{ec}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={handleRun}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Run Again
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🔬</div>
          <p className="text-white font-semibold mb-1">Virtual Simulation Runner</p>
          <p className="text-slate-500 text-sm mb-4">
            Test your prototype virtually before building — catch issues early
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Animated timeline</span>
            <span>✓ I/O monitoring</span>
            <span>✓ Failure detection</span>
            <span>✓ Edge case testing</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimulationRunner