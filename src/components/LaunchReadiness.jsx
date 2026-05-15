import { useState } from 'react'
import { checkLaunchReadiness } from '../services/launchReadinessService'
import { notify } from '../services/toast'

const VERDICT_STYLES = {
  'Go': { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🚀' },
  'No-Go': { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🛑' },
  'Conditional Go': { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚠️' },
}

const STATUS_COLORS = {
  Ready: 'text-green-400',
  'In Progress': 'text-yellow-400',
  'Not Started': 'text-red-400',
  Complete: 'text-green-400',
}

const PRIORITY_COLORS = {
  Critical: 'text-red-400 bg-red-950 border-red-800',
  High: 'text-orange-400 bg-orange-950 border-orange-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-green-400 bg-green-950 border-green-800',
}

function ReadinessGauge({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Launch Ready' : score >= 60 ? 'Almost Ready' : 'Not Ready'
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#1e1e2e" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - score / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-black" style={{ color }}>{score}</p>
          <p className="text-slate-600 text-xs">/ 100</p>
        </div>
      </div>
      <p className="text-sm font-semibold mt-1" style={{ color }}>{label}</p>
    </div>
  )
}

function CategoryCard({ category }) {
  const [expanded, setExpanded] = useState(false)
  const statusColor = STATUS_COLORS[category.status] || 'text-yellow-400'
  const score = category.score || 0
  const barColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

  const doneCount = (category.items || []).filter(function(i) { return i.done }).length
  const totalCount = (category.items || []).length

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={function() { setExpanded(!expanded) }}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-white text-sm font-semibold">{category.name}</p>
            <span className={'text-xs ' + statusColor}>{category.status}</span>
            <span className="text-slate-600 text-xs ml-auto">{doneCount}/{totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: score + '%', backgroundColor: barColor }}
              />
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color: barColor }}>{score}%</span>
          </div>
        </div>
        <span className="text-slate-600 shrink-0 ml-2">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#2e2e4e] pt-3 space-y-2">
          {(category.items || []).map(function(item, i) {
            const priClass = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Medium
            return (
              <div
                key={i}
                className={'flex items-start gap-3 rounded-lg px-3 py-2 ' + (
                  item.done ? 'bg-green-950 border border-green-900' : 'bg-[#0d0d1a] border border-[#2e2e4e]'
                )}
              >
                <div className={'w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ' + (
                  item.done ? 'bg-green-600' : 'bg-[#1e1e2e] border border-slate-600'
                )}>
                  {item.done && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={'text-sm ' + (item.done ? 'line-through text-slate-500' : 'text-white')}>
                    {item.task}
                  </p>
                  {item.notes && (
                    <p className="text-slate-500 text-xs mt-0.5">{item.notes}</p>
                  )}
                </div>
                {item.priority && !item.done && (
                  <span className={'text-xs px-1.5 py-0.5 rounded border shrink-0 ' + priClass}>
                    {item.priority}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LaunchReadiness({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('checklist')
  const [options, setOptions] = useState({
    hasCode: false,
    hasTested: false,
    hasDocs: false,
    hasEnclosure: false,
  })

  async function handleCheck() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await checkLaunchReadiness(idea, components, options)
      setResult(data)
      notify.success('Launch readiness: ' + (data.readinessScore || 0) + '% — ' + (data.verdict || 'assessed'))
    } catch {
      notify.error('Check failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const verdictStyle = result ? (VERDICT_STYLES[result.verdict] || VERDICT_STYLES['Conditional Go']) : null

  const TABS = [
    { id: 'checklist', label: '✅ Checklist' },
    { id: 'blockers', label: '🛑 Blockers' },
    { id: 'nextsteps', label: '🚀 Next Steps' },
  ]

  return (
    <div className="space-y-4">

      {/* Current status options */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Current Status — check what applies</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'hasCode', label: '💻 Code is written' },
            { key: 'hasTested', label: '🧪 Hardware tested' },
            { key: 'hasDocs', label: '📄 Docs written' },
            { key: 'hasEnclosure', label: '🖥️ Has enclosure' },
          ].map(function(opt) {
            return (
              <button
                key={opt.key}
                onClick={function() {
                  setOptions(function(prev) {
                    const next = {}
                    Object.keys(prev).forEach(function(k) { next[k] = prev[k] })
                    next[opt.key] = !prev[opt.key]
                    return next
                  })
                }}
                className={'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition ' + (
                  options[opt.key]
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-[#0d0d1a] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                )}
              >
                <span className={'w-4 h-4 rounded flex items-center justify-center ' + (
                  options[opt.key] ? 'bg-white' : 'bg-[#1e1e2e] border border-slate-600'
                )}>
                  {options[opt.key] && <span className="text-indigo-600 text-xs">✓</span>}
                </span>
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleCheck}
        disabled={loading || components.length === 0}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition disabled:opacity-50"
      >
        {loading ? '🚀 Checking...' : '🚀 Check Launch Readiness'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is evaluating launch readiness...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Verdict banner */}
          <div className={'rounded-2xl border p-5 ' + verdictStyle.bg + ' ' + verdictStyle.border}>
            <div className="flex items-center gap-6">
              <ReadinessGauge score={result.readinessScore || 0} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{verdictStyle.icon}</span>
                  <p className={'font-black text-2xl ' + verdictStyle.color}>{result.verdict}</p>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-2">{result.summary}</p>
                {result.estimatedTimeToLaunch && (
                  <p className="text-slate-400 text-xs">
                    ⏱️ Estimated time to launch: <span className={verdictStyle.color}>{result.estimatedTimeToLaunch}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button
                  key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Checklist tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-2">
              {(result.categories || []).map(function(category, i) {
                return <CategoryCard key={i} category={category} />
              })}
            </div>
          )}

          {/* Blockers tab */}
          {activeTab === 'blockers' && (
            <div className="space-y-3">
              {(result.blockers || []).length > 0 ? (
                <>
                  <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                    <p className="text-red-400 text-xs font-semibold mb-2">
                      🛑 Must fix before launch ({result.blockers.length} blockers)
                    </p>
                    <ul className="space-y-2">
                      {result.blockers.map(function(blocker, i) {
                        return (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-red-400 shrink-0 font-bold">{i + 1}.</span>
                            <p className="text-red-200">{blocker}</p>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {(result.niceToHave || []).length > 0 && (
                    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                      <p className="text-slate-400 text-xs font-semibold mb-2">
                        ✨ Nice to have (optional)
                      </p>
                      <ul className="space-y-1">
                        {result.niceToHave.map(function(item, i) {
                          return (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-slate-500 shrink-0">•</span>
                              <p className="text-slate-400">{item}</p>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-green-950 border border-green-900 rounded-xl">
                  <p className="text-green-400 font-semibold">🎉 No blockers found!</p>
                  <p className="text-green-700 text-xs mt-1">Your prototype appears ready to launch</p>
                </div>
              )}
            </div>
          )}

          {/* Next steps tab */}
          {activeTab === 'nextsteps' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs mb-2">Immediate actions to improve launch readiness</p>
              {(result.nextSteps || []).map(function(step, i) {
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-300 text-sm">{step}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={handleCheck}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Re-check
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🚀</div>
          <p className="text-white font-semibold mb-1">Launch Readiness Checker</p>
          <p className="text-slate-500 text-sm mb-4">
            Get a Go / No-Go verdict with a complete deployment checklist
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Readiness score</span>
            <span>✓ Go/No-Go verdict</span>
            <span>✓ Blocker list</span>
            <span>✓ Next steps</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LaunchReadiness