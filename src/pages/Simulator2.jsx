import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

// ─── SVG BOARD DEFINITIONS ────────────────────────────────────────────────────
function ArduinoUnoBoard({ pinStates, onPinClick, highlightedPins }) {
  const pins = pinStates || {}
  const hl = highlightedPins || []
  const digital = [
    {n:'13',x:456,y:28},{n:'12',x:436,y:28},{n:'11~',x:416,y:28},
    {n:'10~',x:396,y:28},{n:'9~',x:376,y:28},{n:'8',x:356,y:28},
    {n:'7',x:326,y:28},{n:'6~',x:306,y:28},{n:'5~',x:286,y:28},
    {n:'4',x:266,y:28},{n:'3~',x:246,y:28},{n:'2',x:226,y:28},
    {n:'TX',x:206,y:28},{n:'RX',x:186,y:28},
  ]
  const bottom = [
    {n:'A0',x:186,y:220,type:'analog'},{n:'A1',x:206,y:220,type:'analog'},
    {n:'A2',x:226,y:220,type:'analog'},{n:'A3',x:246,y:220,type:'analog'},
    {n:'A4',x:266,y:220,type:'analog'},{n:'A5',x:286,y:220,type:'analog'},
    {n:'VIN',x:306,y:220,type:'pwr'},{n:'GND',x:326,y:220,type:'gnd'},
    {n:'GND',x:346,y:220,type:'gnd'},{n:'5V',x:366,y:220,type:'pwr'},
    {n:'3V3',x:386,y:220,type:'pwr'},{n:'RST',x:406,y:220,type:'rst'},
    {n:'AREF',x:426,y:220,type:'analog'},{n:'IOREF',x:446,y:220,type:'analog'},
  ]
  function pinColor(id, type) {
    if (hl.includes(id)) return '#f59e0b'
    if (type==='pwr') return '#ef4444'
    if (type==='gnd') return '#374151'
    if (pins[id]===1) return '#22c55e'
    return '#d1d5db'
  }
  function pinTextColor(type) {
    if (type==='pwr'||type==='gnd') return '#fff'
    return '#111'
  }
  return (
    <svg viewBox="0 0 520 250" className="w-full drop-shadow-2xl" style={{filter:'drop-shadow(0 0 20px #22c55e30)'}}>
      {/* Glow effect */}
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Board body */}
      <rect x="20" y="8" width="476" height="234" rx="10" fill="#1a5a2a" stroke="#2d8a3e" strokeWidth="2"/>
      <rect x="25" y="13" width="466" height="224" rx="8" fill="#1f6b30" stroke="#3aa050" strokeWidth="0.5" opacity="0.5"/>

      {/* Silkscreen lines */}
      <line x1="170" y1="8" x2="170" y2="242" stroke="#2a7a3a" strokeWidth="0.5" strokeDasharray="4,4"/>

      {/* USB-B connector */}
      <rect x="22" y="78" width="32" height="45" rx="4" fill="#777" stroke="#555" strokeWidth="1.5"/>
      <rect x="26" y="83" width="24" height="35" rx="3" fill="#444"/>
      <rect x="29" y="87" width="18" height="27" rx="2" fill="#222"/>

      {/* 5V regulator */}
      <rect x="75" y="140" width="22" height="35" rx="2" fill="#333" stroke="#555"/>
      <rect x="78" y="143" width="16" height="29" fill="#111"/>
      <text x="86" y="175" textAnchor="middle" fill="#666" fontSize="4" fontFamily="monospace">7805</text>

      {/* Capacitors */}
      <ellipse cx="115" cy="165" rx="8" ry="12" fill="#555" stroke="#777" strokeWidth="1"/>
      <ellipse cx="130" cy="155" rx="6" ry="9" fill="#4a7a00" stroke="#5a9a00" strokeWidth="1"/>

      {/* Main chip ATmega328P */}
      <rect x="185" y="98" width="85" height="65" rx="5" fill="#111" stroke="#333" strokeWidth="1.5"/>
      <rect x="187" y="100" width="81" height="61" rx="4" fill="#0a0a0a"/>
      {/* Pin 1 dot */}
      <circle cx="193" cy="106" r="2.5" fill="#555"/>
      {/* Chip pins */}
      {[0,1,2,3,4,5,6,7].map(function(i){return(<g key={'cp'+i}><rect x="182" y={104+i*7} width="4" height="3" rx="0.5" fill="#c0a000"/><rect x="268" y={104+i*7} width="4" height="3" rx="0.5" fill="#c0a000"/></g>)})}
      <text x="227" y="126" textAnchor="middle" fill="#555" fontSize="7" fontFamily="monospace">ATmega</text>
      <text x="227" y="136" textAnchor="middle" fill="#555" fontSize="7" fontFamily="monospace">328P-PU</text>
      <text x="227" y="146" textAnchor="middle" fill="#444" fontSize="5" fontFamily="monospace">ARDUINO</text>

      {/* Crystal */}
      <rect x="280" y="113" width="28" height="14" rx="3" fill="#c8a800" stroke="#a08000" strokeWidth="1"/>
      <text x="294" y="123" textAnchor="middle" fill="#331100" fontSize="5" fontFamily="monospace">16.000</text>

      {/* USB-to-serial chip */}
      <rect x="78" y="100" width="35" height="28" rx="2" fill="#222" stroke="#444"/>
      {[0,1,2,3].map(function(i){return(<g key={'sc'+i}><rect x="76" y={104+i*5} width="3" height="3" rx="0.5" fill="#888"/><rect x="111" y={104+i*5} width="3" height="3" rx="0.5" fill="#888"/></g>)})}
      <text x="95" y="116" textAnchor="middle" fill="#666" fontSize="5" fontFamily="monospace">CH340</text>

      {/* Power LED (green, always on) */}
      <circle cx="462" cy="58" r="5.5" fill="#22c55e" filter="url(#glow)"/>
      <circle cx="462" cy="58" r="3" fill="#4ade80"/>
      <text x="462" y="70" textAnchor="middle" fill="#22c55e" fontSize="5" fontFamily="monospace">ON</text>

      {/* Pin 13 LED (yellow, toggles) */}
      <circle cx="443" cy="58" r="5" fill={pins['13']===1?'#fbbf24':'#3a2d00'} filter={pins['13']===1?'url(#glow)':'none'} opacity="0.95"/>
      <circle cx="443" cy="58" r="2.5" fill={pins['13']===1?'#fef08a':'#4a3d00'}/>
      <text x="443" y="70" textAnchor="middle" fill={pins['13']===1?'#fbbf24':'#4a3d00'} fontSize="5" fontFamily="monospace">L</text>

      {/* RX/TX LEDs */}
      <circle cx="425" cy="58" r="4" fill={pins['RX']===1?'#3b82f6':'#0a1a3a'} opacity="0.9"/>
      <text x="425" y="69" textAnchor="middle" fill="#3b82f6" fontSize="4" fontFamily="monospace">RX</text>
      <circle cx="407" cy="58" r="4" fill={pins['TX']===1?'#3b82f6':'#0a1a3a'} opacity="0.9"/>
      <text x="407" y="69" textAnchor="middle" fill="#3b82f6" fontSize="4" fontFamily="monospace">TX</text>

      {/* Reset button */}
      <circle cx="130" cy="78" r="10" fill="#cc2222" stroke="#991111" strokeWidth="2"/>
      <circle cx="130" cy="78" r="5" fill="#ff4444"/>
      <text x="130" y="96" textAnchor="middle" fill="#888" fontSize="5" fontFamily="monospace">RESET</text>

      {/* ICSP header */}
      <rect x="300" y="80" width="22" height="16" rx="1" fill="#333"/>
      {[0,1,2,3,4,5].map(function(i){return <circle key={'icsp'+i} cx={303+i%2*8} cy={83+Math.floor(i/2)*6} r="2" fill="#888" key={i}/>})}
      <text x="311" y="105" textAnchor="middle" fill="#555" fontSize="4" fontFamily="monospace">ICSP</text>

      {/* Power jack */}
      <circle cx="55" cy="175" r="10" fill="#555" stroke="#333" strokeWidth="2"/>
      <circle cx="55" cy="175" r="4" fill="#111"/>
      <text x="55" y="192" textAnchor="middle" fill="#777" fontSize="5" fontFamily="monospace">PWR</text>

      {/* Pin header rows */}
      {/* Top pins */}
      {digital.map(function(pin){
        const id = pin.n.replace('~','')
        return(
          <g key={"dt"+pin.n} onClick={function(){onPinClick&&onPinClick(id)}} style={{cursor:'pointer'}}>
            <rect x={pin.x-8} y={pin.y} width="16" height="16" rx="2" fill="#333"/>
            <circle cx={pin.x} cy={pin.y+8} r="4.5"
              fill={pinColor(id, 'digital')}
              stroke={hl.includes(id)?'#f59e0b':'#555'} strokeWidth={hl.includes(id)?2:0.5}
              filter={pins[id]===1?'url(#glow)':'none'}/>
            <text x={pin.x} y={pin.y-2} textAnchor="middle" fill="#9ca3af" fontSize="5" fontFamily="monospace">{pin.n}</text>
          </g>
        )
      })}

      {/* Bottom pins */}
      {bottom.map(function(pin){
        const id = pin.n
        return(
          <g key={"bt"+pin.n+pin.x} onClick={function(){onPinClick&&onPinClick(id)}} style={{cursor:'pointer'}}>
            <rect x={pin.x-8} y={pin.y-16} width="16" height="16" rx="2" fill="#333"/>
            <circle cx={pin.x} cy={pin.y-8} r="4.5"
              fill={pinColor(id, pin.type||'digital')}
              stroke={hl.includes(id)?'#f59e0b':'#555'} strokeWidth={hl.includes(id)?2:0.5}/>
            <text x={pin.x} y={pin.y+6} textAnchor="middle" fill="#9ca3af" fontSize="4.5" fontFamily="monospace">{pin.n}</text>
          </g>
        )
      })}

      {/* Board label */}
      <text x="360" y="158" fill="#2a7a3a" fontSize="18" fontFamily="Arial" fontWeight="bold" opacity="0.6">Arduino</text>
      <text x="363" y="175" fill="#2a7a3a" fontSize="12" fontFamily="Arial" opacity="0.6">Uno R3</text>

      {/* Mounting holes */}
      {[[35,25],[35,220],[490,35],[490,200]].map(function(pos,i){return(
        <g key={"mh"+i}><circle cx={pos[0]} cy={pos[1]} r="6" fill="#111" stroke="#333" strokeWidth="1"/><circle cx={pos[0]} cy={pos[1]} r="3" fill="#0a0a0a"/></g>
      )})}
    </svg>
  )
}

function ESP32Board({ pinStates, onPinClick, highlightedPins }) {
  const pins = pinStates || {}
  const hl = highlightedPins || []

  const leftPins = [
    {n:'GND',y:60,type:'gnd'},{n:'3V3',y:76,type:'pwr'},{n:'D15',y:92},
    {n:'D2',y:108},{n:'D4',y:124},{n:'RX2',y:140},
    {n:'TX2',y:156},{n:'D5',y:172},{n:'D18',y:188},
    {n:'D19',y:204},{n:'D21',y:220},{n:'RX0',y:236},
    {n:'TX0',y:252},{n:'D22',y:268},{n:'D23',y:284},
    {n:'GND',y:300,type:'gnd'},{n:'D13',y:316},{n:'D12',y:332},
    {n:'D14',y:348},{n:'D27',y:364},
  ]
  const rightPins = [
    {n:'D26',y:60},{n:'D25',y:76},{n:'D33',y:92},
    {n:'D32',y:108},{n:'D35',y:124,type:'in'},{n:'D34',y:140,type:'in'},
    {n:'VN',y:156,type:'in'},{n:'VP',y:172,type:'in'},{n:'EN',y:188},
    {n:'3V3',y:204,type:'pwr'},{n:'GND',y:220,type:'gnd'},{n:'VIN',y:236,type:'pwr'},
    {n:'GND',y:252,type:'gnd'},{n:'D0',y:268},{n:'D1',y:284},
    {n:'D3',y:300},{n:'D16',y:316},{n:'D17',y:332},
    {n:'D5',y:348},{n:'D4',y:364},
  ]

  function pinColor(id, type) {
    if (hl.includes(id)) return '#f59e0b'
    if (type==='pwr') return '#ef4444'
    if (type==='gnd') return '#374151'
    if (type==='in') return '#0ea5e9'
    if (pins[id]===1) return '#22c55e'
    return '#9ca3af'
  }

  return (
    <svg viewBox="0 0 340 420" className="w-full max-w-sm drop-shadow-2xl" style={{filter:'drop-shadow(0 0 20px #a855f730)'}}>
      <defs>
        <filter id="glow2"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="espGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1a5a"/>
          <stop offset="100%" stopColor="#1a0a3a"/>
        </linearGradient>
      </defs>

      {/* Board */}
      <rect x="50" y="30" width="240" height="370" rx="8" fill="url(#espGrad)" stroke="#4a2a8a" strokeWidth="2"/>

      {/* Antenna module */}
      <rect x="90" y="35" width="160" height="50" rx="5" fill="#332a6a" stroke="#5a4a9a" strokeWidth="1"/>
      <rect x="100" y="40" width="140" height="38" rx="3" fill="#888" stroke="#aaa" strokeWidth="0.5"/>
      <rect x="105" y="43" width="130" height="30" rx="2" fill="#777"/>
      <rect x="115" y="48" width="110" height="20" rx="1" fill="#555"/>
      <text x="170" y="62" textAnchor="middle" fill="#ccc" fontSize="9" fontFamily="monospace" fontWeight="bold">ESP32-WROOM-32</text>

      {/* Signal trace to antenna */}
      <rect x="162" y="35" width="16" height="12" rx="1" fill="#c0a000"/>
      {/* Antenna pattern */}
      <path d="M170 35 L170 20 L145 20 L145 12 L195 12 L195 20 L170 20" stroke="#c0a000" strokeWidth="2" fill="none"/>

      {/* USB Micro connector */}
      <rect x="140" y="388" width="60" height="18" rx="4" fill="#888" stroke="#666" strokeWidth="1"/>
      <rect x="147" y="391" width="46" height="12" rx="3" fill="#555"/>
      <rect x="153" y="394" width="34" height="6" rx="1" fill="#333"/>
      <text x="170" y="408" textAnchor="middle" fill="#666" fontSize="5" fontFamily="monospace">MICRO-USB</text>

      {/* Main ESP32 chip area */}
      <rect x="95" y="165" width="150" height="100" rx="5" fill="#1a1a2e" stroke="#333"/>
      <text x="170" y="205" textAnchor="middle" fill="#6366f1" fontSize="8" fontFamily="monospace">ESPRESSIF</text>
      <text x="170" y="218" textAnchor="middle" fill="#6366f1" fontSize="9" fontFamily="monospace" fontWeight="bold">ESP32</text>
      <text x="170" y="230" textAnchor="middle" fill="#4a4a7a" fontSize="6" fontFamily="monospace">Dual-Core 240MHz</text>
      <text x="170" y="242" textAnchor="middle" fill="#4a4a7a" fontSize="6" fontFamily="monospace">WiFi + BT 4.2</text>
      <text x="170" y="254" textAnchor="middle" fill="#4a4a7a" fontSize="5" fontFamily="monospace">4MB Flash</text>

      {/* Boot/EN buttons */}
      <circle cx="80" cy="150" r="8" fill="#333" stroke="#555" strokeWidth="1"/>
      <circle cx="80" cy="150" r="4" fill="#222"/>
      <text x="80" y="167" textAnchor="middle" fill="#666" fontSize="5" fontFamily="monospace">BOOT</text>
      <circle cx="260" cy="150" r="8" fill="#cc2222" stroke="#991111" strokeWidth="1"/>
      <circle cx="260" cy="150" r="4" fill="#ee3333"/>
      <text x="260" y="167" textAnchor="middle" fill="#cc4444" fontSize="5" fontFamily="monospace">EN</text>

      {/* LEDs */}
      <circle cx="235" cy="130" r="4" fill="#22c55e" filter="url(#glow2)" opacity="0.9"/>
      <text x="235" y="144" textAnchor="middle" fill="#22c55e" fontSize="4">PWR</text>
      <circle cx="250" cy="130" r="4" fill={pins['D2']===1?'#3b82f6':'#0a1530'} filter={pins['D2']===1?'url(#glow2)':'none'}/>
      <text x="250" y="144" textAnchor="middle" fill="#3b82f6" fontSize="4">D2</text>

      {/* Left pins */}
      {leftPins.map(function(pin){
        const id = pin.n
        return(
          <g key={"el"+id+pin.y} onClick={function(){onPinClick&&onPinClick(id)}} style={{cursor:'pointer'}}>
            <rect x="52" y={pin.y-7} width="22" height="14" rx="2" fill="#1e1e2e"/>
            <circle cx="63" cy={pin.y} r="5"
              fill={pinColor(id, pin.type)}
              stroke={hl.includes(id)?'#f59e0b':'#444'} strokeWidth={hl.includes(id)?2:0.5}
              filter={pins[id]===1?'url(#glow2)':'none'}/>
            <text x="80" y={pin.y+3} fill="#a78bfa" fontSize="6" fontFamily="monospace">{pin.n}</text>
          </g>
        )
      })}

      {/* Right pins */}
      {rightPins.map(function(pin){
        const id = pin.n
        return(
          <g key={"er"+id+pin.y} onClick={function(){onPinClick&&onPinClick(id)}} style={{cursor:'pointer'}}>
            <rect x="266" y={pin.y-7} width="22" height="14" rx="2" fill="#1e1e2e"/>
            <circle cx="277" cy={pin.y} r="5"
              fill={pinColor(id, pin.type)}
              stroke={hl.includes(id)?'#f59e0b':'#444'} strokeWidth={hl.includes(id)?2:0.5}
              filter={pins[id]===1?'url(#glow2)':'none'}/>
            <text x="262" y={pin.y+3} fill="#a78bfa" fontSize="6" fontFamily="monospace" textAnchor="end">{pin.n}</text>
          </g>
        )
      })}

      {/* Mounting holes */}
      {[[60,45],[60,385],[280,45],[280,385]].map(function(pos,i){return(
        <g key={"emh"+i}><circle cx={pos[0]} cy={pos[1]} r="5" fill="#111" stroke="#333"/><circle cx={pos[0]} cy={pos[1]} r="2.5" fill="#0a0a0a"/></g>
      )})}
    </svg>
  )
}

function PiPicoBoard({ pinStates, onPinClick, highlightedPins }) {
  const pins = pinStates || {}
  const hl = highlightedPins || []
  const leftPins = [
    {n:'GP0',y:60},{n:'GP1',y:76},{n:'GND',y:92,type:'gnd'},
    {n:'GP2',y:108},{n:'GP3',y:124},{n:'GP4',y:140},
    {n:'GP5',y:156},{n:'GND',y:172,type:'gnd'},{n:'GP6',y:188},
    {n:'GP7',y:204},{n:'GP8',y:220},{n:'GP9',y:236},
    {n:'GND',y:252,type:'gnd'},{n:'GP10',y:268},{n:'GP11',y:284},
    {n:'GP12',y:300},{n:'GP13',y:316},{n:'GND',y:332,type:'gnd'},
    {n:'GP14',y:348},{n:'GP15',y:364},
  ]
  const rightPins = [
    {n:'VBUS',y:60,type:'pwr'},{n:'VSYS',y:76,type:'pwr'},{n:'GND',y:92,type:'gnd'},
    {n:'3V3_EN',y:108},{n:'3V3',y:124,type:'pwr'},{n:'GP28',y:140},
    {n:'GND',y:156,type:'gnd'},{n:'GP27',y:172},{n:'GP26',y:188},
    {n:'RUN',y:204},{n:'GP22',y:220},{n:'GND',y:236,type:'gnd'},
    {n:'GP21',y:252},{n:'GP20',y:268},{n:'GP19',y:284},
    {n:'GP18',y:300},{n:'GND',y:316,type:'gnd'},{n:'GP17',y:332},
    {n:'GP16',y:348},{n:'GP15R',y:364},
  ]
  function pinColor(id, type) {
    if (hl.includes(id)) return '#f59e0b'
    if (type==='pwr') return '#ef4444'
    if (type==='gnd') return '#374151'
    if (pins[id]===1) return '#22c55e'
    return '#d1d5db'
  }
  return (
    <svg viewBox="0 0 310 410" className="w-full max-w-xs drop-shadow-2xl" style={{filter:'drop-shadow(0 0 20px #22c55e30)'}}>
      <defs><filter id="glow3"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect x="45" y="30" width="220" height="360" rx="6" fill="#1a5a0a" stroke="#2a8a1a" strokeWidth="2"/>
      <rect x="48" y="33" width="214" height="354" rx="5" fill="#1f6b10" stroke="#30a020" strokeWidth="0.5" opacity="0.5"/>
      {/* USB */}
      <rect x="120" y="375" width="70" height="20" rx="4" fill="#888" stroke="#666"/>
      <rect x="127" y="378" width="56" height="14" rx="3" fill="#555"/>
      <rect x="132" y="381" width="46" height="8" rx="1" fill="#333"/>
      <text x="155" y="397" textAnchor="middle" fill="#777" fontSize="5" fontFamily="monospace">MICRO-USB</text>
      {/* RP2040 chip */}
      <rect x="95" y="145" width="120" height="90" rx="6" fill="#111" stroke="#333" strokeWidth="1.5"/>
      {[0,1,2,3,4,5,6,7].map(function(i){return(<g key={'pc'+i}><rect x="92" y={150+i*9} width="4" height="6" rx="0.5" fill="#c0a000"/><rect x="214" y={150+i*9} width="4" height="6" rx="0.5" fill="#c0a000"/></g>)})}
      <text x="155" y="182" textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace" fontWeight="bold">RP2040</text>
      <text x="155" y="194" textAnchor="middle" fill="#4ade80" fontSize="6" fontFamily="monospace">Raspberry Pi</text>
      <text x="155" y="206" textAnchor="middle" fill="#3a6a30" fontSize="5" fontFamily="monospace">Dual ARM Cortex-M0+</text>
      <text x="155" y="218" textAnchor="middle" fill="#3a6a30" fontSize="5" fontFamily="monospace">133MHz • 264KB RAM</text>
      {/* Flash chip */}
      <rect x="155" y="110" width="40" height="28" rx="2" fill="#222" stroke="#444"/>
      <text x="175" y="128" textAnchor="middle" fill="#555" fontSize="5" fontFamily="monospace">W25Q16</text>
      <text x="175" y="136" textAnchor="middle" fill="#444" fontSize="4" fontFamily="monospace">2MB Flash</text>
      {/* LED */}
      <circle cx="200" cy="100" r="5" fill={pins['GP25']===1?'#22c55e':'#0a2a0a'} filter={pins['GP25']===1?'url(#glow3)':'none'} opacity="0.95"/>
      <text x="200" y="113" textAnchor="middle" fill="#22c55e" fontSize="4" fontFamily="monospace">LED</text>
      {/* BOOTSEL */}
      <circle cx="112" cy="100" r="8" fill="#cc2222" stroke="#991111"/>
      <circle cx="112" cy="100" r="4" fill="#ee3333"/>
      <text x="112" y="116" textAnchor="middle" fill="#cc4444" fontSize="5" fontFamily="monospace">BOOTSEL</text>
      {/* Left pins */}
      {leftPins.map(function(pin){
        const id = pin.n
        return(
          <g key={"pl"+id+pin.y} onClick={function(){onPinClick&&onPinClick(id)}} style={{cursor:'pointer'}}>
            <rect x="47" y={pin.y-6} width="18" height="12" rx="2" fill="#222"/>
            <circle cx="56" cy={pin.y} r="4.5" fill={pinColor(id,pin.type)} stroke={hl.includes(id)?'#f59e0b':'#444'} strokeWidth={hl.includes(id)?2:0.5} filter={pins[id]===1?'url(#glow3)':'none'}/>
            <text x="72" y={pin.y+3} fill="#86efac" fontSize="5.5" fontFamily="monospace">{pin.n}</text>
          </g>
        )
      })}
      {/* Right pins */}
      {rightPins.map(function(pin){
        const id = pin.n
        return(
          <g key={"pr"+id+pin.y} onClick={function(){onPinClick&&onPinClick(id)}} style={{cursor:'pointer'}}>
            <rect x="245" y={pin.y-6} width="18" height="12" rx="2" fill="#222"/>
            <circle cx="254" cy={pin.y} r="4.5" fill={pinColor(id,pin.type)} stroke={hl.includes(id)?'#f59e0b':'#444'} strokeWidth={hl.includes(id)?2:0.5}/>
            <text x="242" y={pin.y+3} fill="#86efac" fontSize="5.5" fontFamily="monospace" textAnchor="end">{pin.n}</text>
          </g>
        )
      })}
      {/* Mounting holes */}
      {[[55,44],[55,376],[255,44],[255,376]].map(function(pos,i){return(<g key={"pmh"+i}><circle cx={pos[0]} cy={pos[1]} r="5" fill="#111" stroke="#2a5a1a"/><circle cx={pos[0]} cy={pos[1]} r="2.5" fill="#0a0a0a"/></g>)})}
      <text x="155" y="30" textAnchor="middle" fill="#4ade80" fontSize="9" fontFamily="monospace" fontWeight="bold">Raspberry Pi Pico</text>
    </svg>
  )
}

// ─── COMPONENT LIBRARY ────────────────────────────────────────────────────────
const COMPONENT_LIB = [
  {type:'led_red',label:'LED Red',icon:'🔴',color:'#ef4444',pins:['A+','K-']},
  {type:'led_green',label:'LED Green',icon:'🟢',color:'#22c55e',pins:['A+','K-']},
  {type:'led_blue',label:'LED Blue',icon:'🔵',color:'#3b82f6',pins:['A+','K-']},
  {type:'led_yellow',label:'LED Yellow',icon:'🟡',color:'#eab308',pins:['A+','K-']},
  {type:'led_white',label:'LED White',icon:'⚪',color:'#f8fafc',pins:['A+','K-']},
  {type:'resistor_220',label:'220Ω',icon:'〰️',color:'#f59e0b',pins:['1','2']},
  {type:'resistor_1k',label:'1kΩ',icon:'〰️',color:'#a78bfa',pins:['1','2']},
  {type:'resistor_10k',label:'10kΩ',icon:'〰️',color:'#6366f1',pins:['1','2']},
  {type:'button',label:'Push Button',icon:'🔘',color:'#6366f1',pins:['1A','1B','2A','2B']},
  {type:'buzzer',label:'Buzzer',icon:'🔊',color:'#8b5cf6',pins:['+','-']},
  {type:'pot',label:'Potentiometer',icon:'🎛️',color:'#0ea5e9',pins:['VCC','OUT','GND']},
  {type:'dht22',label:'DHT22',icon:'🌡️',color:'#22c55e',pins:['VCC','DATA','NC','GND']},
  {type:'hcsr04',label:'HC-SR04',icon:'📡',color:'#0ea5e9',pins:['VCC','TRIG','ECHO','GND']},
  {type:'servo',label:'Servo SG90',icon:'⚙️',color:'#f97316',pins:['GND','VCC','SIG']},
  {type:'oled',label:'OLED 0.96"',icon:'🖥️',color:'#6366f1',pins:['GND','VCC','SCL','SDA']},
  {type:'lcd_i2c',label:'LCD 16x2 I2C',icon:'📟',color:'#22c55e',pins:['GND','VCC','SDA','SCL']},
  {type:'relay',label:'Relay 5V',icon:'⚡',color:'#ef4444',pins:['VCC','GND','IN','COM','NO','NC']},
  {type:'pir',label:'PIR HC-SR501',icon:'👁️',color:'#f59e0b',pins:['VCC','OUT','GND']},
  {type:'mq135',label:'MQ-135 Gas',icon:'💨',color:'#64748b',pins:['VCC','GND','AO','DO']},
  {type:'neopixel',label:'NeoPixel Strip',icon:'🌈',color:'#a855f7',pins:['5V','DIN','GND']},
  {type:'l298n',label:'L298N Motor',icon:'🔩',color:'#0ea5e9',pins:['VCC','GND','IN1','IN2','IN3','IN4','ENA','ENB']},
  {type:'i2c_lcd',label:'I2C Module',icon:'📡',color:'#6366f1',pins:['GND','VCC','SDA','SCL']},
]

// ─── COMPONENT VISUAL ─────────────────────────────────────────────────────────
function CompVisual({ comp, engine, onWirePin, wiringFrom, onSelect, selected, onRemove }) {
  const def = COMPONENT_LIB.find(function(c){return c.type===comp.type}) || COMPONENT_LIB[0]
  const isLED = comp.type.startsWith('led')
  const isButton = comp.type==='button'
  const isPot = comp.type==='pot'
  const isServo = comp.type==='servo'
  const isBuzzer = comp.type==='buzzer'
  const isOLED = comp.type==='oled'||comp.type==='lcd_i2c'
  const isNeo = comp.type==='neopixel'

  function connectedPinState(pinName) {
    if (!engine) return 0
    const wire = (engine.wires||[]).find(function(w){
      return (w.fromComp===comp.id&&w.fromPin===pinName)||(w.toComp===comp.id&&w.toPin===pinName)
    })
    if (!wire) return 0
    const bp = wire.fromComp===comp.id?wire.toPin:wire.fromPin
    return engine.getPin(bp)
  }

  const ledOn = isLED && connectedPinState('A+')===1
  const buzOn = isBuzzer && connectedPinState('+')===1
  const servoAng = isServo ? Math.round((engine?.getAnalog?.(comp.sigPin)||0)/1023*180) : 90
  const [neo, setNeo] = useState([0,0,0])
  useEffect(function(){
    if(!isNeo) return
    const t = setInterval(function(){setNeo([Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)])},500)
    return function(){clearInterval(t)}
  },[isNeo])

  return (
    <div className={"relative rounded-2xl border-2 p-2.5 transition-all cursor-pointer select-none " + (selected?'border-indigo-500 shadow-xl shadow-indigo-900/40 bg-[#0a0a28]':'border-[#2e2e4e] hover:border-indigo-400 bg-[#0a0a18]')}
      style={{minWidth:100,maxWidth:160}}
      onClick={function(){onSelect(comp.id)}}>
      {/* Remove */}
      <button onClick={function(e){e.stopPropagation();onRemove(comp.id)}}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-700 hover:bg-red-600 rounded-full text-white text-xs flex items-center justify-center z-10 transition">×</button>

      <p className="text-white text-xs font-bold mb-1.5 truncate">{comp.label||def.label}</p>

      {/* LED */}
      {isLED && (
        <div className="flex justify-center my-2">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-[3px] flex items-center justify-center transition-all duration-150"
              style={{borderColor:def.color, backgroundColor:ledOn?def.color+'cc':'#0a0a1a',
                boxShadow:ledOn?`0 0 20px ${def.color}, 0 0 40px ${def.color}50`:'none'}}>
              <div className="w-5 h-5 rounded-full" style={{backgroundColor:ledOn?'#ffffff':def.color+'20'}}/>
            </div>
            {ledOn && <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{backgroundColor:def.color}}/>}
          </div>
        </div>
      )}

      {/* Resistor */}
      {comp.type.startsWith('resistor') && (
        <div className="flex items-center justify-center my-2 gap-0.5">
          <div className="w-4 h-0.5 rounded" style={{backgroundColor:def.color}}/>
          <div className="w-10 h-4 rounded-sm border" style={{borderColor:def.color,backgroundColor:'#1a1a1a'}}>
            {[def.color,'#f59e0b','#1a1a1a'].map(function(c,i){return <div key={i} className="absolute h-4 w-0.5 rounded" style={{backgroundColor:c,left:4+i*3}}/>})}
          </div>
          <div className="w-4 h-0.5 rounded" style={{backgroundColor:def.color}}/>
        </div>
      )}

      {/* Button */}
      {isButton && (
        <div className="flex justify-center my-1">
          <div className="relative">
            <div className="w-16 h-10 bg-[#1a1a2e] border border-[#2e2e4e] rounded-lg flex items-center justify-center">
              <button onClick={function(e){e.stopPropagation();if(engine?.pressButton)engine.pressButton(comp.id)}}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-90 transition text-white text-xs font-bold shadow-lg active:shadow-indigo-500/50">
                ●
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buzzer */}
      {isBuzzer && (
        <div className="flex justify-center my-1">
          <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
            style={{borderColor:'#8b5cf6',backgroundColor:buzOn?'#3b1d8a':'#0a0a1a',boxShadow:buzOn?'0 0 15px #8b5cf6':'none'}}>
            <span className="text-xl">{buzOn?'🔊':'🔇'}</span>
          </div>
        </div>
      )}

      {/* Potentiometer */}
      {isPot && (
        <div className="my-1" onClick={function(e){e.stopPropagation()}}>
          <div className="w-12 h-12 rounded-full border-2 border-blue-500 mx-auto flex items-center justify-center bg-[#0a0a1a] relative">
            <div className="absolute w-1 h-5 bg-blue-400 rounded origin-bottom"
              style={{transform:`rotate(${(comp.potValue||50)*1.8-90}deg)`,bottom:'50%',left:'calc(50% - 2px)'}}/>
            <div className="w-3 h-3 rounded-full bg-blue-600"/>
          </div>
          <input type="range" min="0" max="100" value={comp.potValue||50}
            onChange={function(e){if(engine?.setPotValue)engine.setPotValue(comp.id,parseInt(e.target.value))}}
            className="w-full mt-1 h-1 accent-blue-500"/>
          <p className="text-center text-slate-400 text-xs">{comp.potValue||50}%</p>
        </div>
      )}

      {/* Servo */}
      {isServo && (
        <div className="flex flex-col items-center my-1">
          <div className="w-14 h-14 rounded-xl border-2 border-orange-500 bg-[#1a0a00] relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-0.5 bg-orange-400 rounded-full origin-left transition-transform duration-200"
                style={{transform:`rotate(${servoAng-90}deg)`,transformOrigin:'left center'}}/>
              <div className="w-3 h-3 rounded-full bg-orange-500 absolute"/>
            </div>
          </div>
          <p className="text-orange-400 text-xs mt-0.5">{servoAng}°</p>
        </div>
      )}

      {/* OLED/LCD */}
      {isOLED && (
        <div className="my-1 rounded-md overflow-hidden border border-green-900">
          <div className="bg-black p-1.5">
            <p className="text-green-400 text-xs font-mono leading-tight">Hello World!</p>
            <p className="text-green-700 text-xs font-mono leading-tight">ProtoMind v1.0</p>
          </div>
        </div>
      )}

      {/* NeoPixel */}
      {isNeo && (
        <div className="flex gap-0.5 justify-center my-1">
          {[0,1,2,3,4,5,6,7].map(function(i){
            const hue = (i*45+Date.now()/20)%360
            return <div key={i} className="w-3 h-3 rounded-sm transition-colors duration-500"
              style={{backgroundColor:`hsl(${hue},90%,60%)`}}/>
          })}
        </div>
      )}

      {/* Pins */}
      <div className="mt-2 flex flex-wrap gap-0.5">
        {def.pins.map(function(pin){
          const isWiring = wiringFrom?.compId===comp.id&&wiringFrom?.pin===pin
          const pinIsConnected = (engine?.wires||[]).some(function(w){
            return (w.fromComp===comp.id&&w.fromPin===pin)||(w.toComp===comp.id&&w.toPin===pin)
          })
          return(
            <button key={pin}
              onClick={function(e){e.stopPropagation();onWirePin&&onWirePin(comp.id,pin)}}
              className={"text-xs px-1 py-0.5 rounded border font-mono transition " + (
                isWiring?'bg-yellow-500 border-yellow-400 text-black font-bold':
                pinIsConnected?'bg-green-950 border-green-700 text-green-400':
                'bg-[#13131f] border-[#2e2e4e] text-slate-500 hover:border-indigo-400 hover:text-white'
              )}>
              {pin}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── ENGINE ───────────────────────────────────────────────────────────────────
function createEngine(wires, placed, setPinStates, setAnalogStates, setSerialLog) {
  const state = { pins: {}, analog: {} }
  return {
    wires,
    getPin: function(p){ return state.pins[String(p)]||0 },
    getAnalog: function(p){ return state.analog[String(p)]||0 },
    setPin: function(p,v){ state.pins[String(p)]=v; setPinStates({...state.pins}) },
    setAnalog: function(p,v){ state.analog[String(p)]=v; setAnalogStates({...state.analog}) },
    pressButton: function(compId){
      const wire = wires.find(function(w){return w.fromComp===compId||w.toComp===compId})
      if(!wire) return
      const pin = wire.fromComp===compId?wire.toPin:wire.fromPin
      state.pins[pin]=1; setPinStates({...state.pins})
      setTimeout(function(){state.pins[pin]=0; setPinStates({...state.pins})},200)
    },
    setPotValue: function(compId, val){
      const wire = wires.find(function(w){
        return (w.fromComp===compId&&(w.fromPin==='OUT'||w.fromPin==='out'))||
               (w.toComp===compId&&(w.toPin==='OUT'||w.toPin==='out'))
      })
      if(wire){
        const pin = wire.fromComp===compId?wire.toPin:wire.fromPin
        state.analog[pin]=Math.round(val*10.23); setAnalogStates({...state.analog})
      }
    },
    serialPrint: function(msg){
      setSerialLog(function(prev){return [...prev,{text:String(msg),time:state.time||0}].slice(-500)})
    },
    state,
  }
}

// ─── SIMULATOR PAGE ───────────────────────────────────────────────────────────
const BOARDS = [
  {id:'uno',name:'Arduino Uno',icon:'🔵',color:'#22c55e'},
  {id:'esp32',name:'ESP32 DevKit',icon:'🟣',color:'#a855f7'},
  {id:'pico',name:'Raspberry Pi Pico',icon:'🟢',color:'#22c55e'},
]

function Simulator2() {
  const navigate = useNavigate()
  const [boardId, setBoardId] = useState('uno')
  const [placed, setPlaced] = useState([])
  const [wires, setWires] = useState([])
  const [wiringFrom, setWiringFrom] = useState(null)
  const [selected, setSelected] = useState(null)
  const [pinStates, setPinStates] = useState({})
  const [analogStates, setAnalogStates] = useState({})
  const [serialLog, setSerialLog] = useState([])
  const [running, setRunning] = useState(false)
  const [simTime, setSimTime] = useState(0)
  const [code, setCode] = useState(localStorage.getItem('ide_code')||'// Paste code here or load from IDE')
  const [activeTab, setActiveTab] = useState('circuit')
  const [highlightedPins, setHighlightedPins] = useState([])
  const [sidePanel, setSidePanel] = useState('components')
  const loopRef = useRef()
  const timeRef = useRef(0)

  const engine = createEngine(wires, placed, setPinStates, setAnalogStates, setSerialLog)
  engine.state.pins = pinStates
  engine.state.analog = analogStates

  function addComp(type) {
    const def = COMPONENT_LIB.find(function(c){return c.type===type})
    const id = 'c_'+Date.now()
    setPlaced(function(prev){return [...prev,{id,type,label:def.label,potValue:50}]})
  }

  function removeComp(id) {
    setPlaced(function(p){return p.filter(function(c){return c.id!==id})})
    setWires(function(w){return w.filter(function(x){return x.fromComp!==id&&x.toComp!==id})})
    if(selected===id) setSelected(null)
  }

  function handleWirePin(compId, pin) {
    if(!wiringFrom) {
      setWiringFrom({compId,pin})
      notify.info('Click another pin or board pin to connect')
    } else {
      if(wiringFrom.compId===compId&&wiringFrom.pin===pin){setWiringFrom(null);return}
      const colors = ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316']
      setWires(function(prev){
        const w = {id:'w'+Date.now(),fromComp:wiringFrom.compId,fromPin:wiringFrom.pin,toComp:compId,toPin:pin,color:colors[prev.length%colors.length]}
        return [...prev,w]
      })
      setWiringFrom(null)
      notify.success('Connected ✓')
    }
  }

  function handleBoardPin(pin) {
    if(wiringFrom) {
      const colors = ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316']
      setWires(function(prev){
        const w = {id:'w'+Date.now(),fromComp:wiringFrom.compId,fromPin:wiringFrom.pin,toComp:'board',toPin:pin,color:colors[prev.length%colors.length]}
        return [...prev,w]
      })
      setWiringFrom(null)
      notify.success('Wired to board pin '+pin+' ✓')
    } else {
      const connected = wires.filter(function(w){return w.toPin===pin||w.fromPin===pin})
      setHighlightedPins(connected.map(function(w){return w.toPin===pin?w.fromPin:w.toPin}))
      setTimeout(function(){setHighlightedPins([])},2500)
    }
  }

  function runSim() {
    if(loopRef.current) clearInterval(loopRef.current)
    timeRef.current = 0
    setSerialLog([])
    setPinStates({})
    const vars = {}
    const eng = engine

    function ev(expr){
      expr = String(expr).trim()
      if(expr==='HIGH'||expr==='1'||expr==='true') return 1
      if(expr==='LOW'||expr==='0'||expr==='false') return 0
      if(expr.match(/^".*"$/)) return expr.slice(1,-1)
      if(vars[expr]!==undefined) return vars[expr]
      if(!isNaN(expr)) return Number(expr)
      const neg = expr.match(/^!(\w+)$/)
      if(neg) return vars[neg[1]]?0:1
      const add = expr.match(/(\w+)\s*\+\s*(\d+)/)
      if(add) return (vars[add[1]]||0)+Number(add[2])
      const sub = expr.match(/(\w+)\s*-\s*(\d+)/)
      if(sub) return (vars[sub[1]]||0)-Number(sub[2])
      return expr
    }

    function rb(block){
      const stmts = block.replace(/\/\/[^\n]*/g,'').split(';').map(function(s){return s.trim()}).filter(Boolean)
      stmts.forEach(function(s){
        const dw=s.match(/digitalWrite\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/); if(dw){eng.setPin(dw[1],ev(dw[2]));return}
        const aw=s.match(/analogWrite\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/); if(aw){eng.setAnalog(aw[1],parseInt(aw[2]));return}
        const pm=s.match(/pinMode\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/); if(pm){vars['_m_'+pm[1]]=pm[2];return}
        const sb=s.match(/Serial\.begin\s*\(\s*(\d+)\s*\)/); if(sb){eng.serialPrint('[Serial] Ready '+sb[1]+' baud');return}
        const spln=s.match(/Serial\.println\s*\((.+)\)/); if(spln){eng.serialPrint(String(ev(spln[1]))+'\n');return}
        const sp=s.match(/Serial\.print\s*\((.+)\)/); if(sp){eng.serialPrint(String(ev(sp[1])));return}
        const vd=s.match(/(?:int|bool|float|long|byte|char|String)\s+(\w+)\s*=\s*(.+)/); if(vd){vars[vd[1]]=ev(vd[2]);return}
        const neg=s.match(/^(\w+)\s*=\s*!(\w+)$/); if(neg){vars[neg[1]]=vars[neg[2]]?0:1;eng.setPin(neg[1],vars[neg[1]]);return}
        const va=s.match(/^(\w+)\s*([+\-]?=)\s*(.+)$/); if(va&&vars[va[1]]!==undefined){if(va[2]==='=')vars[va[1]]=ev(va[3]);else if(va[2]==='+=')vars[va[1]]=(Number(vars[va[1]])||0)+Number(ev(va[3]));else if(va[2]==='-=')vars[va[1]]=(Number(vars[va[1]])||0)-Number(ev(va[3]));return}
      })
    }

    const setupM = code.match(/void\s+setup\s*\(\)\s*\{([\s\S]*?)\}/)
    const loopM = code.match(/void\s+loop\s*\(\)\s*\{([\s\S]*?)\}/)
    if(setupM){ try{rb(setupM[1])}catch(e){eng.serialPrint('[Setup Error] '+e.message)} }
    if(loopM){
      let cnt=0
      loopRef.current = setInterval(function(){
        timeRef.current+=100; setSimTime(function(t){return t+100}); cnt++
        if(cnt>500){clearInterval(loopRef.current);return}
        try{rb(loopM[1])}catch(e){eng.serialPrint('[Loop Error] '+e.message);clearInterval(loopRef.current)}
      },100)
    }
    setRunning(true)
    notify.success('Simulation running!')
  }

  function stopSim(){if(loopRef.current)clearInterval(loopRef.current);setRunning(false);notify.info('Stopped')}
  function resetSim(){stopSim();setPinStates({});setAnalogStates({});setSerialLog([]);setSimTime(0);timeRef.current=0;notify.info('Reset')}

  const board = BOARDS.find(function(b){return b.id===boardId})||BOARDS[0]

  return (
    <div className="h-screen bg-[#050510] text-white flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a1a] border-b border-[#1e1e2e] flex-shrink-0 flex-wrap">
        <button onClick={function(){navigate('/')}} className="text-indigo-400 font-black text-sm">ProtoMind</button>
        <span className="text-slate-600 text-xs">Simulator</span>
        <div className="w-px h-5 bg-[#2e2e4e]"/>
        <select value={boardId} onChange={function(e){setBoardId(e.target.value)}}
          className="bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500">
          {BOARDS.map(function(b){return <option key={b.id} value={b.id}>{b.icon} {b.name}</option>})}
        </select>
        <div className="flex-1"/>
        {wiringFrom && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs animate-pulse bg-yellow-950 px-3 py-1 rounded-lg">
            <span>⚡ Wiring: {wiringFrom.pin}</span>
            <button onClick={function(){setWiringFrom(null)}} className="text-yellow-600 hover:text-yellow-300">✕</button>
          </div>
        )}
        <button onClick={running?stopSim:runSim}
          className={"px-4 py-1.5 rounded-lg text-xs font-bold transition " + (running?'bg-yellow-700 hover:bg-yellow-600 text-white':'bg-green-700 hover:bg-green-600 text-white')}>
          {running?'⏸ Stop':'▶ Run'}
        </button>
        <button onClick={resetSim} className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-lg text-xs transition">↺ Reset</button>
        {running && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-green-400 text-xs">{(simTime/1000).toFixed(1)}s</span>
          </div>
        )}
        <button onClick={function(){navigate('/ide')}}
          className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-300 rounded-lg text-xs">💻 IDE</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-48 bg-[#080814] border-r border-[#1e1e2e] flex flex-col flex-shrink-0">
          <div className="flex border-b border-[#1e1e2e]">
            {[{id:'components',label:'Parts'},{id:'wires',label:'Wires'}].map(function(t){return(
              <button key={t.id} onClick={function(){setSidePanel(t.id)}}
                className={"flex-1 py-2 text-xs transition " + (sidePanel===t.id?'bg-[#0d0d1a] text-white':'text-slate-500 hover:text-white')}>
                {t.label}
              </button>
            )})}
          </div>

          {sidePanel==='components' && (
            <div className="flex-1 overflow-y-auto py-1">
              {['LEDs','Passive','Sensors','Actuators','Displays','Modules'].map(function(cat){
                const catMap = {LEDs:['led_red','led_green','led_blue','led_yellow','led_white'],Passive:['resistor_220','resistor_1k','resistor_10k','button','pot','buzzer'],Sensors:['dht22','hcsr04','pir','mq135'],Actuators:['servo','l298n'],Displays:['oled','lcd_i2c'],Modules:['relay','neopixel','i2c_lcd']}
                const items = COMPONENT_LIB.filter(function(c){return catMap[cat]?.includes(c.type)})
                if(!items.length) return null
                return(
                  <div key={cat}>
                    <p className="text-xs text-slate-600 px-3 py-1 uppercase tracking-wide">{cat}</p>
                    {items.map(function(c){return(
                      <button key={c.type} onClick={function(){addComp(c.type)}}
                        title={c.label}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#13131f] transition text-left border-b border-[#0d0d1a]">
                        <span className="text-base shrink-0">{c.icon}</span>
                        <span className="text-xs text-slate-300 truncate">{c.label}</span>
                      </button>
                    )})}
                  </div>
                )
              })}
            </div>
          )}

          {sidePanel==='wires' && (
            <div className="flex-1 overflow-y-auto p-2">
              {wires.length===0
                ? <p className="text-slate-600 text-xs text-center mt-4">No wires yet</p>
                : wires.map(function(w){
                    const fc = placed.find(function(c){return c.id===w.fromComp})
                    return(
                      <div key={w.id} className="flex items-center gap-1.5 mb-1 bg-[#0d0d1a] rounded-lg p-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:w.color}}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 truncate">{fc?.label||'Board'} [{w.fromPin}]</p>
                          <p className="text-xs text-slate-500 truncate">→ [{w.toPin}] {w.toComp==='board'?'Board':''}  </p>
                        </div>
                        <button onClick={function(){setWires(function(prev){return prev.filter(function(x){return x.id!==w.id})})}}
                          className="text-red-600 hover:text-red-400 text-xs shrink-0">✕</button>
                      </div>
                    )
                  })
              }
              {wires.length>0 && (
                <button onClick={function(){setWires([])}}
                  className="w-full mt-2 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg text-xs transition">
                  Clear All Wires
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#1e1e2e] bg-[#080814] flex-shrink-0">
            {[{id:'circuit',label:'Circuit'},{id:'code',label:'Code'},{id:'serial',label:`Serial (${serialLog.length})`}].map(function(tab){return(
              <button key={tab.id} onClick={function(){setActiveTab(tab.id)}}
                className={"px-4 py-2.5 text-xs border-r border-[#1e1e2e] transition " + (activeTab===tab.id?'bg-[#0d0d1a] text-white border-t-2 border-t-cyan-500 -mt-px':'text-slate-500 hover:text-white')}>
                {tab.label}
              </button>
            )})}
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab==='circuit' && (
              <div className="p-4 space-y-4">
                {/* Board */}
                <div className="bg-[#080818] border border-[#1e1e2e] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor:board.color}}/>
                    <p className="text-xs text-slate-400">{board.name} — click pins to wire</p>
                  </div>
                  <div className="overflow-x-auto">
                    {boardId==='esp32'
                      ? <ESP32Board pinStates={pinStates} onPinClick={handleBoardPin} highlightedPins={highlightedPins}/>
                      : boardId==='pico'
                      ? <PiPicoBoard pinStates={pinStates} onPinClick={handleBoardPin} highlightedPins={highlightedPins}/>
                      : <ArduinoUnoBoard pinStates={pinStates} onPinClick={handleBoardPin} highlightedPins={highlightedPins}/>
                    }
                  </div>
                </div>

                {/* Components */}
                {placed.length===0
                  ? <div className="text-center py-12 border border-dashed border-[#2e2e4e] rounded-2xl">
                      <p className="text-4xl mb-2">🔌</p>
                      <p className="text-slate-500">Add components from the left panel</p>
                      <p className="text-slate-600 text-xs mt-1">Then click pins to wire them to the board</p>
                    </div>
                  : <div className="flex flex-wrap gap-3">
                      {placed.map(function(comp){return(
                        <CompVisual key={comp.id} comp={comp} engine={engine}
                          onWirePin={handleWirePin} wiringFrom={wiringFrom}
                          onSelect={setSelected} selected={selected===comp.id}
                          onRemove={removeComp}/>
                      )})}
                    </div>
                }
              </div>
            )}

            {activeTab==='code' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-sm">Arduino code to simulate</p>
                  <button onClick={function(){const s=localStorage.getItem('ide_code');if(s){setCode(s);notify.info('Loaded from IDE')}}}
                    className="ml-auto px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs">Load from IDE</button>
                  <button onClick={function(){setRunning(true);runSim()}}
                    className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-bold">▶ Run</button>
                </div>
                <textarea value={code} onChange={function(e){setCode(e.target.value)}}
                  className="w-full h-[calc(100vh-280px)] bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-green-400 text-sm font-mono outline-none focus:border-indigo-500 resize-none"
                  spellCheck={false}/>
              </div>
            )}

            {activeTab==='serial' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-sm">Serial Monitor</p>
                  <button onClick={function(){setSerialLog([])}} className="ml-auto px-3 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs">Clear</button>
                </div>
                <div className="h-[calc(100vh-250px)] bg-[#050510] border border-[#2e2e4e] rounded-xl p-4 overflow-y-auto font-mono">
                  {serialLog.length===0
                    ? <p className="text-slate-600 text-sm">Run simulation to see output...</p>
                    : serialLog.map(function(l,i){return(
                        <div key={i} className="flex gap-3 text-sm mb-0.5">
                          <span className="text-slate-600 w-16 shrink-0 text-xs">{l.time}ms</span>
                          <span className="text-green-400">{l.text}</span>
                        </div>
                      )})
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

export default Simulator2
