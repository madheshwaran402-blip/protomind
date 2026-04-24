import { useState } from 'react'
import { compareComponents } from '../services/componentComparison'
import { notify } from '../services/toast'

const DIFFICULTY_COLORS = {
  Beginner: 'text-green-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-red-400',
  Expert: 'text-purple-400',
}

function ScoreBar({ score, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: score + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

function CompCard({ comp, data, isWinner, color }) {
  if (!data) return null

  return (
    <div className={`flex-1 rounded-2xl border p-5 ${
      isWinner ? 'border-indigo-600 bg-indigo-950' : 'border-[#2e2e4e] bg-[#13131f]'
    }`}>
      {isWinner && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-400 text-lg">🏆</span>
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wide">Recommended</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{comp.icon}</span>
        <div>
          <p className="text-white font-bold text-sm">{data.name}</p>
          <p className="text-slate-500 text-xs">{comp.category}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-1">Overall Score</p>
        <ScoreBar score={data.score} color={color} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-[#0d0d1a] rounded-lg p-2">
          <p className="text-slate-600 mb-0.5">Voltage</p>
          <p className="text-white font-medium">{data.voltage || 'N/A'}</p>
        </div>
        <div className="bg-[#0d0d1a] rounded-lg p-2">
          <p className="text-slate-600 mb-0.5">Current</p>
          <p className="text-white font-medium">{data.current || 'N/A'}</p>
        </div>
        <div className="bg-[#0d0d1a] rounded-lg p-2">
          <p className="text-slate-600 mb-0.5">Price</p>
          <p className="text-white font-medium">{data.price || 'N/A'}</p>
        </div>
        <div className="bg-[#0d0d1a] rounded-lg p-2">
          <p className="text-slate-600 mb-0.5">Difficulty</p>
          <p className={`font-medium ${DIFFICULTY_COLORS[data.difficulty] || 'text-white'}`}>
            {data.difficulty || 'N/A'}
          </p>
        </div>
      </div>

      {data.bestFor && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Best For</p>
          <p className="text-white text-xs leading-relaxed">{data.bestFor}</p>
        </div>
      )}

      {data.pros?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-green-500 font-semibold mb-1">✓ Pros</p>
          <ul className="space-y-1">
            {data.pros.map((pro, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                <span className="text-green-500 shrink-0">+</span> {pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.cons?.length > 0 && (
        <div>
          <p className="text-xs text-red-500 font-semibold mb-1">✗ Cons</p>
          <ul className="space-y-1">
            {data.cons.map((con, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-1">
                <span className="text-red-500 shrink-0">-</span> {con}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ComponentComparison({ components, idea }) {
  const [comp1Index, setComp1Index] = useState(0)
  const [comp2Index, setComp2Index] = useState(Math.min(1, components.length - 1))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleCompare() {
    if (comp1Index === comp2Index) {
      notify.warning('Please select two different components')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await compareComponents(
        components[comp1Index],
        components[comp2Index],
        idea
      )
      setResult(data)
      notify.success('Comparison complete!')
    } catch {
      notify.error('Comparison failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const comp1 = components[comp1Index]
  const comp2 = components[comp2Index]

  const CATEGORIES = ['performance', 'power', 'price', 'ease', 'availability']
  const CAT_LABELS = {
    performance: '⚡ Performance',
    power: '🔋 Power',
    price: '💰 Price',
    ease: '😊 Ease of Use',
    availability: '🛒 Availability',
  }

  return (
    <div className="space-y-4">

      {components.length < 2 ? (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl text-slate-500 text-sm">
          Add at least 2 components to use the comparison tool
        </div>
      ) : (
        <>
          {/* Component selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Component A</p>
              <select
                value={comp1Index}
                onChange={e => { setComp1Index(Number(e.target.value)); setResult(null) }}
                className="w-full bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-xl px-3 py-2.5 outline-none"
              >
                {components.map((comp, i) => (
                  <option key={comp.id} value={i}>{comp.icon} {comp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Component B</p>
              <select
                value={comp2Index}
                onChange={e => { setComp2Index(Number(e.target.value)); setResult(null) }}
                className="w-full bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-xl px-3 py-2.5 outline-none"
              >
                {components.map((comp, i) => (
                  <option key={comp.id} value={i}>{comp.icon} {comp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* VS display */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-2">
              <span className="text-xl">{comp1?.icon}</span>
              <span className="text-white text-xs font-medium truncate">{comp1?.name}</span>
            </div>
            <div className="text-slate-500 font-black text-lg shrink-0">VS</div>
            <div className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-2">
              <span className="text-xl">{comp2?.icon}</span>
              <span className="text-white text-xs font-medium truncate">{comp2?.name}</span>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading || comp1Index === comp2Index}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? '⚖️ Comparing...' : '⚖️ Compare Components'}
          </button>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">AI is analysing both components...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">

              {/* Summary */}
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <p className="text-slate-400 text-xs leading-relaxed">{result.comparisonSummary}</p>
              </div>

              {/* Side by side cards */}
              <div className="flex gap-3">
                <CompCard
                  comp={comp1}
                  data={result.component1}
                  isWinner={result.recommendation === result.component1?.name}
                  color="#6366f1"
                />
                <CompCard
                  comp={comp2}
                  data={result.component2}
                  isWinner={result.recommendation === result.component2?.name}
                  color="#0ea5e9"
                />
              </div>

              {/* Category winners */}
              {result.winnerCategory && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Category Winners
                  </h4>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => {
                      const winner = result.winnerCategory[cat]
                      const winnerName = winner === 1 ? result.component1?.name : result.component2?.name
                      const winnerColor = winner === 1 ? '#6366f1' : '#0ea5e9'
                      return (
                        <div key={cat} className="flex items-center justify-between">
                          <p className="text-xs text-slate-500">{CAT_LABELS[cat]}</p>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: winnerColor + '20',
                              color: winnerColor,
                            }}
                          >
                            {winnerName}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Final recommendation */}
              <div className="bg-yellow-950 border border-yellow-900 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-400 mb-1">
                  🏆 Final Recommendation: {result.recommendation}
                </p>
                <p className="text-yellow-100 text-sm leading-relaxed">{result.reason}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ComponentComparison