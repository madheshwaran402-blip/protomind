import { useState } from 'react'
import { mapStakeholders, saveStakeholderMap, getStakeholderMap } from '../services/stakeholderService'
import { notify } from '../services/toast'

const INFLUENCE_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' }
const TYPE_COLORS = {
  Customer: '#6366f1', Investor: '#22c55e', Partner: '#0ea5e9',
  Regulator: '#f59e0b', Supplier: '#a855f7', Community: '#14b8a6',
}
const AVATARS = ['👔', '💰', '🤝', '🏛️', '🏭', '👥', '🎓', '📰', '🔬']

function StakeholderMap({ idea, components }) {
  const [result, setResult] = useState(getStakeholderMap(idea))
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)

  async function handleMap() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await mapStakeholders(idea, components)
      setResult(data)
      saveStakeholderMap(idea, data)
      notify.success((data.stakeholders?.length || 0) + ' stakeholders mapped!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const stakeholders = result?.stakeholders || []
  const types = ['All', ...new Set(stakeholders.map(function(s) { return s.type }).filter(Boolean))]
  const filtered = filter === 'All' ? stakeholders : stakeholders.filter(function(s) { return s.type === filter })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Map all stakeholders with influence levels and engagement strategies</p>
        <button onClick={handleMap} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Mapping...' : 'Map Stakeholders'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Mapping stakeholders...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {['High', 'Medium', 'Low'].map(function(inf) {
              const count = stakeholders.filter(function(s) { return s.influence === inf }).length
              return (
                <div key={inf} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                  <p className="text-xl font-black" style={{ color: INFLUENCE_COLORS[inf] }}>{count}</p>
                  <p className="text-slate-500 text-xs">{inf} Influence</p>
                </div>
              )
            })}
          </div>

          <div className="flex gap-1 flex-wrap">
            {types.map(function(type) {
              const color = TYPE_COLORS[type] || '#6366f1'
              return (
                <button key={type} onClick={function() { setFilter(type) }}
                  className={'text-xs px-2 py-1 rounded-lg border transition ' + (filter === type ? 'text-white' : 'bg-[#13131f] text-slate-500 border-[#2e2e4e]')}
                  style={filter === type ? { backgroundColor: color, borderColor: color } : {}}>
                  {type}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {filtered.map(function(s, i) {
              const typeColor = TYPE_COLORS[s.type] || '#6366f1'
              const infColor = INFLUENCE_COLORS[s.influence] || '#f59e0b'
              const avatar = AVATARS[i % AVATARS.length]
              const isExp = expanded === i
              return (
                <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                  <button onClick={function() { setExpanded(isExp ? null : i) }}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition">
                    <span className="text-2xl shrink-0">{avatar}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{s.name}</p>
                      <div className="flex gap-2 text-xs mt-0.5">
                        <span style={{ color: typeColor }}>{s.type}</span>
                        <span style={{ color: infColor }}>{s.influence} influence</span>
                        {s.interest && <span className="text-slate-500">{s.interest} interest</span>}
                      </div>
                    </div>
                    <span className="text-slate-600">{isExp ? '-' : '+'}</span>
                  </button>
                  {isExp && (
                    <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3 space-y-2">
                      {s.relationship && <p className="text-slate-400 text-xs">Relationship: {s.relationship}</p>}
                      {s.engagementStrategy && (
                        <div className="bg-blue-950 border border-blue-900 rounded-lg p-2">
                          <p className="text-blue-400 text-xs font-semibold">Engagement Strategy</p>
                          <p className="text-slate-300 text-xs">{s.engagementStrategy}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={handleMap} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Remap</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-white font-semibold mb-1">Stakeholder Map</p>
          <p className="text-slate-500 text-sm">Map all stakeholders with influence, interest and engagement strategies</p>
        </div>
      )}
    </div>
  )
}

export default StakeholderMap
