import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

const SUPPORTED_BOARDS = [
  { id:'arduino_uno', name:'Arduino Uno', chip:'ATmega328P', bauds:[9600,115200], icon:'🔵', color:'#22c55e' },
  { id:'arduino_nano', name:'Arduino Nano', chip:'ATmega328P', bauds:[9600,115200], icon:'🔵', color:'#22c55e' },
  { id:'esp32', name:'ESP32', chip:'ESP32-WROOM', bauds:[115200,921600], icon:'🟣', color:'#a855f7' },
  { id:'esp8266', name:'ESP8266', chip:'ESP8266EX', bauds:[9600,115200], icon:'🟣', color:'#a855f7' },
  { id:'rpi_pico', name:'Raspberry Pi Pico', chip:'RP2040', bauds:[115200], icon:'🟢', color:'#22c55e' },
]

const TWIN_WIDGETS = [
  { id:'led', name:'LED', icon:'💡', type:'output', desc:'Digital output control' },
  { id:'temperature', name:'Temperature', icon:'🌡️', type:'input', desc:'Sensor reading (°C)' },
  { id:'humidity', name:'Humidity', icon:'💧', type:'input', desc:'Sensor reading (%)' },
  { id:'distance', name:'Distance', icon:'📡', type:'input', desc:'Ultrasonic (cm)' },
  { id:'servo', name:'Servo Angle', icon:'⚙️', type:'output', desc:'0-180 degrees' },
  { id:'potentiometer', name:'Potentiometer', icon:'🎛️', type:'input', desc:'Analog 0-1023' },
  { id:'button', name:'Button', icon:'🔘', type:'input', desc:'Digital input' },
  { id:'motor_speed', name:'Motor Speed', icon:'🔄', type:'output', desc:'PWM 0-255' },
  { id:'light', name:'Light (LDR)', icon:'☀️', type:'input', desc:'Analog reading' },
  { id:'gas', name:'Gas Level', icon:'💨', type:'input', desc:'MQ sensor reading' },
  { id:'relay', name:'Relay', icon:'⚡', type:'output', desc:'On/Off switch' },
  { id:'buzzer', name:'Buzzer', icon:'🔊', type:'output', desc:'Digital output' },
]

function GaugeWidget({ value, max, unit, color, label }) {
  const pct = Math.min(Math.max((value||0)/max*100, 0), 100)
  const angle = -135 + pct * 2.7
  const r = 40
  const cx = 60, cy = 60
  const startAngle = -135 * Math.PI/180
  const endAngle = (angle) * Math.PI/180
  const x1 = cx + r*Math.cos(startAngle), y1 = cy + r*Math.sin(startAngle)
  const x2 = cx + r*Math.cos(endAngle), y2 = cy + r*Math.sin(endAngle)
  const largeArc = pct > 50 ? 1 : 0

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 80" className="w-24">
        <path d={`M${x1} ${y1} A${r} ${r} 0 1 1 ${cx+r*Math.cos(135*Math.PI/180)} ${cy+r*Math.sin(135*Math.PI/180)}`}
          stroke="#1e1e2e" strokeWidth="8" fill="none" strokeLinecap="round"/>
        {pct > 0 && <path d={`M${x1} ${y1} A${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"/>}
        <text x={cx} y={cy+5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{value||0}</text>
        <text x={cx} y={cy+17} textAnchor="middle" fill="#6b7280" fontSize="7">{unit}</text>
      </svg>
      <p className="text-xs text-slate-400 -mt-1">{label}</p>
    </div>
  )
}

function TwinWidget({ widget, value, onControl }) {
  const [localVal, setLocalVal] = useState(value||0)
  const isOutput = widget.type==='output'
  const isToggle = widget.id==='led'||widget.id==='relay'||widget.id==='buzzer'
  const isSlider = widget.id==='servo'||widget.id==='motor_speed'
  const isGauge = ['temperature','humidity','distance','potentiometer','light','gas'].includes(widget.id)

  const gaugeConfig = {
    temperature:{max:100,unit:'°C',color:'#ef4444'},
    humidity:{max:100,unit:'%',color:'#3b82f6'},
    distance:{max:400,unit:'cm',color:'#22c55e'},
    potentiometer:{max:1023,unit:'raw',color:'#f59e0b'},
    light:{max:1023,unit:'lux',color:'#fbbf24'},
    gas:{max:1023,unit:'ppm',color:'#a855f7'},
  }

  const cfg = gaugeConfig[widget.id]
  const displayVal = value !== undefined && value !== null ? value : localVal

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-4 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{widget.icon}</span>
        <div>
          <p className="text-white font-bold text-sm">{widget.name}</p>
          <p className="text-slate-600 text-xs">{widget.desc}</p>
        </div>
        <span className={"ml-auto text-xs px-2 py-0.5 rounded-full " + (isOutput?'bg-orange-950 text-orange-400 border border-orange-800':'bg-blue-950 text-blue-400 border border-blue-800')}>
          {isOutput?'OUTPUT':'INPUT'}
        </span>
      </div>

      {isGauge && cfg && (
        <div className="flex justify-center">
          <GaugeWidget value={displayVal} max={cfg.max} unit={cfg.unit} color={cfg.color} label={widget.name}/>
        </div>
      )}

      {widget.id==='button' && (
        <div className="flex items-center justify-center gap-3">
          <div className={"w-8 h-8 rounded-full border-2 flex items-center justify-center " + (displayVal?'border-green-500 bg-green-950':'border-[#2e2e4e] bg-[#0a0a0a]')}>
            <div className={"w-4 h-4 rounded-full " + (displayVal?'bg-green-500':'bg-[#1e1e2e]')}/>
          </div>
          <span className={displayVal?'text-green-400 font-bold':'text-slate-500'}>{displayVal?'PRESSED':'RELEASED'}</span>
        </div>
      )}

      {isToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={"w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all " + (displayVal?'border-green-500 shadow-lg shadow-green-500/30':'border-[#2e2e4e]')}
              style={{backgroundColor:displayVal?'#14532d':'#0a0a0a'}}>
              <div className={"w-5 h-5 rounded-full transition-all " + (displayVal?'bg-green-400':'bg-[#1e1e2e]')}/>
            </div>
            <span className={displayVal?'text-green-400 font-bold':'text-slate-500'}>{displayVal?'ON':'OFF'}</span>
          </div>
          {isOutput && (
            <button onClick={function(){const v=displayVal?0:1;setLocalVal(v);onControl&&onControl(widget.id,v)}}
              className={"px-4 py-2 rounded-xl font-bold text-sm transition " + (displayVal?'bg-red-800 hover:bg-red-700 text-white':'bg-green-800 hover:bg-green-700 text-white')}>
              {displayVal?'Turn OFF':'Turn ON'}
            </button>
          )}
        </div>
      )}

      {isSlider && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Value</span>
            <span className="text-white font-bold text-lg">{displayVal}</span>
          </div>
          <input type="range" min="0" max={widget.id==='servo'?180:255} value={displayVal}
            onChange={function(e){const v=parseInt(e.target.value);setLocalVal(v);onControl&&onControl(widget.id,v)}}
            className="w-full accent-indigo-500"/>
          <div className="flex justify-between text-xs text-slate-600">
            <span>0</span>
            <span>{widget.id==='servo'?'90':'128'}</span>
            <span>{widget.id==='servo'?'180':'255'}</span>
          </div>
        </div>
      )}

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
        <span className="text-slate-600 text-xs">Live</span>
        <span className="text-slate-500 text-xs ml-auto">val: {displayVal}</span>
      </div>
    </div>
  )
}


function DataChart({ data, keys, colors }) {
  const canvasRef = useRef()
  useEffect(function() {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    ctx.fillStyle = '#050510'
    ctx.fillRect(0, 0, w, h)
    // Grid
    ctx.strokeStyle = '#1e1e2e'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      ctx.beginPath(); ctx.moveTo(0, h/5*i); ctx.lineTo(w, h/5*i); ctx.stroke()
    }
    // Lines
    ;(keys || []).forEach(function(key, ki) {
      const vals = data.map(function(d) { return parseFloat(d[key]) || 0 })
      const min = Math.min(...vals), max = Math.max(...vals)
      const range = max - min || 1
      ctx.strokeStyle = (colors || [])[ki] || '#6366f1'
      ctx.lineWidth = 2
      ctx.beginPath()
      vals.forEach(function(v, i) {
        const x = (i / (vals.length - 1)) * w
        const y = h - ((v - min) / range) * (h - 16) - 8
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      })
      ctx.stroke()
      // Label
      ctx.fillStyle = (colors || [])[ki] || '#6366f1'
      ctx.font = '10px monospace'
      ctx.fillText(key + ': ' + (vals[vals.length-1]||0).toFixed(1), 8 + ki * 120, 14)
    })
  }, [data, keys])
  return <canvas ref={canvasRef} width={600} height={120} className="w-full rounded-xl border border-[#2e2e4e]"/>
}

function DigitalTwin() {
  const navigate = useNavigate()
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState(SUPPORTED_BOARDS[0])
  const [baudRate, setBaudRate] = useState(9600)
  const [activeWidgets, setActiveWidgets] = useState(['led','temperature','humidity','button'])
  const [sensorData, setSensorData] = useState({})
  const [outputStates, setOutputStates] = useState({})
  const [log, setLog] = useState([])
  const [autoDetect, setAutoDetect] = useState(true)
  const [dataHistory, setDataHistory] = useState([])
  const [showChart, setShowChart] = useState(false)
  const portRef = useRef()
  const readerRef = useRef()
  const writerRef = useRef()
  const bufferRef = useRef('')

  // Simulate live data when not connected (demo mode)
  useEffect(function() {
    if (connected) return
    const interval = setInterval(function() {
      setDataHistory(function(prev) { return [...prev.slice(-60), { temperature: 0, humidity: 0, ...prev[prev.length-1], t: Date.now() }] })
      setSensorData(function(prev) {
        return {
          temperature: parseFloat((20 + Math.sin(Date.now()/3000)*5 + Math.random()*0.5).toFixed(1)),
          humidity: parseFloat((55 + Math.cos(Date.now()/4000)*10 + Math.random()*1).toFixed(1)),
          distance: parseFloat((30 + Math.sin(Date.now()/2000)*20 + Math.random()*2).toFixed(1)),
          potentiometer: Math.floor(400 + Math.sin(Date.now()/2500)*300 + Math.random()*20),
          light: Math.floor(600 + Math.sin(Date.now()/5000)*200),
          gas: Math.floor(120 + Math.random()*30),
          button: Math.random() > 0.9 ? 1 : 0,
        }
      })
    }, 500)
    return function() { clearInterval(interval) }
  }, [connected])

  // Parse incoming serial data
  function parseSerialLine(line) {
    line = line.trim()
    if (!line) return

    addLog(line, 'rx')

    // JSON format: {"temp":25.3,"hum":60}
    try {
      const parsed = JSON.parse(line)
      setDataHistory(function(prev) { return [...prev.slice(-60), { temperature: 0, humidity: 0, ...prev[prev.length-1], t: Date.now() }] })
      setSensorData(function(prev) { return Object.assign({}, prev, parsed) })
      return
    } catch(e) {}

    // Key=value format: TEMP=25.3
    const kv = line.match(/^([A-Z_]+)=([-\d.]+)$/)
    if (kv) {
      const key = kv[1].toLowerCase()
      const val = parseFloat(kv[2])
      setDataHistory(function(prev) { return [...prev.slice(-60), { temperature: 0, humidity: 0, ...prev[prev.length-1], t: Date.now() }] })
      setSensorData(function(prev) { return Object.assign({}, prev, { [key]: val }) })
      return
    }

    // CSV format: 25.3,60.1,45
    const parts = line.split(',').map(function(p){return parseFloat(p.trim())})
    if (parts.length > 1 && parts.every(function(p){return !isNaN(p)})) {
      const keys = ['ch1','ch2','ch3','ch4','ch5']
      const obj = {}
      parts.forEach(function(v, i) { if (keys[i]) obj[keys[i]] = v })
      setDataHistory(function(prev) { return [...prev.slice(-60), { temperature: 0, humidity: 0, ...prev[prev.length-1], t: Date.now() }] })
      setSensorData(function(prev) { return Object.assign({}, prev, obj) })
    }
  }

  async function handleConnect() {
    if (!navigator.serial) { notify.error('Web Serial not supported. Use Chrome/Edge.'); return }
    setConnecting(true)
    try {
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate })
      portRef.current = port
      setConnected(true)
      addLog('[Twin] Connected at ' + baudRate + ' baud', 'system')
      notify.success('Hardware connected!')

      const decoder = new TextDecoderStream()
      port.readable.pipeTo(decoder.writable)
      const reader = decoder.readable.getReader()
      readerRef.current = reader

      const readLoop = async function() {
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            bufferRef.current += value
            const lines = bufferRef.current.split('\n')
            bufferRef.current = lines.pop()
            lines.forEach(function(line) { if (line.trim()) parseSerialLine(line) })
          }
        } catch(e) {
          if (e.name !== 'AbortError') addLog('[Error] ' + e.message, 'error')
        }
      }
      readLoop()

      if (port.writable) {
        const encoder = new TextEncoderStream()
        encoder.readable.pipeTo(port.writable)
        writerRef.current = encoder.writable.getWriter()
      }
    } catch(e) {
      if (e.name !== 'NotFoundError') notify.error('Connection failed: ' + e.message)
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    if (readerRef.current) await readerRef.current.cancel()
    if (portRef.current) await portRef.current.close()
    setConnected(false)
    addLog('[Twin] Disconnected', 'system')
    notify.info('Disconnected')
  }

  async function handleControl(widgetId, value) {
    setOutputStates(function(prev) { return Object.assign({}, prev, { [widgetId]: value }) })
    const cmd = widgetId.toUpperCase() + '=' + value + '\n'
    addLog('[TX] ' + cmd.trim(), 'tx')
    if (writerRef.current) {
      try { await writerRef.current.write(cmd) } catch(e) {}
    }
    notify.info('Sent: ' + cmd.trim())
  }

  function addLog(text, type) {
    setLog(function(prev) {
      return [...prev, { text, type, time: new Date().toLocaleTimeString() }].slice(-200)
    })
  }

  function toggleWidget(id) {
    setActiveWidgets(function(prev) {
      return prev.includes(id) ? prev.filter(function(w){return w!==id}) : [...prev, id]
    })
  }

  const board = selectedBoard

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Animated bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600 opacity-4 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-600 opacity-4 rounded-full blur-3xl"/>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <button onClick={function(){navigate('/')}} className="text-slate-500 hover:text-white text-sm mb-3 flex items-center gap-1">
              ← Home
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-950 to-cyan-950 border border-indigo-800 flex items-center justify-center text-3xl">
                🔮
              </div>
              <div>
                <h1 className="text-3xl font-black">Digital Twin</h1>
                <p className="text-slate-400 text-sm">Real hardware ↔ Virtual prototype — live sync</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <div className={"flex items-center gap-2 px-4 py-2 rounded-xl border " + (connected?'bg-green-950 border-green-800':'bg-[#0d0d1a] border-[#2e2e4e]')}>
              <div className={"w-2.5 h-2.5 rounded-full " + (connected?'bg-green-500 animate-pulse':'bg-slate-600')}/>
              <span className={connected?'text-green-400 font-bold':'text-slate-400'}>
                {connected?'Hardware Connected':connecting?'Connecting...':'Demo Mode (Simulated)'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={function(){navigate('/simulator2')}}
                className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
                🔌 Simulator
              </button>
              <button onClick={function(){navigate('/ide')}}
                className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
                💻 IDE
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left config panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Connection */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
              <p className="text-white font-bold mb-3">Connection</p>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-500 text-xs block mb-1">Board</label>
                  <select value={selectedBoard.id}
                    onChange={function(e){ setSelectedBoard(SUPPORTED_BOARDS.find(function(b){return b.id===e.target.value})||SUPPORTED_BOARDS[0]) }}
                    className="w-full bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-lg px-2 py-2 outline-none focus:border-indigo-500">
                    {SUPPORTED_BOARDS.map(function(b){return <option key={b.id} value={b.id}>{b.icon} {b.name}</option>})}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs block mb-1">Baud Rate</label>
                  <select value={baudRate} onChange={function(e){setBaudRate(parseInt(e.target.value))}}
                    className="w-full bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-lg px-2 py-2 outline-none focus:border-indigo-500">
                    {[9600,19200,38400,57600,115200,230400].map(function(b){return <option key={b} value={b}>{b}</option>})}
                  </select>
                </div>
                <button onClick={connected?handleDisconnect:handleConnect} disabled={connecting}
                  className={"w-full py-2.5 rounded-xl font-bold text-sm transition " + (
                    connected?'bg-red-800 hover:bg-red-700 text-white':
                    connecting?'bg-[#1e1e2e] text-slate-500':
                    'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white'
                  )}>
                  {connected?'Disconnect':connecting?'Connecting...':'Connect Hardware'}
                </button>
              </div>

              <div className="mt-3 bg-[#080814] rounded-xl p-3">
                <p className="text-slate-600 text-xs font-semibold mb-1">Board Info</p>
                <p className="text-white text-xs">{board.icon} {board.name}</p>
                <p className="text-slate-500 text-xs">{board.chip}</p>
              </div>
            </div>

            {/* Widget picker */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
              <p className="text-white font-bold mb-3">Widgets</p>
              <div className="space-y-1">
                {TWIN_WIDGETS.map(function(w){
                  const active = activeWidgets.includes(w.id)
                  return(
                    <button key={w.id} onClick={function(){toggleWidget(w.id)}}
                      className={"w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition " + (active?'bg-indigo-950 border border-indigo-800 text-white':'text-slate-500 hover:text-white hover:bg-[#13131f]')}>
                      <span className="w-4">{active?'✓':' '}</span>
                      <span>{w.icon}</span>
                      <span>{w.name}</span>
                      <span className={"ml-auto text-xs " + (w.type==='output'?'text-orange-500':'text-blue-500')}>{w.type}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Serial data format */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
              <p className="text-white font-bold mb-2">Data Format</p>
              <div className="space-y-2 text-xs">
                <div className="bg-[#080814] rounded-lg p-2">
                  <p className="text-slate-500 mb-1">JSON (recommended)</p>
                  <code className="text-green-400">{'{"temp":25.3,"hum":60}'}</code>
                </div>
                <div className="bg-[#080814] rounded-lg p-2">
                  <p className="text-slate-500 mb-1">Key=Value</p>
                  <code className="text-green-400">TEMP=25.3</code>
                </div>
                <div className="bg-[#080814] rounded-lg p-2">
                  <p className="text-slate-500 mb-1">CSV</p>
                  <code className="text-green-400">25.3,60,45</code>
                </div>
              </div>
            </div>
          </div>

          {/* Main twin dashboard */}
          <div className="lg:col-span-3 space-y-4">
            {/* Status banner */}
            {!connected && (
              <div className="bg-gradient-to-r from-indigo-950 to-cyan-950 border border-indigo-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="text-3xl">🔮</div>
                <div>
                  <p className="text-white font-bold">Demo Mode — Simulated Data</p>
                  <p className="text-slate-400 text-sm">Connect real hardware via USB to see live sensor readings. Showing simulated values.</p>
                </div>
                <button onClick={handleConnect}
                  className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition shrink-0">
                  Connect →
                </button>
              </div>
            )}

            {/* Widget grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TWIN_WIDGETS.filter(function(w){return activeWidgets.includes(w.id)}).map(function(widget){
                const value = widget.type==='output'
                  ? (outputStates[widget.id]||0)
                  : (sensorData[widget.id]||sensorData[widget.id.replace('_','')]||0)
                return(
                  <TwinWidget key={widget.id} widget={widget} value={value} onControl={handleControl}/>
                )
              })}
            </div>

            {/* Chart toggle */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-white font-bold">Live Chart</p>
                <button onClick={function(){setShowChart(function(s){return !s})}}
                  className={"ml-auto px-3 py-1 rounded-lg text-xs " + (showChart?'bg-indigo-700 text-white':'bg-[#1e1e2e] text-slate-400')}>
                  {showChart?'Hide':'Show'}
                </button>
              </div>
              {showChart && dataHistory.length > 1 && (
                <DataChart data={dataHistory} keys={['temperature','humidity']} colors={['#ef4444','#3b82f6']}/>
              )}
              {showChart && dataHistory.length <= 1 && (
                <p className="text-slate-600 text-xs text-center py-4">Waiting for data...</p>
              )}
            </div>

            {/* Raw data + log */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
                <p className="text-white font-bold mb-3">Raw Sensor Data</p>
                <div className="space-y-1 font-mono text-xs max-h-40 overflow-y-auto">
                  {Object.entries(sensorData).length===0
                    ? <p className="text-slate-600">No data yet...</p>
                    : Object.entries(sensorData).map(function(entry){
                        const k=entry[0],v=entry[1]
                        return(
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-slate-500">{k}:</span>
                            <span className="text-green-400 font-bold">{typeof v==='number'?v.toFixed(2):v}</span>
                          </div>
                        )
                      })
                  }
                </div>
              </div>

              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4">
                <p className="text-white font-bold mb-3">Serial Log</p>
                <div className="space-y-0.5 font-mono text-xs max-h-40 overflow-y-auto">
                  {log.length===0
                    ? <p className="text-slate-600">No messages...</p>
                    : log.slice(-20).map(function(entry,i){
                        const c = entry.type==='rx'?'text-green-400':entry.type==='tx'?'text-blue-400':entry.type==='error'?'text-red-400':'text-slate-500'
                        return(
                          <div key={i} className="flex gap-2">
                            <span className="text-slate-700 shrink-0">{entry.time}</span>
                            <span className={c}>{entry.text}</span>
                          </div>
                        )
                      })
                  }
                </div>
              </div>
            </div>

            {/* Arduino code snippet */}
            <div className="bg-[#080814] border border-[#1e1e2e] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-white font-bold">Arduino Code Template</p>
                <span className="text-slate-600 text-xs">Copy to IDE and upload to your board</span>
                <button onClick={function(){
                  const code = document.getElementById('twin-code').textContent
                  navigator.clipboard.writeText(code)
                  notify.success('Code copied!')
                }} className="ml-auto px-3 py-1 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs">
                  Copy
                </button>
                <button onClick={function(){navigate('/ide')}}
                  className="px-3 py-1 bg-indigo-800 hover:bg-indigo-700 text-indigo-300 rounded-lg text-xs">
                  Open in IDE →
                </button>
              </div>
              <pre id="twin-code" className="text-green-400 text-xs font-mono overflow-x-auto bg-[#050510] rounded-xl p-3 max-h-48">
{`// ProtoMind Digital Twin — ${board.name}
// This sends sensor data in JSON format

#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

const int LED_PIN = 13;
const int BUTTON_PIN = 4;

void setup() {
  Serial.begin(${baudRate});
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int btn = !digitalRead(BUTTON_PIN);
  
  // Send JSON to ProtoMind Digital Twin
  Serial.print("{");
  Serial.print("\"temperature\":"); Serial.print(temp, 1);
  Serial.print(",\"humidity\":"); Serial.print(hum, 1);
  Serial.print(",\"button\":"); Serial.print(btn);
  Serial.println("}");
  
  // Receive commands: LED=1, LED=0, SERVO=90
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    if (cmd.startsWith("LED=")) {
      digitalWrite(LED_PIN, cmd.substring(4).toInt());
    }
  }
  
  delay(500);
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DigitalTwin
