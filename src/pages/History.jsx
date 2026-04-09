import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects, deleteProject } from '../services/storage'
import { notify } from '../services/toast'

function ProjectCard({ project, onLoad, onDelete }) {
  const date = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const time = new Date(project.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-5 transition group">
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{project.thumbnail || '🔧'}</div>
        <span className="text-xs text-slate-600">{date} · {time}</span>
      </div>
      <p className="text-white text-sm font-medium leading-relaxed mb-3 line-clamp-2">
        {project.idea}
      </p>
      <div className="flex flex-wrap gap-1 mb-4">
        {project.components.slice(0, 4).map(comp => (
          <span key={comp.id} className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-0.5 rounded-full">
            {comp.icon} {comp.name.split(' ')[0]}
          </span>
        ))}
        {project.components.length > 4 && (
          <span className="text-xs text-slate-600 px-2 py-0.5">
            +{project.components.length - 4} more
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onLoad(project)}
          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
        >
          Load Project →
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
    setProjects(getAllProjects())
    notify.success('Project deleted')
  }

  return (
    <div className="min-h-screen page-enter px-16 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Project History</h2>
          <p className="text-slate-400 text-sm">
            {projects.length} saved project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          + New Prototype
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold mb-2">No saved projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">
            Build your first prototype and save it to see it here
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            Start Building
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onLoad={handleLoad}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default History