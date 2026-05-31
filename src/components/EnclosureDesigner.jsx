import { useState } from 'react'
import { generateEnclosureSpec, exportEnclosureSpec } from '../services/enclosureService'
import { notify } from '../services/toast'

const ENCLOSURE_TYPES = [
  { value: 'Desktop', icon: '🖥️', desc: 'Sits on a desk, easy access' },
  { value: 'Wall Mount', icon: '📌', desc: 'Mounts to wall or surface' },
  { value: 'Handheld', icon: '✋', desc: 'Held in hand, ergonomic' },
  { value: 'Weatherproof', icon: '🌧️', desc: 'IP65+ for outdoor use' },
  { value: 'DIN Rail', icon: '⚡', desc: 'Industrial panel mounting' },
  { value: 'Wearable', icon: '⌚', desc: 'Worn on body' },
]

const MATERIALS = [
  { value: 'PLA', color: '#22c55e', temp: '60°C', notes: 'Easy to print, biodegradable, not heat resistant' },
  { value: 'PETG', color: '#3b82f6', temp: '80°C', notes: 'Strong, food safe, slight flex' },
  { value: 'ABS', color: '#f59e0b', temp: '105°C', notes: 'Heat resistant, harder to print' },
  { value: 'ASA', color: '#ef4444', temp: '100°C', notes: 'UV resistant, outdoor use' },
  { value: 'TPU', color: '#a855f7', temp: '80°C', notes: 'Flexible, impact resistant' },
  { value: 'Nylon', color: '#14b8a6', temp: '120°C', notes: 'Very strong, hygroscopic' },
]

function DimensionBox({ dimensions }) {
  if (!dimensions) return null
  const unit = dimensions.unit || 'mm'

  return (
    <div className="relative bg-[#0d0d1a] border-2 border-dashed border-[#2e2e4e] rounded-xl p-8 flex items-center justify-center">
      <div
        className="relative border-2 border-indigo-600 rounded-lg flex items-center justify-center bg-indigo-950"
        style={{
          width: Math.min(200, Math.max(80, (dimensions.length || 100) / 2)) + 'px',
          height: Math.min(150, Math.max(60, (dimensions.width || 80) / 2)) + 'px',
        }}
      >
        <p className="text-indigo-400 text-xs font-mono text-center">
          {dimensions.length}×{dimensions.width}
          <br />
          <span className="text-slate-500">×{dimensions.height} {unit}</span>
        </p>

        {/* Dimension labels */}
        <div className="absolute -top-5 left-0 right-0 flex justify-center">
          <span className="text-slate-500 text-xs">{dimensions.length} {unit}</span>
        </div>
        <div className="absolute -left-10 top-0 bottom-0 flex items-center">
          <span className="text-slate-500 text-xs -rotate-90">{dimensions.width} {unit}</span>
        </div>
      </div>
    </div>
  )
}

function EnclosureDesigner({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [options, setOptions] = useState({
    type: 'Desktop',
    material: 'PLA',
  })

  function updateOption(key, value) {
    setOptions(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = value
      return next
    })
  }

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await generateEnclosureSpec(idea, components, options)
      setResult(data)
      notify.success('Enclosure spec generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'overview', label: '📐 Overview' },
    { id: 'cutouts', label: '✂️ Cutouts' },
    { id: 'print', label: '🖨️ Print' },
    { id: 'assembly', label: '🔧 Assembly' },
  ]

  const selectedMaterial = MATERIALS.find(function(m) { return m.value === options.material }) || MATERIALS[0]

  return (
    <div className="space-y-4">

      {/* Type selector */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Enclosure Type</p>
        <div className="grid grid-cols-3 gap-2">
          {ENCLOSURE_TYPES.map(function(type) {
            return (
              <button
                key={type.value}
                onClick={function() { updateOption('type', type.value) }}
                className={'p-2 rounded-xl border text-center transition ' + (
                  options.type === type.value
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-[#0d0d1a] border-[#1e1e2e] text-slate-400 hover:border-indigo-700'
                )}
              >
                <p className="text-xl mb-0.5">{type.icon}</p>
                <p className="text-xs font-medium">{type.value}</p>
                <p className="text-xs text-slate-600">{type.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Material selector */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Print Material</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MATERIALS.map(function(mat) {
            return (
              <button
                key={mat.value}
                onClick={function() { updateOption('material', mat.value) }}
                title={mat.notes}
                className={'p-2 rounded-xl border text-center transition ' + (
                  options.material === mat.value
                    ? 'border-2 text-white'
                    : 'bg-[#0d0d1a] border-[#1e1e2e] text-slate-400 hover:border-slate-500'
                )}
                style={options.material === mat.value ? {
                  backgroundColor: mat.color + '20',
                  borderColor: mat.color,
                } : {}}
              >
                <p className="font-bold text-xs" style={{ color: mat.color }}>{mat.value}</p>
                <p className="text-slate-600 text-xs">{mat.temp}</p>
              </button>
            )
          })}
        </div>
        <p className="text-slate-600 text-xs mt-1">{selectedMaterial.notes}</p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || components.length === 0}
        className="w-full py-3 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-bold transition disabled:opacity-50"
      >
        {loading ? '📐 Designing...' : '📐 Generate Enclosure Spec'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is designing your enclosure...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Header */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white font-bold text-base">{result.enclosureName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{result.type}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs" style={{ color: selectedMaterial.color }}>{result.material}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">Wall: {result.wallThickness}</span>
                </div>
              </div>
              <button
                onClick={function() { exportEnclosureSpec(result, idea); notify.success('Spec exported!') }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0 transition"
              >
                ⬇️ Export
              </button>
            </div>

            {/* Dimension visualisation */}
            <DimensionBox dimensions={result.outerDimensions} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button
                  key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Features */}
              {result.features && result.features.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Enclosure Features</p>
                  <div className="space-y-2">
                    {result.features.map(function(feat, i) {
                      return (
                        <div key={i} className="flex items-start gap-3 bg-[#0d0d1a] rounded-lg p-3">
                          <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                          <div>
                            <p className="text-white text-xs font-medium">{feat.name}</p>
                            <p className="text-slate-400 text-xs">{feat.description}</p>
                            {feat.location && (
                              <p className="text-teal-400 text-xs">Location: {feat.location}</p>
                            )}
                          </div>
                          {feat.dimensions && (
                            <span className="text-xs text-slate-600 font-mono shrink-0">{feat.dimensions}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Ventilation */}
              {result.ventilation && result.ventilation.required && (
                <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
                  <p className="text-yellow-400 text-xs font-semibold mb-2">💨 Ventilation Required</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Type</p>
                      <p className="text-white">{result.ventilation.type}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Count</p>
                      <p className="text-white">{result.ventilation.count} slots</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Size</p>
                      <p className="text-white">{result.ventilation.size}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Location</p>
                      <p className="text-white">{result.ventilation.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mounting holes */}
              {result.mountingHoles && result.mountingHoles.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Mounting Holes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {result.mountingHoles.map(function(hole, i) {
                      return (
                        <div key={i} className="bg-[#0d0d1a] rounded-lg p-2 text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <div
                              className="w-3 h-3 rounded-full border-2 border-slate-500"
                              style={{ width: Math.max(8, Math.min(20, parseInt(hole.diameter) || 12)) + 'px', height: Math.max(8, Math.min(20, parseInt(hole.diameter) || 12)) + 'px' }}
                            />
                            <span className="text-slate-400">⌀{hole.diameter}</span>
                          </div>
                          <p className="text-white font-mono">x:{hole.x} y:{hole.y}</p>
                          {hole.notes && <p className="text-slate-600">{hole.notes}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Alternative materials */}
              {result.alternativeMaterials && result.alternativeMaterials.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Alternative Materials</p>
                  <div className="space-y-2">
                    {result.alternativeMaterials.map(function(mat, i) {
                      const matInfo = MATERIALS.find(function(m) { return m.value === mat.material }) || {}
                      return (
                        <div key={i} className="flex items-start gap-3 bg-[#0d0d1a] rounded-lg p-3">
                          <span className="text-sm font-bold shrink-0" style={{ color: matInfo.color || '#6366f1' }}>
                            {mat.material}
                          </span>
                          <div className="flex-1 text-xs">
                            <p className="text-green-400">{mat.pros}</p>
                            <p className="text-red-400">{mat.cons}</p>
                          </div>
                          <span className="text-slate-500 text-xs shrink-0">{mat.bestFor}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cutouts tab */}
          {activeTab === 'cutouts' && (
            <div className="space-y-2">
              {(result.cutouts || []).length === 0 ? (
                <p className="text-center text-slate-600 text-sm py-6">No cutouts generated</p>
              ) : (
                result.cutouts.map(function(cutout, i) {
                  return (
                    <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="bg-[#0d0d1a] border-2 border-dashed border-indigo-700 rounded flex items-center justify-center shrink-0 text-xs text-indigo-400 font-mono"
                          style={{
                            width: Math.max(40, Math.min(80, parseInt(cutout.width) || 40)) + 'px',
                            height: Math.max(24, Math.min(50, parseInt(cutout.height) || 24)) + 'px',
                          }}
                        >
                          {cutout.shape || 'rect'}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">{cutout.name}</p>
                          {cutout.component && (
                            <p className="text-indigo-400 text-xs">For: {cutout.component}</p>
                          )}
                          <p className="text-slate-400 text-xs">{cutout.width} × {cutout.height} mm</p>
                          <p className="text-slate-500 text-xs">{cutout.location}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Print settings tab */}
          {activeTab === 'print' && result.printSettings && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Layer Height', value: result.printSettings.layerHeight, icon: '📏' },
                  { label: 'Infill', value: result.printSettings.infill, icon: '🔲' },
                  { label: 'Supports', value: result.printSettings.supports, icon: '🏗️' },
                  { label: 'Print Time', value: result.printSettings.printTime, icon: '⏱️' },
                  { label: 'Filament', value: result.printSettings.filamentUsage, icon: '🧵' },
                ].map(function(setting) {
                  return (
                    <div key={setting.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                      <p className="text-xl mb-1">{setting.icon}</p>
                      <p className="text-white font-bold text-sm">{setting.value || 'N/A'}</p>
                      <p className="text-slate-600 text-xs">{setting.label}</p>
                    </div>
                  )
                })}
              </div>

              {result.tips && result.tips.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Print Tips</p>
                  <ul className="space-y-1">
                    {result.tips.map(function(tip, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-indigo-400 shrink-0">→</span>
                          <p className="text-slate-300">{tip}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Assembly tab */}
          {activeTab === 'assembly' && (
            <div className="space-y-2">
              {(result.assembly || []).map(function(step, i) {
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-teal-950 border border-teal-800 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-300 text-sm">{step}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Design
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-white font-semibold mb-1">Enclosure Designer</p>
          <p className="text-slate-500 text-sm mb-4">
            AI designs a custom enclosure with dimensions, cutouts and print settings
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Custom dimensions</span>
            <span>✓ Connector cutouts</span>
            <span>✓ Print settings</span>
            <span>✓ Assembly guide</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnclosureDesigner