import { useState } from 'react'
import { generateManufacturingGuide, saveManufacturingGuide, getManufacturingGuide } from '../services/manufacturingService'
import { notify } from '../services/toast'

const READINESS_STYLES = {
  'Prototype': { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '🔧' },
  'Pre-Production': { color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-800', icon: '⚙️' },
  'Production Ready': { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🏭' },
}

const SCALE_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b']

function ManufacturingGuide({ idea, components }) {
  const [guide, setGuide] = useState(getManufacturingGuide(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('scale')
  const [completedSteps, setCompletedSteps] = useState({})

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateManufacturingGuide(idea, components)
      setGuide(data)
      saveManufacturingGuide(idea, data)
      notify.success('Manufacturing guide ready!')
    } catch { notify.error('Generation failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleStep(index) {
    setCompletedSteps(function(prev) {
      const next = Object.assign({}, prev)
      next[index] = !next[index]
      return next
    })
  }

  const readStyle = guide ? (READINESS_STYLES[guide.productionReadiness] || READINESS_STYLES['Prototype']) : null
  const TABS = [{ id: 'scale', label: '📈 Scale' }, { id: 'process', label: '⚙️ Process' }, { id: 'quality', label: '✅ Quality' }, { id: 'suppliers', label: '🏪 Suppliers' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Get a manufacturing guide for scaling your prototype to production</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '🏭 Building...' : '🏭 Generate Guide'}
        </button>
      </div>
      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building manufacturing guide...</p>
        </div>
      )}
      {guide && !loading && (
        <>
          <div className={'rounded-2xl border p-4 flex items-center gap-3 ' + readStyle.bg + ' ' + readStyle.border}>
            <span className="text-3xl">{readStyle.icon}</span>
            <div>
              <p className={'font-black text-lg ' + readStyle.color}>{guide.productionReadiness}</p>
              <p className="text-slate-400 text-xs">{(guide.scaleOptions || []).length} scale options</p>
            </div>
          </div>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>
          {activeTab === 'scale' && (
            <div className="space-y-3">
              {(guide.scaleOptions || []).map(function(option, i) {
                const color = SCALE_COLORS[i % SCALE_COLORS.length]
                return (
                  <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: color + '10', borderColor: color + '30' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-bold text-sm">{option.quantity}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>{option.method}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      {option.costPerUnit && <span className="text-emerald-400">💰 {option.costPerUnit}/unit</span>}
                      {option.leadTime && <span className="text-blue-400">⏱️ {option.leadTime}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {option.pros && <p className="text-green-400">✓ {option.pros}</p>}
                      {option.cons && <p className="text-red-400">✗ {option.cons}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {activeTab === 'process' && (
            <div className="space-y-2">
              {(guide.manufacturingSteps || []).map(function(step, i) {
                const done = !!completedSteps[i]
                return (
                  <div key={i} onClick={function() { toggleStep(i) }}
                    className={'rounded-xl border p-4 cursor-pointer transition ' + (done ? 'bg-green-950 border-green-900 opacity-60' : 'bg-[#13131f] border-[#2e2e4e]')}>
                    <div className="flex items-start gap-3">
                      <div className={'w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ' + (done ? 'bg-green-600 border-green-500 text-white' : 'border-[#2e2e4e] text-slate-500')}>
                        {done ? '✓' : i + 1}
                      </div>
                      <div>
                        <p className={'text-sm font-semibold ' + (done ? 'line-through text-slate-500' : 'text-white')}>{step.step}</p>
                        <p className="text-slate-400 text-xs">{step.description}</p>
                        <div className="flex gap-3 text-xs mt-1">
                          {step.equipment && <span className="text-slate-500">🔧 {step.equipment}</span>}
                          {step.duration && <span className="text-slate-500">⏱️ {step.duration}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {activeTab === 'quality' && (
            <div className="space-y-2">
              {(guide.qualityChecks || []).map(function(check, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-semibold text-sm mb-1">{check.checkpoint}</p>
                    {check.method && <p className="text-slate-400 text-xs mb-1">Method: {check.method}</p>}
                    {check.acceptanceCriteria && (
                      <div className="bg-green-950 border border-green-900 rounded-lg p-2">
                        <p className="text-green-400 text-xs">✓ Accept if: {check.acceptanceCriteria}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          {activeTab === 'suppliers' && (
            <div className="space-y-3">
              {(guide.supplierRecommendations || []).map(function(rec, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">{rec.type}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(rec.suppliers || []).map(function(sup, j) {
                        return (
                          <button key={j}
                            onClick={function() { window.open('https://www.google.com/search?q=' + encodeURIComponent(sup + ' electronics supplier'), '_blank') }}
                            className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full hover:bg-indigo-900 transition">
                            {sup}
                          </button>
                        )
                      })}
                    </div>
                    {rec.notes && <p className="text-slate-500 text-xs">{rec.notes}</p>}
                  </div>
                )
              })}
            </div>
          )}
          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Regenerate</button>
        </>
      )}
      {!guide && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🏭</div>
          <p className="text-white font-semibold mb-1">Manufacturing Guide</p>
          <p className="text-slate-500 text-sm">Get scaling options, process steps and supplier recommendations</p>
        </div>
      )}
    </div>
  )
}

export default ManufacturingGuide
