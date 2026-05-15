import { useState } from 'react'
import { runEnergyAudit } from '../services/energyAuditService'
import { notify } from '../services/toast'

const EFFICIENCY_COLORS = {
  Excellent: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Good: { color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-800' },
  Fair: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Poor: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
}

const BATTERY_ICONS = {
  'AA': '🔋',
  'AAA': '🔋',
  'LiPo': '⚡',
  '18650': '🔋',
  'USB Power Bank': '📱',
}

function CurrentBar({ name, value, total }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0
  const color = pct > 50 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#6366f1'
  return (
    <div className="flex items-center gap-3 py-1.5">
      <p className="text-slate-300 text-xs w-32 shrink-0 truncate">{name}</p>
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: pct + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono w-16 text-right shrink-0" style={{ color }}>
        {value} mA
      </span>
      <span className="text-slate-600 text-xs w-10 text-right shrink-0">
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

function BatteryCard({ battery }) {
  const icon = BATTERY_ICONS[battery.type] || '🔋'
  const hoursActive = battery.hoursActive || 0
  const daysMixed = battery.daysMixed || 0

  const lifeColor = hoursActive >= 24 ? 'text-green-400' :
    hoursActive >= 8 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-white text-sm font-semibold">{battery.capacity}</p>
          <p className="text-slate-500 text-xs">{battery.type}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#0d0d1a] rounded-lg p-2">
          <p className={hoursActive >= 1 ? lifeColor + ' text-base font-black' : 'text-slate-600 text-base font-black'}>
            {hoursActive >= 1 ? hoursActive.toFixed(1) + 'h' : '<1h'}
          </p>
          <p className="text-slate-600 text-xs">Active</p>
        </div>
        <div className="bg-[#0d0d1a] rounded-lg p-2">
          <p className="text-blue-400 text-base font-black">
            {(battery.hoursSleep || 0).toFixed(0)}h
          </p>
          <p className="text-slate-600 text-xs">Sleep</p>
        </div>
        <div className="bg-[#0d0d1a] rounded-lg p-2">
          <p className="text-indigo-400 text-base font-black">
            {daysMixed >= 1 ? daysMixed.toFixed(1) + 'd' : (daysMixed * 24).toFixed(1) + 'h'}
          </p>
          <p className="text-slate-600 text-xs">Mixed</p>
        </div>
      </div>
    </div>
  )
}

function EnergyAudit({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  async function handleAudit() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await runEnergyAudit(idea, components)
      setResult(data)
      notify.success('Energy audit complete — ' + (data.totalCurrentMA || 0) + 'mA total')
    } catch {
      notify.error('Audit failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const effStyle = result ? (EFFICIENCY_COLORS[result.efficiency] || EFFICIENCY_COLORS.Fair) : null

  const TABS = [
    { id: 'overview', label: '⚡ Overview' },
    { id: 'breakdown', label: '📊 Breakdown' },
    { id: 'battery', label: '🔋 Battery Life' },
    { id: 'tips', label: '💡 Save Power' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          Calculate power consumption and battery life for your prototype
        </p>
        <button
          onClick={handleAudit}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '⚡ Auditing...' : '⚡ Run Energy Audit'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Calculating power consumption...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Summary banner */}
          <div className={'rounded-2xl border p-5 flex items-center gap-5 ' + effStyle.bg + ' ' + effStyle.border}>
            <div className="text-center shrink-0">
              <p className={'text-3xl font-black ' + effStyle.color}>
                {result.totalCurrentMA || 0}
              </p>
              <p className="text-slate-400 text-xs">mA total</p>
            </div>
            <div className="w-px h-12 bg-[#2e2e4e] shrink-0" />
            <div className="text-center shrink-0">
              <p className={'text-3xl font-black ' + effStyle.color}>
                {result.totalPowerMW || 0}
              </p>
              <p className="text-slate-400 text-xs">mW power</p>
            </div>
            <div className="w-px h-12 bg-[#2e2e4e] shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={'text-sm font-bold ' + effStyle.color}>
                  {result.efficiency} Efficiency
                </span>
                <span className="text-slate-500 text-xs">@ {result.supplyVoltage || 5}V</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{result.verdict}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button
                  key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Supply Voltage', value: (result.supplyVoltage || 5) + 'V', icon: '⚡' },
                  { label: 'Total Current', value: (result.totalCurrentMA || 0) + ' mA', icon: '🔌' },
                  { label: 'Total Power', value: (result.totalPowerMW || 0) + ' mW', icon: '💡' },
                  { label: 'Efficiency', value: result.efficiency || 'N/A', icon: '📊' },
                ].map(function(stat) {
                  return (
                    <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                      <p className="text-xl mb-1">{stat.icon}</p>
                      <p className="text-white font-bold text-sm">{stat.value}</p>
                      <p className="text-slate-600 text-xs">{stat.label}</p>
                    </div>
                  )
                })}
              </div>

              {result.sleepModeAnalysis && (
                <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">🌙 Sleep Mode Analysis</p>
                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    <div>
                      <p className="text-white font-bold text-sm">
                        {result.sleepModeAnalysis.estimatedSleepCurrent || 'N/A'}
                      </p>
                      <p className="text-slate-600 text-xs">Sleep Current</p>
                    </div>
                    <div>
                      <p className="text-green-400 font-bold text-sm">
                        {result.sleepModeAnalysis.potentialSaving || 'N/A'}
                      </p>
                      <p className="text-slate-600 text-xs">Potential Saving</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-bold text-sm">
                        {result.sleepModeAnalysis.recommendation ? 'Yes' : 'Check'}
                      </p>
                      <p className="text-slate-600 text-xs">Recommended</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs">{result.sleepModeAnalysis.recommendation}</p>
                </div>
              )}
            </div>
          )}

          {/* Breakdown tab */}
          {activeTab === 'breakdown' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                Current Draw by Component
              </p>
              {(result.components || []).map(function(comp, i) {
                return (
                  <CurrentBar
                    key={i}
                    name={comp.name}
                    value={comp.activeMA || 0}
                    total={result.totalCurrentMA || 1}
                  />
                )
              })}

              <div className="mt-4 pt-3 border-t border-[#2e2e4e]">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                  Component Details
                </p>
                <div className="space-y-2">
                  {(result.components || []).map(function(comp, i) {
                    return (
                      <div key={i} className="flex items-center gap-3 bg-[#0d0d1a] rounded-lg px-3 py-2">
                        <p className="text-slate-300 text-xs flex-1">{comp.name}</p>
                        <span className="text-red-400 text-xs font-mono">
                          {comp.activeMA || 0}mA active
                        </span>
                        <span className="text-blue-400 text-xs font-mono">
                          {comp.sleepMA || 0}mA sleep
                        </span>
                        {comp.dutyCycle && (
                          <span className="text-slate-500 text-xs">
                            {comp.dutyCycle}% duty
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Battery Life tab */}
          {activeTab === 'battery' && (
            <div className="space-y-3">
              <p className="text-slate-500 text-xs">
                Estimated battery life at {result.totalCurrentMA || 0}mA average consumption
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(result.batteryEstimates || []).map(function(battery, i) {
                  return <BatteryCard key={i} battery={battery} />
                })}
              </div>
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                <p className="text-slate-500 text-xs">
                  💡 Active = always on · Sleep = deep sleep mode · Mixed = 20% active, 80% sleep
                </p>
              </div>
            </div>
          )}

          {/* Tips tab */}
          {activeTab === 'tips' && (
            <div className="space-y-2">
              {(result.powerSavingTips || []).map(function(tip, i) {
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                    <span className="text-yellow-400 font-bold text-sm shrink-0">{i + 1}.</span>
                    <p className="text-slate-300 text-sm">{tip}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={handleAudit}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Re-run Audit
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">⚡</div>
          <p className="text-white font-semibold mb-1">Energy Audit Tool</p>
          <p className="text-slate-500 text-sm mb-4">
            Calculate exact power consumption and battery life estimates
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Per component current</span>
            <span>✓ Battery life estimates</span>
            <span>✓ Sleep mode analysis</span>
            <span>✓ Power saving tips</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnergyAudit