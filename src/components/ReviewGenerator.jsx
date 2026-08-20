import { useState } from 'react'
import { generateReviews, saveReviews, getReviews } from '../services/reviewGeneratorService'
import { notify } from '../services/toast'

const AVATARS = ['👨‍💻', '👩‍🔬', '🧑‍🔧', '👨‍🎓', '👩‍💼', '🧑‍🏭']

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(function(i) {
        return <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-slate-700'}>★</span>
      })}
    </div>
  )
}

function ReviewGeneratorComp({ idea, components }) {
  const [result, setResult] = useState(getReviews(idea))
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState(0)

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateReviews(idea, components)
      setResult(data)
      saveReviews(idea, data)
      notify.success('Reviews generated!')
    } catch { notify.error('Generation failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const reviews = result?.reviews || []
  const avgRating = reviews.length > 0 ? (reviews.reduce(function(sum, r) { return sum + (r.rating || 0) }, 0) / reviews.length).toFixed(1) : 0
  const filtered = filter === 0 ? reviews : reviews.filter(function(r) { return r.rating === filter })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate realistic product reviews to understand how users might perceive your prototype</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '⭐ Generating...' : '⭐ Generate Reviews'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Generating product reviews...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-black text-yellow-400">{avgRating}</p>
              <StarDisplay rating={Math.round(parseFloat(avgRating))} />
              <p className="text-slate-500 text-xs">{reviews.length} reviews</p>
            </div>
            <div className="flex-1">
              {[5,4,3,2,1].map(function(star) {
                const count = reviews.filter(function(r) { return r.rating === star }).length
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 w-4">{star}</span>
                    <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                      <div className="h-1.5 bg-yellow-500 rounded-full" style={{ width: pct + '%' }} />
                    </div>
                    <span className="text-xs text-slate-600 w-4">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-1">
            {[0,5,4,3,2,1].map(function(star) {
              return (
                <button key={star} onClick={function() { setFilter(star) }}
                  className={'text-xs px-2 py-1 rounded-lg border transition ' + (
                    filter === star ? 'bg-yellow-700 text-white border-yellow-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]'
                  )}>
                  {star === 0 ? 'All' : star + '★'}
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {filtered.map(function(review, i) {
              const avatar = AVATARS[i % AVATARS.length]
              return (
                <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl shrink-0">{avatar}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">{review.author}</p>
                        {review.verified && <span className="text-xs bg-green-950 text-green-400 border border-green-800 px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                        <span className="text-slate-500 text-xs ml-auto">{review.date}</span>
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>
                  </div>
                  <p className="text-white font-medium text-sm mb-1">{review.title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-2">{review.body}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {review.pros && review.pros.length > 0 && (
                      <div>
                        <p className="text-green-400 font-semibold mb-0.5">Pros:</p>
                        {review.pros.map(function(p, j) { return <p key={j} className="text-slate-300">+ {p}</p> })}
                      </div>
                    )}
                    {review.cons && review.cons.length > 0 && (
                      <div>
                        <p className="text-red-400 font-semibold mb-0.5">Cons:</p>
                        {review.cons.map(function(c, j) { return <p key={j} className="text-slate-400">- {c}</p> })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Generate New Reviews</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-white font-semibold mb-1">AI Review Generator</p>
          <p className="text-slate-500 text-sm">Generate realistic user reviews to understand how people will perceive your prototype</p>
        </div>
      )}
    </div>
  )
}

export default ReviewGeneratorComp
