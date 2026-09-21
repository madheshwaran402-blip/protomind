import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notify } from '../services/toast'

// ─── LOAD ALL SAVED PROJECTS WITH ROADMAPS ───────────────────────────────────
function loadAllProjectsWithRoadmaps() {
  const projects = []
  try {
    // Load from protomind_all_projects
    const allRaw = localStorage.getItem('protomind_all_projects')
    const all = allRaw ? JSON.parse(allRaw) : []
    all.forEach(function(p) {
      const roadmapKey = 'protomind_roadmap_' + btoa(p.idea || '').slice(0, 20)
      const roadmapRaw = localStorage.getItem(roadmapKey)
      const roadmap = roadmapRaw ? JSON.parse(roadmapRaw) : null
      projects.push({ id: p.id || p.idea, idea: p.idea, components: p.selectedComponents || [], roadmap: roadmap?.roadmap || null, completedDays: roadmap?.completedDays || {}, createdAt: p.createdAt || new Date().toISOString() })
    })
    // Also check current requirements
    const currRaw = localStorage.getItem('protomind_current_requirements')
    const curr = currRaw ? JSON.parse(currRaw) : null
    if (curr && curr.idea && !projects.find(function(p) { return p.idea === curr.idea })) {
      const roadmapKey = 'protomind_roadmap_' + btoa(curr.idea).slice(0, 20)
      const roadmapRaw = localStorage.getItem(roadmapKey)
      const roadmap = roadmapRaw ? JSON.parse(roadmapRaw) : null
      projects.unshift({ id: curr.idea, idea: curr.idea, components: curr.components || [], roadmap: roadmap?.roadmap || null, completedDays: roadmap?.completedDays || {}, createdAt: curr.createdAt || new Date().toISOString(), isCurrent: true })
    }
  } catch(e) {}
  return projects
}

// ─── ROADMAP PANEL ────────────────────────────────────────────────────────────
function RoadmapPanel({ onClose }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [activePhase, setActivePhase] = useState(0)
  const [completedDays, setCompletedDays] = useState({})

  useEffect(function() {
    const p = loadAllProjectsWithRoadmaps()
    setProjects(p)
    // Auto-select current project
    const curr = p.find(function(x) { return x.isCurrent }) || p[0]
    if (curr) {
      setSelected(curr)
      setCompletedDays(curr.completedDays || {})
    }
  }, [])

  function selectProject(project) {
    setSelected(project)
    setCompletedDays(project.completedDays || {})
    setActivePhase(0)
  }

  function markDayDone(dayNum) {
    if (!selected) return
    const updated = Object.assign({}, completedDays, { [dayNum]: { completedAt: new Date().toISOString() } })
    setCompletedDays(updated)
    // Save back
    try {
      const roadmapKey = 'protomind_roadmap_' + btoa(selected.idea).slice(0, 20)
      const raw = localStorage.getItem(roadmapKey)
      const data = raw ? JSON.parse(raw) : {}
      data.completedDays = updated
      localStorage.setItem(roadmapKey, JSON.stringify(data))
      notify.success('Day ' + dayNum + ' complete! 🎉')
      // Update projects list
      setProjects(function(prev) {
        return prev.map(function(p) { return p.idea === selected.idea ? Object.assign({}, p, { completedDays: updated }) : p })
      })
      setSelected(function(prev) { return Object.assign({}, prev, { completedDays: updated }) })
    } catch(e) {}
  }

  function goToSimulator(day) {
    // Load project code into IDE storage
    if (selected) {
      const codeHint = '// ProtoMind: ' + selected.idea + '\n// Day ' + day.day + ': ' + day.title + '\n\nvoid setup() {\n  Serial.begin(9600);\n  // TODO: Add setup code for Day ' + day.day + '\n}\n\nvoid loop() {\n  // TODO: Add loop code\n}'
      localStorage.setItem('ide_code', codeHint)
      localStorage.setItem('ide_project', selected.idea)
    }
    navigate('/simulator2')
    onClose()
  }

  function goToIDE(day) {
    if (selected) {
      const codeHint = '// ProtoMind ProtoIDE\n// Project: ' + selected.idea + '\n// Day ' + day.day + ': ' + day.title + '\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // Your code here\n}'
      localStorage.setItem('ide_code', codeHint)
    }
    navigate('/ide')
    onClose()
  }

  const phases = selected?.roadmap?.phases || []
  const allDays = phases.flatMap(function(p) { return p.days || [] })
  const totalDays = allDays.length
  const doneDays = Object.keys(completedDays).length
  const pct = totalDays > 0 ? Math.round(doneDays / totalDays * 100) : 0
  const currentDay = allDays.find(function(d) { return !completedDays[d.day] })

  const PHASE_COLORS = ['#6366f1','#0ea5e9','#22c55e','#f59e0b','#a855f7','#ef4444']

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <span className="text-white font-bold">ProtoPlan</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">✕</button>
      </div>

      {/* Project list */}
      <div className="border-b border-[#1e1e2e]">
        <p className="text-xs text-slate-600 uppercase tracking-wide px-4 py-2">Projects</p>
        <div className="max-h-36 overflow-y-auto">
          {projects.length === 0 ? (
            <div className="px-4 py-3 text-slate-600 text-xs text-center">
              No projects yet. <button onClick={function() { navigate('/wizard') }} className="text-indigo-400 hover:underline">Start one →</button>
            </div>
          ) : projects.map(function(project) {
            const isSelected = selected?.idea === project.idea
            const pDays = (project.roadmap?.phases || []).flatMap(function(p) { return p.days || [] })
            const pDone = Object.keys(project.completedDays || {}).length
            const pPct = pDays.length > 0 ? Math.round(pDone / pDays.length * 100) : 0
            return (
              <button key={project.idea} onClick={function() { selectProject(project) }}
                className={"w-full text-left px-4 py-2.5 transition border-b border-[#0d0d1a] " + (isSelected ? 'bg-indigo-950 border-l-2 border-l-indigo-500' : 'hover:bg-[#13131f]')}>
                <div className="flex items-center gap-2">
                  {project.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"/>}
                  <p className="text-white text-xs font-medium truncate flex-1">{project.idea?.slice(0, 40)}</p>
                  <span className="text-xs font-bold shrink-0" style={{color: pPct === 100 ? '#22c55e' : '#6366f1'}}>{pPct}%</span>
                </div>
                {pDays.length > 0 && (
                  <div className="w-full bg-[#1e1e2e] rounded-full h-1 mt-1.5">
                    <div className="h-1 rounded-full transition-all" style={{width: pPct + '%', backgroundColor: pPct === 100 ? '#22c55e' : '#6366f1'}}/>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected project roadmap */}
      {selected && (
        <div className="flex-1 overflow-y-auto">
          {!selected.roadmap ? (
            <div className="p-4 text-center">
              <p className="text-slate-400 text-sm mb-3">No roadmap yet for this project</p>
              <button onClick={function() { navigate('/roadmap'); onClose() }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition">
                Generate Roadmap →
              </button>
            </div>
          ) : (
            <>
              {/* Progress summary */}
              <div className="p-4 border-b border-[#1e1e2e]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-bold text-sm truncate max-w-48">{selected.idea?.slice(0, 35)}...</p>
                  <span className="text-indigo-400 font-black text-lg">{pct}%</span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full transition-all" style={{width: pct + '%', backgroundColor: pct === 100 ? '#22c55e' : '#6366f1'}}/>
                </div>
                <p className="text-slate-500 text-xs">{doneDays}/{totalDays} days done {currentDay ? '• Day ' + currentDay.day + ' current' : '• Complete!'}</p>

                {/* Current day highlight */}
                {currentDay && (
                  <div className="mt-3 bg-indigo-950 border border-indigo-800 rounded-xl p-3">
                    <p className="text-indigo-400 text-xs font-semibold">📅 Today — Day {currentDay.day}</p>
                    <p className="text-white text-sm font-bold mt-0.5">{currentDay.title}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={function() { goToSimulator(currentDay) }}
                        className="flex-1 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-cyan-200 rounded-lg text-xs font-bold transition">
                        🔌 ProtoSim
                      </button>
                      <button onClick={function() { goToIDE(currentDay) }}
                        className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition">
                        💻 IDE
                      </button>
                    </div>
                    <button onClick={function() { markDayDone(currentDay.day) }}
                      className="w-full mt-2 py-1.5 bg-green-800 hover:bg-green-700 text-green-200 rounded-lg text-xs font-bold transition">
                      ✅ Mark Day {currentDay.day} Done
                    </button>
                  </div>
                )}
                {pct === 100 && (
                  <div className="mt-3 bg-green-950 border border-green-800 rounded-xl p-3 text-center">
                    <p className="text-green-400 font-black text-lg">🎉 Project Complete!</p>
                  </div>
                )}
              </div>

              {/* Phase tabs */}
              <div className="flex gap-1 p-3 overflow-x-auto border-b border-[#1e1e2e]">
                {phases.map(function(phase, i) {
                  const color = PHASE_COLORS[i % PHASE_COLORS.length]
                  const phaseDone = (phase.days || []).filter(function(d) { return completedDays[d.day] }).length
                  return (
                    <button key={i} onClick={function() { setActivePhase(i) }}
                      className={"flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium transition " + (activePhase === i ? 'text-white' : 'text-slate-500 hover:text-white')}
                      style={activePhase === i ? { backgroundColor: color } : {}}>
                      <p>{phase.name?.slice(0, 10)}</p>
                      <p className="text-xs opacity-70">{phaseDone}/{(phase.days || []).length}</p>
                    </button>
                  )
                })}
              </div>

              {/* Days list */}
              <div className="p-3 space-y-2">
                {(phases[activePhase]?.days || []).map(function(day) {
                  const isDone = !!completedDays[day.day]
                  const isCurrent = currentDay?.day === day.day
                  return (
                    <div key={day.day}
                      className={"rounded-xl border p-3 transition-all " + (
                        isDone ? 'border-green-900 bg-green-950 opacity-70' :
                        isCurrent ? 'border-indigo-600 bg-indigo-950' :
                        'border-[#1e1e2e] bg-[#0d0d1a]'
                      )}>
                      <div className="flex items-start gap-2 mb-1.5">
                        <div className={"w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 " + (isDone ? 'bg-green-700 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-[#1e1e2e] text-slate-400')}>
                          {isDone ? '✓' : day.day}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={"text-xs font-bold truncate " + (isDone ? 'text-green-400 line-through' : 'text-white')}>{day.title}</p>
                          <p className="text-slate-600 text-xs">{day.estimatedHours}h • {(day.tasks || []).length} tasks</p>
                        </div>
                        {isCurrent && <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full shrink-0">NOW</span>}
                        {isDone && <span className="text-xs text-green-500 shrink-0">✓</span>}
                      </div>

                      {/* Tasks preview */}
                      {(isCurrent || !isDone) && (day.tasks || []).slice(0, 2).map(function(task, ti) {
                        return <p key={ti} className="text-slate-500 text-xs flex gap-1 ml-8"><span className="text-indigo-600">›</span>{task}</p>
                      })}

                      {/* Action buttons */}
                      {!isDone && (
                        <div className="flex gap-1.5 mt-2 ml-8">
                          <button onClick={function() { goToSimulator(day) }}
                            className="flex-1 py-1 bg-cyan-900 hover:bg-cyan-800 text-cyan-300 rounded-lg text-xs font-medium transition">
                            🔌 Simulate
                          </button>
                          <button onClick={function() { goToIDE(day) }}
                            className="px-2 py-1 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition">
                            IDE
                          </button>
                          <button onClick={function() { markDayDone(day.day) }}
                            className="flex-1 py-1 bg-green-900 hover:bg-green-800 text-green-300 rounded-lg text-xs font-medium transition">
                            ✅ Done
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN GLOBAL SIDEBAR ──────────────────────────────────────────────────────
function GlobalSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [openPanel, setOpenPanel] = useState(null) // null | 'roadmap' | 'scan' | 'sim'
  const [mounted, setMounted] = useState(false)

  useEffect(function() { setMounted(true) }, [])

  function togglePanel(panel) {
    setOpenPanel(function(prev) { return prev === panel ? null : panel })
  }

  const NAV_ITEMS = [
    { id: 'home', icon: '⚡', label: 'ProtoMind', path: '/', color: '#6366f1' },
    { id: 'viewer', icon: '🔭', label: 'ProtoView', path: '/viewer', color: '#22c55e' },
    { id: 'roadmap', icon: '🗺️', label: 'ProtoPlan', panel: 'roadmap', color: '#a855f7' },
    { id: 'scan', icon: '📷', label: 'ProtoScan', path: '/protoscan', color: '#06b6d4' },
    { id: 'sim', icon: '🔌', label: 'ProtoSim', path: '/simulator2', color: '#22c55e' },
    { id: 'ide', icon: '💻', label: 'ProtoIDE', path: '/ide', color: '#64748b' },
    { id: 'twin', icon: '🔮', label: 'ProtoTwin', path: '/digitaltwin', color: '#f59e0b' },
    { id: 'hub', icon: '🧭', label: 'Hub', path: '/hub', color: '#6366f1' },
  ]

  if (!mounted) return null

  const isViewerPage = location.pathname === '/viewer'
  const isIDEPage = location.pathname === '/ide'
  const isSimPage = location.pathname.includes('simulator') || location.pathname === '/esim'

  // Don't show on fullscreen pages
  if (isIDEPage || isSimPage) return null

  return (
    <>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 z-40 flex">
        {/* Icon rail */}
        <div className="w-14 bg-[#080814] border-r border-[#1e1e2e] flex flex-col items-center py-3 gap-1">
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm mb-2 cursor-pointer"
            onClick={function() { navigate('/') }}>
            P
          </div>

          <div className="w-full h-px bg-[#1e1e2e] mb-1"/>

          {NAV_ITEMS.map(function(item) {
            const isActive = item.path ? location.pathname === item.path : openPanel === item.panel
            return (
              <button key={item.id}
                onClick={function() {
                  if (item.panel) { togglePanel(item.panel) }
                  else { navigate(item.path); setOpenPanel(null) }
                }}
                title={item.label}
                className={"w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all group relative " + (
                  isActive ? 'text-white' : 'text-slate-600 hover:text-white hover:bg-[#13131f]'
                )}
                style={isActive ? { backgroundColor: item.color + '30', color: item.color } : {}}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[8px] leading-none opacity-70">{item.label.slice(0, 5)}</span>
                {/* Active indicator */}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r" style={{backgroundColor: item.color}}/>}
              </button>
            )
          })}

          <div className="flex-1"/>

          {/* Settings */}
          <button onClick={function() { navigate('/settings') }}
            title="Settings"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#13131f] transition text-lg">
            ⚙
          </button>
        </div>

        {/* Sliding panel */}
        {openPanel && (
          <div className="w-80 bg-[#0a0a14] border-r border-[#1e1e2e] flex flex-col overflow-hidden shadow-2xl">
            {openPanel === 'roadmap' && <RoadmapPanel onClose={function() { setOpenPanel(null) }}/>}
          </div>
        )}
      </div>

      {/* Overlay to close panel */}
      {openPanel && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-30"
          onClick={function() { setOpenPanel(null) }}/>
      )}
    </>
  )
}

export default GlobalSidebar
