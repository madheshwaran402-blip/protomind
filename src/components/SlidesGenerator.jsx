import { useState } from 'react'
import { generateSlides, buildHTMLPresentation } from '../services/slidesService'
import { notify } from '../services/toast'

const SLIDE_TYPE_ICONS = {
  title: '🎯',
  problem: '❓',
  solution: '💡',
  components: '🔧',
  circuit: '⚡',
  cost: '💰',
  demo: '🎬',
  future: '🚀',
  conclusion: '🏁',
  technical: '📐',
  default: '📊',
}

function SlidePreview({ slide, index, total, isActive, onClick }) {
  const icon = SLIDE_TYPE_ICONS[slide.type] || SLIDE_TYPE_ICONS.default

  return (
    <div
      onClick={onClick}
      className={'flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition ' + (
        isActive
          ? 'bg-indigo-950 border-indigo-700'
          : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-800'
      )}
    >
      <div className={'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ' + (
        isActive ? 'bg-indigo-600 text-white' : 'bg-[#0d0d1a] text-slate-500'
      )}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-sm">{icon}</span>
          <p className={'text-xs font-medium truncate ' + (isActive ? 'text-white' : 'text-slate-400')}>
            {slide.title}
          </p>
        </div>
        {slide.content && (
          <p className="text-slate-600 text-xs line-clamp-1">{slide.content}</p>
        )}
      </div>
    </div>
  )
}

function SlideView({ slide, index, total, deckTitle }) {
  const icon = SLIDE_TYPE_ICONS[slide.type] || SLIDE_TYPE_ICONS.default

  return (
    <div className="bg-gradient-to-br from-[#0d0d1a] to-[#0a0a0f] border border-[#2e2e4e] rounded-2xl p-8 flex flex-col items-center justify-center min-h-64 relative">
      <div className="absolute top-3 right-4 text-slate-600 text-xs">
        {index + 1} / {total}
      </div>

      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-white font-black text-xl text-center mb-4" style={{
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {slide.title}
      </h3>

      {slide.content && (
        <p className="text-slate-400 text-sm text-center max-w-lg leading-relaxed mb-4">
          {slide.content}
        </p>
      )}

      {slide.bullets && slide.bullets.length > 0 && (
        <ul className="space-y-2 w-full max-w-md">
          {slide.bullets.slice(0, 5).map(function(bullet, i) {
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-indigo-400 shrink-0 mt-0.5">→</span>
                <span className="text-slate-300">{bullet}</span>
              </li>
            )
          })}
        </ul>
      )}

      {slide.highlight && (
        <div className="mt-4 bg-indigo-950 border border-indigo-800 rounded-xl px-6 py-3 text-indigo-300 font-bold text-base text-center">
          {slide.highlight}
        </div>
      )}

      {slide.notes && (
        <div className="absolute bottom-3 left-4 right-4 bg-[#13131f] border border-[#2e2e4e] rounded-lg px-3 py-2">
          <p className="text-slate-600 text-xs">🎙️ {slide.notes}</p>
        </div>
      )}
    </div>
  )
}

function SlidesGenerator({ idea, components }) {
  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [presenting, setPresenting] = useState(false)

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setDeck(null)
    setActiveSlide(0)
    try {
      const data = await generateSlides(idea, components)
      setDeck(data)
      notify.success('Slide deck ready — ' + (data.slides || []).length + ' slides generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!deck) return
    const html = buildHTMLPresentation(deck, idea, components)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = (deck.title || 'ProtoMind_Slides').replace(/[^a-zA-Z0-9]/g, '_') + '.html'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Slide deck downloaded as HTML!')
  }

  function handlePresent() {
    if (!deck) return
    const html = buildHTMLPresentation(deck, idea, components)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    notify.success('Opening presentation in new tab!')
  }

  function navigateSlide(dir) {
    const slides = deck?.slides || []
    setActiveSlide(function(prev) {
      return Math.max(0, Math.min(slides.length - 1, prev + dir))
    })
  }

  const slides = deck?.slides || []
  const currentSlide = slides[activeSlide]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">
          AI generates a complete slide deck presentation for your prototype
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🎯 Creating...' : '🎯 Generate Slides'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is creating your slide deck...</p>
        </div>
      )}

      {deck && !loading && (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white font-black text-lg">{deck.title}</h3>
                <p className="text-purple-300 text-sm mt-0.5">{deck.subtitle}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {slides.length} slides · Presenter: {deck.presenter || 'ProtoMind Builder'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handlePresent}
                  className="px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition"
                >
                  ▶️ Present
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          </div>

          {/* Slide preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Slide thumbnails */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                All Slides ({slides.length})
              </p>
              {slides.map(function(slide, i) {
                return (
                  <SlidePreview
                    key={slide.id || i}
                    slide={slide}
                    index={i}
                    total={slides.length}
                    isActive={activeSlide === i}
                    onClick={function() { setActiveSlide(i) }}
                  />
                )
              })}
            </div>

            {/* Active slide view */}
            <div className="lg:col-span-2 space-y-3">
              {currentSlide && (
                <SlideView
                  slide={currentSlide}
                  index={activeSlide}
                  total={slides.length}
                  deckTitle={deck.title}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={function() { navigateSlide(-1) }}
                  disabled={activeSlide === 0}
                  className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition disabled:opacity-30"
                >
                  ← Prev
                </button>
                <div className="flex-1 flex justify-center gap-1 flex-wrap">
                  {slides.map(function(_, i) {
                    return (
                      <button
                        key={i}
                        onClick={function() { setActiveSlide(i) }}
                        className={'w-2 h-2 rounded-full transition ' + (
                          i === activeSlide ? 'bg-indigo-500' : 'bg-[#2e2e4e] hover:bg-slate-500'
                        )}
                      />
                    )
                  })}
                </div>
                <button
                  onClick={function() { navigateSlide(1) }}
                  disabled={activeSlide === slides.length - 1}
                  className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-3">
            <p className="text-indigo-400 text-xs">
              💡 Click ▶️ Present to open a full-screen interactive presentation in your browser.
              Use ← → arrow keys or Space to navigate slides.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Slides
          </button>
        </>
      )}

      {!deck && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-white font-semibold mb-1">Slide Deck Generator</p>
          <p className="text-slate-500 text-sm mb-4">
            AI creates a professional presentation about your prototype
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ 8-12 slides</span>
            <span>✓ Speaker notes</span>
            <span>✓ Interactive HTML</span>
            <span>✓ Arrow key navigation</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SlidesGenerator