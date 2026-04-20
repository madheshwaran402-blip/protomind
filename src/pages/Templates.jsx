import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROTOTYPE_TEMPLATES, TEMPLATE_CATEGORIES, searchTemplates } from '../data/templates'
import { notify } from '../services/toast'

const DIFFICULTY_COLORS = {
  Beginner: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-900' },
  Intermediate: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-900' },
  Advanced: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-900' },
  Expert: { color: 'text-purple-400', bg: 'bg-purple-950', border: 'border-purple-900' },
}

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
  Memory: '#64748b',
}

function TemplateCard({ template, onUse, onPreview }) {
  const diff = DIFFICULTY_COLORS[template.difficulty] || DIFFICULTY_COLORS.Beginner

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-700 rounded-2xl p-5 transition group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{template.icon}</div>
          <div>
            <h3 className="text-white font-semibold text-sm">{template.name}</h3>
            <p className="text-slate-500 text-xs">{template.category}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.color} ${diff.bg} ${diff.border}`}>
          {template.difficulty}
        </span>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">
        {template.description}
      </p>

      <div className="flex items-center gap-3 mb-3 text-xs text-slate-600">
        <span>⏱ {template.buildTime}</span>
        <span>·</span>
        <span>🔧 {template.components.length} parts</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {template.tags.map(tag => (
          <span key={tag} className="text-xs bg-[#1e1e2e] text-slate-500 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-1 mb-4">
        {template.components.slice(0, 5).map((comp, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            style={{
              backgroundColor: (CATEGORY_COLORS[comp.category] || '#6366f1') + '20',
              border: '1px solid ' + (CATEGORY_COLORS[comp.category] || '#6366f1') + '40',
            }}
            title={comp.name}
          >
            {comp.icon}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onUse(template)}
          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
        >
          ⚡ Use Template
        </button>
        <button
          onClick={() => onPreview(template)}
          className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
        >
          👁 Preview
        </button>
      </div>
    </div>
  )
}

function PreviewModal({ template, onClose, onUse }) {
  if (!template) return null
  const diff = DIFFICULTY_COLORS[template.difficulty] || DIFFICULTY_COLORS.Beginner

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6 max-h-screen overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{template.icon}</div>
            <div>
              <h2 className="text-white font-bold text-lg">{template.name}</h2>
              <p className="text-slate-500 text-xs">{template.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">✕</button>
        </div>

        <div className="flex gap-3 mb-4">
          <span className={`text-xs px-2 py-1 rounded-full border ${diff.color} ${diff.bg} ${diff.border}`}>
            {template.difficulty}
          </span>
          <span className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-1 rounded-full">
            ⏱ {template.buildTime}
          </span>
          <span className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-1 rounded-full">
            🔧 {template.components.length} components
          </span>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-4">{template.description}</p>

        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 mb-4">
          <p className="text-slate-500 text-xs mb-1">Prototype idea</p>
          <p className="text-indigo-300 text-sm italic">"{template.idea}"</p>
        </div>

        <h3 className="text-white font-semibold text-sm mb-3">Components ({template.components.length})</h3>
        <div className="space-y-2 mb-5">
          {template.components.map((comp, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
              <span className="text-xl shrink-0">{comp.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white text-xs font-medium">{comp.name}</p>
                  {comp.quantity > 1 && (
                    <span className="text-xs text-indigo-400">×{comp.quantity}</span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-0.5">{comp.reason}</p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: (CATEGORY_COLORS[comp.category] || '#6366f1') + '20',
                  color: CATEGORY_COLORS[comp.category] || '#6366f1',
                }}
              >
                {comp.category}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { onUse(template); onClose() }}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          ⚡ Use This Template
        </button>
      </div>
    </div>
  )
}

function Templates() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [preview, setPreview] = useState(null)

  function handleUse(template) {
    navigate('/viewer', {
      state: {
        idea: template.idea,
        selectedComponents: template.components,
      },
    })
    notify.success('Template loaded — ' + template.name + '!')
  }

  const filtered = searchTemplates(search).filter(t =>
    category === 'All' || t.category === category || t.tags.includes(category)
  )

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">Prototype Templates</h2>
          <p className="text-slate-400 text-sm">
            Start from a pre-built template instead of scratch
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
        >
          ← Start from Scratch
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-[#0d0d1a] border border-[#1e1e2e] text-slate-400 hover:border-indigo-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-slate-600 text-xs mb-4">
        {filtered.length} template{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-slate-500 text-sm">No templates match your search</p>
          <button onClick={() => { setSearch(''); setCategory('All') }} className="mt-3 text-indigo-400 text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUse}
              onPreview={setPreview}
            />
          ))}
        </div>
      )}

      <PreviewModal
        template={preview}
        onClose={() => setPreview(null)}
        onUse={handleUse}
      />
    </div>
  )
}

export default Templates