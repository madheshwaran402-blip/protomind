import { useState } from 'react'
import { optimizeBOM, exportBOMCSV } from '../services/bomOptimizerService'
import { notify } from '../services/toast'

const SUPPLIER_COLORS = {
  AliExpress: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  Amazon: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Local: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
}

function PriceCompareBar({ ali, amazon, local }) {
  const max = Math.max(ali || 0, amazon || 0, local || 0, 0.01)
  return (
    <div className="space-y-1 mt-2">
      {[
        { label: 'Ali', value: ali || 0, color: '#ef4444' },
        { label: 'Amazon', value: amazon || 0, color: '#f59e0b' },
        { label: 'Local', value: local || 0, color: '#22c55e' },
      ].map(function(item) {
        return (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-slate-500 text-xs w-12 shrink-0">{item.label}</span>
            <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full"
                style={{ width: (item.value / max * 100) + '%', backgroundColor: item.color }}
              />
            </div>
            <span className="text-xs font-mono shrink-0" style={{ color: item.color }}>
              ${item.value.toFixed(2)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function BOMOptimizer({ components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('table')
  const [activeSupplier, setActiveSupplier] = useState('aliexpress')

  async function handleOptimize() {
    if (components.length === 0) {
      notify.warning('No components to optimize')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await optimizeBOM(components)
      setResult(data)
      notify.success('BOM optimized! Check the savings breakdown.')
    } catch (err) {
      notify.error('Optimization failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'table', label: '📋 BOM Table' },
    { id: 'savings', label: '💰 Savings' },
    { id: 'tips', label: '💡 Tips' },
  ]

  const SUPPLIERS = [
    { id: 'aliexpress', label: 'AliExpress', icon: '🌏', color: '#ef4444' },
    { id: 'amazon', label: 'Amazon', icon: '📦', color: '#f59e0b' },
    { id: 'local', label: 'Local', icon: '🏪', color: '#22c55e' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI finds the cheapest supplier combination for your full BOM
        </p>
        <button
          onClick={handleOptimize}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🔍 Optimizing...' : '🔍 Optimize BOM'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is finding the best prices...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Supplier cost cards */}
          <div className="grid grid-cols-3 gap-2">
            {SUPPLIERS.map(function(sup) {
              const total = result.grandTotal ? (result.grandTotal[sup.id] || 0) : 0
              const parts = result.totals ? (result.totals[sup.id] || 0) : 0
              const ship = result.shipping ? (result.shipping[sup.id] || 0) : 0
              const isRecommended = result.totals && result.totals.recommended === sup.id
              return (
                <div
                  key={sup.id}
                  className={`rounded-xl border p-3 text-center transition cursor-pointer ${
                    isRecommended
                      ? 'border-yellow-600 bg-yellow-950'
                      : activeSupplier === sup.id
                      ? 'border-indigo-700 bg-indigo-950'
                      : 'border-[#2e2e4e] bg-[#13131f]'
                  }`}
                  onClick={function() { setActiveSupplier(sup.id) }}
                >
                  {isRecommended && (
                    <p className="text-yellow-400 text-xs font-bold mb-1">⭐ Best</p>
                  )}
                  <p className="text-lg mb-1">{sup.icon}</p>
                  <p className="text-xs text-slate-500 mb-0.5">{sup.label}</p>
                  <p className="font-black text-base" style={{ color: sup.color }}>
                    ${total.toFixed(2)}
                  </p>
                  <p className="text-slate-600 text-xs">
                    parts ${parts.toFixed(2)} + ship ${ship.toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Savings banner */}
          {result.savings && (
            <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-4 flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <p className="text-emerald-400 font-bold text-sm">Potential Savings with AliExpress</p>
                <p className="text-emerald-300 text-xs">
                  vs Amazon: save ${(result.savings.vsAmazon || 0).toFixed(2)} ·
                  vs Local: save ${(result.savings.vsLocal || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Export */}
          <button
            onClick={function() { exportBOMCSV(result, components); notify.success('BOM exported!') }}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
          >
            ⬇️ Export Optimized BOM as CSV
          </button>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button
                  key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* BOM Table */}
          {activeTab === 'table' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2e2e4e] bg-[#0d0d1a]">
                      <th className="text-left px-3 py-2 text-slate-500">Component</th>
                      <th className="text-left px-3 py-2 text-slate-500">Ali</th>
                      <th className="text-left px-3 py-2 text-slate-500">Amazon</th>
                      <th className="text-left px-3 py-2 text-slate-500">Local</th>
                      <th className="text-left px-3 py-2 text-slate-500">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.items || []).map(function(item, i) {
                      const sup = SUPPLIER_COLORS[item.bestSupplier] || SUPPLIER_COLORS.AliExpress
                      return (
                        <tr key={i} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1e1e2e] transition">
                          <td className="px-3 py-2.5">
                            <p className="text-white font-medium">{item.name}</p>
                            {item.notes && <p className="text-slate-600 text-xs">{item.notes}</p>}
                          </td>
                          <td className="px-3 py-2.5 text-red-400 font-mono">${(item.unitCostAli || 0).toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-yellow-400 font-mono">${(item.unitCostAmazon || 0).toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-green-400 font-mono">${(item.unitCostLocal || 0).toFixed(2)}</td>
                          <td className="px-3 py-2.5">
                            <span className={'text-xs px-2 py-0.5 rounded-full border ' + sup.color + ' ' + sup.bg + ' ' + sup.border}>
                              {item.bestSupplier}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Savings tab */}
          {activeTab === 'savings' && (
            <div className="space-y-3">
              {(result.items || []).map(function(item, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white text-sm font-semibold mb-1">{item.name}</p>
                    <PriceCompareBar
                      ali={item.unitCostAli}
                      amazon={item.unitCostAmazon}
                      local={item.unitCostLocal}
                    />
                    {item.bulkDiscount && (
                      <p className="text-emerald-400 text-xs mt-2">💡 {item.bulkDiscount}</p>
                    )}
                  </div>
                )
              })}

              {result.bulkOpportunities && result.bulkOpportunities.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">📦 Bulk Buying Opportunities</p>
                  <ul className="space-y-1">
                    {result.bulkOpportunities.map(function(opp, i) {
                      return (
                        <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                          <span className="text-indigo-400 shrink-0">→</span>
                          {opp}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tips tab */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              {result.procurementOrder && result.procurementOrder.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    🛒 Recommended Order of Purchase
                  </p>
                  <ol className="space-y-2">
                    {result.procurementOrder.map(function(step, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                          <p className="text-slate-300">{step}</p>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}

              {result.tips && result.tips.length > 0 && (
                <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
                  <p className="text-yellow-400 text-xs font-semibold mb-2">💡 Pro Tips</p>
                  <ul className="space-y-2">
                    {result.tips.map(function(tip, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-yellow-400 shrink-0">•</span>
                          <p className="text-yellow-100">{tip}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleOptimize}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Re-optimize
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">💰</div>
          <p className="text-white font-semibold mb-1">BOM Cost Optimizer</p>
          <p className="text-slate-500 text-sm mb-4">
            Compare AliExpress, Amazon and local prices for every component
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ 3 supplier comparison</span>
            <span>✓ Bulk discounts</span>
            <span>✓ Shipping included</span>
            <span>✓ CSV export</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BOMOptimizer