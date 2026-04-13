import { useState } from 'react'
import { comparePrototypes } from '../services/prototypeComparison'
import { analyseIdea } from '../services/claude'
import { notify } from '../services/toast'

const SCORE_LABELS = {
  cost: { label: 'Cost Efficiency', icon: '💰' },
  complexity: { label: 'Build Complexity', icon: '🔧' },
  reliability: { label: 'Reliability', icon: '🛡️' },
  performance: { label: 'Performance', icon: '⚡' },
  beginner: { label: 'Beginner Friendly', icon: '🌱' },
}

function ScoreBar({ score, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: (score * 10) + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

function PrototypeComparison({ idea, currentComponents }) {
  const [comparing, setComparing] = useState(false)
  const [result, setResult] = useState(null)
  const [altComponents, setAltComponents] = useState(null)
  const [loadingAlt, setLoadingAlt] = useState(false)
  const [altGenerated, setAltGenerated] = useState(false)

  async function generateAlternative() {
    setLoadingAlt(true)
    try {
      const alt = await analyseIdea(idea + ' using alternative components, avoid: ' + currentComponents.map(c => c.name).join(', '))
      setAltComponents(alt)
      setAltGenerated(true)
      notify.success('Alternative prototype generated!')
    } catch {
      notify.error('Could not generate alternative — is Ollama running?')
    } finally {
      setLoadingAlt(false)
    }
  }

  async function handleCompare() {
    if (!altComponents) return
    setComparing(true)
    setResult(null)
    try {
      const data = await comparePrototypes(idea, currentComponents, altComponents)
      setResult(data)
      notify.success('Comparison complete — Prototype ' + data.winner + ' wins!')
    } catch {
      notify.error('Comparison failed — is Ollama running?')
    } finally {
      setComparing(false)
    }
  }

  const colorA = '#6366f1'
  const colorB = '#0ea5e9'

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">⚖️ Prototype Comparison</h3>
        <p className="text-slate-500 text-xs mt-0.5">
          Compare your current prototype against an AI-generated alternative approach
        </p>
      </div>

      {/* Step 1 - Generate alternative */}
      {!altGenerated && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-5 mb-4 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-white font-semibold mb-1">Generate Alternative Prototype</p>
          <p className="text-slate-500 text-sm mb-4">
            AI will create a different component approach for the same idea
          </p>
          <button
            onClick={generateAlternative}
            disabled={loadingAlt}
            className="px-6 py-2.5 bg-sky-700 hover:bg-sky-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loadingAlt ? '🤖 Generating alternative...' : '🤖 Generate Alternative'}
          </button>
        </div>
      )}

      {/* Both prototypes side by side */}
      {altGenerated && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Prototype A - Current */}
            <div className="bg-[#13131f] border-2 rounded-xl p-4" style={{ borderColor: colorA }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: colorA }}>A</div>
                <div>
                  <p className="text-white text-sm font-semibold">Your Prototype</p>
                  <p className="text-slate-500 text-xs">{currentComponents.length} components</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {currentComponents.slice(0, 5).map((comp, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{comp.icon}</span>
                    <span className="truncate">{comp.name}</span>
                  </div>
                ))}
                {currentComponents.length > 5 && (
                  <p className="text-xs text-slate-600">+{currentComponents.length - 5} more</p>
                )}
              </div>
            </div>

            {/* Prototype B - Alternative */}
            <div className="bg-[#13131f] border-2 rounded-xl p-4" style={{ borderColor: colorB }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: colorB }}>B</div>
                <div>
                  <p className="text-white text-sm font-semibold">AI Alternative</p>
                  <p className="text-slate-500 text-xs">{altComponents?.length} components</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {altComponents?.slice(0, 5).map((comp, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{comp.icon}</span>
                    <span className="truncate">{comp.name}</span>
                  </div>
                ))}
                {altComponents?.length > 5 && (
                  <p className="text-xs text-slate-600">+{altComponents.length - 5} more</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={comparing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50 mb-4"
          >
            {comparing ? '⚖️ Comparing...' : '⚖️ Compare Both Prototypes'}
          </button>
        </>
      )}

      {comparing && (
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is analysing both approaches...</p>
        </div>
      )}

      {result && !comparing && (
        <div className="space-y-4">

          {/* Winner banner */}
          <div className={`rounded-xl border p-4 flex items-center gap-4 ${
            result.winner === 'A'
              ? 'bg-indigo-950 border-indigo-800'
              : 'bg-sky-950 border-sky-800'
          }`}>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black text-white shrink-0"
              style={{ backgroundColor: result.winner === 'A' ? colorA : colorB }}
            >
              {result.winner}
            </div>
            <div>
              <p className="text-white font-bold">
                Prototype {result.winner} Wins! 🏆
              </p>
              <p className="text-slate-300 text-sm">{result.verdict}</p>
            </div>
          </div>

          {/* Score comparison */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Score Comparison
            </h4>
            <div className="space-y-4">
              {Object.entries(SCORE_LABELS).map(([key, label]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">
                      {label.icon} {label.label}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-4" style={{ color: colorA }}>A</span>
                      <ScoreBar score={result.scores.A[key]} color={colorA} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-4" style={{ color: colorB }}>B</span>
                      <ScoreBar score={result.scores.B[key]} color={colorB} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis A vs B */}
          <div className="grid grid-cols-2 gap-4">
            {['A', 'B'].map(proto => {
              const color = proto === 'A' ? colorA : colorB
              const analysis = result.analysis[proto]
              return (
                <div key={proto} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: color }}>
                      {proto}
                    </div>
                    <span className="text-white text-sm font-semibold">
                      {proto === 'A' ? 'Your Prototype' : 'AI Alternative'}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-400 font-semibold mb-1">Est. cost: {analysis?.estimatedCost}</p>
                  <p className="text-xs text-slate-500 mb-3">Best for: {analysis?.bestFor}</p>

                  <div className="space-y-2 mb-3">
                    {analysis?.pros?.map((pro, i) => (
                      <p key={i} className="text-xs text-slate-300 flex items-start gap-1">
                        <span className="text-green-500 shrink-0">+</span>{pro}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {analysis?.cons?.map((con, i) => (
                      <p key={i} className="text-xs text-slate-400 flex items-start gap-1">
                        <span className="text-red-500 shrink-0">-</span>{con}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recommendation */}
          <div className="bg-indigo-950 border border-indigo-900 rounded-xl px-4 py-3">
            <p className="text-indigo-300 text-sm">
              💡 <span className="font-semibold text-white">
                Recommendation: Go with Prototype {result.recommendation}
              </span>
            </p>
          </div>

          <button
            onClick={() => {
              setResult(null)
              setAltComponents(null)
              setAltGenerated(false)
            }}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Start new comparison
          </button>
        </div>
      )}
    </div>
  )
}

export default PrototypeComparison