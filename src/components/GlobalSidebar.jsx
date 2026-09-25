import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notify } from '../services/toast'

// ─── LOAD ALL PROJECTS ────────────────────────────────────────────────────────
function loadAllProjectsWithRoadmaps() {
  const projects = []
  try {
    const allRaw = localStorage.getItem('protomind_all_projects')
    const all = allRaw ? JSON.parse(allRaw) : []
    all.forEach(function(p) {
      const roadmapKey = 'protomind_roadmap_' + btoa(p.idea || '').slice(0, 20)
      const roadmapRaw = localStorage.getItem(roadmapKey)
      const roadmap = roadmapRaw ? JSON.parse(roadmapRaw) : null
      projects.push({ id: p.id || p.idea, idea: p.idea, components: p.selectedComponents || [], roadmap: roadmap?.roadmap || null, completedDays: roadmap?.completedDays || {}, createdAt: p.createdAt || new Date().toISOString() })
    })
    const currRaw = localStorage.getItem('protomind_current_requirements')
    const curr = currRaw ? JSON.parse(currRaw) : null
    if (curr && curr.idea && !projects.find(function(p) { return p.idea === curr.idea })) {
      const roadmapKey = 'protomind_roadmap_' + btoa(curr.idea).slice(0, 20)
      const roadmapRaw = localStorage.getItem(roadmapKey)
      const roadmap = roadmapRaw ? JSON.parse(roadmapRaw) : null
      projects.unshift({ id: curr.idea, idea: curr.idea, components: curr.components || [], roadmap: roadmap?.roadmap || null, completedDays: roadmap?.completedDays || {}, createdAt: curr.createdAt || new Date().toISOString(), isCurrent: true })
    }
  } catch(e) {}
  return projects
}

// ─── USER MANUAL PAGES ────────────────────────────────────────────────────────
const MANUAL_PAGES = [
  {
    title: 'Welcome to ProtoMind',
    icon: '🚀',
    color: '#6366f1',
    content: 'ProtoMind is an AI-native hardware development platform that takes your idea from concept to working prototype. Whether you are a beginner or an experienced engineer, ProtoMind guides you every step of the way.',
    features: [
      'Turn any idea into a complete prototype specification',
      '360+ AI-powered engineering tools',
      'Live circuit simulation — no hardware needed',
      'Real hardware connection and monitoring',
      'Personalized daily project roadmap',
    ],
    tip: 'Start with ProtoSpec to get the best results. The more requirements you provide, the smarter ProtoMind becomes.',
  },
  {
    title: '🧩 ProtoSpec — Requirements Intelligence',
    icon: '🧩',
    color: '#6366f1',
    content: 'ProtoSpec converts your natural language idea into a structured Engineering Requirement Specification. Instead of jumping straight to components, ProtoMind first understands exactly what you want to build.',
    features: [
      'Describe your idea in plain English',
      'Set communication needs (WiFi, Bluetooth, LoRa...)',
      'Choose power source, display, mobile app requirements',
      'Set your skill level so AI adjusts complexity',
      'Define timeline: months available + hours per day',
      'AI picks the best components based on your specs',
    ],
    tip: 'Click the 🧩 ProtoSpec icon in the left sidebar or visit /protospec to start.',
    howTo: 'Step 1: Enter your idea → Step 2: Fill requirements → Step 3: Pick components → Step 4: Generate Roadmap',
  },
  {
    title: '🗺️ ProtoPlan — AI Project Mentor',
    icon: '🗺️',
    color: '#a855f7',
    content: 'ProtoPlan creates a personalized day-by-day project schedule based on your available time. After each day, you report progress and the AI adapts your remaining schedule.',
    features: [
      'AI generates phase-based roadmap (Research → Hardware → Software → Testing → Launch)',
      'Daily tasks tailored to your skill level',
      'Each day shows estimated hours and deliverables',
      'Mark days complete — progress saves automatically',
      'Go to ProtoSim or ProtoIDE directly from any day',
      'Progress ring shows overall completion',
    ],
    tip: 'Click 🗺️ in the sidebar to open ProtoPlan panel — see all your projects and daily tasks without leaving the page.',
    howTo: 'Click day → See tasks → Click Simulate to test → Click Done when finished → AI adapts schedule',
  },
  {
    title: '📷 ProtoScan — AI Component Identification',
    icon: '📷',
    color: '#06b6d4',
    content: 'ProtoScan identifies unknown electronic components from a photo. Upload or capture an image and ProtoMind tells you exactly what it is, how to connect it, and whether it works with your current project.',
    features: [
      'Upload photo or use camera directly',
      'Identifies name, category, part number, voltage, pins',
      'Shows how to connect the component',
      'Matches against 200+ component database',
      'One-click add to your current project',
      'Scan history saved locally',
    ],
    tip: 'Best results: good lighting, component markings visible, full PCB in frame.',
    howTo: 'Click 📷 in sidebar → Upload photo → Identify → Add to Prototype',
  },
  {
    title: '🔭 ProtoView — 3D Prototype Viewer',
    icon: '🔭',
    color: '#22c55e',
    content: 'ProtoView renders a realistic 3D visualization of your prototype. See exactly how your components connect before buying or building anything.',
    features: [
      'Realistic 3D models for 200+ components',
      'Animated wire connections with copper traces',
      'PCB board with mounting holes and via holes',
      'Rotate, zoom and inspect from any angle',
      '360+ AI tools organized in 7 categories below the viewer',
      "Today's roadmap task shown at the top",
    ],
    tip: 'The 7 tabs below the 3D view contain all AI tools: Design & Build, Code & Dev, Testing & QA, Business, Planning, Content, Learn & Share.',
    howTo: 'Complete ProtoSpec + ProtoPlan first → ProtoView opens automatically',
  },
  {
    title: '🧪 ProtoSim — Hardware Simulator',
    icon: '🧪',
    color: '#10b981',
    content: 'ProtoSim is a Wokwi-style circuit simulator built into ProtoMind. Simulate your circuit before touching real hardware. LEDs glow, servos rotate, sensors read values.',
    features: [
      'Realistic SVG boards: Arduino Uno, Nano, ESP32, Raspberry Pi Pico',
      '18+ components: LEDs, buttons, sensors, servo, OLED, relay',
      'Click-to-connect pin wiring with color-coded wires',
      'Code from ProtoIDE loads automatically',
      'Serial monitor shows output in real time',
      'Simplified Arduino C++ interpreter runs setup() and loop()',
    ],
    tip: 'Load code from ProtoIDE using the "Load from IDE" button in the Code tab.',
    howTo: 'Click 🔌 ProtoSim in sidebar → Pick board → Add components → Wire pins → Click Run',
  },
  {
    title: '💻 ProtoIDE — Hardware Development Environment',
    icon: '💻',
    color: '#64748b',
    content: 'ProtoIDE is a full VS Code-quality code editor inside ProtoMind. Write, compile, upload firmware and monitor serial output — all without leaving the browser.',
    features: [
      'Monaco Editor — same engine as VS Code',
      'Full C++ syntax highlighting and autocomplete',
      'Supports 8 boards: Arduino Uno/Nano/Mega/Leonardo, ESP32, ESP8266, Pi Pico, MKR1000',
      'Compile checking with flash/RAM usage display',
      'Web Serial API — connect real hardware via USB',
      'Serial Monitor and Serial Plotter built in',
      'AI code generation from your project requirements',
    ],
    tip: 'Use Cmd+K (or Ctrl+K) to open global search from anywhere.',
    howTo: 'Click 💻 ProtoIDE in sidebar → Select board → Write or AI-generate code → Verify → Connect port → Upload',
  },
  {
    title: '🔗 ProtoLink + 🔮 ProtoTwin',
    icon: '🔗',
    color: '#f59e0b',
    content: 'ProtoLink connects your real Arduino or ESP32 to ProtoMind via USB. ProtoTwin creates a live digital mirror of your physical hardware — real sensor data reflected in virtual widgets.',
    features: [
      'Web Serial API — direct USB connection in Chrome/Edge',
      'Auto-detects board and baud rate',
      'Receives JSON, CSV, or Key=Value sensor data',
      'Live gauge widgets for temperature, humidity, distance, gas',
      'Control outputs: toggle LEDs, move servos, activate relays',
      'Serial log with full message history',
      'Arduino code template included and ready to upload',
    ],
    tip: 'Demo mode runs with simulated data even without real hardware connected.',
    howTo: 'Click 🔗 ProtoLink in sidebar → Connect → See live data → Control outputs',
  },
  {
    title: '🔧 Design & Build Tools (in ProtoView)',
    icon: '🔧',
    color: '#f97316',
    content: 'The Design & Build category in ProtoView contains all engineering tools for creating your circuit.',
    features: [
      'Component Inspector — full specs for any component',
      'Wiring Diagram — pin-by-pin connections with wire colors',
      'Compatibility Checker — voltage and protocol conflicts',
      'Power Budget Calculator — current draw per component',
      'PCB Layout Planner — placement and trace routing',
      'Signal Integrity Checker — I2C/SPI/UART analysis',
      'Circuit Simulator — live LED/sensor/servo simulation',
      'Battery Management — BMS design with runtime estimates',
    ],
    tip: 'Open ProtoView → Click the 🔧 Design & Build tab to see all these tools.',
  },
  {
    title: '📈 Business + 📋 Planning Tools',
    icon: '📈',
    color: '#22c55e',
    content: 'ProtoMind is not just a hardware tool — it helps take your prototype to market. Business tools help with investors, sales, and launch. Planning tools manage timeline and resources.',
    features: [
      'Investor Pitch — complete pitch deck with financials',
      'Revenue Projection — 3-year forecast with scenarios',
      'Product Hunt Launch — tagline, description, schedule',
      'MVP Scope Definer — MoSCoW prioritisation',
      'Risk Register — identify and track project risks',
      'Sprint Retrospective — agile team retrospectives',
      'BOM Cost Optimizer — compare prices across suppliers',
      'Manufacturing Guide — scaling from prototype to product',
    ],
    tip: 'Find these in ProtoView under the 📈 Business and 📋 Planning tabs.',
  },
  {
    title: '⌨️ Keyboard Shortcuts & Tips',
    icon: '⌨️',
    color: '#6366f1',
    content: 'ProtoMind has several shortcuts to speed up your workflow.',
    features: [
      'Cmd+K (Mac) / Ctrl+K (Windows) — Global search, navigate anywhere',
      'Sidebar hover — icons zoom in with label and description',
      'Click 🗺️ in sidebar — ProtoPlan panel slides open, no page change',
      'ProtoSpec auto-saves your draft as you type',
      'ProtoSim ↔ ProtoIDE — code syncs automatically via shared storage',
      'Dark theme throughout — optimized for long coding sessions',
    ],
    tip: 'The sidebar hides itself on fullscreen pages (ProtoIDE, ProtoSim) to give you more space.',
    howTo: 'Complete the recommended flow: ProtoSpec → ProtoPlan → ProtoView → ProtoSim → ProtoIDE → ProtoLink → ProtoTwin',
  },
]

// ─── USER MANUAL MODAL ────────────────────────────────────────────────────────
function UserManual({ onClose }) {
  const [page, setPage] = useState(0)
  const totalPages = MANUAL_PAGES.length
  const current = MANUAL_PAGES[page]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm" onClick={onClose}/>

      {/* Book container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
          border: '2px solid #2e2e4e',
          borderRadius: '16px',
          boxShadow: '0 0 60px rgba(99,102,241,0.3), 0 0 120px rgba(99,102,241,0.1)',
        }}>

        {/* Book spine decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{background: 'linear-gradient(to bottom, #6366f1, #a855f7)'}}/>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2e2e4e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl font-black">P</div>
            <div>
              <p className="text-white font-black text-lg">ProtoMind User Manual</p>
              <p className="text-slate-500 text-xs">Page {page + 1} of {totalPages}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#1e1e2e] text-slate-400 hover:text-white hover:bg-[#2e2e4e] flex items-center justify-center transition text-lg">✕</button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-3">
          <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{width: ((page + 1) / totalPages * 100) + '%', backgroundColor: current.color}}/>
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            {MANUAL_PAGES.map(function(p, i) {
              return (
                <button key={i} onClick={function() { setPage(i) }}
                  className={"w-5 h-5 rounded-full border transition " + (i === page ? 'border-indigo-500 bg-indigo-600' : i < page ? 'border-green-800 bg-green-950' : 'border-[#2e2e4e]')}
                  style={{fontSize:'8px'}}>{i + 1}</button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Page title */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{backgroundColor: current.color + '20', border: '2px solid ' + current.color + '40'}}>
              {current.icon}
            </div>
            <div>
              <h2 className="text-white font-black text-2xl leading-tight">{current.title}</h2>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">{current.content}</p>
            </div>
          </div>

          {/* Features list */}
          <div className="bg-[#080814] border border-[#1e1e2e] rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{color: current.color}}>What it does</p>
            <ul className="space-y-2">
              {current.features.map(function(feat, i) {
                return (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{backgroundColor: current.color}}>{i + 1}</span>
                    <span className="text-slate-300">{feat}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* How to use */}
          {current.howTo && (
            <div className="rounded-xl p-4" style={{backgroundColor: current.color + '10', border: '1px solid ' + current.color + '30'}}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{color: current.color}}>How to use</p>
              <p className="text-white text-sm font-medium">{current.howTo}</p>
            </div>
          )}

          {/* Tip */}
          {current.tip && (
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4 flex gap-3">
              <span className="text-xl shrink-0">💡</span>
              <div>
                <p className="text-yellow-400 text-xs font-semibold mb-0.5">Pro Tip</p>
                <p className="text-slate-300 text-sm">{current.tip}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 p-5 border-t border-[#1e1e2e]">
          <button onClick={function() { setPage(function(p) { return Math.max(0, p - 1) }) }}
            disabled={page === 0}
            className="px-5 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl font-medium transition disabled:opacity-30">
            ← Prev
          </button>

          <div className="flex-1 text-center">
            <span className="text-slate-600 text-xs">{current.title.replace(/^[^\s]+\s/, '').slice(0, 30)}</span>
          </div>

          {page < totalPages - 1 ? (
            <button onClick={function() { setPage(function(p) { return p + 1 }) }}
              className="px-5 py-2.5 text-white rounded-xl font-bold transition"
              style={{backgroundColor: current.color}}>
              Next →
            </button>
          ) : (
            <button onClick={onClose}
              className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-bold transition">
              🚀 Start Building!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── WELCOME MODAL (for new users) ───────────────────────────────────────────
function WelcomeModal({ onOpenManual, onSkip }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-85 backdrop-blur-md"/>
      <div className="relative w-full max-w-lg"
        style={{
          background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #0d0d1a 100%)',
          border: '2px solid #2e2e4e',
          borderRadius: '24px',
          boxShadow: '0 0 80px rgba(99,102,241,0.4)',
        }}>

        {/* Glow rings */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute inset-[-1px] rounded-3xl" style={{background: 'linear-gradient(135deg, #6366f1, #a855f7, #06b6d4, #6366f1)', opacity: 0.15}}/>
        </div>

        <div className="relative p-8 text-center">
          {/* Book icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center text-5xl"
            style={{
              background: 'linear-gradient(135deg, #1e1e3e, #2a1a5e)',
              border: '2px solid #6366f1',
              boxShadow: '0 0 30px rgba(99,102,241,0.4)',
            }}>
            📖
          </div>

          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-4 py-1.5 text-indigo-400 text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"/>
            Welcome to ProtoMind
          </div>

          <h1 className="text-3xl font-black text-white mb-2">ProtoMind User Manual</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            The AI-native hardware development platform.
          </p>
          <p className="text-slate-500 text-xs mb-8">
            11 features • Complete workflow guide • Tips and shortcuts
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['🧩 ProtoSpec','🗺️ ProtoPlan','📷 ProtoScan','🔭 ProtoView','🧪 ProtoSim','💻 ProtoIDE','🔗 ProtoLink','🔮 ProtoTwin'].map(function(f) {
              return <span key={f} className="text-xs bg-[#1e1e2e] border border-[#2e2e4e] text-slate-400 px-3 py-1 rounded-full">{f}</span>
            })}
          </div>

          <div className="flex gap-4">
            <button onClick={onSkip}
              className="flex-1 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl font-medium transition">
              Skip for now
            </button>
            <button onClick={onOpenManual}
              className="flex-[2] py-3.5 text-white rounded-xl font-black text-lg transition"
              style={{background: 'linear-gradient(135deg, #6366f1, #a855f7)'}}>
              📖 Open the Book
            </button>
          </div>

          <p className="text-slate-700 text-xs mt-4">You can always open the manual from the sidebar (📖 icon)</p>
        </div>
      </div>
    </div>
  )
}

// ─── ROADMAP PANEL ────────────────────────────────────────────────────────────
function RoadmapPanel({ onClose }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [activePhase, setActivePhase] = useState(0)
  const [completedDays, setCompletedDays] = useState({})

  useEffect(function() {
    const p = loadAllProjectsWithRoadmaps()
    setProjects(p)
    const curr = p.find(function(x) { return x.isCurrent }) || p[0]
    if (curr) { setSelected(curr); setCompletedDays(curr.completedDays || {}) }
  }, [])

  function selectProject(project) {
    setSelected(project)
    setCompletedDays(project.completedDays || {})
    setActivePhase(0)
  }

  function markDayDone(dayNum) {
    if (!selected) return
    const updated = Object.assign({}, completedDays, { [dayNum]: { completedAt: new Date().toISOString() } })
    setCompletedDays(updated)
    try {
      const roadmapKey = 'protomind_roadmap_' + btoa(selected.idea).slice(0, 20)
      const raw = localStorage.getItem(roadmapKey)
      const data = raw ? JSON.parse(raw) : {}
      data.completedDays = updated
      localStorage.setItem(roadmapKey, JSON.stringify(data))
      notify.success('Day ' + dayNum + ' complete! 🎉')
    } catch(e) {}
  }

  function goToSimulator(day) {
    if (selected) {
      const code = '// ProtoMind ProtoSim\n// Project: ' + selected.idea + '\n// Day ' + day.day + ': ' + day.title + '\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("Day ' + day.day + ' — ' + (day.title||'').replace(/'/g, '') + '");\n}\n\nvoid loop() {\n  // Add your simulation code here\n  delay(1000);\n}'
      localStorage.setItem('ide_code', code)
    }
    navigate('/simulator2')
    onClose()
  }

  function goToIDE(day) {
    if (selected) {
      const code = '// ProtoMind ProtoIDE\n// Project: ' + selected.idea + '\n// Day ' + day.day + ': ' + day.title + '\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // Your code here\n}'
      localStorage.setItem('ide_code', code)
    }
    navigate('/ide')
    onClose()
  }

  const phases = selected?.roadmap?.phases || []
  const allDays = phases.flatMap(function(p) { return p.days || [] })
  const totalDays = allDays.length
  const doneDays = Object.keys(completedDays).length
  const pct = totalDays > 0 ? Math.round(doneDays / totalDays * 100) : 0
  const currentDay = allDays.find(function(d) { return !completedDays[d.day] })
  const PHASE_COLORS = ['#6366f1','#0ea5e9','#22c55e','#f59e0b','#a855f7','#ef4444']

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <div>
            <p className="text-white font-bold text-sm">ProtoPlan</p>
            <p className="text-slate-600 text-xs">AI Project Mentor</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-lg w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1e1e2e]">✕</button>
      </div>

      <div className="border-b border-[#1e1e2e]">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-xs text-slate-600 uppercase tracking-wide">Projects</p>
          <button onClick={function() { navigate('/protospec'); onClose() }}
            className="text-xs text-indigo-400 hover:text-indigo-300">+ New</button>
        </div>
        <div className="max-h-40 overflow-y-auto">
          {projects.length === 0 ? (
            <div className="px-4 pb-3 text-center">
              <p className="text-slate-600 text-xs mb-2">No projects yet</p>
              <button onClick={function() { navigate('/protospec'); onClose() }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition w-full">
                Start First Project →
              </button>
            </div>
          ) : projects.map(function(project) {
            const isSelected = selected?.idea === project.idea
            const pDays = (project.roadmap?.phases || []).flatMap(function(p) { return p.days || [] })
            const pDone = Object.keys(project.completedDays || {}).length
            const pPct = pDays.length > 0 ? Math.round(pDone / pDays.length * 100) : 0
            return (
              <button key={project.idea} onClick={function() { selectProject(project) }}
                className={"w-full text-left px-4 py-2.5 transition border-b border-[#0a0a14] " + (isSelected ? 'bg-indigo-950 border-l-2 border-l-indigo-500' : 'hover:bg-[#0d0d1a]')}>
                <div className="flex items-center gap-2">
                  {project.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"/>}
                  <p className="text-white text-xs font-medium truncate flex-1">{project.idea?.slice(0, 38)}</p>
                  <span className="text-xs font-bold shrink-0" style={{color: pPct===100?'#22c55e':'#6366f1'}}>{pPct}%</span>
                </div>
                {pDays.length > 0 && (
                  <div className="w-full bg-[#1e1e2e] rounded-full h-0.5 mt-1.5">
                    <div className="h-0.5 rounded-full" style={{width: pPct + '%', backgroundColor: pPct===100?'#22c55e':'#6366f1'}}/>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <div className="flex-1 overflow-y-auto">
          {!selected.roadmap ? (
            <div className="p-4 text-center">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-slate-400 text-sm mb-3">No roadmap for this project yet</p>
              <button onClick={function() { navigate('/roadmap'); onClose() }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition w-full">
                Generate AI Roadmap →
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-[#1e1e2e]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-bold text-xs truncate max-w-44">{selected.idea?.slice(0, 40)}</p>
                  <span className="font-black text-lg" style={{color: pct===100?'#22c55e':'#6366f1'}}>{pct}%</span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full transition-all" style={{width: pct+'%', backgroundColor: pct===100?'#22c55e':'#6366f1'}}/>
                </div>
                <p className="text-slate-600 text-xs">{doneDays}/{totalDays} days done</p>

                {currentDay && (
                  <div className="mt-3 bg-indigo-950 border border-indigo-800 rounded-xl p-3">
                    <p className="text-indigo-400 text-xs font-semibold mb-0.5">📅 Today — Day {currentDay.day}</p>
                    <p className="text-white text-sm font-bold mb-2">{currentDay.title}</p>
                    {(currentDay.tasks||[]).slice(0,2).map(function(t,i){return <p key={i} className="text-slate-400 text-xs mb-0.5 flex gap-1"><span className="text-indigo-500">›</span>{t}</p>})}
                    <div className="flex gap-2 mt-2">
                      <button onClick={function(){goToSimulator(currentDay)}} className="flex-1 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-cyan-200 rounded-lg text-xs font-bold transition">🔌 ProtoSim</button>
                      <button onClick={function(){goToIDE(currentDay)}} className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition">💻 IDE</button>
                    </div>
                    <button onClick={function(){markDayDone(currentDay.day)}} className="w-full mt-2 py-1.5 bg-green-800 hover:bg-green-700 text-green-200 rounded-lg text-xs font-bold transition">✅ Mark Day {currentDay.day} Done</button>
                  </div>
                )}
                {pct === 100 && <div className="mt-3 bg-green-950 border border-green-800 rounded-xl p-3 text-center"><p className="text-green-400 font-black">🎉 Complete!</p></div>}
              </div>

              <div className="flex gap-1 p-2 overflow-x-auto border-b border-[#1e1e2e]">
                {phases.map(function(phase, i) {
                  const color = PHASE_COLORS[i%PHASE_COLORS.length]
                  const done = (phase.days||[]).filter(function(d){return completedDays[d.day]}).length
                  return (
                    <button key={i} onClick={function(){setActivePhase(i)}}
                      className={"flex-shrink-0 px-2 py-1.5 rounded-lg text-xs font-medium transition " + (activePhase===i?'text-white':'text-slate-500 hover:text-white')}
                      style={activePhase===i?{backgroundColor:color}:{}}>
                      <p className="leading-none">{phase.name?.slice(0,8)}</p>
                      <p className="text-xs opacity-60 mt-0.5">{done}/{(phase.days||[]).length}</p>
                    </button>
                  )
                })}
              </div>

              <div className="p-3 space-y-2">
                {(phases[activePhase]?.days||[]).map(function(day) {
                  const isDone = !!completedDays[day.day]
                  const isCurrent = currentDay?.day===day.day
                  return (
                    <div key={day.day} className={"rounded-xl border p-3 transition " + (isDone?'border-green-900 bg-green-950 opacity-60':isCurrent?'border-indigo-600 bg-indigo-950':'border-[#1e1e2e] bg-[#0a0a14]')}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={"w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 " + (isDone?'bg-green-700 text-white':isCurrent?'bg-indigo-600 text-white':'bg-[#1e1e2e] text-slate-500')}>
                          {isDone?'✓':day.day}
                        </div>
                        <p className={"text-xs font-bold flex-1 truncate " + (isDone?'line-through text-green-500':isCurrent?'text-white':'text-slate-300')}>{day.title}</p>
                        {isCurrent && <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full shrink-0">NOW</span>}
                      </div>
                      {!isDone && (
                        <div className="flex gap-1 mt-2">
                          <button onClick={function(){goToSimulator(day)}} className="flex-1 py-1 bg-cyan-900 hover:bg-cyan-800 text-cyan-300 rounded-lg text-xs transition">🔌</button>
                          <button onClick={function(){goToIDE(day)}} className="flex-1 py-1 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition">💻</button>
                          <button onClick={function(){markDayDone(day.day)}} className="flex-1 py-1 bg-green-900 hover:bg-green-800 text-green-300 rounded-lg text-xs transition">✅</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN GLOBAL SIDEBAR ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:'spec', icon:'🧩', label:'ProtoSpec', path:'/protospec', color:'#6366f1', desc:'Requirements Wizard' },
  { id:'plan', icon:'🗺️', label:'ProtoPlan', panel:'roadmap', color:'#a855f7', desc:'Daily Project Mentor' },
  { id:'view', icon:'🔭', label:'ProtoView', path:'/viewer', color:'#22c55e', desc:'3D Prototype Viewer' },
  { id:'scan', icon:'📷', label:'ProtoScan', path:'/protoscan', color:'#06b6d4', desc:'Identify Components' },
  { id:'sim', icon:'🧪', label:'ProtoSim', path:'/simulator2', color:'#10b981', desc:'Circuit Simulator' },
  { id:'ide', icon:'💻', label:'ProtoIDE', path:'/ide', color:'#64748b', desc:'Code & Upload' },
  { id:'link', icon:'🔗', label:'ProtoLink', path:'/digitaltwin', color:'#f59e0b', desc:'Connect Hardware' },
  { id:'twin', icon:'🔮', label:'ProtoTwin', path:'/digitaltwin', color:'#ec4899', desc:'Digital Twin' },
  { id:'hub', icon:'🧭', label:'Hub', path:'/hub', color:'#6366f1', desc:'All Pages' },
  { id:'download', icon:'⬇', label:'Download', path:'/download', color:'#22c55e', desc:'Desktop App' },
]

function GlobalSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [openPanel, setOpenPanel] = useState(null)
  const [showManual, setShowManual] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(function() {
    setMounted(true)
    // Show welcome for new users
    const seen = localStorage.getItem('protomind_manual_seen')
    if (!seen) {
      setTimeout(function() { setShowWelcome(true) }, 800)
    }
  }, [])

  function togglePanel(panel) { setOpenPanel(function(prev) { return prev === panel ? null : panel }) }

  function openManual() {
    setShowWelcome(false)
    setShowManual(true)
    localStorage.setItem('protomind_manual_seen', 'true')
  }

  function skipWelcome() {
    setShowWelcome(false)
    localStorage.setItem('protomind_manual_seen', 'true')
  }

  if (!mounted) return null

  const isFullscreen = location.pathname === '/ide' ||
    location.pathname.includes('simulator') ||
    location.pathname === '/esim'
  if (isFullscreen) return null

  return (
    <>
      {/* Welcome modal */}
      {showWelcome && <WelcomeModal onOpenManual={openManual} onSkip={skipWelcome}/>}

      {/* User manual */}
      {showManual && <UserManual onClose={function() { setShowManual(false) }}/>}

      {/* Overlay */}
      {openPanel && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-20" onClick={function(){setOpenPanel(null)}}/>
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 z-40 flex">
        {/* Icon rail */}
        <div className="w-14 bg-[#06060f] border-r border-[#1e1e2e] flex flex-col items-center py-3 gap-0.5">
          {/* Logo */}
          <div onClick={function(){navigate('/')}}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-base mb-2 cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-indigo-900/50">
            P
          </div>
          <div className="w-8 h-px bg-[#1e1e2e] mb-1"/>

          {NAV_ITEMS.map(function(item) {
            const isActive = item.path ? location.pathname === item.path : openPanel === item.panel
            const isHovered = hoveredItem === item.id

            return (
              <div key={item.id} className="relative w-full flex justify-center"
                onMouseEnter={function(){setHoveredItem(item.id)}}
                onMouseLeave={function(){setHoveredItem(null)}}>
                <button
                  onClick={function() {
                    if (item.panel) { togglePanel(item.panel) }
                    else { navigate(item.path); setOpenPanel(null) }
                  }}
                  className={"flex flex-col items-center justify-center transition-all duration-200 rounded-xl relative " + (
                    isHovered ? 'w-12 h-12 scale-125 shadow-2xl' : 'w-10 h-10'
                  )}
                  style={{
                    backgroundColor: isActive ? item.color + '25' : isHovered ? item.color + '15' : 'transparent',
                    color: isActive || isHovered ? item.color : '#4b5563',
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{backgroundColor: item.color}}/>
                  )}
                  <span className={isHovered ? 'text-2xl' : 'text-lg'} style={{transition:'font-size 0.15s ease', lineHeight:1}}>{item.icon}</span>
                  <span className="text-[8px] leading-none mt-0.5 opacity-80"
                    style={{fontSize: isHovered ? '9px' : '7px', transition:'font-size 0.15s ease'}}>
                    {item.label.slice(0,5)}
                  </span>
                </button>

                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
                    style={{animation:'tooltipIn 0.1s ease'}}>
                    <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap"
                      style={{borderColor: item.color + '40'}}>
                      <p className="text-white font-bold text-sm">{item.label}</p>
                      <p className="text-xs" style={{color: item.color}}>{item.desc}</p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-2.5 h-2.5 rotate-45 bg-[#0d0d1a]"
                      style={{borderLeft:'1px solid '+item.color+'40', borderBottom:'1px solid '+item.color+'40'}}/>
                  </div>
                )}
              </div>
            )
          })}

          <div className="flex-1"/>

          {/* Manual button at bottom — permanent */}
          <div className="relative w-full flex justify-center"
            onMouseEnter={function(){setHoveredItem('manual')}}
            onMouseLeave={function(){setHoveredItem(null)}}>
            <button onClick={function(){setShowManual(true)}}
              className={"w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-200 " + (hoveredItem==='manual'?'scale-125':'')}
              style={{
                backgroundColor: hoveredItem==='manual' ? '#6366f115' : 'transparent',
                color: hoveredItem==='manual' ? '#6366f1' : '#4b5563',
              }}>
              <span className={hoveredItem==='manual'?'text-2xl':'text-lg'} style={{lineHeight:1}}>📖</span>
              <span className="text-[7px] leading-none mt-0.5">Guide</span>
            </button>
            {hoveredItem==='manual' && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-[#0d0d1a] border border-indigo-800 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
                  <p className="text-white font-bold text-sm">📖 User Manual</p>
                  <p className="text-xs text-indigo-400">Complete ProtoMind guide</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sliding panel */}
        {openPanel && (
          <div className="w-80 bg-[#0a0a14] border-r border-[#1e1e2e] flex flex-col overflow-hidden shadow-2xl">
            {openPanel === 'roadmap' && <RoadmapPanel onClose={function(){setOpenPanel(null)}}/>}
          </div>
        )}
      </div>

      {/* Tooltip animation keyframes */}
      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>
    </>
  )
}

export default GlobalSidebar
