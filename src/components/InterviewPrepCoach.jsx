import { useState } from 'react'
import { prepareInterview, saveInterviewPrep, getInterviewPrep, INTERVIEW_TYPES } from '../services/interviewPrepService'
import { notify } from '../services/toast'

function InterviewPrepCoach({ idea, components }) {
  const [interviewType, setInterviewType] = useState('Investor')
  const [result, setResult] = useState(getInterviewPrep(idea, 'Investor'))
  const [loading, setLoading] = useState(false)
  const [activeQ, setActiveQ] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)

  function handleSelectType(type) {
    setInterviewType(type)
    setResult(getInterviewPrep(idea, type))
    setActiveQ(0)
    setShowAnswer(false)
  }

  async function handlePrepare() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await prepareInterview(idea, components, interviewType)
      setResult(data)
      saveInterviewPrep(idea, interviewType, data)
      setActiveQ(0)
      setShowAnswer(false)
      notify.success((data.questions?.length || 0) + ' questions prepared!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const questions = result?.questions || []
  const activeQuestion = questions[activeQ]

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap">
        {INTERVIEW_TYPES.map(function(type) {
          const hasCache = !!getInterviewPrep(idea, type)
          return (
            <button key={type} onClick={function() { handleSelectType(type) }}
              className={'text-xs px-3 py-1.5 rounded-xl border transition relative ' + (interviewType === type ? 'bg-indigo-700 text-white border-indigo-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600')}>
              {type}
              {hasCache && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={handlePrepare} disabled={loading || components.length === 0}
          className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
          {loading ? 'Preparing...' : 'Prepare ' + interviewType + ' Interview'}
        </button>
        {result && (
          <button onClick={function() { setPracticeMode(!practiceMode); setShowAnswer(false) }}
            className={'px-4 py-2.5 rounded-xl text-xs font-semibold transition ' + (practiceMode ? 'bg-green-700 text-white' : 'bg-[#1e1e2e] text-slate-300')}>
            {practiceMode ? 'Exit Practice' : 'Practice Mode'}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Preparing interview questions...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {questions.map(function(q, i) {
              return (
                <button key={i} onClick={function() { setActiveQ(i); setShowAnswer(false) }}
                  className={'flex-shrink-0 w-8 h-8 rounded-xl text-xs font-bold transition ' + (activeQ === i ? 'bg-indigo-700 text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>
                  {i + 1}
                </button>
              )
            })}
          </div>

          {activeQuestion && (
            <div className="space-y-3">
              <div className={'rounded-xl p-4 ' + (practiceMode ? 'bg-indigo-950 border-2 border-indigo-700' : 'bg-[#13131f] border border-[#2e2e4e]')}>
                {practiceMode && <p className="text-indigo-400 text-xs font-semibold mb-2">INTERVIEWER ASKS:</p>}
                <p className="text-white font-bold text-base">{activeQuestion.question}</p>
              </div>

              {!practiceMode ? (
                <div className="space-y-2">
                  <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                    <p className="text-green-400 text-xs font-semibold mb-2">Ideal Answer</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{activeQuestion.idealAnswer}</p>
                  </div>
                  {activeQuestion.keyPoints?.length > 0 && (
                    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                      <p className="text-indigo-400 text-xs font-semibold mb-2">Key Points to Cover</p>
                      <ul className="space-y-1">
                        {activeQuestion.keyPoints.map(function(pt, i) {
                          return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400 shrink-0">{i+1}.</span>{pt}</li>
                        })}
                      </ul>
                    </div>
                  )}
                  {activeQuestion.avoid && (
                    <div className="bg-red-950 border border-red-900 rounded-xl p-3">
                      <p className="text-red-400 text-xs font-semibold">Avoid: {activeQuestion.avoid}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {!showAnswer ? (
                    <button onClick={function() { setShowAnswer(true) }}
                      className="w-full py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition">
                      Reveal Answer
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                        <p className="text-green-400 text-xs font-semibold mb-1">Model Answer</p>
                        <p className="text-slate-300 text-sm">{activeQuestion.idealAnswer}</p>
                      </div>
                      {activeQuestion.keyPoints?.length > 0 && (
                        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                          <p className="text-indigo-400 text-xs font-semibold mb-1">Key Points</p>
                          <ul className="space-y-0.5">
                            {activeQuestion.keyPoints.map(function(pt, i) {
                              return <li key={i} className="text-slate-400 text-xs">- {pt}</li>
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={function() { setActiveQ(Math.max(0, activeQ - 1)); setShowAnswer(false) }} disabled={activeQ === 0}
                  className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev</button>
                <button onClick={function() { setActiveQ(Math.min(questions.length - 1, activeQ + 1)); setShowAnswer(false) }} disabled={activeQ === questions.length - 1}
                  className="flex-1 py-1.5 bg-indigo-700 text-white rounded-lg text-xs disabled:opacity-30">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-white font-semibold mb-1">Interview Prep Coach</p>
          <p className="text-slate-500 text-sm">Prepare answers for investor, accelerator and technical interviews</p>
        </div>
      )}
    </div>
  )
}

export default InterviewPrepCoach
