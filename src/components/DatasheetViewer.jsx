import { useState, useEffect } from 'react'
import { getComponentDatasheet, saveDatasheet, getSavedDatasheets } from '../services/datasheetService'
import { notify } from '../services/toast'

const PIN_TYPE_COLORS = {
  Power: 'text-red-400 bg-red-950 border-red-800',
  Ground: 'text-slate-400 bg-slate-900 border-slate-700',
  Input: 'text-blue-400 bg-blue-950 border-blue-800',
  Output: 'text-green-400 bg-green-950 border-green-800',
  'Input/Output': 'text-indigo-400 bg-indigo-950 border-indigo-800',
  Clock: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Data: 'text-cyan-400 bg-cyan-950 border-cyan-800',
  Analog: 'text-purple-400 bg-purple-950 border-purple-800',
}

function DatasheetViewer({ components }) {
  const [selectedComponent, setSelectedComponent] = useState(
    components.length > 0 ? components[0].name : ''
  )
  const [customSearch, setCustomSearch] = useState('')
  const [datasheet, setDatasheet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('specs')
  const [saved, setSaved] = useState(getSavedDatasheets())

  useEffect(function() {
    if (components.length > 0 && !selectedComponent) {
      setSelectedComponent(components[0].name)
    }
  }, [components])

  async function handleFetch(componentName) {
    const name = componentName || selectedComponent || customSearch
    if (!name.trim()) {
      notify.warning('Enter a component name')
      return
    }

    const savedData = getSavedDatasheets()
    if (savedData[name]) {
      setDatasheet(savedData[name].data)
      notify.success('Loaded from cache!')
      return
    }

    setLoading(true)
    setDatasheet(null)
    try {
      const data = await getComponentDatasheet(name)
      setDatasheet(data)
      saveDatasheet(name, data)
      setSaved(getSavedDatasheets())
      notify.success('Datasheet loaded for ' + data.name)
    } catch {
      notify.error('Failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'specs', label: '📊 Specs' },
    { id: 'pinout', label: '📌 Pinout' },
    { id: 'code', label: '💻 Code' },
    { id: 'issues', label: '⚠️ Issues' },
  ]

  return (
    <div className="space-y-4">

      {/* Component selector */}
      <div className="space-y-2">
        {components.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Your components</p>
            <div className="flex flex-wrap gap-1">
              {components.map(function(comp) {
                return (
                  <button
                    key={comp.id || comp.name}
                    onClick={function() {
                      setSelectedComponent(comp.name)
                      setCustomSearch('')
                      setDatasheet(null)
                      handleFetch(comp.name)
                    }}
                    className={'text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-1 ' + (
                      selectedComponent === comp.name && !customSearch
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                    )}
                  >
                    <span>{comp.icon}</span>
                    <span>{comp.name}</span>
                    {saved[comp.name] && <span className="text-green-400">●</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={customSearch}
            onChange={function(e) { setCustomSearch(e.target.value); setSelectedComponent('') }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleFetch(customSearch) }}
            placeholder="Or search any component... e.g. LM386, NE555, AMS1117"
            className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500 placeholder-slate-600"
          />
          <button
            onClick={function() { handleFetch(customSearch || selectedComponent) }}
            disabled={loading || (!customSearch && !selectedComponent)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
          >
            {loading ? '🔍' : '🔍 Lookup'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Looking up datasheet...</p>
        </div>
      )}

      {datasheet && !loading && (
        <>
          {/* Header */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white font-black text-lg">{datasheet.name}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{datasheet.fullName}</p>
                <div className="flex items-center gap-2 mt-1">
                  {datasheet.manufacturer && (
                    <span className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-2 py-0.5 rounded-full">
                      {datasheet.manufacturer}
                    </span>
                  )}
                  {datasheet.category && (
                    <span className="text-xs text-indigo-400">{datasheet.category}</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{datasheet.description}</p>
              </div>
              {datasheet.datasheetUrl && (
                <a
                  href={datasheet.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shrink-0 transition"
                >
                  📄 Datasheet
                </a>
              )}
            </div>

            {/* Operating conditions */}
            {datasheet.operatingConditions && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { label: 'Voltage', value: (datasheet.operatingConditions.minVoltage || '') + ' - ' + (datasheet.operatingConditions.maxVoltage || '') + 'V' },
                  { label: 'Typ Voltage', value: (datasheet.operatingConditions.typVoltage || 'N/A') + 'V' },
                  { label: 'Max Current', value: datasheet.operatingConditions.maxCurrent || 'N/A' },
                  { label: 'Min Temp', value: (datasheet.operatingConditions.minTemp || 'N/A') + '°C' },
                  { label: 'Max Temp', value: (datasheet.operatingConditions.maxTemp || 'N/A') + '°C' },
                  { label: 'Interfaces', value: (datasheet.interfaces || []).slice(0, 2).join(', ') || 'N/A' },
                ].map(function(item) {
                  return (
                    <div key={item.label} className="bg-[#0d0d1a] rounded-xl p-2 text-center">
                      <p className="text-white text-xs font-bold">{item.value}</p>
                      <p className="text-slate-600 text-xs">{item.label}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Buy links */}
          {datasheet.buyLinks && datasheet.buyLinks.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {datasheet.buyLinks.map(function(link, i) {
                return (
                  <button
                    key={i}
                    onClick={function() {
                      const url = 'https://www.google.com/search?q=' + encodeURIComponent(link.searchTerm || datasheet.name)
                      window.open(url, '_blank')
                    }}
                    className="flex items-center gap-1 text-xs bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-600 text-slate-300 px-3 py-1.5 rounded-lg transition"
                  >
                    🛒 {link.supplier} ↗️
                  </button>
                )
              })}
            </div>
          )}

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

          {/* Specs tab */}
          {activeTab === 'specs' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2e2e4e] bg-[#0d0d1a]">
                    <th className="text-left px-4 py-2 text-slate-500">Parameter</th>
                    <th className="text-left px-4 py-2 text-slate-500">Value</th>
                    <th className="text-left px-4 py-2 text-slate-500">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(datasheet.keySpecs || []).map(function(spec, i) {
                    return (
                      <tr key={i} className={'border-b border-[#1e1e2e] last:border-0 ' + (i % 2 === 0 ? 'bg-[#13131f]' : 'bg-[#0d0d1a]')}>
                        <td className="px-4 py-2.5 text-slate-400 font-medium">{spec.parameter}</td>
                        <td className="px-4 py-2.5 text-white font-mono">{spec.value}</td>
                        <td className="px-4 py-2.5 text-slate-500">{spec.notes || ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {datasheet.alternatives && datasheet.alternatives.length > 0 && (
                <div className="p-4 border-t border-[#2e2e4e]">
                  <p className="text-xs text-slate-500 font-semibold mb-2">Alternatives</p>
                  <div className="space-y-2">
                    {datasheet.alternatives.map(function(alt, i) {
                      return (
                        <div key={i} className="flex items-start gap-2 bg-[#0d0d1a] rounded-lg p-2">
                          <p className="text-white text-xs font-medium w-24 shrink-0">{alt.name}</p>
                          <p className="text-green-400 text-xs flex-1">{alt.pros}</p>
                          <p className="text-red-400 text-xs flex-1">{alt.cons}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pinout tab */}
          {activeTab === 'pinout' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2e2e4e] bg-[#0d0d1a]">
                    <th className="text-left px-4 py-2 text-slate-500">Pin</th>
                    <th className="text-left px-4 py-2 text-slate-500">Name</th>
                    <th className="text-left px-4 py-2 text-slate-500">Type</th>
                    <th className="text-left px-4 py-2 text-slate-500">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {(datasheet.pinout || []).map(function(pin, i) {
                    const typeClass = PIN_TYPE_COLORS[pin.type] || 'text-slate-400 bg-slate-900 border-slate-700'
                    return (
                      <tr key={i} className={'border-b border-[#1e1e2e] last:border-0 ' + (i % 2 === 0 ? 'bg-[#13131f]' : 'bg-[#0d0d1a]')}>
                        <td className="px-4 py-2.5">
                          <span className="text-indigo-400 font-mono font-bold">{pin.pin}</span>
                        </td>
                        <td className="px-4 py-2.5 text-white font-medium">{pin.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={'text-xs px-1.5 py-0.5 rounded border ' + typeClass}>
                            {pin.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">{pin.description}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Code tab */}
          {activeTab === 'code' && datasheet.codeExample && (
            <div className="space-y-3">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                <p className="text-slate-400 text-xs">{datasheet.codeExample.description}</p>
              </div>
              <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-slate-500 text-xs ml-2">{datasheet.codeExample.language || 'Arduino'}</span>
                  <button
                    onClick={function() {
                      navigator.clipboard.writeText(datasheet.codeExample.code || '')
                      notify.success('Code copied!')
                    }}
                    className="ml-auto text-xs text-slate-500 hover:text-white transition"
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="p-4 text-xs text-green-400 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap max-h-72">
                  {datasheet.codeExample.code}
                </pre>
              </div>
            </div>
          )}

          {/* Issues tab */}
          {activeTab === 'issues' && (
            <div className="space-y-2">
              {(datasheet.commonIssues || []).map(function(issue, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white text-sm font-semibold mb-2">{issue.issue}</p>
                    <div className="space-y-1">
                      <p className="text-red-300 text-xs">
                        <span className="text-red-400 font-semibold">Cause: </span>{issue.cause}
                      </p>
                      <p className="text-green-300 text-xs">
                        <span className="text-green-400 font-semibold">Fix: </span>{issue.fix}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={function() {
              const name = customSearch || selectedComponent
              const saved = getSavedDatasheets()
              if (saved[name]) {
                delete saved[name]
                localStorage.setItem('protomind_datasheets', JSON.stringify(saved))
                setSaved(getSavedDatasheets())
              }
              handleFetch(name)
            }}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Refresh Datasheet
          </button>
        </>
      )}

      {!datasheet && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-white font-semibold mb-1">Component Datasheet Viewer</p>
          <p className="text-slate-500 text-sm mb-4">
            Click any component above or search to get specs, pinout and code examples
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Key specs</span>
            <span>✓ Full pinout</span>
            <span>✓ Code examples</span>
            <span>✓ Common issues</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatasheetViewer