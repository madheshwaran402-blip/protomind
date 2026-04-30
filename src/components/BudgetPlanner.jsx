import { useState, useEffect } from 'react'
import {
  getBudget,
  saveBudget,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  getBudgetSummary,
  importComponentsTobudget,
  exportBudgetCSV,
} from '../services/budgetService'
import { notify } from '../services/toast'

const SUPPLIERS = ['Amazon', 'AliExpress', 'Mouser', 'DigiKey', 'Adafruit', 'Local Store', 'eBay', 'Other']
const CATEGORIES = ['Component', 'Tool', 'PCB', 'Enclosure', 'Wire', 'Consumable', 'Shipping', 'Other']

const SUPPLIER_COLORS = {
  Amazon: 'text-yellow-400',
  AliExpress: 'text-red-400',
  Mouser: 'text-blue-400',
  DigiKey: 'text-sky-400',
  Adafruit: 'text-pink-400',
  'Local Store': 'text-green-400',
}

function BudgetPlanner({ idea, components }) {
  const [budget, setBudget] = useState(getBudget(idea))
  const [summary, setSummary] = useState(getBudgetSummary(idea))
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newItem, setNewItem] = useState({
    name: '', quantity: 1, unitPrice: '', supplier: '', category: 'Component',
  })
  const [budgetInput, setBudgetInput] = useState(getBudget(idea).totalBudget || '')
  const [activeTab, setActiveTab] = useState('items')

  useEffect(() => {
    const b = getBudget(idea)
    setBudget(b)
    setSummary(getBudgetSummary(idea))
    setBudgetInput(b.totalBudget || '')
  }, [idea])

  function refresh() {
    setBudget(getBudget(idea))
    setSummary(getBudgetSummary(idea))
  }

  function handleSetBudget() {
    const b = getBudget(idea)
    b.totalBudget = parseFloat(budgetInput) || 0
    saveBudget(idea, b)
    refresh()
    notify.success('Budget set to $' + b.totalBudget.toFixed(2))
  }

  function handleAddItem() {
    if (!newItem.name.trim()) {
      notify.warning('Item name required')
      return
    }
    addBudgetItem(idea, {
      ...newItem,
      unitPrice: parseFloat(newItem.unitPrice) || 0,
    })
    refresh()
    setNewItem({ name: '', quantity: 1, unitPrice: '', supplier: '', category: 'Component' })
    setShowAddForm(false)
    notify.success('Item added to budget!')
  }

  function handleTogglePurchased(itemId, current) {
    updateBudgetItem(idea, itemId, { purchased: !current })
    refresh()
  }

  function handleUpdatePrice(itemId, price) {
    updateBudgetItem(idea, itemId, { unitPrice: parseFloat(price) || 0 })
    refresh()
  }

  function handleDelete(itemId) {
    deleteBudgetItem(idea, itemId)
    refresh()
    notify.success('Item removed')
  }

  function handleImportComponents() {
    const result = importComponentsTobudget(idea, components)
    refresh()
    notify.success('Added ' + result.added + ' component' + (result.added !== 1 ? 's' : '') + ' to budget!')
  }

  const budgetColor = summary.isOverBudget
    ? 'text-red-400'
    : summary.percentUsed > 80
    ? 'text-yellow-400'
    : 'text-green-400'

  const barColor = summary.isOverBudget
    ? 'bg-red-500'
    : summary.percentUsed > 80
    ? 'bg-yellow-500'
    : 'bg-emerald-500'

  const TABS = [
    { id: 'items', label: '📋 Items' },
    { id: 'summary', label: '📊 Summary' },
  ]

  return (
    <div className="space-y-4">

      {/* Budget setter */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-2">Total Project Budget</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3">
            <span className="text-slate-500 text-sm">$</span>
            <input
              type="number"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent py-2.5 text-white text-sm outline-none"
            />
          </div>
          <button
            onClick={handleSetBudget}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            Set
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Budget', value: '$' + summary.totalBudget.toFixed(2), color: 'text-slate-300' },
          { label: 'Spent', value: '$' + summary.totalSpent.toFixed(2), color: budgetColor },
          { label: 'Remaining', value: '$' + Math.abs(summary.remaining).toFixed(2) + (summary.isOverBudget ? ' over' : ''), color: budgetColor },
        ].map(item => (
          <div key={item.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
            <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
            <p className="text-slate-600 text-xs">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {summary.totalBudget > 0 && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">{summary.percentUsed.toFixed(0)}% used</span>
            <span className={budgetColor}>{summary.isOverBudget ? '⚠️ Over Budget!' : 'On Track'}</span>
          </div>
          <div className="w-full bg-[#1e1e2e] rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${barColor}`}
              style={{ width: Math.min(summary.percentUsed, 100) + '%' }}
            />
          </div>
        </div>
      )}

      {summary.isOverBudget && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-3">
          <p className="text-red-400 text-xs font-semibold">
            ⚠️ Over budget by ${Math.abs(summary.remaining).toFixed(2)} — consider removing non-essential items or increasing your budget
          </p>
        </div>
      )}

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

      {/* Items tab */}
      {activeTab === 'items' && (
        <div className="space-y-2">

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleImportComponents}
              className="flex-1 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
            >
              📥 Import Components
            </button>
            <button
              onClick={() => { exportBudgetCSV(idea); notify.success('Budget exported!') }}
              disabled={budget.items.length === 0}
              className="flex-1 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition disabled:opacity-50"
            >
              ⬇️ Export CSV
            </button>
          </div>

          {/* Items list */}
          {budget.items.length === 0 && !showAddForm && (
            <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-slate-500 text-sm">No items yet</p>
              <p className="text-slate-600 text-xs mt-1">Add items or import from components</p>
            </div>
          )}

          {budget.items.map(item => {
            const total = item.unitPrice * item.quantity
            const isEditing = editingId === item.id
            return (
              <div
                key={item.id}
                className={`bg-[#13131f] border rounded-xl p-3 transition ${
                  item.purchased ? 'border-green-900 opacity-70' : 'border-[#2e2e4e]'
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleTogglePurchased(item.id, item.purchased)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                      item.purchased ? 'bg-green-600 border-green-600' : 'border-slate-600 hover:border-green-500'
                    }`}
                  >
                    {item.purchased && <span className="text-white text-xs">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${item.purchased ? 'line-through text-slate-500' : 'text-white'}`}>
                        {item.name}
                      </p>
                      <span className="text-slate-600 text-xs">×{item.quantity}</span>
                      {item.supplier && (
                        <span className={`text-xs ${SUPPLIER_COLORS[item.supplier] || 'text-slate-500'}`}>
                          {item.supplier}
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex gap-1 mt-1">
                        <input
                          type="number"
                          defaultValue={item.unitPrice}
                          onBlur={e => {
                            handleUpdatePrice(item.id, e.target.value)
                            setEditingId(null)
                          }}
                          autoFocus
                          className="w-24 bg-[#0d0d1a] border border-indigo-500 rounded-lg px-2 py-1 text-white text-xs outline-none"
                          placeholder="Unit price"
                        />
                        <select
                          defaultValue={item.supplier}
                          onChange={e => { updateBudgetItem(idea, item.id, { supplier: e.target.value }); refresh() }}
                          className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-2 py-1 text-white text-xs outline-none"
                        >
                          <option value="">Supplier</option>
                          {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs">
                        ${item.unitPrice.toFixed(2)} × {item.quantity} =
                        <span className="text-white ml-1">${total.toFixed(2)}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditingId(isEditing ? null : item.id)}
                      className="text-slate-600 hover:text-indigo-400 text-xs transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-600 hover:text-red-400 text-xs transition"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add item form */}
          {showAddForm ? (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-2">
              <input
                value={newItem.name}
                onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Item name"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={e => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  placeholder="Qty"
                  className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
                />
                <input
                  type="number"
                  value={newItem.unitPrice}
                  onChange={e => setNewItem(prev => ({ ...prev, unitPrice: e.target.value }))}
                  placeholder="Unit price $"
                  className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
                />
                <select
                  value={newItem.supplier}
                  onChange={e => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                  className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
                >
                  <option value="">Supplier</option>
                  {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <select
                value={newItem.category}
                onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={handleAddItem} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition">
                  Add Item
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-xs transition">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-[#2e2e4e] hover:border-indigo-700 text-slate-500 hover:text-indigo-400 rounded-xl text-sm transition"
            >
              + Add Item
            </button>
          )}
        </div>
      )}

      {/* Summary tab */}
      {activeTab === 'summary' && (
        <div className="space-y-3">
          {/* By category */}
          {budget.items.length > 0 && (() => {
            const byCategory = {}
            budget.items.forEach(item => {
              const cat = item.category || 'Other'
              if (!byCategory[cat]) byCategory[cat] = 0
              byCategory[cat] += item.unitPrice * item.quantity
            })
            return (
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Spending by Category</h4>
                <div className="space-y-2">
                  {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                    const pct = summary.totalSpent > 0 ? (amount / summary.totalSpent) * 100 : 0
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <p className="text-slate-400 text-xs w-24 shrink-0">{cat}</p>
                        <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
                          <div className="h-2 bg-indigo-600 rounded-full" style={{ width: pct + '%' }} />
                        </div>
                        <span className="text-slate-300 text-xs w-14 text-right shrink-0">${amount.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* By supplier */}
          {budget.items.some(i => i.supplier) && (() => {
            const bySupplier = {}
            budget.items.filter(i => i.supplier).forEach(item => {
              if (!bySupplier[item.supplier]) bySupplier[item.supplier] = 0
              bySupplier[item.supplier] += item.unitPrice * item.quantity
            })
            return (
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Spending by Supplier</h4>
                <div className="space-y-2">
                  {Object.entries(bySupplier).sort((a, b) => b[1] - a[1]).map(([sup, amount]) => (
                    <div key={sup} className="flex items-center justify-between">
                      <span className={`text-sm ${SUPPLIER_COLORS[sup] || 'text-slate-400'}`}>{sup}</span>
                      <span className="text-white text-sm font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Purchase progress */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Purchase Progress</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-white text-lg font-bold">{summary.purchasedCount}</p>
                <p className="text-slate-600 text-xs">Purchased</p>
              </div>
              <div>
                <p className="text-white text-lg font-bold">{summary.itemCount - summary.purchasedCount}</p>
                <p className="text-slate-600 text-xs">Remaining</p>
              </div>
              <div>
                <p className="text-emerald-400 text-lg font-bold">${summary.totalPurchased.toFixed(2)}</p>
                <p className="text-slate-600 text-xs">Spent so far</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetPlanner