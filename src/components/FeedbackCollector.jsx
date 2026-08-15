import { useState, useEffect } from 'react'
import {
  createSurvey,
  getSurvey,
  getSurveysForProject,
  submitResponse,
  getResponses,
  getSurveyAnalytics,
  deleteSurvey,
  QUESTION_TEMPLATES,
} from '../services/feedbackCollectorService'
import { notify } from '../services/toast'

const QUESTION_TYPES = [
  { value: 'rating', label: '⭐ Rating (1-5)', icon: '⭐' },
  { value: 'text', label: '📝 Text Answer', icon: '📝' },
  { value: 'multiple', label: '☑️ Multiple Choice', icon: '☑️' },
]

function StarRating({ value, onChange, readOnly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(function(star) {
        return (
          <button
            key={star}
            onClick={function() { if (!readOnly) onChange(star) }}
            className={'text-2xl transition ' + (
              readOnly ? 'cursor-default' : 'hover:scale-110'
            ) + ' ' + (star <= value ? 'text-yellow-400' : 'text-slate-700')}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

function SurveyForm({ survey, onSubmit, onClose }) {
  const [answers, setAnswers] = useState({})
  const [name, setName] = useState('')
  const [overallRating, setOverallRating] = useState(0)

  function setAnswer(qId, value) {
    setAnswers(function(prev) {
      const next = Object.assign({}, prev)
      next[qId] = value
      return next
    })
  }

  function handleSubmit() {
    const required = (survey.questions || []).filter(function(q) { return q.required })
    const missing = required.find(function(q) { return !answers[q.id] })
    if (missing) {
      notify.warning('Please answer: ' + missing.text)
      return
    }
    onSubmit({ answers, respondentName: name || 'Anonymous', rating: overallRating })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
    >
      <div className="w-full max-w-lg bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl my-4">
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <div>
            <p className="text-white font-bold">{survey.title}</p>
            {survey.description && <p className="text-slate-500 text-xs">{survey.description}</p>}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <p className="text-xs text-slate-500 mb-1">Your name (optional)</p>
            <input
              value={name}
              onChange={function(e) { setName(e.target.value) }}
              placeholder="Anonymous"
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">Overall rating</p>
            <StarRating value={overallRating} onChange={setOverallRating} />
          </div>

          {(survey.questions || []).map(function(q) {
            return (
              <div key={q.id}>
                <p className="text-white text-sm font-medium mb-2">
                  {q.text}
                  {q.required && <span className="text-red-400 ml-1">*</span>}
                </p>
                {q.type === 'rating' && (
                  <StarRating value={parseInt(answers[q.id]) || 0} onChange={function(v) { setAnswer(q.id, String(v)) }} />
                )}
                {q.type === 'text' && (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={function(e) { setAnswer(q.id, e.target.value) }}
                    placeholder="Your answer..."
                    className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none resize-none"
                    rows={3}
                  />
                )}
                {q.type === 'multiple' && (
                  <div className="space-y-1">
                    {(q.options || []).map(function(opt) {
                      return (
                        <button
                          key={opt}
                          onClick={function() { setAnswer(q.id, opt) }}
                          className={'w-full text-left px-3 py-2 rounded-xl border text-sm transition ' + (
                            answers[q.id] === opt
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                          )}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-[#1e1e2e] flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#1e1e2e] text-slate-400 rounded-xl text-sm">Cancel</button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  )
}

function AnalyticsView({ survey, surveyId }) {
  const analytics = getSurveyAnalytics(surveyId, survey)
  const responses = getResponses(surveyId)

  if (!analytics) return (
    <div className="text-center py-6 text-slate-600 text-sm">No responses yet</div>
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Responses', value: analytics.totalResponses, icon: '👥' },
          { label: 'Avg Rating', value: analytics.avgRating ? analytics.avgRating + '/5' : 'N/A', icon: '⭐' },
          { label: 'Questions', value: survey.questions?.length || 0, icon: '❓' },
        ].map(function(stat) {
          return (
            <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
              <p className="text-lg mb-0.5">{stat.icon}</p>
              <p className="text-white font-bold text-base">{stat.value}</p>
              <p className="text-slate-600 text-xs">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {analytics.questionAnalytics.map(function(qa, i) {
        return (
          <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-2">{qa.question}</p>
            {qa.type === 'rating' && (
              <div className="flex items-center gap-3">
                <StarRating value={Math.round(parseFloat(qa.average) || 0)} readOnly />
                <span className="text-yellow-400 font-bold">{qa.average}/5</span>
                <span className="text-slate-500 text-xs">({qa.count} ratings)</span>
              </div>
            )}
            {qa.type === 'multiple' && (
              <div className="space-y-1">
                {Object.entries(qa.counts || {}).map(function(entry) {
                  const opt = entry[0]
                  const count = entry[1]
                  const pct = Math.round((count / analytics.totalResponses) * 100)
                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <p className="text-slate-400 text-xs w-24 truncate">{opt}</p>
                      <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
                        <div className="h-1.5 bg-indigo-600 rounded-full" style={{ width: pct + '%' }} />
                      </div>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            )}
            {qa.type === 'text' && (
              <div className="space-y-1">
                {qa.responses.slice(0, 3).map(function(text, j) {
                  return (
                    <p key={j} className="text-slate-300 text-xs bg-[#0d0d1a] rounded-lg p-2 italic">
                      "{text}"
                    </p>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {responses.length > 0 && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
          <p className="text-xs text-slate-500 font-semibold mb-2">Recent Respondents</p>
          <div className="space-y-1">
            {responses.slice(0, 5).map(function(resp) {
              return (
                <div key={resp.id} className="flex items-center gap-2 text-xs">
                  <span className="text-lg">👤</span>
                  <span className="text-slate-300">{resp.respondentName}</span>
                  {resp.rating > 0 && (
                    <span className="text-yellow-400">{'★'.repeat(resp.rating)}</span>
                  )}
                  <span className="text-slate-600 ml-auto">
                    {new Date(resp.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function FeedbackCollector({ idea, components }) {
  const projectId = 'feedback_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  const [surveys, setSurveys] = useState(getSurveysForProject(projectId))
  const [activeSurvey, setActiveSurvey] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(null)
  const [activeTab, setActiveTab] = useState('surveys')
  const [newSurvey, setNewSurvey] = useState({
    title: 'Prototype Feedback',
    description: '',
    questions: [],
  })
  const [selectedTemplates, setSelectedTemplates] = useState([])

  function refresh() {
    setSurveys(getSurveysForProject(projectId))
  }

  function toggleTemplate(template) {
    setSelectedTemplates(function(prev) {
      if (prev.find(function(t) { return t.id === template.id })) {
        return prev.filter(function(t) { return t.id !== template.id })
      }
      return prev.concat([template])
    })
  }

  function handleCreate() {
    if (!newSurvey.title.trim()) {
      notify.warning('Add a survey title')
      return
    }
    const survey = createSurvey(projectId, {
      title: newSurvey.title,
      description: newSurvey.description,
      questions: selectedTemplates.map(function(t) {
        return Object.assign({}, t, { id: t.id + '_' + Date.now() })
      }),
    })
    if (survey) {
      refresh()
      setShowCreateForm(false)
      setSelectedTemplates([])
      setNewSurvey({ title: 'Prototype Feedback', description: '', questions: [] })
      notify.success('Survey created!')
    }
  }

  function handleSubmitFeedback(response) {
    if (!activeSurvey) return
    submitResponse(activeSurvey.id, response)
    setShowFeedbackForm(false)
    refresh()
    notify.success('Feedback submitted! Thank you!')
  }

  function handleDelete(surveyId) {
    deleteSurvey(surveyId)
    refresh()
    notify.success('Survey deleted')
  }

  const TABS = [
    { id: 'surveys', label: '📋 Surveys' },
    { id: 'create', label: '+ Create' },
  ]

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 max-w-xs">
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

      {/* Surveys tab */}
      {activeTab === 'surveys' && (
        <div className="space-y-3">
          {surveys.length === 0 ? (
            <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-white font-semibold mb-1">No surveys yet</p>
              <p className="text-slate-500 text-sm mb-3">Create a survey to collect feedback from testers</p>
              <button
                onClick={function() { setActiveTab('create') }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
              >
                + Create Survey
              </button>
            </div>
          ) : (
            surveys.map(function(survey) {
              const responses = getResponses(survey.id)
              return (
                <div key={survey.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{survey.title}</p>
                      <p className="text-slate-500 text-xs">
                        {survey.questions?.length || 0} questions · {responses.length} responses
                      </p>
                    </div>
                    <button
                      onClick={function() { handleDelete(survey.id) }}
                      className="text-slate-600 hover:text-red-400 text-xs transition"
                    >
                      🗑
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={function() { setActiveSurvey(survey); setShowFeedbackForm(true) }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      ✍️ Fill Survey
                    </button>
                    {responses.length > 0 && (
                      <button
                        onClick={function() { setShowAnalytics(showAnalytics === survey.id ? null : survey.id) }}
                        className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg text-xs transition"
                      >
                        📊 {showAnalytics === survey.id ? 'Hide' : 'View'} Analytics
                      </button>
                    )}
                  </div>

                  {showAnalytics === survey.id && (
                    <div className="mt-3 border-t border-[#2e2e4e] pt-3">
                      <AnalyticsView survey={survey} surveyId={survey.id} />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Create tab */}
      {activeTab === 'create' && (
        <div className="space-y-3">
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Survey Title</p>
              <input
                value={newSurvey.title}
                onChange={function(e) { setNewSurvey(function(prev) { return Object.assign({}, prev, { title: e.target.value }) }) }}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Description (optional)</p>
              <input
                value={newSurvey.description}
                onChange={function(e) { setNewSurvey(function(prev) { return Object.assign({}, prev, { description: e.target.value }) }) }}
                placeholder="Tell testers what this is about..."
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
              Select Questions ({selectedTemplates.length} selected)
            </p>
            <div className="space-y-2">
              {QUESTION_TEMPLATES.map(function(template) {
                const selected = selectedTemplates.find(function(t) { return t.id === template.id })
                const typeInfo = QUESTION_TYPES.find(function(t) { return t.value === template.type })
                return (
                  <div
                    key={template.id}
                    onClick={function() { toggleTemplate(template) }}
                    className={'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ' + (
                      selected
                        ? 'bg-indigo-950 border-indigo-700'
                        : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-700'
                    )}
                  >
                    <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ' + (
                      selected ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'
                    )}>
                      {selected && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">{template.text}</p>
                      <p className="text-slate-500 text-xs">{typeInfo?.label} {template.required ? '· Required' : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={selectedTemplates.length === 0 || !newSurvey.title}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            Create Survey ({selectedTemplates.length} questions)
          </button>
        </div>
      )}

      {showFeedbackForm && activeSurvey && (
        <SurveyForm
          survey={activeSurvey}
          onSubmit={handleSubmitFeedback}
          onClose={function() { setShowFeedbackForm(false) }}
        />
      )}
    </div>
  )
}

export default FeedbackCollector