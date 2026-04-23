import { useState, useEffect } from 'react'
import { getRatingForProject, saveRating } from '../services/ratings'
import { notify } from '../services/toast'

const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: '😊 Easy', desc: 'Went smoothly, no major issues' },
  { id: 'medium', label: '🤔 Medium', desc: 'Some challenges but manageable' },
  { id: 'hard', label: '😤 Hard', desc: 'Significant challenges and debugging' },
  { id: 'expert', label: '🤯 Expert', desc: 'Very difficult, needed advanced knowledge' },
]

const QUICK_TAGS = [
  'Worked first try', 'Needed debugging', 'Great for beginners',
  'Needs more components', 'Perfect for learning', 'Production ready',
  'Fun project', 'Practical use', 'Educational', 'Creative',
]

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110"
        >
          <span className={
            star <= (hovered || value)
              ? 'text-yellow-400'
              : 'text-slate-700'
          }>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

function PrototypeRating({ idea }) {
  const [rating, setRating] = useState(getRatingForProject(idea))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setRating(getRatingForProject(idea))
    setSaved(false)
  }, [idea])

  function update(key, value) {
    setRating(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function toggleTag(tag) {
    const tags = rating.tags || []
    const updated = tags.includes(tag)
      ? tags.filter(t => t !== tag)
      : [...tags, tag]
    update('tags', updated)
  }

  function handleSave() {
    if (rating.stars === 0) {
      notify.warning('Please select a star rating first')
      return
    }
    saveRating(idea, rating)
    setSaved(true)
    notify.success('Rating saved!')
  }

  const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

  return (
    <div className="space-y-5">

      {/* Star rating */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">
          Overall Rating
        </p>
        <div className="flex items-center gap-4">
          <StarRating value={rating.stars} onChange={v => update('stars', v)} />
          {rating.stars > 0 && (
            <span className="text-yellow-400 text-sm font-semibold">
              {STAR_LABELS[rating.stars]}
            </span>
          )}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">
          Actual Difficulty
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => update('difficulty', opt.id)}
              className={`p-3 rounded-xl border text-left transition ${
                rating.difficulty === opt.id
                  ? 'bg-indigo-950 border-indigo-700'
                  : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-800'
              }`}
            >
              <p className="text-white text-xs font-medium">{opt.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Would build again */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">
          Would you build this again?
        </p>
        <div className="flex gap-2">
          {[
            { value: true, label: '👍 Yes definitely' },
            { value: false, label: '👎 Probably not' },
            { value: 'maybe', label: '🤷 Maybe' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => update('wouldBuildAgain', opt.value)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                rating.wouldBuildAgain === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#13131f] border border-[#2e2e4e] text-slate-400 hover:border-indigo-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time spent */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
          Time Spent Building
        </p>
        <div className="flex gap-2 flex-wrap">
          {['< 1 hour', '1-2 hours', 'Half a day', 'Full day', '2-3 days', '1 week+'].map(t => (
            <button
              key={t}
              onClick={() => update('timeSpent', t)}
              className={`px-3 py-1.5 rounded-xl text-xs transition ${
                rating.timeSpent === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#13131f] border border-[#2e2e4e] text-slate-400 hover:border-indigo-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Quick tags */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
          Quick Tags
        </p>
        <div className="flex flex-wrap gap-1">
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-full text-xs transition ${
                (rating.tags || []).includes(tag)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#13131f] border border-[#2e2e4e] text-slate-400 hover:border-indigo-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Written review */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">
          Personal Review
        </p>
        <textarea
          value={rating.review}
          onChange={e => update('review', e.target.value)}
          placeholder="What worked well? What was tricky? Any tips for next time?"
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition resize-none"
          rows={3}
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
          saved
            ? 'bg-green-900 text-green-400'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        }`}
      >
        {saved ? '✅ Rating Saved!' : '⭐ Save Rating'}
      </button>

      {/* Show existing rating summary */}
      {saved && rating.stars > 0 && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2">Your rating summary</p>
          <div className="flex gap-1 mb-2">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={s <= rating.stars ? 'text-yellow-400' : 'text-slate-700'}>★</span>
            ))}
            <span className="text-slate-400 text-xs ml-2">{STAR_LABELS[rating.stars]}</span>
          </div>
          {rating.difficulty && (
            <p className="text-slate-500 text-xs">
              Difficulty: {DIFFICULTY_OPTIONS.find(d => d.id === rating.difficulty)?.label}
            </p>
          )}
          {rating.timeSpent && (
            <p className="text-slate-500 text-xs">Time spent: {rating.timeSpent}</p>
          )}
          {(rating.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {rating.tags.map(tag => (
                <span key={tag} className="text-xs bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-900">
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

export default PrototypeRating