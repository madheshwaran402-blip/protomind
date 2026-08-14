import { useState } from 'react'
import { COMPONENT_DATABASE } from '../data/componentDatabase'
import { compareComponents, exportComparisonCSV } from '../services/componentComparisonService'
import { notify } from '../services/toast'

const PRESET_COMPARISONS = [
  {
    label: 'Microcontrollers',
    icon: '🔵',
    components: ['Arduino Nano', 'ESP32', 'Raspberry Pi Pico'],
  },
  {
    label: 'WiFi Boards',
    icon: '📡',
    components: ['ESP32', 'ESP8266', 'Arduino Nano'],
  },
  {
    label: 'Temp Sensors',
    icon: '🌡️',
    components: ['DHT22', 'DHT11', 'BME280'],
  },
  {
    label: 'Displays',
    icon: '🖥️',
    components: ['OLED Display 128x64', 'LCD 16x2 I2C', 'TFT Display 2.4"'],
  },
  {
    label: 'Distance Sensors',
    icon: '📏',
    components: ['HC-SR04 Ultrasonic', 'MPU-6050 Gyro'],
  },
]

const WINNER_LABELS = {
  overall: { label: 'Overall Best', icon: '🏆' },
  budget: { label: 'Best Budget', icon: '💰' },
  performance: { label: 'Best Performance', icon: '🚀' },
  beginner: { label: 'Best for Beginners', icon: '🎓' },
  iot: { label: 'Best for IoT', icon: '📡' },
}

function RatingStars({ rating }) {
  const stars = Math.round(parseFloat(rating) || 0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(function(i) {
        return (
          <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-slate-700'}>★</span>
        )
      })}
    </div>
  )
}

function ComponentCard({ comp, index, isWinner }) {
  const [expanded, setExpanded] = useState(false)
  const colors = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444']
  const color = colors[index % colors.length]

  return (
    <div
      className={'rounded-2xl border overflow-hidden ' + (isWinner ? 'border-yellow-700' : 'border-[#2e2e4e]')}
    >
      <div
        className={'p-4 cursor-pointer hover:opacity-90 transition ' + (isWinner ? 'bg-yellow-950' : 'bg-[#13131f]')}
        onClick={function() { setExpanded(!expanded) }}
      >
        {isWinner && (
          <p className="text-yellow-400 text-xs font-bold mb-1">⭐ Overall Winner</p>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{comp.icon}</span>
          <div>
            <p className="text-white font-bold text-sm">{comp.name}</p>
            <p className="text-slate-500 text-xs">{comp.tagline}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          {[
            { label: 'Price', value: comp.price },
            { label: 'Voltage', value: comp.voltage },
            { label: 'GPIO', value: comp.gpioCount },
            { label: 'Difficulty', value: comp.difficulty },
          ].map(function(item) {
            return (
              <div key={item.label} className="bg-[#0d0d1a] rounded-lg p-1.5">
                <p className="text-slate-500">{item.label}</p>
                <p className="text-white font-medium text-xs">{item.value || 'N/A'}</p>
              </div>
            )
          })}
        </div>

        <RatingStars rating={comp.rating} />
        <span className="text-slate-600 text-xs float-right">{expanded ? '↑' : '↓'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#2e2e4e] pt-3 space-y-3">
          {comp.interfaces && comp.interfaces.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Interfaces</p>
              <div className="flex flex-wrap gap-1">
                {comp.interfaces.map(function(iface, i) {
                  return (
                    <span key={i} className="text-xs bg-[#13131f] border border-[#2e2e4e] text-slate-300 px-2 py-0.5 rounded-full">
                      {iface}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {comp.pros && comp.pros.length > 0 && (
              <div>
                <p className="text-green-400 text-xs font-semibold mb-1">✓ Pros</p>
                <ul className="space-y-0.5">
                  {comp.pros.map(function(pro, i) {
                    return <li key={i} className="text-slate-300 text-xs">• {pro}</li>
                  })}
                </ul>
              </div>
            )}
            {comp.cons && comp.cons.length > 0 && (
              <div>
                <p className="text-red-400 text-xs font-semibold mb-1">✗ Cons</p>
                <ul className="space-y-0.5">
                  {comp.cons.map(function(con, i) {
                    return <li key={i} className="text-slate-400 text-xs">• {con}</li>
                  })}
                </ul>
              </div>
            )}
          </div>

          {comp.bestFor && comp.bestFor.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Best For</p>
              <div className="flex flex-wrap gap-1">
                {comp.bestFor.map(function(use, i) {
                  return (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{ color, backgroundColor: color + '15', borderColor: color + '30' }}
                    >
                      {use}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ComponentComparisonTable() {
  const [selectedComponents, setSelectedComponents] = useState([])
  const [customInput, setCustomInput] = useState('')
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('cards')

  const allComponentNames = COMPONENT_DATABASE.map(function(c) { return c.name })

  function toggleComponent(name) {
    setSelectedComponents(function(prev) {
      if (prev.includes(name)) return prev.filter(function(n) { return n !== name })
      if (prev.length >= 5) {
        notify.warning('Maximum 5 components to compare')
        return prev
      }
      return prev.concat([name])
    })
    setComparison(null)
  }

  function loadPreset(preset) {
    setSelectedComponents(preset.components)
    setComparison(null)
  }

  function addCustom() {
    const name = customInput.trim()
    if (!name) return
    if (selectedComponents.includes(name)) {
      notify.warning('Already added')
      return
    }
    if (selectedComponents.length >= 5) {
      notify.warning('Maximum 5 components')
      return
    }
    setSelectedComponents(function(prev) { return prev.concat([name]) })
    setCustomInput('')
    setComparison(null)
  }

  async function handleCompare() {
    if (selectedComponents.length < 2) {
      notify.warning('Select at least 2 components to compare')
      return
    }
    setLoading(true)
    setComparison(null)
    try {
      const data = await compareComponents(selectedComponents)
      setComparison(data)
      setActiveTab('cards')
      notify.success('Comparison ready!')
    } catch {
      notify.error('Comparison failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'cards', label: '🃏 Cards' },
    { id: 'table', label: '📊 Table' },
    { id: 'winners', label: '🏆 Winners' },
  ]

  const overallWinner = comparison?.winner?.overall

  return (
    <div className="space-y-4">

      {/* Preset comparisons */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Quick Presets</p>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COMPARISONS.map(function(preset) {
            return (
              <button
                key={preset.label}
                onClick={function() { loadPreset(preset) }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-700 text-slate-400 hover:text-white rounded-xl transition"
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Component selector */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
          Select Components ({selectedComponents.length}/5)
        </p>
        <div className="flex flex-wrap gap-1 mb-3 min-h-8">
          {selectedComponents.map(function(name) {
            const dbComp = COMPONENT_DATABASE.find(function(c) { return c.name === name })
            return (
              <button
                key={name}
                onClick={function() { toggleComponent(name) }}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-indigo-950 border border-indigo-700 text-indigo-300 rounded-xl hover:bg-red-950 hover:border-red-800 hover:text-red-300 transition"
              >
                <span>{dbComp?.icon || '🔧'}</span>
                <span>{name}</span>
                <span className="text-xs opacity-60">✕</span>
              </button>
            )
          })}
          {selectedComponents.length === 0 && (
            <p className="text-slate-600 text-xs py-1">Select components below or use a preset</p>
          )}
        </div>

        {/* Database components */}
        <div className="max-h-40 overflow-y-auto bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-2">
          <div className="flex flex-wrap gap-1">
            {COMPONENT_DATABASE.map(function(comp) {
              const selected = selectedComponents.includes(comp.name)
              return (
                <button
                  key={comp.id}
                  onClick={function() { toggleComponent(comp.name) }}
                  className={'text-xs px-2 py-1 rounded-lg border transition flex items-center gap-1 ' + (
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                  )}
                >
                  <span>{comp.icon}</span>
                  <span>{comp.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom component input */}
        <div className="flex gap-2 mt-2">
          <input
            value={customInput}
            onChange={function(e) { setCustomInput(e.target.value) }}
            onKeyDown={function(e) { if (e.key === 'Enter') addCustom() }}
            placeholder="Or type any component name..."
            className="flex-1 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
          />
          <button
            onClick={addCustom}
            className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
          >
            + Add
          </button>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading || selectedComponents.length < 2}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? '📊 Comparing...' : '📊 Compare ' + selectedComponents.length + ' Components'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Comparing components...</p>
        </div>
      )}

      {comparison && !loading && (
        <>
          {/* Title */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h3 className="text-white font-bold text-base mb-2">{comparison.title}</h3>
            <p className="text-slate-400 text-sm">{comparison.recommendation}</p>
          </div>

          {/* Export */}
          <button
            onClick={function() { exportComparisonCSV(comparison); notify.success('Comparison exported!') }}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
          >
            ⬇️ Export Comparison as CSV
          </button>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
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

          {/* Cards tab */}
          {activeTab === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(comparison.components || []).map(function(comp, i) {
                const isWinner = overallWinner && comp.name.toLowerCase().includes(overallWinner.toLowerCase())
                return (
                  <ComponentCard
                    key={comp.name || i}
                    comp={comp}
                    index={i}
                    isWinner={isWinner}
                  />
                )
              })}
            </div>
          )}

          {/* Table tab */}
          {activeTab === 'table' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#0d0d1a] border-b border-[#2e2e4e]">
                      <th className="text-left px-4 py-2.5 text-slate-500 w-32">Parameter</th>
                      <th className="text-left px-3 py-2.5 text-slate-500 w-12">Unit</th>
                      {(comparison.components || []).map(function(comp) {
                        return (
                          <th key={comp.name} className="text-left px-3 py-2.5 text-slate-300 whitespace-nowrap">
                            {comp.icon} {comp.name}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {(comparison.comparisonRows || []).map(function(row, i) {
                      const values = (comparison.components || []).map(function(comp) {
                        return row.values ? (row.values[comp.name] || 'N/A') : 'N/A'
                      })
                      const numValues = values.map(function(v) { return parseFloat(v) }).filter(function(v) { return !isNaN(v) })
                      const maxVal = numValues.length > 0 ? Math.max.apply(null, numValues) : null

                      return (
                        <tr key={i} className={'border-b border-[#1e1e2e] last:border-0 ' + (i % 2 === 0 ? 'bg-[#13131f]' : 'bg-[#0d0d1a]')}>
                          <td className="px-4 py-2.5 text-slate-400 font-medium">{row.parameter}</td>
                          <td className="px-3 py-2.5 text-slate-600">{row.unit || ''}</td>
                          {values.map(function(val, j) {
                            const numVal = parseFloat(val)
                            const isBest = !isNaN(numVal) && maxVal !== null && numVal === maxVal
                            return (
                              <td key={j} className={'px-3 py-2.5 font-mono ' + (isBest ? 'text-green-400 font-bold' : 'text-white')}>
                                {val}
                                {isBest && numValues.length > 1 && <span className="text-green-600 ml-1">↑</span>}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Winners tab */}
          {activeTab === 'winners' && comparison.winner && (
            <div className="space-y-2">
              {Object.entries(comparison.winner).map(function(entry) {
                const key = entry[0]
                const winnerName = entry[1]
                const meta = WINNER_LABELS[key]
                if (!meta || !winnerName) return null
                const winnerComp = (comparison.components || []).find(function(c) {
                  return c.name.toLowerCase().includes(winnerName.toLowerCase())
                })
                return (
                  <div key={key} className="flex items-center gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <span className="text-2xl shrink-0">{meta.icon}</span>
                    <div className="flex-1">
                      <p className="text-slate-500 text-xs">{meta.label}</p>
                      <p className="text-white font-bold text-sm">{winnerName}</p>
                    </div>
                    {winnerComp && (
                      <span className="text-2xl">{winnerComp.icon}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={function() { setComparison(null); setSelectedComponents([]) }}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ New Comparison
          </button>
        </>
      )}

      {!comparison && !loading && selectedComponents.length === 0 && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-white font-semibold mb-1">Component Comparison Table</p>
          <p className="text-slate-500 text-sm">Select components above or use a preset to compare</p>
        </div>
      )}
    </div>
  )
}

export default ComponentComparisonTable