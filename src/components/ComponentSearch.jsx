import { useState } from 'react'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Microcontroller: { color: '#6366f1', bg: 'bg-indigo-950', border: 'border-indigo-800' },
  Sensor: { color: '#0ea5e9', bg: 'bg-sky-950', border: 'border-sky-800' },
  Display: { color: '#22c55e', bg: 'bg-green-950', border: 'border-green-800' },
  Communication: { color: '#ef4444', bg: 'bg-red-950', border: 'border-red-800' },
  Power: { color: '#f59e0b', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Actuator: { color: '#a855f7', bg: 'bg-purple-950', border: 'border-purple-800' },
  Module: { color: '#64748b', bg: 'bg-slate-900', border: 'border-slate-700' },
  Memory: { color: '#64748b', bg: 'bg-slate-900', border: 'border-slate-700' },
}

function ComponentSearch({ components, onHighlight, onSelect }) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [highlighted, setHighlighted] = useState(null)

  const categories = ['All', ...new Set(components.map(c => c.category))]

  const filtered = components.filter(comp => {
    const matchSearch = !search.trim() ||
      comp.name.toLowerCase().includes(search.toLowerCase()) ||
      comp.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'All' || comp.category === filterCategory
    return matchSearch && matchCategory
  })

  function handleHighlight(comp) {
    const newHighlighted = highlighted === comp.id ? null : comp.id
    setHighlighted(newHighlighted)
    onHighlight && onHighlight(newHighlighted)
    if (newHighlighted) {
      notify.info('Highlighting ' + comp.name)
    }
  }

  const stats = {
    total: components.length,
    categories: new Set(components.map(c => c.category)).size,
    byCategory: categories.slice(1).map(cat => ({
      name: cat,
      count: components.filter(c => c.category === cat).length,
    })),
  }

  return (
    <div className="space-y-3">

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
          <p className="text-white font-bold text-lg">{stats.total}</p>
          <p className="text-slate-600 text-xs">Total Parts</p>
        </div>
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
          <p className="text-white font-bold text-lg">{stats.categories}</p>
          <p className="text-slate-600 text-xs">Categories</p>
        </div>
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
          <p className="text-white font-bold text-lg">{filtered.length}</p>
          <p className="text-slate-600 text-xs">Showing</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="flex flex-wrap gap-1">
        {stats.byCategory.map(cat => {
          const colors = CATEGORY_COLORS[cat.name] || CATEGORY_COLORS.Module
          return (
            <button
              key={cat.name}
              onClick={() => setFilterCategory(filterCategory === cat.name ? 'All' : cat.name)}
              className={`text-xs px-2 py-1 rounded-full border transition ${
                filterCategory === cat.name
                  ? colors.bg + ' ' + colors.border
                  : 'bg-[#13131f] border-[#2e2e4e] text-slate-500 hover:border-indigo-800'
              }`}
              style={{ color: filterCategory === cat.name ? colors.color : undefined }}
            >
              {cat.name} ({cat.count})
            </button>
          )
        })}
      </div>

      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search components..."
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Component list */}
      {filtered.length === 0 ? (
        <div className="text-center py-6 text-slate-600 text-sm">
          No components match your search
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.map(comp => {
            const colors = CATEGORY_COLORS[comp.category] || CATEGORY_COLORS.Module
            const isHighlighted = highlighted === comp.id
            return (
              <div
                key={comp.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                  isHighlighted
                    ? colors.bg + ' ' + colors.border
                    : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-800'
                }`}
              >
                <span className="text-xl shrink-0">{comp.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{comp.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: colors.color }}>{comp.category}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleHighlight(comp)}
                    className={`px-2 py-1 rounded-lg text-xs transition ${
                      isHighlighted
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#1e1e2e] text-slate-400 hover:text-white'
                    }`}
                    title="Highlight in 3D view"
                  >
                    {isHighlighted ? '✓' : '🎯'}
                  </button>
                  <button
                    onClick={() => onSelect && onSelect(comp)}
                    className="px-2 py-1 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
                    title="View details"
                  >
                    ℹ️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Category summary */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-semibold">Category Breakdown</p>
        <div className="space-y-1.5">
          {stats.byCategory.map(cat => {
            const colors = CATEGORY_COLORS[cat.name] || CATEGORY_COLORS.Module
            const pct = Math.round((cat.count / stats.total) * 100)
            return (
              <div key={cat.name} className="flex items-center gap-2">
                <p className="text-xs w-28 shrink-0" style={{ color: colors.color }}>{cat.name}</p>
                <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: pct + '%', backgroundColor: colors.color }}
                  />
                </div>
                <p className="text-xs text-slate-600 w-6 text-right">{cat.count}</p>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default ComponentSearch