import { useState, useEffect } from 'react'
import { generateCalibrationGuide, saveCalibrationGuide, getCalibrationGuide } from '../services/calibrationService'
import { notify } from '../services/toast'

const STATUS_STYLES = {
  Good: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅' },
  'Needs Calibration': { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚠️' },
  Faulty: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '❌' },
  Drifting: { color: 'text-orange-400', bg: 'bg-orange-950', border: 'border-orange-800', icon: '📉' },
}

const COMMON_SENSORS = [
  { name: 'DHT22', unit: '°C', range: '−40 to 80', example: '22.5' },
  { name: 'DHT11', unit: '°C', range: '0 to 50', example: '23' },
  { name: 'HC-SR04', unit: 'cm', range: '2 to 400', example: '15.3' },
  { name: 'MQ-135', unit: 'ppm', range: '10 to 300', example: '45' },
  { name: 'Soil Moisture', unit: '%', range: '0 to 100', example: '65' },
  { name: 'MPU-6050', unit: 'g', range: '−2 to 2', example: '0.02' },
  { name: 'BMP280', unit: 'hPa', range: '300 to 1100', example: '1013' },
  { name: 'LDR Light', unit: 'lux', range: '0 to 1000', example: '350' },
]

function AccuracyGauge({ accuracy }) {
  const color = accuracy >= 90 ? '#22c55e' : accuracy >= 70 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 35
  const offset = circumference - (accuracy / 100) * circumference

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="35" fill="none" stroke="#1e1e2e" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="35"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-xl font-black" style={{ color }}>{accuracy}%</p>
        <p className="text-slate-600 text-xs">accuracy</p>
      </div>
    </div>
  )
}

function ReadingInput({ index, reading, onChange, onRemove, unit }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500 text-xs w-16 shrink-0">Reading {index + 1}</span>
      <input
        type="number"
        value={reading.value}
        onChange={function(e) { onChange(index, 'value', e.target.value) }}
        placeholder="Value"
        className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
        step="any"
      />
      <span className="text-slate-500 text-xs w-8 shrink-0">{unit}</span>
      <button
        onClick={function() { onRemove(index) }}
        className="text-slate-600 hover:text-red-400 transition text-xs shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

function CalibrationTool({ components }) {
  const sensorComponents = components.filter(function(c) { return c.category === 'Sensor' })
  const [selectedSensor, setSelectedSensor] = useState(
    sensorComponents.length > 0 ? sensorComponents[0].name : (COMMON_SENSORS[0].name)
  )
  const [customSensor, setCustomSensor] = useState('')
  const [readings, setReadings] = useState([
    { value: '', unit: '' },
    { value: '', unit: '' },
    { value: '', unit: '' },
  ])
  const [unit, setUnit] = useState('°C')
  const [environment, setEnvironment] = useState('room temperature')
  const [expectedRange, setExpectedRange] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('calibrate')

  const sensorName = customSensor.trim() || selectedSensor

  useEffect(function() {
    setHistory(getCalibrationGuide(sensorName))
    const preset = COMMON_SENSORS.find(function(s) { return s.name === sensorName })
    if (preset) {
      setUnit(preset.unit)
      setExpectedRange(preset.range)
    }
  }, [sensorName])

  function updateReading(index, field, value) {
    setReadings(function(prev) {
      return prev.map(function(r, i) {
        if (i === index) return Object.assign({}, r, { [field]: value, unit })
        return r
      })
    })
  }

  function addReading() {
    setReadings(function(prev) { return prev.concat([{ value: '', unit }]) })
  }

  function removeReading(index) {
    if (readings.length <= 1) return
    setReadings(function(prev) { return prev.filter(function(_, i) { return i !== index }) })
  }

  async function handleCalibrate() {
    const validReadings = readings.filter(function(r) { return r.value !== '' })
    if (validReadings.length === 0) {
      notify.warning('Enter at least one reading')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await generateCalibrationGuide(sensorName, validReadings, { environment, expectedRange })
      setResult(data)
      saveCalibrationGuide(sensorName, data)
      setHistory(getCalibrationGuide(sensorName))
      notify.success('Calibration analysis complete — ' + data.status)
    } catch {
      notify.error('Calibration failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const statusStyle = result ? (STATUS_STYLES[result.status] || STATUS_STYLES['Needs Calibration']) : null

  const TABS = [
    { id: 'calibrate', label: '📊 Calibrate' },
    { id: 'history', label: '📋 History' },
  ]

  return (
    <div className="space-y-4">

      {/* Sensor selector */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Select Sensor</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {sensorComponents.length > 0 && sensorComponents.map(function(comp) {
              return (
                <button
                  key={comp.name}
                  onClick={function() { setSelectedSensor(comp.name); setCustomSensor(''); setResult(null) }}
                  className={'text-xs px-2 py-1.5 rounded-lg border transition flex items-center gap-1 ' + (
                    selectedSensor === comp.name && !customSensor
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                  )}
                >
                  <span>{comp.icon}</span>
                  <span>{comp.name}</span>
                </button>
              )
            })}
            {COMMON_SENSORS.filter(function(s) {
              return !sensorComponents.find(function(c) { return c.name === s.name })
            }).slice(0, 4).map(function(sensor) {
              return (
                <button
                  key={sensor.name}
                  onClick={function() { setSelectedSensor(sensor.name); setCustomSensor(''); setResult(null) }}
                  className={'text-xs px-2 py-1.5 rounded-lg border transition ' + (
                    selectedSensor === sensor.name && !customSensor
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                  )}
                >
                  {sensor.name}
                </button>
              )
            })}
          </div>
          <input
            value={customSensor}
            onChange={function(e) { setCustomSensor(e.target.value); setResult(null) }}
            placeholder="Or type custom sensor name..."
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>

        {/* Unit and range */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-slate-500 mb-1">Unit</p>
            <input
              value={unit}
              onChange={function(e) { setUnit(e.target.value) }}
              placeholder="e.g. °C"
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Expected Range</p>
            <input
              value={expectedRange}
              onChange={function(e) { setExpectedRange(e.target.value) }}
              placeholder="e.g. 0 to 50"
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Environment</p>
            <select
              value={environment}
              onChange={function(e) { setEnvironment(e.target.value) }}
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
            >
              <option value="room temperature">Room temp</option>
              <option value="outdoor">Outdoor</option>
              <option value="refrigerator">Refrigerator</option>
              <option value="industrial">Industrial</option>
              <option value="high humidity">High humidity</option>
            </select>
          </div>
        </div>

        {/* Readings input */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Enter Sensor Readings</p>
          <div className="space-y-2">
            {readings.map(function(reading, i) {
              return (
                <ReadingInput
                  key={i}
                  index={i}
                  reading={reading}
                  onChange={updateReading}
                  onRemove={removeReading}
                  unit={unit}
                />
              )
            })}
          </div>
          <button
            onClick={addReading}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            + Add another reading
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 max-w-xs">
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

      {activeTab === 'calibrate' && (
        <>
          <button
            onClick={handleCalibrate}
            disabled={loading}
            className="w-full py-3 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? '📊 Analysing...' : '📊 Analyse & Calibrate'}
          </button>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Analysing {sensorName} readings...</p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Status banner */}
              <div className={'rounded-2xl border p-5 flex items-center gap-5 ' + statusStyle.bg + ' ' + statusStyle.border}>
                <AccuracyGauge accuracy={result.accuracy || 0} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{statusStyle.icon}</span>
                    <p className={'font-black text-lg ' + statusStyle.color}>{result.status}</p>
                  </div>
                  <p className="text-slate-300 text-sm">{result.analysis}</p>
                  {result.drift?.detected && (
                    <p className="text-orange-400 text-xs mt-1">
                      📉 Drift detected: {result.drift.amount} {result.drift.direction}
                    </p>
                  )}
                </div>
              </div>

              {/* Expected range */}
              {result.expectedRange && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-semibold mb-2">Expected Range</p>
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 text-sm">{result.expectedRange.min}</span>
                    <div className="flex-1 relative h-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-green-900 to-red-900 rounded-full" />
                      {readings.filter(function(r) { return r.value !== '' }).map(function(r, i) {
                        const min = parseFloat(result.expectedRange.min) || 0
                        const max = parseFloat(result.expectedRange.max) || 100
                        const val = parseFloat(r.value) || 0
                        const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100))
                        return (
                          <div
                            key={i}
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-indigo-500"
                            style={{ left: pct + '%', transform: 'translate(-50%, -50%)' }}
                            title={'Reading ' + (i + 1) + ': ' + r.value + ' ' + unit}
                          />
                        )
                      })}
                    </div>
                    <span className="text-green-400 text-sm">{result.expectedRange.max}</span>
                    <span className="text-slate-500 text-xs">{result.expectedRange.unit}</span>
                  </div>
                </div>
              )}

              {/* Issues */}
              {result.issues && result.issues.length > 0 && (
                <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
                  <p className="text-orange-400 text-xs font-semibold mb-2">⚠️ Issues Detected</p>
                  <ul className="space-y-1">
                    {result.issues.map(function(issue, i) {
                      return (
                        <li key={i} className="text-orange-200 text-xs flex items-start gap-2">
                          <span className="shrink-0">•</span> {issue}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Calibration steps */}
              {result.calibrationSteps && result.calibrationSteps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Calibration Steps</p>
                  {result.calibrationSteps.map(function(step, i) {
                    return (
                      <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-6 h-6 rounded-full bg-teal-950 border border-teal-800 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">
                            {step.step || i + 1}
                          </div>
                          <p className="text-white text-sm font-semibold">{step.description}</p>
                        </div>
                        {step.code && (
                          <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-3">
                            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">{step.code}</pre>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Recommendations</p>
                  <ul className="space-y-1">
                    {result.recommendations.map(function(rec, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                          <p className="text-slate-300">{rec}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <button
                onClick={handleCalibrate}
                className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
              >
                ↺ Re-analyse
              </button>
            </>
          )}

          {!result && !loading && (
            <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-white font-semibold mb-1">Sensor Calibration Tool</p>
              <p className="text-slate-500 text-sm">Enter readings above and analyse to check calibration</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-center text-slate-600 text-sm py-6">No calibration history for {sensorName}</p>
          ) : (
            history.map(function(entry, i) {
              const hs = STATUS_STYLES[entry.result.status] || STATUS_STYLES['Needs Calibration']
              return (
                <div key={i} className={'rounded-xl border p-3 ' + hs.bg + ' ' + hs.border}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{hs.icon}</span>
                    <p className={'text-sm font-semibold ' + hs.color}>{entry.result.status}</p>
                    <span className="text-slate-600 text-xs ml-auto">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{entry.result.analysis}</p>
                  <p className={hs.color + ' text-xs font-bold'}>Accuracy: {entry.result.accuracy}%</p>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default CalibrationTool