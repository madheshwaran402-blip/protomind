import { useState } from 'react'
import { exportAsOBJ, exportAsGLTF, estimate3DPrintCost } from '../services/modelExport'
import { notify } from '../services/toast'

const FORMATS = [
  { id: 'obj', name: 'OBJ', icon: '📐', desc: 'Universal 3D format — opens in Blender, Maya, AutoCAD', color: 'text-blue-400' },
  { id: 'gltf', name: 'GLTF', icon: '🌐', desc: 'Web 3D standard — opens in Three.js, Unity, web viewers', color: 'text-green-400' },
  { id: 'stl', name: 'STL', icon: '🖨️', desc: 'For 3D printing — use with Cura, PrusaSlicer, Bambu', color: 'text-indigo-400' },
]

const MATERIALS = [
  { id: 'pla', name: 'PLA', price: '$20/kg' },
  { id: 'petg', name: 'PETG', price: '$25/kg' },
  { id: 'abs', name: 'ABS', price: '$22/kg' },
  { id: 'tpu', name: 'TPU', price: '$35/kg' },
]

function ModelExportPanel({ components, idea, printAnalysis }) {
  const [selectedFormat, setSelectedFormat] = useState('obj')
  const [selectedMaterial, setSelectedMaterial] = useState('pla')
  const [wallThickness, setWallThickness] = useState(2)
  const [printEstimate, setPrintEstimate] = useState(null)

  function handleExport() {
    if (selectedFormat === 'obj') {
      exportAsOBJ(components, idea)
      notify.success('OBJ file downloaded — open in Blender!')
    } else if (selectedFormat === 'gltf') {
      exportAsGLTF(components, idea)
      notify.success('GLTF file downloaded — open in any 3D viewer!')
    } else {
      notify.info('Use the Custom Enclosure Builder above to export STL')
    }
  }

  function handleEstimate() {
    const est = estimate3DPrintCost(components, wallThickness, selectedMaterial)
    setPrintEstimate(est)
    notify.info('Print cost estimated!')
  }

  return (
    <div className="space-y-5">

      {/* Format selector */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Export Format</h4>
        <div className="space-y-2">
          {FORMATS.map(fmt => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                selectedFormat === fmt.id
                  ? 'bg-indigo-950 border-indigo-700'
                  : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-800'
              }`}
            >
              <span className="text-xl shrink-0">{fmt.icon}</span>
              <div>
                <p className={`text-sm font-bold ${fmt.color}`}>{fmt.name}</p>
                <p className="text-slate-500 text-xs">{fmt.desc}</p>
              </div>
              {selectedFormat === fmt.id && (
                <span className="ml-auto text-indigo-400 text-xs shrink-0">Selected ✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleExport}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
      >
        ⬇️ Export as {selectedFormat.toUpperCase()}
      </button>

      {/* 3D Print Cost Estimator */}
      <div className="border-t border-[#2e2e4e] pt-5">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          🖨️ 3D Print Cost Estimator
        </h4>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-2">Material</p>
            <div className="grid grid-cols-2 gap-1">
              {MATERIALS.map(mat => (
                <button
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={`py-2 rounded-lg text-xs font-medium transition ${
                    selectedMaterial === mat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#1e1e2e] text-slate-400 hover:text-white'
                  }`}
                >
                  {mat.name}
                  <span className="block text-xs opacity-60">{mat.price}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Wall Thickness</p>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => setWallThickness(Math.max(1, wallThickness - 0.5))} className="w-8 h-8 bg-[#1e1e2e] rounded-lg text-white">-</button>
              <span className="text-white font-mono text-sm flex-1 text-center">{wallThickness}mm</span>
              <button onClick={() => setWallThickness(Math.min(5, wallThickness + 0.5))} className="w-8 h-8 bg-[#1e1e2e] rounded-lg text-white">+</button>
            </div>
          </div>
        </div>

        <button
          onClick={handleEstimate}
          className="w-full py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition mb-3"
        >
          📊 Estimate Print Cost
        </button>

        {printEstimate && (
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Filament Weight', value: printEstimate.weightGrams + 'g', icon: '⚖️' },
                { label: 'Print Time', value: printEstimate.printTimeLabel, icon: '⏱️' },
                { label: 'Filament Length', value: printEstimate.filamentLength + 'mm', icon: '📏' },
                { label: 'Material', value: printEstimate.material, icon: '🧪' },
              ].map(item => (
                <div key={item.label} className="bg-[#0d0d1a] rounded-lg p-3 text-center">
                  <p className="text-lg mb-1">{item.icon}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                  <p className="text-slate-600 text-xs">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-[#2e2e4e] pt-3 flex justify-between">
              <div className="text-center">
                <p className="text-xs text-slate-500">Filament</p>
                <p className="text-emerald-400 font-bold">${printEstimate.filamentCost}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Electricity</p>
                <p className="text-emerald-400 font-bold">${printEstimate.electricityCost}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 font-semibold">Total Cost</p>
                <p className="text-emerald-400 font-black text-lg">${printEstimate.totalCost}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelExportPanel