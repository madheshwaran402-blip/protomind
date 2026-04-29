import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

const CAPACITOR_TYPES = [
  {
    type: 'Ceramic',
    icon: '🟡',
    polarized: false,
    voltageRange: '6V - 100V',
    capacitanceRange: '1pF - 100µF',
    tempStability: 'Good (X5R/X7R) to Poor (Y5V)',
    esr: 'Very Low',
    frequency: 'High (RF to MHz)',
    commonUse: 'Decoupling, bypass, RF filtering',
    color: '#f59e0b',
    pros: ['Tiny SMD sizes', 'Non-polarized', 'Low ESR', 'High frequency'],
    cons: ['Capacitance varies with voltage', 'Can crack under stress'],
    tips: 'Use X7R or C0G for stable values. Place 100nF close to every IC VCC pin.',
  },
  {
    type: 'Electrolytic',
    icon: '🔵',
    polarized: true,
    voltageRange: '6V - 450V',
    capacitanceRange: '1µF - 100,000µF',
    tempStability: 'Poor',
    esr: 'Medium to High',
    frequency: 'Low (DC to kHz)',
    commonUse: 'Power supply filtering, audio coupling',
    color: '#3b82f6',
    pros: ['Very high capacitance', 'Low cost', 'Wide range'],
    cons: ['Polarized — must install correctly', 'High ESR', 'Limited lifespan', 'Leaks if overvolted'],
    tips: 'Always rate at 2x your working voltage. Check polarity before powering on.',
  },
  {
    type: 'Tantalum',
    icon: '🟠',
    polarized: true,
    voltageRange: '6V - 35V',
    capacitanceRange: '0.1µF - 2200µF',
    tempStability: 'Good',
    esr: 'Low',
    frequency: 'Medium (DC to 100kHz)',
    commonUse: 'Power supply decoupling, portable devices',
    color: '#f97316',
    pros: ['Stable capacitance', 'Low ESR', 'Long lifespan', 'Compact'],
    cons: ['Can fail catastrophically if reverse biased', 'Expensive', 'Low voltage limit'],
    tips: 'Never reverse bias tantalum caps. Rate voltage at 2x minimum. Use surge-protected types.',
  },
  {
    type: 'Film',
    icon: '🟢',
    polarized: false,
    voltageRange: '50V - 2000V',
    capacitanceRange: '1pF - 100µF',
    tempStability: 'Excellent',
    esr: 'Very Low',
    frequency: 'Medium to High',
    commonUse: 'Audio circuits, precision timing, motor runs',
    color: '#22c55e',
    pros: ['Very stable', 'Low loss', 'Self-healing', 'Non-polarized'],
    cons: ['Large physical size', 'More expensive', 'Not suitable for SMD'],
    tips: 'Ideal for audio crossovers and precision RC circuits where stability matters.',
  },
  {
    type: 'Supercapacitor',
    icon: '⚡',
    polarized: true,
    voltageRange: '2.7V - 5V',
    capacitanceRange: '0.1F - 3000F',
    tempStability: 'Fair',
    esr: 'Very Low',
    frequency: 'Very Low (DC)',
    commonUse: 'Energy storage, battery backup, flash memory backup',
    color: '#6366f1',
    pros: ['Enormous capacitance', 'Fast charge/discharge', 'Long cycle life'],
    cons: ['Very low voltage', 'Slow self-discharge', 'High internal resistance for high currents'],
    tips: 'Great for short-term battery backup. Use boost converter to step up voltage.',
  },
]

const E12_VALUES = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2]
const DECADES_PF = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000]

function formatCapacitance(pF) {
  if (pF >= 1000000) return (pF / 1000000).toFixed(2).replace(/\.00$/, '') + 'µF'
  if (pF >= 1000) return (pF / 1000).toFixed(2).replace(/\.00$/, '') + 'nF'
  return pF.toFixed(0) + 'pF'
}

function formatFrequency(hz) {
  if (hz >= 1000000) return (hz / 1000000).toFixed(2) + ' MHz'
  if (hz >= 1000) return (hz / 1000).toFixed(2) + ' kHz'
  return hz.toFixed(2) + ' Hz'
}

function CapacitorReference() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('types')
  const [selectedType, setSelectedType] = useState(null)
  const [rcR, setRcR] = useState('10000')
  const [rcC, setRcC] = useState('100')
  const [rcCUnit, setRcCUnit] = useState('nF')
  const [filterType, setFilterType] = useState('low')

  const unitMultipliers = { pF: 1e-12, nF: 1e-9, µF: 1e-6 }
  const R = parseFloat(rcR) || 0
  const C = (parseFloat(rcC) || 0) * (unitMultipliers[rcCUnit] || 1e-9)
  const fc = R > 0 && C > 0 ? 1 / (2 * Math.PI * R * C) : 0
  const tau = R * C

  function copyFreq() {
    navigator.clipboard.writeText(formatFrequency(fc))
    notify.success('Cutoff frequency copied!')
  }

  const E12_SERIES = DECADES_PF.flatMap(decade =>
    E12_VALUES.map(val => val * decade)
  ).filter(v => v <= 100000000)

  const TABS = [
    { id: 'types', label: '📦 Types' },
    { id: 'filter', label: '🔁 RC Filter' },
    { id: 'e12', label: '📋 E12 Values' },
    { id: 'tips', label: '💡 Tips' },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🔋 Capacitor Reference</h2>
          <p className="text-slate-400 text-sm">
            Capacitor types, values, and RC filter calculator
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
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 mb-6 max-w-lg">
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

      {/* Types tab */}
      {activeTab === 'types' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPACITOR_TYPES.map(cap => (
            <div
              key={cap.type}
              onClick={() => setSelectedType(selectedType?.type === cap.type ? null : cap)}
              className={`bg-[#0d0d1a] border rounded-2xl p-5 cursor-pointer transition ${
                selectedType?.type === cap.type ? 'border-indigo-600' : 'border-[#1e1e2e] hover:border-indigo-800'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{cap.icon}</span>
                <div>
                  <p className="text-white font-bold text-sm">{cap.type}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: cap.color + '20', color: cap.color }}
                  >
                    {cap.polarized ? '⚠️ Polarized' : '✓ Non-polarized'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-[#13131f] rounded-lg p-2">
                  <p className="text-slate-500 mb-0.5">Voltage</p>
                  <p className="text-white">{cap.voltageRange}</p>
                </div>
                <div className="bg-[#13131f] rounded-lg p-2">
                  <p className="text-slate-500 mb-0.5">Range</p>
                  <p className="text-white">{cap.capacitanceRange}</p>
                </div>
                <div className="bg-[#13131f] rounded-lg p-2">
                  <p className="text-slate-500 mb-0.5">ESR</p>
                  <p className="text-white">{cap.esr}</p>
                </div>
                <div className="bg-[#13131f] rounded-lg p-2">
                  <p className="text-slate-500 mb-0.5">Frequency</p>
                  <p className="text-white">{cap.frequency}</p>
                </div>
              </div>

              <p className="text-slate-500 text-xs mb-2">{cap.commonUse}</p>

              {selectedType?.type === cap.type && (
                <div className="mt-3 space-y-2 border-t border-[#2e2e4e] pt-3">
                  <div>
                    <p className="text-xs text-green-400 font-semibold mb-1">✓ Pros</p>
                    {cap.pros.map((p, i) => <p key={i} className="text-slate-300 text-xs">+ {p}</p>)}
                  </div>
                  <div>
                    <p className="text-xs text-red-400 font-semibold mb-1">✗ Cons</p>
                    {cap.cons.map((c, i) => <p key={i} className="text-slate-400 text-xs">- {c}</p>)}
                  </div>
                  <div className="bg-indigo-950 border border-indigo-900 rounded-lg p-3">
                    <p className="text-indigo-400 text-xs font-semibold mb-1">💡 Tip</p>
                    <p className="text-slate-300 text-xs">{cap.tips}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RC Filter tab */}
      {activeTab === 'filter' && (
        <div className="space-y-4">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">RC Filter Calculator</h3>

            <div className="flex gap-2 mb-4">
              {['low', 'high'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterType === type ? 'bg-indigo-600 text-white' : 'bg-[#13131f] text-slate-400 hover:text-white border border-[#2e2e4e]'
                  }`}
                >
                  {type === 'low' ? '⬇️ Low Pass' : '⬆️ High Pass'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Resistance (R)</p>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={rcR}
                    onChange={e => setRcR(e.target.value)}
                    className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                  />
                  <span className="text-slate-500 text-xs bg-[#1e1e2e] px-3 py-2.5 rounded-xl border border-[#2e2e4e]">Ω</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Capacitance (C)</p>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={rcC}
                    onChange={e => setRcC(e.target.value)}
                    className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                  />
                  <select
                    value={rcCUnit}
                    onChange={e => setRcCUnit(e.target.value)}
                    className="bg-[#1e1e2e] border border-[#2e2e4e] rounded-xl px-2 py-2.5 text-white text-xs outline-none"
                  >
                    <option value="pF">pF</option>
                    <option value="nF">nF</option>
                    <option value="µF">µF</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Filter Type</p>
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-slate-400 text-sm">
                  {filterType === 'low' ? 'Low Pass — attenuates high frequencies' : 'High Pass — attenuates low frequencies'}
                </div>
              </div>
            </div>

            {fc > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4 text-center">
                  <p className="text-slate-500 text-xs mb-1">Cutoff Frequency (fc)</p>
                  <p className="text-indigo-400 text-xl font-black">{formatFrequency(fc)}</p>
                  <button onClick={copyFreq} className="mt-1 text-xs text-slate-600 hover:text-slate-400">📋 copy</button>
                </div>
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
                  <p className="text-slate-500 text-xs mb-1">Time Constant (τ)</p>
                  <p className="text-white text-lg font-bold">
                    {tau < 0.001 ? (tau * 1000000).toFixed(2) + 'µs' : tau < 1 ? (tau * 1000).toFixed(2) + 'ms' : tau.toFixed(4) + 's'}
                  </p>
                </div>
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
                  <p className="text-slate-500 text-xs mb-1">Angular Freq (ω)</p>
                  <p className="text-white text-lg font-bold">{(2 * Math.PI * fc).toFixed(2)}</p>
                  <p className="text-slate-600 text-xs">rad/s</p>
                </div>
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
                  <p className="text-slate-500 text-xs mb-1">At 10×fc gain</p>
                  <p className="text-white text-lg font-bold">-20 dB</p>
                  <p className="text-slate-600 text-xs">-3dB at fc</p>
                </div>
              </div>
            )}

            <div className="mt-4 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Formula: fc = 1 / (2π × R × C)</p>
              <p className="text-xs text-slate-600">At cutoff frequency, output is -3dB (70.7%) of input. One decade above/below is -20dB (10%).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
              <h4 className="text-white font-semibold text-sm mb-3">Low Pass Filter</h4>
              <p className="text-slate-400 text-xs mb-2">Passes frequencies below fc, blocks above</p>
              <div className="bg-[#13131f] rounded-xl p-3 font-mono text-xs text-green-400">
                Vin ──[R]──┬── Vout<br/>
                {'          '}[C]<br/>
                {'          '}GND
              </div>
              <p className="text-slate-500 text-xs mt-2">Use: Removing high frequency noise from sensor signals</p>
            </div>
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
              <h4 className="text-white font-semibold text-sm mb-3">High Pass Filter</h4>
              <p className="text-slate-400 text-xs mb-2">Passes frequencies above fc, blocks below</p>
              <div className="bg-[#13131f] rounded-xl p-3 font-mono text-xs text-blue-400">
                Vin ──[C]──┬── Vout<br/>
                {'          '}[R]<br/>
                {'          '}GND
              </div>
              <p className="text-slate-500 text-xs mt-2">Use: Removing DC offset from AC signals</p>
            </div>
          </div>
        </div>
      )}

      {/* E12 Values tab */}
      {activeTab === 'e12' && (
        <div className="space-y-4">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-2">E12 Standard Capacitor Values</h3>
            <p className="text-slate-500 text-xs mb-4">Standard capacitor values available in most electronics stores</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {[
                { label: 'pF range', values: E12_VALUES.flatMap(v => [v, v * 10, v * 100]).map(v => v + 'pF') },
                { label: 'nF range', values: E12_VALUES.flatMap(v => [v, v * 10, v * 100]).map(v => v + 'nF') },
                { label: 'µF range', values: E12_VALUES.flatMap(v => [v, v * 10]).filter(v => v <= 100).map(v => v + 'µF') },
              ].flatMap(group => group.values).slice(0, 48).map((val, i) => (
                <div
                  key={i}
                  className="bg-[#13131f] border border-[#2e2e4e] rounded-lg p-2 text-center cursor-pointer hover:border-indigo-600 transition"
                  onClick={() => { navigator.clipboard.writeText(val); notify.success(val + ' copied!') }}
                  title="Click to copy"
                >
                  <p className="text-indigo-400 text-xs font-mono font-bold">{val}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-600 text-xs mt-3 text-center">Click any value to copy it</p>
          </div>
        </div>
      )}

      {/* Tips tab */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          {[
            {
              title: '🔌 Decoupling Capacitors',
              color: 'border-indigo-900 bg-indigo-950',
              titleColor: 'text-indigo-400',
              tips: [
                'Place 100nF ceramic cap as close as possible to every IC VCC pin',
                'Add a 10µF electrolytic cap nearby for bulk storage',
                'Use shortest possible traces from cap to VCC and GND pins',
                'Multiple small caps in parallel beat one large cap for decoupling',
              ],
            },
            {
              title: '⚠️ Electrolytic Safety',
              color: 'border-red-900 bg-red-950',
              titleColor: 'text-red-400',
              tips: [
                'Always check polarity — the longer leg is positive (+)',
                'Rate voltage at minimum 2x your circuit voltage',
                'Never reverse bias an electrolytic cap — it will fail explosively',
                'Replace electrolytics in old equipment — they dry out over time',
              ],
            },
            {
              title: '📐 Choosing the Right Cap',
              color: 'border-green-900 bg-green-950',
              titleColor: 'text-green-400',
              tips: [
                'For decoupling: 100nF X7R ceramic',
                'For bulk power storage: 100µF electrolytic',
                'For timing precision: Film or C0G ceramic',
                'For audio coupling: Film capacitor',
                'For battery backup: Supercapacitor',
              ],
            },
          ].map(section => (
            <div key={section.title} className={`border rounded-2xl p-5 ${section.color}`}>
              <h4 className={`font-semibold text-sm mb-3 ${section.titleColor}`}>{section.title}</h4>
              <ul className="space-y-2">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`shrink-0 ${section.titleColor}`}>{i + 1}.</span>
                    <p className="text-slate-300">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CapacitorReference