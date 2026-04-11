import ShareModal from '../components/ShareModal'
import { saveProjectCloud, getUser } from '../services/supabase'
import CircuitDiagram from '../components/CircuitDiagram'
import { downloadBOM, generateBOMCSV } from '../services/bomExport'
import ComponentDetail from '../components/ComponentDetail'
import { analyse3DPrintingNeed } from '../services/claude'
import { downloadSTL } from '../services/stlExport'
import { saveProject } from '../services/storage'
import { validatePrototype } from '../services/validation'
import { generatePrototypePDF } from '../services/pdfExport'
import { notify } from '../services/toast'
import ValidationPanel from '../components/ValidationPanel'
import ChangeValidator from '../components/ChangeValidator'
import { Suspense, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import StepBar from '../components/StepBar'
import ComponentBox3D from '../components/ComponentBox3D'
import ConnectionLines3D from '../components/ConnectionLines3D'

function get3DPositions(count) {
  const positions = []
  const cols = 3
  for (let i = 0; i < count; i++) {
    positions.push([
      (i % cols) * 3 - 3,
      0,
      Math.floor(i / cols) * 3 - 1.5,
    ])
  }
  return positions
}

function Scene({ components }) {
  const positions = get3DPositions(components.length)
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />
      <Grid
        args={[20, 20]}
        position={[0, -0.5, 0]}
        cellColor="#1e1e2e"
        sectionColor="#2e2e4e"
        fadeDistance={25}
      />
      <ConnectionLines3D components={components} positions={positions} />
      {components.map((comp, index) => (
        <ComponentBox3D key={comp.id} comp={comp} position={positions[index]} />
      ))}
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={3} maxDistance={20} />
    </>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-indigo-600 text-white rounded-br-sm'
          : 'bg-[#1e1e2e] text-slate-300 rounded-bl-sm'
      }`}>
        {!isUser && <span className="text-indigo-400 font-semibold text-xs block mb-1">🧠 ProtoMind AI</span>}
        {msg.content}
      </div>
    </div>
  )
}

function Viewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || 'Your prototype'
  const selectedComponents = location.state?.selectedComponents || []

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Your 3D prototype is ready! Ask me anything — "Will this work?", "What voltage do I need?", or "Suggest improvements".',
    },
  ])
  const [input, setInput] = useState('')
  const [stlExported, setStlExported] = useState(false)
  const [loading, setLoading] = useState(false)
  const [printAnalysis, setPrintAnalysis] = useState(null)
  const [printLoading, setPrintLoading] = useState(false)
  const [selectedComp, setSelectedComp] = useState(null)
  const [bomExported, setBomExported] = useState(false)
  const [saved, setSaved] = useState(false)
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)
  const [pdfExported, setPdfExported] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  async function sendMessage() {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const componentList = selectedComponents.map(c => c.name).join(', ')
      const prompt = 'You are an expert electronics engineer reviewing a prototype. The prototype idea is: "' + idea + '". The selected components are: ' + componentList + '. The user asks: "' + input + '". Give a helpful, concise answer in 2-3 sentences.'
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2', prompt: prompt, stream: false }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Make sure Ollama is running with: ollama serve' }])
    } finally {
      setLoading(false)
    }
  }

  async function analysePrinting() {
    setPrintLoading(true)
    try {
      const result = await analyse3DPrintingNeed(idea, selectedComponents)
      setPrintAnalysis(result)
      if (result.needs3DPrinting) {
        notify.info('3D printing recommended for this prototype!')
      } else {
        notify.info('3D printing not required for this prototype')
      }
    } catch {
      setPrintAnalysis({
        needs3DPrinting: false,
        reason: 'Could not analyse. Make sure Ollama is running.',
        advice: 'Try again after checking Ollama.',
      })
      notify.error('Analysis failed — is Ollama running?')
    } finally {
      setPrintLoading(false)
    }
  }

  async function handleValidate() {
    setValidating(true)
    setValidation(null)
    try {
      const result = await validatePrototype(idea, selectedComponents)
      setValidation(result)
      if (result.valid) {
        notify.success('Prototype validated! Score: ' + result.score + '/100')
      } else {
        notify.warning('Issues found. Score: ' + result.score + '/100')
      }
    } catch {
      setValidation({
        valid: false,
        score: 0,
        issues: ['Could not validate. Make sure Ollama is running.'],
        warnings: [],
        suggestions: [],
        verdict: 'Validation failed',
      })
      notify.error('Validation failed — is Ollama running?')
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="min-h-screen page-enter">
      <StepBar currentStep={4} />

      <div className="px-16 pb-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white text-sm mb-2 flex items-center gap-2 transition">
              ← Back
            </button>
            <h2 className="text-3xl font-bold mb-1">3D Prototype View</h2>
            <p className="text-slate-400 text-sm">
              Idea: <span className="text-indigo-400 italic">"{idea}"</span>
            </p>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap justify-end max-w-4xl">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-sm transition"
            >
              Start New
            </button>
            <button
              onClick={async () => {
                saveProject(idea, selectedComponents, null)
                setSaved(true)
                notify.success('Project saved!')
                const user = await getUser()
                if (user) {
                  try {
                    await saveProjectCloud(idea, selectedComponents)
                    notify.info('Synced to cloud!')
                  } catch {
                    notify.warning('Cloud sync failed — saved locally')
                  }
                }
              }}
              disabled={saved}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition ${
                saved
                  ? 'bg-green-900 text-green-400 cursor-default'
                  : 'bg-green-700 hover:bg-green-600 text-white'
              }`}
            >
              {saved ? '✅ Saved!' : '💾 Save Project'}
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition"
            >
              🔗 Share
            </button>
            <button
              onClick={() => {
                downloadBOM(selectedComponents, idea)
                setBomExported(true)
                notify.success('BOM spreadsheet downloaded!')
              }}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition"
            >
              📋 Download BOM
            </button>
            <button
              onClick={() => {
                generatePrototypePDF(idea, selectedComponents, validation)
                setPdfExported(true)
                notify.success('PDF report downloaded!')
              }}
              className="px-6 py-3 bg-rose-700 hover:bg-rose-600 rounded-xl text-sm font-semibold transition"
            >
              📄 Export PDF
            </button>
            <button
              onClick={handleValidate}
              disabled={validating}
              className="px-6 py-3 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {validating ? '🔍 Validating...' : '🔍 Validate Prototype'}
            </button>
            <button
              onClick={analysePrinting}
              disabled={printLoading}
              className="px-6 py-3 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {printLoading ? '🔍 Analysing...' : '🔍 Check 3D Print Need'}
            </button>
            {printAnalysis?.needs3DPrinting && (
              <button
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
                onClick={() => {
                  downloadSTL(selectedComponents, idea, printAnalysis)
                  setStlExported(true)
                  notify.success('STL file ready for 3D printing!')
                }}
              >
                🖨️ Export Enclosure STL
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="flex gap-4 mb-3 text-xs text-slate-600">
              <span>🖱️ Drag — Rotate</span>
              <span>Scroll — Zoom</span>
              <span>Hover — Spin</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]" style={{ height: '480px' }}>
              {selectedComponents.length > 0 ? (
                <Canvas camera={{ position: [0, 8, 12], fov: 50 }} style={{ background: '#0a0a0f' }}>
                  <Suspense fallback={null}>
                    <Scene components={selectedComponents} />
                  </Suspense>
                </Canvas>
              ) : (
                <div className="h-full flex items-center justify-center bg-[#0d0d1a]">
                  <p className="text-slate-400">No components to display</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-80 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">🧠 Ask AI about your prototype</h3>
            <div className="flex-1 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 overflow-y-auto" style={{ height: '400px' }}>
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} />
              ))}
              {loading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-[#1e1e2e] px-4 py-2.5 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 my-3">
              {['Will this work?', 'What voltage?', 'Suggest improvements'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 px-3 py-1.5 rounded-full transition"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your prototype..."
                className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm transition disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {printAnalysis && (
          <div className={`mt-4 border rounded-xl px-6 py-5 ${
            printAnalysis.needs3DPrinting
              ? 'bg-indigo-950 border-indigo-800'
              : 'bg-slate-900 border-slate-700'
          }`}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">
                {printAnalysis.needs3DPrinting ? '🖨️' : '📦'}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">
                    {printAnalysis.needs3DPrinting ? '3D Printing Recommended' : '3D Printing Not Required'}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    printAnalysis.needs3DPrinting ? 'bg-indigo-800 text-indigo-300' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {printAnalysis.enclosureType || 'No enclosure'}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-2">{printAnalysis.reason}</p>
                <p className="text-slate-500 text-xs">{printAnalysis.advice}</p>
                {printAnalysis.needs3DPrinting && printAnalysis.dimensions && (
                  <div className="flex gap-4 mt-3 flex-wrap">
                    <div className="text-xs text-slate-500">
                      Enclosure size:
                      <span className="text-indigo-400 ml-1 font-mono">
                        {printAnalysis.dimensions.width} × {printAnalysis.dimensions.height} × {printAnalysis.dimensions.depth} mm
                      </span>
                    </div>
                    {printAnalysis.features && (
                      <div className="flex gap-1 flex-wrap">
                        {printAnalysis.features.map(f => (
                          <span key={f} className="text-xs bg-indigo-900 text-indigo-400 px-2 py-0.5 rounded-full">
                            {f.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {stlExported && (
          <div className="mt-4 bg-green-950 border border-green-800 rounded-xl px-6 py-4 flex items-center gap-4">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-green-400 font-semibold text-sm">Enclosure STL Downloaded!</p>
              <p className="text-green-700 text-xs mt-0.5">Send this file to JLCPCB, Shapeways, or your local 3D print shop.</p>
            </div>
            <button onClick={() => setStlExported(false)} className="ml-auto text-green-700 hover:text-green-500 text-xs transition">✕</button>
          </div>
        )}

        {pdfExported && (
          <div className="mt-4 bg-rose-950 border border-rose-800 rounded-xl px-6 py-4 flex items-center gap-4">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-rose-400 font-semibold text-sm">PDF Report Downloaded!</p>
              <p className="text-rose-700 text-xs mt-0.5">Share this with your team, teacher or 3D printing service.</p>
            </div>
            <button onClick={() => setPdfExported(false)} className="ml-auto text-rose-700 hover:text-rose-500 text-xs transition">✕</button>
          </div>
        )}

        <ChangeValidator idea={idea} components={selectedComponents} />
        <CircuitDiagram idea={idea} components={selectedComponents} />

        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-400">
              Components — click any to see details
            </h3>
            {bomExported && (
              <span className="text-xs text-emerald-400">✅ BOM Downloaded!</span>
            )}
          </div>
          {selectedComponents.length > 0 && (() => {
            const { totalMin, totalMax } = generateBOMCSV(selectedComponents, idea)
            return (
              <p className="text-xs text-slate-600 mb-3">
                Estimated total cost: <span className="text-emerald-400">${totalMin.toFixed(0)} — ${totalMax.toFixed(0)} USD</span>
              </p>
            )
          })()}
          <div className="grid grid-cols-6 gap-3">
            {selectedComponents.map(comp => (
              <div
                key={comp.id}
                onClick={() => setSelectedComp(comp)}
                className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-500 rounded-xl p-3 text-center cursor-pointer transition"
              >
                <div className="text-2xl mb-1">{comp.icon}</div>
                <div className="text-xs text-white font-medium leading-tight">{comp.name}</div>
                <div className="text-xs text-slate-600 mt-1">{comp.category}</div>
                <div className="text-xs text-indigo-500 mt-1">tap for details</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ComponentDetail comp={selectedComp} onClose={() => setSelectedComp(null)} />
      <ValidationPanel
        result={validation}
        loading={validating}
        onClose={() => { setValidation(null); setValidating(false) }}
      />
      {shareOpen && (
        <ShareModal
          idea={idea}
          components={selectedComponents}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}

export default Viewer