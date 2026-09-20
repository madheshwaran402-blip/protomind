import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

// ─── BOARD IMAGES (SVG-based realistic renders) ───────────────────────────────
function ArduinoUnoSVG({ pins, onPinClick, highlightedPins }) {
  const pinState = pins || {}
  const highlighted = highlightedPins || []

  const digitalPins = [
    {num:13,x:456,y:28},{num:12,x:436,y:28},{num:11,x:416,y:28},
    {num:10,x:396,y:28},{num:9,x:376,y:28},{num:8,x:356,y:28},
    {num:7,x:326,y:28},{num:6,x:306,y:28},{num:5,x:286,y:28},
    {num:4,x:266,y:28},{num:3,x:246,y:28},{num:2,x:226,y:28},
    {num:1,x:206,y:28},{num:0,x:186,y:28},
  ]
  const analogPins = [
    {label:'A0',x:186,y:222},{label:'A1',x:206,y:222},
    {label:'A2',x:226,y:222},{label:'A3',x:246,y:222},
    {label:'A4',x:266,y:222},{label:'A5',x:286,y:222},
  ]
  const powerPins = [
    {label:'VIN',x:306,y:222},{label:'GND',x:326,y:222},
    {label:'GND',x:346,y:222},{label:'5V',x:366,y:222},
    {label:'3V3',x:386,y:222},{label:'RST',x:406,y:222},
  ]

  return (
    <svg viewBox="0 0 500 250" className="w-full max-w-lg">
      {/* Board */}
      <rect x="20" y="10" width="460" height="230" rx="8" fill="#1a5a2a" stroke="#2a7a3a" strokeWidth="2"/>

      {/* USB connector */}
      <rect x="22" y="80" width="28" height="40" rx="3" fill="#888" stroke="#666" strokeWidth="1"/>
      <rect x="24" y="85" width="24" height="30" rx="2" fill="#555"/>
      <rect x="26" y="90" width="20" height="20" rx="1" fill="#333"/>

      {/* Main chip (ATmega328P) */}
      <rect x="180" y="100" width="80" height="60" rx="4" fill="#111" stroke="#333" strokeWidth="1"/>
      <text x="220" y="128" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">ATmega</text>
      <text x="220" y="138" textAnchor="middle" fill="#666" fontSize="7" fontFamily="monospace">328P</text>
      {/* chip pins */}
      {[0,1,2,3,4,5,6,7].map(function(i){return(
        <rect key={"cl"+i} x="178" y={104+i*7} width="4" height="4" fill="#888" rx="0.5"/>
      )})}
      {[0,1,2,3,4,5,6,7].map(function(i){return(
        <rect key={"cr"+i} x="258" y={104+i*7} width="4" height="4" fill="#888" rx="0.5"/>
      )})}

      {/* Crystal */}
      <rect x="275" y="115" width="22" height="12" rx="2" fill="#c8a000" stroke="#a07800" strokeWidth="1"/>
      <text x="286" y="124" textAnchor="middle" fill="#332200" fontSize="5" fontFamily="monospace">16MHz</text>

      {/* Power LED */}
      <circle cx="460" cy="60" r="5" fill="#22c55e" opacity="0.9"/>
      <circle cx="460" cy="60" r="3" fill="#4ade80"/>

      {/* Pin 13 LED */}
      <circle cx="445" cy="60" r="4"
        fill={pinState['13'] === 1 ? '#fbbf24' : '#4a3a00'}
        opacity={pinState['13'] === 1 ? '1' : '0.6'}/>

      {/* Reset button */}
      <circle cx="120" cy="80" r="10" fill="#cc2222" stroke="#991111" strokeWidth="1.5"/>
      <text x="120" y="83" textAnchor="middle" fill="#fff" fontSize="5">RST</text>

      {/* Digital pins top */}
      {digitalPins.map(function(pin){
        const isHigh = pinState[String(pin.num)] === 1
        const isHL = highlighted.includes(String(pin.num))
        return(
          <g key={"d"+pin.num} onClick={function(){onPinClick && onPinClick(String(pin.num))}} style={{cursor:'pointer'}}>
            <circle cx={pin.x} cy={pin.y} r="7"
              fill={isHL ? '#f59e0b' : isHigh ? '#22c55e' : '#c0c0c0'}
              stroke={isHL ? '#f59e0b' : '#888'}
              strokeWidth={isHL ? 2 : 1}
              opacity={isHL ? 1 : 0.9}/>
            <text x={pin.x} y={pin.y+3} textAnchor="middle" fill="#000" fontSize="5" fontFamily="monospace">{pin.num}</text>
          </g>
        )
      })}

      {/* Analog pins bottom */}
      {[...analogPins, ...powerPins].map(function(pin){
        const isHigh = pinState[pin.label] === 1
        const isHL = highlighted.includes(pin.label)
        const isPwr = pin.label === '5V' || pin.label === '3V3'
        const isGND = pin.label === 'GND'
        return(
          <g key={"a"+pin.label+pin.x} onClick={function(){onPinClick && onPinClick(pin.label)}} style={{cursor:'pointer'}}>
            <circle cx={pin.x} cy={pin.y} r="7"
              fill={isHL ? '#f59e0b' : isPwr ? '#ef4444' : isGND ? '#1a1a1a' : isHigh ? '#22c55e' : '#c0c0c0'}
              stroke={isHL ? '#f59e0b' : '#888'}
              strokeWidth={isHL ? 2 : 1}/>
            <text x={pin.x} y={pin.y+3} textAnchor="middle"
              fill={isPwr||isGND ? '#fff' : '#000'} fontSize="4" fontFamily="monospace">{pin.label}</text>
          </g>
        )
      })}

      {/* Labels */}
      <text x="320" y="18" textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace">DIGITAL (PWM~)</text>
      <text x="240" y="245" textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace">ANALOG IN / POWER</text>
      <text x="220" y="155" textAnchor="middle" fill="#2a7a3a" fontSize="10" fontFamily="monospace" fontWeight="bold">Arduino</text>
      <text x="220" y="168" textAnchor="middle" fill="#2a7a3a" fontSize="8" fontFamily="monospace">Uno R3</text>
    </svg>
  )
}

function ESP32SVG({ pins, onPinClick, highlightedPins }) {
  const pinState = pins || {}
  const highlighted = highlightedPins || []

  const leftPins = [
    {label:'GND',y:50},{label:'3V3',y:65},{label:'EN',y:80},
    {label:'VP',y:95},{label:'VN',y:110},{label:'D34',y:125},
    {label:'D35',y:140},{label:'D32',y:155},{label:'D33',y:170},
    {label:'D25',y:185},{label:'D26',y:200},{label:'D27',y:215},
    {label:'D14',y:230},{label:'D12',y:245},
  ]
  const rightPins = [
    {label:'D13',y:50},{label:'D15',y:65},{label:'D2',y:80},
    {label:'D4',y:95},{label:'RX2',y:110},{label:'TX2',y:125},
    {label:'D5',y:140},{label:'D18',y:155},{label:'D19',y:170},
    {label:'D21',y:185},{label:'RX0',y:200},{label:'TX0',y:215},
    {label:'D22',y:230},{label:'D23',y:245},
  ]

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-xs">
      {/* Board */}
      <rect x="40" y="30" width="220" height="240" rx="6" fill="#2a1a5a" stroke="#4a2a8a" strokeWidth="2"/>

      {/* Antenna area */}
      <rect x="90" y="35" width="120" height="35" rx="4" fill="#3a2a6a"/>
      <rect x="105" y="38" width="90" height="28" rx="2" fill="#888" stroke="#666" strokeWidth="0.5"/>
      <text x="150" y="56" textAnchor="middle" fill="#333" fontSize="7" fontFamily="monospace">ESP32</text>

      {/* Main chip */}
      <rect x="95" y="110" width="110" height="80" rx="4" fill="#111" stroke="#333" strokeWidth="1"/>
      <text x="150" y="148" textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace">ESP32-WROOM</text>
      <text x="150" y="160" textAnchor="middle" fill="#555" fontSize="6" fontFamily="monospace">32D</text>

      {/* USB */}
      <rect x="125" y="258" width="50" height="16" rx="3" fill="#888"/>
      <rect x="130" y="261" width="40" height="10" rx="2" fill="#555"/>

      {/* LED */}
      <circle cx="75" cy="80" r="4"
        fill={pinState['D2'] === 1 ? '#3b82f6' : '#1a1a4a'}/>

      {/* Left pins */}
      {leftPins.map(function(pin){
        const isHigh = pinState[pin.label] === 1
        const isHL = highlighted.includes(pin.label)
        const isPwr = pin.label === '3V3'
        const isGND = pin.label === 'GND'
        return(
          <g key={"lp"+pin.label+pin.y} onClick={function(){onPinClick && onPinClick(pin.label)}} style={{cursor:'pointer'}}>
            <circle cx="47" cy={pin.y} r="6"
              fill={isHL ? '#f59e0b' : isPwr ? '#ef4444' : isGND ? '#222' : isHigh ? '#22c55e' : '#9ca3af'}
              stroke={isHL ? '#fbbf24' : '#666'} strokeWidth={isHL?2:1}/>
            <text x="58" y={pin.y+3} fill="#a78bfa" fontSize="5.5" fontFamily="monospace">{pin.label}</text>
          </g>
        )
      })}

      {/* Right pins */}
      {rightPins.map(function(pin){
        const isHigh = pinState[pin.label] === 1
        const isHL = highlighted.includes(pin.label)
        return(
          <g key={"rp"+pin.label+pin.y} onClick={function(){onPinClick && onPinClick(pin.label)}} style={{cursor:'pointer'}}>
            <circle cx="253" cy={pin.y} r="6"
              fill={isHL ? '#f59e0b' : isHigh ? '#22c55e' : '#9ca3af'}
              stroke={isHL ? '#fbbf24' : '#666'} strokeWidth={isHL?2:1}/>
            <text x="222" y={pin.y+3} fill="#a78bfa" fontSize="5.5" fontFamily="monospace" textAnchor="end">{pin.label}</text>
          </g>
        )
      })}

      <text x="150" y="28" textAnchor="middle" fill="#a78bfa" fontSize="8" fontFamily="monospace" fontWeight="bold">ESP32 DevKit</text>
    </svg>
  )
}

// ─── BREADBOARD COMPONENT ─────────────────────────────────────────────────────
function Breadboard({ connections, onHoleClick, activeHole }) {
  const ROWS = 30
  const COLS = 10
  const HOLE_SIZE = 8
  const HOLE_GAP = 12
  const OFFSET_X = 60
  const OFFSET_Y = 30
  const MID_GAP = 20

  function getHoleId(side, col, row) {
    return side + '-' + col + '-' + row
  }

  function getHoleColor(id) {
    const conn = connections ? connections[id] : null
    if (conn) return conn.color
    if (activeHole === id) return '#f59e0b'
    return '#1a1a2e'
  }

  const railColors = { power: '#ef4444', ground: '#1a1a2e' }

  return (
    <svg viewBox={`0 0 ${OFFSET_X*2 + COLS*HOLE_GAP + MID_GAP + 40} ${OFFSET_Y*2 + ROWS*HOLE_GAP + 40}`}
      className="w-full border border-[#2e2e4e] rounded-xl bg-[#0a0a1f]">

      {/* Board background */}
      <rect x="10" y="10"
        width={OFFSET_X*2 + COLS*HOLE_GAP + MID_GAP + 20}
        height={OFFSET_Y*2 + ROWS*HOLE_GAP + 20}
        rx="8" fill="#0f0f2a" stroke="#2e2e4e" strokeWidth="1"/>

      {/* Power rails left */}
      <rect x="18" y={OFFSET_Y-10} width="14" height={ROWS*HOLE_GAP+20} rx="3" fill="#1a0505"/>
      <rect x="34" y={OFFSET_Y-10} width="14" height={ROWS*HOLE_GAP+20} rx="3" fill="#050518"/>

      {/* Power rails right */}
      <rect x={OFFSET_X + COLS*HOLE_GAP + MID_GAP + 28} y={OFFSET_Y-10} width="14" height={ROWS*HOLE_GAP+20} rx="3" fill="#1a0505"/>
      <rect x={OFFSET_X + COLS*HOLE_GAP + MID_GAP + 44} y={OFFSET_Y-10} width="14" height={ROWS*HOLE_GAP+20} rx="3" fill="#050518"/>

      {/* Rail labels */}
      <text x="25" y={OFFSET_Y-14} textAnchor="middle" fill="#ef4444" fontSize="8">+</text>
      <text x="41" y={OFFSET_Y-14} textAnchor="middle" fill="#3b82f6" fontSize="8">-</text>

      {/* Rail holes */}
      {Array.from({length: ROWS}).map(function(_, row) {
        return [
          <circle key={"lr"+row} cx="25" cy={OFFSET_Y + row*HOLE_GAP + 4} r="3.5" fill={getHoleColor("lr-"+row)} stroke="#ef444440" strokeWidth="0.5"
            onClick={function(){onHoleClick && onHoleClick("lr-"+row)}} style={{cursor:'pointer'}}/>,
          <circle key={"lg"+row} cx="41" cy={OFFSET_Y + row*HOLE_GAP + 4} r="3.5" fill={getHoleColor("lg-"+row)} stroke="#3b82f640" strokeWidth="0.5"
            onClick={function(){onHoleClick && onHoleClick("lg-"+row)}} style={{cursor:'pointer'}}/>,
        ]
      })}

      {/* Center label */}
      <text x={(OFFSET_X + COLS*HOLE_GAP/2 + OFFSET_X/2)} y={OFFSET_Y + ROWS*HOLE_GAP/2}
        textAnchor="middle" fill="#1e1e4e" fontSize="10" fontFamily="monospace">BREADBOARD</text>

      {/* Top section holes (a-e) */}
      {Array.from({length: ROWS}).map(function(_, row) {
        return Array.from({length: COLS/2}).map(function(_, col) {
          const label = String.fromCharCode(97 + col) // a-e
          const id = getHoleId('t', col, row)
          return (
            <g key={id} onClick={function(){onHoleClick && onHoleClick(id)}} style={{cursor:'pointer'}}>
              <circle cx={OFFSET_X + col*HOLE_GAP + 4} cy={OFFSET_Y + row*HOLE_GAP + 4}
                r="3.5" fill={getHoleColor(id)} stroke="#2e2e4e" strokeWidth="0.5"/>
            </g>
          )
        })
      })}

      {/* Bottom section holes (f-j) */}
      {Array.from({length: ROWS}).map(function(_, row) {
        return Array.from({length: COLS/2}).map(function(_, col) {
          const id = getHoleId('b', col, row)
          return (
            <g key={id} onClick={function(){onHoleClick && onHoleClick(id)}} style={{cursor:'pointer'}}>
              <circle cx={OFFSET_X + col*HOLE_GAP + 4 + MID_GAP + (COLS/2)*HOLE_GAP}
                cy={OFFSET_Y + row*HOLE_GAP + 4}
                r="3.5" fill={getHoleColor(id)} stroke="#2e2e4e" strokeWidth="0.5"/>
            </g>
          )
        })
      })}

      {/* Row numbers */}
      {Array.from({length: ROWS}).map(function(_, row) {
        if (row % 5 !== 0) return null
        return (
          <text key={"rn"+row}
            x={OFFSET_X + (COLS/2)*HOLE_GAP + MID_GAP/2 + 4}
            y={OFFSET_Y + row*HOLE_GAP + 8}
            textAnchor="middle" fill="#2e2e5e" fontSize="7" fontFamily="monospace">
            {row + 1}
          </text>
        )
      })}
    </svg>
  )
}

// ─── COMPONENT PANEL ──────────────────────────────────────────────────────────
const SIM_COMPONENTS = [
  { type:'led_red', label:'LED Red', icon:'🔴', color:'#ef4444', pins:['A','K'] },
  { type:'led_green', label:'LED Green', icon:'🟢', color:'#22c55e', pins:['A','K'] },
  { type:'led_blue', label:'LED Blue', icon:'🔵', color:'#3b82f6', pins:['A','K'] },
  { type:'led_yellow', label:'LED Yellow', icon:'🟡', color:'#eab308', pins:['A','K'] },
  { type:'resistor', label:'Resistor 220Ω', icon:'〰️', color:'#f59e0b', pins:['1','2'] },
  { type:'resistor_1k', label:'Resistor 1kΩ', icon:'〰️', color:'#a78bfa', pins:['1','2'] },
  { type:'button', label:'Push Button', icon:'🔘', color:'#6366f1', pins:['1','2'] },
  { type:'buzzer', label:'Buzzer', icon:'🔊', color:'#8b5cf6', pins:['+','-'] },
  { type:'potentiometer', label:'Potentiometer', icon:'🎛️', color:'#0ea5e9', pins:['VCC','OUT','GND'] },
  { type:'dht22', label:'DHT22', icon:'🌡️', color:'#22c55e', pins:['VCC','DATA','GND'] },
  { type:'hcsr04', label:'HC-SR04', icon:'📡', color:'#0ea5e9', pins:['VCC','TRIG','ECHO','GND'] },
  { type:'servo', label:'Servo SG90', icon:'⚙️', color:'#f97316', pins:['VCC','SIG','GND'] },
  { type:'oled', label:'OLED 128x64', icon:'🖥️', color:'#6366f1', pins:['VCC','GND','SDA','SCL'] },
  { type:'relay', label:'Relay 5V', icon:'⚡', color:'#ef4444', pins:['VCC','GND','IN'] },
  { type:'pir', label:'PIR Sensor', icon:'👁️', color:'#f59e0b', pins:['VCC','OUT','GND'] },
  { type:'lcd', label:'LCD 16x2 I2C', icon:'📟', color:'#22c55e', pins:['VCC','GND','SDA','SCL'] },
  { type:'neopixel', label:'NeoPixel', icon:'🌈', color:'#a855f7', pins:['VCC','DIN','GND'] },
  { type:'mq135', label:'MQ-135 Gas', icon:'💨', color:'#64748b', pins:['VCC','GND','AO','DO'] },
]

// ─── PLACED COMPONENT VISUAL ──────────────────────────────────────────────────
function PlacedComponent({ comp, engine, onSelect, selected, onRemove, onWirePin, wiringFrom }) {
  const def = SIM_COMPONENTS.find(function(c){return c.type===comp.type}) || SIM_COMPONENTS[0]
  const isLED = comp.type.startsWith('led')
  const isButton = comp.type === 'button'
  const isPot = comp.type === 'potentiometer'
  const isServo = comp.type === 'servo'
  const isBuzzer = comp.type === 'buzzer'
  const isDisplay = comp.type === 'oled' || comp.type === 'lcd'

  function getPinState(pinName) {
    if (!engine) return 0
    const wire = (engine.wires||[]).find(function(w){
      return (w.fromComp===comp.id && w.fromPin===pinName) ||
             (w.toComp===comp.id && w.toPin===pinName)
    })
    if (!wire) return 0
    const boardPin = wire.fromComp===comp.id ? wire.toPin : wire.fromPin
    return engine.getPin ? engine.getPin(boardPin) : 0
  }

  const ledOn = isLED && getPinState('A') === 1
  const buzzerOn = isBuzzer && getPinState('+') === 1
  const servoAngle = isServo ? Math.round((engine?.getAnalog?.(comp.signalPin)||0) / 1023 * 180) : 90

  return (
    <div className={"relative rounded-xl border-2 transition-all select-none " + (selected ? 'border-indigo-500 shadow-lg shadow-indigo-900/50' : 'border-[#2e2e4e] hover:border-indigo-400')}
      style={{backgroundColor: selected ? '#0a0a28' : '#0a0a18', minWidth: 100}}
      onClick={function(){onSelect(comp.id)}}>

      {/* Remove button */}
      <button onClick={function(e){e.stopPropagation();onRemove(comp.id)}}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center z-10 transition">
        ×
      </button>

      <div className="p-2">
        <p className="text-white text-xs font-bold mb-1 truncate">{comp.label}</p>

        {/* LED */}
        {isLED && (
          <div className="flex justify-center my-1">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-100"
              style={{
                backgroundColor: ledOn ? def.color : '#0a0a1a',
                borderColor: def.color,
                boxShadow: ledOn ? `0 0 15px ${def.color}, 0 0 30px ${def.color}40` : 'none'
              }}>
              <div className="w-4 h-4 rounded-full opacity-80"
                style={{backgroundColor: ledOn ? '#ffffff' : def.color+'30'}}/>
            </div>
          </div>
        )}

        {/* Button */}
        {isButton && (
          <button
            onClick={function(e){e.stopPropagation(); if(engine?.pressButton) engine.pressButton(comp.id)}}
            className="w-full mt-1 py-1.5 rounded-lg text-xs font-bold bg-indigo-700 hover:bg-indigo-600 active:scale-95 transition text-white">
            PRESS
          </button>
        )}

        {/* Potentiometer */}
        {isPot && (
          <div className="mt-1" onClick={function(e){e.stopPropagation()}}>
            <input type="range" min="0" max="100" value={comp.potValue||50}
              onChange={function(e){if(engine?.setPotValue) engine.setPotValue(comp.id, parseInt(e.target.value))}}
              className="w-full h-1.5 accent-blue-500"/>
            <p className="text-center text-slate-400 text-xs">{comp.potValue||50}%  ≈ {Math.round((comp.potValue||50)*10.23)} raw</p>
          </div>
        )}

        {/* Servo */}
        {isServo && (
          <div className="flex flex-col items-center my-1">
            <div className="w-12 h-12 rounded-full border-2 border-orange-500 relative flex items-center justify-center bg-[#0a0a18]">
              <div className="absolute w-5 h-0.5 bg-orange-400 rounded-full origin-left transition-transform duration-200"
                style={{transform: `rotate(${servoAngle - 90}deg)`, left: '50%', top: '50%', marginTop: '-1px'}}/>
              <div className="w-2 h-2 rounded-full bg-orange-500"/>
            </div>
            <p className="text-orange-400 text-xs mt-0.5">{servoAngle}°</p>
          </div>
        )}

        {/* Buzzer */}
        {isBuzzer && (
          <div className="flex justify-center my-1">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
              style={{borderColor:'#8b5cf6', backgroundColor: buzzerOn ? '#3b1d8a' : '#0a0a18'}}>
              <span className="text-lg">{buzzerOn ? '🔊' : '🔇'}</span>
            </div>
          </div>
        )}

        {/* Display */}
        {isDisplay && (
          <div className="mt-1 bg-green-950 border border-green-800 rounded p-1 font-mono">
            <p className="text-green-400 text-xs">Hello World!</p>
            <p className="text-green-600 text-xs">ProtoMind</p>
          </div>
        )}

        {/* NeoPixel */}
        {comp.type === 'neopixel' && (
          <div className="flex gap-1 justify-center my-1">
            {['#ef4444','#22c55e','#3b82f6','#f59e0b'].map(function(c,i){
              return <div key={i} className="w-4 h-4 rounded-sm animate-pulse" style={{backgroundColor:c, animationDelay:i*0.2+'s'}}/>
            })}
          </div>
        )}

        {/* Pins */}
        <div className="mt-1.5 flex flex-wrap gap-0.5">
          {def.pins.map(function(pin){
            const isWiring = wiringFrom && wiringFrom.compId === comp.id && wiringFrom.pin === pin
            return(
              <button key={pin}
                onClick={function(e){e.stopPropagation(); onWirePin && onWirePin(comp.id, pin)}}
                className={"text-xs px-1.5 py-0.5 rounded border transition font-mono " + (
                  isWiring
                    ? 'bg-yellow-500 border-yellow-400 text-black font-bold'
                    : 'bg-[#1a1a2e] border-[#2e2e4e] text-slate-400 hover:border-indigo-400 hover:text-white'
                )}>
                {pin}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN SIMULATOR PAGE ──────────────────────────────────────────────────────

function ArduinoNanoSVG({ pins, onPinClick, highlightedPins }) {
  const pinState = pins || {}
  const highlighted = highlightedPins || []

  const rightPins = [
    {label:'D13',y:55},{label:'3V3',y:70},{label:'REF',y:85},
    {label:'A0',y:100},{label:'A1',y:115},{label:'A2',y:130},
    {label:'A3',y:145},{label:'A4',y:160},{label:'A5',y:175},
    {label:'A6',y:190},{label:'A7',y:205},{label:'5V',y:220},
    {label:'RST',y:235},{label:'GND',y:250},{label:'VIN',y:265},
  ]
  const leftPins = [
    {label:'D12',y:55},{label:'D11',y:70},{label:'D10',y:85},
    {label:'D9',y:100},{label:'D8',y:115},{label:'D7',y:130},
    {label:'D6',y:145},{label:'D5',y:160},{label:'D4',y:175},
    {label:'D3',y:190},{label:'D2',y:205},{label:'GND',y:220},
    {label:'RST',y:235},{label:'RX0',y:250},{label:'TX0',y:265},
  ]

  return (
    <svg viewBox="0 0 220 310" className="w-full max-w-xs">
      <rect x="30" y="35" width="160" height="260" rx="5" fill="#1a4a8a" stroke="#2a6ab0" strokeWidth="1.5"/>
      <rect x="60" y="40" width="100" height="22" rx="3" fill="#888"/>
      <rect x="65" y="43" width="90" height="16" rx="2" fill="#555"/>
      <text x="110" y="55" textAnchor="middle" fill="#ccc" fontSize="8" fontFamily="monospace">Mini-USB</text>
      <rect x="75" y="120" width="70" height="50" rx="3" fill="#111" stroke="#333" strokeWidth="1"/>
      <text x="110" y="143" textAnchor="middle" fill="#555" fontSize="6" fontFamily="monospace">ATmega</text>
      <text x="110" y="153" textAnchor="middle" fill="#555" fontSize="6" fontFamily="monospace">328P</text>
      <circle cx="175" cy="75" r="4" fill={pinState['D13']===1?'#fbbf24':'#3a2a00'} opacity="0.9"/>
      <circle cx="165" cy="75" r="3" fill="#22c55e" opacity="0.9"/>
      {rightPins.map(function(pin){
        const isHigh=pinState[pin.label]===1
        const isHL=highlighted.includes(pin.label)
        const isPwr=pin.label==='5V'||pin.label==='3V3'||pin.label==='VIN'
        const isGND=pin.label==='GND'
        return(
          <g key={"r"+pin.label+pin.y} onClick={function(){onPinClick&&onPinClick(pin.label)}} style={{cursor:'pointer'}}>
            <circle cx="185" cy={pin.y} r="5" fill={isHL?'#f59e0b':isPwr?'#ef4444':isGND?'#222':isHigh?'#22c55e':'#9ca3af'} stroke={isHL?'#fbbf24':'#555'} strokeWidth={isHL?2:0.5}/>
            <text x="178" y={pin.y+3} fill="#93c5fd" fontSize="5" fontFamily="monospace" textAnchor="end">{pin.label}</text>
          </g>
        )
      })}
      {leftPins.map(function(pin){
        const isHigh=pinState[pin.label]===1
        const isHL=highlighted.includes(pin.label)
        const isGND=pin.label==='GND'
        return(
          <g key={"l"+pin.label+pin.y} onClick={function(){onPinClick&&onPinClick(pin.label)}} style={{cursor:'pointer'}}>
            <circle cx="35" cy={pin.y} r="5" fill={isHL?'#f59e0b':isGND?'#222':isHigh?'#22c55e':'#9ca3af'} stroke={isHL?'#fbbf24':'#555'} strokeWidth={isHL?2:0.5}/>
            <text x="43" y={pin.y+3} fill="#93c5fd" fontSize="5" fontFamily="monospace">{pin.label}</text>
          </g>
        )
      })}
      <text x="110" y="30" textAnchor="middle" fill="#93c5fd" fontSize="9" fontFamily="monospace" fontWeight="bold">Arduino Nano</text>
    </svg>
  )
}


function PiPicoSVG({ pins, onPinClick, highlightedPins }) {
  const pinState = pins || {}
  const highlighted = highlightedPins || []

  const leftPins = [
    {label:'GP0',y:50},{label:'GP1',y:65},{label:'GND',y:80},
    {label:'GP2',y:95},{label:'GP3',y:110},{label:'GP4',y:125},
    {label:'GP5',y:140},{label:'GND',y:155},{label:'GP6',y:170},
    {label:'GP7',y:185},{label:'GP8',y:200},{label:'GP9',y:215},
    {label:'GND',y:230},{label:'GP10',y:245},{label:'GP11',y:260},
    {label:'GP12',y:275},{label:'GP13',y:290},{label:'GND',y:305},
    {label:'GP14',y:320},{label:'GP15',y:335},
  ]
  const rightPins = [
    {label:'VBUS',y:50},{label:'VSYS',y:65},{label:'GND',y:80},
    {label:'3V3_EN',y:95},{label:'3V3',y:110},{label:'ADC_VREF',y:125},
    {label:'GP28',y:140},{label:'AGND',y:155},{label:'GP27',y:170},
    {label:'GP26',y:185},{label:'RUN',y:200},{label:'GP22',y:215},
    {label:'GND',y:230},{label:'GP21',y:245},{label:'GP20',y:260},
    {label:'GP19',y:275},{label:'GP18',y:290},{label:'GND',y:305},
    {label:'GP17',y:320},{label:'GP16',y:335},
  ]

  return (
    <svg viewBox="0 0 280 380" className="w-full max-w-xs">
      <rect x="40" y="35" width="200" height="320" rx="6" fill="#2a6a1a" stroke="#3a8a2a" strokeWidth="1.5"/>
      <rect x="90" y="40" width="100" height="18" rx="3" fill="#888"/>
      <rect x="95" y="43" width="90" height="12" rx="2" fill="#555"/>
      <text x="140" y="53" textAnchor="middle" fill="#ccc" fontSize="6" fontFamily="monospace">Micro-USB</text>
      <rect x="85" y="150" width="110" height="70" rx="4" fill="#111" stroke="#333" strokeWidth="1"/>
      <text x="140" y="178" textAnchor="middle" fill="#4ade80" fontSize="7" fontFamily="monospace">Raspberry Pi</text>
      <text x="140" y="190" textAnchor="middle" fill="#4ade80" fontSize="7" fontFamily="monospace">Pico</text>
      <text x="140" y="202" textAnchor="middle" fill="#555" fontSize="5" fontFamily="monospace">RP2040</text>
      <circle cx="175" cy="120" r="4" fill={pinState['GP25']===1?'#22c55e':'#0a2a0a'} opacity="0.9"/>
      {leftPins.map(function(pin){
        const isHigh=pinState[pin.label]===1
        const isHL=highlighted.includes(pin.label)
        const isGND=pin.label==='GND'||pin.label==='AGND'
        const isPwr=pin.label==='VBUS'||pin.label==='VSYS'||pin.label==='3V3'
        return(
          <g key={"l"+pin.label+pin.y} onClick={function(){onPinClick&&onPinClick(pin.label)}} style={{cursor:'pointer'}}>
            <circle cx="47" cy={pin.y} r="5" fill={isHL?'#f59e0b':isPwr?'#ef4444':isGND?'#111':isHigh?'#22c55e':'#9ca3af'} stroke={isHL?'#fbbf24':'#555'} strokeWidth={isHL?2:0.5}/>
            <text x="56" y={pin.y+3} fill="#4ade80" fontSize="5" fontFamily="monospace">{pin.label}</text>
          </g>
        )
      })}
      {rightPins.map(function(pin){
        const isHigh=pinState[pin.label]===1
        const isHL=highlighted.includes(pin.label)
        const isGND=pin.label==='GND'||pin.label==='AGND'
        const isPwr=pin.label==='VBUS'||pin.label==='VSYS'||pin.label==='3V3'
        return(
          <g key={"r"+pin.label+pin.y} onClick={function(){onPinClick&&onPinClick(pin.label)}} style={{cursor:'pointer'}}>
            <circle cx="233" cy={pin.y} r="5" fill={isHL?'#f59e0b':isPwr?'#ef4444':isGND?'#111':isHigh?'#22c55e':'#9ca3af'} stroke={isHL?'#fbbf24':'#555'} strokeWidth={isHL?2:0.5}/>
            <text x="225" y={pin.y+3} fill="#4ade80" fontSize="5" fontFamily="monospace" textAnchor="end">{pin.label}</text>
          </g>
        )
      })}
      <text x="140" y="30" textAnchor="middle" fill="#4ade80" fontSize="9" fontFamily="monospace" fontWeight="bold">Raspberry Pi Pico</text>
    </svg>
  )
}

const BOARD_OPTIONS = [
  { id:'uno', name:'Arduino Uno', icon:'🔵' },
  { id:'nano', name:'Arduino Nano', icon:'🔵' },
  { id:'pico', name:'Raspberry Pi Pico', icon:'🟢' },
  { id:'esp32', name:'ESP32', icon:'🟣' },
  { id:'mega', name:'Arduino Mega', icon:'🔵' },
]

function Simulator() {
  const navigate = useNavigate()
  const [boardId, setBoardId] = useState('uno')
  const [placed, setPlaced] = useState([])
  const [wires, setWires] = useState([])
  const [wiringFrom, setWiringFrom] = useState(null)
  const [selected, setSelected] = useState(null)
  const [running, setRunning] = useState(false)
  const [pinStates, setPinStates] = useState({})
  const [analogStates, setAnalogStates] = useState({})
  const [serialLog, setSerialLog] = useState([])
  const [code, setCode] = useState('')
  const [simTime, setSimTime] = useState(0)
  const [activeTab, setActiveTab] = useState('circuit')
  const [activePanel, setActivePanel] = useState('serial')
  const [highlightedPins, setHighlightedPins] = useState([])
  const loopRef = useRef()
  const timeRef = useRef(0)
  const [, forceUpdate] = useState(0)

  // Load code from IDE if navigated from there
  useEffect(function(){
    const savedCode = localStorage.getItem('ide_code')
    if (savedCode) setCode(savedCode)
  }, [])

  function addSerial(text, type) {
    setSerialLog(function(prev){
      return [...prev, {text, type:'rx', time: timeRef.current}].slice(-500)
    })
  }

  // Simple engine object passed to components
  const engine = {
    wires,
    getPin: function(pin){ return pinStates[String(pin)] || 0 },
    getAnalog: function(pin){ return analogStates[String(pin)] || 0 },
    pressButton: function(compId){
      const wire = wires.find(function(w){return w.fromComp===compId||w.toComp===compId})
      if(wire){
        const pin = wire.fromComp===compId ? wire.toPin : wire.fromPin
        setPinStates(function(p){return Object.assign({},p,{[pin]:1})})
        setTimeout(function(){setPinStates(function(p){return Object.assign({},p,{[pin]:0})})},200)
      }
    },
    setPotValue: function(compId, val){
      setPlaced(function(prev){
        return prev.map(function(c){return c.id===compId?Object.assign({},c,{potValue:val}):c})
      })
      const wire = wires.find(function(w){
        return (w.fromComp===compId&&w.fromPin==='OUT')||(w.toComp===compId&&w.toPin==='OUT')
      })
      if(wire){
        const pin = wire.fromComp===compId?wire.toPin:wire.fromPin
        setAnalogStates(function(p){return Object.assign({},p,{[pin]:Math.round(val*10.23)})})
      }
    }
  }

  function handleAddComponent(type){
    const def = SIM_COMPONENTS.find(function(c){return c.type===type})
    const id = 'c_'+Date.now()
    setPlaced(function(prev){return [...prev, {id, type, label:def.label, potValue:50}]})
    notify.info(def.label + ' added')
  }

  function handleRemoveComponent(id){
    setPlaced(function(prev){return prev.filter(function(c){return c.id!==id})})
    setWires(function(prev){return prev.filter(function(w){return w.fromComp!==id&&w.toComp!==id})})
    if(selected===id) setSelected(null)
  }

  function handleWirePin(compId, pin){
    if(!wiringFrom){
      setWiringFrom({compId,pin})
      notify.info('Now click a board pin or another component pin to connect')
    } else {
      if(wiringFrom.compId===compId && wiringFrom.pin===pin){ setWiringFrom(null); return }
      const WIRE_COLORS = ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#ec4899','#14b8a6']
      const newWire = {
        id:'w_'+Date.now(),
        fromComp:wiringFrom.compId, fromPin:wiringFrom.pin,
        toComp:compId, toPin:pin,
        color:WIRE_COLORS[wires.length%WIRE_COLORS.length]
      }
      setWires(function(prev){return [...prev,newWire]})
      setWiringFrom(null)
      notify.success('Wire connected: '+wiringFrom.pin+' → '+pin)
    }
  }

  function handleBoardPinClick(pin){
    if(wiringFrom){
      // Connect from component pin to board pin
      const WIRE_COLORS = ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#ec4899']
      const newWire = {
        id:'w_'+Date.now(),
        fromComp:wiringFrom.compId, fromPin:wiringFrom.pin,
        toComp:'board', toPin:pin,
        color:WIRE_COLORS[wires.length%WIRE_COLORS.length]
      }
      setWires(function(prev){return [...prev,newWire]})
      setWiringFrom(null)
      notify.success('Connected to board pin '+pin)
    } else {
      // Highlight connected components
      const connected = wires.filter(function(w){return w.toPin===pin||w.fromPin===pin})
      setHighlightedPins(connected.map(function(w){return w.toPin===pin?w.fromPin:w.toPin}))
      setTimeout(function(){setHighlightedPins([])},2000)
    }
  }

  // Run simulation
  function runSimulation(codeToRun){
    if(loopRef.current) clearInterval(loopRef.current)
    timeRef.current = 0
    setSerialLog([])

    const lines = (codeToRun||code).split(';').map(function(l){return l.trim()}).filter(Boolean)

    // Extract setup block
    const setupMatch = (codeToRun||code).match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/)
    const loopMatch = (codeToRun||code).match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/)

    const vars = {}

    function evalExpr(expr){
      expr = expr.trim()
      if(expr==='HIGH'||expr==='1') return 1
      if(expr==='LOW'||expr==='0') return 0
      if(expr.match(/^".*"$/)) return expr.slice(1,-1)
      if(vars[expr]!==undefined) return vars[expr]
      if(!isNaN(expr)) return Number(expr)
      return expr
    }

    function runBlock(block){
      const stmts = block.split(';').map(function(s){return s.trim()}).filter(Boolean)
      stmts.forEach(function(stmt){
        stmt = stmt.replace(/\/\/.*$/,'').trim()
        if(!stmt) return

        const dw = stmt.match(/digitalWrite\s*\(\s*(\w+)\s*,\s*(HIGH|LOW|1|0)\s*\)/)
        if(dw){
          const pin = dw[1]; const val = dw[2]==='HIGH'||dw[2]==='1'?1:0
          setPinStates(function(p){return Object.assign({},p,{[pin]:val})})
          return
        }

        const aw = stmt.match(/analogWrite\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/)
        if(aw){ setAnalogStates(function(p){return Object.assign({},p,{[aw[1]]:parseInt(aw[2])})}); return }

        const spln = stmt.match(/Serial\.println\s*\(\s*(.+)\s*\)/)
        if(spln){ addSerial(String(evalExpr(spln[1]))); return }

        const sp = stmt.match(/Serial\.print\s*\(\s*(.+)\s*\)/)
        if(sp){ addSerial(String(evalExpr(sp[1]))); return }

        const vd = stmt.match(/(?:int|bool|float|long)\s+(\w+)\s*=\s*(.+)/)
        if(vd){ vars[vd[1]] = evalExpr(vd[2]); return }

        const va = stmt.match(/^(\w+)\s*([+\-]?=)\s*(.+)$/)
        if(va && vars[va[1]]!==undefined){
          if(va[2]==='=') vars[va[1]] = evalExpr(va[3])
          else if(va[2]==='+=') vars[va[1]] = (vars[va[1]]||0) + Number(evalExpr(va[3]))
          else if(va[2]==='-=') vars[va[1]] = (vars[va[1]]||0) - Number(evalExpr(va[3]))
          return
        }

        const neg = stmt.match(/^(\w+)\s*=\s*!\s*(\w+)$/)
        if(neg){ vars[neg[1]] = vars[neg[2]] ? 0 : 1; setPinStates(function(p){return Object.assign({},p,{[neg[1]]:vars[neg[1]]})}); return }
      })
    }

    if(setupMatch){
      try { runBlock(setupMatch[1]) } catch(e){ addSerial('[Setup Error] '+e.message) }
    }

    if(loopMatch){
      let count = 0
      loopRef.current = setInterval(function(){
        timeRef.current += 100
        setSimTime(function(t){return t+100})
        count++
        if(count > 300) return
        try { runBlock(loopMatch[1]) } catch(e){
          addSerial('[Loop Error] '+e.message)
          clearInterval(loopRef.current)
        }
      }, 120)
    }
  }

  function handleRun(){
    setRunning(true)
    runSimulation()
    notify.success('Simulation started!')
  }

  function handleStop(){
    if(loopRef.current) clearInterval(loopRef.current)
    setRunning(false)
    notify.info('Simulation stopped')
  }

  function handleReset(){
    if(loopRef.current) clearInterval(loopRef.current)
    setRunning(false)
    setPinStates({})
    setAnalogStates({})
    setSerialLog([])
    setSimTime(0)
    timeRef.current = 0
    notify.info('Reset!')
  }

  function handleClearAll(){
    handleReset()
    setPlaced([])
    setWires([])
    setSelected(null)
  }

  const TABS = [{id:'circuit',label:'Circuit'},{id:'code',label:'Code'},{id:'serial',label:'Serial'}]

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0d0d1a] border-b border-[#1e1e2e] flex-shrink-0">
        <button onClick={function(){navigate('/')}} className="text-indigo-400 font-black text-sm hover:opacity-80">
          ProtoMind
        </button>
        <span className="text-slate-600 text-xs">Simulator</span>

        <div className="w-px h-5 bg-[#2e2e4e]"/>

        <select value={boardId} onChange={function(e){setBoardId(e.target.value)}}
          className="bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500">
          {BOARD_OPTIONS.map(function(b){return <option key={b.id} value={b.id}>{b.icon} {b.name}</option>})}
        </select>

        <div className="flex-1"/>

        <div className="flex items-center gap-1.5">
          <button onClick={handleRun} disabled={running}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-xs font-bold disabled:opacity-50 transition">
            ▶ Run
          </button>
          <button onClick={handleStop} disabled={!running}
            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-700 hover:bg-yellow-600 rounded-lg text-xs font-bold disabled:opacity-50 transition">
            ⏸ Stop
          </button>
          <button onClick={handleReset}
            className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-lg text-xs transition">
            ↺ Reset
          </button>
          <button onClick={handleClearAll}
            className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg text-xs transition">
            Clear All
          </button>
        </div>

        {running && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-green-400 text-xs font-bold">RUNNING</span>
            <span className="text-slate-500 text-xs">{(simTime/1000).toFixed(1)}s</span>
          </div>
        )}

        <button onClick={function(){navigate('/ide')}}
          className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-300 rounded-lg text-xs transition">
          💻 IDE
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Component library */}
        <div className="w-44 bg-[#080815] border-r border-[#1e1e2e] overflow-y-auto flex-shrink-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide px-3 py-2 border-b border-[#1e1e2e]">Components</p>
          {SIM_COMPONENTS.map(function(comp){
            return(
              <button key={comp.type} onClick={function(){handleAddComponent(comp.type)}}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#13131f] text-left transition border-b border-[#0d0d1a]">
                <span className="text-base">{comp.icon}</span>
                <span className="text-xs text-slate-300">{comp.label}</span>
              </button>
            )
          })}
        </div>

        {/* Center: Board + Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-0 bg-[#080815] border-b border-[#1e1e2e] flex-shrink-0">
            {TABS.map(function(tab){
              return(
                <button key={tab.id} onClick={function(){setActiveTab(tab.id)}}
                  className={"px-4 py-2 text-xs border-r border-[#1e1e2e] transition " + (
                    activeTab===tab.id?'bg-[#0d0d1a] text-white border-t-2 border-t-cyan-500 -mt-px':'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
            {wiringFrom && (
              <div className="flex items-center px-4 text-yellow-400 text-xs animate-pulse">
                Wiring: {wiringFrom.pin} — click board pin to connect
                <button onClick={function(){setWiringFrom(null)}} className="ml-2 text-slate-500 hover:text-white">Cancel</button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab==='circuit' && (
              <div className="space-y-4">
                {/* Board */}
                <div className="bg-[#0a0a18] border border-[#1e1e2e] rounded-2xl p-4">
                  <p className="text-xs text-slate-500 mb-3">
                    Click board pins to connect • Click component pins to start wiring
                  </p>
                  {boardId==='esp32'
                    ? <ESP32SVG pins={pinStates} onPinClick={handleBoardPinClick} highlightedPins={highlightedPins}/>
                    : boardId==='nano'
                    ? <ArduinoNanoSVG pins={pinStates} onPinClick={handleBoardPinClick} highlightedPins={highlightedPins}/>
                    : boardId==='pico'
                    ? <PiPicoSVG pins={pinStates} onPinClick={handleBoardPinClick} highlightedPins={highlightedPins}/>
                    : <ArduinoUnoSVG pins={pinStates} onPinClick={handleBoardPinClick} highlightedPins={highlightedPins}/>
                  }
                </div>

                {/* Wires list */}
                {wires.length > 0 && (
                  <div className="bg-[#0a0a18] border border-[#1e1e2e] rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-2">{wires.length} wire{wires.length>1?'s':''} connected</p>
                    <div className="flex flex-wrap gap-1">
                      {wires.map(function(w){
                        const fromComp = placed.find(function(c){return c.id===w.fromComp})
                        const label = (fromComp?.label||'Board') + ' ['+w.fromPin+'] → ['+w.toPin+']' + (w.toComp==='board'?' (Board)':'')
                        return(
                          <div key={w.id} className="flex items-center gap-1 bg-[#13131f] rounded-lg px-2 py-0.5 text-xs">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor:w.color}}/>
                            <span className="text-slate-400">{label}</span>
                            <button onClick={function(){setWires(function(prev){return prev.filter(function(x){return x.id!==w.id})})}}
                              className="text-red-600 hover:text-red-400 ml-1">×</button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Placed components */}
                {placed.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#2e2e4e] rounded-2xl">
                    <p className="text-4xl mb-2">🔌</p>
                    <p className="text-slate-500 text-sm">Click components on the left to add them</p>
                    <p className="text-slate-600 text-xs mt-1">Then click pins to wire them to the board</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {placed.map(function(comp){
                      return(
                        <PlacedComponent key={comp.id}
                          comp={comp}
                          engine={engine}
                          onSelect={setSelected}
                          selected={selected===comp.id}
                          onRemove={handleRemoveComponent}
                          onWirePin={handleWirePin}
                          wiringFrom={wiringFrom}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab==='code' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-sm">Paste Arduino code to simulate</p>
                  <button onClick={function(){const s=localStorage.getItem('ide_code');if(s)setCode(s);notify.info('Loaded from IDE')}}
                    className="ml-auto px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition">
                    Load from IDE
                  </button>
                  <button onClick={function(){runSimulation(code);setRunning(true)}}
                    className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition">
                    ▶ Run
                  </button>
                </div>
                <textarea value={code} onChange={function(e){setCode(e.target.value)}}
                  className="w-full h-96 bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-green-400 text-xs font-mono outline-none focus:border-indigo-500 resize-none"
                  placeholder="void setup() {&#10;  Serial.begin(9600);&#10;  pinMode(13, OUTPUT);&#10;}&#10;&#10;void loop() {&#10;  digitalWrite(13, HIGH);&#10;  delay(1000);&#10;  digitalWrite(13, LOW);&#10;  delay(1000);&#10;}"/>
              </div>
            )}

            {activeTab==='serial' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-sm">Serial Monitor</p>
                  <button onClick={function(){setSerialLog([])}}
                    className="ml-auto px-3 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs transition">Clear</button>
                </div>
                <div className="h-80 bg-[#050510] border border-[#2e2e4e] rounded-xl p-4 overflow-y-auto font-mono">
                  {serialLog.length===0
                    ? <p className="text-slate-600 text-xs">Run simulation to see Serial output...</p>
                    : serialLog.map(function(l,i){
                        return(
                          <div key={i} className="flex gap-3 text-xs mb-0.5">
                            <span className="text-slate-600 w-16 shrink-0">{l.time}ms</span>
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
    </div>
  )
}

export default Simulator
