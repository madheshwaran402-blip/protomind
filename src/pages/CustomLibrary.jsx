import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCustomLibrary,
  addCustomComponent,
  updateCustomComponent,
  deleteCustomComponent,
  searchCustomLibrary,
  exportLibrary,
  importLibrary,
} from '../services/customLibrary'
import { notify } from '../services/toast'

const CATEGORIES = [
  'Microcontroller', 'Sensor', 'Display', 'Communication',
  'Power', 'Actuator', 'Module', 'Memory', 'Passive', 'Other',
]

const COMMON_ICONS = [
  '🔧', '⚡', '📡', '💡', '🔌', '🖥️', '📱', '🎛️', '🔋', '⚙️',
  '📊', '🌡️', '💧', '🔊', '📷', '🎵', '🧲', '⚗️', '🔬', '🛰️',
  '🤖', '🦾', '🔭', '📟', '🖨️', '⌚', '🎮', '🕹️', '📻', '🔑',
]

const EMPTY_FORM = {
  name: '',
  category: 'Sensor',
  icon: '🔧',
  description: '',
  voltage: '',
  current: '',
  priceMin: '',
  priceMax: '',
  datasheet: '',
  buyLink: '',
  tags: '',
  notes: '',
}

function ComponentCard({ comp, onEdit, onDelete, onUse }) {
  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-4 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{comp.icon}</div>
          <div>
            <p className="text-white text-sm font-semibold">{comp.name}</p>
            <span className="text-xs bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-900">
              {comp.category}
            </span>
          </div>
        </div>
        <span className="text-xs bg-green-950 text-green-400 px-2 py-0.5 rounded-full border border-green-900">
          Custom
        </span>
      </div>

      {comp.description && (
        <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{comp.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-600">
        {comp.voltage && <span>⚡ {comp.voltage}</span>}
        {comp.current && <span>🔋 {comp.current}</span>}
        {(comp.priceMin || comp.priceMax) && (
          <span>💰 ${comp.priceMin}–${comp.priceMax}</span>
        )}
      </div>

      {comp.tags && (
        <div className="flex flex-wrap gap-1 mb-3">
          {comp.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
            <span key={tag} className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onUse(comp)}
          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition"
        >
          Use in Prototype →
        </button>
        <button
          onClick={() => onEdit(comp)}
          className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(comp.id)}
          className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-red-950 hover:text-red-400 text-slate-500 rounded-lg text-xs transition"
        >
          🗑
        </button>
      </div>
    </div>
  )
}

function ComponentForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
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
      <h3 className="text-white font-semibold">
        {initial ? 'Edit Component' : 'Add New Component'}
      </h3>

      {/* Icon picker */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Icon</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {COMMON_ICONS.map(icon => (
            <button
              key={icon}
              onClick={() => handleChange('icon', icon)}
              className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition ${
                form.icon === icon
                  ? 'bg-indigo-600 ring-2 ring-indigo-400'
                  : 'bg-[#1e1e2e] hover:bg-[#2e2e4e]'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Name *</p>
          <input
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="e.g. Custom Temperature Sensor"
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Category</p>
          <select
            value={form.category}
            onChange={e => handleChange('category', e.target.value)}
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1">Description</p>
        <textarea
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
          placeholder="What does this component do?"
          className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500 resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Voltage</p>
          <input value={form.voltage} onChange={e => handleChange('voltage', e.target.value)} placeholder="3.3V" className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Current</p>
          <input value={form.current} onChange={e => handleChange('current', e.target.value)} placeholder="20mA" className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Min Price ($)</p>
          <input value={form.priceMin} onChange={e => handleChange('priceMin', e.target.value)} placeholder="2" className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Max Price ($)</p>
          <input value={form.priceMax} onChange={e => handleChange('priceMax', e.target.value)} placeholder="15" className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Datasheet URL</p>
          <input value={form.datasheet} onChange={e => handleChange('datasheet', e.target.value)} placeholder="https://..." className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Buy Link</p>
          <input value={form.buyLink} onChange={e => handleChange('buyLink', e.target.value)} placeholder="Amazon/AliExpress URL" className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none" />
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1">Tags (comma separated)</p>
        <input value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="temperature, outdoor, waterproof" className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none" />
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1">Personal Notes</p>
        <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Any personal notes about this component..." className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none resize-none" rows={2} />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSubmit} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition">
          {initial ? '💾 Save Changes' : '+ Add Component'}
        </button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition">
          Cancel
        </button>
      </div>
    </div>
  )
}

function CustomLibrary() {
  const navigate = useNavigate()
  const [library, setLibrary] = useState(getCustomLibrary())
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingComp, setEditingComp] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')

  function refresh() {
    setLibrary(getCustomLibrary())
  }

  function handleAdd(form) {
    addCustomComponent(form)
    refresh()
    setShowForm(false)
    notify.success('Component added to your library!')
  }

  function handleEdit(form) {
    updateCustomComponent(editingComp.id, form)
    refresh()
    setEditingComp(null)
    notify.success('Component updated!')
  }

  function handleDelete(id) {
    deleteCustomComponent(id)
    refresh()
    notify.success('Component removed from library')
  }

  function handleUse(comp) {
    navigate('/', { state: { prefillComponent: comp } })
    notify.info('Go to Home and describe your idea — your component will be suggested!')
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const count = importLibrary(ev.target.result)
        refresh()
        notify.success('Imported ' + count + ' components!')
      } catch {
        notify.error('Invalid library file')
      }
    }
    reader.readAsText(file)
  }

  const filtered = library
    .filter(c => filterCategory === 'All' || c.category === filterCategory)
    .filter(c => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
    })

  return (
    <div className="min-h-screen page-enter px-16 py-12">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Custom Component Library</h2>
          <p className="text-slate-400 text-sm">
            {library.length} custom component{library.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="flex gap-3">
          <label className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm cursor-pointer transition">
            📥 Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={() => { exportLibrary(); notify.success('Library exported!') }}
            disabled={library.length === 0}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition disabled:opacity-50"
          >
            📤 Export
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingComp(null) }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            + Add Component
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="mb-6">
          <ComponentForm
            onSave={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingComp && (
        <div className="mb-6">
          <ComponentForm
            initial={editingComp}
            onSave={handleEdit}
            onCancel={() => setEditingComp(null)}
          />
        </div>
      )}

      {/* Search and filter */}
      {library.length > 0 && (
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your library..."
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
      {library.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold mb-2">No custom components yet</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md">
            Add your own components that aren't in the default database. Great for specialty parts, modules you own, or components from your supplier.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            + Add Your First Component
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <>
          <p className="text-slate-600 text-xs mb-4">
            Showing {filtered.length} of {library.length} components
          </p>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(comp => (
              <ComponentCard
                key={comp.id}
                comp={comp}
                onEdit={c => { setEditingComp(c); setShowForm(false) }}
                onDelete={handleDelete}
                onUse={handleUse}
              />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && library.length > 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>No components match your search</p>
          <button onClick={() => { setSearch(''); setFilterCategory('All') }} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition">
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

export default CustomLibrary