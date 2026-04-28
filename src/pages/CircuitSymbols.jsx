import { useState } from 'react'
import { CIRCUIT_SYMBOLS, SYMBOL_CATEGORIES, getSymbolsByCategory } from '../data/circuitSymbols'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Passive: { color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-700' },
  Active: { color: 'text-indigo-400', bg: 'bg-indigo-950', border: 'border-indigo-800' },
  Input: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Output: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Power: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
}

function SymbolCard({ symbol, onSelect, isSelected }) {
  const cat = CATEGORY_COLORS[symbol.category] || CATEGORY_COLORS.Passive

  return (
    <div
      onClick={() => onSelect(symbol)}
      className={`bg-[#0d0d1a] border rounded-2xl p-4 cursor-pointer transition ${
        isSelected ? 'border-indigo-600 bg-indigo-950' : 'border-[#1e1e2e] hover:border-indigo-800'
      }`}
    >
      {/* SVG Symbol */}
      <div
        className="flex items-center justify-center mb-3 rounded-xl p-3"
        style={{ backgroundColor: '#13131f', minHeight: '80px' }}
        dangerouslySetInnerHTML={{ __html: symbol.svg }}
      />

      <div className="flex items-center justify-between mb-1">
        <p className="text-white text-sm font-semibold">{symbol.name}</p>
        <span className="text-xs font-bold text-slate-500 font-mono">{symbol.symbol}</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color} ${cat.bg} ${cat.border}`}>
          {symbol.category}
        </span>
        <span className="text-xs text-slate-600">{symbol.unit}</span>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
        {symbol.description}
      </p>
    </div>
  )
}

function SymbolDetail({ symbol, onClose }) {
  if (!symbol) return null
  const cat = CATEGORY_COLORS[symbol.category] || CATEGORY_COLORS.Passive

  function copyInfo() {
    const text = [
      symbol.name + ' (' + symbol.symbol + ')',
      'Category: ' + symbol.category,
      'Unit: ' + symbol.unit,
      'Description: ' + symbol.description,
      'Usage: ' + symbol.usage,
      'Common Values: ' + symbol.commonValues.join(', '),
      'Tips: ' + symbol.tips,
    ].join('\n')
    navigator.clipboard.writeText(text)
    notify.success('Symbol info copied!')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-white font-bold text-lg">{symbol.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color} ${cat.bg} ${cat.border}`}>
                  {symbol.category}
                </span>
                <span className="text-slate-500 text-xs font-mono">{symbol.symbol}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyInfo} className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition">
              📋 Copy
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl px-2">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Large SVG */}
          <div
            className="flex items-center justify-center rounded-2xl p-6 bg-[#13131f] border border-[#2e2e4e]"
            style={{ minHeight: '120px' }}
            dangerouslySetInnerHTML={{
              __html: symbol.svg.replace('viewBox', 'width="100%" height="120" preserveAspectRatio="xMidYMid meet" viewBox'),
            }}
          />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
              <p className="text-slate-500 text-xs mb-1">Unit</p>
              <p className="text-white text-sm font-medium">{symbol.unit}</p>
            </div>
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
              <p className="text-slate-500 text-xs mb-1">Schematic Symbol</p>
              <p className="text-indigo-400 text-sm font-bold font-mono">{symbol.symbol}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Description</p>
            <p className="text-slate-300 text-sm">{symbol.description}</p>
          </div>

          {/* Usage */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Common Usage</p>
            <p className="text-slate-300 text-sm">{symbol.usage}</p>
          </div>

          {/* Common values */}
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Common Values / Types</p>
            <div className="flex flex-wrap gap-2">
              {symbol.commonValues.map((val, i) => (
                <span key={i} className="text-xs bg-[#13131f] border border-[#2e2e4e] text-slate-300 px-3 py-1.5 rounded-full font-mono">
                  {val}
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
            <p className="text-indigo-400 text-xs font-semibold mb-1">💡 Pro Tip</p>
            <p className="text-slate-300 text-sm">{symbol.tips}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CircuitSymbols() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = getSymbolsByCategory(category).filter(s =>
    !search.trim() ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.usage.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">⚡ Circuit Symbol Library</h2>
          <p className="text-slate-400 text-sm">
            {CIRCUIT_SYMBOLS.length} standard electronic circuit symbols with descriptions and tips
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbols..."
            className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none"
        >
          {SYMBOL_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Category filter buttons */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SYMBOL_CATEGORIES.map(cat => {
          const colors = CATEGORY_COLORS[cat] || { color: 'text-indigo-400', bg: 'bg-indigo-950', border: 'border-indigo-800' }
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                category === cat
                  ? (cat === 'All' ? 'bg-indigo-600 text-white border-indigo-600' : colors.bg + ' ' + colors.color + ' ' + colors.border)
                  : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-800'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mb-4">
        Showing {filtered.length} of {CIRCUIT_SYMBOLS.length} symbols · Click any to see details
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(symbol => (
          <SymbolCard
            key={symbol.id}
            symbol={symbol}
            onSelect={setSelected}
            isSelected={selected?.id === symbol.id}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>No symbols match your search</p>
          <button
            onClick={() => { setSearch(''); setCategory('All') }}
            className="mt-3 text-indigo-400 text-sm hover:text-indigo-300"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <SymbolDetail symbol={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

export default CircuitSymbols