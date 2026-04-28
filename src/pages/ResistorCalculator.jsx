import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

const COLORS = [
  { name: 'Black', hex: '#1a1a1a', digit: 0, multiplier: 1, tolerance: null },
  { name: 'Brown', hex: '#8B4513', digit: 1, multiplier: 10, tolerance: 1 },
  { name: 'Red', hex: '#ef4444', digit: 2, multiplier: 100, tolerance: 2 },
  { name: 'Orange', hex: '#f97316', digit: 3, multiplier: 1000, tolerance: null },
  { name: 'Yellow', hex: '#eab308', digit: 4, multiplier: 10000, tolerance: null },
  { name: 'Green', hex: '#22c55e', digit: 5, multiplier: 100000, tolerance: 0.5 },
  { name: 'Blue', hex: '#3b82f6', digit: 6, multiplier: 1000000, tolerance: 0.25 },
  { name: 'Violet', hex: '#a855f7', digit: 7, multiplier: 10000000, tolerance: 0.1 },
  { name: 'Gray', hex: '#6b7280', digit: 8, multiplier: 100000000, tolerance: 0.05 },
  { name: 'White', hex: '#f8fafc', digit: 9, multiplier: 1000000000, tolerance: null },
  { name: 'Gold', hex: '#d97706', digit: null, multiplier: 0.1, tolerance: 5 },
  { name: 'Silver', hex: '#94a3b8', digit: null, multiplier: 0.01, tolerance: 10 },
]

function formatResistance(ohms) {
  if (ohms >= 1000000) return (ohms / 1000000).toFixed(2).replace(/\.00$/, '') + ' MΩ'
  if (ohms >= 1000) return (ohms / 1000).toFixed(2).replace(/\.00$/, '') + ' kΩ'
  return ohms.toFixed(2).replace(/\.00$/, '') + ' Ω'
}

function ColorPicker({ label, selected, onChange, excludeDigitless }) {
  const available = excludeDigitless ? COLORS.filter(c => c.digit !== null) : COLORS
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {available.map(color => (
          <button
            key={color.name}
            onClick={() => onChange(color)}
            title={color.name}
            className={`w-8 h-8 rounded-lg border-2 transition ${
              selected?.name === color.name
                ? 'border-white scale-110 shadow-lg'
                : 'border-transparent hover:border-slate-400'
            }`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
      {selected && (
        <p className="text-xs mt-1" style={{ color: selected.hex === '#f8fafc' ? '#94a3b8' : selected.hex }}>
          {selected.name} {selected.digit !== null ? '(' + selected.digit + ')' : ''}
        </p>
      )}
    </div>
  )
}

function ResistorCalculator() {
  const navigate = useNavigate()
  const [bands, setBands] = useState(4)
  const [band1, setBand1] = useState(COLORS[1]) // Brown
  const [band2, setBand2] = useState(COLORS[0]) // Black
  const [band3, setBand3] = useState(COLORS[0]) // Black (5-band digit)
  const [multiplier, setMultiplier] = useState(COLORS[2]) // Red
  const [tolerance, setTolerance] = useState(COLORS[10]) // Gold

  const digit1 = band1?.digit ?? 0
  const digit2 = band2?.digit ?? 0
  const digit3 = band3?.digit ?? 0

  const baseValue = bands === 4
    ? digit1 * 10 + digit2
    : digit1 * 100 + digit2 * 10 + digit3

  const resistance = baseValue * (multiplier?.multiplier ?? 1)
  const tol = tolerance?.tolerance ?? 5
  const minR = resistance * (1 - tol / 100)
  const maxR = resistance * (1 + tol / 100)

  function handleCopy() {
    const text = formatResistance(resistance) + ' ±' + tol + '%'
    navigator.clipboard.writeText(text)
    notify.success('Value copied: ' + text)
  }

  const E24_SERIES = [
    1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
    3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
  ]

  function getNearestE24(value) {
    const decades = [1, 10, 100, 1000, 10000, 100000, 1000000]
    let nearest = value
    let minDiff = Infinity
    for (const decade of decades) {
      for (const base of E24_SERIES) {
        const candidate = base * decade
        const diff = Math.abs(candidate - value)
        if (diff < minDiff) {
          minDiff = diff
          nearest = candidate
        }
      }
    }
    return nearest
  }

  const nearestE24 = getNearestE24(resistance)

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🎨 Resistor Color Code</h2>
          <p className="text-slate-400 text-sm">
            Select band colors to calculate resistance value
          </p>
        </div>
        <button
          onClick={() => navigate('/calculator')}
          className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
        >
          🧮 Calculator →
        </button>
      </div>

      {/* Band count selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setBands(4)}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${bands === 4 ? 'bg-indigo-600 text-white' : 'bg-[#0d0d1a] border border-[#1e1e2e] text-slate-400'}`}
        >
          4-Band Resistor
        </button>
        <button
          onClick={() => setBands(5)}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${bands === 5 ? 'bg-indigo-600 text-white' : 'bg-[#0d0d1a] border border-[#1e1e2e] text-slate-400'}`}
        >
          5-Band Resistor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Resistor visual */}
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4">Resistor Preview</h3>

          {/* Visual resistor */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              {/* Left lead */}
              <div className="w-8 h-0.5 bg-slate-400" />
              {/* Body */}
              <div className="relative flex items-center rounded-full h-10 px-3" style={{ backgroundColor: '#d4a86a', minWidth: '160px' }}>
                {/* Bands */}
                <div className="absolute inset-0 flex items-center px-3 gap-2 rounded-full overflow-hidden">
                  <div className="absolute left-4 w-4 h-full rounded" style={{ backgroundColor: band1?.hex }} />
                  <div className="absolute left-10 w-4 h-full rounded" style={{ backgroundColor: band2?.hex }} />
                  {bands === 5 && <div className="absolute left-16 w-4 h-full rounded" style={{ backgroundColor: band3?.hex }} />}
                  <div className={`absolute ${bands === 5 ? 'left-22' : 'left-16'} w-4 h-full rounded`} style={{ backgroundColor: multiplier?.hex, left: bands === 5 ? '88px' : '64px' }} />
                  <div className="absolute right-4 w-4 h-full rounded" style={{ backgroundColor: tolerance?.hex }} />
                </div>
              </div>
              {/* Right lead */}
              <div className="w-8 h-0.5 bg-slate-400" />
            </div>
          </div>

          {/* Result */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5 text-center mb-4">
            <p className="text-slate-500 text-xs mb-1">Resistance Value</p>
            <p className="text-4xl font-black text-indigo-400 mb-1">{formatResistance(resistance)}</p>
            <p className="text-slate-400 text-sm">±{tol}% tolerance</p>
            <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
              <span>Min: {formatResistance(minR)}</span>
              <span>Max: {formatResistance(maxR)}</span>
            </div>
            <button onClick={handleCopy} className="mt-3 px-4 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition">
              📋 Copy Value
            </button>
          </div>

          {/* E24 nearest */}
          {nearestE24 !== resistance && (
            <div className="bg-yellow-950 border border-yellow-900 rounded-xl p-3 text-center">
              <p className="text-yellow-400 text-xs font-semibold mb-0.5">Nearest E24 Standard Value</p>
              <p className="text-white text-sm font-bold">{formatResistance(nearestE24)}</p>
            </div>
          )}
        </div>

        {/* Color pickers */}
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold text-sm mb-2">Select Band Colors</h3>

          <ColorPicker
            label={'Band 1 — 1st Digit'}
            selected={band1}
            onChange={setBand1}
            excludeDigitless={true}
          />
          <ColorPicker
            label={'Band 2 — 2nd Digit'}
            selected={band2}
            onChange={setBand2}
            excludeDigitless={true}
          />
          {bands === 5 && (
            <ColorPicker
              label={'Band 3 — 3rd Digit'}
              selected={band3}
              onChange={setBand3}
              excludeDigitless={true}
            />
          )}
          <ColorPicker
            label={bands === 5 ? 'Band 4 — Multiplier' : 'Band 3 — Multiplier'}
            selected={multiplier}
            onChange={setMultiplier}
            excludeDigitless={false}
          />
          <ColorPicker
            label={bands === 5 ? 'Band 5 — Tolerance' : 'Band 4 — Tolerance'}
            selected={tolerance}
            onChange={setTolerance}
            excludeDigitless={false}
          />
        </div>
      </div>

      {/* Color code reference table */}
      <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e1e2e]">
          <h3 className="text-white font-semibold text-sm">Color Code Reference Chart</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e1e2e] bg-[#13131f]">
                <th className="text-left px-4 py-2 text-slate-500">Color</th>
                <th className="text-left px-4 py-2 text-slate-500">Digit</th>
                <th className="text-left px-4 py-2 text-slate-500">Multiplier</th>
                <th className="text-left px-4 py-2 text-slate-500">Tolerance</th>
              </tr>
            </thead>
            <tbody>
              {COLORS.map(color => (
                <tr key={color.name} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#13131f] transition">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-slate-700" style={{ backgroundColor: color.hex }} />
                      <span style={{ color: color.hex === '#f8fafc' ? '#94a3b8' : color.hex }}>{color.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-400">{color.digit !== null ? color.digit : '—'}</td>
                  <td className="px-4 py-2 text-slate-400">
                    {color.multiplier >= 1000000 ? '×' + (color.multiplier / 1000000) + 'M' :
                     color.multiplier >= 1000 ? '×' + (color.multiplier / 1000) + 'k' :
                     '×' + color.multiplier}
                  </td>
                  <td className="px-4 py-2 text-slate-400">{color.tolerance !== null ? '±' + color.tolerance + '%' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ResistorCalculator