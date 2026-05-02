import { useState, useEffect } from 'react'
import {
  getLogsForProject,
  addLogEntry,
  deleteLogEntry,
  getLogStats,
  exportBuildLog,
} from '../services/buildLogService'
import { notify } from '../services/toast'

const MOODS = [
  { id: 'great', label: 'Great', emoji: '🔥' },
  { id: 'good', label: 'Good', emoji: '😊' },
  { id: 'neutral', label: 'OK', emoji: '😐' },
  { id: 'stuck', label: 'Stuck', emoji: '😤' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😩' },
]

const QUICK_TAGS = ['Wiring', 'Code', 'Testing', 'Debugging', 'Research', 'Soldering', 'Design', 'Parts arrived']

const MILESTONES = [
  'First LED blink',
  'Sensor reading working',
  'Code uploaded',
  'Breadboard complete',
  'Soldering done',
  'Fully tested',
  'Build complete',
]

function LogEntry({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const mood = MOODS.find(m => m.id === entry.mood) || MOODS[2]

  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[#1e1e2e] transition"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-2xl shrink-0">{mood.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-slate-400 text-xs">{date}</p>
            {entry.hoursWorked > 0 && (
              <span className="text-xs text-indigo-400">⏱️ {entry.hoursWorked}h</span>
            )}
            {entry.milestone && (
              <span className="text-xs bg-yellow-950 text-yellow-400 border border-yellow-800 px-1.5 py-0.5 rounded-full">
                🏆 {entry.milestone}
              </span>
            )}
          </div>
          <p className={`text-white text-sm leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {entry.text}
          </p>
          {entry.tags?.length > 0 && !expanded && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {entry.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-[#0d0d1a] text-slate-500 px-1.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDelete(entry.id) }}
            className="text-slate-600 hover:text-red-400 text-xs transition"
          >
            🗑
          </button>
          <span className="text-slate-600 text-xs">{expanded ? '↑' : '↓'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#2e2e4e] pt-3 space-y-2">
          {entry.imageUrl && (
            <img
              src={entry.imageUrl}
              alt="Build photo"
              className="w-full max-h-48 object-cover rounded-xl"
              onError={e => { e.target.style.display = 'none' }}
            />
          )}
          <p className="text-white text-sm leading-relaxed">{entry.text}</p>
          {entry.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {entry.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-[#0d0d1a] text-slate-500 border border-[#2e2e4e] px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BuildLog({ idea }) {
  const [logs, setLogs] = useState(getLogsForProject(idea))
  const [stats, setStats] = useState(getLogStats(idea))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    text: '',
    mood: 'good',
    tags: [],
    imageUrl: '',
    hoursWorked: '',
    milestone: '',
  })
  const [customTag, setCustomTag] = useState('')
  const [search, setSearch] = useState('')

  function refresh() {
    setLogs(getLogsForProject(idea))
    setStats(getLogStats(idea))
  }

  function handleSubmit() {
    if (!form.text.trim()) {
      notify.warning('Please write something in your log')
      return
    }
    addLogEntry(idea, form)
    refresh()
    setForm({ text: '', mood: 'good', tags: [], imageUrl: '', hoursWorked: '', milestone: '' })
    setShowForm(false)
    notify.success('Log entry added!')
  }

  function handleDelete(entryId) {
    deleteLogEntry(idea, entryId)
    refresh()
    notify.success('Entry deleted')
  }

  function toggleTag(tag) {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  function addCustomTag() {
    if (!customTag.trim()) return
    toggleTag(customTag.trim())
    setCustomTag('')
  }

  const filtered = logs.filter(log =>
    !search.trim() ||
    log.text.toLowerCase().includes(search.toLowerCase()) ||
    (log.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    (log.milestone || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">

      {/* Stats row */}
      {logs.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Entries', value: stats.totalEntries, icon: '📝' },
            { label: 'Hours', value: stats.totalHours, icon: '⏱️' },
            { label: 'Top Mood', value: MOODS.find(m => m.id === stats.topMood)?.emoji || '😊', icon: '' },
            { label: 'Top Tag', value: stats.topTags[0] || 'None', icon: '🏷️' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-2 text-center">
              <p className="text-white text-sm font-bold">{stat.value}</p>
              <p className="text-slate-600 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
        >
          {showForm ? '✕ Cancel' : '+ Add Log Entry'}
        </button>
        {logs.length > 0 && (
          <button
            onClick={() => { exportBuildLog(idea); notify.success('Build log exported!') }}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ⬇️ Export
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
          <p className="text-white text-sm font-semibold">New Build Log Entry</p>

          {/* Mood picker */}
          <div>
            <p className="text-xs text-slate-500 mb-2">How's it going?</p>
            <div className="flex gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setForm(prev => ({ ...prev, mood: mood.id }))}
                  className={`flex-1 py-2 rounded-lg text-center transition ${
                    form.mood === mood.id
                      ? 'bg-indigo-600'
                      : 'bg-[#0d0d1a] border border-[#2e2e4e] hover:border-indigo-600'
                  }`}
                  title={mood.label}
                >
                  <span className="text-lg">{mood.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text area */}
          <textarea
            value={form.text}
            onChange={e => setForm(prev => ({ ...prev, text: e.target.value }))}
            placeholder="What did you work on today? Any problems? What did you learn?..."
            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
            rows={4}
          />

          {/* Quick tags */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Tags</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2 py-1 rounded-full border transition ${
                    form.tags.includes(tag)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-[#0d0d1a] text-slate-500 border-[#2e2e4e] hover:border-indigo-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                placeholder="Custom tag..."
                className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
              />
              <button onClick={addCustomTag} className="px-3 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs">
                +
              </button>
            </div>
          </div>

          {/* Milestone */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Milestone achieved? (optional)</p>
            <select
              value={form.milestone}
              onChange={e => setForm(prev => ({ ...prev, milestone: e.target.value }))}
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
            >
              <option value="">No milestone</option>
              {MILESTONES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Hours + Image */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-slate-500 mb-1">Hours worked</p>
              <input
                type="number"
                value={form.hoursWorked}
                onChange={e => setForm(prev => ({ ...prev, hoursWorked: e.target.value }))}
                placeholder="e.g. 2.5"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Photo URL (optional)</p>
              <input
                value={form.imageUrl}
                onChange={e => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            💾 Save Log Entry
          </button>
        </div>
      )}

      {/* Search */}
      {logs.length > 3 && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl pl-8 pr-4 py-2 text-white text-xs outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Empty state */}
      {logs.length === 0 && !showForm && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📔</div>
          <p className="text-slate-500 text-sm">No log entries yet</p>
          <p className="text-slate-600 text-xs mt-1">Start documenting your build journey</p>
        </div>
      )}

      {/* Log entries */}
      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(entry => (
            <LogEntry key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {search && filtered.length === 0 && (
        <p className="text-center text-slate-600 text-sm py-4">No entries match your search</p>
      )}
    </div>
  )
}

export default BuildLog