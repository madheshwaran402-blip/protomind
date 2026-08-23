import { useState } from 'react'
import { buildFeedbackForm, saveFeedbackForm, getFeedbackForm, saveFeedbackResponse, getFeedbackResponses } from '../services/feedbackFormService'
import { notify } from '../services/toast'

function FeedbackFormBuilder({ idea, components }) {
  const [form, setForm] = useState(getFeedbackForm(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('form')
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const responses = getFeedbackResponses(idea)

  async function handleBuild() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await buildFeedbackForm(idea, components)
      setForm(data)
      saveFeedbackForm(idea, data)
      notify.success('Feedback form ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleAnswer(id, value) {
    setAnswers(function(prev) { return Object.assign({}, prev, { [id]: value }) })
  }

  function handleSubmit() {
    const required = (form?.questions || []).filter(function(q) { return q.required })
    const missing = required.filter(function(q) { return !answers[q.id] })
    if (missing.length > 0) { notify.warning('Please answer all required questions'); return }
    saveFeedbackResponse(idea, answers)
    setSubmitted(true)
    setAnswers({})
    notify.success('Feedback submitted! Thank you.')
    setTimeout(function() { setSubmitted(false) }, 3000)
  }

  function handleExport() {
    if (responses.length === 0) { notify.warning('No responses yet'); return }
    const questions = form?.questions || []
    const headers = ['Submitted', ...questions.map(function(q) { return q.question })]
    const rows = responses.map(function(r) {
      return [r.submittedAt, ...questions.map(function(q) { return r[q.id] || '' })]
    })
    const csv = [headers, ...rows].map(function(row) { return row.map(function(v) { return '"' + v + '"' }).join(',') }).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'feedback_responses.csv'; link.click()
    URL.revokeObjectURL(url)
    notify.success('Responses exported!')
  }

  const TABS = [{ id: 'form', label: 'Form Preview' }, { id: 'responses', label: 'Responses (' + responses.length + ')' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate a user feedback form tailored to your prototype</p>
        <button onClick={handleBuild} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-pink-700 hover:bg-pink-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Building...' : 'Build Form'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building feedback form...</p>
        </div>
      )}

      {form && !loading && (
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-pink-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'form' && (
            <div className="space-y-4">
              <div className="bg-pink-950 border border-pink-800 rounded-xl p-4">
                <p className="text-white font-black text-lg">{form.formTitle}</p>
                <p className="text-slate-400 text-sm mt-1">{form.description}</p>
              </div>

              {submitted ? (
                <div className="bg-green-950 border border-green-800 rounded-xl p-6 text-center">
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="text-green-400 font-bold">Thank you for your feedback!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(form.questions || []).map(function(q) {
                    return (
                      <div key={q.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                        <p className="text-white text-sm font-medium mb-2">
                          {q.question}
                          {q.required && <span className="text-red-400 ml-1">*</span>}
                        </p>
                        {q.type === 'rating' && (
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map(function(n) {
                              return (
                                <button key={n} onClick={function() { handleAnswer(q.id, n) }}
                                  className={'w-10 h-10 rounded-xl border-2 text-sm font-bold transition ' + (answers[q.id] === n ? 'bg-pink-600 border-pink-500 text-white' : 'border-[#2e2e4e] text-slate-400 hover:border-pink-600')}>
                                  {n}
                                </button>
                              )
                            })}
                          </div>
                        )}
                        {q.type === 'multiple_choice' && q.options && (
                          <div className="space-y-1">
                            {q.options.map(function(opt) {
                              return (
                                <button key={opt} onClick={function() { handleAnswer(q.id, opt) }}
                                  className={'w-full text-left px-3 py-2 rounded-lg border text-sm transition ' + (answers[q.id] === opt ? 'bg-pink-950 border-pink-700 text-pink-300' : 'bg-[#0d0d1a] border-[#2e2e4e] text-slate-300 hover:border-pink-700')}>
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                        )}
                        {(q.type === 'text' || q.type === 'textarea') && (
                          <textarea value={answers[q.id] || ''} onChange={function(e) { handleAnswer(q.id, e.target.value) }}
                            placeholder="Your answer..."
                            className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pink-500 resize-none"
                            rows={q.type === 'textarea' ? 3 : 1} />
                        )}
                        {q.type === 'yes_no' && (
                          <div className="flex gap-2">
                            {['Yes', 'No'].map(function(opt) {
                              return (
                                <button key={opt} onClick={function() { handleAnswer(q.id, opt) }}
                                  className={'px-6 py-2 rounded-xl border-2 text-sm font-bold transition ' + (answers[q.id] === opt ? 'bg-pink-600 border-pink-500 text-white' : 'border-[#2e2e4e] text-slate-400 hover:border-pink-600')}>
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <button onClick={handleSubmit}
                    className="w-full py-3 bg-pink-700 hover:bg-pink-600 rounded-xl text-sm font-semibold transition">
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-3">
              {responses.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-6">No responses yet — share the form with users</p>
              ) : (
                <>
                  <button onClick={handleExport} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
                    Export CSV ({responses.length} responses)
                  </button>
                  {responses.map(function(resp, i) {
                    return (
                      <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                        <p className="text-slate-500 text-xs mb-2">{new Date(resp.submittedAt).toLocaleString()}</p>
                        {(form.questions || []).map(function(q) {
                          return resp[q.id] ? (
                            <div key={q.id} className="mb-1">
                              <span className="text-slate-500 text-xs">{q.question}: </span>
                              <span className="text-white text-xs">{String(resp[q.id])}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

          <button onClick={handleBuild} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate Form</button>
        </>
      )}

      {!form && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-white font-semibold mb-1">Feedback Form Builder</p>
          <p className="text-slate-500 text-sm">Generate a targeted user feedback form with ratings, multiple choice and text</p>
        </div>
      )}
    </div>
  )
}

export default FeedbackFormBuilder
