import { useState } from 'react'
import { planAPIIntegrations, saveAPIPlans, getAPIPlans } from '../services/apiPlannerService'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  'Cloud Storage': '#6366f1',
  'Messaging': '#22c55e',
  'Analytics': '#0ea5e9',
  'AI/ML': '#a855f7',
  'IoT Platform': '#f59e0b',
  'Database': '#ef4444',
  'Weather': '#14b8a6',
  'Monitoring': '#f97316',
}

const DIFFICULTY_STYLES = {
  Easy: 'text-green-400 bg-green-950 border-green-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Hard: 'text-red-400 bg-red-950 border-red-800',
}

function APICard({ api, index }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const catColor = CATEGORY_COLORS[api.category] || '#6366f1'
  const diffStyle = DIFFICULTY_STYLES[api.difficulty] || DIFFICULTY_STYLES.Easy

  function handleCopyCode() {
    if (!api.codeSnippet) return
    navigator.clipboard.writeText(api.codeSnippet)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Code snippet copied!')
  }

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={function() { setExpanded(!expanded) }}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        <span className="text-2xl shrink-0">{api.icon || '🔌'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-white font-bold text-sm">{api.name}</p>
            {api.free && (
              <span className="text-xs bg-green-950 text-green-400 border border-green-800 px-1.5 py-0.5 rounded-full">Free</span>
            )}
            <span className={'text-xs px-1.5 py-0.5 rounded border ' + diffStyle}>{api.difficulty}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: catColor + '20', color: catColor }}>
              {api.category}
            </span>
            <p className="text-slate-500 text-xs truncate flex-1">{api.purpose}</p>
          </div>
        </div>
        <span className="text-slate-600">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#2e2e4e] pt-3 space-y-3">
          <p className="text-slate-300 text-sm">{api.purpose}</p>

          {api.endpoint && (
            <div className="bg-[#13131f] rounded-lg p-2 flex items-center gap-2">
              <span className="text-slate-500 text-xs">Endpoint:</span>
              <code className="text-green-400 text-xs font-mono flex-1 truncate">{api.endpoint}</code>
            </div>
          )}

          {api.codeSnippet && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Code Snippet:</span>
                <button onClick={handleCopyCode}
                  className="text-xs text-slate-500 hover:text-white transition">
                  {copied ? '✅' : '📋 Copy'}
                </button>
              </div>
              <pre className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-lg p-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {api.codeSnippet}
              </pre>
            </div>
          )}

          <button
            onClick={function() { window.open('https://www.google.com/search?q=' + encodeURIComponent(api.name + ' API documentation'), '_blank') }}
            className="w-full py-1.5 bg-[#13131f] hover:bg-[#1e1e2e] text-slate-400 rounded-lg text-xs transition"
          >
            📚 View Documentation →
          </button>
        </div>
      )}
    </div>
  )
}

function APIPlanner({ idea, components }) {
  const [result, setResult] = useState(getAPIPlans(idea))
  const [loading, setLoading] = useState(false)
  const [filterCat, setFilterCat] = useState('All')
  const [filterFree, setFilterFree] = useState(false)

  async function handlePlan() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await planAPIIntegrations(idea, components)
      setResult(data)
      saveAPIPlans(idea, data)
      notify.success('Found ' + (data.integrations?.length || 0) + ' API integrations!')
    } catch {
      notify.error('Planning failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const integrations = result?.integrations || []
  const categories = ['All', ...new Set(integrations.map(function(a) { return a.category }).filter(Boolean))]

  const filtered = integrations.filter(function(api) {
    const matchCat = filterCat === 'All' || api.category === filterCat
    const matchFree = !filterFree || api.free
    return matchCat && matchFree
  })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Find cloud APIs and IoT platforms to connect your prototype</p>
        <button
          onClick={handlePlan}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🔌 Planning...' : '🔌 Plan APIs'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Finding API integrations...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-bold">{integrations.length} APIs Found</p>
            <button
              onClick={function() { setFilterFree(!filterFree) }}
              className={'text-xs px-3 py-1.5 rounded-xl border transition ml-auto ' + (
                filterFree ? 'bg-green-700 text-white border-green-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]'
              )}
            >
              {filterFree ? '✓ Free Only' : 'Show Free Only'}
            </button>
          </div>

          <div className="flex gap-1 flex-wrap">
            {categories.map(function(cat) {
              const color = CATEGORY_COLORS[cat] || '#6366f1'
              return (
                <button key={cat}
                  onClick={function() { setFilterCat(cat) }}
                  className={'text-xs px-2 py-1 rounded-lg border transition ' + (
                    filterCat === cat ? 'text-white' : 'bg-[#13131f] text-slate-500 border-[#2e2e4e]'
                  )}
                  style={filterCat === cat ? { backgroundColor: color, borderColor: color } : {}}>
                  {cat}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {filtered.map(function(api, i) {
              return <APICard key={api.name || i} api={api} index={i} />
            })}
            {filtered.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">No APIs match filters</p>
            )}
          </div>

          <button onClick={handlePlan}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Refresh
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔌</div>
          <p className="text-white font-semibold mb-1">API Integration Planner</p>
          <p className="text-slate-500 text-sm">Find cloud APIs and IoT platforms with code snippets</p>
        </div>
      )}
    </div>
  )
}

export default APIPlanner