import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── DEMO SCRIPT ─────────────────────────────────────────────────────────────
const DEMO_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ProtoMind',
    subtitle: 'AI-Powered Hardware Engineering Platform',
    icon: '🚀',
    color: '#6366f1',
    path: null,
    voice: 'Welcome to ProtoMind — the AI-native hardware engineering platform that takes your idea from concept to working prototype. Press Enter to begin the demo.',
    action: 'start',
    duration: 4000,
  },
  {
    id: 'protospec',
    title: 'ProtoSpec',
    subtitle: 'Requirements Intelligence Wizard',
    icon: '🧩',
    color: '#6366f1',
    path: '/protospec',
    voice: 'ProtoSpec is where every project begins. Instead of jumping straight to components, ProtoMind first understands your idea. We fill in detailed requirements — communication, power, budget, timeline. The AI then picks the best components automatically.',
    action: 'navigate',
    highlight: 'The wizard collects your idea, requirements, and generates the perfect component list using AI.',
    duration: 5000,
  },
  {
    id: 'roadmap',
    title: 'ProtoPlan',
    subtitle: 'AI Daily Project Mentor',
    icon: '🗺️',
    color: '#a855f7',
    path: '/roadmap',
    voice: 'ProtoPlan creates a personalized day-by-day project schedule. ProtoMind knows how many hours you have per day, your skill level, and your deadline. It generates a complete roadmap with phases — research, hardware, software, testing, and launch.',
    action: 'navigate',
    highlight: 'Each day has specific tasks. Mark them done, and the roadmap adapts automatically.',
    duration: 5000,
  },
  {
    id: 'viewer',
    title: 'ProtoView',
    subtitle: '3D Prototype Visualization',
    icon: '🔭',
    color: '#22c55e',
    path: '/viewer',
    voice: 'ProtoView renders a realistic 3D model of your prototype. You can see exactly how all components connect before buying or building anything. Below the 3D model are 360 AI-powered engineering tools organized into 7 categories.',
    action: 'navigate',
    highlight: '360+ AI tools: Design, Code, Testing, Business, Planning, Content, and Learning.',
    duration: 5000,
  },
  {
    id: 'features',
    title: 'AI Feature Categories',
    subtitle: 'Design & Build Tools',
    icon: '🔧',
    color: '#f97316',
    path: '/features/design-build',
    voice: 'Each category has dozens of AI tools. Design and Build alone has 55 tools — wiring diagrams, PCB layout, power budget calculator, signal integrity checker, compatibility checker, and much more. Every tool uses your project context automatically.',
    action: 'navigate',
    highlight: 'Click any tool to expand it. ProtoMind fills in your project details automatically.',
    duration: 5000,
  },
  {
    id: 'protoscan',
    title: 'ProtoScan',
    subtitle: 'AI Component Identification',
    icon: '📷',
    color: '#06b6d4',
    path: '/protoscan',
    voice: 'ProtoScan identifies unknown electronic components from a photo. Take a picture of any component and ProtoMind tells you its name, specifications, pin configuration, voltage, and how to connect it to your project.',
    action: 'navigate',
    highlight: 'Upload any photo — ProtoMind identifies the component and can add it to your project.',
    duration: 5000,
  },
  {
    id: 'simulator',
    title: 'ProtoSim',
    subtitle: 'Hardware Circuit Simulator',
    icon: '🧪',
    color: '#10b981',
    path: '/simulator2',
    voice: 'ProtoSim is a Wokwi-style circuit simulator built inside ProtoMind. Select your board — Arduino, ESP32, or Raspberry Pi Pico. Add components like LEDs, sensors, and servos. Click pins to wire them up. Then press Run — and watch LEDs glow, servos rotate, and see serial output in real time.',
    action: 'navigate',
    highlight: 'Full circuit simulation — no hardware needed. Code syncs automatically from ProtoIDE.',
    duration: 6000,
  },
  {
    id: 'ide',
    title: 'ProtoIDE',
    subtitle: 'Hardware Development Environment',
    icon: '💻',
    color: '#64748b',
    path: '/ide',
    voice: 'ProtoIDE is a VS Code-quality code editor inside ProtoMind. Write firmware for Arduino, ESP32, or Raspberry Pi Pico. AI generates code from your project requirements. Compile, check for errors, and upload directly to real hardware via USB.',
    action: 'navigate',
    highlight: 'Monaco Editor — same engine as VS Code. AI code generation from your requirements.',
    duration: 5000,
  },
  {
    id: 'chat',
    title: 'ProtoMentor',
    subtitle: 'General Purpose AI Assistant',
    icon: '🤖',
    color: '#22c55e',
    path: '/protochat',
    voice: 'ProtoMentor is your context-aware AI assistant. Ask anything — how to wire a sensor, debug your code, choose between components, or understand a concept. ProtoMentor knows your current project and gives specific, practical answers.',
    action: 'navigate',
    highlight: 'Not just a generic chatbot — ProtoMentor knows your project, components, and roadmap.',
    duration: 5000,
  },
  {
    id: 'digitaltwin',
    title: 'ProtoTwin',
    subtitle: 'Digital Twin Live Sync',
    icon: '🔮',
    color: '#f59e0b',
    path: '/digitaltwin',
    voice: 'ProtoTwin connects your real hardware to ProtoMind via USB. Plug in your Arduino or ESP32 and watch live sensor data appear in virtual widgets. Temperature, humidity, distance, gas — all updating in real time. You can also control outputs — toggle LEDs, move servos — directly from the browser.',
    action: 'navigate',
    highlight: 'Real hardware meets virtual prototype. Live bidirectional sync.',
    duration: 5000,
  },
  {
    id: 'slide',
    title: 'ProtoSlide',
    subtitle: 'AI Presentation Creator',
    icon: '🎨',
    color: '#a855f7',
    path: '/protoslide',
    voice: 'ProtoSlide generates complete presentations from your idea. Choose the number of slides, format, theme, and audience. AI creates slide by slide — you review each one, request changes, then export as images or a full PowerPoint file.',
    action: 'navigate',
    highlight: 'Startup pitch, project report, product launch — any format, generated by AI.',
    duration: 5000,
  },
  {
    id: 'finish',
    title: 'ProtoMind Complete',
    subtitle: 'From Idea to Prototype — One Platform',
    icon: '🏆',
    color: '#22c55e',
    path: null,
    voice: 'That is ProtoMind — a complete AI-native hardware engineering platform. ProtoSpec, ProtoPlan, ProtoView, ProtoScan, ProtoSim, ProtoIDE, ProtoMentor, ProtoTwin, and ProtoSlide. Everything you need, connected in one workflow. Completely free. AI runs locally on your machine. No subscription, no data sent to any server.',
    action: 'end',
    duration: 6000,
  },
]

// ─── VOICE NARRATION ──────────────────────────────────────────────────────────
function speak(text, onEnd) {
  if (!window.speechSynthesis) { if (onEnd) onEnd(); return }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.92
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Try to get a good English voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(function(v) {
    return v.name.includes('Google') && v.lang.startsWith('en')
  }) || voices.find(function(v) {
    return v.lang.startsWith('en') && !v.name.includes('Compact')
  }) || voices[0]

  if (preferred) utterance.voice = preferred
  if (onEnd) utterance.onend = onEnd
  window.speechSynthesis.speak(utterance)
}

function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

// ─── PROTODEMO ────────────────────────────────────────────────────────────────
export default function ProtoDemo() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState('ready') // ready | speaking | waiting | navigating | done
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showOverlay, setShowOverlay] = useState(true)
  const [progress, setProgress] = useState(0)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const progressRef = useRef(null)
  const stepRef = useRef(currentStep)
  stepRef.current = currentStep

  const step = DEMO_STEPS[currentStep]

  // Load voices
  useEffect(function() {
    if (window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesLoaded(true)
      } else {
        window.speechSynthesis.onvoiceschanged = function() {
          setVoicesLoaded(true)
        }
      }
    }
  }, [])

  // Keyboard listener — Enter to advance
  useEffect(function() {
    function handleKey(e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        advanceStep()
      }
      if (e.key === 'Escape') {
        exitDemo()
      }
      if (e.key === ' ') {
        e.preventDefault()
        if (voiceEnabled) {
          stopSpeaking()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return function() { window.removeEventListener('keydown', handleKey) }
  }, [currentStep, phase, voiceEnabled])

  function runStep(stepIndex) {
    const s = DEMO_STEPS[stepIndex]
    if (!s) return

    setCurrentStep(stepIndex)
    setPhase('speaking')
    setProgress(0)

    // Navigate if needed
    if (s.path && s.action === 'navigate') {
      setTimeout(function() {
        navigate(s.path)
      }, 600)
    }

    // Speak the narration
    if (voiceEnabled && s.voice) {
      speak(s.voice, function() {
        setPhase('waiting')
        animateProgress(s.duration || 4000)
      })
    } else {
      setTimeout(function() {
        setPhase('waiting')
        animateProgress(s.duration || 4000)
      }, 500)
    }
  }

  function animateProgress(duration) {
    const start = Date.now()
    if (progressRef.current) clearInterval(progressRef.current)
    progressRef.current = setInterval(function() {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(progressRef.current)
      }
    }, 50)
  }

  function advanceStep() {
    stopSpeaking()
    if (progressRef.current) clearInterval(progressRef.current)

    const next = currentStep + 1
    if (next >= DEMO_STEPS.length) {
      setPhase('done')
      navigate('/')
      return
    }

    const nextStep = DEMO_STEPS[next]
    if (nextStep.action === 'end') {
      setCurrentStep(next)
      setPhase('speaking')
      if (voiceEnabled) {
        speak(nextStep.voice, function() {
          setPhase('done')
        })
      } else {
        setTimeout(function() { setPhase('done') }, 2000)
      }
      return
    }

    runStep(next)
  }

  function startDemo() {
    setShowOverlay(false)
    runStep(0)
  }

  function exitDemo() {
    stopSpeaking()
    if (progressRef.current) clearInterval(progressRef.current)
    navigate('/')
  }

  const totalSteps = DEMO_STEPS.length
  const progressPct = ((currentStep + 1) / totalSteps) * 100

  // ── WELCOME OVERLAY ──────────────────────────────────────────────────────────
  if (showOverlay) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#050510] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 opacity-10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600 opacity-10 rounded-full blur-3xl" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(30,30,46,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(30,30,46,0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <div className="text-8xl mb-6">🎬</div>
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-5 py-2 text-indigo-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Automated Demo Mode
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Proto<span className="text-indigo-400">Demo</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            A guided tour of ProtoMind for judges and presentations.
            Voice narration explains each feature as you go.
            Press <kbd className="bg-[#1e1e2e] border border-[#2e2e4e] px-2 py-0.5 rounded text-white text-sm">Enter</kbd> to advance each step.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: '⌨️', label: 'Enter', desc: 'Next step' },
              { icon: '🔊', label: 'Space', desc: 'Skip speech' },
              { icon: '✕', label: 'Escape', desc: 'Exit demo' },
            ].map(function(k) {
              return (
                <div key={k.label} className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl p-4">
                  <div className="text-2xl mb-1">{k.icon}</div>
                  <kbd className="text-indigo-400 font-black">{k.label}</kbd>
                  <p className="text-slate-500 text-xs mt-1">{k.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={function() { setVoiceEnabled(function(v) { return !v }) }}
              className={"px-4 py-2 rounded-xl border text-sm font-medium transition " + (voiceEnabled ? 'bg-green-950 border-green-700 text-green-400' : 'bg-[#1e1e2e] border-[#2e2e4e] text-slate-500')}>
              {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
            </button>
            <span className="text-slate-600 text-sm">{totalSteps} steps · ~5 minutes</span>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={exitDemo}
              className="px-6 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl font-medium transition">
              Cancel
            </button>
            <button onClick={startDemo}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-xl transition shadow-2xl shadow-indigo-900/50">
              🎬 Start ProtoDemo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── DONE SCREEN ───────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-[999] bg-[#050510] flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-4xl font-black text-white mb-3">Demo Complete!</h1>
          <p className="text-slate-400 mb-8">Thank you for watching ProtoMind.</p>
          <button onClick={function() { navigate('/') }}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg transition">
            Return to ProtoMind
          </button>
        </div>
      </div>
    )
  }

  // ── DEMO HUD (overlaid on current page) ──────────────────────────────────────
  return (
    <>
      {/* TOP HUD BAR */}
      <div className="fixed top-0 left-0 right-0 z-[998] bg-[#0a0a14] border-b-2 border-indigo-800">
        {/* Overall progress */}
        <div className="h-1 bg-[#1e1e2e]">
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: progressPct + '%' }} />
        </div>

        <div className="flex items-center gap-4 px-4 py-2">
          {/* Demo badge */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-black text-xs uppercase tracking-widest">LIVE DEMO</span>
          </div>

          <div className="w-px h-5 bg-[#2e2e4e]" />

          {/* Current step */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{step.icon}</span>
            <div>
              <span className="text-white font-black text-sm">{step.title}</span>
              <span className="text-slate-500 text-xs ml-2">{step.subtitle}</span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Step counter */}
          <div className="flex items-center gap-1">
            {DEMO_STEPS.map(function(s, i) {
              return (
                <div key={i} className={"w-2 h-2 rounded-full transition-all " + (
                  i < currentStep ? 'bg-green-500' :
                  i === currentStep ? 'bg-indigo-400 scale-125' :
                  'bg-[#2e2e4e]'
                )} />
              )
            })}
          </div>

          <span className="text-slate-500 text-xs">{currentStep + 1} / {totalSteps}</span>

          {/* Controls */}
          <button onClick={function() { setVoiceEnabled(function(v) { return !v }) }}
            className="text-slate-500 hover:text-white text-lg transition" title="Toggle voice">
            {voiceEnabled ? '🔊' : '🔇'}
          </button>

          <button onClick={exitDemo}
            className="px-3 py-1 bg-[#1e1e2e] hover:bg-red-900 text-slate-400 hover:text-red-300 rounded-lg text-xs transition">
            Exit
          </button>
        </div>
      </div>

      {/* BOTTOM NARRATION CARD */}
      <div className="fixed bottom-0 left-0 right-0 z-[998]">
        {/* Step progress bar */}
        <div className="h-0.5 bg-[#1e1e2e]">
          <div className="h-0.5 transition-all duration-100"
            style={{ width: progress + '%', backgroundColor: step.color }} />
        </div>

        <div className="bg-[#0a0a14] border-t border-[#1e1e2e] px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              {/* Step icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: step.color + '20', border: '2px solid ' + step.color + '40' }}>
                {step.icon}
              </div>

              <div className="flex-1 min-w-0">
                {/* Voice text */}
                <p className="text-white text-sm leading-relaxed mb-1">
                  {phase === 'speaking' && (
                    <span className="inline-flex items-center gap-1 text-indigo-400 text-xs mr-2">
                      <span className="animate-pulse">🎙️</span>
                      <span>Narrating...</span>
                    </span>
                  )}
                  {step.voice?.slice(0, 120)}...
                </p>

                {step.highlight && (
                  <p className="text-xs px-2 py-1 rounded-lg inline-block"
                    style={{ backgroundColor: step.color + '15', color: step.color }}>
                    💡 {step.highlight}
                  </p>
                )}
              </div>

              {/* Enter to continue */}
              <div className="flex-shrink-0 text-center">
                {phase === 'waiting' ? (
                  <button onClick={advanceStep}
                    className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="w-12 h-12 border-2 border-indigo-500 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition animate-pulse">
                      ↵
                    </div>
                    <span className="text-slate-600 text-xs">Enter</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 border border-[#2e2e4e] rounded-xl flex items-center justify-center">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                    </div>
                    <span className="text-slate-600 text-xs">Speaking</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top padding to avoid HUD overlap */}
      <div style={{ paddingTop: '56px', paddingBottom: '100px' }} />
    </>
  )
}
