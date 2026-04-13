import { useState } from 'react'
import { explainPrototype } from '../services/prototypeExplainer'
import { notify } from '../services/toast'

const AUDIENCES = [
  { id: 'child', label: '👧 Child', desc: 'Age 10, simple words' },
  { id: 'parent', label: '👨‍👩‍👧 Parent', desc: 'Non-technical adult' },
  { id: 'investor', label: '💼 Investor', desc: 'Business pitch style' },
  { id: 'teacher', label: '📚 Teacher', desc: 'Science project style' },
  { id: 'friend', label: '😄 Friend', desc: 'Casual and fun' },
]

function ExplainerCard({ icon, title, content, color }) {
  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {title}
        </h4>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{content}</p>
    </div>
  )
}

function PrototypeExplainer({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [audience, setAudience] = useState('friend')
  const [showComponents, setShowComponents] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleExplain() {
    setLoading(true)
    setResult(null)
    try {
      const data = await explainPrototype(idea, components, audience)
      setResult(data)
      notify.success('Explanation ready for ' + AUDIENCES.find(a => a.id === audience)?.label + '!')
    } catch {
      notify.error('Explanation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    const text = [
      result.title,
      '',
      result.tagline,
      '',
      'What it does:',
      result.whatItDoes,
      '',
      'How it works:',
      result.howItWorks,
      '',
      'Why it is useful:',
      result.whyItsUseful,
      '',
      'Fun fact: ' + result.funFact,
      '',
      'Think of it like: ' + result.analogy,
    ].join('\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    notify.success('Explanation copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedAudience = AUDIENCES.find(a => a.id === audience)

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">💬 Prototype Explainer</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            AI explains your prototype in simple language for any audience
          </p>
        </div>
        {result && (
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            {copied ? '✅ Copied!' : '📋 Copy Text'}
          </button>
        )}
      </div>

      {/* Audience selector */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">Choose your audience:</p>
        <div className="flex gap-2 flex-wrap">
          {AUDIENCES.map(a => (
            <button
              key={a.id}
              onClick={() => { setAudience(a.id); setResult(null) }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                audience === a.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#13131f] border border-[#2e2e4e] text-slate-400 hover:border-indigo-800'
              }`}
            >
              <span>{a.label}</span>
              <span className="text-slate-500 ml-1 hidden sm:inline">· {a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleExplain}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50 mb-4"
      >
        {loading
          ? '💬 Generating explanation...'
          : '💬 Explain for ' + selectedAudience?.label}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">
            Writing explanation for {selectedAudience?.label}...
          </p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">

          {/* Title and tagline */}
          <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-5 text-center">
            <h2 className="text-2xl font-black text-white mb-2">{result.title}</h2>
            <p className="text-indigo-300 text-sm italic">"{result.tagline}"</p>
          </div>

          {/* One liner */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-5 py-4">
            <p className="text-white text-base font-medium leading-relaxed">
              {result.oneLiner}
            </p>
          </div>

          {/* Main explanation cards */}
          <div className="grid grid-cols-1 gap-3">
            <ExplainerCard
              icon="📱"
              title="What it does"
              content={result.whatItDoes}
              color="#6366f1"
            />
            <ExplainerCard
              icon="⚙️"
              title="How it works"
              content={result.howItWorks}
              color="#0ea5e9"
            />
            <ExplainerCard
              icon="✨"
              title="Why it is useful"
              content={result.whyItsUseful}
              color="#22c55e"
            />
          </div>

          {/* Analogy */}
          {result.analogy && (
            <div className="bg-yellow-950 border border-yellow-900 rounded-xl px-5 py-4">
              <p className="text-xs font-semibold text-yellow-400 mb-1">🔗 Think of it like...</p>
              <p className="text-yellow-100 text-sm leading-relaxed">{result.analogy}</p>
            </div>
          )}

          {/* Fun fact */}
          {result.funFact && (
            <div className="bg-purple-950 border border-purple-900 rounded-xl px-5 py-4">
              <p className="text-xs font-semibold text-purple-400 mb-1">🎉 Fun fact</p>
              <p className="text-purple-100 text-sm leading-relaxed">{result.funFact}</p>
            </div>
          )}

          {/* Component plain English */}
          {result.componentExplanations?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShowComponents(!showComponents)}
              >
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  🔧 What each part does in plain English ({result.componentExplanations.length})
                </h4>
                <span className="text-slate-600 text-xs">{showComponents ? '↑' : '↓'}</span>
              </div>
              {showComponents && (
                <div className="mt-3 space-y-2">
                  {result.componentExplanations.map((comp, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-[#2e2e4e] last:border-0">
                      <span className="text-indigo-400 font-semibold text-xs shrink-0 w-32 truncate">
                        {comp.name}
                      </span>
                      <p className="text-slate-400 text-xs leading-relaxed">{comp.plainEnglish}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Copy button at bottom */}
          <button
            onClick={handleCopy}
            className="w-full py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
          >
            {copied ? '✅ Copied to clipboard!' : '📋 Copy full explanation to share'}
          </button>

        </div>
      )}
    </div>
  )
}

export default PrototypeExplainer