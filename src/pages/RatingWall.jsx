import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllFeedback, getFeedbackStats, deleteFeedback } from '../services/feedbackService'
import { getAllProjects } from '../services/storage'
import { notify } from '../services/toast'

function StarDisplay({ rating, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={sizeClass} style={{ color: s <= rating ? '#f59e0b' : '#374151' }}>★</span>
      ))}
    </div>
  )
}

function FeedbackCard({ feedback, project, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const date = new Date(feedback.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const difficultyColors = {
    Beginner: 'text-green-400 bg-green-950 border-green-800',
    Intermediate: 'text-yellow-400 bg-yellow-950 border-yellow-800',
    Advanced: 'text-red-400 bg-red-950 border-red-800',
    Expert: 'text-purple-400 bg-purple-950 border-purple-800',
  }

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-4 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{project?.thumbnail || '🔧'}</span>
          <div>
            <p className="text-white text-sm font-semibold line-clamp-1 max-w-40">
              {feedback.idea.slice(0, 40)}{feedback.idea.length > 40 ? '...' : ''}
            </p>
            <p className="text-slate-600 text-xs">{date}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(feedback.idea)}
          className="text-slate-700 hover:text-red-400 text-xs transition shrink-0"
        >
          🗑
        </button>
      </div>

      {/* Stars */}
      <StarDisplay rating={feedback.overallRating} size="md" />

      {/* Tags row */}
      <div className="flex flex-wrap gap-1 mt-2 mb-3">
        {feedback.wouldRebuild !== null && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${
            feedback.wouldRebuild
              ? 'text-green-400 bg-green-950 border-green-800'
              : 'text-slate-500 bg-slate-900 border-slate-700'
          }`}>
            {feedback.wouldRebuild ? '🔁 Would rebuild' : '⏭️ Move on'}
          </span>
        )}
        {feedback.difficulty && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[feedback.difficulty] || 'text-slate-500 bg-slate-900 border-slate-700'}`}>
            {feedback.difficulty}
          </span>
        )}
        {feedback.timeSpent && (
          <span className="text-xs text-slate-500 bg-[#13131f] border border-[#2e2e4e] px-2 py-0.5 rounded-full">
            ⏱️ {feedback.timeSpent}h
          </span>
        )}
      </div>

      {/* Preview */}
      {feedback.lessonsLearned && !expanded && (
        <p className="text-slate-500 text-xs italic line-clamp-1">"{feedback.lessonsLearned}"</p>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="space-y-2 mt-2">
          {feedback.whatWorked && (
            <div className="bg-green-950 border border-green-900 rounded-lg p-2">
              <p className="text-green-400 text-xs font-semibold">✅ What Worked</p>
              <p className="text-slate-300 text-xs mt-0.5">{feedback.whatWorked}</p>
            </div>
          )}
          {feedback.whatDidnt && (
            <div className="bg-red-950 border border-red-900 rounded-lg p-2">
              <p className="text-red-400 text-xs font-semibold">❌ What Didn't</p>
              <p className="text-slate-300 text-xs mt-0.5">{feedback.whatDidnt}</p>
            </div>
          )}
          {feedback.lessonsLearned && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-lg p-2">
              <p className="text-indigo-400 text-xs font-semibold">💡 Lessons</p>
              <p className="text-slate-300 text-xs mt-0.5">{feedback.lessonsLearned}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs text-slate-600 hover:text-slate-400 transition"
      >
        {expanded ? 'Show less ↑' : 'Show more ↓'}
      </button>
    </div>
  )
}

function RatingWall() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState({})
  const [projects, setProjects] = useState([])
  const [sortBy, setSortBy] = useState('rating')
  const [filterRating, setFilterRating] = useState(0)

  useEffect(() => {
    setFeedback(getAllFeedback())
    setProjects(getAllProjects())
  }, [])

  function handleDelete(idea) {
    deleteFeedback(idea)
    setFeedback(getAllFeedback())
    notify.success('Feedback deleted')
  }

  const stats = getFeedbackStats()

  const entries = Object.values(feedback)
    .filter(f => filterRating === 0 || f.overallRating >= filterRating)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.overallRating - a.overallRating
      if (sortBy === 'newest') return new Date(b.updatedAt) - new Date(a.updatedAt)
      if (sortBy === 'time') return (b.timeSpent || 0) - (a.timeSpent || 0)
      return 0
    })

  const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: Object.values(feedback).filter(f => f.overallRating === r).length,
  }))

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">⭐ Rating Wall</h2>
          <p className="text-slate-400 text-sm">All your prototype feedback and lessons learned</p>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          + Add Feedback
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: '⭐', label: 'Avg Rating', value: stats.avgRating + '/5', color: 'text-yellow-400' },
          { icon: '📝', label: 'Reviews', value: stats.total, color: 'text-indigo-400' },
          { icon: '🔁', label: 'Would Rebuild', value: stats.wouldRebuild, color: 'text-green-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-600 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">No feedback yet</h3>
          <p className="text-slate-500 text-sm mb-6">
            Go to a prototype in 3D Viewer and add feedback to see it here
          </p>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            Go to History
          </button>
        </div>
      ) : (
        <>
          {/* Rating distribution */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">Rating Distribution</h3>
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex gap-0.5 w-20 shrink-0">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className="text-xs" style={{ color: s <= stars ? '#f59e0b' : '#374151' }}>★</span>
                    ))}
                  </div>
                  <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
                    <div
                      className="h-2 bg-yellow-500 rounded-full transition-all"
                      style={{ width: stats.total > 0 ? (count / stats.total * 100) + '%' : '0%' }}
                    />
                  </div>
                  <span className="text-slate-500 text-xs w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none"
            >
              <option value="rating">Sort by Rating</option>
              <option value="newest">Sort by Newest</option>
              <option value="time">Sort by Time Spent</option>
            </select>
            <select
              value={filterRating}
              onChange={e => setFilterRating(Number(e.target.value))}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars Only</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map(f => {
              const project = projects.find(p => p.idea === f.idea)
              return (
                <FeedbackCard
                  key={f.idea}
                  feedback={f}
                  project={project}
                  onDelete={handleDelete}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default RatingWall