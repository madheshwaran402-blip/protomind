import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects, deleteProject, getAllTags, updateProjectTags } from '../services/storage'
import { notify } from '../services/toast'

const TAG_COLORS = {
  Wearable: { bg: 'bg-purple-950', text: 'text-purple-400', border: 'border-purple-800' },
  Robotics: { bg: 'bg-blue-950', text: 'text-blue-400', border: 'border-blue-800' },
  IoT: { bg: 'bg-indigo-950', text: 'text-indigo-400', border: 'border-indigo-800' },
  Agriculture: { bg: 'bg-green-950', text: 'text-green-400', border: 'border-green-800' },
  Health: { bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-800' },
  'Home Automation': { bg: 'bg-yellow-950', text: 'text-yellow-400', border: 'border-yellow-800' },
  Vehicle: { bg: 'bg-orange-950', text: 'text-orange-400', border: 'border-orange-800' },
  Monitoring: { bg: 'bg-cyan-950', text: 'text-cyan-400', border: 'border-cyan-800' },
  Display: { bg: 'bg-pink-950', text: 'text-pink-400', border: 'border-pink-800' },
  Security: { bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-700' },
  Connected: { bg: 'bg-sky-950', text: 'text-sky-400', border: 'border-sky-800' },
  Portable: { bg: 'bg-emerald-950', text: 'text-emerald-400', border: 'border-emerald-800' },
  Electronics: { bg: 'bg-[#1e1e2e]', text: 'text-slate-400', border: 'border-[#2e2e4e]' },
}

function TagBadge({ tag, onClick, selected }) {
  const colors = TAG_COLORS[tag] || TAG_COLORS.Electronics
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition ${colors.bg} ${colors.text} ${colors.border} ${
        selected ? 'ring-2 ring-offset-1 ring-offset-[#0a0a0f]' : 'opacity-70 hover:opacity-100'
      }`}
    >
      {tag}
    </button>
  )
}

function ProjectCard({ project, onLoad, onDelete, onTagUpdate }) {
  const [editingTags, setEditingTags] = useState(false)
  const [newTag, setNewTag] = useState('')

  const date = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const time = new Date(project.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  function addTag() {
    if (!newTag.trim()) return
    const updated = [...(project.tags || []), newTag.trim()]
    onTagUpdate(project.id, updated)
    setNewTag('')
  }

  function removeTag(tag) {
    const updated = (project.tags || []).filter(t => t !== tag)
    onTagUpdate(project.id, updated)
  }

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-4 sm:p-5 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl sm:text-3xl">{project.thumbnail || '🔧'}</div>
        <div className="text-right">
          <span className="text-xs text-slate-600">{date}</span>
          <p className="text-xs text-slate-700">{time}</p>
        </div>
      </div>

      <p className="text-white text-sm font-medium leading-relaxed mb-3 line-clamp-2">
        {project.idea}
      </p>

      <div className="flex flex-wrap gap-1 mb-2">
        {(project.tags || []).map(tag => (
          <span
            key={tag}
            className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              (TAG_COLORS[tag] || TAG_COLORS.Electronics).bg
            } ${(TAG_COLORS[tag] || TAG_COLORS.Electronics).text} ${
              (TAG_COLORS[tag] || TAG_COLORS.Electronics).border
            }`}
          >
            {tag}
            {editingTags && (
              <button onClick={() => removeTag(tag)} className="text-current opacity-60 hover:opacity-100">×</button>
            )}
          </span>
        ))}
        <button
          onClick={() => setEditingTags(!editingTags)}
          className="text-xs text-slate-600 hover:text-slate-400 px-1 transition"
        >
          {editingTags ? '✓' : '+ tag'}
        </button>
      </div>

      {editingTags && (
        <div className="flex gap-1 mb-2">
          <input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="Add tag..."
            className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-lg px-2 py-1 text-xs text-white outline-none"
          />
          <button onClick={addTag} className="px-2 py-1 bg-indigo-600 rounded-lg text-xs">+</button>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {project.components.slice(0, 3).map(comp => (
          <span key={comp.id} className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-0.5 rounded-full">
            {comp.icon} {comp.name.split(' ')[0]}
          </span>
        ))}
        {project.components.length > 3 && (
          <span className="text-xs text-slate-600 px-2 py-0.5">+{project.components.length - 3} more</span>
        )}
      </div>

      {project.version && (
        <p className="text-xs text-slate-700 mb-2">v{project.version} · {project.components.length} components</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onLoad(project)}
          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
        >
          Load →
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="px-3 py-2 bg-[#1e1e2e] hover:bg-red-950 hover:text-red-400 text-slate-500 rounded-xl text-xs transition"
        >
          🗑
        </button>
      </div>
    </div>
  )
}

function History() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  const allTags = getAllTags()

  useEffect(() => {
    const data = getAllProjects()
    setProjects(data)
  }, [])

  function handleLoad(project) {
    notify.info('Loading project...')
    navigate('/viewer', {
      state: {
        idea: project.idea,
        selectedComponents: project.components,
        positions: project.positions,
      },
    })
  }

  function handleDelete(id) {
    deleteProject(id)
    const data = getAllProjects()
    setProjects(data)
    notify.success('Project deleted')
  }

  function handleTagUpdate(id, tags) {
    updateProjectTags(id, tags)
    const data = getAllProjects()
    setProjects(data)
  }

  function getFiltered() {
    let filtered = [...projects]
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.idea.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
        p.components.some(c => c.name.toLowerCase().includes(q))
      )
    }
    if (selectedTag) {
      filtered = filtered.filter(p => (p.tags || []).includes(selectedTag))
    }
    if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortBy === 'oldest') filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    else if (sortBy === 'most_components') filtered.sort((a, b) => b.components.length - a.components.length)
    else if (sortBy === 'alphabetical') filtered.sort((a, b) => a.idea.localeCompare(b.idea))
    return filtered
  }

  const filtered = getFiltered()

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">Project History</h2>
          <p className="text-slate-400 text-sm">
            {projects.length} saved project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          + New Prototype
        </button>
      </div>

      {projects.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by idea, tag, or component..."
                className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="most_components">Most components</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {allTags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  !selectedTag
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-800'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  selected={selectedTag === tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                />
              ))}
            </div>
          )}

          <p className="text-slate-600 text-xs mb-4">
            Showing {filtered.length} of {projects.length} projects
            {selectedTag && <span> · Tag: <span className="text-indigo-400">{selectedTag}</span></span>}
            {search && <span> · Search: <span className="text-indigo-400">"{search}"</span></span>}
          </p>
        </>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold mb-2">No saved projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">Build your first prototype and save it to see it here</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            Start Building
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-slate-500 text-sm mb-4">Try a different search or clear the filters</p>
          <button
            onClick={() => { setSearch(''); setSelectedTag(null) }}
            className="px-5 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onLoad={handleLoad}
              onDelete={handleDelete}
              onTagUpdate={handleTagUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default History