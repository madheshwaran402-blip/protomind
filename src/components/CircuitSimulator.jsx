import { useState, useRef, useEffect, useCallback } from 'react'
import { notify } from './toast'

// ─── BOARD DEFINITIONS ────────────────────────────────────────────────────────
const BOARDS = {
  arduino_uno: {
    name: 'Arduino Uno', icon: '🔵', color: '#1a4a8a',
    digitalPins: [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
    analogPins: ['A0','A1','A2','A3','A4','A5'],
    pwmPins: [3,5,6,9,10,11],
    i2cSDA: 'A4', i2cSCL: 'A5',
    vcc: 5, builtinLED: 13,
    width: 280, height: 110,
  },
  arduino_nano: {
    name: 'Arduino Nano', icon: '🔵', color: '#1a4a8a',
    digitalPins: [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
    analogPins: ['A0','A1','A2','A3','A4','A5','A6','A7'],
    pwmPins: [3,5,6,9,10,11],
    i2cSDA: 'A4', i2cSCL: 'A5',
    vcc: 5, builtinLED: 13,
    width: 180, height: 60,
  },
  arduino_mega: {
    name: 'Arduino Mega', icon: '🔵', color: '#1a6a2a',
    digitalPins: Array.from({length:54},function(_,i){return i}),
    analogPins: Array.from({length:16},function(_,i){return 'A'+i}),
    pwmPins: [2,3,4,5,6,7,8,9,10,11,12,13,44,45,46],
    i2cSDA: 20, i2cSCL: 21,
    vcc: 5, builtinLED: 13,
    width: 420, height: 110,
  },
  esp32: {
    name: 'ESP32', icon: '🟣', color: '#4a1a8a',
    digitalPins: [0,1,2,3,4,5,12,13,14,15,16,17,18,19,21,22,23,25,26,27,32,33,34,35,36,39],
    analogPins: ['GPIO32','GPIO33','GPIO34','GPIO35','GPIO36','GPIO39'],
    pwmPins: [0,2,4,5,12,13,14,15,16,17,18,19,21,22,23,25,26,27,32,33],
    i2cSDA: 21, i2cSCL: 22,
    vcc: 3.3, builtinLED: 2,
    wifi: true, bluetooth: true,
    width: 260, height: 80,
  },
  esp8266: {
    name: 'ESP8266 (NodeMCU)', icon: '🟣', color: '#6a2a1a',
    digitalPins: [0,1,2,3,4,5,12,13,14,15,16],
    analogPins: ['A0'],
    pwmPins: [0,2,4,5,12,13,14,15],
    i2cSDA: 4, i2cSCL: 5,
    vcc: 3.3, builtinLED: 2,
    wifi: true,
    width: 220, height: 75,
  },
  rpi_pico: {
    name: 'Raspberry Pi Pico', icon: '🟢', color: '#2a6a1a',
    digitalPins: Array.from({length:28},function(_,i){return i}),
    analogPins: ['GP26','GP27','GP28'],
    pwmPins: Array.from({length:28},function(_,i){return i}),
    i2cSDA: 4, i2cSCL: 5,
    vcc: 3.3, builtinLED: 25,
    width: 260, height: 85,
  },
}

// ─── COMPONENT LIBRARY ────────────────────────────────────────────────────────
const COMPONENT_LIBRARY = [
  { type: 'led', label: 'LED', icon: '💡', color: '#ef4444', pins: ['anode','cathode'], desc: 'Light Emitting Diode' },
  { type: 'led_green', label: 'LED (Green)', icon: '💚', color: '#22c55e', pins: ['anode','cathode'], desc: 'Green LED' },
  { type: 'led_blue', label: 'LED (Blue)', icon: '💙', color: '#3b82f6', pins: ['anode','cathode'], desc: 'Blue LED' },
  { type: 'button', label: 'Push Button', icon: '🔘', color: '#6366f1', pins: ['pin1','pin2'], desc: 'Momentary push button' },
  { type: 'resistor', label: 'Resistor', icon: '〰️', color: '#f59e0b', pins: ['pin1','pin2'], desc: '220Ω resistor' },
  { type: 'buzzer', label: 'Buzzer', icon: '🔊', color: '#8b5cf6', pins: ['positive','negative'], desc: 'Passive buzzer' },
  { type: 'potentiometer', label: 'Potentiometer', icon: '🎛️', color: '#0ea5e9', pins: ['vcc','out','gnd'], desc: 'Variable resistor' },
  { type: 'dht22', label: 'DHT22', icon: '🌡️', color: '#22c55e', pins: ['vcc','data','gnd'], desc: 'Temp & Humidity Sensor' },
  { type: 'ultrasonic', label: 'HC-SR04', icon: '📡', color: '#0ea5e9', pins: ['vcc','trig','echo','gnd'], desc: 'Ultrasonic distance sensor' },
  { type: 'servo', label: 'Servo Motor', icon: '⚙️', color: '#f97316', pins: ['vcc','signal','gnd'], desc: 'SG90 servo motor' },
  { type: 'lcd16x2', label: 'LCD 16x2', icon: '🖥️', color: '#22c55e', pins: ['vcc','gnd','sda','scl'], desc: 'I2C LCD display' },
  { type: 'oled', label: 'OLED 0.96'', icon: '📺', color: '#6366f1', pins: ['vcc','gnd','sda','scl'], desc: 'I2C OLED display' },
  { type: 'relay', label: 'Relay', icon: '⚡', color: '#ef4444', pins: ['vcc','gnd','in'], desc: '5V relay module' },
  { type: 'pir', label: 'PIR Sensor', icon: '👁️', color: '#f59e0b', pins: ['vcc','out','gnd'], desc: 'Motion detection sensor' },
  { type: 'rgb_led', label: 'RGB LED', icon: '🌈', color: '#a855f7', pins: ['red','green','blue','gnd'], desc: 'Common cathode RGB LED' },
]

// ─── SIMULATION ENGINE ────────────────────────────────────────────────────────
class SimEngine {
  constructor() {
    this.pins = {}
    this.analogValues = {}
    this.time = 0
    this.running = false
    this.serialOutput = []
    this.intervalId = null
    this.components = []
    this.wires = []
    this.code = ''
    this.loopInterval = null
    this.setupDone = false
    this.variables = {}
    this.listeners = []
  }

  on(cb) { this.listeners.push(cb) }
  emit() { this.listeners.forEach(function(cb) { cb() }) }

  setPin(pin, value) {
    this.pins[String(pin)] = value
    this.emit()
  }

  getPin(pin) { return this.pins[String(pin)] || 0 }

  setAnalog(pin, value) {
    this.analogValues[String(pin)] = value
    this.emit()
  }

  getAnalog(pin) { return this.analogValues[String(pin)] || 0 }

  serialPrint(msg) {
    this.serialOutput = [...this.serialOutput, { text: String(msg), time: this.time }].slice(-200)
    this.emit()
  }

  millis() { return this.time }

  pressButton(compId) {
    const comp = this.components.find(function(c) { return c.id === compId })
    if (!comp) return
    const wire = this.wires.find(function(w) { return w.fromComp === compId || w.toComp === compId })
    if (wire) {
      const pin = wire.fromComp === compId ? wire.fromPin : wire.toPin
      this.setPin(pin, 1)
      setTimeout(function() { this.setPin(pin, 0); this.emit() }.bind(this), 200)
    }
    this.emit()
  }

  setPotValue(compId, value) {
    const comp = this.components.find(function(c) { return c.id === compId })
    if (comp) {
      comp.value = value
      const wire = this.wires.find(function(w) { return (w.fromComp === compId && w.fromPin === 'out') || (w.toComp === compId && w.toPin === 'out') })
      if (wire) {
        const pin = wire.fromComp === compId ? wire.toPin : wire.fromPin
        this.setAnalog(pin, Math.round(value * 1023 / 100))
      }
      this.emit()
    }
  }

  // Simplified code interpreter — runs setup() once then loop() repeatedly
  executeCode(code) {
    this.code = code
    this.serialOutput = []
    this.setupDone = false
    this.variables = {}
    this.time = 0
    if (this.loopInterval) clearInterval(this.loopInterval)

    const engine = this

    // Extract and run setup block
    const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/)
    const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/)

    if (setupMatch) {
      try { engine.runBlock(setupMatch[1]) } catch(e) { engine.serialPrint('[Setup Error] ' + e.message) }
    }

    if (loopMatch) {
      let loopCount = 0
      engine.loopInterval = setInterval(function() {
        engine.time += 100
        loopCount++
        if (loopCount > 500) { clearInterval(engine.loopInterval); return }
        try { engine.runBlock(loopMatch[1]) } catch(e) {
          engine.serialPrint('[Loop Error] ' + e.message)
          clearInterval(engine.loopInterval)
        }
      }, 100)
    }
  }

  runBlock(block) {
    const engine = this
    const lines = block.split(';').map(function(l){return l.trim()}).filter(Boolean)
    lines.forEach(function(line) {
      line = line.replace(/\/\/.*$/,'').trim()
      if (!line) return

      // digitalWrite(pin, value)
      const dw = line.match(/digitalWrite\s*\(\s*(\w+)\s*,\s*(HIGH|LOW|1|0)\s*\)/)
      if (dw) { engine.setPin(dw[1], dw[2]==='HIGH'||dw[2]==='1'?1:0); return }

      // analogWrite(pin, value)
      const aw = line.match(/analogWrite\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/)
      if (aw) { engine.setAnalog(aw[1], parseInt(aw[2])); return }

      // pinMode(pin, mode) — track but no visual effect needed
      const pm = line.match(/pinMode\s*\(\s*(\w+)\s*,\s*(INPUT|OUTPUT|INPUT_PULLUP)\s*\)/)
      if (pm) { engine.variables['_mode_'+pm[1]] = pm[2]; return }

      // Serial.begin(baud)
      if (line.match(/Serial\.begin/)) { engine.serialPrint('[Serial] Ready'); return }

      // Serial.println(value)
      const spln = line.match(/Serial\.println\s*\(\s*(.+)\s*\)/)
      if (spln) { engine.serialPrint(engine.evalExpr(spln[1]) + '\n'); return }

      // Serial.print(value)
      const sp = line.match(/Serial\.print\s*\(\s*(.+)\s*\)/)
      if (sp) { engine.serialPrint(engine.evalExpr(sp[1])); return }

      // delay(ms) — in simulation just advance time
      const dl = line.match(/delay\s*\(\s*(\d+)\s*\)/)
      if (dl) { engine.time += parseInt(dl[1]); return }

      // int/bool/float variable assignment
      const varDecl = line.match(/(?:int|bool|float|String|long|unsigned int)\s+(\w+)\s*=\s*(.+)/)
      if (varDecl) { engine.variables[varDecl[1]] = engine.evalExpr(varDecl[2]); return }

      // variable reassignment
      const varSet = line.match(/^(\w+)\s*=\s*(.+)$/)
      if (varSet && engine.variables[varSet[1]] !== undefined) {
        engine.variables[varSet[1]] = engine.evalExpr(varSet[2]); return
      }
    })
  }

  evalExpr(expr) {
    expr = expr.trim()
    // String literals
    if (expr.match(/^".*"$/)) return expr.slice(1,-1)
    // digitalRead
    const dr = expr.match(/digitalRead\s*\(\s*(\w+)\s*\)/)
    if (dr) return this.getPin(dr[1])
    // analogRead
    const ar = expr.match(/analogRead\s*\(\s*(\w+)\s*\)/)
    if (ar) return this.getAnalog(ar[1])
    // millis()
    if (expr === 'millis()') return this.time
    // HIGH/LOW
    if (expr === 'HIGH') return 1
    if (expr === 'LOW') return 0
    // Variable lookup
    if (this.variables[expr] !== undefined) return this.variables[expr]
    // Number
    if (!isNaN(expr)) return Number(expr)
    return expr
  }

  stop() {
    if (this.loopInterval) clearInterval(this.loopInterval)
    this.loopInterval = null
  }

  reset() {
    this.stop()
    this.pins = {}
    this.analogValues = {}
    this.time = 0
    this.serialOutput = []
    this.variables = {}
    this.emit()
  }
}

// ─── WIRE COLORS BY PIN TYPE ──────────────────────────────────────────────────
const WIRE_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#0ea5e9','#6366f1','#a855f7','#ec4899',
]

// ─── COMPONENT RENDERER ───────────────────────────────────────────────────────
function ComponentShape({ comp, engine, onSelect, selected, onStartWire, wiringPin }) {
  const isLED = comp.type.startsWith('led')
  const isButton = comp.type === 'button'
  const isPot = comp.type === 'potentiometer'
  const isServo = comp.type === 'servo'
  const isBuzzer = comp.type === 'buzzer'
  const isRGB = comp.type === 'rgb_led'

  // Get connected pin for this component
  function getConnectedPin(pinName) {
    const wire = engine.wires.find(function(w) {
      return (w.fromComp === comp.id && w.fromPin === pinName) ||
             (w.toComp === comp.id && w.toPin === pinName)
    })
    if (!wire) return null
    return wire.fromComp === comp.id ? wire.toPin : wire.fromPin
  }

  const ledPin = getConnectedPin('anode')
  const ledOn = ledPin !== null && (engine.getPin(ledPin) === 1 || engine.getAnalog(ledPin) > 0)
  const ledColor = comp.type === 'led' ? '#ef4444' : comp.type === 'led_green' ? '#22c55e' : '#3b82f6'

  const buzzerPin = getConnectedPin('positive')
  const buzzerOn = buzzerPin !== null && engine.getPin(buzzerPin) === 1

  const signalPin = getConnectedPin('signal')
  const servoAngle = signalPin !== null ? Math.round(engine.getAnalog(signalPin) / 1023 * 180) : 90

  const lib = COMPONENT_LIBRARY.find(function(c){ return c.type === comp.type }) || COMPONENT_LIBRARY[0]

  return (
    <div
      onClick={function(){onSelect(comp.id)}}
      className={'select-none cursor-pointer rounded-xl border-2 transition-all p-2 ' + (selected ? 'border-indigo-500 shadow-lg' : 'border-[#2e2e4e] hover:border-indigo-400')}
      style={{backgroundColor: selected ? '#0d0d2a' : '#0d0d1a', minWidth: 110}}
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="text-base">{lib.icon}</span>
        <p className="text-white text-xs font-bold truncate">{comp.label || lib.label}</p>
      </div>

      {/* LED visual */}
      {isLED && (
        <div className="flex justify-center my-1">
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
            style={{
              backgroundColor: ledOn ? ledColor : '#1a1a2e',
              borderColor: ledColor,
              boxShadow: ledOn ? '0 0 12px ' + ledColor : 'none'
            }}>
            <div className="w-3 h-3 rounded-full" style={{backgroundColor: ledOn ? '#ffffff' : ledColor + '44'}} />
          </div>
        </div>
      )}

      {/* RGB LED */}
      {isRGB && (
        <div className="flex gap-1 justify-center my-1">
          {['#ef4444','#22c55e','#3b82f6'].map(function(c,i){
            const p = getConnectedPin(['red','green','blue'][i])
            const on = p !== null && engine.getPin(p) === 1
            return <div key={i} className="w-4 h-4 rounded-full border" style={{backgroundColor: on ? c : '#1a1a2e', borderColor: c, boxShadow: on ? '0 0 6px '+c : 'none'}} />
          })}
        </div>
      )}

      {/* Button */}
      {isButton && (
        <button
          onClick={function(e){e.stopPropagation(); engine.pressButton(comp.id)}}
          className="w-full mt-1 py-1 rounded-lg text-xs font-bold transition-all active:scale-95"
          style={{backgroundColor: '#6366f1', color: 'white'}}>
          PRESS
        </button>
      )}

      {/* Potentiometer */}
      {isPot && (
        <div className="mt-1">
          <input type="range" min="0" max="100" value={comp.value||50}
            onChange={function(e){e.stopPropagation(); engine.setPotValue(comp.id, parseInt(e.target.value))}}
            onClick={function(e){e.stopPropagation()}}
            className="w-full h-1 accent-blue-500" />
          <p className="text-center text-xs text-slate-400">{comp.value||50}%</p>
        </div>
      )}

      {/* Servo angle indicator */}
      {isServo && (
        <div className="flex flex-col items-center mt-1">
          <div className="w-10 h-10 rounded-full border-2 border-orange-500 flex items-center justify-center relative">
            <div className="absolute w-4 h-0.5 bg-orange-400 origin-left"
              style={{transform: 'rotate(' + (servoAngle - 90) + 'deg)'}} />
          </div>
          <p className="text-xs text-orange-400">{servoAngle}°</p>
        </div>
      )}

      {/* Buzzer */}
      {isBuzzer && (
        <div className="flex justify-center mt-1">
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
            style={{borderColor: '#8b5cf6', backgroundColor: buzzerOn ? '#4c1d95' : '#1a1a2e'}}>
            <span className="text-sm">{buzzerOn ? '🔊' : '🔇'}</span>
          </div>
        </div>
      )}

      {/* LCD/OLED display */}
      {(comp.type === 'lcd16x2' || comp.type === 'oled') && (
        <div className="mt-1 bg-green-950 border border-green-800 rounded p-1">
          <p className="text-green-400 text-xs font-mono">Hello World!</p>
          <p className="text-green-600 text-xs font-mono">ProtoMind</p>
        </div>
      )}

      {/* Pins for wiring */}
      <div className="mt-2 flex flex-wrap gap-1">
        {lib.pins.map(function(pin) {
          const isWiring = wiringPin && wiringPin.compId === comp.id && wiringPin.pin === pin
          return (
            <button key={pin}
              onClick={function(e){e.stopPropagation(); onStartWire(comp.id, pin)}}
              className={"text-xs px-1.5 py-0.5 rounded border transition " + (isWiring ? "bg-yellow-500 border-yellow-400 text-black" : "bg-[#1a1a2e] border-[#2e2e4e] text-slate-400 hover:border-indigo-400 hover:text-white")}>
              {pin}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── MAIN SIMULATOR COMPONENT ─────────────────────────────────────────────────
function CircuitSimulator({ idea, components: protoComponents }) {
  const [boardId, setBoardId] = useState('arduino_uno')
  const [placedComponents, setPlacedComponents] = useState([])
  const [wires, setWires] = useState([])
  const [wiringPin, setWiringPin] = useState(null)
  const [selectedComp, setSelectedComp] = useState(null)
  const [running, setRunning] = useState(false)
  const [code, setCode] = useState('')
  const [activeTab, setActiveTab] = useState('canvas')
  const [, forceUpdate] = useState(0)
  const engineRef = useRef(new SimEngine())

  const engine = engineRef.current

  useEffect(function() {
    engine.on(function() { forceUpdate(function(n){return n+1}) })
    return function() { engine.stop() }
  }, [])

  // Auto-suggest components from prototype
  useEffect(function() {
    if (protoComponents && protoComponents.length > 0 && placedComponents.length === 0) {
      const suggested = []
      protoComponents.slice(0,4).forEach(function(pc, i) {
        const match = COMPONENT_LIBRARY.find(function(c) {
          return pc.name.toLowerCase().includes(c.type.replace('_',' ')) ||
                 pc.category.toLowerCase().includes(c.type.split('_')[0])
        }) || COMPONENT_LIBRARY[0]
        suggested.push({ id: 'comp_'+i, type: match.type, label: pc.name, value: 50 })
      })
      setPlacedComponents(suggested)
      engine.components = suggested
    }
  }, [protoComponents])

  // Auto-generate starter code
  useEffect(function() {
    if (protoComponents && protoComponents.length > 0 && !code) {
      const board = BOARDS[boardId]
      const lines = [
        '// ProtoMind Simulator — ' + (idea||'My Prototype'),
        '// Board: ' + board.name,
        '',
        '// Pin definitions',
        'const int LED_PIN = ' + board.builtinLED + ';',
        'const int BUTTON_PIN = 2;',
        'int ledState = LOW;',
        'unsigned long lastTime = 0;',
        '',
        'void setup() {',
        '  Serial.begin(9600);',
        '  pinMode(LED_PIN, OUTPUT);',
        '  pinMode(BUTTON_PIN, INPUT_PULLUP);',
        '  Serial.println("Setup complete!");',
        '  Serial.println("' + (idea||'ProtoMind') + ' ready");',
        '}',
        '',
        'void loop() {',
        '  if (millis() - lastTime >= 1000) {',
        '    ledState = !ledState;',
        '    digitalWrite(LED_PIN, ledState);',
        '    Serial.print("LED: ");',
        '    Serial.println(ledState ? "ON" : "OFF");',
        '    lastTime = millis();',
        '  }',
        '}',
      ]
      setCode(lines.join('\n'))
    }
  }, [protoComponents, boardId])

  function addComponent(type) {
    const id = 'comp_' + Date.now()
    const newComp = { id, type, label: COMPONENT_LIBRARY.find(function(c){return c.type===type})?.label || type, value: 50 }
    const updated = [...placedComponents, newComp]
    setPlacedComponents(updated)
    engine.components = updated
  }

  function removeComponent(id) {
    const updated = placedComponents.filter(function(c){return c.id !== id})
    setPlacedComponents(updated)
    engine.components = updated
    setWires(function(prev){
      const filtered = prev.filter(function(w){return w.fromComp!==id && w.toComp!==id})
      engine.wires = filtered
      return filtered
    })
    if (selectedComp === id) setSelectedComp(null)
  }

  function handleStartWire(compId, pin) {
    if (!wiringPin) {
      setWiringPin({ compId, pin })
      notify.info('Click another pin to connect')
    } else {
      if (wiringPin.compId === compId) { setWiringPin(null); return }
      const colorIdx = wires.length % WIRE_COLORS.length
      const newWire = {
        id: 'wire_'+Date.now(),
        fromComp: wiringPin.compId, fromPin: wiringPin.pin,
        toComp: compId, toPin: pin,
        color: WIRE_COLORS[colorIdx],
      }
      const updated = [...wires, newWire]
      setWires(updated)
      engine.wires = updated
      setWiringPin(null)
      notify.success('Wire connected!')
    }
  }

  function handleRun() {
    if (!code.trim()) { notify.warning('Add some code first'); return }
    engine.reset()
    engine.components = placedComponents
    engine.wires = wires
    engine.executeCode(code)
    setRunning(true)
    notify.success('Simulation started!')
  }

  function handleStop() {
    engine.stop()
    setRunning(false)
    notify.info('Simulation stopped')
  }

  function handleReset() {
    engine.reset()
    setRunning(false)
    notify.info('Reset!')
  }

  const board = BOARDS[boardId]
  const TABS = [{id:'canvas',label:'Circuit'},{id:'code',label:'Code'},{id:'serial',label:'Serial Monitor'}]

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <select value={boardId} onChange={function(e){setBoardId(e.target.value)}}
          className="bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500">
          {Object.entries(BOARDS).map(function([id, b]) {
            return <option key={id} value={id}>{b.icon} {b.name}</option>
          })}
        </select>
        <div className="flex gap-1 ml-auto">
          <button onClick={handleRun} disabled={running}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-xs font-bold disabled:opacity-50 transition">
            ▶ Run
          </button>
          <button onClick={handleStop} disabled={!running}
            className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-xs font-bold disabled:opacity-50 transition">
            ⏸ Pause
          </button>
          <button onClick={handleReset}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-xl text-xs font-bold transition">
            ↺ Reset
          </button>
        </div>
        {running && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-xs font-bold">RUNNING</span>
            <span className="text-slate-500 text-xs">{engine.millis()}ms</span>
          </div>
        )}
      </div>

      {/* Board info strip */}
      <div className="flex gap-3 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-2 flex-wrap">
        <span className="text-white text-xs font-bold">{board.icon} {board.name}</span>
        <span className="text-slate-500 text-xs">{board.digitalPins.length} digital pins</span>
        <span className="text-slate-500 text-xs">{board.analogPins.length} analog pins</span>
        <span className="text-slate-500 text-xs">{board.vcc}V</span>
        {board.wifi && <span className="text-blue-400 text-xs">WiFi</span>}
        {board.bluetooth && <span className="text-blue-400 text-xs">BT</span>}
        {wiringPin && <span className="text-yellow-400 text-xs ml-auto animate-pulse">Wiring: {wiringPin.compId} [{wiringPin.pin}] — click target pin</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
        {TABS.map(function(tab) {
          return (
            <button key={tab.id} onClick={function(){setActiveTab(tab.id)}}
              className={"flex-1 py-2 rounded-lg text-xs font-medium transition " + (activeTab===tab.id ? "bg-indigo-700 text-white" : "text-slate-500 hover:text-white")}>
              {tab.label}
              {tab.id === 'serial' && engine.serialOutput.length > 0 && (
                <span className="ml-1 text-xs bg-green-600 text-white rounded-full px-1">{engine.serialOutput.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* CANVAS TAB */}
      {activeTab === 'canvas' && (
        <div className="space-y-3">
          {/* Component library */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-3">
            <p className="text-slate-500 text-xs font-semibold mb-2">Add Components</p>
            <div className="flex gap-1 flex-wrap">
              {COMPONENT_LIBRARY.map(function(comp) {
                return (
                  <button key={comp.type} onClick={function(){addComponent(comp.type)}}
                    title={comp.desc}
                    className="text-xs px-2 py-1 bg-[#13131f] border border-[#2e2e4e] rounded-lg hover:border-indigo-500 transition text-slate-300">
                    {comp.icon} {comp.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Circuit canvas */}
          {placedComponents.length === 0 ? (
            <div className="text-center py-10 bg-[#0d0d1a] border border-dashed border-[#2e2e4e] rounded-xl">
              <p className="text-4xl mb-2">🔌</p>
              <p className="text-white font-semibold">Add components above to start wiring</p>
              <p className="text-slate-500 text-sm">Click a component to add it to your circuit</p>
            </div>
          ) : (
            <div className="bg-[#050510] border border-[#1e1e2e] rounded-xl p-4 min-h-64">
              {/* Board visual header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e1e2e]">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <p className="text-green-400 text-xs font-bold">{board.name}</p>
                <div className="flex gap-1 ml-2">
                  {board.digitalPins.slice(0,8).map(function(pin){
                    const isHigh = engine.getPin(pin) === 1
                    return (
                      <div key={pin} title={"D"+pin} className="w-3 h-3 rounded-full border transition"
                        style={{backgroundColor: isHigh ? '#22c55e' : '#1a1a2e', borderColor: isHigh ? '#22c55e' : '#2e2e4e'}} />
                    )
                  })}
                  <span className="text-slate-600 text-xs">digital pins</span>
                </div>
              </div>

              {/* Placed components */}
              <div className="flex flex-wrap gap-3">
                {placedComponents.map(function(comp) {
                  return (
                    <div key={comp.id} className="relative">
                      <ComponentShape
                        comp={comp}
                        engine={engine}
                        onSelect={setSelectedComp}
                        selected={selectedComp === comp.id}
                        onStartWire={handleStartWire}
                        wiringPin={wiringPin}
                      />
                      <button onClick={function(){removeComponent(comp.id)}}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-500 transition">
                        x
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Wire list */}
              {wires.length > 0 && (
                <div className="mt-3 pt-2 border-t border-[#1e1e2e]">
                  <p className="text-slate-600 text-xs mb-1">{wires.length} wire{wires.length>1?'s':''} connected</p>
                  <div className="flex flex-wrap gap-1">
                    {wires.map(function(wire) {
                      return (
                        <div key={wire.id} className="flex items-center gap-1 bg-[#0d0d1a] rounded-lg px-2 py-0.5">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: wire.color}} />
                          <span className="text-xs text-slate-400">{wire.fromPin} → {wire.toPin}</span>
                          <button onClick={function(){
                            const updated = wires.filter(function(w){return w.id!==wire.id})
                            setWires(updated); engine.wires = updated
                          }} className="text-red-600 hover:text-red-400 ml-1 text-xs">x</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CODE TAB */}
      {activeTab === 'code' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-xs">Arduino C++ — edit and run your firmware</p>
            <button onClick={handleRun}
              className="ml-auto px-4 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-xs font-bold transition">
              ▶ Run Code
            </button>
          </div>
          <textarea
            value={code}
            onChange={function(e){setCode(e.target.value)}}
            className="w-full h-80 bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-green-400 text-xs font-mono outline-none focus:border-indigo-500 resize-none"
            spellCheck={false}
            placeholder="// Write your Arduino code here..."
          />
        </div>
      )}

      {/* SERIAL MONITOR TAB */}
      {activeTab === 'serial' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-xs">Serial Monitor</p>
            <span className="text-xs text-slate-600">9600 baud</span>
            <button onClick={function(){engine.serialOutput=[]; forceUpdate(function(n){return n+1})}}
              className="ml-auto text-xs text-slate-500 hover:text-white">Clear</button>
          </div>
          <div className="bg-[#050510] border border-[#2e2e4e] rounded-xl p-4 h-64 overflow-y-auto font-mono">
            {engine.serialOutput.length === 0 ? (
              <p className="text-slate-600 text-xs">Serial output will appear here when simulation runs...</p>
            ) : (
              engine.serialOutput.map(function(line, i) {
                return (
                  <div key={i} className="flex gap-3 text-xs mb-0.5">
                    <span className="text-slate-600 w-16 shrink-0">{line.time}ms</span>
                    <span className="text-green-400">{line.text}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      <p className="text-slate-600 text-xs text-center">
        ProtoMind Simulator — simplified C++ interpreter for educational use.
        For full simulation use <a href="https://wokwi.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Wokwi</a>.
      </p>
    </div>
  )
}

export default CircuitSimulator
