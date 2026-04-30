import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PINOUT_DATA,
  PINOUT_CATEGORIES,
  getPinoutByCategory,
  searchPinouts,
} from '../data/pinoutData'
import { notify } from '../services/toast'

const PIN_TYPE_COLORS = {
  'Power': 'text-red-400 bg-red-950 border-red-900',
  'Ground': 'text-gray-400 bg-gray-900 border-gray-700',
  'Digital': 'text-blue-400 bg-blue-950 border-blue-900',
  'Digital/PWM': 'text-purple-400 bg-purple-950 border-purple-900',
  'Digital/UART': 'text-yellow-400 bg-yellow-950 border-yellow-900',
  'Digital/I2C': 'text-pink-400 bg-pink-950 border-pink-900',
  'Digital/SPI': 'text-orange-400 bg-orange-950 border-orange-900',
  'Analog': 'text-green-400 bg-green-950 border-green-900',
  'Analog/I2C': 'text-emerald-400 bg-emerald-950 border-emerald-900',
  'I2C': 'text-pink-400 bg-pink-950 border-pink-900',
  'SPI': 'text-orange-400 bg-orange-950 border-orange-900',
  'Signal': 'text-cyan-400 bg-cyan-950 border-cyan-900',
  'System': 'text-slate-400 bg-slate-900 border-slate-700',
  'NC': 'text-slate-600 bg-slate-950 border-slate-800',
  'Motor Output': 'text-red-400 bg-red-950 border-red-900',
  'Digital Input': 'text-blue-400 bg-blue-950 border-blue-900',
  'PWM/Enable': 'text-purple-400 bg-purple-950 border-purple-900',
  'Input Only': 'text-teal-400 bg-teal-950 border-teal-900',
  'Digital/ADC': 'text-green-400 bg-green-950 border-green-900',
  'Digital/DAC': 'text-yellow-400 bg-yellow-950 border-yellow-900',
  'Interrupt': 'text-rose-400 bg-rose-950 border-rose-900',
}

function PinBadge({ type }) {
  const colors = PIN_TYPE_COLORS[type] || 'text-slate-400 bg-slate-900 border-slate-700'
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border ${colors} shrink-0`}>
      {type}
    </span>
  )
}

function ComponentCard({ component, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(component)}
      className={`bg-[#0d0d1a] border rounded-2xl p-4 cursor-pointer transition ${
        isSelected ? 'border-indigo-600' : 'border-[#1e1e2e] hover:border-indigo-800'
      }`}
      style={isSelected ? { backgroundColor: component.color + '10' } : {}}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{component.icon}</span>
        <div>
          <p className="text-white font-bold text-sm">{component.name}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: component.color + '20', color: component.color }}
          >
            {component.category}
          </span>
        </div>
      </div>
      <p className="text-slate-500 text-xs line-clamp-2 mb-2">{component.description}</p>
      <div className="flex gap-3 text-xs text-slate-600">
        <span>⚡ {component.voltage}</span>
        <span>📌 {component.pins.length} pins</span>
      </div>
    </div>
  )
}

function PinoutDetail({ component, onClose }) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('pins')

  const filteredPins = component.pins.filter(pin =>
    !search ||
    pin.name.toLowerCase().includes(search.toLowerCase()) ||
    pin.type.toLowerCase().includes(search.toLowerCase()) ||
    pin.description.toLowerCase().includes(search.toLowerCase())
  )

  function copyPinInfo() {
    const text = component.pins.map(p =>
      p.number + '. ' + p.name + ' (' + p.type + ') — ' + p.description
    ).join('\n')
    navigator.clipboard.writeText(component.name + ' Pinout\n\n' + text)
    notify.success('Pinout copied!')
  }

  const TABS = [
    { id: 'pins', label: '📌 Pins' },
    { id: 'facts', label: '📋 Key Facts' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid ' + component.color + '40', backgroundColor: component.color + '10' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">{component.icon}</span>
            <div>
              <h2 className="text-white font-bold text-lg">{component.name}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>⚡ {component.voltage}</span>
                <span>·</span>
                <span>{component.current}</span>
                <span>·</span>
                <span>{component.package}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyPinInfo} className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition">
              📋 Copy
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition px-2 text-xl">✕</button>
          </div>
        </div>

        {/* Description */}
        <div className="px-5 py-3 border-b border-[#1e1e2e] shrink-0">
          <p className="text-slate-400 text-xs">{component.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">

          {activeTab === 'pins' && (
            <>
              {/* Pin search */}
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search pins..."
                  className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl pl-8 pr-4 py-2 text-white text-xs outline-none focus:border-indigo-500"
                />
              </div>

              {/* Pin table */}
              <div className="bg-[#13131f] rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2e2e4e]">
                      <th className="text-left px-3 py-2 text-slate-500 w-8">#</th>
                      <th className="text-left px-3 py-2 text-slate-500 w-32">Pin Name</th>
                      <th className="text-left px-3 py-2 text-slate-500 w-28 hidden sm:table-cell">Type</th>
                      <th className="text-left px-3 py-2 text-slate-500">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPins.map((pin, i) => (
                      <tr key={i} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1e1e2e] transition">
                        <td className="px-3 py-2.5 text-slate-600 font-mono">{pin.number}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-white font-medium font-mono">{pin.name}</p>
                        </td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          <PinBadge type={pin.type} />
                        </td>
                        <td className="px-3 py-2.5 text-slate-400">{pin.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'facts' && (
            <div className="space-y-2">
              {component.keyFacts.map((fact, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                  <span className="text-indigo-400 shrink-0 font-bold text-xs">{i + 1}.</span>
                  <p className="text-slate-300 text-sm">{fact}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PinoutReference() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = search.trim()
    ? searchPinouts(search).filter(p => category === 'All' || p.category === category)
    : getPinoutByCategory(category)

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">📌 Pinout Reference</h2>
          <p className="text-slate-400 text-sm">
            {PINOUT_DATA.length} components · Quick reference for pins, specs and key facts
          </p>
        </div>
        <button
          onClick={() => navigate('/symbols')}
          className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
        >
          ⚡ Circuit Symbols →
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by component name or pin function..."
          className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {PINOUT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              category === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-slate-600 text-xs mb-4">
        Showing {filtered.length} of {PINOUT_DATA.length} components · Click any card to see full pinout
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(component => (
          <ComponentCard
            key={component.id}
            component={component}
            onSelect={setSelected}
            isSelected={selected?.id === component.id}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>No components match your search</p>
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
        <PinoutDetail component={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

export default PinoutReference