import { useState, useEffect, useRef } from 'react'
import { generateIoTDashboard, saveDashboard, getDashboard, simulateWidgetValue } from '../services/iotDashboardService'
import { notify } from '../services/toast'

const WIDGET_ICONS = {
  gauge: '🔵',
  temperature: '🌡️',
  humidity: '💧',
  pressure: '🌪️',
  counter: '🔢',
  status: '🟢',
  chart: '📈',
  distance: '📏',
}

function GaugeWidget({ widget, value }) {
  const color = widget.color || '#6366f1'
  const min = parseFloat(widget.minValue) || 0
  const max = parseFloat(widget.maxValue) || 100
  const val = parseFloat(value) || 0
  const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100))
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (pct / 100) * circumference * 0.75

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#1e1e2e" strokeWidth="6"
            strokeDasharray={circumference * 0.75 + ' ' + circumference * 0.25} strokeLinecap="round" />
          <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference * 0.75 * (pct / 100) + ' ' + circumference}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black" style={{ color }}>{val}</span>
        </div>
      </div>
      <p className="text-slate-500 text-xs">{widget.unit}</p>
    </div>
  )
}

function StatusWidget({ widget, value }) {
  const isOn = parseFloat(value) > 50
  return (
    <div className="flex items-center gap-2">
      <div className={'w-4 h-4 rounded-full ' + (isOn ? 'bg-green-500 animate-pulse' : 'bg-red-600')} />
      <span className={'text-sm font-bold ' + (isOn ? 'text-green-400' : 'text-red-400')}>
        {isOn ? 'ONLINE' : 'OFFLINE'}
      </span>
    </div>
  )
}

function NumberWidget({ widget, value }) {
  const color = widget.color || '#6366f1'
  return (
    <div className="text-center">
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      <p className="text-slate-500 text-xs">{widget.unit}</p>
    </div>
  )
}

function WidgetCard({ widget, value }) {
  const color = widget.color || '#6366f1'
  const icon = WIDGET_ICONS[widget.type] || widget.icon || '📊'

  function renderContent() {
    if (widget.type === 'status') return <StatusWidget widget={widget} value={value} />
    if (widget.type === 'gauge') return <GaugeWidget widget={widget} value={value} />
    return <NumberWidget widget={widget} value={value} />
  }

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"
      style={{ borderTop: '2px solid ' + color }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <p className="text-slate-400 text-xs font-medium">{widget.title}</p>
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="flex items-center justify-center">
        {renderContent()}
      </div>
      {widget.dataSource && (
        <p className="text-slate-700 text-xs text-center mt-2">📡 {widget.dataSource}</p>
      )}
    </div>
  )
}

function IoTDashboard({ idea, components }) {
  const [dashboard, setDashboard] = useState(getDashboard(idea))
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState({})
  const [isLive, setIsLive] = useState(false)
  const intervalRef = useRef(null)

  function startLive(widgets) {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const newVals = {}
    widgets.forEach(function(w) { newVals[w.id] = simulateWidgetValue(w) })
    setValues(newVals)
    intervalRef.current = setInterval(function() {
      setValues(function(prev) {
        const next = Object.assign({}, prev)
        widgets.forEach(function(w) { next[w.id] = simulateWidgetValue(w) })
        return next
      })
    }, 2000)
    setIsLive(true)
  }

  function stopLive() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsLive(false)
  }

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await generateIoTDashboard(idea, components)
      setDashboard(data)
      saveDashboard(idea, data)
      const initVals = {}
      ;(data.widgets || []).forEach(function(w) { initVals[w.id] = simulateWidgetValue(w) })
      setValues(initVals)
      notify.success('Dashboard designed — ' + (data.widgets?.length || 0) + ' widgets!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Design an IoT monitoring dashboard with live simulated sensor data</p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '📊 Building...' : '📊 Build Dashboard'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Designing IoT dashboard...</p>
        </div>
      )}

      {dashboard && !loading && (
        <>
          <div className="flex items-center gap-3">
            <p className="text-white font-bold">{dashboard.dashboardTitle}</p>
            <button
              onClick={function() { isLive ? stopLive() : startLive(dashboard.widgets || []) }}
              className={'ml-auto px-4 py-2 rounded-xl text-xs font-semibold transition ' + (
                isLive
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-green-700 hover:bg-green-600 text-white'
              )}
            >
              {isLive ? '⏹ Stop Live' : '▶️ Simulate Live'}
            </button>
          </div>

          {isLive && (
            <div className="flex items-center gap-2 bg-green-950 border border-green-800 rounded-xl p-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <p className="text-green-400 text-xs">Live simulation running — values update every 2 seconds</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(dashboard.widgets || []).map(function(widget) {
              return (
                <WidgetCard
                  key={widget.id}
                  widget={widget}
                  value={values[widget.id] || simulateWidgetValue(widget)}
                />
              )
            })}
          </div>

          <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-3">
            <p className="text-indigo-400 text-xs">
              💡 Connect real sensors by replacing simulated values with actual sensor readings from your microcontroller via Serial or MQTT.
            </p>
          </div>

          <button onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Redesign Dashboard
          </button>
        </>
      )}

      {!dashboard && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-white font-semibold mb-1">IoT Dashboard Builder</p>
          <p className="text-slate-500 text-sm">AI designs a monitoring dashboard with gauge, temperature and status widgets</p>
        </div>
      )}
    </div>
  )
}

export default IoTDashboard