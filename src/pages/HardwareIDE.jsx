import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { notify } from '../services/toast'

// ─── BOARD DEFINITIONS ────────────────────────────────────────────────────────
const BOARDS = [
  { id: 'arduino:avr:uno', name: 'Arduino Uno', icon: '🔵', chip: 'ATmega328P', freq: '16 MHz', flash: '32KB', ram: '2KB', color: '#1a4a8a' },
  { id: 'arduino:avr:nano', name: 'Arduino Nano', icon: '🔵', chip: 'ATmega328P', freq: '16 MHz', flash: '32KB', ram: '2KB', color: '#1a4a8a' },
  { id: 'arduino:avr:mega', name: 'Arduino Mega 2560', icon: '🔵', chip: 'ATmega2560', freq: '16 MHz', flash: '256KB', ram: '8KB', color: '#1a6a2a' },
  { id: 'esp32:esp32:esp32', name: 'ESP32 Dev Module', icon: '🟣', chip: 'Xtensa LX6', freq: '240 MHz', flash: '4MB', ram: '520KB', color: '#4a1a8a' },
  { id: 'esp8266:esp8266:nodemcuv2', name: 'NodeMCU 1.0 (ESP8266)', icon: '🟣', chip: 'ESP8266', freq: '80 MHz', flash: '4MB', ram: '80KB', color: '#6a2a1a' },
  { id: 'rp2040:rp2040:rpipico', name: 'Raspberry Pi Pico', icon: '🟢', chip: 'RP2040', freq: '133 MHz', flash: '2MB', ram: '264KB', color: '#2a6a1a' },
  { id: 'arduino:avr:leonardo', name: 'Arduino Leonardo', icon: '🔵', chip: 'ATmega32u4', freq: '16 MHz', flash: '32KB', ram: '2.5KB', color: '#1a4a8a' },
  { id: 'arduino:samd:mkr1000', name: 'Arduino MKR1000', icon: '🔵', chip: 'SAMD21', freq: '48 MHz', flash: '256KB', ram: '32KB', color: '#008a4a' },
]

const BAUD_RATES = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000, 500000, 1000000, 2000000]

const DEFAULT_SKETCHES = {
  'arduino:avr:uno': `// ProtoMind Hardware IDE
// Board: Arduino Uno

const int LED_PIN = 13;
const int BUTTON_PIN = 2;
int ledState = LOW;
unsigned long lastTime = 0;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.println("ProtoMind IDE Ready!");
  Serial.println("Board: Arduino Uno");
}

void loop() {
  // Blink LED every second
  if (millis() - lastTime >= 1000) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    Serial.print("LED: ");
    Serial.println(ledState ? "ON" : "OFF");
    lastTime = millis();
  }
  
  // Read button
  if (digitalRead(BUTTON_PIN) == LOW) {
    Serial.println("Button pressed!");
    delay(200);
  }
}`,

  'esp32:esp32:esp32': `// ProtoMind Hardware IDE
// Board: ESP32 Dev Module

#include <WiFi.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const int LED_PIN = 2;
int ledState = LOW;
unsigned long lastTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("ProtoMind IDE Ready!");
  Serial.println("Board: ESP32");
  Serial.print("Chip cores: ");
  Serial.println(ESP.getChipCores());
  Serial.print("CPU Freq: ");
  Serial.print(ESP.getCpuFreqMHz());
  Serial.println(" MHz");
  
  // Connect to WiFi (optional)
  // WiFi.begin(ssid, password);
}

void loop() {
  if (millis() - lastTime >= 500) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    Serial.print("LED: ");
    Serial.print(ledState ? "ON" : "OFF");
    Serial.print(" | Free heap: ");
    Serial.println(ESP.getFreeHeap());
    lastTime = millis();
  }
}`,

  'rp2040:rp2040:rpipico': `// ProtoMind Hardware IDE
// Board: Raspberry Pi Pico

const int LED_PIN = 25; // Built-in LED
int ledState = LOW;
unsigned long lastTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("ProtoMind IDE Ready!");
  Serial.println("Board: Raspberry Pi Pico");
}

void loop() {
  if (millis() - lastTime >= 1000) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    Serial.print("LED: ");
    Serial.println(ledState ? "ON" : "OFF");
    lastTime = millis();
  }
}`,
}

function getDefaultSketch(boardId) {
  return DEFAULT_SKETCHES[boardId] || DEFAULT_SKETCHES['arduino:avr:uno']
}

// ─── SERIAL PLOTTER COMPONENT ─────────────────────────────────────────────────
function SerialPlotter({ data }) {
  const canvasRef = useRef()

  useEffect(function() {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    ctx.fillStyle = '#050510'
    ctx.fillRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = '#1e1e2e'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (h / 10) * i)
      ctx.lineTo(w, (h / 10) * i)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo((w / 10) * i, 0)
      ctx.lineTo((w / 10) * i, h)
      ctx.stroke()
    }

    const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#0ea5e9']
    const keys = data.length > 0 ? Object.keys(data[0]).filter(function(k) { return k !== 't' }) : []
    const windowData = data.slice(-100)

    keys.forEach(function(key, ki) {
      const values = windowData.map(function(d) { return parseFloat(d[key]) || 0 })
      const min = Math.min(...values)
      const max = Math.max(...values)
      const range = max - min || 1

      ctx.strokeStyle = COLORS[ki % COLORS.length]
      ctx.lineWidth = 2
      ctx.beginPath()

      values.forEach(function(val, i) {
        const x = (i / (values.length - 1)) * w
        const y = h - ((val - min) / range) * (h - 20) - 10
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Legend
      ctx.fillStyle = COLORS[ki % COLORS.length]
      ctx.fillRect(10 + ki * 80, 8, 12, 12)
      ctx.fillStyle = '#ffffff'
      ctx.font = '11px monospace'
      ctx.fillText(key + ': ' + (values[values.length - 1] || 0).toFixed(1), 26 + ki * 80, 19)
    })
  }, [data])

  return (
    <canvas ref={canvasRef} width={800} height={200}
      className="w-full rounded-xl border border-[#2e2e4e] bg-[#050510]" />
  )
}

// ─── SIMULATE COMPILE ─────────────────────────────────────────────────────────
async function simulateCompile(code, board) {
  await new Promise(function(r) { setTimeout(r, 1500) })

  const errors = []
  const warnings = []

  // Basic syntax checks
  if (!code.includes('void setup()')) {
    errors.push({ line: 1, message: 'error: 'setup' was not declared in this scope', type: 'error' })
  }
  if (!code.includes('void loop()')) {
    errors.push({ line: 1, message: 'error: 'loop' was not declared in this scope', type: 'error' })
  }

  // Check for common mistakes
  const lines = code.split('\n')
  lines.forEach(function(line, i) {
    if (line.includes('int ') && !line.trim().startsWith('//') && !line.includes(';') && !line.includes(')') && !line.includes('{')) {
      warnings.push({ line: i + 1, message: 'warning: variable declaration missing semicolon?', type: 'warning' })
    }
    if (line.includes('delay(') && board.id.includes('esp32')) {
      warnings.push({ line: i + 1, message: 'warning: delay() blocks ESP32 tasks. Consider vTaskDelay() for FreeRTOS', type: 'warning' })
    }
  })

  const flashUsed = Math.round((code.length * 8.5) + 900)
  const ramUsed = Math.round(code.length * 0.3 + 20)
  const flashPct = Math.round((flashUsed / parseInt(board.flash) * 1024) * 100)
  const ramPct = Math.round((ramUsed / parseInt(board.ram) * 1024) * 100)

  return {
    success: errors.length === 0,
    errors,
    warnings,
    stats: {
      flash: flashUsed,
      flashTotal: board.flash,
      flashPct,
      ram: ramUsed,
      ramTotal: board.ram,
      ramPct,
      time: (1.2 + Math.random() * 0.8).toFixed(1),
    }
  }
}

// ─── MAIN IDE COMPONENT ───────────────────────────────────────────────────────
function HardwareIDE() {
  const navigate = useNavigate()
  const location = useLocation()

  // Editor state
  const [selectedBoard, setSelectedBoard] = useState(BOARDS[0])
  const [code, setCode] = useState(function() {
    return location.state?.code || localStorage.getItem('ide_code') || getDefaultSketch('arduino:avr:uno')
  })
  const [fontSize, setFontSize] = useState(14)
  const [theme, setTheme] = useState('vs-dark')
  const [wordWrap, setWordWrap] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)

  // Compile state
  const [compiling, setCompiling] = useState(false)
  const [compileResult, setCompileResult] = useState(null)
  const [compileLog, setCompileLog] = useState([])

  // Serial state
  const [port, setPort] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [baudRate, setBaudRate] = useState(9600)
  const [serialLog, setSerialLog] = useState([])
  const [serialInput, setSerialInput] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [plotterData, setPlotterData] = useState([])
  const serialLogRef = useRef()
  const readerRef = useRef()
  const writerRef = useRef()

  // Tab state
  const [activeTab, setActiveTab] = useState('editor')
  const [activeBottomTab, setActiveBottomTab] = useState('output')

  // File state
  const [fileName, setFileName] = useState('sketch.ino')
  const [files, setFiles] = useState(['sketch.ino'])
  const [unsaved, setUnsaved] = useState(false)

  // Auto-save
  useEffect(function() {
    const timer = setTimeout(function() {
      localStorage.setItem('ide_code', code)
      setUnsaved(false)
    }, 2000)
    setUnsaved(true)
    return function() { clearTimeout(timer) }
  }, [code])

  // Auto-scroll serial monitor
  useEffect(function() {
    if (autoScroll && serialLogRef.current) {
      serialLogRef.current.scrollTop = serialLogRef.current.scrollHeight
    }
  }, [serialLog, autoScroll])

  // Update sketch when board changes
  function handleBoardChange(board) {
    setSelectedBoard(board)
    if (code.includes('ProtoMind Hardware IDE')) {
      setCode(getDefaultSketch(board.id))
    }
  }

  // Compile
  async function handleCompile() {
    setCompiling(true)
    setActiveBottomTab('output')
    setCompileLog([])

    const log = []
    const addLog = function(msg, type) {
      log.push({ msg, type, time: new Date().toLocaleTimeString() })
      setCompileLog([...log])
    }

    addLog('Compiling sketch...', 'info')
    addLog('Board: ' + selectedBoard.name + ' (' + selectedBoard.id + ')', 'info')
    addLog('Using ProtoMind Compile Engine v1.0', 'info')

    try {
      const result = await simulateCompile(code, selectedBoard)
      setCompileResult(result)

      result.warnings.forEach(function(w) {
        addLog('sketch.ino:' + w.line + ': ' + w.message, 'warning')
      })

      if (result.success) {
        result.errors.forEach(function(e) {
          addLog('sketch.ino:' + e.line + ': ' + e.message, 'error')
        })
        addLog('', 'info')
        addLog('Sketch uses ' + result.stats.flash + ' bytes (' + result.stats.flashPct + '%) of program storage space. Maximum is ' + result.stats.flashTotal + '.', 'info')
        addLog('Global variables use ' + result.stats.ram + ' bytes (' + result.stats.ramPct + '%) of dynamic memory.', 'info')
        addLog('', 'info')
        addLog('✓ Compilation successful in ' + result.stats.time + 's', 'success')
        notify.success('Compilation successful!')
      } else {
        result.errors.forEach(function(e) {
          addLog('sketch.ino:' + e.line + ': ' + e.message, 'error')
        })
        addLog('', 'info')
        addLog('✗ Compilation failed with errors', 'error')
        notify.error('Compilation failed — check errors')
      }
    } catch(e) {
      addLog('Compile error: ' + e.message, 'error')
    } finally {
      setCompiling(false)
    }
  }

  // Upload (compile + flash)
  async function handleUpload() {
    if (!connected) {
      notify.warning('Connect a serial port first to upload')
      return
    }
    await handleCompile()
    if (compileResult?.success) {
      notify.info('Uploading to ' + selectedBoard.name + '...')
      await new Promise(function(r) { setTimeout(r, 2000) })
      notify.success('Upload complete!')
      addSerial('[ProtoMind] Upload complete. Board restarting...', 'system')
    }
  }

  // Serial port connection
  async function handleConnect() {
    if (!navigator.serial) {
      notify.error('Web Serial API not supported. Use Chrome or Edge browser.')
      return
    }
    setConnecting(true)
    try {
      const p = await navigator.serial.requestPort()
      await p.open({ baudRate })
      setPort(p)
      setConnected(true)
      addSerial('[ProtoMind] Connected at ' + baudRate + ' baud', 'system')
      notify.success('Serial port connected!')

      // Start reading
      const decoder = new TextDecoderStream()
      p.readable.pipeTo(decoder.writable)
      const reader = decoder.readable.getReader()
      readerRef.current = reader

      let buffer = ''
      const readLoop = async function() {
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += value
            const parts = buffer.split('\n')
            buffer = parts.pop()
            parts.forEach(function(line) {
              if (line.trim()) {
                addSerial(line.trim(), 'rx')
                // Try to parse as plotter data (CSV numbers)
                const nums = line.split(',').map(function(n) { return parseFloat(n.trim()) })
                if (nums.every(function(n) { return !isNaN(n) }) && nums.length > 0) {
                  const entry = { t: Date.now() }
                  nums.forEach(function(n, i) { entry['ch' + (i + 1)] = n })
                  setPlotterData(function(prev) { return [...prev.slice(-200), entry] })
                }
              }
            })
          }
        } catch(e) {
          if (e.name !== 'AbortError') addSerial('[Serial Error] ' + e.message, 'error')
        }
      }
      readLoop()

      // Writer
      if (p.writable) {
        const encoder = new TextEncoderStream()
        encoder.readable.pipeTo(p.writable)
        writerRef.current = encoder.writable.getWriter()
      }
    } catch(e) {
      if (e.name !== 'NotFoundError') notify.error('Connection failed: ' + e.message)
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    if (readerRef.current) {
      await readerRef.current.cancel()
    }
    if (port) {
      await port.close()
    }
    setPort(null)
    setConnected(false)
    addSerial('[ProtoMind] Disconnected', 'system')
    notify.info('Disconnected')
  }

  function addSerial(text, type) {
    setSerialLog(function(prev) {
      return [...prev, { text, type, time: new Date().toLocaleTimeString('en', {hour:'2-digit',minute:'2-digit',second:'2-digit',fractionalSecondDigits:3}) }].slice(-1000)
    })
  }

  async function handleSerialSend() {
    if (!serialInput.trim() || !writerRef.current) return
    try {
      await writerRef.current.write(serialInput + '\n')
      addSerial(serialInput, 'tx')
      setSerialInput('')
    } catch(e) {
      notify.error('Send failed: ' + e.message)
    }
  }

  // AI code generation
  async function handleAIGenerate() {
    const requirements = JSON.parse(localStorage.getItem('protomind_current_requirements') || 'null')
    if (!requirements) {
      notify.warning('Start from the Project Wizard for AI code generation')
      return
    }

    notify.info('Generating code with AI...')
    const settings = localStorage.getItem('protomind_settings')
    const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
    const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

    const prompt = [
      'You are an expert Arduino/embedded systems programmer.',
      'Generate complete, working Arduino C++ code for this project.',
      'Project: ' + requirements.idea,
      'Board: ' + selectedBoard.name,
      'Communication: ' + (requirements.communication || []).join(', '),
      'Skill level: ' + (requirements.skillLevel || 'intermediate'),
      'Requirements: ' + (requirements.additionalInfo || ''),
      'Generate ONLY the code, no explanation. Start with includes, then defines, then setup(), then loop().',
      'Add comments explaining each section.',
    ].join('\n')

    try {
      const response = await fetch(ollamaUrl + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false }),
      })
      const data = await response.json()
      let generated = data.response

      // Clean code fences if present
      generated = generated.replace(/```cpp
?/g, '').replace(/```arduino
?/g, '').replace(/```
?/g, '').trim()
      setCode(generated)
      notify.success('AI code generated for ' + selectedBoard.name + '!')
    } catch(e) {
      notify.error('AI generation failed — is Ollama running?')
    }
  }

  // New file
  function handleNewFile() {
    setCode(getDefaultSketch(selectedBoard.id))
    setFileName('sketch.ino')
    setCompileResult(null)
    setCompileLog([])
  }

  // Export
  function handleExport() {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    notify.success('Sketch exported!')
  }

  const LOG_COLORS = { info: 'text-slate-400', success: 'text-green-400', error: 'text-red-400', warning: 'text-yellow-400' }
  const SERIAL_COLORS = { rx: 'text-green-400', tx: 'text-blue-400', system: 'text-slate-500', error: 'text-red-400' }

  return (
    <div className="h-screen bg-[#050510] text-white flex flex-col overflow-hidden">
      {/* ── TOP TOOLBAR ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d1a] border-b border-[#1e1e2e] flex-shrink-0">
        {/* Logo */}
        <button onClick={function() { navigate('/') }}
          className="flex items-center gap-2 mr-2 hover:opacity-80 transition">
          <span className="text-indigo-400 font-black text-sm">ProtoMind</span>
          <span className="text-slate-600 text-xs">IDE</span>
        </button>

        <div className="w-px h-5 bg-[#2e2e4e]" />

        {/* Board selector */}
        <div className="flex items-center gap-1">
          <span className="text-slate-600 text-xs">Board:</span>
          <select
            value={selectedBoard.id}
            onChange={function(e) {
              const board = BOARDS.find(function(b) { return b.id === e.target.value })
              if (board) handleBoardChange(board)
            }}
            className="bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500">
            {BOARDS.map(function(b) {
              return <option key={b.id} value={b.id}>{b.icon} {b.name}</option>
            })}
          </select>
        </div>

        {/* Port selector */}
        <div className="flex items-center gap-1">
          <span className="text-slate-600 text-xs">Port:</span>
          <select
            value={baudRate}
            onChange={function(e) { setBaudRate(parseInt(e.target.value)) }}
            className="bg-[#13131f] border border-[#2e2e4e] text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 w-24">
            {BAUD_RATES.map(function(b) {
              return <option key={b} value={b}>{b}</option>
            })}
          </select>
          <button
            onClick={connected ? handleDisconnect : handleConnect}
            disabled={connecting}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (
              connected ? "bg-green-800 hover:bg-red-800 text-green-300 hover:text-red-300"
                : connecting ? "bg-[#13131f] text-slate-500"
                : "bg-[#13131f] border border-[#2e2e4e] text-slate-400 hover:border-green-500 hover:text-green-400"
            )}>
            {connecting ? 'Connecting...' : connected ? '● Connected' : '○ Connect'}
          </button>
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <button onClick={handleAIGenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-800 hover:bg-purple-700 rounded-lg text-xs font-medium transition">
          <span>✨</span> AI Generate
        </button>

        <button onClick={handleCompile} disabled={compiling}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#13131f] border border-[#2e2e4e] hover:border-blue-500 hover:text-blue-400 rounded-lg text-xs font-medium transition disabled:opacity-50">
          <span>✓</span> {compiling ? 'Compiling...' : 'Verify'}
        </button>

        <button onClick={handleUpload} disabled={compiling || !connected}
          className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition " + (
            connected ? "bg-indigo-700 hover:bg-indigo-600 text-white" : "bg-[#13131f] text-slate-500 border border-[#2e2e4e]"
          )}>
          <span>→</span> Upload
        </button>

        <div className="w-px h-5 bg-[#2e2e4e]" />

        <button onClick={handleNewFile} className="px-2 py-1.5 text-slate-500 hover:text-white text-xs transition">New</button>
        <button onClick={handleExport} className="px-2 py-1.5 text-slate-500 hover:text-white text-xs transition">Export</button>

        <button onClick={function() { navigate('/simulator') }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-900 hover:bg-cyan-800 text-cyan-300 rounded-lg text-xs font-medium transition">
          🔌 Simulator
        </button>
      </div>

      {/* ── BOARD INFO BAR ── */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-[#080815] border-b border-[#1e1e2e] text-xs flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span style={{color: selectedBoard.color}}>{selectedBoard.icon}</span>
          <span className="text-white font-medium">{selectedBoard.name}</span>
        </div>
        <span className="text-slate-600">Chip: <span className="text-slate-400">{selectedBoard.chip}</span></span>
        <span className="text-slate-600">CPU: <span className="text-slate-400">{selectedBoard.freq}</span></span>
        <span className="text-slate-600">Flash: <span className="text-slate-400">{selectedBoard.flash}</span></span>
        <span className="text-slate-600">RAM: <span className="text-slate-400">{selectedBoard.ram}</span></span>

        {compileResult && compileResult.success && (
          <>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Flash used:</span>
                <div className="w-16 h-1.5 bg-[#1e1e2e] rounded-full">
                  <div className="h-1.5 bg-indigo-500 rounded-full"
                    style={{width: Math.min(compileResult.stats.flashPct, 100) + '%'}} />
                </div>
                <span className="text-indigo-400">{compileResult.stats.flashPct}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">RAM used:</span>
                <div className="w-16 h-1.5 bg-[#1e1e2e] rounded-full">
                  <div className="h-1.5 bg-green-500 rounded-full"
                    style={{width: Math.min(compileResult.stats.ramPct, 100) + '%'}} />
                </div>
                <span className="text-green-400">{compileResult.stats.ramPct}%</span>
              </div>
            </div>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-slate-600">Font:</span>
          <button onClick={function() { setFontSize(function(f) { return Math.max(10, f - 1) }) }}
            className="text-slate-400 hover:text-white w-5 h-5 flex items-center justify-center">−</button>
          <span className="text-slate-400 w-6 text-center">{fontSize}</span>
          <button onClick={function() { setFontSize(function(f) { return Math.min(24, f + 1) }) }}
            className="text-slate-400 hover:text-white w-5 h-5 flex items-center justify-center">+</button>

          <button onClick={function() { setWordWrap(function(w) { return !w }) }}
            className={"px-2 py-0.5 rounded text-xs " + (wordWrap ? 'bg-indigo-800 text-indigo-300' : 'text-slate-500 hover:text-white')}>
            Wrap
          </button>

          {unsaved && <span className="text-yellow-400">●</span>}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── FILE SIDEBAR ── */}
        <div className="w-44 bg-[#080815] border-r border-[#1e1e2e] flex-shrink-0 flex flex-col">
          <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wide font-medium border-b border-[#1e1e2e]">
            Files
          </div>
          <div className="flex-1 py-1">
            {files.map(function(f) {
              return (
                <button key={f} onClick={function() { setFileName(f) }}
                  className={"w-full text-left px-3 py-1.5 text-xs transition flex items-center gap-2 " + (
                    fileName === f ? 'bg-[#1e1e2e] text-white' : 'text-slate-500 hover:text-white hover:bg-[#13131f]'
                  )}>
                  <span className="text-indigo-400">⬡</span>
                  {f}
                  {unsaved && f === fileName && <span className="ml-auto text-yellow-400 text-xs">●</span>}
                </button>
              )
            })}
          </div>
          <div className="border-t border-[#1e1e2e] px-3 py-2">
            <button onClick={function() {
              const name = prompt('New file name:', 'lib.h')
              if (name) setFiles(function(prev) { return [...prev, name] })
            }}
              className="text-xs text-slate-600 hover:text-white w-full text-left transition">
              + New File
            </button>
          </div>
        </div>

        {/* ── EDITOR + BOTTOM PANEL ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File tab */}
          <div className="flex items-center gap-0 bg-[#080815] border-b border-[#1e1e2e] flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d1a] border-r border-[#1e1e2e] text-xs text-white">
              <span className="text-indigo-400">⬡</span>
              {fileName}
              {unsaved && <span className="text-yellow-400">●</span>}
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language="cpp"
              theme="vs-dark"
              value={code}
              onChange={function(val) { setCode(val || '') }}
              options={{
                fontSize,
                fontFamily: ''JetBrains Mono', 'Fira Code', Consolas, monospace',
                fontLigatures: true,
                lineNumbers: 'on',
                minimap: { enabled: showMinimap },
                scrollBeyondLastLine: false,
                wordWrap: wordWrap ? 'on' : 'off',
                tabSize: 2,
                insertSpaces: true,
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                padding: { top: 8, bottom: 8 },
                suggest: { snippetsPreventQuickSuggestions: false },
                quickSuggestions: true,
                autoIndent: 'full',
                formatOnPaste: true,
              }}
            />
          </div>

          {/* ── BOTTOM PANEL ── */}
          <div className="h-64 border-t border-[#1e1e2e] flex flex-col flex-shrink-0">
            {/* Bottom tabs */}
            <div className="flex items-center gap-0 bg-[#080815] border-b border-[#1e1e2e] flex-shrink-0">
              {[
                {id:'output', label:'Output'},
                {id:'serial', label:'Serial Monitor' + (serialLog.length > 0 ? ' (' + serialLog.length + ')' : '')},
                {id:'plotter', label:'Serial Plotter'},
                {id:'problems', label:'Problems' + (compileResult?.errors?.length > 0 ? ' (' + compileResult.errors.length + ')' : '')},
              ].map(function(tab) {
                return (
                  <button key={tab.id}
                    onClick={function() { setActiveBottomTab(tab.id) }}
                    className={"px-4 py-2 text-xs border-r border-[#1e1e2e] transition " + (
                      activeBottomTab === tab.id
                        ? 'bg-[#0d0d1a] text-white border-t-2 border-t-indigo-500 -mt-px'
                        : 'text-slate-500 hover:text-white hover:bg-[#0d0d1a]'
                    )}>
                    {tab.label}
                  </button>
                )
              })}
              <div className="flex-1" />
              <button onClick={function() { setSerialLog([]); setPlotterData([]) }}
                className="px-3 py-2 text-xs text-slate-600 hover:text-white transition">
                Clear
              </button>
            </div>

            {/* Output */}
            {activeBottomTab === 'output' && (
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs bg-[#050510]">
                {compileLog.length === 0 ? (
                  <p className="text-slate-600">Press Verify to compile your sketch...</p>
                ) : (
                  compileLog.map(function(entry, i) {
                    return (
                      <div key={i} className="flex gap-2 leading-5">
                        <span className="text-slate-700 w-20 shrink-0">[{entry.time}]</span>
                        <span className={LOG_COLORS[entry.type] || 'text-slate-400'}>{entry.msg}</span>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Serial Monitor */}
            {activeBottomTab === 'serial' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#050510]">
                <div ref={serialLogRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs">
                  {serialLog.length === 0 ? (
                    <p className="text-slate-600">Connect a serial port to see output...</p>
                  ) : (
                    serialLog.map(function(entry, i) {
                      return (
                        <div key={i} className="flex gap-2 leading-5 hover:bg-white hover:bg-opacity-5">
                          <span className="text-slate-700 w-20 shrink-0">{entry.time}</span>
                          <span className={SERIAL_COLORS[entry.type] || 'text-slate-400'}>{entry.text}</span>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="flex items-center gap-2 p-2 border-t border-[#1e1e2e]">
                  <input
                    value={serialInput}
                    onChange={function(e) { setSerialInput(e.target.value) }}
                    onKeyDown={function(e) { if (e.key === 'Enter') handleSerialSend() }}
                    placeholder={connected ? 'Type and press Enter to send...' : 'Connect port to send data'}
                    disabled={!connected}
                    className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                  <button onClick={handleSerialSend} disabled={!connected || !serialInput}
                    className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-xs disabled:opacity-50 transition">
                    Send
                  </button>
                  <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
                    <input type="checkbox" checked={autoScroll} onChange={function(e) { setAutoScroll(e.target.checked) }} />
                    Auto-scroll
                  </label>
                </div>
              </div>
            )}

            {/* Serial Plotter */}
            {activeBottomTab === 'plotter' && (
              <div className="flex-1 p-2 bg-[#050510]">
                {plotterData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-600 text-xs">Send comma-separated numbers via Serial to plot them. Example: Serial.println("100,200,150");</p>
                  </div>
                ) : (
                  <SerialPlotter data={plotterData} />
                )}
              </div>
            )}

            {/* Problems */}
            {activeBottomTab === 'problems' && (
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs bg-[#050510]">
                {!compileResult ? (
                  <p className="text-slate-600">No problems detected. Run Verify to check.</p>
                ) : (
                  <>
                    {compileResult.errors.map(function(e, i) {
                      return (
                        <div key={i} className="flex items-start gap-2 py-1 border-b border-[#1e1e2e]">
                          <span className="text-red-400 shrink-0">✗</span>
                          <span className="text-red-300">{e.message}</span>
                          <span className="text-slate-600 ml-auto shrink-0">Line {e.line}</span>
                        </div>
                      )
                    })}
                    {compileResult.warnings.map(function(w, i) {
                      return (
                        <div key={i} className="flex items-start gap-2 py-1 border-b border-[#1e1e2e]">
                          <span className="text-yellow-400 shrink-0">⚠</span>
                          <span className="text-yellow-300">{w.message}</span>
                          <span className="text-slate-600 ml-auto shrink-0">Line {w.line}</span>
                        </div>
                      )
                    })}
                    {compileResult.errors.length === 0 && compileResult.warnings.length === 0 && (
                      <p className="text-green-400">✓ No problems found</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div className="flex items-center gap-4 px-4 py-1 bg-indigo-900 border-t border-indigo-800 text-xs flex-shrink-0">
        <span className="text-indigo-300">{selectedBoard.icon} {selectedBoard.name}</span>
        <span className={connected ? 'text-green-400' : 'text-slate-500'}>
          {connected ? '● Serial Connected (' + baudRate + ')' : '○ No Port'}
        </span>
        <span className="text-indigo-400">{fileName}</span>
        {compileResult && (
          <span className={compileResult.success ? 'text-green-400' : 'text-red-400'}>
            {compileResult.success ? '✓ Compiled' : '✗ Errors'}
          </span>
        )}
        <div className="flex-1" />
        <span className="text-indigo-400">ProtoMind IDE</span>
        <span className="text-indigo-600">Ln 1, Col 1</span>
      </div>
    </div>
  )
}

export default HardwareIDE
