import { useState, useEffect } from 'react'
import { generateDatasheet, getCachedDatasheet, cacheDatasheet } from '../services/datasheetService'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
  Memory: '#64748b',
}

function PinRow({ pin }) {
  const pinColors = {
    VCC: 'text-red-400',
    GND: 'text-gray-400',
    SDA: 'text-purple-400',
    SCL: 'text-purple-400',
    TX: 'text-blue-400',
    RX: 'text-blue-400',
    SCK: 'text-orange-400',
    MOSI: 'text-orange-400',
    MISO: 'text-orange-400',
    CS: 'text-yellow-400',
    SS: 'text-yellow-400',
    INT: 'text-pink-400',
    RST: 'text-pink-400',
    EN: 'text-green-400',
  }
  const color = Object.entries(pinColors).find(([key]) =>
    pin.name?.toUpperCase().includes(key)
  )?.[1] || 'text-slate-300'

  return (
    <tr className="border-b border-[#1e1e2e] last:border-0">
      <td className="px-3 py-2 text-slate-500 text-xs w-12 text-center font-mono">{pin.number}</td>
      <td className={`px-3 py-2 text-xs font-bold font-mono ${color}`}>{pin.name}</td>
      <td className="px-3 py-2 text-slate-400 text-xs">{pin.description}</td>
    </tr>
  )
}

function DatasheetViewer({ component, onClose }) {
  const [datasheet, setDatasheet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!component) return
    const cached = getCachedDatasheet(component.name)
    if (cached) {
      setDatasheet(cached)
      return
    }
    handleGenerate()
  }, [component])

  async function handleGenerate() {
    setLoading(true)
    try {
      const data = await generateDatasheet(component)
      setDatasheet(data)
      cacheDatasheet(component.name, data)
      notify.success('Datasheet generated for ' + component.name)
    } catch {
      notify.error('Failed to generate datasheet — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyCode() {
    if (!datasheet?.codeExample) return
    navigator.clipboard.writeText(datasheet.codeExample)
    setCopied(true)
    notify.success('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!component) return null

  const accentColor = CATEGORY_COLORS[component.category] || '#6366f1'

  const TABS = [
    { id: 'overview', label: '📋 Overview' },
    { id: 'pins', label: '📌 Pinout' },
    { id: 'specs', label: '⚡ Specs' },
    { id: 'code', label: '💻 Code' },
    { id: 'buy', label: '🛒 Buy' },
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
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid ' + accentColor + '40', background: accentColor + '10' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">{component.icon}</span>
            <div>
              <h2 className="text-white font-bold text-lg">{component.name}</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: accentColor + '20', color: accentColor }}
              >
                {component.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-0 shrink-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-t-lg text-xs font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#13131f] text-white border border-b-0 border-[#2e2e4e]'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#13131f] border-t border-[#2e2e4e]">

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: accentColor + '50', borderTopColor: accentColor }}
              />
              <p className="text-slate-400 text-sm">Generating datasheet for {component.name}...</p>
            </div>
          )}

          {!loading && !datasheet && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="text-5xl">{component.icon}</div>
              <p className="text-slate-400 text-sm">No datasheet generated yet</p>
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition text-white"
                style={{ backgroundColor: accentColor }}
              >
                Generate Datasheet
              </button>
            </div>
          )}

          {datasheet && !loading && (
            <div className="p-5">

              {/* Overview tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div
                    className="rounded-xl p-4"
                    style={{ backgroundColor: accentColor + '10', border: '1px solid ' + accentColor + '30' }}
                  >
                    <p className="text-white text-sm leading-relaxed">{datasheet.overview}</p>
                  </div>

                  {datasheet.features?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {datasheet.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 bg-[#0d0d1a] rounded-lg p-2.5">
                            <span style={{ color: accentColor }} className="shrink-0 text-xs mt-0.5">✓</span>
                            <p className="text-slate-300 text-xs">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {datasheet.applications?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Typical Applications</h4>
                      <div className="flex flex-wrap gap-2">
                        {datasheet.applications.map((app, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: accentColor + '15', color: accentColor, border: '1px solid ' + accentColor + '30' }}
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {datasheet.warnings?.length > 0 && (
                    <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">⚠️ Warnings</h4>
                      <ul className="space-y-1">
                        {datasheet.warnings.map((w, i) => (
                          <li key={i} className="text-red-300 text-xs flex items-start gap-2">
                            <span className="shrink-0">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Pinout tab */}
              {activeTab === 'pins' && (
                <div>
                  <p className="text-slate-500 text-xs mb-3">
                    {datasheet.pins?.length || 0} pins defined
                  </p>
                  {datasheet.pins?.length > 0 ? (
                    <div className="bg-[#0d0d1a] rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#1e1e2e]">
                            <th className="px-3 py-2 text-left text-xs text-slate-600 w-12">#</th>
                            <th className="px-3 py-2 text-left text-xs text-slate-600">Pin Name</th>
                            <th className="px-3 py-2 text-left text-xs text-slate-600">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datasheet.pins.map((pin, i) => (
                            <PinRow key={i} pin={pin} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm text-center py-8">No pin data available</p>
                  )}
                </div>
              )}

              {/* Specs tab */}
              {activeTab === 'specs' && (
                <div>
                  {datasheet.specs && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(datasheet.specs).map(([key, value]) => (
                        <div key={key} className="bg-[#0d0d1a] rounded-xl p-3">
                          <p className="text-slate-500 text-xs mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-white text-sm font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Code tab */}
              {activeTab === 'code' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-500">Arduino/ESP32 starter code</p>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-300 rounded-lg text-xs transition"
                    >
                      {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-[#13131f] border-b border-[#1e1e2e]">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-slate-600 text-xs ml-2">{component.name.replace(/\s+/g, '_')}.ino</span>
                    </div>
                    <pre className="p-4 text-xs text-green-400 overflow-x-auto font-mono leading-relaxed max-h-64">
                      <code>{datasheet.codeExample}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Buy tab */}
              {activeTab === 'buy' && (
                <div className="space-y-3">
                  <p className="text-slate-500 text-xs mb-3">Search for {component.name} on these platforms</p>
                  {datasheet.buyLinks?.map((link, i) => (
                    <a
                      key={i}
                      href={'https://www.google.com/search?q=' + encodeURIComponent(link.search || component.name + ' ' + link.store)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-[#0d0d1a] hover:bg-[#1e1e2e] border border-[#2e2e4e] hover:border-indigo-800 rounded-xl transition"
                    >
                      <span className="text-xl">
                        {link.store === 'Amazon' ? '📦' : link.store === 'AliExpress' ? '🌏' : link.store === 'Adafruit' ? '🔴' : '🛒'}
                      </span>
                      <div>
                        <p className="text-white text-sm font-medium">{link.store}</p>
                        <p className="text-slate-500 text-xs">{link.search || 'Search ' + component.name}</p>
                      </div>
                      <span className="ml-auto text-slate-600 text-xs">↗️</span>
                    </a>
                  ))}

                  <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl p-3 mt-2">
                    <p className="text-slate-500 text-xs">
                      💡 Prices vary by seller. Always check reviews and verify specifications before purchasing.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e1e2e] flex items-center justify-between shrink-0">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-white transition disabled:opacity-50"
          >
            ↺ Regenerate
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DatasheetViewer