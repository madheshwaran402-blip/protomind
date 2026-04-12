import { useState } from 'react'
import { calculatePowerConsumption } from '../services/powerCalculator'
import { notify } from '../services/toast'

const EFFICIENCY_COLORS = {
  Low: { color: '#ef4444', bg: '#2d1b1b', border: '#991b1b' },
  Medium: { color: '#f59e0b', bg: '#2d2000', border: '#92400e' },
  High: { color: '#22c55e', bg: '#14293d', border: '#166534' },
}

function PowerBar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="w-full bg-[#1e1e2e] rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: pct + '%', backgroundColor: color }}
      />
    </div>
  )
}

function PowerCalculator({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleCalculate() {
    setLoading(true)
    setResult(null)
    try {
      const data = await calculatePowerConsumption(idea, components)
      setResult(data)
      if (data.warnings?.length > 0) {
        notify.warning('Power warnings found — check the calculator')
      } else {
        notify.success('Power calculation complete!')
      }
    } catch {
      notify.error('Calculation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const effConfig = result
    ? EFFICIENCY_COLORS[result.efficiency] || EFFICIENCY_COLORS.Medium
    : null

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">⚡ Power Consumption Calculator</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            AI calculates current draw, battery life, and power requirements
          </p>
        </div>
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="px-5 py-2.5 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? '⚡ Calculating...' : '⚡ Calculate Power'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Calculating power requirements...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🔋</div>
              <p className="text-2xl font-bold text-yellow-400">{result.totalCurrentMa}mA</p>
              <p className="text-slate-500 text-xs mt-1">Total current draw</p>
            </div>
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-2xl font-bold text-yellow-400">{result.totalPowerMw}mW</p>
              <p className="text-slate-500 text-xs mt-1">Total power</p>
            </div>
            <div
              className="rounded-xl border p-4 text-center"
              style={{ backgroundColor: effConfig.bg, borderColor: effConfig.border }}
            >
              <div className="text-2xl mb-1">📊</div>
              <p className="text-2xl font-bold" style={{ color: effConfig.color }}>
                {result.efficiency}
              </p>
              <p className="text-slate-500 text-xs mt-1">Power efficiency</p>
            </div>
          </div>

          {/* Verdict */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
            <p className="text-slate-300 text-sm">{result.verdict}</p>
            <p className="text-slate-500 text-xs mt-1">
              Recommended supply: <span className="text-yellow-400">{result.powerSupplyNeeded}</span>
              {' · '}Operating voltage: <span className="text-yellow-400">{result.operatingVoltage}V</span>
            </p>
          </div>

          {/* Per component breakdown */}
          {result.components?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Current Draw Per Component
              </h4>
              <div className="space-y-3">
                {result.components.map((comp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white">{comp.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{comp.mode}</span>
                        <span className="text-xs text-yellow-400 font-mono">{comp.currentMa}mA</span>
                      </div>
                    </div>
                    <PowerBar
                      value={comp.currentMa}
                      max={result.totalCurrentMa}
                      color="#f59e0b"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Battery life estimates */}
          {result.batteryLife?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                🔋 Battery Life Estimates
              </h4>
              <div className="space-y-2">
                {result.batteryLife.map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#2e2e4e] last:border-0">
                    <div>
                      <p className="text-sm text-white">{b.lifeLabel}</p>
                      <p className="text-xs text-slate-500">{b.batteryMah}mAh</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-400">{b.lifeHours}h</p>
                      <p className="text-xs text-slate-500">continuous use</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings?.length > 0 && (
            <div className="bg-orange-950 border border-orange-900 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-3">
                ⚠️ Power Warnings
              </h4>
              <ul className="space-y-2">
                {result.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-300">
                    <span className="shrink-0 mt-0.5">→</span>
                    {w}
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

export default PowerCalculator