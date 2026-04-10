import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPublicProjects } from '../services/supabase'
import { notify } from '../services/toast'

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

function GalleryCard({ project, onLoad }) {
  const date = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const categories = [...new Set(project.components.map(c => c.category))]

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-5 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl">{project.thumbnail || '🔧'}</div>
        <span className="text-xs text-slate-600">{date}</span>
      </div>

      <p className="text-white text-sm font-semibold leading-relaxed mb-3 line-clamp-2">
        {project.title || project.idea}
      </p>

      <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 italic">
        "{project.idea}"
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {categories.slice(0, 4).map(cat => (
          <span
            key={cat}
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: CATEGORY_COLORS[cat] + '20',
              color: CATEGORY_COLORS[cat],
              border: '1px solid ' + CATEGORY_COLORS[cat] + '40',
            }}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-600">
          {project.components.length} component{project.components.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-1">
          {project.components.slice(0, 5).map((comp, i) => (
            <span key={i} className="text-base">{comp.icon}</span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onLoad(project)}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
      >
        View Prototype →
      </button>
    </div>
  )
}

function Gallery() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const CATEGORIES = ['All', 'Microcontroller', 'Sensor', 'Display', 'Communication', 'Power', 'Actuator']

  useEffect(() => {
    async function fetchPublic() {
      try {
        const data = await getPublicProjects()
        setProjects(data)
      } catch {
        notify.error('Could not load gallery — check your connection')
      } finally {
        setLoading(false)
      }
    }
    fetchPublic()
  }, [])

  function handleLoad(project) {
    navigate('/viewer', {
      state: {
        idea: project.idea,
        selectedComponents: project.components,
      },
    })
  }

  const filtered = filter === 'All'
    ? projects
    : projects.filter(p => p.components.some(c => c.category === filter))

  return (
    <div className="min-h-screen page-enter px-16 py-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Public Gallery</h2>
          <p className="text-slate-400 text-sm">
            Prototypes shared by the ProtoMind community
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          + Share Your Prototype
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
              filter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-[#0d0d1a] border border-[#1e1e2e] text-slate-400 hover:border-indigo-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold mb-2">No public prototypes yet</h3>
          <p className="text-slate-500 text-sm mb-6">
            Be the first to share a prototype with the community!
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            Build & Share
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <p className="text-slate-600 text-xs mb-4">{filtered.length} prototype{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(project => (
              <GalleryCard
                key={project.id}
                project={project}
                onLoad={handleLoad}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Gallery