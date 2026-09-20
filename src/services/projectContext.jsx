import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notify } from '../services/toast'

// ─── PROJECT CONTEXT MANAGER ─────────────────────────────────────────────────
// Single source of truth for the current prototype across all pages

export function saveCurrentProject(project) {
  try {
    localStorage.setItem('protomind_active_project', JSON.stringify(Object.assign({}, project, { updatedAt: new Date().toISOString() })))
  } catch(e) {}
}

export function loadCurrentProject() {
  try {
    const raw = localStorage.getItem('protomind_active_project')
    return raw ? JSON.parse(raw) : null
  } catch(e) { return null }
}

export function clearCurrentProject() {
  try { localStorage.removeItem('protomind_active_project') } catch(e) {}
}

export function saveAllProjects(projects) {
  try { localStorage.setItem('protomind_all_projects', JSON.stringify(projects)) } catch(e) {}
}

export function loadAllProjects() {
  try {
    const raw = localStorage.getItem('protomind_all_projects')
    return raw ? JSON.parse(raw) : []
  } catch(e) { return [] }
}

// ─── PROJECT FLOW NAVIGATOR ───────────────────────────────────────────────────
// Shows the connected journey: Wizard → Roadmap → Simulator → IDE → Twin

const FLOW_STEPS = [
  { id: 'wizard', label: 'Setup', icon: '⚙️', path: '/wizard', desc: 'Requirements + Timeline' },
  { id: 'roadmap', label: 'Plan', icon: '🗺️', path: '/roadmap', desc: 'Daily AI roadmap' },
  { id: 'build', label: 'Build', icon: '🔭', path: '/viewer', desc: '270+ AI tools' },
  { id: 'simulate', label: 'Simulate', icon: '🔌', path: '/simulator2', desc: 'Circuit simulation' },
  { id: 'code', label: 'Code', icon: '💻', path: '/ide', desc: 'Hardware IDE' },
  { id: 'deploy', label: 'Deploy', icon: '🔮', path: '/digitaltwin', desc: 'Digital Twin' },
]

function ProjectFlowBar({ currentStep }) {
  const navigate = useNavigate()
  const project = loadCurrentProject()

  return (
    <div className="bg-[#080814] border-b border-[#1e1e2e] px-4 py-2">
      <div className="flex items-center gap-0 overflow-x-auto">
        {FLOW_STEPS.map(function(step, i) {
          const isActive = step.id === currentStep
          const isPast = FLOW_STEPS.findIndex(function(s) { return s.id === currentStep }) > i
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={function() { navigate(step.path) }}
                className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition " + (
                  isActive ? 'bg-indigo-700 text-white' :
                  isPast ? 'text-green-400 hover:bg-green-950' :
                  'text-slate-500 hover:text-white hover:bg-[#13131f]'
                )}>
                <span>{isPast ? '✓' : step.icon}</span>
                <span className="font-medium">{step.label}</span>
              </button>
              {i < FLOW_STEPS.length - 1 && (
                <span className={"text-xs mx-0.5 " + (isPast ? 'text-green-800' : 'text-[#2e2e4e]')}>→</span>
              )}
            </div>
          )
        })}
        {project && (
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"/>
            <span className="truncate max-w-32">{project.idea?.slice(0, 30)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PROJECT CONTEXT BANNER ───────────────────────────────────────────────────
function ProjectContextBanner({ onNavigate }) {
  const navigate = useNavigate()
  const project = loadCurrentProject()
  const [show, setShow] = useState(!!project)

  if (!project || !show) return null

  return (
    <div className="bg-gradient-to-r from-indigo-950 to-[#0d0d1a] border-b border-indigo-900 px-4 py-2 flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"/>
      <span className="text-indigo-400 text-xs font-medium">Active Project:</span>
      <span className="text-white text-xs truncate max-w-48">{project.idea?.slice(0, 50)}</span>
      <div className="flex gap-1 ml-auto">
        <button onClick={function() { navigate('/roadmap') }}
          className="px-2 py-0.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-300 rounded text-xs">Roadmap</button>
        <button onClick={function() { navigate('/simulator2') }}
          className="px-2 py-0.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded text-xs">Simulate</button>
        <button onClick={function() { navigate('/ide') }}
          className="px-2 py-0.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded text-xs">IDE</button>
        <button onClick={function() { setShow(false) }}
          className="px-2 py-0.5 text-slate-600 hover:text-slate-400 rounded text-xs">✕</button>
      </div>
    </div>
  )
}

export { ProjectFlowBar, ProjectContextBanner, FLOW_STEPS }
export default ProjectFlowBar
