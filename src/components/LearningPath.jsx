import { useState } from 'react'
import { generateLearningPath, saveLearningPath, getLearningPath } from '../services/learningPathService'
import { notify } from '../services/toast'

const SKILL_LEVELS = [
  { value: 'Complete Beginner', icon: '🌱', desc: 'Never built electronics before' },
  { value: 'Beginner', icon: '📗', desc: 'Basic LED/button projects done' },
  { value: 'Intermediate', icon: '📘', desc: 'Completed several Arduino projects' },
  { value: 'Advanced', icon: '📙', desc: 'Comfortable with PCB and protocols' },
]

const PHASE_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7']

function LearningPath({ idea, components }) {
  const [path, setPath] = useState(getLearningPath(idea))
  const [skillLevel, setSkillLevel] = useState('Beginner')
  const [loading, setLoading] = useState(false)
  const [completedTopics, setCompletedTopics] = useState({})
  const [expandedPhase, setExpandedPhase] = useState(0)

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await generateLearningPath(idea, components, skillLevel)
      setPath(data)
      saveLearningPath(idea, data)
      setCompletedTopics({})
      notify.success('Learning path created — ' + data.totalWeeks + ' weeks!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function toggleTopic(phaseIdx, topicIdx) {
    const key = phaseIdx + '_' + topicIdx
    setCompletedTopics(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = !next[key]
      return next
    })
  }

  const allTopics = (path?.phases || []).flatMap(function(p, pi) {
    return (p.topics || []).map(function(t, ti) { return pi + '_' + ti })
  })

  const completedCount = Object.values(completedTopics).filter(Boolean).length
  const totalXP = (path?.phases || []).flatMap(function(p) { return p.topics || [] })
    .filter(function(t, i) {
      const key = Math.floor(i / 10) + '_' + (i % 10)
      return completedTopics[key]
    })
    .reduce(function(sum, t) { return sum + (t.xp || 0) }, 0)

  return (
    <div className="space-y-4">
      {/* Skill level selector */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Your Skill Level</p>
        <div className="grid grid-cols-2 gap-2">
          {SKILL_LEVELS.map(function(level) {
            const isSel = skillLevel === level.value
            return (
              <button
                key={level.value}
                onClick={function() { setSkillLevel(level.value) }}
                className={'p-3 rounded-xl border text-left transition ' + (
                  isSel ? 'bg-indigo-950 border-indigo-700' : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-700'
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span>{level.icon}</span>
                  <p className={'text-xs font-semibold ' + (isSel ? 'text-white' : 'text-slate-400')}>{level.value}</p>
                </div>
                <p className="text-slate-600 text-xs">{level.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || components.length === 0}
        className="w-full py-3 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? '📚 Building...' : '📚 Generate Learning Path'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Creating your learning path...</p>
        </div>
      )}

      {path && !loading && (
        <>
          {/* Header */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <p className="text-white font-black text-lg mb-1">{path.pathTitle}</p>
            <div className="flex items-center gap-4 text-sm mb-3">
              <span className="text-slate-400">📅 {path.totalWeeks} weeks</span>
              <span className="text-yellow-400">🏆 {totalXP} XP earned</span>
              <span className="text-indigo-400">{completedCount}/{allTopics.length} topics</span>
            </div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-2">
              <div className="h-2 bg-green-600 rounded-full transition-all"
                style={{ width: (completedCount / Math.max(allTopics.length, 1) * 100) + '%' }} />
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-2">
            {(path.phases || []).map(function(phase, phaseIdx) {
              const color = PHASE_COLORS[phaseIdx % PHASE_COLORS.length]
              const phaseTopics = phase.topics || []
              const phaseDone = phaseTopics.filter(function(_, ti) {
                return completedTopics[phaseIdx + '_' + ti]
              }).length
              const isExpanded = expandedPhase === phaseIdx

              return (
                <div key={phaseIdx} className="rounded-xl border overflow-hidden"
                  style={{ borderColor: color + '40' }}>
                  <button
                    onClick={function() { setExpandedPhase(isExpanded ? -1 : phaseIdx) }}
                    className="w-full flex items-center gap-3 p-4 text-left hover:opacity-90 transition"
                    style={{ backgroundColor: color + '15' }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 text-white"
                      style={{ backgroundColor: color }}>
                      {phase.phase}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{phase.title}</p>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <span>{phase.weeks} weeks</span>
                        <span>{phaseDone}/{phaseTopics.length} done</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-[#1e1e2e] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: (phaseDone / Math.max(phaseTopics.length, 1) * 100) + '%', backgroundColor: color }} />
                      </div>
                      <span className="text-slate-600">{isExpanded ? '↑' : '↓'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-[#0d0d1a] border-t space-y-3" style={{ borderColor: color + '30' }}>
                      {phaseTopics.map(function(topic, topicIdx) {
                        const key = phaseIdx + '_' + topicIdx
                        const done = !!completedTopics[key]
                        return (
                          <div key={topicIdx} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                            <div className="flex items-start gap-3 mb-2">
                              <button
                                onClick={function() { toggleTopic(phaseIdx, topicIdx) }}
                                className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition ' + (
                                  done ? 'border-green-500 bg-green-600' : 'border-[#2e2e4e]'
                                )}
                              >
                                {done && <span className="text-white text-xs">✓</span>}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={'text-sm font-semibold ' + (done ? 'text-slate-500 line-through' : 'text-white')}>
                                    {topic.title}
                                  </p>
                                  {topic.xp && (
                                    <span className="text-yellow-400 text-xs ml-auto">+{topic.xp} XP</span>
                                  )}
                                </div>
                                <p className="text-slate-400 text-xs mt-0.5">{topic.description}</p>
                              </div>
                            </div>
                            {topic.resources && topic.resources.length > 0 && (
                              <div className="ml-8">
                                <p className="text-xs text-slate-500 mb-1">📚 Resources:</p>
                                <ul className="space-y-0.5">
                                  {topic.resources.map(function(res, ri) {
                                    return <li key={ri} className="text-xs text-indigo-400">→ {res}</li>
                                  })}
                                </ul>
                              </div>
                            )}
                            {topic.project && (
                              <div className="ml-8 mt-2 bg-indigo-950 border border-indigo-900 rounded-lg p-2">
                                <p className="text-indigo-400 text-xs">🔧 Mini project: {topic.project}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Regenerate Path
          </button>
        </>
      )}

      {!path && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-white font-semibold mb-1">Learning Path Generator</p>
          <p className="text-slate-500 text-sm">Get a personalised learning roadmap based on your skill level</p>
        </div>
      )}
    </div>
  )
}

export default LearningPath