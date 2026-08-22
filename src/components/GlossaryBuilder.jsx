import { useState } from 'react'
import { buildGlossary, saveGlossary, getGlossary } from '../services/glossaryService'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Hardware: '#6366f1', Software: '#22c55e', Protocol: '#0ea5e9',
  Electrical: '#f59e0b', Mechanical: '#a855f7', General: '#64748b',
}

function GlossaryBuilder({ idea, components }) {
  const [result, setResult] = useState(getGlossary(idea))
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [expanded, setExpanded] = useState(null)

  async function handleBuild() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await buildGlossary(idea, components)
      setResult(data)
      saveGlossary(idea, data)
      notify.success(data.terms?.length + ' terms defined!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleExport() {
    const terms = result?.terms || []
    const lines = ['# Glossary\n']
    terms.sort(function(a, b) { return a.term.localeCompare(b.term) }).forEach(function(t) {
      lines.push('## ' + t.term + (t.acronym ? ' (' + t.acronym + ')' : ''))
      lines.push('**Category:** ' + t.category)
      lines.push(t.definition)
      if (t.relatedTerms?.length) lines.push('**See also:** ' + t.relatedTerms.join(', '))
      lines.push('')
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'GLOSSARY.md'; link.click()
    URL.revokeObjectURL(url)
    notify.success('Glossary exported!')
  }

  const terms = result?.terms || []
  const categories = ['All', ...new Set(terms.map(function(t) { return t.category }).filter(Boolean))]
  const filtered = terms.filter(function(t) {
    const matchSearch = !search || t.term.toLowerCase().includes(search.toLowerCase()) ||
      (t.acronym || '').toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'All' || t.category === filterCat
    return matchSearch && matchCat
  }).sort(function(a, b) { return a.term.localeCompare(b.term) })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Build a searchable technical glossary for your prototype documentation</p>
        <button onClick={handleBuild} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Building...' : 'Build Glossary'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building glossary...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-2">
            <input value={search} onChange={function(e) { setSearch(e.target.value) }}
              placeholder="Search terms..."
              className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-slate-500" />
            <button onClick={handleExport}
              className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
              Export
            </button>
          </div>

          <div className="flex gap-1 flex-wrap">
            {categories.map(function(cat) {
              const color = CATEGORY_COLORS[cat] || '#64748b'
              return (
                <button key={cat} onClick={function() { setFilterCat(cat) }}
                  className={'text-xs px-2 py-1 rounded-lg border transition ' + (filterCat === cat ? 'text-white' : 'bg-[#13131f] text-slate-500 border-[#2e2e4e]')}
                  style={filterCat === cat ? { backgroundColor: color, borderColor: color } : {}}>
                  {cat} {cat === 'All' ? '(' + terms.length + ')' : ''}
                </button>
              )
            })}
          </div>

          <div className="space-y-1">
            {filtered.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-4">No terms match your search</p>
            ) : (
              filtered.map(function(term, i) {
                const color = CATEGORY_COLORS[term.category] || '#64748b'
                const isExp = expanded === i
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                    <button onClick={function() { setExpanded(isExp ? null : i) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1e1e2e] transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold text-sm">{term.term}</p>
                          {term.acronym && (
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: color + '20', color }}>{term.acronym}</span>
                          )}
                          <span className="text-xs text-slate-600">{term.category}</span>
                        </div>
                        {!isExp && <p className="text-slate-500 text-xs line-clamp-1">{term.definition}</p>}
                      </div>
                      <span className="text-slate-600 shrink-0">{isExp ? '-' : '+'}</span>
                    </button>
                    {isExp && (
                      <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3 space-y-2">
                        <p className="text-slate-300 text-sm">{term.definition}</p>
                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-slate-500 text-xs">See also:</span>
                            {term.relatedTerms.map(function(rt, j) {
                              return <span key={j} className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-0.5 rounded-full cursor-pointer hover:text-white"
                                onClick={function() { setSearch(rt) }}>{rt}</span>
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <button onClick={handleBuild} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild Glossary</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📖</div>
          <p className="text-white font-semibold mb-1">Glossary Builder</p>
          <p className="text-slate-500 text-sm">Build a searchable technical glossary for your prototype</p>
        </div>
      )}
    </div>
  )
}

export default GlossaryBuilder
