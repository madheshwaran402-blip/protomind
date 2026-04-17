import CodeGenerator from '../components/CodeGenerator'
import PinAssignmentEditor from '../components/PinAssignmentEditor'
import BreadboardView from '../components/BreadboardView'
import ModelExportPanel from '../components/ModelExportPanel'
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
import { OrbitControls, Grid, Html } from '@react-three/drei'
import StepBar from '../components/StepBar'
import ComponentBox3D from '../components/ComponentBox3D'
import ConnectionLines3D from '../components/ConnectionLines3D'

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
    <Html position={[
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.3,
      (start[2] + end[2]) / 2,
    ]}>
      <div className="bg-black bg-opacity-70 text-yellow-400 text-xs px-2 py-0.5 rounded whitespace-nowrap border border-yellow-800">
        {label}
      </div>
    </Html>
  )
}

function Scene({ components, exploded, showMeasurements }) {
  const positions = get3DPositions(components.length, exploded)

  const width = components.length > 0
    ? Math.min(components.length, 3) * (exploded ? 5 : 3)
    : 0
  const depth = Math.ceil(components.length / 3) * (exploded ? 5 : 3)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />
      <Grid
        args={[30, 30]}
        position={[0, -0.5, 0]}
        cellColor="#1e1e2e"
        sectionColor="#2e2e4e"
        fadeDistance={30}
      />
      {!exploded && <ConnectionLines3D components={components} positions={positions} />}
      {components.map((comp, index) => (
        <ComponentBox3D key={comp.id} comp={comp} position={positions[index]} />
      ))}
      {showMeasurements && positions.length > 1 && (
        <>
          <MeasurementLine
            start={positions[0]}
            end={positions[Math.min(2, positions.length - 1)]}
            label={`Width: ~${(width * 30).toFixed(0)}mm`}
          />
          <MeasurementLine
            start={positions[0]}
            end={positions[positions.length - 1]}
            label={`Depth: ~${(depth * 25).toFixed(0)}mm`}
          />
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
  const [bomExported, setBomExported] = useState(false)
  const [saved, setSaved] = useState(false)
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)
  const [pdfExported, setPdfExported] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [viewAngle, setViewAngle] = useState('perspective')

  async function analysePrinting() {
    setPrintLoading(true)
    try {
      const result = await analyse3DPrintingNeed(idea, selectedComponents)
      setPrintAnalysis(result)
      if (result.needs3DPrinting) {
        notify.info('3D printing recommended!')
      } else {
        notify.info('3D printing not required')
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
        notify.success('Validated! Score: ' + result.score + '/100')
      } else {
        notify.warning('Issues found. Score: ' + result.score + '/100')
      }
    } catch {
      setValidation({
        valid: false, score: 0,
        issues: ['Could not validate. Make sure Ollama is running.'],
        warnings: [], suggestions: [], verdict: 'Validation failed',
      })
      notify.error('Validation failed — is Ollama running?')
    } finally {
      setValidating(false)
    }
  }

  const CAMERA_PRESETS = {
    perspective: { position: [0, 8, 12], fov: 50 },
    top: { position: [0, 20, 0], fov: 45 },
    front: { position: [0, 2, 16], fov: 45 },
    side: { position: [16, 2, 0], fov: 45 },
  }

  const camera = CAMERA_PRESETS[viewAngle] || CAMERA_PRESETS.perspective

  return (
    <div className="min-h-screen page-enter">
      <StepBar currentStep={4} />
      <div className="px-16 pb-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white text-sm mb-2 flex items-center gap-2 transition">← Back</button>
            <h2 className="text-3xl font-bold mb-1">3D Prototype View</h2>
            <p className="text-slate-400 text-sm">Idea: <span className="text-indigo-400 italic">"{idea}"</span></p>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap justify-end max-w-4xl">
            <button onClick={() => navigate('/')} className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-sm transition">Start New</button>
            <button
              onClick={async () => {
                const project = saveProject(idea, selectedComponents, null)
                setSaved(true)
                notify.success('Saved — version ' + project.version + '!')
                const user = await getUser()
                if (user) {
                  try { await saveProjectCloud(idea, selectedComponents); notify.info('Synced!') }
                  catch { notify.warning('Cloud sync failed') }
                }
              }}
              disabled={saved}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${saved ? 'bg-green-900 text-green-400 cursor-default' : 'bg-green-700 hover:bg-green-600 text-white'}`}
            >
              {saved ? '✅ Saved!' : '💾 Save'}
            </button>
            <button onClick={() => setShareOpen(true)} className="px-4 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition">🔗 Share</button>
            <button onClick={() => { downloadBOM(selectedComponents, idea); setBomExported(true); notify.success('BOM downloaded!') }} className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition">📋 BOM</button>
            <button onClick={() => { generatePrototypePDF(idea, selectedComponents, validation); setPdfExported(true); notify.success('PDF downloaded!') }} className="px-4 py-2.5 bg-rose-700 hover:bg-rose-600 rounded-xl text-sm font-semibold transition">📄 PDF</button>
            <button onClick={handleValidate} disabled={validating} className="px-4 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">{validating ? '...' : '🔍 Validate'}</button>
            <button onClick={analysePrinting} disabled={printLoading} className="px-4 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">{printLoading ? '...' : '🖨️ 3D Print?'}</button>
            {printAnalysis?.needs3DPrinting && (
              <button onClick={() => { downloadSTL(selectedComponents, idea, printAnalysis); setStlExported(true); notify.success('STL ready!') }} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition">⬇️ STL</button>
            )}
          </div>
        </div>
        {/* 3D Canvas Controls */}
        <div className="flex gap-3 mb-3 flex-wrap items-center">
          <div className="flex gap-1 text-xs text-slate-600">
            <span>🖱️ Drag — Rotate</span>
            <span className="mx-2">·</span>
            <span>Scroll — Zoom</span>
            <span className="mx-2">·</span>
            <span>Hover — Spin</span>
          </div>

          <div className="ml-auto flex gap-2 flex-wrap">
            {/* View angle presets */}
            {['perspective', 'top', 'front', 'side'].map(angle => (
              <button
                key={angle}
                onClick={() => setViewAngle(angle)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewAngle === angle
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#1e1e2e] text-slate-400 hover:text-white'
                }`}
              >
                {angle === 'perspective' ? '🎥' : angle === 'top' ? '⬆️' : angle === 'front' ? '⬛' : '◀️'} {angle.charAt(0).toUpperCase() + angle.slice(1)}
              </button>
            ))}

            {/* Exploded view toggle */}
            <button
              onClick={() => {
                setExploded(!exploded)
                notify.info(exploded ? 'Normal view' : 'Exploded view — components spread apart')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                exploded ? 'bg-yellow-700 text-yellow-100' : 'bg-[#1e1e2e] text-slate-400 hover:text-white'
              }`}
            >
              💥 {exploded ? 'Exploded' : 'Explode'}
            </button>

            {/* Measurements toggle */}
            <button
              onClick={() => {
                setShowMeasurements(!showMeasurements)
                notify.info(showMeasurements ? 'Measurements hidden' : 'Measurements shown')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                showMeasurements ? 'bg-yellow-700 text-yellow-100' : 'bg-[#1e1e2e] text-slate-400 hover:text-white'
              }`}
            >
              📏 {showMeasurements ? 'Hide Sizes' : 'Show Sizes'}
            </button>
          </div>
        </div>

        {/* 3D Canvas + Chat */}
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]" style={{ height: '480px' }}>
              {selectedComponents.length > 0 ? (
                <Canvas
                  key={viewAngle}
                  camera={{ position: camera.position, fov: camera.fov }}
                  style={{ background: '#0a0a0f' }}
                >
                  <Suspense fallback={null}>
                    <Scene
                      components={selectedComponents}
                      exploded={exploded}
                      showMeasurements={showMeasurements}
                    />
                  </Suspense>
                </Canvas>
              ) : (
                <div className="h-full flex items-center justify-center bg-[#0d0d1a]">
                  <p className="text-slate-400">No components to display</p>
                </div>
              )}
            </div>

            {/* View mode indicators */}
            <div className="flex gap-2 mt-2">
              {exploded && (
                <span className="text-xs bg-yellow-950 text-yellow-400 border border-yellow-900 px-3 py-1 rounded-full">
                  💥 Exploded View — components spread apart for inspection
                </span>
              )}
              {showMeasurements && (
                <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-900 px-3 py-1 rounded-full">
                  📏 Approximate dimensions shown
                </span>
              )}
            </div>
          </div>

          <div className="w-80">
            <AIChat idea={idea} components={selectedComponents} />
          </div>
        </div>

        {/* 3D Print Result */}
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
            <div><p className="text-green-400 font-semibold text-sm">STL Downloaded!</p><p className="text-green-700 text-xs">Send to JLCPCB or Shapeways.</p></div>
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

        {/* Accordion Sections */}
        <div className="mt-6">
          <p className="text-xs text-slate-600 mb-3 uppercase tracking-widest font-semibold">AI Analysis Tools — click to expand</p>

          <AccordionSection icon="📝" title="Prototype Notes" subtitle="Build log, next steps, status tracking" defaultOpen={true}>
            <PrototypeNotes idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🕐" title="Version History" subtitle="Browse and restore previous versions">
            <VersionHistory idea={idea} currentComponents={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🖨️" title="Custom Enclosure Builder" subtitle="Choose enclosure type, color, material and export STL" badge="3D Print">
            <EnclosureCustomizer components={selectedComponents} idea={idea} printAnalysis={printAnalysis || {}} />
          </AccordionSection>

          <AccordionSection icon="📐" title="3D Model Export" subtitle="Export as OBJ, GLTF, or estimate 3D print cost" badge="New">
  <ModelExportPanel components={selectedComponents} idea={idea} printAnalysis={printAnalysis || {}} />
</AccordionSection>

          <AccordionSection icon="⚡" title="Circuit Diagram" subtitle="AI-generated wiring diagram with colored connections">
            <CircuitDiagram idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🔌" title="Breadboard View" subtitle="Visual wiring guide for physical breadboard building">
  <BreadboardView idea={idea} components={selectedComponents} />
</AccordionSection>

<AccordionSection icon="📌" title="Pin Assignment Editor" subtitle="Assign and validate microcontroller pin connections">
  <PinAssignmentEditor idea={idea} components={selectedComponents} />
</AccordionSection>

<AccordionSection icon="💻" title="Arduino Code Generator" subtitle="AI generates complete working code for your prototype" badge="New">
  <CodeGenerator idea={idea} components={selectedComponents} />
</AccordionSection>

          <AccordionSection icon="💰" title="Build Cost Estimator" subtitle="Compare prices across Amazon, AliExpress, and local stores">
            <CostEstimator idea={idea} components={selectedComponents} />
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

          <AccordionSection icon="🔍" title="Missing Components" subtitle="AI scans for missing resistors, capacitors, and protection circuits">
            <MissingComponents idea={idea} components={selectedComponents} />
          </AccordionSection>

          <AccordionSection icon="🔧" title="Change Validator" subtitle="Validate proposed changes before implementing them">
            <ChangeValidator idea={idea} components={selectedComponents} />
          </AccordionSection>
        </div>

        {/* Components grid */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-400">Components — click any to see details</h3>
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
      <ValidationPanel result={validation} loading={validating} onClose={() => { setValidation(null); setValidating(false) }} />
      {shareOpen && <ShareModal idea={idea} components={selectedComponents} onClose={() => setShareOpen(false)} />}
    </div>
  )
}

export default Viewer