import { useState } from 'react'
import {
  getCostTracker,
  saveCostTracker,
  addExpense,
  updateExpense,
  deleteExpense,
  togglePurchased,
  getCostSummary,
  exportCostCSV,
  EXPENSE_CATEGORIES,
} from '../services/costTrackerService'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Component: '#6366f1',
  PCB: '#0ea5e9',
  Enclosure: '#22c55e',
  Tool: '#f59e0b',
  Shipping: '#a855f7',
  Service: '#ef4444',
  Other: '#64748b',
}

function CostTracker({ idea, components }) {
  const projectId = 'cost_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  const [data, setData] = useState(getCostTracker(projectId))
  const [showForm, setShowForm] = useState(false)
  const [budget, setBudget] = useState(String(data.budget || ''))
  const [form, setForm] = useState({
    name: '', category: 'Component', quantity: '1',
    unitPrice: '', supplier: '', notes: '',
  })
  const [filter, setFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('items')

  function refresh() {
    setData(getCostTracker(projectId))
  }

  function updateForm(key, value) {
    setForm(function(prev) { return Object.assign({}, prev, { [key]: value }) })
  }

  function handleAddExpense() {
    if (!form.name.trim() || !form.unitPrice) {
      notify.warning('Name and price are required')
      return
    }
    addExpense(projectId, form)
    setForm({ name: '', category: 'Component', quantity: '1', unitPrice: '', supplier: '', notes: '' })
    setShowForm(false)
    refresh()
    notify.success('Expense added!')
  }

  function handleSaveBudget() {
    const newData = Object.assign({}, data, { budget: parseFloat(budget) || 0 })
    saveCostTracker(projectId, newData)
    setData(newData)
    notify.success('Budget saved!')
  }

  function handleToggle(itemId) {
    togglePurchased(projectId, itemId)
    refresh()
  }

  function handleDelete(itemId) {
    deleteExpense(projectId, itemId)
    refresh()
    notify.success('Expense removed')
  }

  function handleImportFromPrototype() {
    components.forEach(function(comp) {
      const price = comp.estimatedPrice || '$5-15'
      const nums = price.match(/\d+/g) || ['10']
      const avg = nums.length > 1
        ? (parseInt(nums[0]) + parseInt(nums[nums.length - 1])) / 2
        : parseInt(nums[0])
      addExpense(projectId, {
        name: comp.name,
        category: 'Component',
        quantity: 1,
        unitPrice: avg,
        supplier: '',
      })
    })
    refresh()
    notify.success('Imported ' + components.length + ' components!')
  }

  const items = data.items || []
  const summary = getCostSummary(items)
  const budgetNum = parseFloat(budget) || 0
  const overBudget = budgetNum > 0 && summary.total > budgetNum

  const filtered = filter === 'All'
    ? items
    : filter === 'Unpurchased'
    ? items.filter(function(i) { return !i.purchased })
    : items.filter(function(i) { return i.category === filter })

  const categories = ['All', 'Unpurchased', ...EXPENSE_CATEGORIES]

  const TABS = [
    { id: 'items', label: '📋 Items' },
    { id: 'summary', label: '📊 Summary' },
  ]

  return (
    <div className="space-y-4">
      {/* Budget bar */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1">Budget ($)</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={budget}
                onChange={function(e) { setBudget(e.target.value) }}
                placeholder="Set budget..."
                className="w-28 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
              <button onClick={handleSaveBudget}
                className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition">
                Save
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total Spent</p>
            <p className={'text-xl font-black ' + (overBudget ? 'text-red-400' : 'text-green-400')}>
              ${summary.total.toFixed(2)}
            </p>
          </div>
        </div>
        {budgetNum > 0 && (
          <div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-2 mb-1">
              <div
                className={'h-2 rounded-full ' + (overBudget ? 'bg-red-600' : 'bg-green-600')}
                style={{ width: Math.min(100, (summary.total / budgetNum) * 100) + '%' }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Purchased: ${summary.purchased.toFixed(2)}</span>
              <span className={overBudget ? 'text-red-400' : 'text-slate-500'}>
                {overBudget ? 'Over by $' + (summary.total - budgetNum).toFixed(2) : 'Remaining: $' + (budgetNum - summary.total).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={function() { setShowForm(!showForm) }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition">
          + Add Expense
        </button>
        {components.length > 0 && items.length === 0 && (
          <button onClick={handleImportFromPrototype}
            className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
            📥 Import from Prototype
          </button>
        )}
        {items.length > 0 && (
          <button onClick={function() { exportCostCSV(items, projectId); notify.success('CSV exported!') }}
            className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
            ⬇️ Export CSV
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-2">
          <p className="text-white text-sm font-semibold">Add Expense</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <input value={form.name} onChange={function(e) { updateForm('name', e.target.value) }}
                placeholder="Item name *" className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500" />
            </div>
            <select value={form.category} onChange={function(e) { updateForm('category', e.target.value) }}
              className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none">
              {EXPENSE_CATEGORIES.map(function(c) { return <option key={c} value={c}>{c}</option> })}
            </select>
            <input type="number" value={form.unitPrice} onChange={function(e) { updateForm('unitPrice', e.target.value) }}
              placeholder="Unit price ($) *" className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none" />
            <input type="number" value={form.quantity} onChange={function(e) { updateForm('quantity', e.target.value) }}
              placeholder="Quantity" className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none" />
            <input value={form.supplier} onChange={function(e) { updateForm('supplier', e.target.value) }}
              placeholder="Supplier" className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={function() { setShowForm(false) }}
              className="flex-1 py-2 bg-[#0d0d1a] text-slate-400 rounded-lg text-xs">Cancel</button>
            <button onClick={handleAddExpense}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition">
              Add Expense
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {items.length > 0 && (
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 max-w-xs">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'items' && (
            <>
              {/* Category filter */}
              <div className="flex gap-1 flex-wrap">
                {categories.map(function(cat) {
                  const color = CATEGORY_COLORS[cat] || '#6366f1'
                  return (
                    <button key={cat} onClick={function() { setFilter(cat) }}
                      className={'text-xs px-2 py-1 rounded-lg border transition ' + (
                        filter === cat ? 'text-white' : 'bg-[#13131f] text-slate-500 border-[#2e2e4e]'
                      )}
                      style={filter === cat ? { backgroundColor: color, borderColor: color } : {}}>
                      {cat}
                    </button>
                  )
                })}
              </div>

              {/* Item list */}
              <div className="space-y-2">
                {filtered.map(function(item) {
                  const catColor = CATEGORY_COLORS[item.category] || '#6366f1'
                  const total = (item.unitPrice * item.quantity).toFixed(2)
                  return (
                    <div key={item.id}
                      className={'flex items-center gap-3 rounded-xl border p-3 transition ' + (
                        item.purchased ? 'opacity-60 bg-green-950 border-green-900' : 'bg-[#13131f] border-[#2e2e4e]'
                      )}>
                      <button onClick={function() { handleToggle(item.id) }}
                        className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ' + (
                          item.purchased ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e] hover:border-green-500'
                        )}>
                        {item.purchased && <span className="text-white text-xs">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={'text-sm font-medium ' + (item.purchased ? 'text-slate-500 line-through' : 'text-white')}>
                          {item.name}
                        </p>
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span style={{ color: catColor }}>{item.category}</span>
                          <span>×{item.quantity}</span>
                          {item.supplier && <span>{item.supplier}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-400">${total}</p>
                        <p className="text-xs text-slate-600">${item.unitPrice}/ea</p>
                      </div>
                      <button onClick={function() { handleDelete(item.id) }}
                        className="text-slate-600 hover:text-red-400 transition text-xs shrink-0">🗑</button>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total', value: '$' + summary.total.toFixed(2), color: 'text-white' },
                  { label: 'Purchased', value: '$' + summary.purchased.toFixed(2), color: 'text-green-400' },
                  { label: 'Remaining', value: '$' + summary.remaining.toFixed(2), color: 'text-yellow-400' },
                ].map(function(stat) {
                  return (
                    <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                      <p className={'text-lg font-black ' + stat.color}>{stat.value}</p>
                      <p className="text-slate-600 text-xs">{stat.label}</p>
                    </div>
                  )
                })}
              </div>

              {/* Category breakdown */}
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">By Category</p>
                {Object.entries(summary.byCategory).map(function(entry) {
                  const cat = entry[0]
                  const amount = entry[1]
                  const pct = (amount / summary.total) * 100
                  const color = CATEGORY_COLORS[cat] || '#6366f1'
                  return (
                    <div key={cat} className="flex items-center gap-2 mb-2">
                      <p className="text-xs w-20 shrink-0" style={{ color }}>{cat}</p>
                      <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: pct + '%', backgroundColor: color }} />
                      </div>
                      <span className="text-xs text-white font-mono w-16 text-right">${amount.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {items.length === 0 && !showForm && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-white font-semibold mb-1">Cost Tracker</p>
          <p className="text-slate-500 text-sm">Track actual spending vs estimates with purchase status</p>
        </div>
      )}
    </div>
  )
}

export default CostTracker