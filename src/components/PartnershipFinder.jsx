import { useState } from 'react'
import { findPartnerships, savePartnerships, getPartnerships } from '../services/partnershipService'
import { notify } from '../services/toast'

const PARTNER_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444']

function PartnershipFinder({ idea, components }) {
  const [result, setResult] = useState(getPartnerships(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  async function handleFind() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await findPartnerships(idea, components)
      setResult(data)
      savePartnerships(idea, data)
      notify.success((data.partnerships?.length || 0) + ' partnership types found!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const partnerships = result?.partnerships || []
  const active = partnerships[selected]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Find strategic partnerships to accelerate your prototype to market</p>
        <button onClick={handleFind} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Finding...' : 'Find Partners'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Finding partnership opportunities...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {partnerships.map(function(p, i) {
              const color = PARTNER_COLORS[i % PARTNER_COLORS.length]
              return (
                <button key={i} onClick={function() { setSelected(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (selected === i ? 'text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}
                  style={selected === i ? { backgroundColor: color } : {}}>
                  {p.type}
                </button>
              )
            })}
          </div>

          {active && (
            <div className="space-y-3">
              <div className="rounded-xl border p-5"
                style={{ backgroundColor: PARTNER_COLORS[selected % PARTNER_COLORS.length] + '10', borderColor: PARTNER_COLORS[selected % PARTNER_COLORS.length] + '40' }}>
                <p className="text-white font-black text-xl mb-1">{active.type}</p>
                {active.value && <p className="text-slate-300 text-sm">{active.value}</p>}
              </div>

              {active.partnerExamples?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-slate-500 text-xs font-semibold mb-2">Example Partners</p>
                  <div className="flex flex-wrap gap-1">
                    {active.partnerExamples.map(function(ex, i) {
                      return (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: PARTNER_COLORS[selected % PARTNER_COLORS.length] + '20', color: PARTNER_COLORS[selected % PARTNER_COLORS.length] }}>
                          {ex}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {active.approachStrategy && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-slate-500 text-xs font-semibold mb-1">Approach Strategy</p>
                  <p className="text-slate-300 text-sm">{active.approachStrategy}</p>
                </div>
              )}

              {active.pitchAngle && (
                <div className="bg-teal-950 border border-teal-800 rounded-xl p-4">
                  <p className="text-teal-400 text-xs font-semibold mb-1">Pitch Angle</p>
                  <p className="text-white text-sm italic">"{active.pitchAngle}"</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={function() { setSelected(Math.max(0, selected-1)) }} disabled={selected===0}
                  className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev</button>
                <button onClick={function() { setSelected(Math.min(partnerships.length-1, selected+1)) }} disabled={selected===partnerships.length-1}
                  className="flex-1 py-1.5 bg-teal-700 text-white rounded-lg text-xs disabled:opacity-30">Next</button>
              </div>
            </div>
          )}

          <button onClick={handleFind} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Refresh</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🤝</div>
          <p className="text-white font-semibold mb-1">Partnership Finder</p>
          <p className="text-slate-500 text-sm">Find strategic partners with approach strategies and pitch angles</p>
        </div>
      )}
    </div>
  )
}

export default PartnershipFinder
