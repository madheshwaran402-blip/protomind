import { useState } from 'react'
import { suggestImprovements } from '../services/improvementSuggester'
import { notify } from '../services/toast'

const IMPACT_COLORS = {
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-900' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-900' },
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-900' },
}

const EFFORT_COLORS = {
  Low: { color: 'text-green-400', bg: 'bg-green-950' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950' },
  High: { color: 'text-red-400', bg: 'bg-red-950' },
}

const CATEGORY_ICONS = {
  Feature: '✨',
  Power: '⚡',
  Performance: '🚀',
  Cost: '💰',
  Safety: '🛡️',
  Connectivity: '📡',
  Display: '🖥️',
  Storage: '💾',
}

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#1e1e2e" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-black" style={{ color }}>{score}</p>
        <p className="text-slate-600 text-xs">/ 100</p>
      </div>
    </div>
  )
}

function ImprovementCard({ improvement, index }) {
  const [expanded, setExpanded] = useState(false)
  const impact = IMPACT_COLORS[improvement.impact] || IMPACT_COLORS.Medium
  const effort = EFFORT_COLORS[improvement.effort] || EFFORT_COLORS.Medium

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">{CATEGORY_ICONS[improvement.category] || '🔧'}</span>
            <p className="text-white text-sm font-semibold">{improvement.title}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${impact.color} ${impact.bg} ${impact.border}`}>
              {improvement.impact} Impact
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${effort.color} ${effort.bg}`}>
              {improvement.effort} Effort
            </span>
            {improvement.estimatedCost && (
              <span className="text-xs text-emerald-400">{improvement.estimatedCost}</span>
            )}
          </div>
        </div>
        <span className="text-slate-600 shrink-0">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#2e2e4e] pt-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Current Issue</p>
            <p className="text-red-300 text-xs leading-relaxed">{improvement.currentIssue}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Suggested Fix</p>
            <p className="text-slate-300 text-sm leading-relaxed">{improvement.description}</p>
          </div>
          {improvement.suggestedComponent && (
            <div className="flex items-center gap-2 bg-indigo-950 border border-indigo-900 rounded-lg px-3 py-2">
              <span className="text-indigo-400 text-xs font-semibold">Suggested:</span>
              <span className="text-white text-xs">{improvement.suggestedComponent}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ImprovementSuggester({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('improvements')

  async function handleAnalyse() {
    setLoading(true)
    setResult(null)
    try {
      const data = await suggestImprovements(idea, components)
      setResult(data)
      notify.success('Analysis complete! Found ' + (data.improvements?.length || 0) + ' improvements')
    } catch {
      notify.error('Analysis failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'improvements', label: '🔧 Improvements' },
    { id: 'quickwins', label: '⚡ Quick Wins' },
    { id: 'optimize', label: '💰 Optimize' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI analyses your prototype and suggests ranked improvements
        </p>
        <button
          onClick={handleAnalyse}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🔍 Analysing...' : '🔍 Analyse Prototype'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is reviewing your prototype...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Score + verdict */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-5 flex items-center gap-6">
            <ScoreCircle score={result.overallScore || 70} />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Prototype Score</p>
              <p className="text-white font-bold text-lg mb-1">{result.verdict}</p>
              <p className="text-slate-500 text-xs">
                {result.improvements?.length || 0} improvements · {result.quickWins?.length || 0} quick wins
              </p>
            </div>
          </div>

          {/* Missing essentials */}
          {result.missingEssentials?.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2">
                ⚠️ Missing Essentials
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingEssentials.map((item, i) => (
                  <span key={i} className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-lg">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(tab => (
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
          </div>

          {/* Improvements tab */}
          {activeTab === 'improvements' && (
            <div className="space-y-2">
              {result.improvements?.length > 0 ? (
                result.improvements
                  .sort((a, b) => (a.priority || 99) - (b.priority || 99))
                  .map((imp, i) => (
                    <ImprovementCard key={imp.id || i} improvement={imp} index={i} />
                  ))
              ) : (
                <p className="text-slate-600 text-sm text-center py-6">No improvements found</p>
              )}
            </div>
          )}

          {/* Quick wins tab */}
          {activeTab === 'quickwins' && (
            <div className="space-y-3">
              {result.quickWins?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    ⚡ Quick Wins — Easy improvements you can do now
                  </h4>
                  <ul className="space-y-2">
                    {result.quickWins.map((win, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400 text-xs mt-0.5 shrink-0">✓</span>
                        <p className="text-slate-300 text-sm">{win}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.performanceUpgrades?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    🚀 Performance Upgrades
                  </h4>
                  <ul className="space-y-2">
                    {result.performanceUpgrades.map((upgrade, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 text-xs mt-0.5 shrink-0">→</span>
                        <p className="text-slate-300 text-sm">{upgrade}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Optimize tab */}
          {activeTab === 'optimize' && (
            <div className="space-y-3">
              {result.costOptimizations?.length > 0 && (
                <div className="bg-emerald-950 border border-emerald-900 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-3">
                    💰 Cost Optimizations
                  </h4>
                  <ul className="space-y-2">
                    {result.costOptimizations.map((opt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 text-xs mt-0.5 shrink-0">$</span>
                        <p className="text-emerald-100 text-sm">{opt}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleAnalyse}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Re-analyse
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-white font-semibold mb-1">AI Prototype Reviewer</p>
          <p className="text-slate-500 text-sm mb-4">Get ranked improvement suggestions for your prototype</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600">
            <span>✓ Ranked by impact</span>
            <span>✓ Cost estimates</span>
            <span>✓ Quick wins</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImprovementSuggester