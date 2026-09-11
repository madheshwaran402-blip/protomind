import { useState } from 'react'
import { buildKnowledgeBase, saveKnowledgeBase, getKnowledgeBase } from '../services/knowledgeBaseService'
import { notify } from '../services/toast'

const CAT_COLORS = {
  Setup: '#6366f1', Troubleshooting: '#ef4444', Hardware: '#f59e0b',
  Software: '#22c55e', FAQ: '#0ea5e9', Advanced: '#a855f7',
}

function KnowledgeBaseBuilder({ idea, components }) {
  const [result, setResult] = useState(getKnowledgeBase(idea))
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [expanded, setExpanded] = useState(null)

  async function handleBuild() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await buildKnowledgeBase(idea, components)
      setResult(data)
      saveKnowledgeBase(idea, data)
      notify.success((data.articles?.length || 0) + ' knowledge base articles created!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleExport() {
    if (!result) return
    const parts = ['# Knowledge Base']
    ;(result.articles || []).forEach(function(a) {
      parts.push('## ' + a.title)
      parts.push('Category: ' + a.category)
      parts.push('Tags: ' + (a.tags || []).join(', '))
      parts.push('')
      parts.push(a.content)
      parts.push('---')
    })
    const blob = new Blob([parts.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'knowledge_base.md'; link.click()
    URL.revokeObjectURL(url)
    notify.success('Knowledge base exported!')
  }

  const articles = result?.articles || []
  const categories = ['All', ...new Set(articles.map(function(a) { return a.category }).filter(Boolean))]
  const filtered = articles.filter(function(a) {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      (a.tags || []).some(function(t) { return t.toLowerCase().includes(search.toLowerCase()) })
    const matchCat = filterCat === 'All' || a.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Build a searchable knowledge base with setup guides, FAQs and troubleshooting</p>
        <button onClick={handleBuild} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Building...' : 'Build KB'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building knowledge base...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-2">
            <input value={search} onChange={function(e) { setSearch(e.target.value) }}
              placeholder="Search articles..."
              className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-teal-500" />
            <button onClick={handleExport} className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">Export</button>
          </div>

          <div className="flex gap-1 flex-wrap">
            {categories.map(function(cat) {
              const color = CAT_COLORS[cat] || '#6366f1'
              return (
                <button key={cat} onClick={function() { setFilterCat(cat) }}
                  className={'text-xs px-2 py-1 rounded-lg border transition ' + (filterCat === cat ? 'text-white' : 'bg-[#13131f] text-slate-500 border-[#2e2e4e]')}
                  style={filterCat === cat ? { backgroundColor: color, borderColor: color } : {}}>
                  {cat} {cat === 'All' ? '(' + articles.length + ')' : ''}
                </button>
              )
            })}
          </div>

          <div className="space-y-1">
            {filtered.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-4">No articles match your search</p>
            ) : (
              filtered.map(function(article, i) {
                const color = CAT_COLORS[article.category] || '#6366f1'
                const isExp = expanded === i
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                    <button onClick={function() { setExpanded(isExp ? null : i) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1e1e2e] transition">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{article.title}</p>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-xs" style={{ color }}>{article.category}</span>
                          {(article.tags || []).slice(0, 3).map(function(tag, j) {
                            return <span key={j} className="text-xs text-slate-600">#{tag}</span>
                          })}
                        </div>
                      </div>
                      <span className="text-slate-600 shrink-0">{isExp ? '-' : '+'}</span>
                    </button>
                    {isExp && (
                      <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#1e1e2e] pt-3">
                        <p className="text-slate-300 text-sm leading-relaxed">{article.content}</p>
                        {article.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {article.tags.map(function(tag, j) {
                              return (
                                <button key={j} onClick={function() { setSearch(tag) }}
                                  className="text-xs bg-[#13131f] text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full hover:bg-teal-950 transition">
                                  #{tag}
                                </button>
                              )
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

          <button onClick={handleBuild} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Rebuild KB</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-white font-semibold mb-1">Knowledge Base Builder</p>
          <p className="text-slate-500 text-sm">Build a searchable KB with setup guides, troubleshooting and FAQs</p>
        </div>
      )}
    </div>
  )
}

export default KnowledgeBaseBuilder
