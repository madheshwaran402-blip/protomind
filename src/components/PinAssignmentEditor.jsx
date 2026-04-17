import { useState, useEffect } from 'react'
import {
  ARDUINO_NANO_PINS,
  ESP32_PINS,
  savePinAssignments,
  getPinAssignments,
  validatePinAssignments,
  exportPinTable,
} from '../services/pinAssignment'
import { notify } from '../services/toast'

const MCU_OPTIONS = {
  'Arduino Nano': ARDUINO_NANO_PINS,
  'Arduino Uno': ARDUINO_NANO_PINS,
  'ESP32': ESP32_PINS,
  'ESP32 DevKit': ESP32_PINS,
}

const MODE_COLORS = {
  INPUT: 'text-blue-400',
  OUTPUT: 'text-green-400',
  PWM: 'text-yellow-400',
  ANALOG_INPUT: 'text-orange-400',
  I2C_SDA: 'text-purple-400',
  I2C_SCL: 'text-purple-400',
  SPI_MOSI: 'text-red-400',
  SPI_MISO: 'text-red-400',
  SPI_SCK: 'text-red-400',
  POWER: 'text-pink-400',
  GND: 'text-slate-400',
}

function PinAssignmentEditor({ idea, components }) {
  const microcontroller = components.find(c => c.category === 'Microcontroller')
  const otherComponents = components.filter(c => c.category !== 'Microcontroller')

  const mcuName = microcontroller?.name || 'Arduino Nano'
  const mcuPins = MCU_OPTIONS[mcuName] || ARDUINO_NANO_PINS

  const [assignments, setAssignments] = useState(() => getPinAssignments(idea))
  const [validation, setValidation] = useState(null)
  const [selectedMCU, setSelectedMCU] = useState(mcuName)
  const [showPinRef, setShowPinRef] = useState(false)

  const availablePins = MCU_OPTIONS[selectedMCU] || ARDUINO_NANO_PINS

  function addAssignment() {
    const newAssignment = {
      id: Date.now().toString(),
      componentName: otherComponents[0]?.name || '',
      componentPin: '',
      mcuPin: '',
      mode: 'INPUT',
      notes: '',
    }
    setAssignments(prev => [...prev, newAssignment])
  }

  function updateAssignment(id, field, value) {
    setAssignments(prev =>
      prev.map(a => a.id === id ? { ...a, [field]: value } : a)
    )
  }

  function removeAssignment(id) {
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  function handleSave() {
    savePinAssignments(idea, assignments)
    const result = validatePinAssignments(assignments)
    setValidation(result)
    if (result.isValid) {
      notify.success('Pin assignments saved! No conflicts found.')
    } else {
      notify.warning(result.errors.length + ' conflicts found — check the validation panel')
    }
  }

  function handleExport() {
    exportPinTable(assignments, idea)
    notify.success('Pin table exported as CSV!')
  }

  const usedMcuPins = assignments.map(a => a.mcuPin).filter(Boolean)

  return (
    <div className="space-y-4">

      {/* MCU selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <p className="text-xs text-slate-500 mb-1">Microcontroller</p>
          <select
            value={selectedMCU}
            onChange={e => setSelectedMCU(e.target.value)}
            className="bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-lg px-3 py-2 outline-none"
          >
            {Object.keys(MCU_OPTIONS).map(mcu => (
              <option key={mcu} value={mcu}>{mcu}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500 mt-4">
          {availablePins.length} pins available · {usedMcuPins.length} assigned
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowPinRef(!showPinRef)}
            className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            {showPinRef ? '↑ Hide' : '📋 Pin Reference'}
          </button>
          <button
            onClick={handleExport}
            disabled={assignments.length === 0}
            className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-300 rounded-xl text-xs transition disabled:opacity-50"
          >
            ⬇️ Export CSV
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            💾 Save & Validate
          </button>
        </div>
      </div>

      {/* Pin reference */}
      {showPinRef && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 max-h-48 overflow-y-auto">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{selectedMCU} Pin Reference</h4>
          <div className="grid grid-cols-2 gap-1">
            {availablePins.map(pin => (
              <div key={pin.pin} className="flex items-center gap-2 text-xs py-1 border-b border-[#2e2e4e]">
                <span className={`font-mono font-bold w-12 shrink-0 ${usedMcuPins.includes(pin.pin) ? 'text-orange-400' : 'text-indigo-400'}`}>
                  {pin.pin}
                </span>
                <span className="text-slate-500 truncate">{pin.note}</span>
                {usedMcuPins.includes(pin.pin) && (
                  <span className="text-orange-400 shrink-0 text-xs">●</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation result */}
      {validation && (
        <div className={`rounded-xl border p-4 ${
          validation.isValid
            ? 'bg-green-950 border-green-900'
            : 'bg-red-950 border-red-900'
        }`}>
          <p className={`font-semibold text-sm mb-2 ${validation.isValid ? 'text-green-400' : 'text-red-400'}`}>
            {validation.isValid ? '✅ No pin conflicts found!' : '❌ ' + validation.errors.length + ' conflict(s) found'}
          </p>
          {validation.errors.map((err, i) => (
            <p key={i} className="text-red-300 text-xs mb-1">• {err}</p>
          ))}
          {validation.warnings.map((warn, i) => (
            <p key={i} className="text-yellow-300 text-xs mb-1">⚠️ {warn}</p>
          ))}
        </div>
      )}

      {/* Assignment rows */}
      <div className="space-y-2">
        {assignments.length === 0 && (
          <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl text-slate-500 text-sm">
            No pin assignments yet. Click + Add Assignment to start.
          </div>
        )}

        {assignments.map(assignment => (
          <div key={assignment.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
            <div className="grid grid-cols-5 gap-2 items-center">

              {/* Component */}
              <select
                value={assignment.componentName}
                onChange={e => updateAssignment(assignment.id, 'componentName', e.target.value)}
                className="bg-[#0d0d1a] border border-[#2e2e4e] text-white text-xs rounded-lg px-2 py-2 outline-none"
              >
                <option value="">Component...</option>
                {components.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Component pin */}
              <input
                value={assignment.componentPin}
                onChange={e => updateAssignment(assignment.id, 'componentPin', e.target.value)}
                placeholder="Pin name (e.g. DATA)"
                className="bg-[#0d0d1a] border border-[#2e2e4e] text-white text-xs rounded-lg px-2 py-2 outline-none placeholder-slate-600"
              />

              {/* MCU pin */}
              <select
                value={assignment.mcuPin}
                onChange={e => updateAssignment(assignment.id, 'mcuPin', e.target.value)}
                className={`bg-[#0d0d1a] border text-xs rounded-lg px-2 py-2 outline-none ${
                  usedMcuPins.filter(p => p === assignment.mcuPin).length > 1
                    ? 'border-red-600 text-red-400'
                    : 'border-[#2e2e4e] text-white'
                }`}
              >
                <option value="">MCU Pin...</option>
                {availablePins.map(pin => (
                  <option
                    key={pin.pin}
                    value={pin.pin}
                    disabled={usedMcuPins.includes(pin.pin) && pin.pin !== assignment.mcuPin}
                  >
                    {pin.pin} — {pin.type}
                    {usedMcuPins.includes(pin.pin) && pin.pin !== assignment.mcuPin ? ' (used)' : ''}
                  </option>
                ))}
              </select>

              {/* Mode */}
              <select
                value={assignment.mode}
                onChange={e => updateAssignment(assignment.id, 'mode', e.target.value)}
                className={`bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-2 py-2 outline-none text-xs ${
                  MODE_COLORS[assignment.mode] || 'text-white'
                }`}
              >
                {['INPUT', 'OUTPUT', 'PWM', 'ANALOG_INPUT', 'I2C_SDA', 'I2C_SCL', 'SPI_MOSI', 'SPI_MISO', 'SPI_SCK', 'POWER', 'GND'].map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>

              {/* Delete */}
              <button
                onClick={() => removeAssignment(assignment.id)}
                className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg text-xs transition text-center"
              >
                🗑
              </button>
            </div>

            {/* Notes */}
            <input
              value={assignment.notes}
              onChange={e => updateAssignment(assignment.id, 'notes', e.target.value)}
              placeholder="Optional notes about this connection..."
              className="mt-2 w-full bg-[#0d0d1a] border border-[#1e1e2e] text-white text-xs rounded-lg px-2 py-1.5 outline-none placeholder-slate-700"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addAssignment}
        className="w-full py-2.5 border-2 border-dashed border-[#2e2e4e] hover:border-indigo-700 text-slate-500 hover:text-indigo-400 rounded-xl text-sm transition"
      >
        + Add Pin Assignment
      </button>

      {/* Summary table */}
      {assignments.length > 0 && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-[#2e2e4e]">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignment Summary</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2e2e4e]">
                <th className="text-left px-4 py-2 text-slate-600">Component</th>
                <th className="text-left px-4 py-2 text-slate-600">Comp Pin</th>
                <th className="text-left px-4 py-2 text-slate-600">MCU Pin</th>
                <th className="text-left px-4 py-2 text-slate-600">Mode</th>
              </tr>
            </thead>
            <tbody>
              {assignments.filter(a => a.mcuPin && a.componentPin).map(a => (
                <tr key={a.id} className="border-b border-[#1e1e2e]">
                  <td className="px-4 py-2 text-slate-300">{a.componentName}</td>
                  <td className="px-4 py-2 text-slate-400 font-mono">{a.componentPin}</td>
                  <td className="px-4 py-2 text-indigo-400 font-mono font-bold">{a.mcuPin}</td>
                  <td className={`px-4 py-2 font-mono ${MODE_COLORS[a.mode] || 'text-slate-400'}`}>{a.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PinAssignmentEditor