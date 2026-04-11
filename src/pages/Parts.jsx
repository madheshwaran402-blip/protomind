import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchParts, PARTS_DATABASE } from '../data/components'

const CATEGORY_COLORS = {
  Microcontroller: { bg: '#1e1b4b', border: '#6366f1', text: '#a5b4fc' },
  Sensor: { bg: '#14293d', border: '#0ea5e9', text: '#7dd3fc' },
  Display: { bg: '#1a2e1a', border: '#22c55e', text: '#86efac' },
  Communication: { bg: '#2d1b1b', border: '#ef4444', text: '#fca5a5' },
  Power: { bg: '#2d2000', border: '#f59e0b', text: '#fcd34d' },
  Actuator: { bg: '#1f1635', border: '#a855f7', text: '#d8b4fe' },
}

const CATEGORIES = ['All', 'Microcontroller', 'Sensor', 'Display', 'Communication', 'Power', 'Actuator']

function PartCard({ part, onSelect, isSelected }) {
  const colors = CATEGORY_COLORS[part.category] || { bg: '#1a2535', border: '#64748b', text: '#94a3b8' }
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-2xl border transition"
      style={{
        backgroundColor: '#0d0d1a',
        borderColor: isSelected ? '#ffffff' : colors.border,
        boxShadow: isSelected ? '0 0 0 2px ' + colors.border : 'none',
      }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{part.icon}</span>
            <div>
              <h3 className="text-white font-semibold text-sm">{part.name}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: colors.bg, color: colors.text, border: '1px solid ' + colors.border }}
              >
                {part.category}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 text-sm font-semibold">
              ${part.price.min}–${part.price.max}
            </p>
            <p className="text-slate-600 text-xs">USD</p>
          </div>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed mb-3">{part.description}</p>

        <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
          <span>⚡ {part.voltage}</span>
          <span>•</span>
          <span>🔌 {part.current}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-xs text-slate-400 transition"
          >
            {expanded ? 'Less ↑' : 'More details ↓'}
          </button>
          <button
            onClick={() => onSelect(part)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
              isSelected
                ? 'bg-green-900 text-green-400'
                : 'text-white'
            }`}
            style={!isSelected ? { backgroundColor: colors.border } : {}}
          >
            {isSelected ? '✓ Added' : '+ Add to List'}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#1e1e2e] pt-4 space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Pins</p>
            <div className="flex flex-wrap gap-1">
              {part.pins.map(pin => (
                <span key={pin} className="text-xs bg-[#13131f] text-slate-400 px-2 py-0.5 rounded-md font-mono">
                  {pin}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Use Cases</p>
            <div className="flex flex-wrap gap-1">
              {part.useCases.map(u => (
                <span key={u} className="text-xs bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full">
                  {u}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Alternatives</p>
            <div className="flex flex-wrap gap-1">
              {part.alternatives.map(a => (
                <span key={a} className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-0.5 rounded-full">
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={part.buyLinks.amazon}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 bg-[#1a1a00] border border-yellow-800 text-yellow-400 rounded-xl text-xs text-center hover:bg-yellow-950 transition"
            >
              🛒 Amazon
            </a>
            <a
              href={part.buyLinks.aliexpress}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 bg-[#1a0a00] border border-orange-800 text-orange-400 rounded-xl text-xs text-center hover:bg-orange-950 transition"
            >
              🛍️ AliExpress
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function Parts() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState([])

  const filtered = searchParts(query).filter(p =>
    category === 'All' || p.category === category
  )

  function toggleSelect(part) {
    setSelected(prev =>
      prev.find(p => p.id === part.id)
        ? prev.filter(p => p.id !== part.id)
        : [...prev, part]
    )
  }

  function handleBuildPrototype() {
    const components = selected.map((part, index) => ({
      id: index + 1,
      icon: part.icon,
      name: part.name,
      category: part.category,
      reason: part.description,
      quantity: 1,
    }))
    navigate('/viewer', {
      state: {
        idea: 'Custom build from Parts Database',
        selectedComponents: components,
      },
    })
  }

  return (
    <div className="min-h-screen page-enter px-16 py-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Parts Database</h2>
          <p className="text-slate-400 text-sm">
            {PARTS_DATABASE.length} components — search, compare and build
          </p>
        </div>
        {selected.length > 0 && (
          <button
            onClick={handleBuildPrototype}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            ⚡ Build with {selected.length} part{selected.length !== 1 ? 's' : ''} →
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search components, categories, use cases..."
          className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-5 py-3 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-[#0d0d1a] border border-[#1e1e2e] text-slate-400 hover:border-indigo-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected bar */}
      {selected.length > 0 && (
        <div className="bg-indigo-950 border border-indigo-800 rounded-xl px-5 py-3 mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-indigo-400 text-sm font-semibold">Selected:</span>
          {selected.map(p => (
            <span
              key={p.id}
              onClick={() => toggleSelect(p)}
              className="text-xs bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full cursor-pointer hover:bg-red-950 hover:text-red-400 transition"
            >
              {p.icon} {p.name} ✕
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="flex justify-between items-center mb-4">
  <p className="text-slate-600 text-xs">
    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
    {query && <span className="text-indigo-400 ml-1">for "{query}"</span>}
  </p>
  {query && (
    <button
      onClick={() => { setQuery(''); setCategory('All') }}
      className="text-xs text-slate-500 hover:text-white transition"
    >
      Clear search ✕
    </button>
  )}
</div>
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(part => (
          <PartCard
            key={part.id}
            part={part}
            isSelected={!!selected.find(p => p.id === part.id)}
            onSelect={toggleSelect}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-400">No parts found for "{query}"</p>
          <button
            onClick={() => { setQuery(''); setCategory('All') }}
            className="mt-4 text-indigo-400 text-sm hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}

export default Parts