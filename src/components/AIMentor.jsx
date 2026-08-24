import { useState } from 'react'
import {
  getMentorSession,
  MENTOR_TOPICS,
  saveMentorHistory,
  getMentorHistory,
} from '../services/aiMentorService'
import { notify } from '../services/toast'

function AIMentor({ idea, components }) {
  const [question, setQuestion] = useState('')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState(getMentorHistory(idea))
  const [activeTab, setActiveTab] = useState('ask')

  async function handleAsk(q) {
    const text = q || question
    if (!text.trim()) {
      notify.warning('Ask a question first')
      return
    }
    setLoading(true)
    setSession(null)
    try {
      const data = await getMentorSession(idea, components, text)
      setSession({ ...data, question: text })
      saveMentorHistory(idea, { ...data, question: text })
      setHistory(getMentorHistory(idea))
      setQuestion('')
      setActiveTab('answer')
      notify.success('Mentor answered!')
    } catch {
      notify.error('Mentor unavailable — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'ask', label: '❓ Ask' },
    { id: 'answer', label: '📖 Answer' },
    { id: 'history', label: '📚 History' },
  ]

  return (
    <div className="space-y-4">
        <span className="text-2xl">🎊</span>
      </div>

      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
        {TABS.map(function(tab) {
          return (
            <button key={tab.id}
              onClick={function() { setActiveTab(tab.id) }}
              className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              )}>
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'ask' && (
        <div className="space-y-3">
          <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4 flex gap-3">
            <span className="text-3xl shrink-0">🧑‍🏫</span>
            <div>
              <p className="text-indigo-300 font-semibold text-sm">AI Mentor</p>
              <p className="text-slate-400 text-xs">Ask me anything about your prototype — I give structured lessons with analogies and examples</p>
            </div>
          </div>

          <textarea
            value={question}
            onChange={function(e) { setQuestion(e.target.value) }}
            placeholder="What would you like to learn about your prototype?"
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none"
            rows={3}
          />

          <p className="text-xs text-slate-500">Quick topics:</p>
          <div className="flex flex-wrap gap-1">
            {MENTOR_TOPICS.slice(0, 4).map(function(topic, i) {
              return (
                <button key={i}
                  onClick={function() { handleAsk(topic) }}
                  className="text-xs px-2 py-1.5 bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-600 text-slate-400 hover:text-white rounded-xl transition">
                  {topic}
                </button>
              )
            })}
          </div>

          <button
            onClick={function() { handleAsk() }}
            disabled={loading || !question.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? '🧑‍🏫 Thinking...' : '🧑‍🏫 Ask Mentor'}
          </button>

          {loading && (
            <div className="flex items-center justify-center py-6 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Mentor is preparing your lesson...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'answer' && session && (
        <div className="space-y-3">
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">Your question:</p>
            <p className="text-white text-sm font-medium">{session.question}</p>
          </div>

          <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
            <p className="text-indigo-400 text-xs font-semibold mb-2">📖 Answer</p>
            <p className="text-slate-300 text-sm leading-relaxed">{session.answer}</p>
          </div>

          {session.analogy && (
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-semibold mb-2">💡 Think of it like this...</p>
              <p className="text-slate-300 text-sm">{session.analogy}</p>
            </div>
          )}

          {session.deeepDive && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-slate-400 text-xs font-semibold mb-2">🔬 Deep Dive</p>
              <p className="text-slate-400 text-sm">{session.deeepDive}</p>
            </div>
          )}

          {session.commonMistakes && session.commonMistakes.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold mb-2">⚠️ Common Mistakes</p>
              <ul className="space-y-1">
                {session.commonMistakes.map(function(m, i) {
                  return (
                    <li key={i} className="text-red-200 text-xs flex items-start gap-1">
                      <span className="shrink-0">•</span> {m}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {session.nextTopics && session.nextTopics.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-slate-500 text-xs font-semibold mb-2">📚 Learn Next</p>
              <div className="flex flex-wrap gap-1">
                {session.nextTopics.map(function(topic, i) {
                  return (
                    <button key={i}
                      onClick={function() { setQuestion(topic); setActiveTab('ask') }}
                      className="text-xs px-2 py-1 bg-[#0d0d1a] border border-[#2e2e4e] hover:border-indigo-600 text-slate-400 hover:text-white rounded-lg transition">
                      {topic} →
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            onClick={function() { setActiveTab('ask') }}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ← Ask Another Question
          </button>
        </div>
      )}

      {activeTab === 'answer' && !session && (
        <div className="text-center py-8 text-slate-500">
          <p>No answer yet — go to Ask tab to ask a question</p>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">No questions asked yet</p>
          ) : (
            history.map(function(item, i) {
              return (
                <div key={i}
                  onClick={function() { setSession(item); setActiveTab('answer') }}
                  className="bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-700 rounded-xl p-3 cursor-pointer transition">
                  <p className="text-white text-xs font-medium">{item.question}</p>
                  <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{item.answer}</p>
                  {item.timestamp && (
                    <p className="text-slate-700 text-xs mt-1">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default AIMentor