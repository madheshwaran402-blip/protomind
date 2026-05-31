import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUPPLIERS, SUPPLIER_CATEGORIES } from '../data/suppliersData'
import { notify } from '../services/toast'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(function(star) {
        return (
          <span
            key={star}
            className={'text-xs ' + (star <= Math.round(rating) ? 'text-yellow-400' : 'text-slate-700')}
          >
            ★
          </span>
        )
      })}
      <span className="text-slate-500 text-xs ml-1">{rating}</span>
    </div>
  )
}

function TrustBar({ score, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full"
          style={{ width: score + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-slate-500 shrink-0">{score}%</span>
    </div>
  )
}

function SupplierCard({ supplier, onSearch }) {
  const [expanded, setExpanded] = useState(false)

  function handleSearch(e) {
    e.stopPropagation()
    onSearch(supplier)
  }

  function handleVisit(e) {
    e.stopPropagation()
    window.open(supplier.url, '_blank')
  }

  return (
    <div
      className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl overflow-hidden transition cursor-pointer"
      onClick={function() { setExpanded(!expanded) }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{supplier.icon}</span>
            <div>
              <p className="text-white font-bold text-base">{supplier.name}</p>
              <p className="text-slate-500 text-xs">{supplier.country}</p>
            </div>
          </div>
          <span
            className="text-xs px-2 py-1 rounded-full border"
            style={{
              color: supplier.color,
              backgroundColor: supplier.color + '20',
              borderColor: supplier.color + '40',
            }}
          >
            {supplier.category}
          </span>
        </div>

        <StarRating rating={supplier.rating} />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-[#13131f] rounded-lg p-2">
            <p className="text-slate-500 text-xs">Shipping</p>
            <p className="text-white text-xs font-semibold">{supplier.shippingTime}</p>
          </div>
          <div className="bg-[#13131f] rounded-lg p-2">
            <p className="text-slate-500 text-xs">Min Order</p>
            <p className="text-white text-xs font-semibold">{supplier.minOrder}</p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-slate-500 text-xs mb-1">Trust Score</p>
          <TrustBar score={supplier.trustScore} color={supplier.color} />
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-[#1e1e2e] pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-green-400 text-xs font-semibold mb-1">✓ Pros</p>
              <ul className="space-y-0.5">
                {supplier.pros.map(function(pro, i) {
                  return (
                    <li key={i} className="text-slate-300 text-xs">• {pro}</li>
                  )
                })}
              </ul>
            </div>
            <div>
              <p className="text-red-400 text-xs font-semibold mb-1">✗ Cons</p>
              <ul className="space-y-0.5">
                {supplier.cons.map(function(con, i) {
                  return (
                    <li key={i} className="text-slate-400 text-xs">• {con}</li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Best for</p>
            <div className="flex flex-wrap gap-1">
              {supplier.bestFor.map(function(use, i) {
                return (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full border"
                    style={{
                      color: supplier.color,
                      backgroundColor: supplier.color + '15',
                      borderColor: supplier.color + '30',
                    }}
                  >
                    {use}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleVisit}
              className="flex-1 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
            >
              🌐 Visit Site ↗️
            </button>
            <button
              onClick={handleSearch}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition"
              style={{
                backgroundColor: supplier.color + '20',
                color: supplier.color,
                border: '1px solid ' + supplier.color + '40',
              }}
            >
              🔍 Search Here
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Parts() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [searchSupplier, setSearchSupplier] = useState(null)
  const [componentToSearch, setComponentToSearch] = useState('')

  const filtered = SUPPLIERS
    .filter(function(s) {
      const matchCat = activeCategory === 'All' || s.category === activeCategory
      const matchSearch = !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.bestFor.some(function(b) { return b.toLowerCase().includes(searchQuery.toLowerCase()) })
      return matchCat && matchSearch
    })
    .sort(function(a, b) {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'trust') return b.trustScore - a.trustScore
      if (sortBy === 'shipping') return a.shippingTime.localeCompare(b.shippingTime)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  function handleSupplierSearch(supplier) {
    if (!componentToSearch.trim()) {
      notify.warning('Enter a component name to search')
      return
    }
    const url = supplier.searchTemplate + encodeURIComponent(componentToSearch)
    window.open(url, '_blank')
  }

  function handleQuickSearch() {
    if (!componentToSearch.trim()) {
      notify.warning('Enter a component name first')
      return
    }
    SUPPLIERS.slice(0, 3).forEach(function(supplier) {
      const url = supplier.searchTemplate + encodeURIComponent(componentToSearch)
      window.open(url, '_blank')
    })
    notify.success('Opened top 3 suppliers!')
  }

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🛒 Parts Sourcing</h2>
          <p className="text-slate-400 text-sm">
            {SUPPLIERS.length} trusted suppliers — find the best place to buy your components
          </p>
        </div>
        <button
          onClick={function() { navigate('/search') }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          🔍 Component Search →
        </button>
      </div>

      {/* Quick search bar */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
          Quick Multi-Supplier Search
        </p>
        <div className="flex gap-2">
          <input
            value={componentToSearch}
            onChange={function(e) { setComponentToSearch(e.target.value) }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleQuickSearch() }}
            placeholder="Enter component name... e.g. Arduino Nano, DHT22, ESP32"
            className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500 placeholder-slate-600"
          />
          <button
            onClick={handleQuickSearch}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            Search All →
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-2">
          Opens top 3 suppliers simultaneously in new tabs
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            value={searchQuery}
            onChange={function(e) { setSearchQuery(e.target.value) }}
            placeholder="Filter suppliers..."
            className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={function(e) { setSortBy(e.target.value) }}
          className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
        >
          <option value="rating">Sort by Rating</option>
          <option value="trust">Sort by Trust</option>
          <option value="shipping">Sort by Speed</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {SUPPLIER_CATEGORIES.map(function(cat) {
          return (
            <button
              key={cat}
              onClick={function() { setActiveCategory(cat) }}
              className={'text-xs px-4 py-2 rounded-xl border transition font-medium ' + (
                activeCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-600'
              )}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Supplier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(function(supplier) {
          return (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onSearch={handleSupplierSearch}
            />
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🛒</div>
          <p className="font-semibold mb-1">No suppliers found</p>
          <button
            onClick={function() { setSearchQuery(''); setActiveCategory('All') }}
            className="text-indigo-400 text-sm mt-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Quick comparison table */}
      <div className="mt-8 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e1e2e]">
          <p className="text-white font-bold">📊 Quick Comparison</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e1e2e] bg-[#13131f]">
                <th className="text-left px-4 py-2.5 text-slate-500">Supplier</th>
                <th className="text-left px-4 py-2.5 text-slate-500">Rating</th>
                <th className="text-left px-4 py-2.5 text-slate-500">Shipping</th>
                <th className="text-left px-4 py-2.5 text-slate-500">Trust</th>
                <th className="text-left px-4 py-2.5 text-slate-500">Best For</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map(function(supplier, i) {
                return (
                  <tr key={supplier.id} className={'border-b border-[#1e1e2e] last:border-0 ' + (i % 2 === 0 ? '' : 'bg-[#13131f]')}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>{supplier.icon}</span>
                        <span className="text-white font-medium">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-yellow-400">{'★'.repeat(Math.round(supplier.rating))}</span>
                      <span className="text-slate-500 ml-1">{supplier.rating}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{supplier.shippingTime}</td>
                    <td className="px-4 py-2.5">
                      <span style={{ color: supplier.color }}>{supplier.trustScore}%</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {supplier.bestFor.slice(0, 2).join(', ')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Parts