import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const DEMO_STEPS = [
  {
    id: 'welcome', title: 'Welcome to ProtoMind', icon: '🚀', color: '#6366f1',
    path: '/',
    voice: 'Welcome to ProtoMind — the complete AI-native hardware engineering platform. I will demonstrate the full workflow from idea to working prototype using a Smart Health Monitoring System project.',
    fill: null,
  },
  {
    id: 'spec1', title: 'ProtoSpec — Enter Idea', icon: '🧩', color: '#6366f1',
    path: '/protospec',
    voice: 'ProtoSpec is where every project starts. I am now filling in our project idea — a Smart Health Monitoring System using ESP32 that monitors heart rate, temperature, and blood oxygen, and sends alerts via WiFi to a mobile app.',
    fill: function() {
      const d = { idea: 'Smart Health Monitoring System using ESP32. Monitors heart rate, temperature, and blood oxygen SpO2. Sends real-time alerts to mobile app via WiFi. Displays live readings on OLED screen. Battery powered for 24 hours.', purpose: 'Monitor patient health and alert caregivers', users: 'Patients and healthcare workers', communication: [], power: [], hasDisplay: '', hasMobileApp: '', budget: '', skillLevel: '', parameters: '', months: 2, hoursPerDay: 3, workingDays: ['mon','tue','wed','thu','fri'], startDate: new Date().toISOString().split('T')[0], additionalInfo: '' }
      localStorage.setItem('protomind_wizard_draft', JSON.stringify(d))
    },
  },
  {
    id: 'spec2', title: 'ProtoSpec — Requirements', icon: '🧩', color: '#6366f1',
    path: '/protospec',
    voice: 'Now setting requirements. Communication is WiFi for sending health data to the mobile app. Power is battery since this is a wearable. It has an OLED display and a companion mobile app. Skill level is intermediate. Timeline is 2 months with 3 hours per day.',
    fill: function() {
      const existing = JSON.parse(localStorage.getItem('protomind_wizard_draft') || '{}')
      const updated = Object.assign({}, existing, { communication: ['wifi'], power: ['battery'], hasDisplay: 'Yes', hasMobileApp: 'Yes', budget: '$50', skillLevel: 'intermediate', months: 2, hoursPerDay: 3, parameters: 'Heart rate, SpO2, temperature' })
      localStorage.setItem('protomind_wizard_draft', JSON.stringify(updated))
    },
  },
  {
    id: 'spec3', title: 'ProtoSpec — AI Components', icon: '🧩', color: '#6366f1',
    path: '/protospec',
    voice: 'ProtoMind AI selected the best components. ESP32 for WiFi connectivity. MAX30102 sensor for heart rate and blood oxygen. DHT22 for temperature. OLED display for live readings. And a LiPo battery for portable power. These are the optimal choices for this health monitoring use case.',
    fill: function() {
      const components = [
        { id: 3, name: 'ESP32', icon: '📡', category: 'Microcontroller', price: '$4-10', voltage: '3.3V' },
        { id: 25, name: 'MAX30102 Heart Rate', icon: '❤️', category: 'Sensor', price: '$3-8', voltage: '3.3V' },
        { id: 6, name: 'DHT22 Sensor', icon: '🌡️', category: 'Sensor', price: '$2-5', voltage: '3.3-5V' },
        { id: 13, name: 'OLED 128x64', icon: '🖥️', category: 'Display', price: '$3-8', voltage: '3.3V' },
        { id: 22, name: 'LiPo 3.7V', icon: '🔋', category: 'Power', price: '$3-10', voltage: '3.7V' },
      ]
      const req = { idea: 'Smart Health Monitoring System using ESP32', skillLevel: 'intermediate', components, communication: ['wifi'], power: ['battery'], hasDisplay: 'Yes', hasMobileApp: 'Yes', budget: '$50', timeline: { months: 2, hoursPerDay: 3, workingDays: ['mon','tue','wed','thu','fri'], startDate: new Date().toISOString().split('T')[0] } }
      localStorage.setItem('protomind_current_requirements', JSON.stringify(req))
      localStorage.setItem('protomind_viewer_state', JSON.stringify({ idea: req.idea, selectedComponents: components }))
      const all = JSON.parse(localStorage.getItem('protomind_all_projects') || '[]')
      all.unshift({ id: 'demo_' + Date.now(), idea: req.idea, selectedComponents: components, requirements: req, createdAt: new Date().toISOString(), isCurrent: true })
      localStorage.setItem('protomind_all_projects', JSON.stringify(all))
    },
  },
  {
    id: 'roadmap', title: 'ProtoPlan — AI Roadmap', icon: '🗺️', color: '#a855f7',
    path: '/roadmap',
    voice: 'ProtoPlan creates a personalized day-by-day schedule. Based on 2 months and 3 hours per day, ProtoMind generates phases — Research, Hardware Setup, Sensor Integration, WiFi and App development, Testing, and Launch. Each day has specific tasks and estimated hours.',
    fill: null,
  },
  {
    id: 'viewer', title: 'ProtoView — 3D Prototype', icon: '🔭', color: '#22c55e',
    path: '/viewer',
    voice: 'ProtoView renders a 3D model of your health monitor prototype. You can see the ESP32, heart rate sensor, temperature sensor, OLED display, and battery all connected with animated wires. Below are 360 AI-powered engineering tools in 7 categories. Every tool uses your project context automatically.',
    fill: null,
  },
  {
    id: 'features', title: 'Design & Build — 55 Tools', icon: '🔧', color: '#f97316',
    path: '/features/design-build',
    voice: 'The Design and Build category alone has 55 tools. Wiring Diagram gives complete pin-by-pin connections for all 5 components. Power Budget Calculator shows total current draw is 250 milliamps, giving 20 hours of battery life. Compatibility Checker verifies all components work together at 3.3 volts.',
    fill: null,
  },
  {
    id: 'protoscan', title: 'ProtoScan — Component ID', icon: '📷', color: '#06b6d4',
    path: '/protoscan',
    voice: 'ProtoScan identifies unknown components from photos. If you find an unlabeled sensor or chip, photograph it and ProtoMind identifies the name, specifications, voltage, pins, and how to connect it. It can add the component directly to your current project.',
    fill: null,
  },
  {
    id: 'simulator', title: 'ProtoSim — Circuit Simulation', icon: '🧪', color: '#10b981',
    path: '/simulator2',
    voice: 'ProtoSim is a full Wokwi-style circuit simulator. Select ESP32 as the board. Add components like LEDs, sensors, and servos. Click pins to wire them together. Press Run and watch LEDs glow in real time, servo motors rotate, and see serial monitor output — all without touching real hardware.',
    fill: function() {
      localStorage.setItem('ide_code', '// Smart Health Monitor Demo\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("Health Monitor Ready");\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  Serial.println("Heart Rate: 72 bpm | SpO2: 98% | Temp: 36.5C");\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}')
    },
  },
  {
    id: 'ide', title: 'ProtoIDE — Firmware Editor', icon: '💻', color: '#64748b',
    path: '/ide',
    voice: 'ProtoIDE is a VS Code-quality code editor built into ProtoMind. I have loaded the complete firmware for our health monitor — it reads the MAX30102 heart rate sensor, DHT22 temperature sensor, displays values on the OLED, and sends JSON data over WiFi. You can compile and upload directly to your ESP32 via USB.',
    fill: function() {
      localStorage.setItem('ide_code', '// ProtoMind Generated — Smart Health Monitor\n// ESP32 + MAX30102 + DHT22 + OLED\n\n#include <Wire.h>\n#include <DHT.h>\n\n#define DHTPIN 4\n#define DHTTYPE DHT22\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  Serial.println("Smart Health Monitor Starting...");\n}\n\nvoid loop() {\n  float temp = dht.readTemperature();\n  float humidity = dht.readHumidity();\n  int heartRate = 72 + random(-5, 5);\n  float spO2 = 98.5;\n\n  Serial.print("{\\"heartrate\\":");\n  Serial.print(heartRate);\n  Serial.print(",\\"spo2\\":");\n  Serial.print(spO2);\n  Serial.print(",\\"temperature\\":");\n  Serial.print(temp);\n  Serial.println("}");\n\n  delay(1000);\n}')
    },
  },
  {
    id: 'chat', title: 'ProtoMentor — AI Chat', icon: '🤖', color: '#22c55e',
    path: '/protochat',
    voice: 'ProtoMentor is your context-aware AI assistant. It knows your health monitoring project, all components, and your roadmap. Ask anything — how do I calibrate the MAX30102, what is the I2C address of my OLED, how do I send data to Firebase, or debug a sensor reading error. ProtoMentor gives specific answers for your exact project.',
    fill: null,
  },
  {
    id: 'twin', title: 'ProtoTwin — Digital Twin', icon: '🔮', color: '#f59e0b',
    path: '/digitaltwin',
    voice: 'ProtoTwin connects your physical ESP32 to ProtoMind via USB. The health monitor sends heart rate, SpO2, and temperature as JSON over serial. ProtoTwin receives it and shows live gauge widgets updating in real time. You can also control the device from the browser — trigger alerts, reset the display, change modes.',
    fill: null,
  },
  {
    id: 'finish', title: 'ProtoMind — Complete', icon: '🏆', color: '#22c55e',
    path: '/',
    voice: 'That is the complete ProtoMind workflow. From idea to 3D prototype to firmware to live hardware — all in one platform. ProtoSpec, ProtoPlan, ProtoView, ProtoScan, ProtoSim, ProtoIDE, ProtoMentor, and ProtoTwin. All free. AI runs locally on your machine. No subscription, no data sent to any server. Thank you.',
    fill: null,
  },
]

function speak(text, onEnd) {
  if (!window.speechSynthesis) { if (onEnd) onEnd(); return }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.9; u.pitch = 1.0; u.volume = 1.0
  const voices = window.speechSynthesis.getVoices()
  const v = voices.find(function(v) { return v.name.includes('Google') && v.lang.startsWith('en') })
    || voices.find(function(v) { return v.lang.startsWith('en') })
  if (v) u.voice = v
  u.onend = function() { if (onEnd) onEnd() }
  window.speechSynthesis.speak(u)
}

export default function ProtoDemoOverlay({ active, onExit }) {
  const navigate = useNavigate()
  const [stepIdx, setStepIdx] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [voiceOn, setVoiceOn] = useState(true)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)

  // Use refs for values needed inside event listeners
  const stepRef = useRef(0)
  const phaseRef = useRef('idle')
  const voiceRef = useRef(true)
  const startedRef = useRef(false)

  stepRef.current = stepIdx
  phaseRef.current = phase
  voiceRef.current = voiceOn
  startedRef.current = started

  // ── Keyboard: always listen when active ──────────────────────────────────
  useEffect(function() {
    if (!active) return

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleExit()
        return
      }
      if (!startedRef.current) return
      if (e.key === 'Enter') {
        e.preventDefault()
        handleEnter()
      }
      if (e.key === ' ') {
        e.preventDefault()
        window.speechSynthesis.cancel()
        if (phaseRef.current === 'speaking') {
          setPhase('waiting')
          phaseRef.current = 'waiting'
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return function() { window.removeEventListener('keydown', onKey) }
  }, [active]) // only re-run when active changes

  function handleEnter() {
    if (phaseRef.current === 'speaking') {
      // Skip speech, go to waiting
      window.speechSynthesis.cancel()
      setPhase('waiting')
      phaseRef.current = 'waiting'
    } else if (phaseRef.current === 'waiting') {
      advance()
    }
  }

  function advance() {
    const next = stepRef.current + 1
    if (next >= DEMO_STEPS.length) {
      window.speechSynthesis.cancel()
      setDone(true)
      return
    }
    doStep(next)
  }

  function doStep(idx) {
    const s = DEMO_STEPS[idx]
    if (!s) return

    setStepIdx(idx)
    stepRef.current = idx
    setPhase('speaking')
    phaseRef.current = 'speaking'

    // Run auto-fill
    if (s.fill) {
      try { s.fill() } catch(e) {}
    }

    // Navigate
    navigate(s.path)

    // Speak
    function afterSpeak() {
      setPhase('waiting')
      phaseRef.current = 'waiting'
    }

    if (voiceRef.current) {
      setTimeout(function() { speak(s.voice, afterSpeak) }, 600)
    } else {
      setTimeout(afterSpeak, 400)
    }
  }

  function startDemo() {
    setStarted(true)
    startedRef.current = true
    setDone(false)
    doStep(0)
  }

  function handleExit() {
    window.speechSynthesis.cancel()
    setStarted(false)
    startedRef.current = false
    setDone(false)
    setStepIdx(0)
    stepRef.current = 0
    setPhase('idle')
    phaseRef.current = 'idle'
    onExit()
  }

  if (!active) return null

  const step = DEMO_STEPS[stepIdx]
  const pct = Math.round(((stepIdx + 1) / DEMO_STEPS.length) * 100)

  // ── WELCOME SCREEN ───────────────────────────────────────────────────────
  if (!started && !done) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050510] flex items-center justify-center" style={{backdropFilter:'blur(4px)'}}>
        <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(30,30,46,0.25) 1px,transparent 1px),linear-gradient(90deg,rgba(30,30,46,0.25) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
        <div className="relative z-10 text-center max-w-xl mx-auto px-6">
          <div className="text-7xl mb-4">🎬</div>
          <h1 className="text-5xl font-black text-white mb-2">Proto<span className="text-red-400">Demo</span></h1>
          <p className="text-slate-400 text-base mb-6 leading-relaxed">
            Guided tour of ProtoMind for judges and presentations.<br/>
            ProtoMind fills forms, navigates, and narrates automatically.<br/>
            <strong className="text-white">You control the pace with Enter.</strong>
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
            {[['⌨️','Enter','Skip speech / Next step'],['🔇','Space','Mute current narration'],['✕','Esc','Exit demo']].map(function(k){return(
              <div key={k[1]} className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl p-3">
                <div className="text-xl mb-1">{k[0]}</div>
                <div className="text-indigo-400 font-black text-sm">{k[1]}</div>
                <div className="text-slate-600 text-xs mt-0.5">{k[2]}</div>
              </div>
            )})}
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <button onClick={function(){setVoiceOn(function(v){voiceRef.current=!v;return !v})}}
              className={"px-4 py-2 rounded-xl border text-sm font-medium transition "+(voiceOn?'bg-green-950 border-green-700 text-green-400':'bg-[#1e1e2e] border-[#2e2e4e] text-slate-500')}>
              {voiceOn ? '🔊 Voice ON' : '🔇 Voice OFF'}
            </button>
            <span className="text-slate-600 text-sm">{DEMO_STEPS.length} steps · Smart Health Monitor project</span>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={handleExit} className="px-6 py-3 bg-[#1e1e2e] text-slate-400 rounded-xl font-medium transition hover:bg-[#2e2e4e]">Cancel</button>
            <button onClick={startDemo} className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-black text-xl transition hover:from-red-500 hover:to-orange-400 shadow-2xl shadow-red-900/40">
              🎬 Start Demo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── DONE SCREEN ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050510] flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-4xl font-black text-white mb-2">Demo Complete!</h1>
          <p className="text-slate-400 mb-8">All {DEMO_STEPS.length} features demonstrated successfully.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={function(){setDone(false);setStarted(false);setStepIdx(0);stepRef.current=0}} className="px-6 py-3 bg-[#1e1e2e] text-slate-300 rounded-xl font-bold transition hover:bg-[#2e2e4e]">Restart</button>
            <button onClick={handleExit} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg transition">Open ProtoMind →</button>
          </div>
        </div>
      </div>
    )
  }

  // ── ACTIVE HUD ───────────────────────────────────────────────────────────
  return (
    <>
      {/* TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-[9999]" style={{pointerEvents:'auto'}}>
        <div className="h-1 bg-[#1e1e2e]">
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500" style={{width:pct+'%'}}/>
        </div>
        <div className="bg-[#09090f] border-b border-[#1e1e2e] px-4 py-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
            <span className="text-red-400 font-black text-xs tracking-widest">LIVE DEMO</span>
          </div>
          <div className="w-px h-4 bg-[#2e2e4e]"/>
          <span className="text-xl shrink-0">{step?.icon}</span>
          <div className="flex-1 min-w-0">
            <span className="text-white font-black text-sm">{step?.title}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {DEMO_STEPS.map(function(_,i){return(
              <div key={i} className={"rounded-full transition-all "+(i<stepIdx?'w-2 h-2 bg-green-500':i===stepIdx?'w-3 h-3 bg-red-400 animate-pulse':'w-1.5 h-1.5 bg-[#2e2e4e]')}/>
            )})}
          </div>
          <span className="text-slate-600 text-xs shrink-0">{stepIdx+1}/{DEMO_STEPS.length}</span>
          <button onClick={function(){setVoiceOn(function(v){voiceRef.current=!v;return !v})}} className="text-slate-500 hover:text-white transition shrink-0">{voiceOn?'🔊':'🔇'}</button>
          <button onClick={handleExit} className="px-2 py-1 bg-[#1e1e2e] hover:bg-red-950 text-slate-500 hover:text-red-400 rounded-lg text-xs transition shrink-0">Exit</button>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999]" style={{pointerEvents:'auto'}}>
        <div className="bg-[#09090f] border-t-2 px-5 py-3" style={{borderColor:(step?.color||'#6366f1')+'60'}}>
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{backgroundColor:(step?.color||'#6366f1')+'20',border:'2px solid '+(step?.color||'#6366f1')+'40'}}>
              {step?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-black text-xs">{step?.title}</span>
                <span className={"text-xs px-2 py-0.5 rounded-full "+(phase==='speaking'?'bg-red-950 text-red-400':'bg-green-950 text-green-400')}>
                  {phase==='speaking'?'🎙️ Speaking...':'✓ Press Enter'}
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed truncate">{step?.voice?.slice(0,120)}...</p>
            </div>
            <button
              onClick={handleEnter}
              className={"w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shrink-0 "+(
                phase==='waiting'
                  ? 'border-green-500 bg-green-950 hover:bg-green-800 animate-pulse'
                  : 'border-indigo-600 bg-indigo-950 hover:bg-indigo-900'
              )}>
              <span className="text-lg">{phase==='waiting'?'↵':'⏭'}</span>
              <span className="text-xs" style={{color:phase==='waiting'?'#4ade80':'#818cf8'}}>{phase==='waiting'?'Next':'Skip'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spacers */}
      <div style={{height:'48px'}}/>
      <div style={{paddingBottom:'80px'}}/>
    </>
  )
}
