import { useState } from 'react'
import { designEnclosure, saveEnclosureDesign, getEnclosureDesign } from '../services/enclosureDesignService'
import { notify } from '../services/toast'

const IMPORTANCE_STYLES = {
  High: 'text-red-400',
  Medium: 'text-yellow-400',
  Low: 'text-green-400',
}
const MFG_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b']

function EnclosureDesigner({ idea, components }) {
  const [result, setResult] = useState(getEnclosureDesign(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('enclosure')

  async function handleDesign() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await designEnclosure(idea, components)
      setResult(data)
      saveEnclosureDesign(idea, data)
      notify.success('Enclosure design ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const TABS = [{ id: 'enclosure', label: 'Enclosure' }, { id: 'cutouts', label: 'Cutouts' }, { id: 'mfg', label: 'Manufacturing' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Design the physical enclosure for your prototype with cutouts and manufacturing options</p>
        <button onClick={handleDesign} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-stone-700 hover:bg-stone-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Designing...' : 'Design Enclosure'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Designing enclosure...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-stone-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'enclosure' && result.recommendedEnclosure && (
            <div className="space-y-3">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">📦</span>
                  <div>
                    <p className="text-white font-black text-lg">{result.recommendedEnclosure.type}</p>
                    <div className="flex gap-2 text-xs">
                      {result.recommendedEnclosure.material && <span className="text-stone-400">{result.recommendedEnclosure.material}</span>}
                      {result.recommendedEnclosure.ipRating && <span className="text-blue-400">{result.recommendedEnclosure.ipRating}</span>}
                      {result.recommendedEnclosure.color && <span className="text-slate-400">{result.recommendedEnclosure.color}</span>}
                    </div>
                  </div>
                </div>
                {result.recommendedEnclosure.dimensions && (
                  <div className="bg-[#0d0d1a] rounded-xl p-3 text-center">
                    <p className="text-slate-500 text-xs mb-1">Dimensions</p>
                    <p className="text-white font-mono font-bold">{result.recommendedEnclosure.dimensions}</p>
                  </div>
                )}
              </div>

              {result.designFeatures && result.designFeatures.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Design Features</p>
                  {result.designFeatures.map(function(feat, i) {
                    const impColor = IMPORTANCE_STYLES[feat.importance] || 'text-slate-400'
                    return (
                      <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-medium text-sm">{feat.feature}</p>
                          <span className={'text-xs ml-auto ' + impColor}>{feat.importance}</span>
                        </div>
                        <p className="text-slate-400 text-xs">{feat.description}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {result.printableSTLNotes && (
                <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-1">3D Printing Notes</p>
                  <p className="text-slate-300 text-sm">{result.printableSTLNotes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cutouts' && (
            <div className="space-y-2">
              {(result.cuttingOuts || []).map(function(cut, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold text-sm">{cut.component}</p>
                      <span className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-1.5 py-0.5 rounded">{cut.cutoutType}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      {cut.size && <span className="text-yellow-400">Size: {cut.size}</span>}
                      {cut.location && <span className="text-blue-400">Location: {cut.location}</span>}
                    </div>
                  </div>
                )
              })}
              {(!result.cuttingOuts || result.cuttingOuts.length === 0) && (
                <p className="text-slate-500 text-sm text-center py-4">No cutouts defined</p>
              )}
            </div>
          )}

          {activeTab === 'mfg' && (
            <div className="space-y-3">
              {(result.manufacturingOptions || []).map(function(opt, i) {
                const color = MFG_COLORS[i % MFG_COLORS.length]
                return (
                  <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: color + '10', borderColor: color + '30' }}>
                    <p className="text-white font-bold text-sm mb-2">{opt.method}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                      {opt.cost && <span className="text-emerald-400">Cost: {opt.cost}</span>}
                      {opt.leadTime && <span className="text-blue-400">Lead time: {opt.leadTime}</span>}
                    </div>
                    {opt.bestFor && <p className="text-slate-400 text-xs">Best for: {opt.bestFor}</p>}
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleDesign} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Redesign</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-white font-semibold mb-1">Enclosure Designer</p>
          <p className="text-slate-500 text-sm">Design the physical housing with cutouts and manufacturing options</p>
        </div>
      )}
    </div>
  )
}

export default EnclosureDesigner
