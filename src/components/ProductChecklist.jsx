import { useState } from 'react'
import { generateProductChecklist, saveChecklist, getChecklist } from '../services/productChecklistService'
import { notify } from '../services/toast'

const CAT_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6']

function ProductChecklist({ idea, components }) {
  const saved = getChecklist(idea)
  const [result, setResult] = useState(saved?.result || null)
  const [checked, setChecked] = useState(saved?.checked || {})
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateProductChecklist(idea, components)
      setResult(data)
      setChecked({})
      saveChecklist(idea, data, {})
      notify.success('Product checklist ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleItem(catIdx, itemIdx) {
    const key = catIdx + '_' + itemIdx
    const newChecked = Object.assign({}, checked, { [key]: !checked[key] })
    setChecked(newChecked)
    saveChecklist(idea, result, newChecked)
  }

  const categories = result?.categories || []
  const allItems = categories.flatMap(function(c, ci) { return (c.items || []).map(function(item, ii) { return { key: ci + '_' + ii, critical: item.critical } }) })
  const totalItems = allItems.length
  const checkedCount = allItems.filter(function(i) { return checked[i.key] }).length
  const criticalItems = allItems.filter(function(i) { return i.critical && !checked[i.key] }).length
  const overallPct = totalItems > 0 ? Math.round(checkedCount / totalItems * 100) : 0
  const scoreColor = overallPct >= 80 ? '#22c55e' : overallPct >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Complete checklist to go from prototype to shippable product</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Building...' : 'Build Checklist'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building product checklist...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#1e1e2e" strokeWidth="5" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke={scoreColor} strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - overallPct / 100)} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm font-black" style={{ color: scoreColor }}>{overallPct}%</p>
                </div>
              </div>
              <div>
                <p className="text-white font-bold">Product Readiness</p>
                <p className="text-slate-400 text-xs">{checkedCount}/{totalItems} tasks complete</p>
                {criticalItems > 0 && (
                  <p className="text-red-400 text-xs">{criticalItems} critical items remaining</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.map(function(cat, i) {
              const color = CAT_COLORS[i % CAT_COLORS.length]
              const catChecked = (cat.items || []).filter(function(item, j) { return checked[i + '_' + j] }).length
              return (
                <button key={i} onClick={function() { setActiveCategory(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition text-left ' + (activeCategory === i ? 'text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}
                  style={activeCategory === i ? { backgroundColor: color } : {}}>
                  <p>{cat.icon} {cat.name}</p>
                  <p className="opacity-70">{catChecked}/{(cat.items || []).length}</p>
                </button>
              )
            })}
          </div>

          {categories[activeCategory] && (
            <div className="space-y-2">
              {(categories[activeCategory].items || []).map(function(item, j) {
                const key = activeCategory + '_' + j
                const done = !!checked[key]
                return (
                  <div key={j} onClick={function() { toggleItem(activeCategory, j) }}
                    className={'flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ' + (done ? 'bg-[#0d0d1a] border-[#1e1e2e] opacity-60' : item.critical ? 'bg-red-950 border-red-900 hover:border-red-700' : 'bg-[#13131f] border-[#2e2e4e] hover:border-emerald-700')}>
                    <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ' + (done ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e]')}>
                      {done && <span className="text-white text-xs">v</span>}
                    </div>
                    <div className="flex-1">
                      <p className={'text-sm ' + (done ? 'line-through text-slate-500' : item.critical ? 'text-red-200 font-medium' : 'text-white')}>{item.task}</p>
                      {item.notes && <p className="text-slate-500 text-xs">{item.notes}</p>}
                    </div>
                    {item.critical && !done && (
                      <span className="text-xs bg-red-900 text-red-300 border border-red-700 px-1.5 py-0.5 rounded-full shrink-0">Critical</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate Checklist</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🚀</div>
          <p className="text-white font-semibold mb-1">Prototype to Product Checklist</p>
          <p className="text-slate-500 text-sm">Complete checklist covering hardware, software, compliance and launch readiness</p>
        </div>
      )}
    </div>
  )
}

export default ProductChecklist
