import { useState } from 'react'
import { generateUserStories, saveUserStories, getUserStories } from '../services/userStoryService'
import { notify } from '../services/toast'

const PRIORITY_STYLES = {
  High: 'text-red-400 bg-red-950 border-red-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-green-400 bg-green-950 border-green-800',
}

function UserStoryGenerator({ idea, components }) {
  const [result, setResult] = useState(getUserStories(idea))
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [completed, setCompleted] = useState({})

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateUserStories(idea, components)
      setResult(data)
      saveUserStories(idea, data)
      notify.success(data.stories?.length + ' user stories generated!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleDone(id) {
    setCompleted(function(prev) {
      const next = Object.assign({}, prev)
      next[id] = !next[id]
      return next
    })
  }

  const stories = result?.stories || []
  const filtered = filter === 'All' ? stories : stories.filter(function(s) { return s.priority === filter })
  const totalPoints = stories.reduce(function(sum, s) { return sum + (s.points || 0) }, 0)
  const completedPoints = stories.filter(function(s) { return completed[s.id] }).reduce(function(sum, s) { return sum + (s.points || 0) }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate agile user stories with acceptance criteria for your prototype</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Generating...' : 'Generate Stories'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Generating user stories...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-blue-950 border border-blue-800 rounded-xl p-3">
            <p className="text-blue-400 text-xs font-semibold mb-0.5">Epic</p>
            <p className="text-white font-bold">{result.epic}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                <div className="h-1.5 bg-blue-600 rounded-full"
                  style={{ width: totalPoints > 0 ? (completedPoints / totalPoints * 100) + '%' : '0%' }} />
              </div>
              <span className="text-blue-400 text-xs">{completedPoints}/{totalPoints} pts</span>
            </div>
          </div>

          <div className="flex gap-1">
            {['All', 'High', 'Medium', 'Low'].map(function(f) {
              return (
                <button key={f} onClick={function() { setFilter(f) }}
                  className={'text-xs px-3 py-1.5 rounded-xl border transition ' + (
                    filter === f ? 'bg-blue-700 text-white border-blue-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]'
                  )}>
                  {f}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {filtered.map(function(story) {
              const done = !!completed[story.id]
              const priStyle = PRIORITY_STYLES[story.priority] || PRIORITY_STYLES.Medium
              const isExp = expanded === story.id
              return (
                <div key={story.id} className={'rounded-xl border overflow-hidden transition ' + (done ? 'opacity-60 border-[#1e1e2e]' : 'border-[#2e2e4e]')}>
                  <div className={'flex items-start gap-3 p-3 cursor-pointer hover:bg-[#1e1e2e] transition ' + (done ? 'bg-[#0d0d1a]' : 'bg-[#13131f]')}
                    onClick={function() { setExpanded(isExp ? null : story.id) }}>
                    <button onClick={function(e) { e.stopPropagation(); toggleDone(story.id) }}
                      className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ' + (done ? 'bg-green-600 border-green-500' : 'border-[#2e2e4e] hover:border-blue-500')}>
                      {done && <span className="text-white text-xs">v</span>}
                    </button>
                    <div className="flex-1">
                      <p className={'text-xs text-slate-500 mb-0.5'}>As a {story.role}</p>
                      <p className={'text-sm font-medium ' + (done ? 'line-through text-slate-500' : 'text-white')}>
                        I want to {story.action}
                      </p>
                      <p className="text-slate-500 text-xs">So that {story.benefit}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={'text-xs px-1.5 py-0.5 rounded border ' + priStyle}>{story.priority}</span>
                      {story.points && <span className="text-slate-600 text-xs">{story.points}pt</span>}
                    </div>
                  </div>
                  {isExp && story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                    <div className="bg-[#0d0d1a] border-t border-[#1e1e2e] p-3">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Acceptance Criteria:</p>
                      <ul className="space-y-1">
                        {story.acceptanceCriteria.map(function(ac, j) {
                          return <li key={j} className="text-slate-300 text-xs flex gap-2"><span className="text-blue-400 shrink-0">-</span>{ac}</li>
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate Stories</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-white font-semibold mb-1">User Story Generator</p>
          <p className="text-slate-500 text-sm">Generate agile user stories with acceptance criteria and story points</p>
        </div>
      )}
    </div>
  )
}

export default UserStoryGenerator
