import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustQuantity,
  getLowStockItems,
  searchInventory,
  getInventoryStats,
  exportInventoryCSV,
} from '../services/inventory'
import { notify } from '../services/toast'

const CATEGORIES = [
  'Microcontroller', 'Sensor', 'Display', 'Communication',
  'Power', 'Actuator', 'Module', 'Passive', 'Tool', 'Other',
]

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
  Passive: '#94a3b8',
  Tool: '#f97316',
  Other: '#6b7280',
}

const COMMON_ICONS = ['🔧', '⚡', '📡', '💡', '🔌', '🖥️', '📱', '🎛️', '🔋', '⚙️', '🌡️', '💧', '🔊', '📷', '🧲', '⚗️']

const EMPTY_FORM = {
  name: '',
  category: 'Other',
  icon: '🔧',
  quantity: 1,
  location: '',
  purchasedFrom: '',
  purchasePrice: '',
  purchaseDate: '',
  notes: '',
  lowStockAlert: 1,
}

function InventoryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      notify.warning('Component name is required')
      return
    }
    onSave(form)
  }

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-semibold">{initial ? 'Edit Component' : 'Add to Inventory'}</h3>

      {/* Icon picker */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Icon</p>
        <div className="flex flex-wrap gap-1">
          {COMMON_ICONS.map(icon => (
            <button
              key={icon}
              onClick={() => update('icon', icon)}
              className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition ${
                form.icon === icon ? 'bg-indigo-600' : 'bg-[#1e1e2e] hover:bg-[#2e2e4e]'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <p className="text-xs text-slate-500 mb-1">Component Name *</p>
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Arduino Nano"
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Category</p>
          <select
            value={form.category}
            onChange={e => update('category', e.target.value)}
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Quantity</p>
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={e => update('quantity', parseInt(e.target.value) || 0)}
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Storage Location</p>
          <input
            value={form.location}
            onChange={e => update('location', e.target.value)}
            placeholder="e.g. Drawer A, Box 3"
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Purchased From</p>
          <input
            value={form.purchasedFrom}
            onChange={e => update('purchasedFrom', e.target.value)}
            placeholder="Amazon, AliExpress..."
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Unit Price ($)</p>
          <input
            value={form.purchasePrice}
            onChange={e => update('purchasePrice', e.target.value)}
            placeholder="2.50"
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Purchase Date</p>
          <input
            type="date"
            value={form.purchaseDate}
            onChange={e => update('purchaseDate', e.target.value)}
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Low Stock Alert</p>
          <input
            type="number"
            min="0"
            value={form.lowStockAlert}
            onChange={e => update('lowStockAlert', parseInt(e.target.value) || 0)}
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div className="col-span-2">
          <p className="text-xs text-slate-500 mb-1">Notes</p>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Any notes about this component..."
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 resize-none"
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSubmit} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition">
          {initial ? '💾 Save Changes' : '+ Add to Inventory'}
        </button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition">
          Cancel
        </button>
      </div>
    </div>
  )
}

function InventoryCard({ item, onEdit, onDelete, onAdjust }) {
  const isLow = item.quantity <= item.lowStockAlert
  const color = CATEGORY_COLORS[item.category] || '#6b7280'

  return (
    <div className={`bg-[#0d0d1a] border rounded-2xl p-4 transition ${
      isLow ? 'border-orange-800' : 'border-[#1e1e2e] hover:border-indigo-800'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <p className="text-white text-sm font-semibold">{item.name}</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: color + '20', color, border: '1px solid ' + color + '40' }}
            >
              {item.category}
            </span>
          </div>
        </div>
        {isLow && (
          <span className="text-xs bg-orange-950 text-orange-400 border border-orange-800 px-2 py-0.5 rounded-full shrink-0">
            ⚠️ Low
          </span>
        )}
      </div>

      {/* Quantity control */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onAdjust(item.id, -1)}
          className="w-8 h-8 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-lg text-white font-bold transition"
        >
          -
        </button>
        <div className="flex-1 text-center">
          <p className={`text-2xl font-black ${isLow ? 'text-orange-400' : 'text-white'}`}>
            {item.quantity}
          </p>
          <p className="text-slate-600 text-xs">in stock</p>
        </div>
        <button
          onClick={() => onAdjust(item.id, 1)}
          className="w-8 h-8 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-lg text-white font-bold transition"
        >
          +
        </button>
      </div>

      {/* Details */}
      <div className="space-y-1 mb-3 text-xs text-slate-500">
        {item.location && <p>📍 {item.location}</p>}
        {item.purchasedFrom && <p>🛒 {item.purchasedFrom}</p>}
        {item.purchasePrice && <p>💰 ${item.purchasePrice} each</p>}
        {item.purchaseDate && <p>📅 {new Date(item.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
        {item.notes && <p className="italic">"{item.notes}"</p>}
      </div>

      <div className="flex gap-2">
        <button onClick={() => onEdit(item)} className="flex-1 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(item.id)} className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-red-950 hover:text-red-400 text-slate-500 rounded-xl text-xs transition">
          🗑
        </button>
      </div>
    </div>
  )
}

function Inventory() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState(getInventory())
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showLowOnly, setShowLowOnly] = useState(false)

  function refresh() {
    setInventory(getInventory())
  }

  function handleAdd(form) {
    addInventoryItem(form)
    refresh()
    setShowForm(false)
    notify.success('Added to inventory!')
  }

  function handleEdit(form) {
    updateInventoryItem(editingItem.id, form)
    refresh()
    setEditingItem(null)
    notify.success('Updated!')
  }

  function handleDelete(id) {
    deleteInventoryItem(id)
    refresh()
    notify.success('Removed from inventory')
  }

  function handleAdjust(id, delta) {
    const updated = adjustQuantity(id, delta)
    refresh()
    if (updated && updated.quantity <= updated.lowStockAlert && delta < 0) {
      notify.warning(updated.name + ' is low on stock!')
    }
  }

  const stats = getInventoryStats()
  const lowStock = getLowStockItems()

  const filtered = (showLowOnly ? getLowStockItems() : searchInventory(search))
    .filter(item => filterCategory === 'All' || item.category === filterCategory)

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">📦 Component Inventory</h2>
          <p className="text-slate-400 text-sm">Track your physical components</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { exportInventoryCSV(); notify.success('Inventory exported!') }}
            disabled={inventory.length === 0}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition disabled:opacity-50"
          >
            ⬇️ Export CSV
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingItem(null) }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            + Add Component
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Unique Parts', value: stats.totalItems, icon: '🔧', color: 'text-indigo-400' },
          { label: 'Total Count', value: stats.totalComponents, icon: '📦', color: 'text-blue-400' },
          { label: 'Low Stock', value: stats.lowStock, icon: '⚠️', color: stats.lowStock > 0 ? 'text-orange-400' : 'text-slate-600' },
          { label: 'Est. Value', value: '$' + stats.totalValue.toFixed(0), icon: '💰', color: 'text-emerald-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-600 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-orange-950 border border-orange-800 rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-orange-400 font-semibold text-sm">Low Stock Alert</p>
            <p className="text-orange-700 text-xs">
              {lowStock.map(i => i.name).join(', ')} {lowStock.length === 1 ? 'is' : 'are'} running low
            </p>
          </div>
          <button
            onClick={() => setShowLowOnly(!showLowOnly)}
            className={`ml-auto px-3 py-1.5 rounded-lg text-xs transition ${showLowOnly ? 'bg-orange-800 text-orange-200' : 'bg-orange-900 text-orange-400'}`}
          >
            {showLowOnly ? 'Show All' : 'Show Low Only'}
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <InventoryForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {editingItem && (
        <div className="mb-6">
          <InventoryForm initial={editingItem} onSave={handleEdit} onCancel={() => setEditingItem(null)} />
        </div>
      )}

      {/* Search and filter */}
      {inventory.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search inventory..."
              className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Empty state */}
      {inventory.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No components tracked yet</h3>
          <p className="text-slate-500 text-sm mb-6">Start tracking your physical components to know what you have in stock</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition">
            + Add First Component
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <>
          <p className="text-slate-600 text-xs mb-4">Showing {filtered.length} of {inventory.length} items</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <InventoryCard
                key={item.id}
                item={item}
                onEdit={setEditingItem}
                onDelete={handleDelete}
                onAdjust={handleAdjust}
              />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && inventory.length > 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>No components match your search</p>
          <button onClick={() => { setSearch(''); setFilterCategory('All'); setShowLowOnly(false) }} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300">
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

export default Inventory