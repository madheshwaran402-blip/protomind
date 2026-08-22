import { useState } from 'react'
import { planSensorFusion, saveFusionPlan, getFusionPlan } from '../services/sensorFusionService'
import { notify } from '../services/toast'

function SensorFusionPlanner({ idea, components }) {
  const [result, setResult] = useState(getFusionPlan(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('sensors')
  const [copied, setCopied] = useState(false)

  async function handlePlan() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await planSensorFusion(idea, components)
      setResult(data)
      saveFusionPlan(idea, data)
      notify.success('Sensor fusion plan ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleCopy() {
    if (!result?.codeSnippet) return
    navigator.clipboard.writeText(result.codeSnippet)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Code copied!')
  }

  const TABS = [{ id: 'sensors', label: 'Sensors' }, { id: 'steps', label: 'Fusion Steps' }, { id: 'code', label: 'Code' }]
  const COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7']

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Plan how to combine multiple sensor data streams for better accuracy</p>
        <button onClick={handlePlan} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Planning...' : 'Plan Fusion'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Planning sensor fusion...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-cyan-950 border border-cyan-800 rounded-xl p-4">
            <p className="text-cyan-400 text-xs font-semibold mb-1">Fusion Algorithm</p>
            <p className="text-white font-bold text-lg">{result.fusionAlgorithm}</p>
            {result.outputData && result.outputData.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.outputData.map(function(d, i) {
                  return <span key={i} className="text-xs bg-[#0d0d1a] text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full">{d}</span>
                })}
              </div>
            )}
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-cyan-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'sensors' && (
            <div className="space-y-2">
              {(result.sensors || []).map(function(sensor, i) {
                const color = COLORS[i % COLORS.length]
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <p className="text-white font-bold text-sm">{sensor.name}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full ml-auto" style={{ backgroundColor: color + '20', color }}>{sensor.role}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      {sensor.dataType && <span className="text-slate-400">Data: {sensor.dataType}</span>}
                      {sensor.sampleRate && <span className="text-slate-400">Rate: {sensor.sampleRate}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-2">
              {(result.fusionSteps || []).map(function(step, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-cyan-900 border border-cyan-700 flex items-center justify-center text-xs text-cyan-400 font-bold shrink-0">{step.step}</div>
                      <p className="text-white font-semibold text-sm">{step.description}</p>
                    </div>
                    {step.formula && (
                      <p className="text-cyan-400 text-xs font-mono bg-[#0d0d1a] rounded-lg px-3 py-1.5 mt-1">{step.formula}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'code' && result.codeSnippet && (
            <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
                <span className="text-slate-500 text-xs">sensor_fusion.ino</span>
                <button onClick={handleCopy} className="ml-auto text-xs text-slate-500 hover:text-white">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="px-4 py-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64">
                {result.codeSnippet}
              </pre>
            </div>
          )}

          <button onClick={handlePlan} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Replan</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔬</div>
          <p className="text-white font-semibold mb-1">Sensor Fusion Planner</p>
          <p className="text-slate-500 text-sm">Combine IMU, GPS, camera and other sensors for better accuracy</p>
        </div>
      )}
    </div>
  )
}

export default SensorFusionPlanner
