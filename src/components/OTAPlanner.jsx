import { useState } from 'react'
import { planOTAUpdate, saveOTAPlan, getOTAPlan } from '../services/otaService'
import { notify } from '../services/toast'

function OTAPlanner({ idea, components }) {
  const [result, setResult] = useState(getOTAPlan(idea))
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  async function handlePlan() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await planOTAUpdate(idea, components)
      setResult(data)
      saveOTAPlan(idea, data)
      notify.success('OTA plan ready!')
    } catch { notify.error('Planning failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const hasWifi = components.some(function(c) {
    return c.name.toLowerCase().includes('esp') || c.category === 'Communication'
  })

  return (
    <div className="space-y-4">
      {!hasWifi && (
        <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3">
          <p className="text-yellow-400 text-xs">⚠️ OTA updates typically require WiFi/Bluetooth. Consider adding ESP32 or similar.</p>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan an over-the-air firmware update system for your prototype</p>
        <button onClick={handlePlan} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-sky-700 hover:bg-sky-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '📡 Planning...' : '📡 Plan OTA'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Planning OTA update system...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-sky-950 border border-sky-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📡</span>
              <div>
                <p className="text-white font-bold">{result.otaMethod}</p>
                <p className="text-sky-400 text-xs">{result.platform}</p>
              </div>
            </div>
            {result.libraries && result.libraries.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.libraries.map(function(lib, i) {
                  return <span key={i} className="text-xs bg-[#0d0d1a] text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full">📦 {lib}</span>
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {(result.steps || []).map(function(step, i) {
              return (
                <button key={i} onClick={function() { setActiveStep(i) }}
                  className={'p-2 rounded-xl border text-xs transition text-left ' + (activeStep === i ? 'bg-sky-950 border-sky-700 text-sky-300' : 'bg-[#13131f] border-[#2e2e4e] text-slate-400')}>
                  <span className="font-bold">Step {step.step}</span>
                  <p className="line-clamp-1">{step.description}</p>
                </button>
              )
            })}
          </div>

          {result.steps && result.steps[activeStep] && (
            <div className="bg-[#13131f] border border-sky-800 rounded-xl p-4">
              <p className="text-sky-400 text-xs font-semibold mb-1">Step {result.steps[activeStep].step}</p>
              <p className="text-white text-sm mb-2">{result.steps[activeStep].description}</p>
              {result.steps[activeStep].code && (
                <pre className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {result.steps[activeStep].code}
                </pre>
              )}
            </div>
          )}

          {result.securityFeatures && result.securityFeatures.length > 0 && (
            <div className="bg-green-950 border border-green-800 rounded-xl p-4">
              <p className="text-green-400 text-xs font-semibold mb-2">🔒 Security Features</p>
              <ul className="space-y-1">
                {result.securityFeatures.map(function(f, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400">✓</span>{f}</li>
                })}
              </ul>
            </div>
          )}

          {result.rollbackPlan && (
            <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
              <p className="text-orange-400 text-xs font-semibold mb-1">↺ Rollback Plan</p>
              <p className="text-slate-300 text-sm">{result.rollbackPlan}</p>
            </div>
          )}

          <button onClick={handlePlan} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Regenerate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📡</div>
          <p className="text-white font-semibold mb-1">OTA Update Planner</p>
          <p className="text-slate-500 text-sm">Plan over-the-air firmware updates with security and rollback</p>
        </div>
      )}
    </div>
  )
}

export default OTAPlanner
