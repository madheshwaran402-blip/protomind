import { useState } from 'react'
import { findGrants, saveGrants, getGrants } from '../services/grantFinderService'
import { notify } from '../services/toast'

const TYPE_COLORS = {
  Government: '#6366f1', Academic: '#0ea5e9', Corporate: '#22c55e',
  Nonprofit: '#f59e0b', International: '#a855f7', Accelerator: '#ef4444',
}

function GrantFinder({ idea, components }) {
  const [result, setResult] = useState(getGrants(idea))
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('All')

  async function handleFind() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await findGrants(idea, components)
      setResult(data)
      saveGrants(idea, data)
      notify.success((data.grants?.length || 0) + ' grants found!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const grants = result?.grants || []
  const types = ['All', ...new Set(grants.map(function(g) { return g.type }).filter(Boolean))]
  const filtered = filter === 'All' ? grants : grants.filter(function(g) { return g.type === filter })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Find relevant grants, funding programs and accelerators for your prototype</p>
        <button onClick={handleFind} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Searching...' : 'Find Grants'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Finding grants and funding...</p>
        </div>
      )}

      {result && !loading && (
        <>
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
            {filtered.map(function(grant, i) {
              const color = TYPE_COLORS[grant.type] || '#6366f1'
              const isExp = expanded === i
              return (
                <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                  <button onClick={function() { setExpanded(isExp ? null : i) }}
                    className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#1e1e2e] transition">
                    <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: color }} />
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{grant.name}</p>
                      <div className="flex gap-2 text-xs flex-wrap mt-0.5">
                        {grant.type && <span style={{ color }}>{grant.type}</span>}
                        {grant.amount && <span className="text-emerald-400">{grant.amount}</span>}
                        {grant.deadline && <span className="text-slate-500">Deadline: {grant.deadline}</span>}
                      </div>
                    </div>
                    <span className="text-slate-600 shrink-0">{isExp ? '-' : '+'}</span>
                  </button>
                  {isExp && (
                    <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3 space-y-2">
                      {grant.focus && <p className="text-slate-400 text-xs">Focus: {grant.focus}</p>}
                      {grant.eligibility && <p className="text-slate-300 text-xs">{grant.eligibility}</p>}
                      {grant.applicationTips && grant.applicationTips.length > 0 && (
                        <div>
                          <p className="text-xs text-violet-400 font-semibold mb-1">Application Tips</p>
                          <ul className="space-y-1">
                            {grant.applicationTips.map(function(tip, j) {
                              return <li key={j} className="text-slate-300 text-xs flex gap-2"><span className="text-violet-400 shrink-0">{j+1}.</span>{tip}</li>
                            })}
                          </ul>
                        </div>
                      )}
                      <button onClick={function() { window.open('https://www.google.com/search?q=' + encodeURIComponent(grant.name + ' grant apply'), '_blank') }}
                        className="w-full py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition mt-1">
                        Find Application →
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3">
            <p className="text-yellow-400 text-xs">Note: AI-generated suggestions based on your prototype. Always verify current grant availability and eligibility directly with funders.</p>
          </div>

          <button onClick={handleFind} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Find More Grants</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">💵</div>
          <p className="text-white font-semibold mb-1">Grant Finder</p>
          <p className="text-slate-500 text-sm">Find relevant grants, funding programs and accelerators for your prototype</p>
        </div>
      )}
    </div>
  )
}

export default GrantFinder
