import { useState } from 'react'
import { estimateBuildCost } from '../services/costEstimator'
import { notify } from '../services/toast'

const SUPPLIERS = {
  amazon: { name: 'Amazon', icon: '📦', color: '#f59e0b', bg: '#2d2000', border: '#92400e' },
  aliexpress: { name: 'AliExpress', icon: '🌏', color: '#ef4444', bg: '#2d1b1b', border: '#991b1b' },
  localStore: { name: 'Local Store', icon: '🏪', color: '#22c55e', bg: '#14293d', border: '#166534' },
}

function PriceTag({ price, isLowest, supplier }) {
  const sup = SUPPLIERS[supplier]
  return (
    <div
      className={`rounded-lg px-3 py-2 text-center transition ${
        isLowest ? 'ring-2' : ''
      }`}
      style={{
        backgroundColor: sup.bg,
        borderColor: isLowest ? sup.color : sup.border,
        border: '1px solid',
        ringColor: sup.color,
      }}
    >
      <p className="text-xs mb-0.5" style={{ color: sup.color }}>
        {sup.icon} {sup.name}
      </p>
      <p className="font-bold text-sm" style={{ color: isLowest ? sup.color : '#fff' }}>
        ${price?.toFixed(2)}
      </p>
      {isLowest && (
        <p className="text-xs mt-0.5" style={{ color: sup.color }}>Cheapest</p>
      )}
    </div>
  )
}

function CostEstimator({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState('amazon')
  const [showAdditional, setShowAdditional] = useState(false)

  async function handleEstimate() {
    setLoading(true)
    setResult(null)
    try {
      const data = await estimateBuildCost(idea, components)
      setResult(data)
      notify.success('Cost estimate ready! Cheapest: ' + data.cheapestSupplier)
    } catch {
      notify.error('Cost estimation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">💰 Build Cost Estimator</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Compare prices across Amazon, AliExpress, and local stores
          </p>
        </div>
        <button
          onClick={handleEstimate}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? '💰 Estimating...' : '💰 Estimate Cost'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Comparing prices across suppliers...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">

          {/* Total cost summary */}
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(SUPPLIERS).map(([key, sup]) => (
              <div
                key={key}
                onClick={() => setSelectedSupplier(key)}
                className={`rounded-xl border p-4 text-center cursor-pointer transition ${
                  selectedSupplier === key ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: sup.bg,
                  borderColor: key === result.cheapestSupplier?.toLowerCase().replace(' ', '') ? sup.color : sup.border,
                }}
              >
                <div className="text-2xl mb-1">{sup.icon}</div>
                <p className="text-xs mb-1" style={{ color: sup.color }}>{sup.name}</p>
                <p className="text-xl font-black text-white">
                  ${result.totals?.[key]?.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {result.timeToDeliver?.[key]}
                </p>
                {result.cheapestSupplier?.toLowerCase().includes(sup.name.toLowerCase().split(' ')[0]) && (
                  <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: sup.color + '30', color: sup.color }}>
                    Cheapest ✓
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="bg-indigo-950 border border-indigo-900 rounded-xl px-4 py-3">
            <p className="text-indigo-300 text-sm">
              💡 <span className="text-white font-medium">{result.recommendation}</span>
            </p>
          </div>

          {/* Per component breakdown */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Component Price Breakdown
            </h4>
            <div className="space-y-4">
              {result.components?.map((comp, i) => {
                const prices = [comp.amazon, comp.aliexpress, comp.localStore]
                const minPrice = Math.min(...prices.filter(Boolean))
                return (
                  <div key={i} className="border-b border-[#2e2e4e] pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white text-sm font-medium">{comp.name}</p>
                        {comp.notes && (
                          <p className="text-slate-600 text-xs">{comp.notes}</p>
                        )}
                      </div>
                      <span className="text-slate-500 text-xs">×{comp.quantity}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <PriceTag price={comp.amazon} isLowest={comp.amazon === minPrice} supplier="amazon" />
                      <PriceTag price={comp.aliexpress} isLowest={comp.aliexpress === minPrice} supplier="aliexpress" />
                      <PriceTag price={comp.localStore} isLowest={comp.localStore === minPrice} supplier="localStore" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Delivery times */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              📅 Delivery Times
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(SUPPLIERS).map(([key, sup]) => (
                <div key={key} className="text-center">
                  <p className="text-lg mb-1">{sup.icon}</p>
                  <p className="text-xs font-medium" style={{ color: sup.color }}>{sup.name}</p>
                  <p className="text-white text-sm font-bold mt-1">
                    {result.timeToDeliver?.[key]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional costs */}
          {result.additionalCosts?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShowAdditional(!showAdditional)}
              >
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  🔧 Additional Tools Needed ({result.additionalCosts.length})
                </h4>
                <span className="text-slate-600 text-xs">{showAdditional ? '↑' : '↓'}</span>
              </div>
              {showAdditional && (
                <div className="mt-3 space-y-2">
                  {result.additionalCosts.map((item, i) => (
                    <div key={i} className="flex justify-between items-start py-2 border-b border-[#2e2e4e] last:border-0">
                      <div>
                        <p className="text-white text-sm">{item.item}</p>
                        <p className="text-slate-500 text-xs">{item.note}</p>
                      </div>
                      <p className="text-emerald-400 font-semibold text-sm">${item.cost}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-[#2e2e4e]">
                    <span className="text-slate-400 text-sm">Total with tools</span>
                    <span className="text-white font-bold">${result.totalWithTools?.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Budget tip */}
          {result.budgetTip && (
            <div className="bg-emerald-950 border border-emerald-900 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-emerald-400 mb-1">💡 Budget Tip</p>
              <p className="text-emerald-100 text-sm">{result.budgetTip}</p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default CostEstimator