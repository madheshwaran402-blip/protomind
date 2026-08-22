import { useState } from 'react'
import { calculatePowerBudget, savePowerBudget, getPowerBudget } from '../services/powerBudgetService'
import { notify } from '../services/toast'

function PowerBudget({ idea, components }) {
  const [result, setResult] = useState(getPowerBudget(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('components')

  async function handleCalculate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await calculatePowerBudget(idea, components)
      setResult(data)
      savePowerBudget(idea, data)
      notify.success('Power budget calculated!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const TABS = [{ id: 'components', label: 'Components' }, { id: 'rails', label: 'Voltage Rails' }, { id: 'tips', label: 'Efficiency' }]
  const maxPower = result ? Math.max(...(result.components || []).map(function(c) { return c.powerMw || 0 })) : 1

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Calculate power consumption for each component and total budget</p>
        <button onClick={handleCalculate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Calculating...' : 'Calculate Power'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Calculating power budget...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-yellow-400">{result.totalCurrentMa}<span className="text-lg">mA</span></p>
              <p className="text-slate-500 text-xs">Total Current</p>
            </div>
            <div className="bg-orange-950 border border-orange-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-orange-400">{result.totalPowerMw}<span className="text-lg">mW</span></p>
              <p className="text-slate-500 text-xs">Total Power</p>
            </div>
          </div>

          {result.efficiency && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ backgroundColor: result.efficiency.score >= 70 ? '#14532d' : '#7c2d12', color: result.efficiency.score >= 70 ? '#4ade80' : '#fb923c', border: '2px solid' }}>
                {result.efficiency.score}
              </div>
              <p className="text-slate-400 text-xs">Efficiency Score — higher is better</p>
            </div>
          )}

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-yellow-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'components' && (
            <div className="space-y-2">
              {(result.components || []).sort(function(a, b) { return (b.powerMw || 0) - (a.powerMw || 0) }).map(function(comp, i) {
                const pct = maxPower > 0 ? ((comp.powerMw || 0) / maxPower) * 100 : 0
                const barColor = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#22c55e'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium">{comp.name}</p>
                      <div className="flex gap-3 text-xs">
                        <span className="text-blue-400">{comp.currentMa}mA</span>
                        <span className="text-yellow-400">{comp.powerMw}mW</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: pct + '%', backgroundColor: barColor }} />
                    </div>
                    {comp.mode && <p className="text-slate-600 text-xs mt-0.5">{comp.mode}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'rails' && (
            <div className="space-y-2">
              {(result.voltageRails || []).map(function(rail, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-yellow-400 font-black text-lg">{rail.voltage}</p>
                      <span className="text-blue-400 text-sm font-bold">{rail.totalCurrentMa}mA</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(rail.consumers || []).map(function(c, j) {
                        return <span key={j} className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-2 py-0.5 rounded-full">{c}</span>
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'tips' && result.efficiency && (
            <div className="bg-green-950 border border-green-800 rounded-xl p-4">
              <p className="text-green-400 text-xs font-semibold mb-2">Efficiency Tips</p>
              <ul className="space-y-1">
                {(result.efficiency.tips || []).map(function(tip, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400">{i+1}.</span>{tip}</li>
                })}
              </ul>
            </div>
          )}

          <button onClick={handleCalculate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Recalculate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">⚡</div>
          <p className="text-white font-semibold mb-1">Power Budget Calculator</p>
          <p className="text-slate-500 text-sm">Calculate current and power draw for every component</p>
        </div>
      )}
    </div>
  )
}

export default PowerBudget
