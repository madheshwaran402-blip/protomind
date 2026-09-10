import { useState } from 'react'
import { buildOnboardingFlow, saveOnboardingFlow, getOnboardingFlow } from '../services/onboardingService'
import { notify } from '../services/toast'

const STEP_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6']

function OnboardingFlowBuilder({ idea, components }) {
  const [result, setResult] = useState(getOnboardingFlow(idea))
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState({})

  async function handleBuild() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await buildOnboardingFlow(idea, components)
      setResult(data)
      saveOnboardingFlow(idea, data)
      setCompleted({})
      setActiveStep(0)
      notify.success('Onboarding flow ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleStep(idx) {
    setCompleted(function(prev) {
      const next = Object.assign({}, prev)
      next[idx] = !next[idx]
      return next
    })
  }

  const steps = result?.steps || []
  const completedCount = Object.values(completed).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Design the first-use onboarding experience for your prototype</p>
        <button onClick={handleBuild} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Building...' : 'Build Onboarding'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building onboarding flow...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-violet-950 border border-violet-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
                <div className="h-2 bg-violet-600 rounded-full transition-all"
                  style={{ width: steps.length > 0 ? (completedCount / steps.length * 100) + '%' : '0%' }} />
              </div>
              <span className="text-violet-400 text-xs">{completedCount}/{steps.length} done</span>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {steps.map(function(step, i) {
              const color = STEP_COLORS[i % STEP_COLORS.length]
              const done = !!completed[i]
              return (
                <button key={i} onClick={function() { setActiveStep(i) }}
                  className={'flex-shrink-0 w-10 h-10 rounded-xl text-xs font-bold transition border-2 ' + (
                    done ? 'bg-green-600 border-green-500 text-white' :
                    activeStep === i ? 'text-white border-transparent' :
                    'bg-[#13131f] text-slate-400 border-[#2e2e4e]'
                  )}
                  style={activeStep === i && !done ? { backgroundColor: color, borderColor: color } : {}}>
                  {done ? 'v' : step.step}
                </button>
              )
            })}
          </div>

          {steps[activeStep] && (
            <div className="space-y-3">
              <div className="rounded-xl border p-5"
                style={{ backgroundColor: STEP_COLORS[activeStep % STEP_COLORS.length] + '15', borderColor: STEP_COLORS[activeStep % STEP_COLORS.length] + '40' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ backgroundColor: STEP_COLORS[activeStep % STEP_COLORS.length] }}>
                    {steps[activeStep].step}
                  </div>
                  <p className="text-white font-bold text-lg">{steps[activeStep].title}</p>
                </div>
                <p className="text-slate-300 text-sm">{steps[activeStep].description}</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {steps[activeStep].userAction && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <p className="text-blue-400 text-xs font-semibold mb-1">User Action</p>
                    <p className="text-white text-sm">{steps[activeStep].userAction}</p>
                  </div>
                )}
                {steps[activeStep].successIndicator && (
                  <div className="bg-green-950 border border-green-800 rounded-xl p-3">
                    <p className="text-green-400 text-xs font-semibold mb-1">Success Indicator</p>
                    <p className="text-slate-300 text-sm">{steps[activeStep].successIndicator}</p>
                  </div>
                )}
                {steps[activeStep].commonMistake && (
                  <div className="bg-red-950 border border-red-900 rounded-xl p-3">
                    <p className="text-red-400 text-xs font-semibold mb-1">Common Mistake</p>
                    <p className="text-slate-300 text-sm">{steps[activeStep].commonMistake}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={function() { toggleStep(activeStep) }}
                  className={'flex-1 py-2 rounded-xl text-xs font-semibold transition ' + (completed[activeStep] ? 'bg-green-700 text-white' : 'bg-[#1e1e2e] text-slate-300 hover:bg-green-950')}>
                  {completed[activeStep] ? '✓ Done' : 'Mark Complete'}
                </button>
                <button onClick={function() { setActiveStep(Math.max(0, activeStep-1)) }} disabled={activeStep===0}
                  className="px-4 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-xs disabled:opacity-30">Prev</button>
                <button onClick={function() { setActiveStep(Math.min(steps.length-1, activeStep+1)) }} disabled={activeStep===steps.length-1}
                  className="px-4 py-2 bg-violet-700 text-white rounded-xl text-xs disabled:opacity-30">Next</button>
              </div>
            </div>
          )}

          <button onClick={handleBuild} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-white font-semibold mb-1">Onboarding Flow Builder</p>
          <p className="text-slate-500 text-sm">Design the first-use experience with step-by-step user guidance</p>
        </div>
      )}
    </div>
  )
}

export default OnboardingFlowBuilder
