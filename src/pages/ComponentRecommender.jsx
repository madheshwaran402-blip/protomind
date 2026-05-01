import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getComponentRecommendations } from '../services/recommenderService'
import { notify } from '../services/toast'

const DIFFICULTY_COLORS = {
  Beginner: 'text-green-400 bg-green-950 border-green-800',
  Intermediate: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Advanced: 'text-red-400 bg-red-950 border-red-800',
  Expert: 'text-purple-400 bg-purple-950 border-purple-800',
}

const EXAMPLE_DESCRIPTIONS = [
  'A weather station that monitors temperature, humidity and air pressure with a display',
  'A robot car that avoids obstacles and can be controlled via Bluetooth',
  'A smart doorbell with camera, motion detection and phone notifications',
  'A soil moisture monitor that automatically waters plants when dry',
  'A fitness tracker wristband with heart rate and step counting',
]

function RecommendationCard({ rec, rank }) {
  const [expanded, setExpanded] = useState(rank === 1)
  const diffClass = DIFFICULTY_COLORS[rec.difficulty] || DIFFICULTY_COLORS.Beginner

  const compatColor = rec.compatibility >= 90
    ? '#22c55e'
    : rec.compatibility >= 70
    ? '#f59e0b'
    : '#ef4444'

  function openSearch() {
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(rec.amazonSearch || rec.name)
    window.open(url, '_blank')
  }

  return (
    <div className={`bg-[#0d0d1a] border rounded-2xl overflow-hidden transition ${
      rank === 1 ? 'border-indigo-700' : 'border-[#1e1e2e]'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-[#13131f] transition"
      >
        {/* Rank */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
          rank === 1 ? 'bg-indigo-600 text-white' : 'bg-[#1e1e2e] text-slate-500'
        }`}>
          {rank === 1 ? '⭐' : rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xl">{rec.icon}</span>
            <p className="text-white font-bold text-sm">{rec.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${diffClass}`}>
              {rec.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{rec.category}</span>
            <span>·</span>
            <span className="text-emerald-400">{rec.estimatedPrice}</span>
            <span>·</span>
            <span style={{ color: compatColor }}>{rec.compatibility}% match</span>
          </div>
        </div>

        <span className="text-slate-600 shrink-0 mt-1">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-[#1e1e2e] pt-4">
          {/* Reason */}
          <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-3">
            <p className="text-indigo-400 text-xs font-semibold mb-1">Why this component?</p>
            <p className="text-slate-300 text-sm">{rec.reason}</p>
          </div>

          {/* Compatibility bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Project compatibility</span>
              <span style={{ color: compatColor }}>{rec.compatibility}%</span>
            </div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: rec.compatibility + '%', backgroundColor: compatColor }}
              />
            </div>
          </div>

          {/* Pros and cons */}
          <div className="grid grid-cols-2 gap-3">
            {rec.pros?.length > 0 && (
              <div>
                <p className="text-green-400 text-xs font-semibold mb-1">✓ Pros</p>
                <ul className="space-y-1">
                  {rec.pros.map((pro, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                      <span className="text-green-400 shrink-0">+</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rec.cons?.length > 0 && (
              <div>
                <p className="text-red-400 text-xs font-semibold mb-1">✗ Cons</p>
                <ul className="space-y-1">
                  {rec.cons.map((con, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1">
                      <span className="text-red-400 shrink-0">-</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Alternatives */}
          {rec.alternatives?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Alternatives</p>
              <div className="space-y-1">
                {rec.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#13131f] border border-[#2e2e4e] rounded-lg px-3 py-2">
                    <p className="text-slate-300 text-xs font-medium">{alt.name}</p>
                    <span className="text-slate-600 text-xs">— {alt.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buy button */}
          <button
            onClick={openSearch}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition flex items-center justify-center gap-2"
          >
            🔍 Search for {rec.name} ↗️
          </button>
        </div>
      )}
    </div>
  )
}

function ComponentRecommender() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [constraints, setConstraints] = useState({
    budget: '',
    level: '',
    power: '',
    connectivity: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showConstraints, setShowConstraints] = useState(false)

  async function handleRecommend() {
    if (!description.trim()) {
      notify.warning('Please describe your project first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await getComponentRecommendations(description, constraints)
      setResult(data)
      notify.success('Got ' + (data.recommendations?.length || 0) + ' recommendations!')
    } catch {
      notify.error('Failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleUseExample(example) {
    setDescription(example)
    setResult(null)
  }

  function handleBuildWithRecommendations() {
    if (!result?.recommendations) return
    const components = result.recommendations.map((rec, i) => ({
      id: 'rec_' + i,
      name: rec.name,
      category: rec.category,
      icon: rec.icon || '🔧',
      description: rec.reason,
    }))
    navigate('/viewer', {
      state: {
        idea: description,
        selectedComponents: components,
      },
    })
  }

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🎯 Component Recommender</h2>
          <p className="text-slate-400 text-sm">
            Describe your project — AI recommends the best components with explanations
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          ⚡ Build It →
        </button>
      </div>

      {/* Description input */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 mb-4">
        <p className="text-xs text-slate-500 mb-2">Describe your project in detail</p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. I want to build a system that monitors soil moisture in my garden and automatically turns on a water pump when the soil gets too dry. It should run on battery and send alerts to my phone."
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder-slate-600 leading-relaxed"
          rows={4}
        />

        {/* Constraints toggle */}
        <button
          onClick={() => setShowConstraints(!showConstraints)}
          className="text-xs text-slate-500 hover:text-white transition mt-2"
        >
          {showConstraints ? '▲ Hide constraints' : '▼ Add constraints (optional)'}
        </button>

        {showConstraints && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Budget ($)</p>
              <input
                type="number"
                value={constraints.budget}
                onChange={e => setConstraints(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="e.g. 30"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Skill Level</p>
              <select
                value={constraints.level}
                onChange={e => setConstraints(prev => ({ ...prev, level: e.target.value }))}
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none"
              >
                <option value="">Any</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Power Source</p>
              <select
                value={constraints.power}
                onChange={e => setConstraints(prev => ({ ...prev, power: e.target.value }))}
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none"
              >
                <option value="">Any</option>
                <option value="Battery">Battery</option>
                <option value="USB/Wall">USB/Wall</option>
                <option value="Solar">Solar</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Connectivity</p>
              <select
                value={constraints.connectivity}
                onChange={e => setConstraints(prev => ({ ...prev, connectivity: e.target.value }))}
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none"
              >
                <option value="">Any</option>
                <option value="WiFi">WiFi</option>
                <option value="Bluetooth">Bluetooth</option>
                <option value="No wireless">No wireless</option>
              </select>
            </div>
          </div>
        )}

        <button
          onClick={handleRecommend}
          disabled={loading || !description.trim()}
          className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? '🎯 Analysing your project...' : '🎯 Get Component Recommendations'}
        </button>
      </div>

      {/* Example descriptions */}
      {!result && !loading && (
        <div className="mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Try an example</p>
          <div className="space-y-2">
            {EXAMPLE_DESCRIPTIONS.map((example, i) => (
              <button
                key={i}
                onClick={() => handleUseExample(example)}
                className="w-full text-left px-4 py-3 bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-xl text-sm text-slate-400 hover:text-white transition"
              >
                <span className="text-indigo-400 mr-2">→</span>
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-2xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is finding the best components for your project...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">

          {/* Summary */}
          <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-5">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-2">AI Summary</p>
            <p className="text-white text-sm leading-relaxed">{result.summary}</p>
            <div className="flex gap-4 mt-3 text-xs text-slate-400 flex-wrap">
              {result.estimatedTotalCost && <span>💰 {result.estimatedTotalCost} total</span>}
              {result.buildDifficulty && <span>🎯 {result.buildDifficulty}</span>}
              {result.estimatedBuildTime && <span>⏱️ {result.estimatedBuildTime}</span>}
            </div>
          </div>

          {/* Key considerations */}
          {result.keyConsiderations?.length > 0 && (
            <div className="bg-yellow-950 border border-yellow-900 rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-semibold mb-2">⚠️ Key Considerations</p>
              <ul className="space-y-1">
                {result.keyConsiderations.map((kc, i) => (
                  <li key={i} className="text-yellow-200 text-xs flex items-start gap-2">
                    <span className="shrink-0">•</span> {kc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Recommended Components — ranked by suitability
            </p>
            {result.recommendations?.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} rank={i + 1} />
            ))}
          </div>

          {/* Not recommended */}
          {result.notRecommended?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
                ❌ Not Recommended For This Project
              </p>
              <div className="space-y-2">
                {result.notRecommended.map((nr, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-400 text-xs shrink-0">✗</span>
                    <div>
                      <span className="text-slate-300 text-xs font-medium">{nr.name}</span>
                      <span className="text-slate-500 text-xs"> — {nr.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Build button */}
          <button
            onClick={handleBuildWithRecommendations}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-sm font-bold transition"
          >
            ⚡ Build Prototype With These Components →
          </button>

          <button
            onClick={() => { setResult(null); setDescription('') }}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Start Over
          </button>
        </div>
      )}
    </div>
  )
}

export default ComponentRecommender