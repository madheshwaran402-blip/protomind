import { useState } from 'react'
import { estimateDifficulty } from '../services/difficultyEstimator'
import { notify } from '../services/toast'

const DIFFICULTY_CONFIG = {
  Beginner: {
    color: '#22c55e',
    bg: '#14293d',
    border: '#166534',
    icon: '🌱',
    desc: 'Perfect for first-time builders',
  },
  Intermediate: {
    color: '#f59e0b',
    bg: '#2d2000',
    border: '#92400e',
    icon: '⚡',
    desc: 'Some electronics experience needed',
  },
  Advanced: {
    color: '#ef4444',
    bg: '#2d1b1b',
    border: '#991b1b',
    icon: '🔥',
    desc: 'Significant experience required',
  },
  Expert: {
    color: '#a855f7',
    bg: '#1f1635',
    border: '#6b21a8',
    icon: '💎',
    desc: 'Professional-level build',
  },
}

function DifficultyMeter({ score }) {
  return (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full transition"
          style={{
            backgroundColor: i <= score
              ? (score === 1 ? '#22c55e' : score === 2 ? '#f59e0b' : score === 3 ? '#ef4444' : '#a855f7')
              : '#1e1e2e',
          }}
        />
      ))}
      <span className="text-xs text-slate-500 ml-1 shrink-0">
        {score}/4
      </span>
    </div>
  )
}

function BuildStep({ step, isLast }) {
  const diffColors = {
    Easy: 'text-green-400 bg-green-950 border-green-900',
    Medium: 'text-yellow-400 bg-yellow-950 border-yellow-900',
    Hard: 'text-red-400 bg-red-950 border-red-900',
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {step.step}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-[#2e2e4e] mt-1" />}
      </div>
      <div className={`pb-4 flex-1 ${isLast ? '' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white text-sm font-medium">{step.title}</p>
          {step.difficulty && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${diffColors[step.difficulty] || diffColors.Medium}`}>
              {step.difficulty}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-xs">⏱ {step.duration}</p>
      </div>
    </div>
  )
}

function DifficultyPanel({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [showTools, setShowTools] = useState(false)

  async function handleEstimate() {
    setLoading(true)
    setResult(null)
    try {
      const data = await estimateDifficulty(idea, components)
      setResult(data)
      notify.success('Difficulty rating complete — ' + data.difficulty + ' level!')
    } catch {
      notify.error('Estimation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const config = result ? DIFFICULTY_CONFIG[result.difficulty] || DIFFICULTY_CONFIG.Intermediate : null

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">📊 Difficulty & Build Time</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            AI estimates how hard this is to build and how long it takes
          </p>
        </div>
        <button
          onClick={handleEstimate}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? '📊 Estimating...' : '📊 Estimate Difficulty'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is analysing the complexity...</p>
        </div>
      )}

      {result && !loading && config && (
        <div className="space-y-4">

          {/* Main difficulty card */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: config.bg, borderColor: config.border }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{config.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-2xl font-black" style={{ color: config.color }}>
                    {result.difficulty}
                  </h4>
                  <span className="text-xs text-slate-500">{config.desc}</span>
                </div>
                <DifficultyMeter score={result.difficultyScore} />
              </div>
            </div>
            <p className="text-slate-300 text-sm">{result.verdict}</p>
          </div>

          {/* Build time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">⏱</div>
              <p className="text-2xl font-bold text-indigo-400">{result.buildTimeHours}h</p>
              <p className="text-slate-500 text-xs">Estimated build time</p>
            </div>
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-2xl font-bold text-indigo-400">
                {result.buildTimeDays} day{result.buildTimeDays !== 1 ? 's' : ''}
              </p>
              <p className="text-slate-500 text-xs">At 2-4 hours per day</p>
            </div>
          </div>

          {/* Skills required */}
          {result.skillsRequired?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Skills Required
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.skillsRequired.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs bg-indigo-950 text-indigo-400 px-3 py-1 rounded-full border border-indigo-900"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {result.tools?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShowTools(!showTools)}
              >
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  🔧 Tools Needed ({result.tools.length})
                </h4>
                <span className="text-slate-600 text-xs">{showTools ? '↑' : '↓'}</span>
              </div>
              {showTools && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#1e1e2e] text-slate-400 px-3 py-1 rounded-full"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Build steps */}
          {result.steps?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div
                className="flex justify-between items-center cursor-pointer mb-3"
                onClick={() => setShowSteps(!showSteps)}
              >
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  📋 Build Plan ({result.steps.length} steps)
                </h4>
                <span className="text-slate-600 text-xs">{showSteps ? '↑ Hide' : '↓ Show'}</span>
              </div>
              {showSteps && (
                <div className="mt-2">
                  {result.steps.map((step, i) => (
                    <BuildStep
                      key={i}
                      step={step}
                      isLast={i === result.steps.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">
                💡 Pro Tips
              </h4>
              <ul className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-indigo-400 shrink-0 mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default DifficultyPanel