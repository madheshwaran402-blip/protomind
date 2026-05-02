import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generatePrototypeIdeas } from '../services/ideaGeneratorService'
import { notify } from '../services/toast'

const CATEGORIES = [
  { label: '🌱 Smart Agriculture', value: 'smart agriculture and plant monitoring' },
  { label: '🏠 Home Automation', value: 'home automation and smart home devices' },
  { label: '🤖 Robotics', value: 'robotics and motor control' },
  { label: '❤️ Health & Fitness', value: 'health monitoring and fitness tracking' },
  { label: '🌤️ Weather & Environment', value: 'weather station and environmental monitoring' },
  { label: '🔒 Security', value: 'security systems and access control' },
  { label: '🎮 Games & Fun', value: 'games and interactive fun projects' },
  { label: '🚗 Vehicles', value: 'vehicle and transport automation' },
  { label: '🎵 Music & Sound', value: 'music and audio projects' },
  { label: '🌊 Water & Energy', value: 'water management and energy monitoring' },
  { label: '📦 Supply Chain', value: 'inventory and supply chain tracking' },
  { label: '🐾 Pet & Animal', value: 'pet care and animal monitoring' },
]

const DIFFICULTY_COLORS = {
  Beginner: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Intermediate: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Advanced: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
}

function WowMeter({ score }) {
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#6366f1'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full"
          style={{ width: score + '%', backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold shrink-0" style={{ color }}>🔥 {score}</span>
    </div>
  )
}

function IdeaCard({ idea, onBuild, onSave, isSaved }) {
  const [expanded, setExpanded] = useState(false)
  const diff = DIFFICULTY_COLORS[idea.difficulty] || DIFFICULTY_COLORS.Beginner

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl overflow-hidden transition">
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.color} ${diff.bg} ${diff.border}`}>
              {idea.difficulty}
            </span>
            <span className="text-xs text-emerald-400">{idea.estimatedCost}</span>
            <span className="text-xs text-slate-500">⏱️ {idea.buildTime}</span>
          </div>
          <span className="text-slate-600 text-xs shrink-0 ml-2">{expanded ? '↑' : '↓'}</span>
        </div>

        <h3 className="text-white font-bold text-sm mb-1 leading-tight">{idea.title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{idea.description}</p>

        <div className="mt-3">
          <WowMeter score={idea.wow_factor} />
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-[#1e1e2e] pt-4">

          {/* Full description */}
          <p className="text-slate-300 text-sm leading-relaxed">{idea.description}</p>

          {/* Unique feature */}
          {idea.uniqueFeature && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-3">
              <p className="text-indigo-400 text-xs font-semibold mb-1">✨ Unique Feature</p>
              <p className="text-slate-300 text-sm">{idea.uniqueFeature}</p>
            </div>
          )}

          {/* Learning opportunity */}
          {idea.learningOpportunity && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
              <p className="text-slate-500 text-xs font-semibold mb-1">📚 You'll Learn</p>
              <p className="text-slate-300 text-sm">{idea.learningOpportunity}</p>
            </div>
          )}

          {/* Components */}
          {idea.components?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Key Components</p>
              <div className="flex flex-wrap gap-1">
                {idea.components.map((comp, i) => (
                  <span key={i} className="text-xs bg-[#13131f] border border-[#2e2e4e] text-slate-300 px-2 py-1 rounded-lg">
                    🔧 {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {idea.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {idea.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onBuild(idea)}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
            >
              ⚡ Build This Prototype
            </button>
            <button
              onClick={() => onSave(idea)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isSaved
                  ? 'bg-green-900 text-green-400'
                  : 'bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400'
              }`}
            >
              {isSaved ? '✅' : '🔖'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function IdeaGenerator() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [constraints, setConstraints] = useState({
    level: '',
    budget: '',
    components: '',
    purpose: '',
  })
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [savedIdeas, setSavedIdeas] = useState([])
  const [filterDifficulty, setFilterDifficulty] = useState('All')
  const [sortBy, setSortBy] = useState('wow')

  async function handleGenerate() {
    const category = customCategory.trim() || selectedCategory
    if (!category) {
      notify.warning('Please select or enter a category')
      return
    }
    setLoading(true)
    setIdeas([])
    try {
      const data = await generatePrototypeIdeas(category, constraints)
      setIdeas(data.ideas || [])
      notify.success('Generated ' + (data.ideas?.length || 0) + ' ideas!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleBuild(idea) {
    navigate('/', {
      state: { prefillIdea: idea.title + ' — ' + idea.description },
    })
  }

  function handleSave(idea) {
    if (savedIdeas.find(s => s.id === idea.id)) {
      setSavedIdeas(prev => prev.filter(s => s.id !== idea.id))
      notify.info('Idea removed from saved')
    } else {
      setSavedIdeas(prev => [...prev, idea])
      notify.success('Idea saved!')
    }
  }

  function exportSaved() {
    if (savedIdeas.length === 0) {
      notify.warning('No saved ideas to export')
      return
    }
    const text = savedIdeas.map(idea => [
      '=== ' + idea.title + ' ===',
      'Difficulty: ' + idea.difficulty,
      'Cost: ' + idea.estimatedCost,
      'Time: ' + idea.buildTime,
      'Description: ' + idea.description,
      'Components: ' + (idea.components || []).join(', '),
      'Unique: ' + idea.uniqueFeature,
      '',
    ].join('\n')).join('\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ProtoMind_Ideas.txt'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Ideas exported!')
  }

  const filtered = ideas
    .filter(idea => filterDifficulty === 'All' || idea.difficulty === filterDifficulty)
    .sort((a, b) => {
      if (sortBy === 'wow') return (b.wow_factor || 0) - (a.wow_factor || 0)
      if (sortBy === 'cost') {
        const aMin = parseInt((a.estimatedCost || '').match(/\d+/)?.[0] || '999')
        const bMin = parseInt((b.estimatedCost || '').match(/\d+/)?.[0] || '999')
        return aMin - bMin
      }
      if (sortBy === 'easy') {
        const order = { Beginner: 0, Intermediate: 1, Advanced: 2 }
        return (order[a.difficulty] || 0) - (order[b.difficulty] || 0)
      }
      return 0
    })

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">💡 Prototype Idea Generator</h2>
          <p className="text-slate-400 text-sm">
            Stuck for ideas? AI generates 10 creative prototype ideas for any category
          </p>
        </div>
        {savedIdeas.length > 0 && (
          <button
            onClick={exportSaved}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition"
          >
            ⬇️ Export {savedIdeas.length} Saved
          </button>
        )}
      </div>

      {/* Category picker */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 mb-4">
        <p className="text-xs text-slate-500 mb-3">Choose a category or describe your own</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setSelectedCategory(cat.value); setCustomCategory('') }}
              className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition ${
                selectedCategory === cat.value && !customCategory
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <input
          value={customCategory}
          onChange={e => { setCustomCategory(e.target.value); setSelectedCategory('') }}
          placeholder="Or describe your own theme... e.g. 'solar powered outdoor gadgets'"
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 placeholder-slate-600 mb-3"
        />

        {/* Constraints */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div>
            <p className="text-xs text-slate-600 mb-1">Skill Level</p>
            <select
              value={constraints.level}
              onChange={e => setConstraints(prev => ({ ...prev, level: e.target.value }))}
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-lg px-2 py-2 text-white text-xs outline-none"
            >
              <option value="">Any level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Max Budget ($)</p>
            <input
              type="number"
              value={constraints.budget}
              onChange={e => setConstraints(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="e.g. 50"
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-lg px-2 py-2 text-white text-xs outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Must Use Component</p>
            <input
              value={constraints.components}
              onChange={e => setConstraints(prev => ({ ...prev, components: e.target.value }))}
              placeholder="e.g. ESP32"
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-lg px-2 py-2 text-white text-xs outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Purpose</p>
            <input
              value={constraints.purpose}
              onChange={e => setConstraints(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g. school project"
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-lg px-2 py-2 text-white text-xs outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || (!selectedCategory && !customCategory.trim())}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition disabled:opacity-50"
        >
          {loading ? '💡 Generating ideas...' : '💡 Generate 10 Prototype Ideas'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-2xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is brainstorming 10 creative ideas for you...</p>
        </div>
      )}

      {ideas.length > 0 && !loading && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex gap-2 flex-wrap">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    filterDifficulty === diff
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#0d0d1a] border border-[#1e1e2e] text-slate-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-1.5 text-sm text-white outline-none ml-auto"
            >
              <option value="wow">Sort by Wow Factor</option>
              <option value="cost">Sort by Cost (lowest)</option>
              <option value="easy">Sort by Easiest First</option>
            </select>
          </div>

          <p className="text-slate-600 text-xs mb-4">
            {filtered.length} idea{filtered.length !== 1 ? 's' : ''} · Click any card to expand · 🔖 to save
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onBuild={handleBuild}
                onSave={handleSave}
                isSaved={savedIdeas.some(s => s.id === idea.id)}
              />
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="w-full mt-6 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
          >
            ↺ Generate 10 More Ideas
          </button>
        </>
      )}
    </div>
  )
}

export default IdeaGenerator