import { useState } from 'react'
import { generateChallenges, getChallengeProgress, saveChallengeProgress } from '../services/challengeService'
import { notify } from '../services/toast'

const DIFFICULTY_STYLES = {
  Beginner: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', stars: '⭐' },
  Intermediate: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', stars: '⭐⭐' },
  Advanced: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', stars: '⭐⭐⭐' },
  Expert: { color: 'text-purple-400', bg: 'bg-purple-950', border: 'border-purple-800', stars: '⭐⭐⭐⭐' },
}

function ChallengeCard({ challenge, isCompleted, onComplete }) {
  const [showHint, setShowHint] = useState(false)
  const diffStyle = DIFFICULTY_STYLES[challenge.difficulty] || DIFFICULTY_STYLES.Beginner

  return (
    <div className={'border rounded-2xl overflow-hidden transition ' + (
      isCompleted ? 'border-green-800 opacity-75' : diffStyle.border
    )}>
      <div className={'p-4 ' + (isCompleted ? 'bg-green-950' : diffStyle.bg)}>
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0">{challenge.badge || '🎯'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className={'font-bold text-sm ' + (isCompleted ? 'text-green-400 line-through' : 'text-white')}>
                {challenge.title}
              </p>
              {isCompleted && <span className="text-green-400 text-xs">✅ Complete</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className={diffStyle.color}>{diffStyle.stars} {challenge.difficulty}</span>
              <span className="text-yellow-400">+{challenge.xp} XP</span>
              {challenge.timeEstimate && <span className="text-slate-500">⏱️ {challenge.timeEstimate}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#0d0d1a] border-t border-[#2e2e4e] space-y-3">
        <p className="text-slate-300 text-sm">{challenge.description}</p>

        {challenge.skills && challenge.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {challenge.skills.map(function(skill, i) {
              return (
                <span key={i} className="text-xs bg-[#13131f] border border-[#2e2e4e] text-slate-400 px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              )
            })}
          </div>
        )}

        {challenge.hint && (
          <div>
            <button
              onClick={function() { setShowHint(!showHint) }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              {showHint ? '▲ Hide hint' : '💡 Show hint'}
            </button>
            {showHint && (
              <p className="text-slate-400 text-xs mt-1 bg-[#13131f] rounded-lg p-2">{challenge.hint}</p>
            )}
          </div>
        )}

        {!isCompleted && (
          <button
            onClick={function() { onComplete(challenge.id, challenge.xp) }}
            className={'w-full py-2 rounded-xl text-xs font-semibold transition ' + diffStyle.bg + ' ' + diffStyle.color + ' border ' + diffStyle.border + ' hover:opacity-80'}
          >
            ✓ Mark Complete (+{challenge.xp} XP)
          </button>
        )}
      </div>
    </div>
  )
}

function ChallengeGenerator({ idea, components }) {
  const saved = getChallengeProgress(idea)
  const [challenges, setChallenges] = useState(saved.challenges)
  const [completed, setCompleted] = useState(saved.completed || {})
  const [loading, setLoading] = useState(false)
  const [totalXP, setTotalXP] = useState(
    Object.values(saved.completed || {}).reduce(function(sum, v) { return sum + (v || 0) }, 0)
  )

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await generateChallenges(idea, components)
      setChallenges(data.challenges)
      setCompleted({})
      setTotalXP(0)
      saveChallengeProgress(idea, { challenges: data.challenges, completed: {} })
      notify.success(data.challenges?.length + ' challenges generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleComplete(challengeId, xp) {
    const newCompleted = Object.assign({}, completed, { [challengeId]: xp })
    setCompleted(newCompleted)
    const newXP = totalXP + (xp || 0)
    setTotalXP(newXP)
    saveChallengeProgress(idea, { challenges, completed: newCompleted })
    notify.success('+' + xp + ' XP earned! Challenge complete!')
  }

  const completedCount = Object.keys(completed).length
  const totalChallenges = (challenges || []).length
  const allDone = totalChallenges > 0 && completedCount === totalChallenges

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate upgrade challenges to level up your prototype skills</p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🎯 Creating...' : '🎯 Generate Challenges'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Creating challenges...</p>
        </div>
      )}

      {challenges && !loading && (
        <>
          {/* Progress */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-bold">{completedCount}/{totalChallenges} Challenges</p>
              <span className="text-yellow-400 font-bold">🏆 {totalXP} XP</span>
            </div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-2">
              <div
                className="h-2 bg-orange-600 rounded-full transition-all"
                style={{ width: (completedCount / Math.max(totalChallenges, 1) * 100) + '%' }}
              />
            </div>
          </div>

          {allDone && (
            <div className="bg-yellow-950 border border-yellow-700 rounded-2xl p-4 text-center">
              <p className="text-4xl mb-2">🏆</p>
              <p className="text-yellow-400 font-black text-lg">All Challenges Complete!</p>
              <p className="text-slate-400 text-sm">You earned {totalXP} XP — amazing work!</p>
            </div>
          )}

          <div className="space-y-3">
            {challenges.map(function(challenge) {
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isCompleted={!!completed[challenge.id]}
                  onComplete={handleComplete}
                />
              )
            })}
          </div>

          <button onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ New Challenges
          </button>
        </>
      )}

      {!challenges && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-white font-semibold mb-1">Challenge Generator</p>
          <p className="text-slate-500 text-sm">Generate upgrade challenges to level up your prototype skills</p>
        </div>
      )}
    </div>
  )
}

export default ChallengeGenerator