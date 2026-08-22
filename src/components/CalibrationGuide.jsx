import { useState } from 'react'
import { generateCalibrationGuide, saveCalibrationGuide, getCalibrationGuide } from '../services/calibrationService'
import { notify } from '../services/toast'

function CalibrationGuide({ idea, components }) {
  const [result, setResult] = useState(getCalibrationGuide(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const [completedSteps, setCompletedSteps] = useState({})

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateCalibrationGuide(idea, components)
      setResult(data)
      saveCalibrationGuide(idea, data)
      notify.success('Calibration guide ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleStep(compIdx, stepIdx) {
    const key = compIdx + '_' + stepIdx
    setCompletedSteps(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = !next[key]
      return next
    })
  }

  const comps = result?.components || []
  const activeComp = comps[selected]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate step-by-step calibration procedures for every sensor and component</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Generating...' : 'Generate Guide'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Generating calibration guide...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {comps.map(function(comp, i) {
              return (
                <button key={i} onClick={function() { setSelected(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1 ' + (selected === i ? 'bg-teal-700 text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>
                  {comp.name}
                  {!comp.calibrationNeeded && <span className="text-xs opacity-60">(skip)</span>}
                </button>
              )
            })}
          </div>

          {activeComp && (
            <div className="space-y-3">
              {!activeComp.calibrationNeeded ? (
                <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                  <p className="text-green-400 text-sm">No calibration needed for {activeComp.name}</p>
                </div>
              ) : (
                <>
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-bold">{activeComp.name} Calibration</p>
                      {activeComp.frequency && <span className="text-teal-400 text-xs">{activeComp.frequency}</span>}
                    </div>
                    {activeComp.equipment && <p className="text-slate-400 text-xs">Equipment needed: {activeComp.equipment}</p>}
                  </div>

                  <div className="space-y-2">
                    {(activeComp.procedure || []).map(function(step, j) {
                      const key = selected + '_' + j
                      const done = !!completedSteps[key]
                      return (
                        <div key={j} onClick={function() { toggleStep(selected, j) }}
                          className={'flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ' + (done ? 'bg-green-950 border-green-900 opacity-70' : 'bg-[#13131f] border-[#2e2e4e] hover:border-teal-700')}>
                          <div className={'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ' + (done ? 'bg-green-600 border-green-500 text-white' : 'border-[#2e2e4e] text-slate-500')}>
                            {done ? 'v' : j + 1}
                          </div>
                          <p className={'text-sm ' + (done ? 'line-through text-slate-500' : 'text-white')}>{step}</p>
                        </div>
                      )
                    })}
                  </div>

                  {activeComp.code && (
                    <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
                        <span className="text-teal-400 text-xs">Calibration Code</span>
                      </div>
                      <pre className="px-4 py-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
                        {activeComp.code}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-white font-semibold mb-1">Calibration Guide Generator</p>
          <p className="text-slate-500 text-sm">Get step-by-step calibration procedures for every sensor</p>
        </div>
      )}
    </div>
  )
}

export default CalibrationGuide
