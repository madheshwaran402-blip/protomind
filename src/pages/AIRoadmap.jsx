import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notify } from '../services/toast'

const PHASE_COLORS = ['#6366f1','#0ea5e9','#22c55e','#f59e0b','#a855f7','#ef4444']

function getDaysBetween(start, end) {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
}

function addWorkingDays(startDate, days, workingDays) {
  const dayMap = {mon:1,tue:2,wed:3,thu:4,fri:5,sat:6,sun:0}
  const allowed = workingDays.map(function(d){return dayMap[d]})
  let current = new Date(startDate)
  let added = 0
  while (added < days) {
    current.setDate(current.getDate() + 1)
    if (allowed.includes(current.getDay())) added++
  }
  return current.toISOString().split('T')[0]
}

async function generateRoadmap(requirements) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel||'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'

  const totalWorkingDays = Math.round(
    requirements.timeline.months * 30 * requirements.timeline.workingDays.length / 7
  )

  const prompt = [
    'You are a hardware project planning expert.',
    'Create a detailed day-by-day project roadmap.',
    'Project: ' + requirements.idea,
    'Skill level: ' + (requirements.skillLevel||'intermediate'),
    'Total working days: ' + totalWorkingDays,
    'Hours per day: ' + requirements.timeline.hoursPerDay,
    'Target: ' + (requirements.target||[]).join(', '),
    'Reply ONLY with valid JSON:',
    '{ "phases": [ { "name": "...", "startDay": 1, "endDay": 5, "color": "#6366f1", "description": "...", "days": [ { "day": 1, "title": "...", "tasks": ["...", "..."], "learningResource": "...", "deliverable": "...", "estimatedHours": 2 } ] } ] }',
    'Create 5-6 phases covering: Research, Hardware Setup, Software Development, Integration, Testing, Launch.',
    'Each phase should have multiple days with specific actionable tasks.',
    'Total days should sum to approximately ' + totalWorkingDays,
  ].join('\n')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({model, prompt, stream: false})
  })
  const data = await response.json()
  const match = data.response.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON')
  return JSON.parse(match[0])
}

function RoadmapDay({ day, phaseColor, workingDays, startDate, onComplete, isComplete, isCurrent }) {
  const [expanded, setExpanded] = useState(isCurrent)
  const [completedTasks, setCompletedTasks] = useState({})
  const [notes, setNotes] = useState('')
  const [showSubmit, setShowSubmit] = useState(false)

  const allTasksDone = day.tasks.every(function(_,i){return completedTasks[i]})
  const actualDate = addWorkingDays(startDate, day.day - 1, workingDays)

  return (
    <div className={"rounded-2xl border-2 overflow-hidden transition-all " + (
      isComplete ? "border-green-800 bg-green-950 opacity-70" :
      isCurrent ? "border-indigo-500 shadow-lg shadow-indigo-900" :
      "border-[#1e1e2e] bg-[#0d0d1a]"
    )}>
      <button onClick={function(){setExpanded(!expanded)}}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white hover:bg-opacity-5 transition">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-lg"
          style={{backgroundColor: isComplete ? '#16a34a' : isCurrent ? phaseColor : '#1e1e2e'}}>
          {isComplete ? '✓' : day.day}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={"font-bold " + (isComplete ? 'text-green-400' : 'text-white')}>{day.title}</p>
            {isCurrent && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full animate-pulse">TODAY</span>}
          </div>
          <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
            <span>{actualDate}</span>
            <span>{day.estimatedHours}h</span>
            <span>{day.tasks.length} tasks</span>
            {isComplete && <span className="text-green-400">Complete</span>}
          </div>
        </div>
        <span className="text-slate-600">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#1e1e2e] pt-4 space-y-4">
          {/* Tasks */}
          <div className="space-y-2">
            {day.tasks.map(function(task, i) {
              const done = !!completedTasks[i]
              return (
                <div key={i} onClick={function(){
                  setCompletedTasks(function(p){return Object.assign({},p,{[i]:!p[i]})})
                }}
                  className={"flex items-start gap-3 p-3 rounded-xl cursor-pointer transition " + (done ? 'bg-green-950 bg-opacity-50' : 'bg-[#050510] hover:bg-[#0d0d1a]')}>
                  <div className={"w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 " + (done ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e]')}>
                    {done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <p className={"text-sm " + (done ? 'line-through text-slate-500' : 'text-slate-300')}>{task}</p>
                </div>
              )
            })}
          </div>

          {/* Deliverable */}
          {day.deliverable && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-3">
              <p className="text-indigo-400 text-xs font-semibold mb-1">Deliverable</p>
              <p className="text-white text-sm">{day.deliverable}</p>
            </div>
          )}

          {/* Learning resource */}
          {day.learningResource && (
            <div className="bg-[#050510] border border-[#2e2e4e] rounded-xl p-3">
              <p className="text-slate-500 text-xs font-semibold mb-1">📚 Learning Resource</p>
              <p className="text-slate-300 text-sm">{day.learningResource}</p>
            </div>
          )}

          {/* Mark complete */}
          {!isComplete && isCurrent && (
            <div className="space-y-2">
              {showSubmit ? (
                <div className="space-y-2">
                  <textarea value={notes} onChange={function(e){setNotes(e.target.value)}}
                    placeholder="What did you complete? Any blockers or notes?"
                    className="w-full h-20 bg-[#050510] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={function(){setShowSubmit(false)}}
                      className="flex-1 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-xs">Cancel</button>
                    <button onClick={function(){onComplete(day.day, notes, completedTasks)}}
                      className="flex-[2] py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-bold">
                      Submit Day {day.day} ✓
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={function(){setShowSubmit(true)}}
                  disabled={!allTasksDone}
                  className={"w-full py-3 rounded-xl font-bold text-sm transition " + (allTasksDone ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-[#1e1e2e] text-slate-500 cursor-not-allowed')}>
                  {allTasksDone ? '✅ Mark Day Complete' : 'Complete all tasks to finish day'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AIRoadmap() {
  const navigate = useNavigate()
  const location = useLocation()
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activePhase, setActivePhase] = useState(0)
  const [completedDays, setCompletedDays] = useState({})
  const [requirements, setRequirements] = useState(null)
  const [overallProgress, setOverallProgress] = useState(0)

  // Load requirements from state or localStorage
  useEffect(function() {
    const req = location.state?.requirements ||
      JSON.parse(localStorage.getItem('protomind_current_requirements') || 'null')
    if (req) {
      setRequirements(req)
      // Load saved roadmap
      const saved = localStorage.getItem('protomind_roadmap_' + btoa(req.idea).slice(0,20))
      if (saved) {
        const parsed = JSON.parse(saved)
        setRoadmap(parsed.roadmap)
        setCompletedDays(parsed.completedDays || {})
      }
    }
  }, [])

  // Calculate progress
  useEffect(function() {
    if (!roadmap) return
    const allDays = roadmap.phases.flatMap(function(p){return p.days||[]})
    const total = allDays.length
    const done = Object.keys(completedDays).length
    setOverallProgress(total > 0 ? Math.round(done/total*100) : 0)
  }, [roadmap, completedDays])

  async function handleGenerate() {
    if (!requirements) { notify.warning('No requirements found. Please start from the Wizard.'); return }
    setLoading(true)
    try {
      const result = await generateRoadmap(requirements)
      setRoadmap(result)
      // Save to localStorage
      localStorage.setItem(
        'protomind_roadmap_' + btoa(requirements.idea).slice(0,20),
        JSON.stringify({ roadmap: result, completedDays: {}, generatedAt: new Date().toISOString() })
      )
      notify.success('Your personalized roadmap is ready!')
    } catch(e) {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleDayComplete(dayNum, notes, tasks) {
    const newCompleted = Object.assign({}, completedDays, {
      [dayNum]: { completedAt: new Date().toISOString(), notes, tasks }
    })
    setCompletedDays(newCompleted)
    if (requirements && roadmap) {
      localStorage.setItem(
        'protomind_roadmap_' + btoa(requirements.idea).slice(0,20),
        JSON.stringify({ roadmap, completedDays: newCompleted, generatedAt: new Date().toISOString() })
      )
    }
    notify.success('Day ' + dayNum + ' complete! Great work!')
  }

  // Find current day (first non-completed)
  function getCurrentDay() {
    if (!roadmap) return 1
    const allDays = roadmap.phases.flatMap(function(p){return p.days||[]}).sort(function(a,b){return a.day-b.day})
    const incomplete = allDays.find(function(d){return !completedDays[d.day]})
    return incomplete ? incomplete.day : allDays.length
  }


  function exportRoadmap() {
    if (!roadmap) return
    const phases = roadmap.phases || []
    const lines = ['# ProtoMind AI Roadmap', '', '**Project:** ' + (requirements?.idea || 'My Project'), '']
    phases.forEach(function(phase) {
      lines.push('## ' + phase.name)
      lines.push('Days ' + phase.startDay + ' to ' + phase.endDay)
      lines.push('')
      ;(phase.days || []).forEach(function(day) {
        const done = completedDays[day.day]
        lines.push('### Day ' + day.day + ': ' + day.title + (done ? ' ✓' : ''))
        ;(day.tasks || []).forEach(function(task) {
          lines.push('- ' + task)
        })
        lines.push('')
      })
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'roadmap.md'; a.click()
    URL.revokeObjectURL(url)
    notify.success('Roadmap exported!')
  }

  const currentDay = getCurrentDay()
  const allPhases = roadmap?.phases || []
  const allDays = allPhases.flatMap(function(p){return p.days||[]})

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Animated bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600 opacity-4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-600 opacity-4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={function(){navigate('/')}} className="text-slate-500 hover:text-white text-sm mb-3 flex items-center gap-2">
              ← Home
            </button>
            <h1 className="text-3xl font-black mb-1">AI Project Roadmap</h1>
            {requirements && (
              <p className="text-slate-400 text-sm">
                {requirements.idea.slice(0,60)}{requirements.idea.length>60?'...':''} •
                {requirements.timeline?.months} month{requirements.timeline?.months > 1 ? 's' : ''} •
                {requirements.timeline?.hoursPerDay}h/day
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={function(){navigate('/wizard')}}
              className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition">
              ← Wizard
            </button>
            {roadmap && (
              <button onClick={exportRoadmap}
                className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition">
                Export .md
              </button>
            )}
            {!roadmap && (
              <button onClick={handleGenerate} disabled={loading || !requirements}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition disabled:opacity-50">
                {loading ? 'Generating...' : 'Generate Roadmap'}
              </button>
            )}
          </div>
        </div>

        {/* No requirements state */}
        {!requirements && (
          <div className="text-center py-20 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-white font-bold text-xl mb-2">No Project Found</p>
            <p className="text-slate-400 mb-6">Start from the Project Wizard to get your personalized roadmap</p>
            <button onClick={function(){navigate('/wizard')}}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">
              Start Project Wizard
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white font-bold text-xl mb-2">Building Your Roadmap</p>
            <p className="text-slate-400">ProtoMind is creating your personalized day-by-day plan...</p>
          </div>
        )}

        {/* Roadmap content */}
        {roadmap && !loading && (
          <>
            {/* Progress overview */}
            <div className="bg-gradient-to-r from-indigo-950 to-[#0d0d1a] border border-indigo-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="#1e1e2e" strokeWidth="6" />
                    <circle cx="40" cy="40" r="35" fill="none" stroke="#6366f1" strokeWidth="6"
                      strokeDasharray={2*Math.PI*35}
                      strokeDashoffset={2*Math.PI*35*(1-overallProgress/100)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-indigo-400 font-black text-lg">{overallProgress}%</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-xl mb-1">Overall Progress</p>
                  <p className="text-slate-400 text-sm">
                    Day {currentDay} of {allDays.length} •
                    {Object.keys(completedDays).length} days complete •
                    {allDays.length - Object.keys(completedDays).length} remaining
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {allPhases.map(function(phase, i) {
                      const phaseDays = phase.days || []
                      const phaseDone = phaseDays.filter(function(d){return completedDays[d.day]}).length
                      const color = PHASE_COLORS[i % PHASE_COLORS.length]
                      return (
                        <div key={i} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor:color}} />
                          <span className="text-xs text-slate-400">{phase.name}: {phaseDone}/{phaseDays.length}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-indigo-400 font-black text-3xl">Day {currentDay}</p>
                  <p className="text-slate-500 text-xs">Current</p>
                  {requirements?.timeline && (
                    <p className="text-slate-500 text-xs mt-1">
                      {addWorkingDays(requirements.timeline.startDate, currentDay-1, requirements.timeline.workingDays)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phase tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
              {allPhases.map(function(phase, i) {
                const color = PHASE_COLORS[i % PHASE_COLORS.length]
                const phaseDays = phase.days || []
                const phaseDone = phaseDays.filter(function(d){return completedDays[d.day]}).length
                const isActive = activePhase === i
                return (
                  <button key={i} onClick={function(){setActivePhase(i)}}
                    className={"flex-shrink-0 px-4 py-3 rounded-xl text-xs font-bold transition text-left " + (isActive ? 'text-white' : 'bg-[#0d0d1a] text-slate-400 border border-[#1e1e2e] hover:border-indigo-800')}
                    style={isActive ? {backgroundColor:color} : {}}>
                    <p>Phase {i+1}</p>
                    <p className="font-normal opacity-80">{phase.name}</p>
                    <p className="opacity-60 text-xs">{phaseDone}/{phaseDays.length} done</p>
                  </button>
                )
              })}
            </div>

            {/* Active phase info */}
            {allPhases[activePhase] && (
              <div className="mb-4 rounded-xl border p-4"
                style={{backgroundColor:PHASE_COLORS[activePhase%PHASE_COLORS.length]+'15', borderColor:PHASE_COLORS[activePhase%PHASE_COLORS.length]+'40'}}>
                <p className="text-white font-bold text-lg">{allPhases[activePhase].name}</p>
                <p className="text-slate-400 text-sm">{allPhases[activePhase].description}</p>
                <p className="text-xs mt-1" style={{color:PHASE_COLORS[activePhase%PHASE_COLORS.length]}}>
                  Days {allPhases[activePhase].startDay} – {allPhases[activePhase].endDay}
                </p>
              </div>
            )}

            {/* Days list */}
            <div className="space-y-3">
              {(allPhases[activePhase]?.days || []).map(function(day) {
                return (
                  <RoadmapDay key={day.day}
                    day={day}
                    phaseColor={PHASE_COLORS[activePhase%PHASE_COLORS.length]}
                    workingDays={requirements?.timeline?.workingDays || ['mon','tue','wed','thu','fri']}
                    startDate={requirements?.timeline?.startDate || new Date().toISOString().split('T')[0]}
                    onComplete={handleDayComplete}
                    isComplete={!!completedDays[day.day]}
                    isCurrent={day.day === currentDay}
                  />
                )
              })}
            </div>

            {/* Regenerate */}
            <div className="mt-6 text-center">
              <button onClick={handleGenerate}
                className="px-6 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition">
                Regenerate Roadmap
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AIRoadmap
