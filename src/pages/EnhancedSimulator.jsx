import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

// Reuse full Simulator2 but add drag-to-position support
// This creates an enhanced canvas version

const COMPONENT_DEFS = [
  {type:'led_red',label:'LED Red',icon:'🔴',color:'#ef4444',w:60,h:80,pins:[{name:'A+',x:20,y:80},{name:'K-',x:40,y:80}]},
  {type:'led_green',label:'LED Green',icon:'🟢',color:'#22c55e',w:60,h:80,pins:[{name:'A+',x:20,y:80},{name:'K-',x:40,y:80}]},
  {type:'led_blue',label:'LED Blue',icon:'🔵',color:'#3b82f6',w:60,h:80,pins:[{name:'A+',x:20,y:80},{name:'K-',x:40,y:80}]},
  {type:'button',label:'Button',icon:'🔘',color:'#6366f1',w:70,h:70,pins:[{name:'1',x:15,y:70},{name:'2',x:55,y:70}]},
  {type:'resistor',label:'220Ω',icon:'〰️',color:'#f59e0b',w:80,h:40,pins:[{name:'1',x:0,y:20},{name:'2',x:80,y:20}]},
  {type:'buzzer',label:'Buzzer',icon:'🔊',color:'#8b5cf6',w:60,h:60,pins:[{name:'+',x:20,y:60},{name:'-',x:40,y:60}]},
  {type:'dht22',label:'DHT22',icon:'🌡️',color:'#22c55e',w:60,h:80,pins:[{name:'VCC',x:10,y:80},{name:'DATA',x:30,y:80},{name:'GND',x:50,y:80}]},
  {type:'servo',label:'Servo',icon:'⚙️',color:'#f97316',w:80,h:60,pins:[{name:'GND',x:15,y:60},{name:'VCC',x:40,y:60},{name:'SIG',x:65,y:60}]},
  {type:'oled',label:'OLED',icon:'🖥️',color:'#6366f1',w:90,h:70,pins:[{name:'GND',x:15,y:70},{name:'VCC',x:35,y:70},{name:'SCL',x:55,y:70},{name:'SDA',x:75,y:70}]},
  {type:'pir',label:'PIR',icon:'👁️',color:'#f59e0b',w:60,h:70,pins:[{name:'VCC',x:10,y:70},{name:'OUT',x:30,y:70},{name:'GND',x:50,y:70}]},
  {type:'pot',label:'Pot',icon:'🎛️',color:'#0ea5e9',w:70,h:70,pins:[{name:'VCC',x:15,y:70},{name:'OUT',x:35,y:70},{name:'GND',x:55,y:70}]},
  {type:'relay',label:'Relay',icon:'⚡',color:'#ef4444',w:90,h:70,pins:[{name:'VCC',x:10,y:70},{name:'GND',x:30,y:70},{name:'IN',x:50,y:70},{name:'COM',x:70,y:70}]},
]

const WIRE_COLORS = ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316','#06b6d4','#84cc16']

function ComponentSVG({ comp, def, pinStates, onPinMouseDown, isSelected, potValue }) {
  const isLED = comp.type.startsWith('led')
  const isButton = comp.type === 'button'
  const isBuzzer = comp.type === 'buzzer'
  const isPot = comp.type === 'pot'
  const isServo = comp.type === 'servo'
  const isOLED = comp.type === 'oled'

  // Get connected board pin state
  const ledOn = isLED && (pinStates[comp.id + '_A+'] === 1)
  const buzOn = isBuzzer && (pinStates[comp.id + '_+'] === 1)
  const servoAngle = isServo ? Math.round((pinStates[comp.id + '_SIG'] || 0) / 255 * 180) : 90

  const color = def.color

  return (
    <g>
      {/* Component body */}
      {isLED && (
        <g>
          <rect x="10" y="5" width="40" height="55" rx="4"
            fill={ledOn ? color + 'cc' : '#1a1a2e'}
            stroke={color} strokeWidth="2"/>
          {ledOn && <rect x="10" y="5" width="40" height="55" rx="4" fill={color} opacity="0.3"/>}
          <circle cx="30" cy="30" r="16"
            fill={ledOn ? color : '#0a0a1a'}
            stroke={color} strokeWidth="2.5"
            filter={ledOn ? 'url(#comp-glow)' : 'none'}/>
          <circle cx="30" cy="30" r="8" fill={ledOn ? '#fff' : color + '30'}/>
          <text x="30" y="72" textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace">{def.label}</text>
        </g>
      )}

      {isButton && (
        <g>
          <rect x="5" y="5" width="60" height="55" rx="6" fill="#1a1a2e" stroke="#6366f1" strokeWidth="1.5"/>
          <circle cx="35" cy="30" r="18" fill="#2a2a4a" stroke="#6366f1" strokeWidth="1.5"/>
          <circle cx="35" cy="30" r="12" fill={pinStates[comp.id + '_1'] === 1 ? '#6366f1' : '#3a3a5a'}/>
          <text x="35" y="72" textAnchor="middle" fill="#6366f1" fontSize="9" fontFamily="monospace">BTN</text>
        </g>
      )}

      {comp.type === 'resistor' && (
        <g>
          <line x1="0" y1="20" x2="15" y2="20" stroke={color} strokeWidth="2"/>
          <rect x="15" y="10" width="50" height="20" rx="4" fill="#1a1a1a" stroke={color} strokeWidth="1.5"/>
          <rect x="20" y="14" width="8" height="12" fill="#8b5500"/>
          <rect x="31" y="14" width="8" height="12" fill="#111"/>
          <rect x="42" y="14" width="8" height="12" fill="#8b5500"/>
          <line x1="65" y1="20" x2="80" y2="20" stroke={color} strokeWidth="2"/>
          <text x="40" y="38" textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace">{def.label}</text>
        </g>
      )}

      {isBuzzer && (
        <g>
          <circle cx="30" cy="28" r="24" fill="#1a1a2e" stroke={color} strokeWidth="2"/>
          <circle cx="30" cy="28" r="16" fill={buzOn ? '#3b1d8a' : '#0a0a1a'} stroke={color} strokeWidth="1.5"/>
          <text x="30" y="32" textAnchor="middle" fill={color} fontSize="14">{buzOn ? '🔊' : '🔇'}</text>
          <text x="30" y="62" textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace">BUZZER</text>
        </g>
      )}

      {isPot && (
        <g>
          <rect x="5" y="5" width="60" height="55" rx="6" fill="#1a1a2e" stroke={color} strokeWidth="1.5"/>
          <circle cx="35" cy="28" r="18" fill="#0d0d1a" stroke={color} strokeWidth="1.5"/>
          <line
            x1="35" y1="28"
            x2={35 + 12 * Math.cos(((potValue||50)/100 * 270 - 135) * Math.PI / 180)}
            y2={28 + 12 * Math.sin(((potValue||50)/100 * 270 - 135) * Math.PI / 180)}
            stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="35" cy="28" r="4" fill={color}/>
          <text x="35" y="72" textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace">POT {potValue||50}%</text>
        </g>
      )}

      {isServo && (
        <g>
          <rect x="3" y="10" width="74" height="45" rx="5" fill="#1a0a00" stroke="#f97316" strokeWidth="1.5"/>
          <circle cx="40" cy="30" r="16" fill="#0a0505" stroke="#f97316" strokeWidth="1.5"/>
          <line x1="40" y1="30"
            x2={40 + 12 * Math.cos((servoAngle - 90) * Math.PI / 180)}
            y2={30 + 12 * Math.sin((servoAngle - 90) * Math.PI / 180)}
            stroke="#f97316" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="40" cy="30" r="4" fill="#f97316"/>
          <text x="40" y="68" textAnchor="middle" fill="#f97316" fontSize="8" fontFamily="monospace">{servoAngle}°</text>
        </g>
      )}

      {isOLED && (
        <g>
          <rect x="2" y="2" width="86" height="58" rx="4" fill="#0a0a0a" stroke={color} strokeWidth="1.5"/>
          <rect x="6" y="6" width="78" height="46" rx="2" fill="#001a00"/>
          <text x="45" y="22" textAnchor="middle" fill="#00ff00" fontSize="7" fontFamily="monospace">Hello World!</text>
          <text x="45" y="33" textAnchor="middle" fill="#00cc00" fontSize="6" fontFamily="monospace">ProtoMind v1.0</text>
          <text x="45" y="44" textAnchor="middle" fill="#009900" fontSize="5" fontFamily="monospace">192.168.1.1</text>
        </g>
      )}

      {!isLED && !isButton && comp.type !== 'resistor' && !isBuzzer && !isPot && !isServo && !isOLED && (
        <g>
          <rect x="3" y="3" width={def.w - 6} height={def.h - 20} rx="6"
            fill="#1a1a2e" stroke={color} strokeWidth="1.5"/>
          <text x={def.w/2} y={def.h/2} textAnchor="middle" fill={color} fontSize="22">{def.icon}</text>
          <text x={def.w/2} y={def.h - 8} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace">{def.label}</text>
        </g>
      )}

      {/* Pin circles */}
      {def.pins.map(function(pin) {
        const connected = pinStates[comp.id + '_' + pin.name] !== undefined
        return (
          <g key={pin.name}
            onMouseDown={function(e) { e.stopPropagation(); onPinMouseDown && onPinMouseDown(comp.id, pin.name, pin.x, pin.y) }}
            style={{ cursor: 'crosshair' }}>
            <circle cx={pin.x} cy={pin.y} r="5"
              fill={connected ? '#22c55e' : '#1e1e2e'}
              stroke={connected ? '#22c55e' : color}
              strokeWidth="1.5"/>
            <circle cx={pin.x} cy={pin.y} r="2.5" fill={connected ? '#4ade80' : '#555'}/>
            <text x={pin.x} y={pin.y + 13} textAnchor="middle" fill="#6b7280" fontSize="6" fontFamily="monospace">{pin.name}</text>
          </g>
        )
      })}
    </g>
  )
}

function EnhancedSimulator() {
  const navigate = useNavigate()
  const svgRef = useRef()
  const [placed, setPlaced] = useState([])
  const [wires, setWires] = useState([])
  const [dragging, setDragging] = useState(null)
  const [wiringPin, setWiringPin] = useState(null)
  const [tempWire, setTempWire] = useState(null)
  const [pinStates, setPinStates] = useState({})
  const [running, setRunning] = useState(false)
  const [code, setCode] = useState(localStorage.getItem('ide_code') || '// Load from IDE or type here
void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}')
  const [serialLog, setSerialLog] = useState([])
  const [activeTab, setActiveTab] = useState('canvas')
  const [simTime, setSimTime] = useState(0)
  const [zoom, setZoom] = useState(1)
  const loopRef = useRef()
  const timeRef = useRef(0)
  const [, forceUpdate] = useState(0)

  // Drag component
  function handleSVGMouseMove(e) {
    if (!dragging) {
      if (wiringPin) {
        const rect = svgRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / zoom
        const y = (e.clientY - rect.top) / zoom
        setTempWire({ x, y })
      }
      return
    }
    const rect = svgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom - dragging.offsetX
    const y = (e.clientY - rect.top) / zoom - dragging.offsetY
    setPlaced(function(prev) {
      return prev.map(function(c) {
        return c.id === dragging.id ? Object.assign({}, c, { x: Math.max(0, x), y: Math.max(0, y) }) : c
      })
    })
  }

  function handleSVGMouseUp() {
    setDragging(null)
    forceUpdate(function(n) { return n + 1 })
  }

  function handleCompMouseDown(e, compId) {
    if (wiringPin) return
    const rect = svgRef.current.getBoundingClientRect()
    const mx = (e.clientX - rect.left) / zoom
    const my = (e.clientY - rect.top) / zoom
    const comp = placed.find(function(c) { return c.id === compId })
    if (!comp) return
    setDragging({ id: compId, offsetX: mx - comp.x, offsetY: my - comp.y })
  }

  function handlePinMouseDown(compId, pinName, pinX, pinY) {
    const comp = placed.find(function(c) { return c.id === compId })
    if (!comp) return
    if (!wiringPin) {
      setWiringPin({ compId, pinName, absX: comp.x + pinX, absY: comp.y + pinY })
    } else {
      if (wiringPin.compId === compId) { setWiringPin(null); setTempWire(null); return }
      const color = WIRE_COLORS[wires.length % WIRE_COLORS.length]
      setWires(function(prev) {
        return [...prev, {
          id: 'w_' + Date.now(),
          fromComp: wiringPin.compId, fromPin: wiringPin.pinName,
          fromX: wiringPin.absX, fromY: wiringPin.absY,
          toComp: compId, toPin: pinName,
          toX: comp.x + pinX, toY: comp.y + pinY,
          color
        }]
      })
      setWiringPin(null)
      setTempWire(null)
      notify.success('Wired!')
    }
  }

  function addComponent(type) {
    const def = COMPONENT_DEFS.find(function(d) { return d.type === type })
    if (!def) return
    const id = 'c_' + Date.now()
    setPlaced(function(prev) {
      return [...prev, {
        id, type,
        x: 80 + Math.random() * 300,
        y: 80 + Math.random() * 200,
        potValue: 50
      }]
    })
  }

  function removeComp(id) {
    setPlaced(function(p) { return p.filter(function(c) { return c.id !== id }) })
    setWires(function(w) { return w.filter(function(x) { return x.fromComp !== id && x.toComp !== id }) })
  }

  // Run simple simulation
  function runSim() {
    if (loopRef.current) clearInterval(loopRef.current)
    timeRef.current = 0
    setSerialLog([])
    const vars = {}
    const ps = {}

    function ev(expr) {
      expr = String(expr).trim()
      if (expr === 'HIGH' || expr === '1') return 1
      if (expr === 'LOW' || expr === '0') return 0
      if (vars[expr] !== undefined) return vars[expr]
      if (!isNaN(expr)) return Number(expr)
      const neg = expr.match(/^!(\w+)$/)
      if (neg) return vars[neg[1]] ? 0 : 1
      return 0
    }

    function rb(block) {
      block.replace(/\/\/[^
]*/g, '').split(';').forEach(function(s) {
        s = s.trim()
        if (!s) return
        const dw = s.match(/digitalWrite\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/)
        if (dw) {
          const v = ev(dw[2])
          ps[dw[1]] = v
          // Find connected component pins
          wires.forEach(function(w) {
            if (w.toPin === dw[1] || w.fromPin === dw[1]) {
              const compId = w.toComp === 'board' ? w.fromComp : w.toComp
              const pin = w.toComp === 'board' ? w.fromPin : w.toPin
              ps[compId + '_' + pin] = v
            }
          })
          setPinStates(Object.assign({}, ps))
          return
        }
        const spln = s.match(/Serial\.println\s*\((.+)\)/)
        if (spln) {
          setSerialLog(function(p) { return [...p, { text: String(ev(spln[1])), time: timeRef.current }].slice(-200) })
          return
        }
        const vd = s.match(/(?:int|bool|float|long)\s+(\w+)\s*=\s*(.+)/)
        if (vd) { vars[vd[1]] = ev(vd[2]); return }
        const va = s.match(/^(\w+)\s*=\s*!(\w+)$/)
        if (va) { vars[va[1]] = vars[va[2]] ? 0 : 1; return }
      })
    }

    const setupM = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/)
    const loopM = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/)
    if (setupM) { try { rb(setupM[1]) } catch(e) {} }
    if (loopM) {
      let cnt = 0
      loopRef.current = setInterval(function() {
        timeRef.current += 100; setSimTime(function(t) { return t + 100 }); cnt++
        if (cnt > 500) { clearInterval(loopRef.current); return }
        try { rb(loopM[1]) } catch(e) { clearInterval(loopRef.current) }
      }, 100)
    }
    setRunning(true)
    notify.success('Simulation running!')
  }

  function stopSim() { if (loopRef.current) clearInterval(loopRef.current); setRunning(false) }
  function resetSim() { stopSim(); setPinStates({}); setSerialLog([]); setSimTime(0); timeRef.current = 0 }

  const CANVAS_W = 900, CANVAS_H = 600

  return (
    <div className="fullscreen-page h-screen bg-[#050510] text-white flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a1a] border-b border-[#1e1e2e] flex-shrink-0">
        <button onClick={function() { navigate('/') }} className="text-indigo-400 font-black text-sm">ProtoMind</button>
        <span className="text-slate-600 text-xs">Enhanced Simulator</span>
        <div className="w-px h-5 bg-[#2e2e4e]"/>
        {wiringPin && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-950 px-3 py-1 rounded-lg">
            <span>⚡ Wiring from {wiringPin.pinName}</span>
            <button onClick={function() { setWiringPin(null); setTempWire(null) }} className="text-yellow-600">✕</button>
          </div>
        )}
        <div className="flex-1"/>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <button onClick={function() { setZoom(function(z) { return Math.max(0.5, z - 0.1) }) }} className="w-6 h-6 bg-[#1e1e2e] rounded hover:bg-[#2e2e4e] flex items-center justify-center">−</button>
          <span className="w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={function() { setZoom(function(z) { return Math.min(2, z + 0.1) }) }} className="w-6 h-6 bg-[#1e1e2e] rounded hover:bg-[#2e2e4e] flex items-center justify-center">+</button>
          <button onClick={function() { setZoom(1) }} className="px-2 py-0.5 bg-[#1e1e2e] rounded hover:bg-[#2e2e4e]">1:1</button>
        </div>
        <button onClick={running ? stopSim : runSim}
          className={"px-4 py-1.5 rounded-lg text-xs font-bold " + (running ? 'bg-yellow-700 text-white' : 'bg-green-700 text-white')}>
          {running ? '⏸ Stop' : '▶ Run'}
        </button>
        <button onClick={resetSim} className="px-3 py-1.5 bg-[#1e1e2e] rounded-lg text-xs">↺</button>
        {running && <span className="text-green-400 text-xs">{(simTime/1000).toFixed(1)}s</span>}
        <button onClick={function() { navigate('/simulator2') }}
          className="px-3 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs hover:text-white">Board View</button>
        <button onClick={function() { navigate('/ide') }}
          className="px-3 py-1.5 bg-indigo-900 text-indigo-300 rounded-lg text-xs">💻 IDE</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: components */}
        <div className="w-40 bg-[#080814] border-r border-[#1e1e2e] overflow-y-auto flex-shrink-0">
          <p className="text-xs text-slate-600 uppercase px-3 py-2 border-b border-[#1e1e2e]">Drag & Drop</p>
          {COMPONENT_DEFS.map(function(def) {
            return (
              <button key={def.type} onClick={function() { addComponent(def.type) }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#13131f] text-left border-b border-[#0d0d1a] transition">
                <span className="text-lg">{def.icon}</span>
                <span className="text-xs text-slate-300">{def.label}</span>
              </button>
            )
          })}
          <p className="text-xs text-slate-600 px-3 py-2 mt-2">Click to add → Drag to move → Click pins to wire</p>
        </div>

        {/* Main canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-[#1e1e2e] bg-[#080814] flex-shrink-0">
            {[{id:'canvas',label:'Circuit Canvas'},{id:'code',label:'Code'},{id:'serial',label:`Serial (${serialLog.length})`}].map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={"px-4 py-2.5 text-xs border-r border-[#1e1e2e] transition " + (activeTab === tab.id ? 'bg-[#0d0d1a] text-white border-t-2 border-t-cyan-500' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
            {wires.length > 0 && (
              <button onClick={function() { setWires([]) }}
                className="ml-auto px-3 py-2 text-xs text-red-500 hover:text-red-400 border-l border-[#1e1e2e]">
                Clear Wires ({wires.length})
              </button>
            )}
          </div>

          {activeTab === 'canvas' && (
            <div className="flex-1 overflow-auto bg-[#030309] cursor-default"
              style={{backgroundImage:'radial-gradient(#1e1e2e 1px, transparent 1px)', backgroundSize:'20px 20px'}}>
              <svg
                ref={svgRef}
                width={CANVAS_W * zoom}
                height={CANVAS_H * zoom}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                onMouseMove={handleSVGMouseMove}
                onMouseUp={handleSVGMouseUp}
                onMouseLeave={handleSVGMouseUp}
                style={{ cursor: wiringPin ? 'crosshair' : 'default' }}>

                <defs>
                  <filter id="comp-glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <marker id="wire-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b"/>
                  </marker>
                </defs>

                {/* Grid label */}
                <text x="20" y="20" fill="#1e1e2e" fontSize="11" fontFamily="monospace">ProtoMind Enhanced Simulator</text>

                {/* Wires */}
                {wires.map(function(wire) {
                  const fromComp = placed.find(function(c) { return c.id === wire.fromComp })
                  const toComp = placed.find(function(c) { return c.id === wire.toComp })
                  if (!fromComp || !toComp) return null
                  const fromDef = COMPONENT_DEFS.find(function(d) { return d.type === fromComp.type })
                  const toDef = COMPONENT_DEFS.find(function(d) { return d.type === toComp.type })
                  const fromPin = fromDef?.pins.find(function(p) { return p.name === wire.fromPin })
                  const toPin = toDef?.pins.find(function(p) { return p.name === wire.toPin })
                  if (!fromPin || !toPin) return null
                  const x1 = fromComp.x + fromPin.x
                  const y1 = fromComp.y + fromPin.y
                  const x2 = toComp.x + toPin.x
                  const y2 = toComp.y + toPin.y
                  const mx = (x1 + x2) / 2
                  return (
                    <g key={wire.id}>
                      <path d={`M${x1},${y1} C${x1},${mx} ${x2},${mx} ${x2},${y2}`}
                        stroke={wire.color} strokeWidth="2.5" fill="none" strokeLinecap="round"
                        opacity="0.85"/>
                      <circle cx={x1} cy={y1} r="3" fill={wire.color}/>
                      <circle cx={x2} cy={y2} r="3" fill={wire.color}/>
                    </g>
                  )
                })}

                {/* Temp wire while wiring */}
                {wiringPin && tempWire && (
                  <path d={`M${wiringPin.absX},${wiringPin.absY} L${tempWire.x},${tempWire.y}`}
                    stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="5,3" opacity="0.7"/>
                )}

                {/* Placed components */}
                {placed.map(function(comp) {
                  const def = COMPONENT_DEFS.find(function(d) { return d.type === comp.type })
                  if (!def) return null
                  return (
                    <g key={comp.id}
                      transform={`translate(${comp.x}, ${comp.y})`}
                      onMouseDown={function(e) { handleCompMouseDown(e, comp.id) }}
                      style={{ cursor: wiringPin ? 'crosshair' : 'grab', userSelect: 'none' }}>
                      <ComponentSVG
                        comp={comp} def={def}
                        pinStates={pinStates}
                        onPinMouseDown={handlePinMouseDown}
                        potValue={comp.potValue}/>
                      {/* Delete button */}
                      <g onClick={function(e) { e.stopPropagation(); removeComp(comp.id) }} style={{ cursor: 'pointer' }}>
                        <circle cx={def.w - 4} cy="4" r="7" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1"/>
                        <text x={def.w - 4} y="7.5" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">×</text>
                      </g>
                    </g>
                  )
                })}

                {/* Empty state */}
                {placed.length === 0 && (
                  <g>
                    <text x={CANVAS_W/2} y={CANVAS_H/2 - 20} textAnchor="middle" fill="#1e1e2e" fontSize="48">🔌</text>
                    <text x={CANVAS_W/2} y={CANVAS_H/2 + 20} textAnchor="middle" fill="#2e2e4e" fontSize="16" fontFamily="monospace">Add components from the left panel</text>
                    <text x={CANVAS_W/2} y={CANVAS_H/2 + 40} textAnchor="middle" fill="#1e1e2e" fontSize="11" fontFamily="monospace">Drag to position • Click pins to connect • Run to simulate</text>
                  </g>
                )}
              </svg>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="flex-1 p-4 space-y-3">
              <div className="flex gap-2">
                <button onClick={function() { const s = localStorage.getItem('ide_code'); if(s){setCode(s);notify.info('Loaded!')} }}
                  className="px-3 py-1.5 bg-[#1e1e2e] text-slate-300 rounded-lg text-xs">Load from IDE</button>
                <button onClick={function() { runSim(); setActiveTab('canvas') }}
                  className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-xs font-bold">▶ Run</button>
              </div>
              <textarea value={code} onChange={function(e) { setCode(e.target.value) }}
                className="w-full flex-1 h-[calc(100vh-200px)] bg-[#050510] border border-[#2e2e4e] rounded-xl p-4 text-green-400 text-sm font-mono outline-none focus:border-indigo-500 resize-none"
                spellCheck={false}/>
            </div>
          )}

          {activeTab === 'serial' && (
            <div className="flex-1 p-4">
              <div className="h-full bg-[#050510] border border-[#2e2e4e] rounded-xl p-4 overflow-y-auto font-mono">
                {serialLog.length === 0
                  ? <p className="text-slate-600 text-sm">Serial output appears here when simulation runs...</p>
                  : serialLog.map(function(l, i) {
                      return (
                        <div key={i} className="flex gap-3 text-sm mb-0.5">
                          <span className="text-slate-600 w-14 shrink-0 text-xs">{l.time}ms</span>
                          <span className="text-green-400">{l.text}</span>
                        </div>
                      )
                    })
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedSimulator
