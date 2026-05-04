import { useState } from 'react'
import { checkComponentAvailability } from '../services/stockCheckerService'
import { notify } from '../services/toast'

const AVAILABILITY_COLORS = {
  High: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', dot: '#22c55e' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', dot: '#f59e0b' },
  Low: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', dot: '#ef4444' },
}

const RISK_COLORS = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-red-400',
}

const OVERALL_RISK_COLORS = {
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  High: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
}

const SUPPLIER_ICONS = {
  Amazon: '📦',
  AliExpress: '🌏',
  Mouser: '🔵',
  DigiKey: '🟦',
  Adafruit: '🔴',
  'Arduino.cc': '🔵',
  eBay: '🛒',
  LCSC: '🟡',
}

function ComponentAvailabilityCard({ comp }) {
  const [expanded, setExpanded] = useState(false)
  const avail = AVAILABILITY_COLORS[comp.availability] || AVAILABILITY_COLORS.Medium
  const riskColor = RISK_COLORS[comp.risk] || 'text-yellow-400'

  function searchSupplier(supplier, compName) {
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(compName + ' buy ' + supplier)
    window.open(url, '_blank')
  }

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        {/* Availability dot */}
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: avail.dot }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white text-sm font-semibold">{comp.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${avail.color} ${avail.bg} ${avail.border}`}>
              {comp.availability} Stock
            </span>
            {comp.counterfeitRisk === 'High' && (
              <span className="text-xs bg-orange-950 text-orange-400 border border-orange-800 px-2 py-0.5 rounded-full">
                ⚠️ Counterfeit Risk
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>🚚 {comp.typicalLeadTime}</span>
            <span>·</span>
            <span>Risk: <span className={riskColor}>{comp.risk}</span></span>
            <span>·</span>
            <span>Price: {comp.priceStability}</span>
          </div>
        </div>

        <span className="text-slate-600 shrink-0">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#2e2e4e] pt-3 space-y-3">

          {/* Buying tip */}
          {comp.buyingTip && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-lg p-3">
              <p className="text-indigo-400 text-xs font-semibold mb-1">💡 Buying Tip</p>
              <p className="text-slate-300 text-sm">{comp.buyingTip}</p>
            </div>
          )}

          {/* Alternatives */}
          {comp.alternatives?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">🔄 Alternatives</p>
              <div className="space-y-1">
                {comp.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2">
                    <p className="text-slate-300 text-xs font-medium">{alt.name}</p>
                    <span className="text-slate-600 text-xs">— {alt.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suppliers */}
          {comp.suppliers?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">🛒 Where to Buy</p>
              <div className="flex flex-wrap gap-2">
                {comp.suppliers.map((supplier, i) => (
                  <button
                    key={i}
                    onClick={() => searchSupplier(supplier, comp.name)}
                    className="flex items-center gap-1 text-xs bg-[#0d0d1a] border border-[#2e2e4e] hover:border-indigo-600 text-slate-300 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>{SUPPLIER_ICONS[supplier] || '🛒'}</span>
                    <span>{supplier}</span>
                    <span className="text-slate-600">↗️</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StockChecker({ components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('components')

  async function handleCheck() {
    if (components.length === 0) {
      notify.warning('No components to check')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await checkComponentAvailability(components)
      setResult(data)
      const lowStock = (data.components || []).filter(c => c.availability === 'Low').length
      if (lowStock > 0) {
        notify.warning(lowStock + ' component' + (lowStock > 1 ? 's' : '') + ' may be hard to find')
      } else {
        notify.success('Availability check complete — all components look good!')
      }
    } catch {
      notify.error('Check failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const overallColors = result ? (OVERALL_RISK_COLORS[result.overallRisk] || OVERALL_RISK_COLORS.Medium) : null

  const highAvail = result?.components?.filter(c => c.availability === 'High').length || 0
  const medAvail = result?.components?.filter(c => c.availability === 'Medium').length || 0
  const lowAvail = result?.components?.filter(c => c.availability === 'Low').length || 0

  const TABS = [
    { id: 'components', label: '📦 Components' },
    { id: 'tips', label: '💡 Tips' },
  ]

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI checks availability, lead times and suggests alternatives for each component
        </p>
        <button
          onClick={handleCheck}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🔍 Checking...' : '🔍 Check Stock'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Checking availability for {components.length} components...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Overall risk banner */}
          <div className={`rounded-xl border p-4 flex items-center gap-4 ${overallColors.bg} ${overallColors.border}`}>
            <span className="text-3xl">
              {result.overallRisk === 'Low' ? '✅' : result.overallRisk === 'Medium' ? '⚠️' : '🚨'}
            </span>
            <div className="flex-1">
              <p className={`font-bold text-sm ${overallColors.color}`}>
                Overall Procurement Risk: {result.overallRisk}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">{result.summary}</p>
            </div>
          </div>

          {/* Availability summary */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Easy to Find', value: highAvail, color: 'text-green-400', dot: '#22c55e' },
              { label: 'May Delay', value: medAvail, color: 'text-yellow-400', dot: '#f59e0b' },
              { label: 'Hard to Find', value: lowAvail, color: 'text-red-400', dot: '#ef4444' },
            ].map(item => (
              <div key={item.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dot }} />
                  <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                </div>
                <p className="text-slate-600 text-xs">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Components tab */}
          {activeTab === 'components' && (
            <div className="space-y-2">
              {result.components?.map((comp, i) => (
                <ComponentAvailabilityCard key={i} comp={comp} />
              ))}
            </div>
          )}

          {/* Tips tab */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              {result.procurementTips?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    📋 Procurement Tips
                  </h4>
                  <ul className="space-y-2">
                    {result.procurementTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                        <p className="text-slate-300">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.budgetOptimizations?.length > 0 && (
                <div className="bg-emerald-950 border border-emerald-900 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-3">
                    💰 Budget Optimizations
                  </h4>
                  <ul className="space-y-2">
                    {result.budgetOptimizations.map((opt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 shrink-0">$</span>
                        <p className="text-emerald-100">{opt}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCheck}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Re-check
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-white font-semibold mb-1">Component Stock Checker</p>
          <p className="text-slate-500 text-sm mb-4">
            AI analyses availability, lead times and alternatives for each component
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Availability rating</span>
            <span>✓ Lead times</span>
            <span>✓ Alternatives</span>
            <span>✓ Buy links</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockChecker