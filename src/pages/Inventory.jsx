import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getInventoryStats,
  exportInventoryCSV,
} from '../services/inventoryService'
import { notify } from '../services/toast'

const CATEGORIES = ['Microcontroller', 'Sensor', 'Display', 'Communication', 'Power', 'Actuator', 'Module', 'Passive', 'Tool', 'Other']
const CATEGORY_ICONS = {
  Microcontroller: '🔵', Sensor: '📡', Display: '🖥️', Communication: '📶',
  Power: '🔋', Actuator: '⚙️', Module: '📦', Passive: '🔌', Tool: '🔧', Other: '📦',
}
const LOCATIONS = ['Drawer 1', 'Drawer 2', 'Box A', 'Box B', 'Shelf', 'Desk', 'Workshop', 'Other']

const EMPTY_FORM = {
  name: '', category: 'Microcontroller', quantity: 1, minStock: 1,
  location: '', supplier: '', unitCost: 0, notes: '', icon: '🔵',
}

function StockBadge({ quantity, minStock }) {
  if (quantity === 0) {
    return <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full">Out of Stock</span>
  }
  if (quantity <= minStock) {
    return <span className="text-xs bg-yellow-950 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded-full">Low Stock</span>
  }
  return <span className="text-xs bg-green-950 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">In Stock</span>
}

function InventoryRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [qty, setQty] = useState(item.quantity)

  function handleQtyChange(delta) {
    const newQty = Math.max(0, qty + delta)
    setQty(newQty)
    onUpdate(item.id, { quantity: newQty })
  }

  function handleQtyInput(val) {
    const newQty = Math.max(0, parseInt(val) || 0)
    setQty(newQty)
    onUpdate(item.id, { quantity: newQty })
  }

  return (
    <tr className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1e1e2e] transition">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{item.icon || CATEGORY_ICONS[item.category] || '📦'}</span>
          <div>
            <p className="text-white text-sm font-medium">{item.name}</p>
            <p className="text-slate-500 text-xs">{item.category}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={function() { handleQtyChange(-1) }}
            className="w-6 h-6 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-white rounded text-xs transition"
          >
            -
          </button>
          <input
            type="number"
            value={qty}
            onChange={function(e) { handleQtyInput(e.target.value) }}
            className="w-12 bg-[#0d0d1a] border border-[#2e2e4e] rounded text-center text-white text-xs py-1 outline-none"
            min="0"
          />
          <button
            onClick={function() { handleQtyChange(1) }}
            className="w-6 h-6 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-white rounded text-xs transition"
          >
            +
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <StockBadge quantity={qty} minStock={item.minStock} />
      </td>
      <td className="px-4 py-3 text-slate-400 text-xs">{item.location || '—'}</td>
      <td className="px-4 py-3 text-emerald-400 text-xs font-mono">
        ${(qty * item.unitCost).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={function() { onDelete(item.id) }}
          className="text-slate-600 hover:text-red-400 text-xs transition"
        >
          🗑
        </button>
      </td>
    </tr>
  )
}

function AddItemModal({ onAdd, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)

  function updateForm(key, value) {
    setForm(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = value
      if (key === 'category') next.icon = CATEGORY_ICONS[value] || '📦'
      return next
    })
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      notify.warning('Enter a component name')
      return
    }
    onAdd(form)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={function(e) { e.stopPropagation() }}
      >
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <p className="text-white font-bold">Add Component to Inventory</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">Component Name *</p>
              <input
                value={form.name}
                onChange={function(e) { updateForm('name', e.target.value) }}
                placeholder="e.g. Arduino Nano"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Category</p>
              <select
                value={form.category}
                onChange={function(e) { updateForm('category', e.target.value) }}
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              >
                {CATEGORIES.map(function(cat) {
                  return <option key={cat} value={cat}>{cat}</option>
                })}
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Location</p>
              <select
                value={form.location}
                onChange={function(e) { updateForm('location', e.target.value) }}
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              >
                <option value="">Select...</option>
                {LOCATIONS.map(function(loc) {
                  return <option key={loc} value={loc}>{loc}</option>
                })}
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Quantity</p>
              <input
                type="number"
                value={form.quantity}
                onChange={function(e) { updateForm('quantity', e.target.value) }}
                min="0"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Min Stock Alert</p>
              <input
                type="number"
                value={form.minStock}
                onChange={function(e) { updateForm('minStock', e.target.value) }}
                min="0"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Unit Cost ($)</p>
              <input
                type="number"
                value={form.unitCost}
                onChange={function(e) { updateForm('unitCost', e.target.value) }}
                min="0"
                step="0.01"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Supplier</p>
              <input
                value={form.supplier}
                onChange={function(e) { updateForm('supplier', e.target.value) }}
                placeholder="e.g. AliExpress"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <input
                value={form.notes}
                onChange={function(e) { updateForm('notes', e.target.value) }}
                placeholder="Optional notes..."
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-[#1e1e2e] flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#1e1e2e] text-slate-400 rounded-xl text-sm transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
          >
            Add to Inventory
          </button>
        </div>
      </div>
    </div>
  )
}

function Inventory() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState(getInventory())
  const [stats, setStats] = useState(getInventoryStats())
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStock, setFilterStock] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [activeTab, setActiveTab] = useState('inventory')

  function refresh() {
    setInventory(getInventory())
    setStats(getInventoryStats())
  }

  function handleAdd(form) {
    addInventoryItem(form)
    refresh()
    notify.success(form.name + ' added to inventory!')
  }

  function handleUpdate(id, updates) {
    updateInventoryItem(id, updates)
    refresh()
  }

  function handleDelete(id) {
    deleteInventoryItem(id)
    refresh()
    notify.success('Item removed')
  }

  const lowStockItems = getLowStockItems()

  const filtered = inventory
    .filter(function(item) {
      const matchSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCategory === 'All' || item.category === filterCategory
      const matchStock = filterStock === 'All' ||
        (filterStock === 'Low' && item.quantity <= item.minStock && item.quantity > 0) ||
        (filterStock === 'Out' && item.quantity === 0) ||
        (filterStock === 'OK' && item.quantity > item.minStock)
      return matchSearch && matchCat && matchStock
    })
    .sort(function(a, b) {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'quantity') return b.quantity - a.quantity
      if (sortBy === 'value') return (b.quantity * b.unitCost) - (a.quantity * a.unitCost)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })

  const TABS = [
    { id: 'inventory', label: '📦 Stock' },
    { id: 'alerts', label: '⚠️ Alerts ' + (lowStockItems.length > 0 ? '(' + lowStockItems.length + ')' : '') },
    { id: 'stats', label: '📊 Stats' },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">📦 Component Inventory</h2>
          <p className="text-slate-400 text-sm">
            Track what you own — {stats.totalItems} items · ${stats.totalValue.toFixed(2)} total value
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={function() { exportInventoryCSV(); notify.success('Inventory exported!') }}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition"
          >
            ⬇️ Export CSV
          </button>
          <button
            onClick={function() { setShowAddModal(true) }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            + Add Item
          </button>
        </div>
      </div>{/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Items', value: stats.totalItems, icon: '📦', color: 'text-indigo-400' },
          { label: 'Total Value', value: '$' + stats.totalValue.toFixed(2), icon: '💰', color: 'text-emerald-400' },
          { label: 'Low Stock', value: stats.lowStock, icon: '⚠️', color: stats.lowStock > 0 ? 'text-yellow-400' : 'text-slate-600' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: '🚨', color: stats.outOfStock > 0 ? 'text-red-400' : 'text-slate-600' },
        ].map(function(stat) {
          return (
            <div key={stat.label} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 text-center">
              <p className="text-xl mb-1">{stat.icon}</p>
              <p className={'text-xl font-black ' + stat.color}>{stat.value}</p>
              <p className="text-slate-600 text-xs">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 mb-4 max-w-md">
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

      {/* Inventory tab */}
      {activeTab === 'inventory' && (
        <>
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
              <input
                value={search}
                onChange={function(e) { setSearch(e.target.value) }}
                placeholder="Search inventory..."
                className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={function(e) { setFilterCategory(e.target.value) }}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(function(cat) { return <option key={cat} value={cat}>{cat}</option> })}
            </select>
            <select
              value={filterStock}
              onChange={function(e) { setFilterStock(e.target.value) }}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="All">All Stock</option>
              <option value="OK">In Stock</option>
              <option value="Low">Low Stock</option>
              <option value="Out">Out of Stock</option>
            </select>
            <select
              value={sortBy}
              onChange={function(e) { setSortBy(e.target.value) }}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="quantity">Sort by Qty</option>
              <option value="value">Sort by Value</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          {inventory.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-white font-semibold text-lg mb-2">Your inventory is empty</p>
              <p className="text-slate-500 text-sm mb-6">Add components you own to track your stock</p>
              <button
                onClick={function() { setShowAddModal(true) }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
              >
                + Add First Component
              </button>
            </div>
          ) : (
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e1e2e] bg-[#13131f]">
                      <th className="text-left px-4 py-3 text-slate-500 text-xs">Component</th>
                      <th className="text-left px-4 py-3 text-slate-500 text-xs">Quantity</th>
                      <th className="text-left px-4 py-3 text-slate-500 text-xs">Status</th>
                      <th className="text-left px-4 py-3 text-slate-500 text-xs">Location</th>
                      <th className="text-left px-4 py-3 text-slate-500 text-xs">Value</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(function(item) {
                      return (
                        <InventoryRow
                          key={item.id}
                          item={item}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <p className="text-center text-slate-600 text-sm py-8">No items match your filters</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Alerts tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-12 bg-green-950 border border-green-900 rounded-2xl">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-400 font-semibold">All stock levels are healthy!</p>
            </div>
          ) : (
            <>
              <p className="text-yellow-400 text-sm font-semibold">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need restocking
              </p>
              {lowStockItems.map(function(item) {
                return (
                  <div key={item.id} className={'flex items-center gap-4 rounded-xl border p-4 ' + (
                    item.quantity === 0
                      ? 'bg-red-950 border-red-900'
                      : 'bg-yellow-950 border-yellow-900'
                  )}>
                    <span className="text-2xl">{item.icon || CATEGORY_ICONS[item.category]}</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{item.name}</p>
                      <p className={'text-xs ' + (item.quantity === 0 ? 'text-red-400' : 'text-yellow-400')}>
                        {item.quantity === 0 ? 'Out of stock' : item.quantity + ' left (min: ' + item.minStock + ')'}
                      </p>
                      {item.supplier && (
                        <p className="text-slate-500 text-xs">Supplier: {item.supplier}</p>
                      )}
                    </div>
                    <button
                      onClick={function() {
                        const url = 'https://www.google.com/search?q=' + encodeURIComponent(item.name + ' buy electronics')
                        window.open(url, '_blank')
                      }}
                      className="px-3 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-300 rounded-lg text-xs transition"
                    >
                      🛒 Reorder
                    </button>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Stats tab */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">By Category</p>
            <div className="space-y-2">
              {Object.entries(stats.categories).sort(function(a, b) { return b[1] - a[1] }).map(function(entry) {
                const cat = entry[0]
                const count = entry[1]
                const pct = stats.totalItems > 0 ? (count / stats.totalItems) * 100 : 0
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-lg w-8 shrink-0">{CATEGORY_ICONS[cat] || '📦'}</span>
                    <p className="text-slate-400 text-xs w-28 shrink-0">{cat}</p>
                    <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
                      <div
                        className="h-2 bg-indigo-600 rounded-full"
                        style={{ width: pct + '%' }}
                      />
                    </div>
                    <span className="text-slate-500 text-xs w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-3">Most Valuable Items</p>
              {inventory
                .sort(function(a, b) { return (b.quantity * b.unitCost) - (a.quantity * a.unitCost) })
                .slice(0, 5)
                .map(function(item) {
                  return (
                    <div key={item.id} className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{item.icon || '📦'}</span>
                      <p className="text-slate-300 text-xs flex-1 truncate">{item.name}</p>
                      <p className="text-emerald-400 text-xs font-mono">${(item.quantity * item.unitCost).toFixed(2)}</p>
                    </div>
                  )
                })}
            </div>
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-3">Highest Quantity</p>
              {inventory
                .sort(function(a, b) { return b.quantity - a.quantity })
                .slice(0, 5)
                .map(function(item) {
                  return (
                    <div key={item.id} className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{item.icon || '📦'}</span>
                      <p className="text-slate-300 text-xs flex-1 truncate">{item.name}</p>
                      <p className="text-indigo-400 text-xs font-bold">×{item.quantity}</p>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddItemModal
          onAdd={handleAdd}
          onClose={function() { setShowAddModal(false) }}
        />
      )}
    </div>
  )
}

export default Inventory