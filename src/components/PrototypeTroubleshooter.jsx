import { useState } from 'react'
import { diagnoseProblem } from '../services/troubleshooterService'
import { notify } from '../services/toast'

const SEVERITY_COLORS = {
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🟢' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '🟡' },
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🔴' },
  Critical: { color: 'text-red-600', bg: 'bg-red-950', border: 'border-red-700', icon: '🚨' },
}

const CAUSE_CATEGORY_COLORS = {
  Wiring: 'text-red-400 bg-red-950 border-red-800',
  Software: 'text-blue-400 bg-blue-950 border-blue-800',
  Power: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Component: 'text-purple-400 bg-purple-950 border-purple-800',
  Configuration: 'text-cyan-400 bg-cyan-950 border-cyan-800',
  Hardware: 'text-orange-400 bg-orange-950 border-orange-800',
}

const COMMON_PROBLEMS = [
  { label: '💡 LED not lighting up', value: 'LED is not lighting up at all' },
  { label: '📡 Sensor giving wrong values', value: 'Sensor is giving incorrect or unstable readings' },
  { label: '🖥️ Display not showing anything', value: 'LCD or OLED display is completely blank' },
  { label: '📶 WiFi not connecting', value: 'ESP32 WiFi connection keeps failing or dropping' },
  { label: '⚙️ Motor not spinning', value: 'Motor is not spinning or spinning in wrong direction' },
  { label: '🔌 No power', value: 'Circuit is not powering on at all' },
  { label: '📱 Bluetooth not pairing', value: 'Bluetooth module is not pairing with phone' },
  { label: '💻 Code upload fails', value: 'Cannot upload code to microcontroller' },
  { label: '🌡️ Temperature reading off', value: 'Temperature sensor reading is significantly off from actual value' },
  { label: '🔊 No sound from buzzer', value: 'Buzzer or speaker is not making any sound' },
]

function LikelihoodBar({ likelihood }) {
  const color = likelihood >= 80 ? '#ef4444' : likelihood >= 60 ? '#f59e0b' : '#6366f1'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full"
          style={{ width: likelihood + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-xs shrink-0" style={{ color }}>{likelihood}%</span>
    </div>
  )
}

function CauseCard({ cause }) {
  const [expanded, setExpanded] = useState(false)
  const catClass = CAUSE_CATEGORY_COLORS[cause.category] || 'text-slate-400 bg-slate-900 border-slate-700'

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white text-sm font-semibold">{cause.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${catClass}`}>
              {cause.category}
            </span>
          </div>
          <LikelihoodBar likelihood={cause.likelihood} />
        </div>
        <span className="text-slate-600 shrink-0 ml-2">{expanded ? '↑' : '↓'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#2e2e4e] pt-3">
          <p className="text-slate-300 text-sm leading-relaxed">{cause.explanation}</p>
        </div>
      )}
    </div>
  )
}

function FixStep({ fix, index }) {
  const [done, setDone] = useState(false)
  return (
    <div className={`flex gap-3 transition ${done ? 'opacity-50' : ''}`}>
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={() => setDone(!done)}
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
            done ? 'bg-green-600 border-green-500 text-white' : 'bg-[#13131f] border-[#2e2e4e] text-slate-500 hover:border-indigo-600'
          }`}
        >
          {done ? '✓' : fix.step}
        </button>
        {index >= 0 && (
          <div className={`w-0.5 flex-1 mt-1 min-h-4 ${done ? 'bg-green-800' : 'bg-[#2e2e4e]'}`} />
        )}
      </div>
      <div className={`flex-1 pb-4 ${done ? 'line-through' : ''}`}>
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
          <p className={`font-semibold text-sm mb-1 ${done ? 'text-slate-500' : 'text-white'}`}>
            {fix.title}
          </p>
          <p className="text-slate-400 text-xs leading-relaxed mb-2">{fix.detail}</p>
          <div className="flex gap-3 text-xs text-slate-500">
            {fix.tool && <span>🔧 {fix.tool}</span>}
            {fix.time && <span>⏱️ {fix.time}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function PrototypeTroubleshooter({ idea, components }) {
  const [problem, setProblem] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('diagnosis')

  async function handleDiagnose() {
    if (!problem.trim()) {
      notify.warning('Please describe the problem')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await diagnoseProblem(problem, components, symptoms)
      setResult(data)
      setHistory(prev => [{ problem, result: data, timestamp: new Date().toISOString() }, ...prev.slice(0, 4)])
      notify.success('Diagnosis complete — ' + (data.causes?.length || 0) + ' possible causes found')
    } catch {
      notify.error('Diagnosis failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const severity = result ? (SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.Medium) : null

  const TABS = [
    { id: 'diagnosis', label: '🔍 Diagnosis' },
    { id: 'fixes', label: '🔧 Fix Steps' },
    { id: 'history', label: '📋 History' },
  ]

  return (
    <div className="space-y-4">

      {/* Problem input */}
      <div className="space-y-2">
        <div>
          <p className="text-xs text-slate-500 mb-2">Describe the problem</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {COMMON_PROBLEMS.slice(0, 5).map(p => (
              <button
                key={p.value}
                onClick={() => { setProblem(p.value); setResult(null) }}
                className={`text-xs px-2 py-1 rounded-lg border transition ${
                  problem === p.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-[#13131f] text-slate-500 border-[#2e2e4e] hover:border-indigo-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <textarea
            value={problem}
            onChange={e => { setProblem(e.target.value); setResult(null) }}
            placeholder="Describe your problem in detail... e.g. 'The DHT22 sensor keeps returning -999 values even though it is wired correctly'"
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-red-600 resize-none placeholder-slate-600"
            rows={3}
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Additional symptoms (optional)</p>
          <input
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="e.g. LED blinks twice, serial monitor shows garbage, component gets hot..."
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 placeholder-slate-600"
          />
        </div>
      </div>

      <button
        onClick={handleDiagnose}
        disabled={loading || !problem.trim()}
        className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? '🔍 Diagnosing...' : '🔍 Diagnose Problem'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is analysing the problem...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Severity + summary */}
          <div className={`rounded-xl border p-4 flex items-start gap-3 ${severity.bg} ${severity.border}`}>
            <span className="text-2xl shrink-0">{severity.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-sm font-bold ${severity.color}`}>{result.severity} Severity</p>
                {result.estimatedFixTime && (
                  <span className="text-xs text-slate-500">⏱️ {result.estimatedFixTime} to fix</span>
                )}
                {result.difficulty && (
                  <span className="text-xs text-slate-500">· {result.difficulty}</span>
                )}
              </div>
              <p className="text-slate-300 text-sm">{result.summary}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.filter(t => t.id !== 'history').map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              📋 History
            </button>
          </div>

          {/* Diagnosis tab */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Possible Causes — ranked by likelihood
              </p>
              {result.causes?.map(cause => (
                <CauseCard key={cause.id} cause={cause} />
              ))}

              {result.relatedComponents?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-semibold mb-2">🔧 You May Need</p>
                  <div className="flex flex-wrap gap-2">
                    {result.relatedComponents.map((comp, i) => (
                      <span key={i} className="text-xs bg-[#0d0d1a] text-slate-300 border border-[#2e2e4e] px-2 py-1 rounded-lg">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fixes tab */}
          {activeTab === 'fixes' && (
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                Step-by-step fix — click each step when done
              </p>
              {result.fixes?.map((fix, i) => (
                <FixStep key={fix.step} fix={fix} index={i} />
              ))}

              {result.preventionTips?.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4 mt-2">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Prevention Tips</p>
                  <ul className="space-y-1">
                    {result.preventionTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-indigo-400 shrink-0">→</span>
                        <p className="text-slate-300">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* History tab — always visible */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-center text-slate-600 text-sm py-6">No diagnosis history yet</p>
          ) : (
            history.map((h, i) => (
              <div
                key={i}
                className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 cursor-pointer hover:border-indigo-800 transition"
                onClick={() => { setProblem(h.problem); setResult(h.result); setActiveTab('diagnosis') }}
              >
                <p className="text-white text-xs font-medium line-clamp-1">{h.problem}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${(SEVERITY_COLORS[h.result.severity] || SEVERITY_COLORS.Medium).color}`}>
                    {h.result.severity}
                  </span>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-slate-600 text-xs">
                    {new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-white font-semibold mb-1">AI Troubleshooter</p>
          <p className="text-slate-500 text-sm">Describe your problem and AI will diagnose causes and fixes</p>
        </div>
      )}
    </div>
  )
}

export default PrototypeTroubleshooter