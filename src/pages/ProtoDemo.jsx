import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── DEMO SCRIPT ─────────────────────────────────────────────────────────────
const DEMO_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ProtoMind',
    subtitle: 'AI-Powered Hardware Engineering Platform',
    icon: '🚀',
    color: '#6366f1',
    path: '/',
    voice: 'Welcome to ProtoMind — the complete AI-native hardware engineering platform. I will show you the full workflow from idea to working prototype. Press Enter to continue.',
    autoFill: null,
  },
  {
    id: 'protospec_idea',
    title: 'ProtoSpec — Enter Idea',
    subtitle: 'Step 1 of 3: Describe your project',
    icon: '🧩',
    color: '#6366f1',
    path: '/protospec',
    voice: 'ProtoSpec is where every project begins. We are now filling in the project idea automatically. We are building a Smart Health Monitoring System using ESP32 that monitors heart rate, temperature, and blood oxygen, sends alerts to a mobile app via WiFi, and displays data on an OLED screen.',
    autoFill: {
      page: 'protospec',
      action: 'fillIdea',
      data: {
        idea: 'Smart Health Monitoring System using ESP32 — monitors heart rate, temperature, and blood oxygen. Sends real-time alerts to mobile app via WiFi. Displays live readings on OLED screen. Battery powered for 24 hour use.',
        purpose: 'Monitor patient health remotely and alert caregivers',
        users: 'Patients, caregivers, healthcare workers',
      }
    },
  },
  {
    id: 'protospec_requirements',
    title: 'ProtoSpec — Requirements',
    subtitle: 'Step 2 of 3: Set requirements',
    icon: '🧩',
    color: '#6366f1',
    path: '/protospec',
    voice: 'Now we set the requirements. Communication is WiFi for sending data to mobile. Power is battery since this is a wearable device. It will have an OLED display. Skill level is intermediate. Timeline is 2 months with 3 hours per day.',
    autoFill: {
      page: 'protospec',
      action: 'fillRequirements',
      data: {
        communication: ['wifi'],
        power: ['battery'],
        hasDisplay: 'Yes',
        hasMobileApp: 'Yes',
        budget: '$50',
        skillLevel: 'intermediate',
        months: 2,
        hoursPerDay: 3,
        parameters: 'Heart rate, blood oxygen SpO2, body temperature',
      }
    },
  },
  {
    id: 'protospec_components',
    title: 'ProtoSpec — AI Component Selection',
    subtitle: 'Step 3 of 3: AI picks best components',
    icon: '🧩',
    color: '#6366f1',
    path: '/protospec',
    voice: 'ProtoMind AI is now selecting the best components for this health monitoring project. It picked ESP32 as the main microcontroller for WiFi connectivity, MAX30102 for heart rate and blood oxygen, DHT22 for temperature, and OLED display to show live readings. These are the optimal choices for this use case.',
    autoFill: {
      page: 'protospec',
      action: 'pickComponents',
      data: {
        components: [
          { id: 3, name: 'ESP32', icon: '📡', category: 'Microcontroller', price: '$4-10', voltage: '3.3V' },
          { id: 25, name: 'MAX30102 Heart Rate', icon: '❤️', category: 'Sensor', price: '$3-8', voltage: '3.3V' },
          { id: 6, name: 'DHT22 Sensor', icon: '🌡️', category: 'Sensor', price: '$2-5', voltage: '3.3-5V' },
          { id: 13, name: 'OLED 128x64', icon: '🖥️', category: 'Display', price: '$3-8', voltage: '3.3V' },
          { id: 22, name: 'LiPo 3.7V', icon: '🔋', category: 'Power', price: '$3-10', voltage: '3.7V' },
        ]
      }
    },
  },
  {
    id: 'roadmap',
    title: 'ProtoPlan',
    subtitle: 'AI generates your daily schedule',
    icon: '🗺️',
    color: '#a855f7',
    path: '/roadmap',
    voice: 'ProtoPlan creates a personalized day-by-day project schedule. Based on 2 months and 3 hours per day, ProtoMind generates phases: Research, Hardware Setup, Sensor Integration, WiFi and App, Testing, and Launch. Each day has specific tasks, estimated hours, and deliverables.',
    autoFill: null,
  },
  {
    id: 'viewer',
    title: 'ProtoView',
    subtitle: '3D prototype visualization + 360 AI tools',
    icon: '🔭',
    color: '#22c55e',
    path: '/viewer',
    voice: 'ProtoView shows a 3D model of your health monitor prototype. You can see the ESP32, heart rate sensor, temperature sensor, OLED display, and battery — all connected with animated wires. Below are 360 AI-powered engineering tools organized in 7 categories. Every tool uses your project context automatically.',
    autoFill: null,
  },
  {
    id: 'features_design',
    title: 'Design & Build Tools',
    subtitle: '55 tools for circuit design',
    icon: '🔧',
    color: '#f97316',
    path: '/features/design-build',
    voice: 'The Design and Build category has 55 tools. Click any tool to expand it. For example — Wiring Diagram gives complete pin-by-pin connections. Power Budget Calculator shows the ESP32 uses 240 milliamps, MAX30102 uses 1 milliamp, DHT22 uses 1 milliamp — total is 250 milliamps, giving 20 hours of battery life from a 5000 milliamp-hour LiPo.',
    autoFill: null,
  },
  {
    id: 'protoscan',
    title: 'ProtoScan',
    subtitle: 'Identify any component from a photo',
    icon: '📷',
    color: '#06b6d4',
    path: '/protoscan',
    voice: 'ProtoScan identifies unknown components from photos. If you find an unlabeled sensor or chip, photograph it and ProtoMind tells you exactly what it is, its specifications, voltage, pin configuration, and how to connect it. It can also add it directly to your current project.',
    autoFill: null,
  },
  {
    id: 'simulator',
    title: 'ProtoSim',
    subtitle: 'Simulate circuits before building',
    icon: '🧪',
    color: '#10b981',
    path: '/simulator2',
    voice: 'ProtoSim is a full circuit simulator. We select ESP32 as the board. Add components — LEDs, sensors, buttons. Click pins to wire them. Press Run and watch the simulation — LEDs glow in real time, servo motors rotate, and the serial monitor shows output. Test your entire circuit before touching real hardware.',
    autoFill: {
      page: 'simulator',
      action: 'setupDemo',
      data: {}
    },
  },
  {
    id: 'ide',
    title: 'ProtoIDE',
    subtitle: 'VS Code-quality code editor',
    icon: '💻',
    color: '#64748b',
    path: '/ide',
    voice: 'ProtoIDE is a full VS Code-quality code editor built into ProtoMind. Write firmware for ESP32, Arduino, or Raspberry Pi Pico. The AI can generate complete code for your health monitoring project — reading the MAX30102 sensor, sending data over WiFi, displaying on OLED. Then compile and upload directly to your board via USB.',
    autoFill: {
      page: 'ide',
      action: 'fillCode',
      data: {
        code: `// ProtoMind Generated — Smart Health Monitor
// Project: Smart Health Monitoring System using ESP32
// Components: ESP32, MAX30102, DHT22, OLED 128x64, LiPo 3.7V

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MAX30105.h>
#include <heartRate.h>
#include <DHT.h>
#include <WiFi.h>

// Pin definitions
#define DHTPIN 4
#define DHTTYPE DHT22
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// WiFi credentials
const char* ssid = "YourWiFi";
const char* password = "YourPassword";

// Sensor objects
DHT dht(DHTPIN, DHTTYPE);
MAX30105 particleSensor;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Heart rate tracking
byte rates[4];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Initialize OLED
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextColor(WHITE);

  // Initialize MAX30102
  particleSensor.begin(Wire, I2C_SPEED_FAST);
  particleSensor.setup();

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  Serial.println("WiFi connected: " + WiFi.localIP().toString());
}

void loop() {
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= 4;
      beatAvg = 0;
      for (byte x = 0; x < 4; x++) beatAvg += rates[x];
      beatAvg /= 4;
    }
  }

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  float spO2 = 98.5; // Placeholder

  // Update OLED display
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Smart Health Monitor");
  display.println("-------------------");
  display.print("Heart Rate: ");
  display.print(beatAvg);
  display.println(" bpm");
  display.print("SpO2: ");
  display.print(spO2, 1);
  display.println(" %");
  display.print("Temp: ");
  display.print(temperature, 1);
  display.println(" C");
  display.display();

  // Send to serial for ProtoTwin
  Serial.print("{\\"heartrate\\":"); Serial.print(beatAvg);
  Serial.print(",\\"spo2\\":"); Serial.print(spO2, 1);
  Serial.print(",\\"temperature\\":"); Serial.print(temperature, 1);
  Serial.println("}");

  delay(1000);
}`
      }
    },
  },
  {
    id: 'chat',
    title: 'ProtoMentor',
    subtitle: 'Context-aware AI assistant',
    icon: '🤖',
    color: '#22c55e',
    path: '/protochat',
    voice: 'ProtoMentor is the AI assistant that knows your entire project. Ask anything — why is my MAX30102 not reading correctly, how do I send data to Firebase, what does this error mean, should I use I2C or SPI. ProtoMentor gives specific answers based on your health monitoring project context.',
    autoFill: null,
  },
  {
    id: 'digitaltwin',
    title: 'ProtoTwin',
    subtitle: 'Real hardware meets virtual prototype',
    icon: '🔮',
    color: '#f59e0b',
    path: '/digitaltwin',
    voice: 'ProtoTwin connects your physical ESP32 to ProtoMind via USB. The health monitor sends heart rate, SpO2, and temperature data over serial. ProtoTwin receives it and shows live gauge widgets — you see the values update in real time. You can also send commands back — trigger an alert, change display mode.',
    autoFill: null,
  },
  {
    id: 'finish',
    title: 'ProtoMind — Demo Complete',
    subtitle: 'The complete hardware engineering platform',
    icon: '🏆',
    color: '#22c55e',
    path: '/',
    voice: 'That is the complete ProtoMind workflow. ProtoSpec understood our idea and selected components. ProtoPlan created a daily schedule. ProtoView visualized the prototype in 3D with 360 AI tools. ProtoSim tested the circuit. ProtoIDE generated and ran the firmware. ProtoMentor answered questions. ProtoTwin connected real hardware. All free. All offline. All in one platform. Thank you.',
    autoFill: null,
  },
]

// ─── SPEAK ────────────────────────────────────────────────────────────────────
function speak(text, onEnd) {
  if (!window.speechSynthesis) { if (onEnd) onEnd(); return }
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.9
  utt.pitch = 1.0
  utt.volume = 1.0
  const voices = window.speechSynthesis.getVoices()
  const v = voices.find(function(v) { return v.name.includes('Google') && v.lang.startsWith('en') })
    || voices.find(function(v) { return v.lang.startsWith('en') })
    || voices[0]
  if (v) utt.voice = v
  utt.onend = function() { if (onEnd) onEnd() }
  window.speechSynthesis.speak(utt)
}

// ─── AUTO FILL HELPERS ────────────────────────────────────────────────────────
function autoFillStep(autoFill, navigate) {
  if (!autoFill) return

  if (autoFill.action === 'fillIdea') {
    try {
      const draft = {
        idea: autoFill.data.idea,
        purpose: autoFill.data.purpose,
        users: autoFill.data.users,
        communication: [],
        power: [],
        hasDisplay: '',
        hasMobileApp: '',
        budget: '',
        skillLevel: '',
        parameters: '',
        months: 2,
        hoursPerDay: 3,
        workingDays: ['mon','tue','wed','thu','fri'],
        startDate: new Date().toISOString().split('T')[0],
        additionalInfo: '',
      }
      localStorage.setItem('protomind_wizard_draft', JSON.stringify(draft))
      // Dispatch storage event to trigger ProtoSpec to reload
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'protomind_wizard_draft',
        newValue: JSON.stringify(draft)
      }))
    } catch(e) {}
  }

  if (autoFill.action === 'fillRequirements') {
    try {
      const existing = JSON.parse(localStorage.getItem('protomind_wizard_draft') || '{}')
      const updated = Object.assign({}, existing, autoFill.data)
      localStorage.setItem('protomind_wizard_draft', JSON.stringify(updated))
      window.dispatchEvent(new StorageEvent('storage', { key: 'protomind_wizard_draft', newValue: JSON.stringify(updated) }))
    } catch(e) {}
  }

  if (autoFill.action === 'pickComponents') {
    try {
      const existing = JSON.parse(localStorage.getItem('protomind_wizard_draft') || '{}')
      const req = {
        idea: existing.idea || 'Smart Health Monitoring System',
        skillLevel: existing.skillLevel || 'intermediate',
        components: autoFill.data.components,
        communication: existing.communication || ['wifi'],
        power: existing.power || ['battery'],
        timeline: {
          months: existing.months || 2,
          hoursPerDay: existing.hoursPerDay || 3,
          workingDays: existing.workingDays || ['mon','tue','wed','thu','fri'],
          startDate: existing.startDate || new Date().toISOString().split('T')[0],
        }
      }
      localStorage.setItem('protomind_current_requirements', JSON.stringify(req))
      // Save to all projects
      const all = JSON.parse(localStorage.getItem('protomind_all_projects') || '[]')
      const proj = { id: Date.now().toString(), idea: req.idea, selectedComponents: req.components, requirements: req, createdAt: new Date().toISOString(), isCurrent: true }
      all.unshift(proj)
      localStorage.setItem('protomind_all_projects', JSON.stringify(all))
      localStorage.setItem('protomind_viewer_state', JSON.stringify({ idea: req.idea, selectedComponents: req.components }))
    } catch(e) {}
  }

  if (autoFill.action === 'fillCode') {
    try {
      localStorage.setItem('ide_code', autoFill.data.code)
      localStorage.setItem('ide_project', 'Smart Health Monitor')
    } catch(e) {}
  }

  if (autoFill.action === 'setupDemo') {
    try {
      localStorage.setItem('ide_code', '// Smart Health Monitor simulation\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("Health Monitor Starting...");\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  Serial.println("Heart Rate: 72 bpm");\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}')
    } catch(e) {}
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProtoDemo() {
  const navigate = useNavigate()
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | speaking | waiting
  const [voiceOn, setVoiceOn] = useState(true)
  const [overallPct, setOverallPct] = useState(0)
  const stepIdxRef = useRef(0)
  const phaseRef = useRef('idle')
  const voiceOnRef = useRef(true)

  // Keep refs in sync
  useEffect(function() { stepIdxRef.current = stepIdx }, [stepIdx])
  useEffect(function() { phaseRef.current = phase }, [phase])
  useEffect(function() { voiceOnRef.current = voiceOn }, [voiceOn])

  // Global keyboard listener — always active
  useEffect(function() {
    function onKey(e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (!started) return
        if (phaseRef.current === 'waiting') {
          goToNext()
        } else if (phaseRef.current === 'speaking') {
          // Skip speech and go to waiting
          window.speechSynthesis.cancel()
          setPhase('waiting')
          phaseRef.current = 'waiting'
        }
      }
      if (e.key === ' ') {
        e.preventDefault()
        window.speechSynthesis.cancel()
      }
      if (e.key === 'Escape') {
        exitDemo()
      }
    }
    window.addEventListener('keydown', onKey)
    return function() { window.removeEventListener('keydown', onKey) }
  }, [started]) // only depends on started

  function runStep(idx) {
    const s = DEMO_STEPS[idx]
    if (!s) { setDone(true); return }

    setStepIdx(idx)
    setPhase('speaking')
    phaseRef.current = 'speaking'
    setOverallPct(Math.round(((idx + 1) / DEMO_STEPS.length) * 100))

    // Auto fill data first
    if (s.autoFill) {
      autoFillStep(s.autoFill, navigate)
    }

    // Navigate
    if (s.path) {
      navigate(s.path)
    }

    // Speak
    function afterSpeak() {
      setPhase('waiting')
      phaseRef.current = 'waiting'
    }

    if (voiceOnRef.current && s.voice) {
      // Small delay to let page render first
      setTimeout(function() {
        speak(s.voice, afterSpeak)
      }, 800)
    } else {
      setTimeout(afterSpeak, 600)
    }
  }

  function goToNext() {
    const next = stepIdxRef.current + 1
    if (next >= DEMO_STEPS.length) {
      setDone(true)
      window.speechSynthesis.cancel()
      navigate('/')
      return
    }
    runStep(next)
  }

  function startDemo() {
    setStarted(true)
    runStep(0)
  }

  function exitDemo() {
    window.speechSynthesis.cancel()
    setStarted(false)
    setDone(false)
    setStepIdx(0)
    setPhase('idle')
    navigate('/')
  }

  const step = DEMO_STEPS[stepIdx]

  // ── NOT STARTED ──────────────────────────────────────────────────────────────
  if (!started && !done) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050510] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 opacity-8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600 opacity-8 rounded-full blur-3xl" />
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(30,30,46,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(30,30,46,0.2) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <div className="text-8xl mb-4">🎬</div>
          <div className="inline-flex items-center gap-2 bg-red-950 border border-red-800 rounded-full px-5 py-2 text-red-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            ProtoDemo — Automated Guided Tour
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Proto<span className="text-red-400">Demo</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            A complete guided tour of ProtoMind for judges and presentations.
            ProtoMind fills in forms automatically, navigates between pages,
            and narrates each step with voice. You control the pace.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { key: 'Enter ↵', desc: 'Skip narration → Next step', icon: '⌨️' },
              { key: 'Space', desc: 'Mute current speech', icon: '🔇' },
              { key: 'Esc', desc: 'Exit demo anytime', icon: '✕' },
            ].map(function(k) {
              return (
                <div key={k.key} className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl p-4">
                  <div className="text-xl mb-2">{k.icon}</div>
                  <kbd className="text-indigo-400 font-black text-sm">{k.key}</kbd>
                  <p className="text-slate-500 text-xs mt-1">{k.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 mb-6 text-left">
            <p className="text-white font-bold mb-2 text-sm">Demo covers {DEMO_STEPS.length} steps:</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_STEPS.map(function(s) {
                return (
                  <span key={s.id} className="text-xs px-2 py-1 rounded-lg"
                    style={{ backgroundColor: s.color + '20', color: s.color }}>
                    {s.icon} {s.title.replace(' — ', ': ').split(':')[0]}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <button onClick={function() { setVoiceOn(function(v) { voiceOnRef.current = !v; return !v }) }}
              className={"px-4 py-2 rounded-xl border text-sm font-medium transition " + (voiceOn ? 'bg-green-950 border-green-700 text-green-400' : 'bg-[#1e1e2e] border-[#2e2e4e] text-slate-500')}>
              {voiceOn ? '🔊 Voice ON' : '🔇 Voice OFF'}
            </button>
            <span className="text-slate-600 text-sm">~6 minutes with voice · ~2 minutes without</span>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={function() { navigate('/') }}
              className="px-6 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl font-medium transition">
              Cancel
            </button>
            <button onClick={startDemo}
              className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-black text-xl transition shadow-2xl shadow-red-900/40">
              🎬 Start ProtoDemo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── DONE ─────────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050510] flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">🏆</div>
          <h1 className="text-4xl font-black text-white mb-3">ProtoDemo Complete!</h1>
          <p className="text-slate-400 mb-2">All {DEMO_STEPS.length} steps demonstrated.</p>
          <p className="text-slate-500 text-sm mb-8">Smart Health Monitoring project was used as the demo project.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={function() { setDone(false); setStarted(false); setStepIdx(0); navigate('/protodemo') }}
              className="px-6 py-3 bg-[#1e1e2e] text-slate-300 rounded-xl font-bold transition hover:bg-[#2e2e4e]">
              Restart Demo
            </button>
            <button onClick={function() { setDone(false); navigate('/') }}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg transition">
              Open ProtoMind →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── ACTIVE DEMO HUD ──────────────────────────────────────────────────────────
  return (
    <>
      {/* TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto">
        {/* Overall progress */}
        <div className="h-1 bg-[#1e1e2e]">
          <div className="h-1 transition-all duration-700 bg-gradient-to-r from-red-500 to-orange-500"
            style={{ width: overallPct + '%' }} />
        </div>
        <div className="bg-[#090910] border-b border-[#1e1e2e] px-4 py-2 flex items-center gap-3">
          {/* Live badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-black text-xs tracking-widest">DEMO</span>
          </div>
          <div className="w-px h-4 bg-[#2e2e4e]" />

          {/* Current step */}
          <span className="text-lg shrink-0">{step?.icon}</span>
          <div className="flex-1 min-w-0">
            <span className="text-white font-black text-sm">{step?.title}</span>
            <span className="text-slate-500 text-xs ml-2 hidden sm:inline">{step?.subtitle}</span>
          </div>

          {/* Step dots */}
          <div className="hidden sm:flex items-center gap-1">
            {DEMO_STEPS.map(function(_, i) {
              return (
                <div key={i} className={"rounded-full transition-all duration-300 " + (
                  i < stepIdx ? 'w-2 h-2 bg-green-500' :
                  i === stepIdx ? 'w-3 h-3 bg-red-400' :
                  'w-1.5 h-1.5 bg-[#2e2e4e]'
                )} />
              )
            })}
          </div>

          <span className="text-slate-600 text-xs shrink-0">{stepIdx + 1}/{DEMO_STEPS.length}</span>

          <button onClick={function() { setVoiceOn(function(v) { voiceOnRef.current = !v; return !v }) }}
            className="text-slate-500 hover:text-white text-base transition shrink-0" title="Toggle voice">
            {voiceOn ? '🔊' : '🔇'}
          </button>
          <button onClick={exitDemo}
            className="px-2 py-1 bg-[#1e1e2e] hover:bg-red-950 text-slate-500 hover:text-red-400 rounded-lg text-xs transition shrink-0">
            Exit
          </button>
        </div>
      </div>

      {/* BOTTOM NARRATION */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-auto">
        <div className="bg-[#090910] border-t-2 px-5 py-4"
          style={{ borderColor: step?.color + '60' }}>
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: step?.color + '20', border: '2px solid ' + step?.color + '40' }}>
              {step?.icon}
            </div>

            {/* Narration */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-black text-sm">{step?.title}</span>
                {phase === 'speaking' && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Speaking
                  </span>
                )}
                {phase === 'waiting' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-950 text-green-400">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                {step?.voice?.slice(0, 140)}...
              </p>
            </div>

            {/* Enter button */}
            <div className="shrink-0 text-center">
              <button onClick={function() {
                if (phase === 'speaking') {
                  window.speechSynthesis.cancel()
                  setPhase('waiting')
                  phaseRef.current = 'waiting'
                } else if (phase === 'waiting') {
                  goToNext()
                }
              }}
                className={"w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all " + (
                  phase === 'waiting'
                    ? 'border-green-500 bg-green-950 hover:bg-green-800 cursor-pointer animate-pulse'
                    : 'border-[#2e2e4e] bg-[#1e1e2e] cursor-pointer hover:border-indigo-500'
                )}>
                <span className="text-lg">{phase === 'waiting' ? '↵' : '⏭'}</span>
                <span className="text-xs" style={{ color: phase === 'waiting' ? '#4ade80' : '#475569' }}>
                  {phase === 'waiting' ? 'Enter' : 'Skip'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacers so page content isn't hidden */}
      <div style={{ height: '52px' }} />
      <div style={{ paddingBottom: '88px' }} />
    </>
  )
}
