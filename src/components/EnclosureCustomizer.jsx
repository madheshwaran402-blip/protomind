import { useState } from 'react'
import { downloadSTL } from '../services/stlExport'
import { notify } from '../services/toast'

const ENCLOSURE_TYPES = [
  {
    id: 'box',
    name: 'Standard Box',
    icon: '📦',
    desc: 'Rectangular enclosure with lid',
    bestFor: 'Most electronics projects',
  },
  {
    id: 'wristband',
    name: 'Wristband',
    icon: '⌚',
    desc: 'Curved band for wrist-worn devices',
    bestFor: 'Smartwatches, health monitors',
  },
  {
    id: 'helmet',
    name: 'Helmet Mount',
    icon: '⛑️',
    desc: 'Curved shell that mounts on helmet',
    bestFor: 'Smart helmets, cycling sensors',
  },
  {
    id: 'tube',
    name: 'Tube / Cylinder',
    icon: '🔭',
    desc: 'Cylindrical housing',
    bestFor: 'Sensors, pen-like devices',
  },
  {
    id: 'flat',
    name: 'Flat Panel',
    icon: '📋',
    desc: 'Thin flat mounting panel',
    bestFor: 'Wall-mounted sensors, displays',
  },
  {
    id: 'clip',
    name: 'Clip-On',
    icon: '🔌',
    desc: 'Device that clips onto clothing or bags',
    bestFor: 'Wearable sensors, trackers',
  },
]

const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Yellow', hex: '#ca8a04' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Pink', hex: '#db2777' },
  { name: 'Cyan', hex: '#0891b2' },
]

const MATERIALS = [
  { id: 'pla', name: 'PLA', desc: 'Easy to print, biodegradable', icon: '🌿' },
  { id: 'petg', name: 'PETG', desc: 'Stronger, slight flex', icon: '💪' },
  { id: 'abs', name: 'ABS', desc: 'Heat resistant, durable', icon: '🔥' },
  { id: 'tpu', name: 'TPU', desc: 'Flexible and rubber-like', icon: '🤸' },
]

function EnclosureCustomizer({ components, idea, printAnalysis }) {
  const [selectedType, setSelectedType] = useState('box')
  const [selectedColor, setSelectedColor] = useState('#4f46e5')
  const [selectedMaterial, setSelectedMaterial] = useState('pla')
  const [wallThickness, setWallThickness] = useState(2)
  const [addLid, setAddLid] = useState(true)
  const [addMounting, setAddMounting] = useState(true)
  const [exported, setExported] = useState(false)

  function handleExport() {
    const customPrintAnalysis = {
      ...printAnalysis,
      enclosureType: selectedType,
      color: selectedColor,
      material: selectedMaterial,
      wallThickness,
      addLid,
      addMounting,
    }
    downloadSTL(components, idea, customPrintAnalysis)
    setExported(true)
    notify.success('Custom ' + selectedType + ' enclosure exported!')
    setTimeout(() => setExported(false), 3000)
  }

  const selectedEnclosure = ENCLOSURE_TYPES.find(e => e.id === selectedType)

  return (
    <div className="space-y-5">

      {/* Enclosure type */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Enclosure Type
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {ENCLOSURE_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-3 rounded-xl border text-left transition ${
                selectedType === type.id
                  ? 'bg-indigo-950 border-indigo-700'
                  : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-800'
              }`}
            >
              <div className="text-xl mb-1">{type.icon}</div>
              <p className="text-white text-xs font-medium">{type.name}</p>
              <p className="text-slate-600 text-xs mt-0.5 line-clamp-1">{type.bestFor}</p>
            </button>
          ))}
        </div>
        {selectedEnclosure && (
          <p className="text-slate-500 text-xs mt-2">
            📝 {selectedEnclosure.desc} — best for: {selectedEnclosure.bestFor}
          </p>
        )}
      </div>

      {/* Color picker */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Filament Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color.hex}
              onClick={() => setSelectedColor(color.hex)}
              title={color.name}
              className={`w-8 h-8 rounded-full border-2 transition ${
                selectedColor === color.hex
                  ? 'border-white scale-110'
                  : 'border-transparent hover:border-slate-400'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Selected: <span style={{ color: selectedColor }}>■</span> {COLORS.find(c => c.hex === selectedColor)?.name || 'Custom'}
        </p>
      </div>

      {/* Material */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Print Material
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {MATERIALS.map(mat => (
            <button
              key={mat.id}
              onClick={() => setSelectedMaterial(mat.id)}
              className={`p-3 rounded-xl border text-center transition ${
                selectedMaterial === mat.id
                  ? 'bg-indigo-950 border-indigo-700'
                  : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-800'
              }`}
            >
              <div className="text-lg mb-1">{mat.icon}</div>
              <p className="text-white text-xs font-bold">{mat.name}</p>
              <p className="text-slate-600 text-xs mt-0.5">{mat.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Options
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm">Wall Thickness</p>
              <p className="text-slate-500 text-xs">{wallThickness}mm — {wallThickness <= 1.5 ? 'Thin/Light' : wallThickness <= 2.5 ? 'Standard' : 'Thick/Strong'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWallThickness(Math.max(1, wallThickness - 0.5))}
                className="w-7 h-7 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-lg text-white text-sm transition"
              >
                -
              </button>
              <span className="text-white font-mono text-sm w-10 text-center">{wallThickness}</span>
              <button
                onClick={() => setWallThickness(Math.min(5, wallThickness + 0.5))}
                className="w-7 h-7 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-lg text-white text-sm transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm">Include Snap-Fit Lid</p>
              <p className="text-slate-500 text-xs">Adds a removable lid to the enclosure</p>
            </div>
            <button
              onClick={() => setAddLid(!addLid)}
              className={`w-12 h-6 rounded-full transition relative ${addLid ? 'bg-indigo-600' : 'bg-[#2e2e4e]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${addLid ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm">Mounting Holes</p>
              <p className="text-slate-500 text-xs">Adds corner holes for screws or standoffs</p>
            </div>
            <button
              onClick={() => setAddMounting(!addMounting)}
              className={`w-12 h-6 rounded-full transition relative ${addMounting ? 'bg-indigo-600' : 'bg-[#2e2e4e]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${addMounting ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Export Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-slate-500">Type: <span className="text-white">{selectedEnclosure?.name}</span></div>
          <div className="text-slate-500">Material: <span className="text-white">{selectedMaterial.toUpperCase()}</span></div>
          <div className="text-slate-500">Wall: <span className="text-white">{wallThickness}mm</span></div>
          <div className="text-slate-500">Color: <span style={{ color: selectedColor }}>■</span> <span className="text-white">{COLORS.find(c => c.hex === selectedColor)?.name}</span></div>
          <div className="text-slate-500">Lid: <span className="text-white">{addLid ? 'Yes' : 'No'}</span></div>
          <div className="text-slate-500">Mounting: <span className="text-white">{addMounting ? 'Yes' : 'No'}</span></div>
        </div>
      </div>

      <button
        onClick={handleExport}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
          exported
            ? 'bg-green-900 text-green-400'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        }`}
      >
        {exported ? '✅ Enclosure STL Downloaded!' : '🖨️ Export Custom Enclosure STL'}
      </button>

    </div>
  )
}

export default EnclosureCustomizer