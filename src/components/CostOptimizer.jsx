import { useState } from 'react'
import { optimizeCosts, saveBudget, getBudget } from '../services/costOptimizerService'
import { notify } from '../services/toast'

const BUDGET_STATUS_STYLES = {
  'Under Budget': { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅' },
  'On Budget': { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚖️' },
  'Over Budget': { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '⚠️' },
}

const PRIORITY_STYLES = {
  Essential: 'text-red-400 bg-red-950 border-red-800',
  Important: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Optional: 'text-green-400 bg-green-950 border-green-800',
  'Nice to have': 'text-slate-400 bg-slate-900 border-slate-700',
}

function CostOptimizer({ idea, components }) {
  const saved = getBudget(idea)
  const [budget, setBudget] = useState(saved?.budget || '50')
  const [result, setResult] = useState(saved?.result || null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const totalMin = components.reduce(function(sum, c) {
    return sum + parseInt((c.estimatedPrice || '$5').match(/\d+/)?.[0] || '5')
  }, 0)
  const totalMax = components.reduce(function(sum, c) {
    const matches = (c.estimatedPrice || '$15').match(/\d+/g) || ['15']
    return sum + parseInt(matches[matches.length - 1])
  }, 0)

  async function handleOptimize() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await optimizeCosts(idea, components, budget)
      setResult(data)
      saveBudget(idea, { budget, result: data })
      notify.success('Cost analysis complete!')
    } catch {
      notify.error('Optimization failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const budgetNum = parseFloat(budget) || 50
  const overBudget = totalMin > budgetNum
  const statusStyle = result ? (BUDGET_STATUS_STYLES[result.budgetStatus] || BUDGET_STATUS_STYLES['On Budget']) : null
  const totalSavings = result ? (result.savings || []).reduce(function(sum, s) { return sum + (parseFloat(s.saving) || 0) }, 0) : 0

  const TABS = [
    { id: 'overview', label: '💰 Overview' },
    { id: 'savings', label: '💸 Savings' },
    { id: 'priority', label: '📋 Priority' },
  ]

  return (
    <div className="space-y-4">
      {/* Budget input */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Target Budget</p>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">$</span>
              <input
                type="number"
                value={budget}
                onChange={function(e) { setBudget(e.target.value) }}
                className="w-24 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
              <span className="text-slate-500 text-xs">USD</span>
            </div>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-slate-500 mb-1">Current Estimate</p>
            <p className={'font-bold ' + (overBudget ? 'text-red-400' : 'text-green-400')}>
              ${totalMin}–${totalMax}
            </p>
          </div>
        </div>

        {/* Budget bar */}
        <div>
          <div className="w-full bg-[#1e1e2e] rounded-full h-3 relative overflow-hidden">
            <div
              className={'h-3 rounded-full transition-all ' + (overBudget ? 'bg-red-600' : 'bg-green-600')}
              style={{ width: Math.min(100, (totalMin / budgetNum) * 100) + '%' }}
            />
            <div className="absolute top-0 bottom-0 border-r-2 border-white border-dashed"
              style={{ left: '100%', transform: 'translateX(-2px)' }} />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-500">$0</span>
            <span className={overBudget ? 'text-red-400' : 'text-slate-500'}>
              Budget: ${budgetNum}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleOptimize}
        disabled={loading || components.length === 0}
        className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? '💰 Analysing...' : '💰 Optimise Budget'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing costs...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Status banner */}
          <div className={'rounded-2xl border p-4 flex items-center gap-4 ' + statusStyle.bg + ' ' + statusStyle.border}>
            <span className="text-3xl">{statusStyle.icon}</span>
            <div className="flex-1">
              <p className={'font-black text-lg ' + statusStyle.color}>{result.budgetStatus}</p>
              <div className="flex gap-4 text-xs mt-1">
                <span className="text-slate-400">Min: <span className="text-white font-bold">${result.totalMin}</span></span>
                <span className="text-slate-400">Max: <span className="text-white font-bold">${result.totalMax}</span></span>
                {totalSavings > 0 && (
                  <span className="text-green-400 font-bold">Potential savings: ${totalSavings.toFixed(0)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-2">
              {components.map(function(comp, i) {
                const price = comp.estimatedPrice || '$5-15'
                const nums = price.match(/\d+/g) || ['5']
                const min = parseInt(nums[0])
                const max = parseInt(nums[nums.length - 1])
                const pct = (min / budgetNum) * 100
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{comp.icon}</span>
                      <p className="text-white text-xs font-medium flex-1 truncate">{comp.name}</p>
                      <span className="text-emerald-400 text-xs font-mono font-bold">{price}</span>
                    </div>
                    <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
                      <div className="h-1.5 bg-indigo-600 rounded-full"
                        style={{ width: Math.min(100, pct) + '%' }} />
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5">{pct.toFixed(1)}% of budget</p>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'savings' && (
            <div className="space-y-3">
              {result.savings && result.savings.length > 0 ? (
                <>
                  {result.savings.map(function(saving, i) {
                    return (
                      <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold text-sm">{saving.component}</p>
                          <span className="text-green-400 font-bold text-sm">Save ${saving.saving}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <span className="text-red-400 line-through">{saving.currentPrice}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-green-400 font-bold">{saving.suggestedPrice}</span>
                          <span className="text-slate-500 flex-1">{saving.suggestion}</span>
                        </div>
                        {saving.tradeoff && (
                          <p className="text-yellow-400 text-xs">⚠️ Trade-off: {saving.tradeoff}</p>
                        )}
                      </div>
                    )
                  })}
                  {result.bulkDeals && result.bulkDeals.length > 0 && (
                    <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                      <p className="text-indigo-400 text-xs font-semibold mb-2">🛒 Bulk Deal Opportunities</p>
                      {result.bulkDeals.map(function(deal, i) {
                        return (
                          <div key={i} className="mb-2">
                            <p className="text-white text-xs font-medium">{deal.supplier}</p>
                            <p className="text-slate-400 text-xs">{(deal.components || []).join(', ')}</p>
                            <p className="text-green-400 text-xs">Save: {deal.saving}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No savings opportunities found</p>
              )}
            </div>
          )}

          {activeTab === 'priority' && (
            <div className="space-y-2">
              {(result.priorityList || []).map(function(item, i) {
                const pStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES['Nice to have']
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <span className={'text-xs px-1.5 py-0.5 rounded border shrink-0 ' + pStyle}>{item.priority}</span>
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">{item.component}</p>
                      <p className="text-slate-500 text-xs">{item.reason}</p>
                    </div>
                    {item.canSkip && (
                      <span className="text-green-400 text-xs shrink-0">Can skip</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleOptimize}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Re-analyse
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-white font-semibold mb-1">Cost Optimizer</p>
          <p className="text-slate-500 text-sm">Set your budget and AI finds savings opportunities</p>
        </div>
      )}
    </div>
  )
}

export default CostOptimizer