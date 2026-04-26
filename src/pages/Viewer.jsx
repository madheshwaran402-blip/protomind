import TeamCollaboration from '../components/TeamCollaboration'
import LearningRoadmap from '../components/LearningRoadmap'
import ShoppingListGenerator from '../components/ShoppingListGenerator'
import NameGenerator from '../components/NameGenerator'
import PCBPlanner from '../components/PCBPlanner'
import ImprovementSuggester from '../components/ImprovementSuggester'
import BuildTimeline from '../components/BuildTimeline'
import ShareModal from '../components/ShareModal'
import AIChat from '../components/AIChat'
import MissingComponents from '../components/MissingComponents'
import DifficultyPanel from '../components/DifficultyPanel'
import PowerCalculator from '../components/PowerCalculator'
import SafetyChecklist from '../components/SafetyChecklist'
import SubstitutionSuggester from '../components/SubstitutionSuggester'
import PrototypeComparison from '../components/PrototypeComparison'
import PrototypeExplainer from '../components/PrototypeExplainer'
import CostEstimator from '../components/CostEstimator'
import VersionHistory from '../components/VersionHistory'
import PrototypeNotes from '../components/PrototypeNotes'
import AccordionSection from '../components/AccordionSection'
import EnclosureCustomizer from '../components/EnclosureCustomizer'
import ModelExportPanel from '../components/ModelExportPanel'
import BreadboardView from '../components/BreadboardView'
import PinAssignmentEditor from '../components/PinAssignmentEditor'
import CodeGenerator from '../components/CodeGenerator'
import ComponentSearch from '../components/ComponentSearch'
import ComponentComparison from '../components/ComponentComparison'
import DatasheetViewer from '../components/DatasheetViewer'
import PrototypeRating from '../components/PrototypeRating'
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
import { OrbitControls, Grid, Stars, Html } from '@react-three/drei'
import StepBar from '../components/StepBar'
import ComponentBox3D from '../components/ComponentBox3D'
import ConnectionLines3D from '../components/ConnectionLines3D'

const ENVIRONMENTS = [
  { id: 'dark', label: '🌑 Dark Lab', bg: '#0a0a0f', gridColor: '#1e1e2e', sectionColor: '#2e2e4e', ambient: 0.5, stars: false },
  { id: 'space', label: '🚀 Space', bg: '#000005', gridColor: '#0a0a1f', sectionColor: '#1a1a3e', ambient: 0.3, stars: true },
  { id: 'neon', label: '🌈 Neon City', bg: '#0a0018', gridColor: '#1a0030', sectionColor: '#2a0050', ambient: 0.4, stars: false },
  { id: 'lab', label: '🔬 Clean Lab', bg: '#0d1117', gridColor: '#1e2530', sectionColor: '#2e3540', ambient: 0.7, stars: false },
  { id: 'sunset', label: '🌅 Sunset', bg: '#1a0a00', gridColor: '#2d1500', sectionColor: '#3d2500', ambient: 0.6, stars: false },
  { id: 'ocean', label: '🌊 Ocean', bg: '#000d1a', gridColor: '#001a2e', sectionColor: '#002a3e', ambient: 0.5, stars: false },
]

const NEON_COLORS = {
  neon: '#ff00ff',
  space: '#4444ff',
  sunset: '#ff6600',
  ocean: '#0088ff',
  lab: '#00ffaa',
  dark: '#6366f1',
}

function get3DPositions(count, exploded = false) {
  const positions = []
  const cols = 3
  const spread = exploded ? 5 : 3
  for (let i = 0; i < count; i++) {
    positions.push([
      (i % cols) * spread - (spread * (Math.min(count, cols) - 1)) / 2,
      exploded ? Math.floor(i / cols) * 1.5 : 0,
      Math.floor(i / cols) * spread - 1.5,
    ])
  }
  return positions
}

function MeasurementLine({ start, end, label }) {
  return (
    <Html position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 0.3, (start[2] + end[2]) / 2]}>
      <div className="bg-black bg-opacity-70 text-yellow-400 text-xs px-2 py-0.5 rounded whitespace-nowrap border border-yellow-800">
        {label}
      </div>
    </Html>
  )
}

function Scene({ components, exploded, showMeasurements, environment }) {
  const positions = get3DPositions(components.length, exploded)
  const env = ENVIRONMENTS.find(e => e.id === environment) || ENVIRONMENTS[0]
  const accentColor = NEON_COLORS[environment] || '#6366f1'
  const width = Math.min(components.length, 3) * (exploded ? 5 : 3)
  const depth = Math.ceil(components.length / 3) * (exploded ? 5 : 3)

  return (
    <>
      <ambientLight intensity={env.ambient} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color={accentColor} />
      <pointLight position={[10, 5, -10]} intensity={0.3} color={accentColor} />
      {env.stars && <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />}
      {environment === 'neon' && (
        <>
          <pointLight position={[0, 5, 0]} intensity={1} color="#ff00ff" />
          <pointLight position={[5, 0, 5]} intensity={0.5} color="#00ffff" />
        </>
      )}
      {environment === 'sunset' && (
        <>
          <pointLight position={[10, 3, 0]} intensity={1.5} color="#ff6600" />
          <pointLight position={[-10, 3, 0]} intensity={0.5} color="#ff4400" />
        </>
      )}
      {environment === 'ocean' && (
        <>
          <pointLight position={[0, 8, 0]} intensity={0.8} color="#0088ff" />
          <fog attach="fog" args={[env.bg, 15, 40]} />
        </>
      )}
      <Grid args={[30, 30]} position={[0, -0.5, 0]} cellColor={env.gridColor} sectionColor={env.sectionColor} fadeDistance={30} />
      {!exploded && <ConnectionLines3D components={components} positions={positions} />}
      {components.map((comp, index) => (
        <ComponentBox3D key={comp.id} comp={comp} position={positions[index]} />
      ))}
      {showMeasurements && positions.length > 1 && (
        <>
          <MeasurementLine start={positions[0]} end={positions[Math.min(2, positions.length - 1)]} label={`Width: ~${(width * 30).toFixed(0)}mm`} />
          <MeasurementLine start={positions[0]} end={positions[positions.length - 1]} label={`Depth: ~${(depth * 25).toFixed(0)}mm`} />
        </>
      )}
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={3} maxDistance={30} />
    </>
  )
}

function Viewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || 'Your prototype'
  const selectedComponents = location.state?.selectedComponents || []

  const [stlExported, setStlExported] = useState(false)
  const [printAnalysis, setPrintAnalysis] = useState(null)
  const [printLoading, setPrintLoading] = useState(false)
  const [selectedComp, setSelectedComp] = useState(null)
  const [datasheetComp, setDatasheetComp] = useState(null)
  const [bomExported, setBomExported] = useState(false)
  const [saved, setSaved] = useState(false)
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)
  const [pdfExported, setPdfExported] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [viewAngle, setViewAngle] = useState('perspective')
  const [environment, setEnvironment] = useState('dark')

  async function analysePrinting() {
    setPrintLoading(true)
    try {
      const result = await analyse3DPrintingNeed(idea, selectedComponents)
      setPrintAnalysis(result)
      notify.info(result.needs3DPrinting ? '3D printing recommended!' : '3D printing not required')
    } catch {
      setPrintAnalysis({ needs3DPrinting: false, reason: 'Could not analyse. Make sure Ollama is running.', advice: 'Try again.' })
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
      if (result.valid) notify.success('Validated! Score: ' + result.score + '/100')
      else notify.warning('Issues found. Score: ' + result.score + '/100')
    } catch {
      setValidation({ valid: false, score: 0, issues: ['Could not validate. Make sure Ollama is running.'], warnings: [], suggestions: [], verdict: 'Validation failed' })
      notify.error('Validation failed — is Ollama running?')
    } finally {
      setValidating(false)
    }
  }

  const CAMERA_PRESETS = {
    perspective: [0, 8, 12],
    top: [0, 20, 0],
    front: [0, 2, 16],
    side: [16, 2, 0],
  }

  const currentEnv = ENVIRONMENTS.find(e => e.id === environment) || ENVIRONMENTS[0]

  return (
    <div className="min-h-screen page-enter">
      <StepBar currentStep={4} />
      <div className="px-4 sm:px-8 md:px-16 pb-10">

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 mt-4">
          <div>
            <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white text-sm mb-2 flex items-center gap-2 transition">← Back</button>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">3D Prototype View</h2>
            <p className="text-slate-400 text-sm">Idea: <span className="text-indigo-400 italic">"{idea}"</span></p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate('/')} className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-xs transition">Start New</button>
             <button
  onClick={() => navigate('/showcase', { state: { idea, selectedComponents } })}
  className="px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded-xl text-xs font-semibold transition"
>
  🎭 Showcase
</button>
            <button
              onClick={async () => {
                const project = saveProject(idea, selectedComponents, null)
                setSaved(true)
                notify.success('Saved — v' + project.version + '!')
                const user = await getUser()
                if (user) {
                  try { await saveProjectCloud(idea, selectedComponents); notify.info('Synced!') }
                  catch { notify.warning('Cloud sync failed') }
                }
              }}
              disabled={saved}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${saved ? 'bg-green-900 text-green-400 cursor-default' : 'bg-green-700 hover:bg-green-600 text-white'}`}
            >
              {saved ? '✅ Saved!' : '💾 Save'}
            </button>
            <button onClick={() => setShareOpen(true)} className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded-xl text-xs font-semibold transition">🔗 Share</button>
            <button onClick={() => { downloadBOM(selectedComponents, idea); setBomExported(true); notify.success('BOM downloaded!') }} className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition">📋 BOM</button>
            <button onClick={() => { generatePrototypePDF(idea, selectedComponents, validation); setPdfExported(true); notify.success('PDF downloaded!') }} className="px-3 py-2 bg-rose-700 hover:bg-rose-600 rounded-xl text-xs font-semibold transition">📄 PDF</button>
            <button onClick={handleValidate} disabled={validating} className="px-3 py-2 bg-orange-700 hover:bg-orange-600 rounded-xl text-xs font-semibold transition disabled:opacity-50">{validating ? '...' : '🔍 Validate'}</button>
            <button onClick={analysePrinting} disabled={printLoading} className="px-3 py-2 bg-violet-700 hover:bg-violet-600 rounded-xl text-xs font-semibold transition disabled:opacity-50">{printLoading ? '...' : '🖨️ 3D Print?'}</button>
            {printAnalysis?.needs3DPrinting && (
              <button onClick={() => { downloadSTL(selectedComponents, idea, printAnalysis); setStlExported(true); notify.success('STL ready!') }} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition">⬇️ STL</button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          {ENVIRONMENTS.map(env => (
            <button
              key={env.id}
              onClick={() => setEnvironment(env.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${environment === env.id ? 'bg-indigo-600 text-white' : 'bg-[#1e1e2e] text-slate-400 hover:text-white'}`}
            >
              {env.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3 flex-wrap items-center">
          <div className="flex gap-1">
            {['perspective', 'top', 'front', 'side'].map(angle => (
              <button
                key={angle}
                onClick={() => setViewAngle(angle)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${viewAngle === angle ? 'bg-indigo-600 text-white' : 'bg-[#1e1e2e] text-slate-400 hover:text-white'}`}
              >
                {angle === 'perspective' ? '🎥' : angle === 'top' ? '⬆️' : angle === 'front' ? '⬛' : '◀️'} {angle.charAt(0).toUpperCase() + angle.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => { setExploded(!exploded); notify.info(exploded ? 'Normal view' : 'Exploded view') }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${exploded ? 'bg-yellow-700 text-yellow-100' : 'bg-[#1e1e2e] text-slate-400 hover:text-white'}`}>
            💥 {exploded ? 'Exploded' : 'Explode'}
          </button>
          <button onClick={() => setShowMeasurements(!showMeasurements)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${showMeasurements ? 'bg-yellow-700 text-yellow-100' : 'bg-[#1e1e2e] text-slate-400 hover:text-white'}`}>
            📏 {showMeasurements ? 'Hide Sizes' : 'Show Sizes'}
          </button>
          <span className="text-slate-700 text-xs ml-auto hidden sm:block">🖱️ Drag to rotate · Scroll to zoom</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]" style={{ height: '480px' }}>
              {selectedComponents.length > 0 ? (
                <Canvas key={viewAngle + environment} camera={{ position: CAMERA_PRESETS[viewAngle] || CAMERA_PRESETS.perspective, fov: 50 }} style={{ background: currentEnv.bg }}>
                  <Suspense fallback={null}>
                    <Scene components={selectedComponents} exploded={exploded} showMeasurements={showMeasurements} environment={environment} />
                  </Suspense>
                </Canvas>
              ) : (
                <div className="h-full flex items-center justify-center bg-[#0d0d1a]">
                  <p className="text-slate-400">No components to display</p>
                </div>
              )}
            </div>
            {(exploded || showMeasurements) && (
              <div className="flex gap-2 mt-2">
                {exploded && <span className="text-xs bg-yellow-950 text-yellow-400 border border-yellow-900 px-3 py-1 rounded-full">💥 Exploded View</span>}
                {showMeasurements && <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-900 px-3 py-1 rounded-full">📏 Measurements shown</span>}
              </div>
            )}
          </div>
          <div className="w-full lg:w-80">
            <AIChat idea={idea} components={selectedComponents} />
          </div>
        </div>

        {printAnalysis && (
          <div className={`mt-4 border rounded-xl px-6 py-5 ${printAnalysis.needs3DPrinting ? 'bg-indigo-950 border-indigo-800' : 'bg-slate-900 border-slate-700'}`}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{printAnalysis.needs3DPrinting ? '🖨️' : '📦'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">{printAnalysis.needs3DPrinting ? '3D Printing Recommended' : 'Not Required'}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${printAnalysis.needs3DPrinting ? 'bg-indigo-800 text-indigo-300' : 'bg-slate-700 text-slate-400'}`}>{printAnalysis.enclosureType || 'No enclosure'}</span>
                </div>
                <p className="text-slate-300 text-sm">{printAnalysis.reason}</p>
              </div>
            </div>
          </div>
        )}

        {stlExported && (
          <div className="mt-4 bg-green-950 border border-green-800 rounded-xl px-6 py-4 flex items-center gap-4">
            <span className="text-2xl">✅</span>
            <div><p className="text-green-400 font-semibold text-sm">STL Downloaded!</p></div>
            <button onClick={() => setStlExported(false)} className="ml-auto text-green-700 hover:text-green-500 text-xs">✕</button>
          </div>
        )}

        {pdfExported && (
          <div className="mt-4 bg-rose-950 border border-rose-800 rounded-xl px-6 py-4 flex items-center gap-4">
            <span className="text-2xl">📄</span>
            <div><p className="text-rose-400 font-semibold text-sm">PDF Downloaded!</p></div>
            <button onClick={() => setPdfExported(false)} className="ml-auto text-rose-700 hover:text-rose-500 text-xs">✕</button>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs text-slate-600 mb-3 uppercase tracking-widest font-semibold">AI Analysis Tools — click to expand</p>

          <AccordionSection icon="🔍" title="Component Inspector" subtitle="Search, filter and highlight components" defaultOpen={true}>
            <ComponentSearch components={selectedComponents} onHighlight={(id) => console.log('Highlight:', id)} onSelect={(comp) => setSelectedComp(comp)} />
          </AccordionSection>

          <AccordionSection icon="🚀" title="AI Improvement Suggester" subtitle="Get ranked suggestions to improve your prototype" badge="New">
  <ImprovementSuggester idea={idea} components={selectedComponents} />
</AccordionSection>

<AccordionSection icon="✨" title="Brand Kit Generator" subtitle="AI creates product names, taglines, colors and pitch" badge="New">
  <NameGenerator idea={idea} components={selectedComponents} />
</AccordionSection>

          <AccordionSection icon="⭐" title="Rate This Prototype" subtitle="Rate difficulty, time spent and leave a personal review">
            <PrototypeRating idea={idea} />
          </AccordionSection>

          <AccordionSection icon="🗓️" title="Build Timeline" subtitle="Track your build progress milestone by milestone">
  <BuildTimeline idea={idea} />
</AccordionSection>

          <AccordionSection icon="⚖️" title="Component Comparison" subtitle="Compare any two components side by side with AI analysis">
            <ComponentComparison components={selectedComponents} idea={idea} />
          </AccordionSection>

          <AccordionSection icon="📝" title="Prototype Notes" subtitle="Build log, next steps, status tracking">
            <PrototypeNotes idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="👥" title="Team Collaboration" subtitle="Add team members, assign tasks, and share notes">
  <TeamCollaboration idea={idea} components={selectedComponents} />
</AccordionSection>

          <AccordionSection icon="🕐" title="Version History" subtitle="Browse and restore previous versions">
            <VersionHistory idea={idea} currentComponents={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🖨️" title="Custom Enclosure Builder" subtitle="Choose enclosure type, color, material and export STL" badge="3D Print">
            <EnclosureCustomizer components={selectedComponents} idea={idea} printAnalysis={printAnalysis || {}} />
          </AccordionSection>

          <AccordionSection icon="📐" title="3D Model Export" subtitle="Export as OBJ, GLTF or estimate 3D print cost">
            <ModelExportPanel components={selectedComponents} idea={idea} printAnalysis={printAnalysis || {}} />
          </AccordionSection>

          <AccordionSection icon="🔌" title="Breadboard View" subtitle="Visual wiring guide for physical breadboard building">
            <BreadboardView idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🖥️" title="PCB Layout Planner" subtitle="AI designs PCB component placement and trace routing">
  <PCBPlanner idea={idea} components={selectedComponents} />
</AccordionSection>

          <AccordionSection icon="📌" title="Pin Assignment Editor" subtitle="Assign and validate microcontroller pin connections">
            <PinAssignmentEditor idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="⚡" title="Circuit Diagram" subtitle="AI-generated wiring diagram with colored connections">
            <CircuitDiagram idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="💰" title="Build Cost Estimator" subtitle="Compare prices across Amazon, AliExpress, and local stores">
            <CostEstimator idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🛒" title="Shopping List Generator" subtitle="Complete prioritized shopping list with buy links and prices">
  <ShoppingListGenerator idea={idea} components={selectedComponents} />
</AccordionSection>

          <AccordionSection icon="💬" title="Prototype Explainer" subtitle="Explain your prototype in simple language for any audience">
            <PrototypeExplainer idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="⚖️" title="Prototype Comparison" subtitle="Compare your prototype against an AI-generated alternative">
            <PrototypeComparison idea={idea} currentComponents={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🔄" title="Component Substitution" subtitle="Find alternatives for any unavailable or expensive component">
            <SubstitutionSuggester idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🛡️" title="Safety Checklist" subtitle="AI identifies risks and generates a pre-build safety checklist">
            <SafetyChecklist idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🔋" title="Power Calculator" subtitle="Calculate current draw, battery life, and power requirements">
            <PowerCalculator idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="📊" title="Difficulty & Build Time" subtitle="AI estimates how hard this is to build and how long it takes">
            <DifficultyPanel idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🗺️" title="Learning Roadmap" subtitle="Step-by-step learning path to build this prototype successfully">
  <LearningRoadmap idea={idea} components={selectedComponents} />
</AccordionSection>

          <AccordionSection icon="🔍" title="Missing Components" subtitle="AI scans for missing resistors, capacitors, and protection circuits">
            <MissingComponents idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🔧" title="Change Validator" subtitle="Validate proposed changes before implementing them">
            <ChangeValidator idea={idea} components={selectedComponents} />
          </AccordionSection>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-400">Components — click for details or datasheet</h3>
            {bomExported && <span className="text-xs text-emerald-400">✅ BOM Downloaded!</span>}
          </div>
          {selectedComponents.length > 0 && (() => {
            const { totalMin, totalMax } = generateBOMCSV(selectedComponents, idea)
            return (
              <p className="text-xs text-slate-600 mb-3">
                Estimated total cost: <span className="text-emerald-400">${totalMin.toFixed(0)} — ${totalMax.toFixed(0)} USD</span>
              </p>
            )
          })()}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {selectedComponents.map(comp => (
              <div key={comp.id} className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-500 rounded-xl p-3 text-center transition">
                <div className="text-2xl mb-1">{comp.icon}</div>
                <div className="text-xs text-white font-medium leading-tight">{comp.name}</div>
                <div className="text-xs text-slate-600 mt-1">{comp.category}</div>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setSelectedComp(comp)} className="flex-1 text-xs text-indigo-500 hover:text-indigo-300 transition">details</button>
                  <button onClick={() => setDatasheetComp(comp)} className="flex-1 text-xs text-slate-500 hover:text-white transition">sheet</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ComponentDetail comp={selectedComp} onClose={() => setSelectedComp(null)} />
      {datasheetComp && <DatasheetViewer component={datasheetComp} onClose={() => setDatasheetComp(null)} />}
      <ValidationPanel result={validation} loading={validating} onClose={() => { setValidation(null); setValidating(false) }} />
      {shareOpen && <ShareModal idea={idea} components={selectedComponents} onClose={() => setShareOpen(false)} />}
    </div>
  )
}

export default Viewer