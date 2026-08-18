import { useState } from 'react'
import { reviewCode } from '../services/codeReviewService'
import { notify } from '../services/toast'

const SEVERITY_STYLES = {
  Critical: 'text-red-400 bg-red-950 border-red-800',
  High: 'text-orange-400 bg-orange-950 border-orange-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-blue-400 bg-blue-950 border-blue-800',
}

const GRADE_COLORS = {
  A: '#22c55e', B: '#0ea5e9', C: '#f59e0b', D: '#f97316', F: '#ef4444',
}

const LANGUAGES = [
  { value: 'Arduino C++', label: '🔵 Arduino' },
  { value: 'MicroPython', label: '🐍 MicroPython' },
  { value: 'CircuitPython', label: '🔴 CircuitPython' },
  { value: 'Python', label: '🟢 Python' },
  { value: 'JavaScript', label: '🟡 JavaScript' },
]

function CodeReviewer({ idea, components }) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('Arduino C++')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('issues')

  async function handleReview() {
    if (!code.trim()) {
      notify.warning('Paste your code first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await reviewCode(code, language, idea, components)
      setResult(data)
      setActiveTab('issues')
      notify.success('Code reviewed — Grade: ' + data.grade)
    } catch {
      notify.error('Review failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const gradeColor = result ? (GRADE_COLORS[result.grade] || '#6366f1') : '#6366f1'

  const TABS = [
    { id: 'issues', label: '🐛 Issues' },
    { id: 'improvements', label: '✨ Improve' },
    { id: 'positives', label: '✅ Good' },
    { id: 'optimized', label: '⚡ Optimized' },
  ]

  return (
    <div className="space-y-4">
      {/* Language selector */}
      <div className="flex gap-1 flex-wrap">
        {LANGUAGES.map(function(lang) {
          return (
            <button key={lang.value}
              onClick={function() { setLanguage(lang.value) }}
              className={'text-xs px-3 py-1.5 rounded-xl border transition ' + (
                language === lang.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
              )}>
              {lang.label}
            </button>
          )
        })}
      </div>

      {/* Code input */}
      <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-500 text-xs ml-2">{language}</span>
          {code && (
            <button onClick={function() { setCode(''); setResult(null) }}
              className="ml-auto text-xs text-slate-500 hover:text-white">
              Clear
            </button>
          )}
        </div>
        <textarea
          value={code}
          onChange={function(e) { setCode(e.target.value) }}
          placeholder={'// Paste your ' + language + ' code here to review...'}
          className="w-full bg-[#0a0a0f] px-4 py-3 text-green-400 text-xs font-mono outline-none resize-none placeholder-slate-700"
          rows={10}
          spellCheck={false}
        />
      </div>

      <button
        onClick={handleReview}
        disabled={loading || !code.trim()}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? '🔍 Reviewing...' : '🔍 Review Code'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is reviewing your code...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Grade card */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shrink-0"
              style={{ backgroundColor: gradeColor + '20', color: gradeColor, border: '2px solid ' + gradeColor }}>
              {result.grade}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-white font-bold text-lg">Score: {result.overallScore}/100</p>
              </div>
              <div className="w-full bg-[#1e1e2e] rounded-full h-2 mb-2">
                <div className="h-2 rounded-full" style={{ width: result.overallScore + '%', backgroundColor: gradeColor }} />
              </div>
              <p className="text-slate-400 text-xs">{result.summary}</p>
            </div>
          </div>

          {/* Issue count badges */}
          <div className="flex gap-2 flex-wrap">
            {['Critical', 'High', 'Medium', 'Low'].map(function(sev) {
              const count = (result.issues || []).filter(function(i) { return i.severity === sev }).length
              if (!count) return null
              const style = SEVERITY_STYLES[sev]
              return (
                <span key={sev} className={'text-xs px-2 py-0.5 rounded border ' + style}>
                  {sev}: {count}
                </span>
              )
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'issues' && (
            <div className="space-y-2">
              {(result.issues || []).length === 0 ? (
                <p className="text-green-400 text-sm text-center py-4">✅ No issues found!</p>
              ) : (
                (result.issues || []).map(function(issue, i) {
                  const style = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.Low
                  return (
                    <div key={i} className={'rounded-xl border p-4 ' + style.split(' ').slice(1).join(' ')}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={'text-xs px-1.5 py-0.5 rounded border ' + style}>{issue.severity}</span>
                        {issue.type && <span className="text-slate-500 text-xs">{issue.type}</span>}
                        {issue.line && <span className="text-slate-600 text-xs">Line {issue.line}</span>}
                      </div>
                      <p className="text-white text-sm font-medium mb-1">{issue.message}</p>
                      {issue.fix && (
                        <p className="text-slate-400 text-xs">Fix: {issue.fix}</p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'improvements' && (
            <div className="space-y-3">
              {(result.improvements || []).map(function(imp, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-semibold text-sm mb-1">{imp.title}</p>
                    <p className="text-slate-400 text-xs mb-2">{imp.description}</p>
                    {imp.codeExample && (
                      <pre className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-2 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {imp.codeExample}
                      </pre>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'positives' && (
            <div className="bg-green-950 border border-green-800 rounded-xl p-4">
              <p className="text-green-400 text-xs font-semibold mb-2">✅ What you did well</p>
              <ul className="space-y-1">
                {(result.positives || []).map(function(pos, i) {
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-green-400 shrink-0">→</span>
                      <p className="text-slate-300">{pos}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {activeTab === 'optimized' && (
            <div className="space-y-3">
              {(result.optimizedSnippets || []).map(function(snip, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-2">
                    <p className="text-indigo-400 text-xs font-semibold">{snip.reason}</p>
                    <div>
                      <p className="text-red-400 text-xs mb-1">Before:</p>
                      <pre className="bg-[#0d0d1a] rounded-lg p-2 text-red-300 text-xs font-mono whitespace-pre-wrap">{snip.original}</pre>
                    </div>
                    <div>
                      <p className="text-green-400 text-xs mb-1">After:</p>
                      <pre className="bg-[#0d0d1a] rounded-lg p-2 text-green-300 text-xs font-mono whitespace-pre-wrap">{snip.optimized}</pre>
                    </div>
                  </div>
                )
              })}
              {(!result.optimizedSnippets || result.optimizedSnippets.length === 0) && (
                <p className="text-slate-500 text-sm text-center py-4">No optimization snippets available</p>
              )}
            </div>
          )}

          <button onClick={handleReview}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Re-review
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-white font-semibold mb-1">AI Code Reviewer</p>
          <p className="text-slate-500 text-sm">Paste your code above for AI to review issues, improvements and optimizations</p>
        </div>
      )}
    </div>
  )
}

export default CodeReviewer