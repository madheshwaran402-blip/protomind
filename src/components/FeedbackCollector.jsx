import { useState, useEffect } from 'react'
import { getFeedback, saveFeedback } from '../services/feedbackService'
import { notify } from '../services/toast'

const ASPECTS = [
  { id: 'design', label: 'Circuit Design', icon: '📐' },
  { id: 'code', label: 'Code Quality', icon: '💻' },
  { id: 'assembly', label: 'Assembly', icon: '🔧' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
]

function StarPicker({ value, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(0)
  const sizeClass = size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className={`${sizeClass} transition`}
        >
          <span style={{ color: star <= (hovered || value) ? '#f59e0b' : '#374151' }}>★</span>
        </button>
      ))}
    </div>
  )
}

function FeedbackCollector({ idea }) {
  const [feedback, setFeedback] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    overallRating: 0,
    aspectRatings: {},
    whatWorked: '',
    whatDidnt: '',
    lessonsLearned: '',
    wouldRebuild: null,
    timeSpent: '',
    difficulty: '',
  })

  useEffect(() => {
    const existing = getFeedback(idea)
    if (existing) {
      setFeedback(existing)
      setForm(existing)
    }
  }, [idea])

  function handleSave() {
    if (form.overallRating === 0) {
      notify.warning('Please add an overall rating')
      return
    }
    const saved = saveFeedback(idea, form)
    setFeedback(saved)
    setEditing(false)
    notify.success('Feedback saved!')
  }

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function updateAspect(id, value) {
    setForm(prev => ({
      ...prev,
      aspectRatings: { ...prev.aspectRatings, [id]: value },
    }))
  }

  if (feedback && !editing) {
    return (
      <div className="space-y-4">
        {/* Overall rating display */}
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">Overall Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className="text-2xl" style={{ color: s <= feedback.overallRating ? '#f59e0b' : '#374151' }}>★</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ✏️ Edit
          </button>
        </div>

        {/* Aspect ratings */}
        {Object.keys(feedback.aspectRatings || {}).length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {ASPECTS.filter(a => feedback.aspectRatings?.[a.id]).map(aspect => (
              <div key={aspect.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">{aspect.icon} {aspect.label}</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className="text-sm" style={{ color: s <= (feedback.aspectRatings[aspect.id] || 0) ? '#f59e0b' : '#374151' }}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Text feedback */}
        <div className="space-y-2">
          {feedback.whatWorked && (
            <div className="bg-green-950 border border-green-900 rounded-xl p-3">
              <p className="text-green-400 text-xs font-semibold mb-1">✅ What Worked</p>
              <p className="text-slate-300 text-sm">{feedback.whatWorked}</p>
            </div>
          )}
          {feedback.whatDidnt && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-3">
              <p className="text-red-400 text-xs font-semibold mb-1">❌ What Didn't Work</p>
              <p className="text-slate-300 text-sm">{feedback.whatDidnt}</p>
            </div>
          )}
          {feedback.lessonsLearned && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-3">
              <p className="text-indigo-400 text-xs font-semibold mb-1">💡 Lessons Learned</p>
              <p className="text-slate-300 text-sm">{feedback.lessonsLearned}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 text-xs text-slate-500">
          {feedback.wouldRebuild !== null && (
            <span>{feedback.wouldRebuild ? '🔁 Would rebuild' : '⏭️ Would not rebuild'}</span>
          )}
          {feedback.timeSpent && <span>⏱️ {feedback.timeSpent} hours</span>}
          {feedback.difficulty && <span>📊 {feedback.difficulty} difficulty</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall rating */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-2">Overall Rating *</p>
        <StarPicker value={form.overallRating} onChange={v => update('overallRating', v)} size="lg" />
      </div>

      {/* Aspect ratings */}
      <div className="grid grid-cols-2 gap-2">
        {ASPECTS.map(aspect => (
          <div key={aspect.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-lg p-3">
            <p className="text-slate-500 text-xs mb-1">{aspect.icon} {aspect.label}</p>
            <StarPicker
              value={form.aspectRatings?.[aspect.id] || 0}
              onChange={v => updateAspect(aspect.id, v)}
            />
          </div>
        ))}
      </div>

      {/* Text fields */}
      <div>
        <p className="text-xs text-slate-500 mb-1">✅ What Worked Well?</p>
        <textarea
          value={form.whatWorked}
          onChange={e => update('whatWorked', e.target.value)}
          placeholder="e.g. The sensor readings were very accurate..."
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-green-600 resize-none placeholder-slate-600"
          rows={2}
        />
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1">❌ What Didn't Work?</p>
        <textarea
          value={form.whatDidnt}
          onChange={e => update('whatDidnt', e.target.value)}
          placeholder="e.g. WiFi connection was unstable..."
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-red-600 resize-none placeholder-slate-600"
          rows={2}
        />
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1">💡 Lessons Learned</p>
        <textarea
          value={form.lessonsLearned}
          onChange={e => update('lessonsLearned', e.target.value)}
          placeholder="e.g. Always add decoupling capacitors..."
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">⏱️ Time Spent (hours)</p>
          <input
            type="number"
            value={form.timeSpent}
            onChange={e => update('timeSpent', e.target.value)}
            placeholder="e.g. 8"
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">📊 Difficulty</p>
          <select
            value={form.difficulty}
            onChange={e => update('difficulty', e.target.value)}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
          >
            <option value="">Select...</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Would rebuild */}
      <div>
        <p className="text-xs text-slate-500 mb-2">🔁 Would you rebuild this?</p>
        <div className="flex gap-2">
          {[
            { value: true, label: '✅ Yes, definitely' },
            { value: false, label: '❌ No, move on' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => update('wouldRebuild', opt.value)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                form.wouldRebuild === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#13131f] border border-[#2e2e4e] text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
      >
        💾 Save Feedback
      </button>

      {feedback && (
        <button
          onClick={() => { setEditing(false) }}
          className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
        >
          Cancel
        </button>
      )}
    </div>
  )
}

export default FeedbackCollector