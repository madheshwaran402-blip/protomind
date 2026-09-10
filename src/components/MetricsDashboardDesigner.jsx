import { useState } from 'react'
import { designMetricsDashboard, saveMetricsDashboard, getMetricsDashboard } from '../services/metricsDashboardService'
import { notify } from '../services/toast'

const CAT_COLORS = {
  Growth: '#22c55e', Retention: '#6366f1', Revenue: '#f59e0b',
  Performance: '#0ea5e9', Quality: '#a855f7', Engagement: '#ef4444',
}
const FREQ_ICONS = { Daily: '📅', Weekly: '📆', Monthly: '🗓️', Realtime: '⚡' }

function MetricsDashboardDesigner({ idea, components }) {
  const [result, setResult] = useState(getMetricsDashboard(idea))
  const [loading, setLoading] = useState(false)
  const [filterCat, setFilterCat] = useState('All')
  const [tracked, setTracked] = useState({})

  async function handleDesign() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await designMetricsDashboard(idea, components)
      setResult(data)
      saveMetricsDashboard(idea, data)
      notify.success('Metrics dashboard designed!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleTrack(name) {
    setTracked(function(prev) { return Object.assign({}, prev, { [name]: !prev[name] }) })
  }

  const metrics = result?.metrics || []
  const categories = ['All', ...new Set(metrics.map(function(m) { return m.category }).filter(Boolean))]
  const filtered = filterCat === 'All' ? metrics : metrics.filter(function(m) { return m.category === filterCat })
  const trackedCount = Object.values(tracked).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Define your north star metric and key performance indicators</p>
        <button onClick={handleDesign} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Designing...' : 'Design Metrics'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Designing metrics dashboard...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {result.northStarMetric && (
            <div className="bg-gradient-to-r from-emerald-950 to-[#0d0d1a] border border-emerald-700 rounded-2xl p-5">
              <p className="text-emerald-400 text-xs font-semibold mb-1">⭐ NORTH STAR METRIC</p>
              <p className="text-white font-black text-xl">{result.northStarMetric.name}</p>
              <p className="text-slate-400 text-xs mt-1">{result.northStarMetric.definition}</p>
              {result.northStarMetric.why && (
                <p className="text-emerald-400 text-xs mt-2">Why: {result.northStarMetric.why}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <p className="text-white font-bold">{metrics.length} KPIs</p>
            {trackedCount > 0 && <span className="text-emerald-400 text-xs">{trackedCount} tracking</span>}
          </div>

          <div className="flex gap-1 flex-wrap">
            {categories.map(function(cat) {
              const color = CAT_COLORS[cat] || '#6366f1'
              return (
                <button key={cat} onClick={function() { setFilterCat(cat) }}
                  className={'text-xs px-2 py-1 rounded-lg border transition ' + (filterCat === cat ? 'text-white' : 'bg-[#13131f] text-slate-500 border-[#2e2e4e]')}
                  style={filterCat === cat ? { backgroundColor: color, borderColor: color } : {}}>
                  {cat}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {filtered.map(function(metric, i) {
              const catColor = CAT_COLORS[metric.category] || '#6366f1'
              const isTracked = !!tracked[metric.name]
              const freqIcon = FREQ_ICONS[metric.frequency] || '📊'
              return (
                <div key={i} className={'rounded-xl border p-4 transition ' + (isTracked ? 'border-emerald-700 bg-emerald-950' : 'border-[#2e2e4e] bg-[#13131f]')}>
                  <div className="flex items-start gap-3">
                    <button onClick={function() { toggleTrack(metric.name) }}
                      className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition ' + (isTracked ? 'bg-emerald-600 border-emerald-500' : 'border-[#2e2e4e] hover:border-emerald-500')}>
                      {isTracked && <span className="text-white text-xs">v</span>}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold text-sm">{metric.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: catColor + '20', color: catColor }}>{metric.category}</span>
                        <span className="text-slate-500 text-xs ml-auto">{freqIcon} {metric.frequency}</span>
                      </div>
                      {metric.formula && <p className="text-slate-500 text-xs font-mono mb-1">{metric.formula}</p>}
                      {metric.target && <p className="text-emerald-400 text-xs">Target: {metric.target}</p>}
                      {metric.why && <p className="text-slate-500 text-xs">{metric.why}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button onClick={handleDesign} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Redesign</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-white font-semibold mb-1">Metrics Dashboard Designer</p>
          <p className="text-slate-500 text-sm">Define your north star metric and KPIs with targets and tracking</p>
        </div>
      )}
    </div>
  )
}

export default MetricsDashboardDesigner
