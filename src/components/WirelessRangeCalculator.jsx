import { useState } from 'react'
import { calculateWirelessRange, saveWirelessData, getWirelessData } from '../services/wirelessRangeService'
import { notify } from '../services/toast'

const PROTOCOL_COLORS = { WiFi: '#0ea5e9', Bluetooth: '#6366f1', LoRa: '#22c55e', Zigbee: '#f59e0b', NRF24: '#a855f7', ESP_NOW: '#ef4444' }

function WirelessRangeCalculator({ idea, components }) {
  const [result, setResult] = useState(getWirelessData(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  async function handleCalculate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await calculateWirelessRange(idea, components)
      setResult(data)
      saveWirelessData(idea, data)
      notify.success('Wireless analysis complete!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const protocols = result?.protocols || []
  const activeProtocol = protocols[selected]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Calculate wireless range and compare protocols for your prototype</p>
        <button onClick={handleCalculate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-sky-700 hover:bg-sky-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Calculating...' : 'Analyse Wireless'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Analysing wireless protocols...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {protocols.map(function(p, i) {
              const color = PROTOCOL_COLORS[p.name] || '#6366f1'
              return (
                <button key={i} onClick={function() { setSelected(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition ' + (selected === i ? 'text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}
                  style={selected === i ? { backgroundColor: color } : {}}>
                  {p.name}
                </button>
              )
            })}
          </div>

          {activeProtocol && (
            <div className="space-y-3">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: (PROTOCOL_COLORS[activeProtocol.name] || '#6366f1') + '20' }}>
                    📶
                  </div>
                  <div>
                    <p className="text-white font-black text-lg">{activeProtocol.name}</p>
                    <p className="text-slate-500 text-xs">{activeProtocol.frequency}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Indoor Range', value: activeProtocol.indoorRange, icon: '🏠' },
                    { label: 'Outdoor Range', value: activeProtocol.outdoorRange, icon: '🌳' },
                    { label: 'Data Rate', value: activeProtocol.dataRate, icon: '📊' },
                    { label: 'Power Use', value: activeProtocol.powerConsumption, icon: '🔋' },
                  ].map(function(item) {
                    return item.value ? (
                      <div key={item.label} className="bg-[#13131f] rounded-xl p-3">
                        <p className="text-slate-500 text-xs">{item.icon} {item.label}</p>
                        <p className="text-white font-bold text-sm">{item.value}</p>
                      </div>
                    ) : null
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeProtocol.pros && activeProtocol.pros.length > 0 && (
                  <div className="bg-green-950 border border-green-800 rounded-xl p-3">
                    <p className="text-green-400 text-xs font-semibold mb-1">Pros</p>
                    {activeProtocol.pros.map(function(p, i) {
                      return <p key={i} className="text-slate-300 text-xs">+ {p}</p>
                    })}
                  </div>
                )}
                {activeProtocol.cons && activeProtocol.cons.length > 0 && (
                  <div className="bg-red-950 border border-red-800 rounded-xl p-3">
                    <p className="text-red-400 text-xs font-semibold mb-1">Cons</p>
                    {activeProtocol.cons.map(function(c, i) {
                      return <p key={i} className="text-slate-400 text-xs">- {c}</p>
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">Recommendations</p>
              <ul className="space-y-1">
                {result.recommendations.map(function(rec, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400">{i+1}.</span>{rec}</li>
                })}
              </ul>
            </div>
          )}

          {result.antennaAdvice && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-slate-500 text-xs font-semibold mb-1">Antenna Advice</p>
              <p className="text-slate-300 text-sm">{result.antennaAdvice}</p>
            </div>
          )}

          <button onClick={handleCalculate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Recalculate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📶</div>
          <p className="text-white font-semibold mb-1">Wireless Range Calculator</p>
          <p className="text-slate-500 text-sm">Compare WiFi, Bluetooth, LoRa range and performance</p>
        </div>
      )}
    </div>
  )
}

export default WirelessRangeCalculator
