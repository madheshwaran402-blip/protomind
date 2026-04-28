import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

const AWG_DATA = [
  { awg: 4, diameterMm: 5.19, areaMm2: 21.15, maxCurrentA: 95, resistanceOhmPerM: 0.000815, commonUse: 'Heavy power cables, EV charging' },
  { awg: 6, diameterMm: 4.11, areaMm2: 13.30, maxCurrentA: 75, resistanceOhmPerM: 0.001296, commonUse: 'High current motors, inverters' },
  { awg: 8, diameterMm: 3.26, areaMm2: 8.37, maxCurrentA: 55, resistanceOhmPerM: 0.002060, commonUse: 'Power supplies, large motors' },
  { awg: 10, diameterMm: 2.59, areaMm2: 5.26, maxCurrentA: 40, resistanceOhmPerM: 0.003276, commonUse: 'Power tools, thick extension cords' },
  { awg: 12, diameterMm: 2.05, areaMm2: 3.31, maxCurrentA: 25, resistanceOhmPerM: 0.005211, commonUse: 'Household wiring, high power circuits' },
  { awg: 14, diameterMm: 1.63, areaMm2: 2.08, maxCurrentA: 15, resistanceOhmPerM: 0.008285, commonUse: 'Household wiring, lighting circuits' },
  { awg: 16, diameterMm: 1.29, areaMm2: 1.31, maxCurrentA: 10, resistanceOhmPerM: 0.01318, commonUse: 'Extension cords, small appliances' },
  { awg: 18, diameterMm: 1.02, areaMm2: 0.823, maxCurrentA: 7, resistanceOhmPerM: 0.02093, commonUse: 'Small appliances, lighting, robots' },
  { awg: 20, diameterMm: 0.812, areaMm2: 0.518, maxCurrentA: 5, resistanceOhmPerM: 0.03325, commonUse: 'Internal wiring, breadboard jumpers' },
  { awg: 22, diameterMm: 0.644, areaMm2: 0.326, maxCurrentA: 3, resistanceOhmPerM: 0.05284, commonUse: 'Signal wiring, Arduino projects' },
  { awg: 24, diameterMm: 0.511, areaMm2: 0.205, maxCurrentA: 2, resistanceOhmPerM: 0.08408, commonUse: 'Signal wiring, breadboard wires' },
  { awg: 26, diameterMm: 0.405, areaMm2: 0.129, maxCurrentA: 1, resistanceOhmPerM: 0.1337, commonUse: 'PCB wiring, small signal lines' },
  { awg: 28, diameterMm: 0.321, areaMm2: 0.0810, maxCurrentA: 0.5, resistanceOhmPerM: 0.2127, commonUse: 'Thin hookup wire, I2C lines' },
  { awg: 30, diameterMm: 0.255, areaMm2: 0.0509, maxCurrentA: 0.3, resistanceOhmPerM: 0.3386, commonUse: 'Very thin wire, sensor connections' },
]

function getCurrentColor(current, maxCurrent) {
  const ratio = current / maxCurrent
  if (ratio > 0.9) return 'text-red-400'
  if (ratio > 0.7) return 'text-orange-400'
  if (ratio > 0.5) return 'text-yellow-400'
  return 'text-green-400'
}

function WireGauge() {
  const navigate = useNavigate()
  const [currentNeeded, setCurrentNeeded] = useState('')
  const [lengthM, setLengthM] = useState('1')
  const [voltage, setVoltage] = useState('5')
  const [maxVoltageDrop, setMaxVoltageDrop] = useState('5')
  const [filterCurrent, setFilterCurrent] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('table')

  const currentA = parseFloat(currentNeeded) || 0
  const length = parseFloat(lengthM) || 1
  const vDrop = parseFloat(maxVoltageDrop) / 100
  const V = parseFloat(voltage) || 5

  const maxResistance = currentA > 0 ? (V * vDrop) / currentA : 0
  const recommendedGauges = AWG_DATA.filter(w =>
    w.maxCurrentA >= currentA &&
    (w.resistanceOhmPerM * length * 2) <= maxResistance
  )
  const bestGauge = recommendedGauges[recommendedGauges.length - 1]

  const filtered = AWG_DATA.filter(w => {
    const matchCurrent = !filterCurrent || w.maxCurrentA >= parseFloat(filterCurrent)
    const matchSearch = !search ||
      w.awg.toString().includes(search) ||
      w.commonUse.toLowerCase().includes(search.toLowerCase())
    return matchCurrent && matchSearch
  })

  const TABS = [
    { id: 'table', label: '📋 Reference Table' },
    { id: 'calculator', label: '🧮 Wire Calculator' },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🔌 Wire Gauge Reference</h2>
          <p className="text-slate-400 text-sm">
            AWG wire gauge table with current ratings and voltage drop calculator
          </p>
        </div>
        <button
          onClick={() => navigate('/calculator')}
          className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
        >
          🧮 Calculator →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 mb-6 max-w-sm">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calculator tab */}
      {activeTab === 'calculator' && (
        <div className="space-y-4 mb-6">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Wire Gauge Calculator</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Current Required (A)</p>
                <input
                  type="number"
                  value={currentNeeded}
                  onChange={e => setCurrentNeeded(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Wire Length (m)</p>
                <input
                  type="number"
                  value={lengthM}
                  onChange={e => setLengthM(e.target.value)}
                  placeholder="1"
                  className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Supply Voltage (V)</p>
                <input
                  type="number"
                  value={voltage}
                  onChange={e => setVoltage(e.target.value)}
                  placeholder="5"
                  className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Max Voltage Drop (%)</p>
                <input
                  type="number"
                  value={maxVoltageDrop}
                  onChange={e => setMaxVoltageDrop(e.target.value)}
                  placeholder="5"
                  className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {currentA > 0 && (
              <div className="space-y-3">
                {bestGauge ? (
                  <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                    <p className="text-green-400 font-semibold text-sm mb-1">
                      ✅ Recommended: AWG {bestGauge.awg}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      {[
                        { label: 'Max Current', value: bestGauge.maxCurrentA + 'A' },
                        { label: 'Diameter', value: bestGauge.diameterMm + 'mm' },
                        { label: 'Voltage Drop', value: ((bestGauge.resistanceOhmPerM * length * 2 * currentA) / V * 100).toFixed(2) + '%' },
                        { label: 'Total Resistance', value: (bestGauge.resistanceOhmPerM * length * 2).toFixed(4) + 'Ω' },
                      ].map(item => (
                        <div key={item.label} className="bg-green-900 bg-opacity-30 rounded-lg p-2 text-center">
                          <p className="text-green-300 text-sm font-bold">{item.value}</p>
                          <p className="text-green-700 text-xs">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-green-700 text-xs mt-2">Use case: {bestGauge.commonUse}</p>
                  </div>
                ) : (
                  <div className="bg-red-950 border border-red-800 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-semibold">⚠️ No suitable wire found in standard AWG range</p>
                    <p className="text-red-700 text-xs mt-1">Consider multiple wires in parallel or a thicker cable</p>
                  </div>
                )}

                {recommendedGauges.length > 1 && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">All suitable gauges</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendedGauges.map(w => (
                        <span key={w.awg} className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-1 rounded-full">
                          AWG {w.awg} (max {w.maxCurrentA}A)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentA === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">Enter your current requirement to get a recommendation</p>
            )}
          </div>

          <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
            <p className="text-indigo-400 text-xs font-semibold mb-1">💡 Wire Selection Tips</p>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>• Always choose wire rated 20-25% above your maximum current</li>
              <li>• For long runs, go one gauge thicker to reduce voltage drop</li>
              <li>• AWG 22-26 is standard for most Arduino/ESP32 projects</li>
              <li>• Use AWG 18-20 for motor and servo power lines</li>
              <li>• Twisted pair reduces interference in signal wires</li>
            </ul>
          </div>
        </div>
      )}

      {/* Table tab */}
      {activeTab === 'table' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by AWG or use case..."
                className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Min A:</span>
              <input
                type="number"
                value={filterCurrent}
                onChange={e => setFilterCurrent(e.target.value)}
                placeholder="0"
                className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-16 pr-4 py-3 text-sm text-white outline-none w-36"
              />
            </div>
          </div>

          {/* Quick guide */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Arduino signals', gauge: 'AWG 22-26', color: 'text-blue-400' },
              { label: 'Servo power', gauge: 'AWG 18-20', color: 'text-indigo-400' },
              { label: 'Motor control', gauge: 'AWG 14-18', color: 'text-yellow-400' },
              { label: 'Main power', gauge: 'AWG 10-14', color: 'text-red-400' },
            ].map(item => (
              <div key={item.label} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-3 text-center">
                <p className={`text-sm font-bold ${item.color}`}>{item.gauge}</p>
                <p className="text-slate-600 text-xs">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e1e2e] bg-[#13131f]">
                    <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">AWG</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">Diameter</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">Area</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">Max Current</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">Ω/m</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide hidden sm:table-cell">Common Use</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(wire => {
                    const currentColor = currentA > 0 ? getCurrentColor(currentA, wire.maxCurrentA) : 'text-white'
                    const isRecommended = bestGauge?.awg === wire.awg
                    return (
                      <tr
                        key={wire.awg}
                        className={`border-b border-[#1e1e2e] last:border-0 transition ${
                          isRecommended ? 'bg-green-950 bg-opacity-30' : 'hover:bg-[#13131f]'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isRecommended ? 'text-green-400' : 'text-indigo-400'}`}>
                              {wire.awg}
                            </span>
                            {isRecommended && (
                              <span className="text-xs bg-green-950 text-green-400 border border-green-800 px-1.5 py-0.5 rounded-full">✓ Best</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">{wire.diameterMm}mm</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{wire.areaMm2}mm²</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-sm ${currentColor}`}>{wire.maxCurrentA}A</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs font-mono">{wire.resistanceOhmPerM}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{wire.commonUse}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WireGauge