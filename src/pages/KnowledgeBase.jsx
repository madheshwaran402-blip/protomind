import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_CATEGORIES } from '../data/knowledgeBase'
import { notify } from '../services/toast'

const DIFFICULTY_COLORS = {
  Beginner: 'text-green-400 bg-green-950 border-green-800',
  Intermediate: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Advanced: 'text-red-400 bg-red-950 border-red-800',
}

const CATEGORY_ICONS = {
  Circuits: '⚡',
  Components: '🔧',
  Protocols: '📡',
  Troubleshooting: '🔍',
  Code: '💻',
  Motors: '⚙️',
  Sensors: '📊',
  Setup: '🛠️',
}

async function askAIQuestion(question) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics engineer. Answer this question clearly and concisely for a hobbyist maker.\n\nQuestion: ' + question + '\n\nProvide a helpful answer in 3-5 sentences. If there is a key formula, include it. Be practical and specific.',
      stream: false,
    }),
  })

  const data = await response.json()
  return data.response || 'No answer received'
}

function ArticleCard({ article, onClick }) {
  const diffClass = DIFFICULTY_COLORS[article.difficulty] || DIFFICULTY_COLORS.Beginner
  const catIcon = CATEGORY_ICONS[article.category] || '📚'

  return (
    <div
      className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-5 cursor-pointer transition"
      onClick={function() { onClick(article) }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{catIcon}</span>
          <span className="text-xs text-slate-500">{article.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={'text-xs px-2 py-0.5 rounded-full border ' + diffClass}>
            {article.difficulty}
          </span>
          <span className="text-xs text-slate-600">{article.readTime}</span>
        </div>
      </div>
      <h3 className="text-white font-semibold text-sm mb-2 leading-tight">{article.title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{article.content}</p>
      {article.tags && (
        <div className="flex flex-wrap gap-1 mt-3">
          {article.tags.slice(0, 3).map(function(tag, i) {
            return (
              <span key={i} className="text-xs bg-[#13131f] text-slate-600 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ArticleModal({ article, onClose }) {
  if (!article) return null
  const diffClass = DIFFICULTY_COLORS[article.difficulty] || DIFFICULTY_COLORS.Beginner
  const catIcon = CATEGORY_ICONS[article.category] || '📚'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={function(e) { e.stopPropagation() }}
      >
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span>{catIcon}</span>
              <span className="text-slate-500 text-xs">{article.category}</span>
              <span className={'text-xs px-2 py-0.5 rounded-full border ' + diffClass}>
                {article.difficulty}
              </span>
            </div>
            <h2 className="text-white font-bold text-base leading-tight">{article.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white shrink-0">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">{article.content}</p>
          {article.formula && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">📐 Formula / Code</p>
              <code className="text-indigo-200 text-sm font-mono">{article.formula}</code>
            </div>
          )}
          {article.tags && (
            <div className="flex flex-wrap gap-1">
              {article.tags.map(function(tag, i) {
                return (
                  <span key={i} className="text-xs bg-[#13131f] text-slate-500 border border-[#2e2e4e] px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[#1e1e2e]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function KnowledgeBase() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHistory, setAiHistory] = useState([])
  const [activeTab, setActiveTab] = useState('articles')

  const filtered = KNOWLEDGE_ARTICLES.filter(function(article) {
    const matchSearch = !search ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some(function(tag) { return tag.includes(search.toLowerCase()) }) ||
      article.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || article.category === activeCategory
    return matchSearch && matchCat
  })

  async function handleAskAI() {
    if (!aiQuestion.trim()) {
      notify.warning('Type a question first')
      return
    }
    setAiLoading(true)
    setAiAnswer('')
    try {
      const answer = await askAIQuestion(aiQuestion)
      setAiAnswer(answer)
      setAiHistory(function(prev) {
        return [{ question: aiQuestion, answer, time: new Date().toISOString() }].concat(prev.slice(0, 4))
      })
    } catch {
      notify.error('AI failed — is Ollama running?')
    } finally {
      setAiLoading(false)
    }
  }

  const TABS = [
    { id: 'articles', label: '📚 Articles (' + KNOWLEDGE_ARTICLES.length + ')' },
    { id: 'ask', label: '🤖 Ask AI' },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">📚 Knowledge Base</h2>
          <p className="text-slate-400 text-sm">
            {KNOWLEDGE_ARTICLES.length} articles · Common electronics questions answered
          </p>
        </div>
        <button
          onClick={function() { navigate('/help') }}
          className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition"
        >
          🆘 Help →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 mb-6 max-w-sm">
        {TABS.map(function(tab) {
          return (
            <button
              key={tab.id}
              onClick={function() { setActiveTab(tab.id) }}
              className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'articles' && (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              value={search}
              onChange={function(e) { setSearch(e.target.value) }}
              placeholder="Search articles, tags, topics..."
              className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 placeholder-slate-600"
              autoFocus
            />
            {search && (
              <button
                onClick={function() { setSearch('') }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap mb-4">
            {KNOWLEDGE_CATEGORIES.map(function(cat) {
              const icon = CATEGORY_ICONS[cat] || ''
              return (
                <button
                  key={cat}
                  onClick={function() { setActiveCategory(cat) }}
                  className={'text-xs px-3 py-1.5 rounded-xl border transition ' + (
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-600'
                  )}
                >
                  {icon} {cat}
                </button>
              )
            })}
          </div>

          <p className="text-slate-600 text-xs mb-4">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            {search && ' matching "' + search + '"'}
            {activeCategory !== 'All' && ' in ' + activeCategory}
          </p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(function(article) {
                return (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={setSelectedArticle}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-3">📚</div>
              <p className="font-semibold mb-1">No articles found</p>
              <p className="text-sm mb-4">Try the AI Q&A tab for custom answers</p>
              <button
                onClick={function() { setSearch(''); setActiveCategory('All') }}
                className="text-indigo-400 text-sm"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'ask' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Ask Any Electronics Question</p>
            <textarea
              value={aiQuestion}
              onChange={function(e) { setAiQuestion(e.target.value) }}
              placeholder="e.g. How do I connect a 5V sensor to a 3.3V ESP32 safely? What resistor do I need for a blue LED at 3.3V? Why does my motor cause interference?"
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
              rows={3}
            />

            {/* Example questions */}
            <div className="flex flex-wrap gap-2 mt-3 mb-4">
              {[
                'What is PWM?',
                'How to reduce noise in analog readings?',
                'ESP32 vs Arduino Nano — which should I use?',
                'How to wire an I2C display?',
              ].map(function(q, i) {
                return (
                  <button
                    key={i}
                    onClick={function() { setAiQuestion(q); setAiAnswer('') }}
                    className="text-xs px-3 py-1.5 bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-600 text-slate-400 hover:text-white rounded-xl transition"
                  >
                    {q}
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleAskAI}
              disabled={aiLoading || !aiQuestion.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              {aiLoading ? '🤖 Thinking...' : '🤖 Ask AI'}
            </button>
          </div>

          {aiLoading && (
            <div className="flex items-center gap-3 py-6 justify-center bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">AI is thinking...</p>
            </div>
          )}

          {aiAnswer && !aiLoading && (
            <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤖</span>
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wide">AI Answer</p>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{aiAnswer}</p>
              <button
                onClick={function() {
                  navigator.clipboard.writeText(aiAnswer)
                  notify.success('Answer copied!')
                }}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                📋 Copy answer
              </button>
            </div>
          )}

          {aiHistory.length > 0 && (
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Recent Questions</p>
              <div className="space-y-3">
                {aiHistory.map(function(item, i) {
                  return (
                    <div
                      key={i}
                      className="cursor-pointer hover:bg-[#13131f] rounded-lg p-2 transition"
                      onClick={function() { setAiQuestion(item.question); setAiAnswer(item.answer) }}
                    >
                      <p className="text-white text-xs font-medium">{item.question}</p>
                      <p className="text-slate-500 text-xs line-clamp-1">{item.answer}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={function() { setSelectedArticle(null) }}
        />
      )}
    </div>
  )
}

export default KnowledgeBase