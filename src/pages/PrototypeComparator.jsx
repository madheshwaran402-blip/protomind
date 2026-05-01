import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects } from '../services/storage'
import { comparePrototypes } from '../services/comparatorService'
import { notify } from '../services/toast'

const SCORE_LABELS = {
  complexity: { label: 'Complexity', icon: '🧩', desc: 'How complex the circuit is (higher = simpler)' },
  cost: { label: 'Cost Efficiency', icon: '💰', desc: 'Lower cost scores higher' },
  power: { label: 'Power Efficiency', icon: '⚡', desc: 'Lower power consumption scores higher' },
  scalability: { label: 'Scalability', icon: '📈', desc: 'How easily the design can be expanded' },
  beginner_friendly: { label: 'Beginner Friendly', icon: '🎓', desc: 'How easy it is to build for beginners' },
}

function ScoreBar({ score, color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: score + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-7 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

function ProtoCard({ project, label, color, isWinner }) {
  if (!project) return (
    <div className="flex-1 bg-[#13131f] border-2 border-dashed border-[#2e2e4e] rounded-2xl p-5 flex items-center justify-center min-h-40">
      <p className="text-slate-600 text-sm">Select Prototype {label}</p>
    </div>
  )

  return (
    <div
      className={`flex-1 rounded-2xl p-5 border-2 transition ${
        isWinner ? 'border-yellow-600 bg-yellow-950 bg-opacity-20' : 'border-[#2e2e4e] bg-[#13131f]'
      }`}
    >
      {isWinner && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400">🏆</span>
          <span className="text-yellow-400 text-xs font-bold uppercase">Winner</span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
          style={{ backgroundColor: color + '20', color }}
        >
          {label}
        </div>
        <p className="text-slate-500 text-xs">Prototype {label}</p>
      </div>
      <p className="text-white text-sm font-semibold leading-relaxed mb-3 line-clamp-2">{project.idea}</p>
      <div className="flex flex-wrap gap-1">
        {(project.components || []).slice(0, 4).map((comp, i) => (
          <span key={i} className="text-xs bg-[#0d0d1a] text-slate-400 px-2 py-0.5 rounded-full">
            {comp.icon} {comp.name?.split(' ')[0]}
          </span>
        ))}
        {(project.components || []).length > 4 && (
          <span className="text-xs text-slate-600">+{project.components.length - 4}</span>
        )}
      </div>
    </div>
  )
}

function PrototypeComparator() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [proto1Id, setProto1Id] = useState('')
  const [proto2Id, setProto2Id] = useState('')
  const [useCase, setUseCase] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const all = getAllProjects()
    setProjects(all)
    if (all.length >= 1) setProto1Id(all[0].id)
    if (all.length >= 2) setProto2Id(all[1].id)
  }, [])

  const proto1 = projects.find(p => p.id === proto1Id)
  const proto2 = projects.find(p => p.id === proto2Id)

  async function handleCompare() {
    if (!proto1 || !proto2) {
      notify.warning('Please select two prototypes')
      return
    }
    if (proto1Id === proto2Id) {
      notify.warning('Please select two different prototypes')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await comparePrototypes(proto1, proto2, useCase)
      setResult(data)
      notify.success('Comparison complete!')
    } catch {
      notify.error('Comparison failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const winnerProto = result?.winner === 'A' ? proto1 : proto2
  const colors = { A: '#6366f1', B: '#0ea5e9' }

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">⚖️ Prototype Comparator</h2>
          <p className="text-slate-400 text-sm">Compare two of your prototypes side by side with AI analysis</p>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
        >
          📂 History →
        </button>
      </div>

      {projects.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <h3 className="text-xl font-semibold mb-2">Need at least 2 saved prototypes</h3>
          <p className="text-slate-500 text-sm mb-6">Build and save more prototypes to use the comparator</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            ⚡ Build a Prototype
          </button>
        </div>
      ) : (
        <>
          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Prototype A</p>
              <select
                value={proto1Id}
                onChange={e => { setProto1Id(e.target.value); setResult(null) }}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.thumbnail} {p.idea.slice(0, 45)}...</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Prototype B</p>
              <select
                value={proto2Id}
                onChange={e => { setProto2Id(e.target.value); setResult(null) }}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.thumbnail} {p.idea.slice(0, 45)}...</option>
                ))}
              </select>
            </div>
          </div>

          {/* Use case input */}
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">What are you optimising for? (optional)</p>
            <input
              value={useCase}
              onChange={e => setUseCase(e.target.value)}
              placeholder="e.g. battery powered outdoor use, beginner school project, low cost production..."
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          {/* Proto cards preview */}
          <div className="flex gap-3 mb-4">
            <ProtoCard
              project={proto1}
              label="A"
              color={colors.A}
              isWinner={result?.winner === 'A'}
            />
            <div className="flex items-center shrink-0">
              <div className="text-slate-600 font-black text-xl">VS</div>
            </div>
            <ProtoCard
              project={proto2}
              label="B"
              color={colors.B}
              isWinner={result?.winner === 'B'}
            />
          </div>

          {/* Compare button */}
          <button
            onClick={handleCompare}
            disabled={loading || proto1Id === proto2Id || !proto1 || !proto2}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50 mb-4"
          >
            {loading ? '⚖️ Comparing...' : '⚖️ Compare with AI'}
          </button>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">AI is comparing your prototypes...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">

              {/* Winner banner */}
              <div className="bg-gradient-to-br from-yellow-950 to-[#13131f] border border-yellow-800 rounded-2xl p-5 flex items-center gap-4">
                <span className="text-5xl">🏆</span>
                <div className="flex-1">
                  <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-1">
                    AI Recommendation — {result.confidence}% confident
                  </p>
                  <p className="text-white font-bold text-base mb-1">{result.verdict}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{result.reasoning}</p>
                </div>
              </div>

              {/* Scores comparison */}
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Score Comparison</h3>
                <div className="space-y-4">
                  {Object.entries(SCORE_LABELS).map(([key, meta]) => {
                    const scoreA = result.scores?.A?.[key] || 0
                    const scoreB = result.scores?.B?.[key] || 0
                    const winner = result.categoryWinners?.[key]
                    return (
                      <div key={key}>
                        <div className="flex items-center gap-2 mb-2">
                          <span>{meta.icon}</span>
                          <p className="text-slate-400 text-xs">{meta.label}</p>
                          {winner && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full ml-auto font-semibold"
                              style={{
                                backgroundColor: (winner === 'A' ? colors.A : colors.B) + '20',
                                color: winner === 'A' ? colors.A : colors.B,
                              }}
                            >
                              {winner} wins
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs w-4 font-bold" style={{ color: colors.A }}>A</span>
                            <ScoreBar score={scoreA} color={colors.A} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs w-4 font-bold" style={{ color: colors.B }}>B</span>
                            <ScoreBar score={scoreB} color={colors.B} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Component overlap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.sharedComponents?.length > 0 && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">🤝 Shared</p>
                    <div className="space-y-1">
                      {result.sharedComponents.map((comp, i) => (
                        <p key={i} className="text-slate-300 text-xs">• {comp}</p>
                      ))}
                    </div>
                  </div>
                )}
                {result.uniqueToA?.length > 0 && (
                  <div className="bg-[#13131f] border border-indigo-900 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: colors.A }}>
                      Only in A
                    </p>
                    <div className="space-y-1">
                      {result.uniqueToA.map((comp, i) => (
                        <p key={i} className="text-slate-300 text-xs">• {comp}</p>
                      ))}
                    </div>
                  </div>
                )}
                {result.uniqueToB?.length > 0 && (
                  <div className="bg-[#13131f] border border-sky-900 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: colors.B }}>
                      Only in B
                    </p>
                    <div className="space-y-1">
                      {result.uniqueToB.map((comp, i) => (
                        <p key={i} className="text-slate-300 text-xs">• {comp}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Final recommendation */}
              {result.recommendation && (
                <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-1">💡 When to Choose Which</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.recommendation}</p>
                </div>
              )}

              {/* Load buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/viewer', { state: { idea: proto1.idea, selectedComponents: proto1.components } })}
                  className="py-2.5 rounded-xl text-xs font-semibold transition"
                  style={{ backgroundColor: colors.A + '20', color: colors.A, border: '1px solid ' + colors.A + '40' }}
                >
                  Load Prototype A →
                </button>
                <button
                  onClick={() => navigate('/viewer', { state: { idea: proto2.idea, selectedComponents: proto2.components } })}
                  className="py-2.5 rounded-xl text-xs font-semibold transition"
                  style={{ backgroundColor: colors.B + '20', color: colors.B, border: '1px solid ' + colors.B + '40' }}
                >
                  Load Prototype B →
                </button>
              </div>

              <button
                onClick={handleCompare}
                className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
              >
                ↺ Re-compare
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PrototypeComparator