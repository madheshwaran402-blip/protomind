import { useState } from 'react'
import { buildPitch, savePitch, getPitch } from '../services/pitchBuilderService'
import { notify } from '../services/toast'

function PitchBuilder({ idea, components }) {
  const [pitch, setPitch] = useState(getPitch(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pitch')
  const [practiceMode, setPracticeMode] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  async function handleBuild() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await buildPitch(idea, components)
      setPitch(data)
      savePitch(idea, data)
      notify.success('Pitch ready!')
    } catch {
      notify.error('Build failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyPitch() {
    if (!pitch) return
    const text = [
      'ELEVATOR PITCH:',
      pitch.elevatorPitch,
      '',
      'PROBLEM: ' + pitch.problemStatement,
      'SOLUTION: ' + pitch.solution,
      'UNIQUE VALUE: ' + pitch.uniqueValue,
    ].join('\n')
    navigator.clipboard.writeText(text)
    notify.success('Pitch copied!')
  }

  const TABS = [
    { id: 'pitch', label: '🎯 Pitch' },
    { id: 'qa', label: '❓ Q&A' },
    { id: 'practice', label: '🎤 Practice' },
  ]

  const questions = pitch?.potentialQuestions || []

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Build a compelling pitch and practice Q&A for your prototype</p>
        <button
          onClick={handleBuild}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-pink-700 hover:bg-pink-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🎯 Building...' : '🎯 Build Pitch'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building your pitch...</p>
        </div>
      )}

      {pitch && !loading && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-pink-700 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'pitch' && (
            <div className="space-y-3">
              {/* Elevator pitch */}
              <div className="bg-pink-950 border border-pink-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-pink-400 text-xs font-semibold uppercase tracking-wide">⏱️ 30-Second Elevator Pitch</p>
                  <button onClick={handleCopyPitch}
                    className="text-xs text-pink-400 hover:text-pink-300 transition">
                    📋 Copy all
                  </button>
                </div>
                <p className="text-white text-sm leading-relaxed font-medium">{pitch.elevatorPitch}</p>
              </div>

              {[
                { label: '❗ Problem', value: pitch.problemStatement, color: 'red' },
                { label: '💡 Solution', value: pitch.solution, color: 'green' },
                { label: '⭐ Unique Value', value: pitch.uniqueValue, color: 'yellow' },
                { label: '👥 Target Audience', value: pitch.targetAudience, color: 'blue' },
                { label: '📈 Market Opportunity', value: pitch.marketOpportunity, color: 'purple' },
              ].map(function(section) {
                return (
                  <div key={section.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">{section.label}</p>
                    <p className="text-white text-sm">{section.value}</p>
                  </div>
                )
              })}

              {pitch.technicalHighlights && pitch.technicalHighlights.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-semibold mb-2">🔧 Technical Highlights</p>
                  <ul className="space-y-1">
                    {pitch.technicalHighlights.map(function(h, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-pink-400 shrink-0">→</span>
                          <p className="text-slate-300">{h}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {pitch.nextSteps && pitch.nextSteps.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">🚀 Next Steps</p>
                  <ol className="space-y-1">
                    {pitch.nextSteps.map(function(step, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                          <p className="text-slate-300">{step}</p>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Prepare for these likely interview questions</p>
              {questions.map(function(qa, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-semibold text-sm mb-2">❓ {qa.question}</p>
                    <div className="bg-[#0d0d1a] rounded-lg p-3">
                      <p className="text-slate-300 text-xs leading-relaxed">{qa.answer}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="space-y-4">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
                <p className="text-white font-bold text-lg mb-1">Practice Mode</p>
                <p className="text-slate-500 text-xs mb-4">Read each question and try to answer before revealing</p>

                {questions.length > 0 ? (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-3">
                      <span>Question {currentQ + 1} of {questions.length}</span>
                      <button onClick={function() { setCurrentQ(0); setShowAnswer(false) }}
                        className="text-indigo-400 hover:text-indigo-300">Reset</button>
                    </div>

                    <div className="bg-pink-950 border border-pink-800 rounded-xl p-4 mb-4">
                      <p className="text-white font-semibold text-base">{questions[currentQ]?.question}</p>
                    </div>

                    {showAnswer ? (
                      <div className="bg-green-950 border border-green-800 rounded-xl p-4 mb-4 text-left">
                        <p className="text-green-400 text-xs font-semibold mb-1">Suggested Answer:</p>
                        <p className="text-slate-300 text-sm">{questions[currentQ]?.answer}</p>
                      </div>
                    ) : (
                      <button onClick={function() { setShowAnswer(true) }}
                        className="w-full py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm mb-4 transition">
                        👁️ Reveal Answer
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={function() { setCurrentQ(Math.max(0, currentQ - 1)); setShowAnswer(false) }}
                        disabled={currentQ === 0}
                        className="flex-1 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-xs disabled:opacity-30 transition">
                        ← Prev
                      </button>
                      <button
                        onClick={function() { setCurrentQ(Math.min(questions.length - 1, currentQ + 1)); setShowAnswer(false) }}
                        disabled={currentQ === questions.length - 1}
                        className="flex-1 py-2 bg-pink-700 hover:bg-pink-600 text-white rounded-xl text-xs disabled:opacity-30 transition">
                        Next →
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No practice questions available</p>
                )}
              </div>
            </div>
          )}

          <button onClick={handleBuild}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Rebuild Pitch
          </button>
        </>
      )}

      {!pitch && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-white font-semibold mb-1">Pitch Builder</p>
          <p className="text-slate-500 text-sm">Build a pitch and practice interview Q&A for your prototype</p>
        </div>
      )}
    </div>
  )
}

export default PitchBuilder