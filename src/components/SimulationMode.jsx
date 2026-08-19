import { useState } from 'react'
import { runSimulation, SIMULATION_SCENARIOS } from '../services/simulationService'
import { notify } from '../services/toast'

function SimulationMode({ idea, components }) {
  const [selectedScenario, setSelectedScenario] = useState(SIMULATION_SCENARIOS[0])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [playStep, setPlayStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  async function handleRun() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setResult(null)
    setPlayStep(0)
    try {
      const data = await runSimulation(idea, components, selectedScenario.label + ': ' + selectedScenario.desc)
      setResult(data)
      notify.success('Simulation complete!')
    } catch {
      notify.error('Simulation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handlePlay() {
    if (!result || isPlaying) return
    setIsPlaying(true)
    setPlayStep(0)
    const steps = result.steps || []
    let i = 0
    const interval = setInterval(function() {
      i++
      setPlayStep(i)
      if (i >= steps.length - 1) {
        clearInterval(interval)
        setIsPlaying(false)
      }
    }, 800)
  }

  const steps = result?.steps || []

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Select Scenario</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SIMULATION_SCENARIOS.map(function(scenario) {
            const isSel = selectedScenario.id === scenario.id
            return (
              <button
                key={scenario.id}
                onClick={function() { setSelectedScenario(scenario); setResult(null) }}
                className={'p-3 rounded-xl border text-left transition ' + (
                  isSel ? 'bg-indigo-950 border-indigo-700' : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-700'
                )}
              >
                <p className={'text-sm mb-0.5 ' + (isSel ? 'text-white font-semibold' : 'text-slate-300')}>{scenario.label}</p>
                <p className="text-slate-500 text-xs">{scenario.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={loading || components.length === 0}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? '⚡ Simulating...' : '▶️ Run Simulation: ' + selectedScenario.label}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Running simulation...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Simulation header */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚡</span>
              <p className="text-white font-bold">{result.scenarioName}</p>
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                className="ml-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                {isPlaying ? '⏸ Playing...' : '▶️ Play'}
              </button>
            </div>
            <p className="text-slate-400 text-sm">{result.outcome}</p>
          </div>

          {/* Step visualizer */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Simulation Steps</p>
              <span className="text-xs text-indigo-400">{playStep + 1}/{steps.length}</span>
            </div>

            {/* Timeline dots */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {steps.map(function(step, i) {
                const isActive = i === playStep
                const isPast = i < playStep
                return (
                  <button
                    key={i}
                    onClick={function() { setPlayStep(i) }}
                    className={'shrink-0 rounded-full transition ' + (
                      isActive ? 'w-4 h-4 bg-indigo-500' :
                      isPast ? 'w-3 h-3 bg-green-600' :
                      'w-3 h-3 bg-[#2e2e4e]'
                    )}
                  />
                )
              })}
            </div>

            {/* Active step detail */}
            {steps[playStep] && (
              <div className="bg-[#0d0d1a] border border-indigo-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-400 text-xs font-mono">{steps[playStep].time}</span>
                  <p className="text-white font-semibold text-sm">{steps[playStep].event}</p>
                  {steps[playStep].state && (
                    <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded-full ml-auto">
                      {steps[playStep].state}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {steps[playStep].voltage && (
                    <div className="bg-[#13131f] rounded-lg p-2">
                      <p className="text-slate-500">Voltage</p>
                      <p className="text-yellow-400 font-mono font-bold">{steps[playStep].voltage}</p>
                    </div>
                  )}
                  {steps[playStep].current && (
                    <div className="bg-[#13131f] rounded-lg p-2">
                      <p className="text-slate-500">Current</p>
                      <p className="text-blue-400 font-mono font-bold">{steps[playStep].current}</p>
                    </div>
                  )}
                </div>
                {steps[playStep].notes && (
                  <p className="text-slate-400 text-xs">{steps[playStep].notes}</p>
                )}
              </div>
            )}

            {/* Prev/Next */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={function() { setPlayStep(Math.max(0, playStep - 1)) }}
                disabled={playStep === 0}
                className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">
                ← Prev
              </button>
              <button
                onClick={function() { setPlayStep(Math.min(steps.length - 1, playStep + 1)) }}
                disabled={playStep === steps.length - 1}
                className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">
                Next →
              </button>
            </div>
          </div>

          {result.issues && result.issues.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold mb-2">⚠️ Issues Detected</p>
              <ul className="space-y-1">
                {result.issues.map(function(issue, i) {
                  return <li key={i} className="text-red-200 text-xs">• {issue}</li>
                })}
              </ul>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Recommendations</p>
              <ul className="space-y-1">
                {result.recommendations.map(function(rec, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400">{i+1}.</span>{rec}</li>
                })}
              </ul>
            </div>
          )}

          <button onClick={handleRun}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Re-run Simulation
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">⚡</div>
          <p className="text-white font-semibold mb-1">Simulation Mode</p>
          <p className="text-slate-500 text-sm">Select a scenario and simulate how your prototype behaves</p>
        </div>
      )}
    </div>
  )
}

export default SimulationMode