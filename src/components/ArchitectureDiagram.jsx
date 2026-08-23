import { useState } from 'react'
import { describeArchitecture, saveArchitecture, getArchitecture } from '../services/architectureService'
import { notify } from '../services/toast'

const LAYER_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7']

function ArchitectureDiagram({ idea, components }) {
  const [result, setResult] = useState(getArchitecture(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('layers')

  async function handleDescribe() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await describeArchitecture(idea, components)
      setResult(data)
      saveArchitecture(idea, data)
      notify.success('Architecture diagram ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const TABS = [{ id: 'layers', label: 'Layers' }, { id: 'flow', label: 'Data Flow' }, { id: 'diagram', label: 'ASCII Diagram' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Describe the full system architecture with layers, data flow and ASCII diagram</p>
        <button onClick={handleDescribe} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Describing...' : 'Describe Architecture'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Describing system architecture...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">System Overview</p>
            <p className="text-white text-sm">{result.overview}</p>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-indigo-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'layers' && (
            <div className="space-y-2">
              {(result.layers || []).map(function(layer, i) {
                const color = LAYER_COLORS[i % LAYER_COLORS.length]
                return (
                  <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: color + '10', borderColor: color + '30' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <p className="text-white font-bold text-sm">{layer.layer}</p>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{layer.description}</p>
                    {layer.components?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {layer.components.map(function(c, j) {
                          return <span key={j} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>{c}</span>
                        })}
                      </div>
                    )}
                    {layer.protocols?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {layer.protocols.map(function(p, j) {
                          return <span key={j} className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-1.5 py-0.5 rounded font-mono">{p}</span>
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-2">
              {(result.dataFlow || []).map(function(flow, i) {
                const arrow = flow.direction === 'bidirectional' ? '<->' : flow.direction === 'to' ? '->' : '<-'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-3">
                    <span className="text-indigo-400 text-xs font-mono font-bold shrink-0">{flow.from}</span>
                    <div className="flex-1 border-t border-dashed border-indigo-700 relative">
                      <span className="absolute left-1/2 -translate-x-1/2 -top-3 text-xs text-slate-500 bg-[#13131f] px-1">{flow.data}</span>
                    </div>
                    <span className="text-slate-500 text-xs shrink-0">{arrow}</span>
                    <div className="flex-1 border-t border-dashed border-indigo-700" />
                    <span className="text-indigo-400 text-xs font-mono font-bold shrink-0">{flow.to}</span>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'diagram' && result.asciiDiagram && (
            <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl p-4">
              <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                {result.asciiDiagram}
              </pre>
            </div>
          )}

          <button onClick={handleDescribe} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🏗️</div>
          <p className="text-white font-semibold mb-1">Architecture Diagram</p>
          <p className="text-slate-500 text-sm">Describe system architecture with layers, data flow and ASCII diagram</p>
        </div>
      )}
    </div>
  )
}

export default ArchitectureDiagram
