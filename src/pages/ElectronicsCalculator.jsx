import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

function InputField({ label, value, onChange, unit, placeholder }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '0'}
          className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 transition"
        />
        {unit && (
          <span className="text-slate-500 text-xs bg-[#1e1e2e] px-3 py-2.5 rounded-xl border border-[#2e2e4e] shrink-0">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

function ResultBox({ label, value, unit, color = 'text-indigo-400' }) {
  function handleCopy() {
    navigator.clipboard.writeText(String(value) + ' ' + unit)
    notify.success('Result copied!')
  }

  return (
    <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl p-4 text-center">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-black ${color} mb-0.5`}>{value}</p>
      <p className="text-slate-600 text-xs">{unit}</p>
      <button onClick={handleCopy} className="mt-2 text-xs text-slate-600 hover:text-slate-400 transition">📋 copy</button>
    </div>
  )
}

function OhmsLaw() {
  const [voltage, setVoltage] = useState('')
  const [current, setCurrent] = useState('')
  const [resistance, setResistance] = useState('')

  function calculate(solve) {
    const V = parseFloat(voltage)
    const I = parseFloat(current)
    const R = parseFloat(resistance)

    if (solve === 'voltage' && !isNaN(I) && !isNaN(R)) {
      setVoltage((I * R).toFixed(3))
    } else if (solve === 'current' && !isNaN(V) && !isNaN(R) && R !== 0) {
      setCurrent((V / R).toFixed(6))
    } else if (solve === 'resistance' && !isNaN(V) && !isNaN(I) && I !== 0) {
      setResistance((V / I).toFixed(2))
    } else {
      notify.warning('Please fill in the other two values first')
    }
  }

  const V = parseFloat(voltage) || 0
  const I = parseFloat(current) || 0
  const R = parseFloat(resistance) || 0
  const power = V * I

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <InputField label="Voltage (V)" value={voltage} onChange={setVoltage} unit="V" />
        <InputField label="Current (I)" value={current} onChange={setCurrent} unit="A" />
        <InputField label="Resistance (R)" value={resistance} onChange={setResistance} unit="Ω" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => calculate('voltage')} className="py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition">
          Solve V
        </button>
        <button onClick={() => calculate('current')} className="py-2 bg-sky-600 hover:bg-sky-500 rounded-xl text-xs font-semibold transition">
          Solve I
        </button>
        <button onClick={() => calculate('resistance')} className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold transition">
          Solve R
        </button>
      </div>

      {power > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <ResultBox label="Power (P = V×I)" value={power.toFixed(4)} unit="Watts" color="text-yellow-400" />
          <ResultBox label="Power (P = I²R)" value={(I * I * R).toFixed(4)} unit="Watts" color="text-orange-400" />
        </div>
      )}

      <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
        <p className="text-indigo-400 text-xs font-semibold mb-2">Ohm's Law Formulas</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
          {[
            { formula: 'V = I × R', label: 'Voltage' },
            { formula: 'I = V / R', label: 'Current' },
            { formula: 'R = V / I', label: 'Resistance' },
            { formula: 'P = V × I', label: 'Power' },
          ].map(f => (
            <div key={f.formula} className="bg-indigo-900 rounded-lg p-2">
              <p className="text-white font-mono font-bold">{f.formula}</p>
              <p className="text-indigo-400 text-xs">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LEDResistorCalc() {
  const [supplyVoltage, setSupplyVoltage] = useState('5')
  const [forwardVoltage, setForwardVoltage] = useState('2')
  const [current, setCurrent] = useState('20')

  const Vs = parseFloat(supplyVoltage) || 0
  const Vf = parseFloat(forwardVoltage) || 0
  const I = (parseFloat(current) || 20) / 1000

  const R = I > 0 ? (Vs - Vf) / I : 0
  const power = I * I * R

  const standardValues = [100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820, 1000, 1200, 1500, 1800, 2200]
  const nearestStandard = standardValues.reduce((prev, curr) =>
    Math.abs(curr - R) < Math.abs(prev - R) ? curr : prev, standardValues[0]
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <InputField label="Supply Voltage" value={supplyVoltage} onChange={setSupplyVoltage} unit="V" />
        <InputField label="LED Forward Voltage" value={forwardVoltage} onChange={setForwardVoltage} unit="V" />
        <InputField label="LED Current" value={current} onChange={setCurrent} unit="mA" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultBox label="Required R" value={R.toFixed(1)} unit="Ω" />
        <ResultBox label="Nearest Standard" value={nearestStandard} unit="Ω" color="text-green-400" />
        <ResultBox label="Power Dissipated" value={(power * 1000).toFixed(2)} unit="mW" color="text-yellow-400" />
        <ResultBox label="Actual Current" value={nearestStandard > 0 ? ((Vs - Vf) / nearestStandard * 1000).toFixed(1) : '0'} unit="mA" color="text-sky-400" />
      </div>

      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-2">Formula: R = (Vs - Vf) / I</p>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span>Vs = Supply voltage</span>
          <span>·</span>
          <span>Vf = LED forward voltage (red~2V, blue~3.2V)</span>
          <span>·</span>
          <span>I = Desired current (10-20mA typical)</span>
        </div>
      </div>

      {power > 0.125 && (
        <div className="bg-red-950 border border-red-900 rounded-xl p-3">
          <p className="text-red-400 text-xs">⚠️ Power {(power * 1000).toFixed(0)}mW exceeds standard 1/8W resistor rating. Use 1/4W or higher.</p>
        </div>
      )}
    </div>
  )
}

function VoltageDivider() {
  const [inputVoltage, setInputVoltage] = useState('5')
  const [r1, setR1] = useState('10000')
  const [r2, setR2] = useState('10000')

  const Vin = parseFloat(inputVoltage) || 0
  const R1 = parseFloat(r1) || 1
  const R2 = parseFloat(r2) || 1

  const Vout = Vin * R2 / (R1 + R2)
  const ratio = R2 / (R1 + R2)
  const current = Vin / (R1 + R2)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <InputField label="Input Voltage (Vin)" value={inputVoltage} onChange={setInputVoltage} unit="V" />
        <InputField label="R1 (top)" value={r1} onChange={setR1} unit="Ω" />
        <InputField label="R2 (bottom)" value={r2} onChange={setR2} unit="Ω" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ResultBox label="Output Voltage" value={Vout.toFixed(4)} unit="V" />
        <ResultBox label="Division Ratio" value={(ratio * 100).toFixed(1)} unit="%" color="text-sky-400" />
        <ResultBox label="Current Draw" value={(current * 1000).toFixed(3)} unit="mA" color="text-yellow-400" />
      </div>

      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-1">Formula: Vout = Vin × R2 / (R1 + R2)</p>
        <p className="text-xs text-slate-600">Use high resistance values (10kΩ+) to minimise quiescent current drain.</p>
      </div>
    </div>
  )
}

function CapacitorCalc() {
  const [capacitance, setCapacitance] = useState('1000')
  const [resistance, setResistance] = useState('10000')
  const [supplyV, setSupplyV] = useState('5')
  const [targetV, setTargetV] = useState('3.16')

  const C = (parseFloat(capacitance) || 0) / 1000000
  const R = parseFloat(resistance) || 1
  const Vs = parseFloat(supplyV) || 5
  const Vt = parseFloat(targetV) || 3.16

  const tau = R * C
  const chargeTime = -R * C * Math.log(1 - Vt / Vs)
  const timeToPercent = (pct) => -tau * Math.log(1 - pct / 100)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InputField label="Capacitance" value={capacitance} onChange={setCapacitance} unit="µF" />
        <InputField label="Resistance" value={resistance} onChange={setResistance} unit="Ω" />
        <InputField label="Supply Voltage" value={supplyV} onChange={setSupplyV} unit="V" />
        <InputField label="Target Voltage" value={targetV} onChange={setTargetV} unit="V" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultBox label="Time Constant τ" value={tau < 1 ? (tau * 1000).toFixed(2) : tau.toFixed(3)} unit={tau < 1 ? 'ms' : 's'} />
        <ResultBox label="Charge to Target" value={isNaN(chargeTime) ? 'N/A' : chargeTime < 1 ? (chargeTime * 1000).toFixed(2) : chargeTime.toFixed(3)} unit={chargeTime < 1 ? 'ms' : 's'} color="text-green-400" />
        <ResultBox label="63% charge (1τ)" value={tau < 1 ? (tau * 1000).toFixed(2) : tau.toFixed(3)} unit={tau < 1 ? 'ms' : 's'} color="text-yellow-400" />
        <ResultBox label="99% charge (5τ)" value={(5 * tau) < 1 ? (5 * tau * 1000).toFixed(2) : (5 * tau).toFixed(3)} unit={(5 * tau) < 1 ? 'ms' : 's'} color="text-sky-400" />
      </div>

      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-1">RC Time Constant: τ = R × C</p>
        <p className="text-xs text-slate-500">Charge time to voltage V: t = -RC × ln(1 - V/Vs)</p>
      </div>
    </div>
  )
}

function PowerCalc() {
  const [voltage, setVoltage] = useState('')
  const [current, setCurrent] = useState('')
  const [resistance, setResistance] = useState('')
  const [hours, setHours] = useState('1')

  const V = parseFloat(voltage) || 0
  const I = parseFloat(current) || 0
  const R = parseFloat(resistance) || 0
  const H = parseFloat(hours) || 1

  const powerVI = V > 0 && I > 0 ? V * I : 0
  const powerI2R = I > 0 && R > 0 ? I * I * R : 0
  const powerV2R = V > 0 && R > 0 ? V * V / R : 0

  const mainPower = powerVI || powerI2R || powerV2R
  const energyWh = mainPower * H

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InputField label="Voltage (V)" value={voltage} onChange={setVoltage} unit="V" />
        <InputField label="Current (I)" value={current} onChange={setCurrent} unit="A" />
        <InputField label="Resistance (R)" value={resistance} onChange={setResistance} unit="Ω" />
        <InputField label="Time" value={hours} onChange={setHours} unit="hrs" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {powerVI > 0 && <ResultBox label="P = V×I" value={powerVI.toFixed(4)} unit="W" />}
        {powerI2R > 0 && <ResultBox label="P = I²×R" value={powerI2R.toFixed(4)} unit="W" color="text-sky-400" />}
        {powerV2R > 0 && <ResultBox label="P = V²/R" value={powerV2R.toFixed(4)} unit="W" color="text-green-400" />}
      </div>

      {energyWh > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <ResultBox label="Energy Used" value={energyWh.toFixed(4)} unit="Wh" color="text-yellow-400" />
          <ResultBox label="Energy Used" value={(energyWh * 3600).toFixed(2)} unit="Joules" color="text-orange-400" />
        </div>
      )}
    </div>
  )
}

function ElectronicsCalculator() {
  const navigate = useNavigate()
  const [activeCalc, setActiveCalc] = useState('ohms')

  const CALCULATORS = [
    { id: 'ohms', label: "⚡ Ohm's Law", desc: 'V, I, R, P' },
    { id: 'led', label: '💡 LED Resistor', desc: 'Series resistor' },
    { id: 'divider', label: '🔌 Voltage Divider', desc: 'R1 & R2' },
    { id: 'capacitor', label: '🔋 Capacitor', desc: 'RC time constant' },
    { id: 'power', label: '⚡ Power', desc: 'P, Energy' },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🧮 Electronics Calculator</h2>
          <p className="text-slate-400 text-sm">
            Essential calculators for electronics — Ohm's Law, LED resistors, voltage dividers and more
          </p>
        </div>
        <button
          onClick={() => navigate('/symbols')}
          className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
        >
          ⚡ Circuit Symbols →
        </button>
      </div>

      {/* Calculator selector */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CALCULATORS.map(calc => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeCalc === calc.id
                ? 'bg-indigo-600 text-white'
                : 'bg-[#0d0d1a] border border-[#1e1e2e] text-slate-400 hover:border-indigo-800'
            }`}
          >
            <span>{calc.label}</span>
            <span className="text-xs opacity-60 ml-1 hidden sm:inline">· {calc.desc}</span>
          </button>
        ))}
      </div>

      {/* Calculator content */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 sm:p-6">
        <h3 className="text-white font-bold text-base mb-4">
          {CALCULATORS.find(c => c.id === activeCalc)?.label}
        </h3>

        {activeCalc === 'ohms' && <OhmsLaw />}
        {activeCalc === 'led' && <LEDResistorCalc />}
        {activeCalc === 'divider' && <VoltageDivider />}
        {activeCalc === 'capacitor' && <CapacitorCalc />}
        {activeCalc === 'power' && <PowerCalc />}
      </div>

      {/* Quick reference */}
      <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">📋 Quick Formula Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { formula: 'V = I·R', label: "Ohm's Law" },
            { formula: 'P = V·I', label: 'Power' },
            { formula: 'R = (Vs-Vf)/I', label: 'LED R' },
            { formula: 'Vout = Vin·R2/(R1+R2)', label: 'Divider' },
            { formula: 'τ = R·C', label: 'RC Time' },
            { formula: 'f = 1/(2πRC)', label: 'RC Filter' },
          ].map(item => (
            <div key={item.formula} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
              <p className="text-indigo-400 text-xs font-mono font-bold mb-1">{item.formula}</p>
              <p className="text-slate-600 text-xs">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ElectronicsCalculator