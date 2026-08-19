import { useState } from 'react'
import { generateNames, saveFavoriteNames, getFavoriteNames } from '../services/namingService'
import { notify } from '../services/toast'

const STYLE_COLORS = {
  Technical: '#6366f1',
  Playful: '#f59e0b',
  Professional: '#0ea5e9',
  Creative: '#a855f7',
  Minimalist: '#14b8a6',
  Bold: '#ef4444',
}

function NamingGenerator({ idea, components }) {
  const saved = getFavoriteNames(idea)
  const [names, setNames] = useState(saved || null)
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [filterStyle, setFilterStyle] = useState('All')

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await generateNames(idea, components)
      setNames(data.names)
      notify.success(data.names?.length + ' names generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function toggleFavorite(name) {
    setFavorites(function(prev) {
      if (prev.includes(name)) return prev.filter(function(n) { return n !== name })
      const next = prev.concat([name])
      saveFavoriteNames(idea, next)
      return next
    })
  }

  function handleCopy(name) {
    navigator.clipboard.writeText(name)
    notify.success(name + ' copied!')
  }

  const styles = ['All', ...new Set((names || []).map(function(n) { return n.style }).filter(Boolean))]

  const filtered = filterStyle === 'All'
    ? (names || [])
    : (names || []).filter(function(n) { return n.style === filterStyle })

  const sorted = [...filtered].sort(function(a, b) { return (b.score || 0) - (a.score || 0) })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">AI generates creative product names with taglines for your prototype</p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '✨ Creating...' : '✨ Generate Names'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Brainstorming names...</p>
        </div>
      )}

      {names && !loading && (
        <>
          <div className="flex gap-1 flex-wrap">
            {styles.map(function(style) {
              const color = STYLE_COLORS[style] || '#6366f1'
              return (
                <button
                  key={style}
                  onClick={function() { setFilterStyle(style) }}
                  className={'text-xs px-3 py-1.5 rounded-xl border transition ' + (
                    filterStyle === style ? 'text-white' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]'
                  )}
                  style={filterStyle === style ? { backgroundColor: color, borderColor: color } : {}}
                >
                  {style}
                </button>
              )
            })}
          </div>

          {favorites.length > 0 && (
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3">
              <p className="text-yellow-400 text-xs font-semibold mb-2">⭐ Favorites</p>
              <div className="flex flex-wrap gap-1">
                {favorites.map(function(name) {
                  return (
                    <span key={name}
                      onClick={function() { handleCopy(name) }}
                      className="text-sm font-bold text-yellow-300 bg-yellow-900 px-3 py-1 rounded-full cursor-pointer hover:bg-yellow-800 transition">
                      {name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sorted.map(function(nameObj, i) {
              const color = STYLE_COLORS[nameObj.style] || '#6366f1'
              const isFav = favorites.includes(nameObj.name)
              return (
                <div key={nameObj.name || i}
                  className="bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-700 rounded-xl p-4 transition">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white font-black text-lg">{nameObj.name}</p>
                      {nameObj.tagline && (
                        <p className="text-slate-400 text-xs italic">{nameObj.tagline}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={function() { toggleFavorite(nameObj.name) }}
                        className={'text-lg transition ' + (isFav ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400')}>
                        ⭐
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {nameObj.style && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: color + '20', color }}>
                        {nameObj.style}
                      </span>
                    )}
                    {nameObj.domain !== undefined && (
                      <span className={'text-xs ' + (nameObj.domain ? 'text-green-400' : 'text-red-400')}>
                        {nameObj.domain ? '✓ .com likely available' : '✗ .com taken'}
                      </span>
                    )}
                    {nameObj.score && (
                      <div className="ml-auto flex items-center gap-1">
                        <div className="w-12 bg-[#1e1e2e] rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: nameObj.score + '%', backgroundColor: color }} />
                        </div>
                        <span className="text-xs" style={{ color }}>{nameObj.score}</span>
                      </div>
                    )}
                  </div>

                  {nameObj.reasoning && (
                    <p className="text-slate-500 text-xs mb-2">{nameObj.reasoning}</p>
                  )}

                  <button onClick={function() { handleCopy(nameObj.name) }}
                    className="w-full py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-400 rounded-lg text-xs transition">
                    📋 Copy Name
                  </button>
                </div>
              )
            })}
          </div>

          <button onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Generate More Names
          </button>
        </>
      )}

      {!names && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">✨</div>
          <p className="text-white font-semibold mb-1">AI Naming Generator</p>
          <p className="text-slate-500 text-sm">Generate creative product names with taglines and domain availability</p>
        </div>
      )}
    </div>
  )
}

export default NamingGenerator