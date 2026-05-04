import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COMPONENT_DATABASE, COMPONENT_CATEGORIES } from '../data/componentDatabase'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Microcontroller: { color: 'text-indigo-400', bg: 'bg-indigo-950', border: 'border-indigo-800' },
  Sensor: { color: 'text-sky-400', bg: 'bg-sky-950', border: 'border-sky-800' },
  Display: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Communication: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  Power: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Actuator: { color: 'text-purple-400', bg: 'bg-purple-950', border: 'border-purple-800' },
  Module: { color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-700' },
}

const DIFFICULTY_COLORS = {
  Beginner: 'text-green-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-red-400',
}

function PopularityBar({ score }) {
  const color = score >= 90 ? '#22c55e' : score >= 80 ? '#f59e0b' : '#6366f1'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
        <div className="h-1.5 rounded-full" style={{ width: score + '%', backgroundColor: color }} />
      </div>
      <span className="text-xs shrink-0" style={{ color }}>{score}%</span>
    </div>
  )
}

function ComponentDetailModal({ component, onClose, onAddToCart, isInCart }) {
  if (!component) return null
  const cat = CATEGORY_COLORS[component.category] || CATEGORY_COLORS.Module

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{component.icon}</span>
            <div>
              <h2 className="text-white font-bold text-base">{component.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color} ${cat.bg} ${cat.border}`}>
                {component.category}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">{component.description}</p>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Price', value: component.estimatedPrice },
              { label: 'Voltage', value: component.voltage },
              { label: 'Current', value: component.current },
              { label: 'Difficulty', value: component.difficulty, colorClass: DIFFICULTY_COLORS[component.difficulty] },
              { label: 'Weight', value: component.weight },
              { label: 'Dimensions', value: component.dimensions },
            ].map(spec => (
              <div key={spec.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-0.5">{spec.label}</p>
                <p className={`text-sm font-medium ${spec.colorClass || 'text-white'}`}>{spec.value || 'N/A'}</p>
              </div>
            ))}
          </div>

          {/* Popularity */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Community Popularity</p>
            <PopularityBar score={component.popularity} />
          </div>

          {/* Interfaces */}
          {component.interface?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Interfaces</p>
              <div className="flex flex-wrap gap-1">
                {component.interface.map((iface, i) => (
                  <span key={i} className="text-xs bg-[#13131f] border border-[#2e2e4e] text-slate-300 px-2 py-1 rounded-lg">
                    {iface}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Use cases */}
          {component.useCases?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Common Use Cases</p>
              <ul className="space-y-1">
                {component.useCases.map((uc, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-indigo-400">→</span>
                    <span className="text-slate-300">{uc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {component.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {component.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-[#0d0d1a] text-slate-500 border border-[#2e2e4e] px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#1e1e2e] flex gap-2">
          <button
            onClick={() => {
              const url = 'https://www.google.com/search?q=' + encodeURIComponent(component.name + ' buy electronics')
              window.open(url, '_blank')
            }}
            className="flex-1 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
          >
            🔍 Find to Buy
          </button>
          <button
            onClick={() => { onAddToCart(component); onClose() }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition ${
              isInCart ? 'bg-green-700 text-green-100' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isInCart ? '✅ In Cart' : '+ Add to Prototype'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ComponentSearchPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [sortBy, setSortBy] = useState('popularity')
  const [selectedComp, setSelectedComp] = useState(null)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)

  function toggleCart(comp) {
    setCart(prev => {
      if (prev.find(c => c.id === comp.id)) {
        notify.info(comp.name + ' removed from selection')
        return prev.filter(c => c.id !== comp.id)
      }
      if (prev.length >= 12) {
        notify.warning('Maximum 12 components')
        return prev
      }
      notify.success(comp.name + ' added!')
      return [...prev, comp]
    })
  }

  const filtered = COMPONENT_DATABASE
    .filter(comp => {
      const matchSearch = !search ||
        comp.name.toLowerCase().includes(search.toLowerCase()) ||
        comp.description.toLowerCase().includes(search.toLowerCase()) ||
        comp.tags.some(t => t.includes(search.toLowerCase())) ||
        comp.useCases.some(u => u.toLowerCase().includes(search.toLowerCase()))
      const matchCat = category === 'All' || comp.category === category
      const matchDiff = difficulty === 'All' || comp.difficulty === difficulty
      return matchSearch && matchCat && matchDiff
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.popularity - a.popularity
      if (sortBy === 'price') {
        const aMin = parseInt((a.estimatedPrice || '').match(/\d+/)?.[0] || '999')
        const bMin = parseInt((b.estimatedPrice || '').match(/\d+/)?.[0] || '999')
        return aMin - bMin
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'difficulty') {
        const order = { Beginner: 0, Intermediate: 1, Advanced: 2 }
        return (order[a.difficulty] || 0) - (order[b.difficulty] || 0)
      }
      return 0
    })

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🔍 Component Search</h2>
          <p className="text-slate-400 text-sm">
            {COMPONENT_DATABASE.length} components · Search, filter and add to prototype
          </p>
        </div>
        <div className="flex gap-2">
          {cart.length > 0 && (
            <button
              onClick={() => navigate('/', { state: { prefillComponents: cart } })}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
            >
              ⚡ Build with {cart.length} Selected →
            </button>
          )}
        </div>
      </div>

      {/* Cart preview */}
      {cart.length > 0 && (
        <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-3 mb-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {cart.slice(0, 6).map(comp => (
              <span key={comp.id} className="text-xl">{comp.icon}</span>
            ))}
          </div>
          <p className="text-indigo-300 text-sm flex-1">
            {cart.length} component{cart.length !== 1 ? 's' : ''} selected
          </p>
          <button onClick={() => setCart([])} className="text-xs text-indigo-500 hover:text-indigo-300">
            Clear
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, use case, tag or interface..."
            className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
          )}
        </div>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none"
        >
          <option value="All">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none"
        >
          <option value="popularity">Most Popular</option>
          <option value="price">Lowest Price</option>
          <option value="name">A to Z</option>
          <option value="difficulty">Easiest First</option>
        </select>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {COMPONENT_CATEGORIES.map(cat => {
          const colors = CATEGORY_COLORS[cat] || { color: 'text-indigo-400', bg: 'bg-indigo-950', border: 'border-indigo-800' }
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                category === cat
                  ? cat === 'All'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : colors.bg + ' ' + colors.color + ' ' + colors.border
                  : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-800'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mb-4">
        Showing {filtered.length} of {COMPONENT_DATABASE.length} components
        {search && <span> · "{search}"</span>}
        {category !== 'All' && <span> · {category}</span>}
      </p>

      {/* Component grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(comp => {
            const cat = CATEGORY_COLORS[comp.category] || CATEGORY_COLORS.Module
            const inCart = cart.some(c => c.id === comp.id)
            return (
              <div
                key={comp.id}
                className={`bg-[#0d0d1a] border rounded-2xl p-4 transition cursor-pointer ${
                  inCart ? 'border-indigo-700' : 'border-[#1e1e2e] hover:border-indigo-800'
                }`}
                onClick={() => setSelectedComp(comp)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{comp.icon}</span>
                  <div className="flex items-center gap-1">
                    {inCart && <span className="text-xs text-indigo-400">✓ Selected</span>}
                    <button
                      onClick={e => { e.stopPropagation(); toggleCart(comp) }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition ${
                        inCart ? 'bg-indigo-600 text-white' : 'bg-[#1e1e2e] text-slate-500 hover:text-white'
                      }`}
                    >
                      {inCart ? '✓' : '+'}
                    </button>
                  </div>
                </div>

                <p className="text-white font-semibold text-sm mb-1">{comp.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color} ${cat.bg} ${cat.border}`}>
                  {comp.category}
                </span>

                <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">
                  {comp.description}
                </p>

                <div className="mt-3 space-y-1">
                  <PopularityBar score={comp.popularity} />
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400">{comp.estimatedPrice}</span>
                    <span className={DIFFICULTY_COLORS[comp.difficulty]}>{comp.difficulty}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold mb-1">No components found</p>
          <p className="text-sm">Try a different search term or remove filters</p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setDifficulty('All') }}
            className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selectedComp && (
        <ComponentDetailModal
          component={selectedComp}
          onClose={() => setSelectedComp(null)}
          onAddToCart={toggleCart}
          isInCart={cart.some(c => c.id === selectedComp.id)}
        />
      )}
    </div>
  )
}

export default ComponentSearchPage