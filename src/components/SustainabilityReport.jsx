import { useState } from 'react'
import { generateSustainabilityReport, saveSustainabilityReport, getSustainabilityReport } from '../services/sustainabilityService'
import { notify } from '../services/toast'

const CAT_COLORS = ['#22c55e', '#0ea5e9', '#f59e0b', '#a855f7', '#14b8a6']

function SustainabilityReport({ idea, components }) {
  const [result, setResult] = useState(getSustainabilityReport(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateSustainabilityReport(idea, components)
      setResult(data)
      saveSustainabilityReport(idea, data)
      notify.success('Sustainability report ready! Score: ' + data.sustainabilityScore + '/100')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const scoreColor = result ? (result.sustainabilityScore >= 70 ? '#22c55e' : result.sustainabilityScore >= 40 ? '#f59e0b' : '#ef4444') : '#22c55e'
  const categories = result?.categories || []

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate a full sustainability and environmental impact report</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Generating sustainability report...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#1e1e2e" strokeWidth="6" />
                <circle cx="40" cy="40" r="35" fill="none" stroke={scoreColor} strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 35}
                  strokeDashoffset={2 * Math.PI * 35 * (1 - result.sustainabilityScore / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xl font-black" style={{ color: scoreColor }}>{result.sustainabilityScore}</p>
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Sustainability Score</p>
              {result.carbonFootprint && <p className="text-slate-400 text-xs">Carbon footprint: {result.carbonFootprint}</p>}
              <p className="text-slate-500 text-xs">{categories.length} categories evaluated</p>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.map(function(cat, i) {
              const color = CAT_COLORS[i % CAT_COLORS.length]
              return (
                <button key={i} onClick={function() { setSelected(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (selected === i ? 'text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}
                  style={selected === i ? { backgroundColor: color } : {}}>
                  {cat.name}
                  <span className="ml-1 opacity-70">{cat.score}</span>
                </button>
              )
            })}
          </div>

          {categories[selected] && (
            <div className="space-y-3">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-bold">{categories[selected].name}</p>
                  <span className="font-black text-lg" style={{ color: CAT_COLORS[selected % CAT_COLORS.length] }}>{categories[selected].score}/100</span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: categories[selected].score + '%', backgroundColor: CAT_COLORS[selected % CAT_COLORS.length] }} />
                </div>
              </div>

              {categories[selected].findings?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-slate-500 text-xs font-semibold mb-2">Findings</p>
                  <ul className="space-y-1">
                    {categories[selected].findings.map(function(f, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-slate-500 shrink-0">-</span>{f}</li>
                    })}
                  </ul>
                </div>
              )}

              {categories[selected].improvements?.length > 0 && (
                <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                  <p className="text-green-400 text-xs font-semibold mb-2">Improvements</p>
                  <ul className="space-y-1">
                    {categories[selected].improvements.map(function(imp, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400 shrink-0">{i+1}.</span>{imp}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate Report</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🌱</div>
          <p className="text-white font-semibold mb-1">Sustainability Report</p>
          <p className="text-slate-500 text-sm">Evaluate environmental impact, carbon footprint and sustainability score</p>
        </div>
      )}
    </div>
  )
}

export default SustainabilityReport
