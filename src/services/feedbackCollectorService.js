const SURVEYS_KEY = 'protomind_surveys'
const RESPONSES_KEY = 'protomind_survey_responses'

export function createSurvey(projectId, survey) {
  try {
    const raw = localStorage.getItem(SURVEYS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const surveyId = 'survey_' + Date.now()
    const newSurvey = {
      id: surveyId,
      projectId,
      title: survey.title || 'Prototype Feedback',
      description: survey.description || '',
      questions: survey.questions || [],
      createdAt: new Date().toISOString(),
      active: true,
    }
    all[surveyId] = newSurvey
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(all))
    return newSurvey
  } catch {
    return null
  }
}

export function getSurvey(surveyId) {
  try {
    const raw = localStorage.getItem(SURVEYS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[surveyId] || null
  } catch {
    return null
  }
}

export function getSurveysForProject(projectId) {
  try {
    const raw = localStorage.getItem(SURVEYS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return Object.values(all).filter(function(s) { return s.projectId === projectId })
  } catch {
    return []
  }
}

export function submitResponse(surveyId, response) {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[surveyId]) all[surveyId] = []
    const newResponse = {
      id: 'resp_' + Date.now(),
      answers: response.answers || {},
      respondentName: response.respondentName || 'Anonymous',
      submittedAt: new Date().toISOString(),
      rating: response.rating || null,
    }
    all[surveyId].push(newResponse)
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(all))
    return newResponse
  } catch {
    return null
  }
}

export function getResponses(surveyId) {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[surveyId] || []
  } catch {
    return []
  }
}

export function getSurveyAnalytics(surveyId, survey) {
  const responses = getResponses(surveyId)
  if (!responses.length || !survey) return null

  const totalResponses = responses.length
  const ratings = responses.filter(function(r) { return r.rating }).map(function(r) { return r.rating })
  const avgRating = ratings.length > 0 ? (ratings.reduce(function(a, b) { return a + b }, 0) / ratings.length).toFixed(1) : null

  const questionAnalytics = (survey.questions || []).map(function(q) {
    if (q.type === 'rating') {
      const vals = responses.map(function(r) { return parseInt(r.answers[q.id]) }).filter(function(v) { return !isNaN(v) })
      const avg = vals.length > 0 ? (vals.reduce(function(a, b) { return a + b }, 0) / vals.length).toFixed(1) : 'N/A'
      return { questionId: q.id, question: q.text, type: 'rating', average: avg, count: vals.length }
    }
    if (q.type === 'multiple') {
      const counts = {}
      responses.forEach(function(r) {
        const ans = r.answers[q.id]
        if (ans) counts[ans] = (counts[ans] || 0) + 1
      })
      return { questionId: q.id, question: q.text, type: 'multiple', counts, count: responses.length }
    }
    const texts = responses.map(function(r) { return r.answers[q.id] }).filter(Boolean)
    return { questionId: q.id, question: q.text, type: 'text', responses: texts, count: texts.length }
  })

  return { totalResponses, avgRating, questionAnalytics }
}

export function deleteSurvey(surveyId) {
  try {
    const raw = localStorage.getItem(SURVEYS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    delete all[surveyId]
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(all))
  } catch {}
}

export const QUESTION_TEMPLATES = [
  { id: 'usability', text: 'How easy was the device to use?', type: 'rating', required: true },
  { id: 'reliability', text: 'How reliable did the device feel?', type: 'rating', required: true },
  { id: 'design', text: 'How would you rate the overall design?', type: 'rating', required: false },
  { id: 'improvements', text: 'What would you improve about this prototype?', type: 'text', required: false },
  { id: 'use_again', text: 'Would you use this device regularly?', type: 'multiple', options: ['Yes, definitely', 'Probably yes', 'Maybe', 'Probably not', 'No'], required: true },
  { id: 'recommend', text: 'Would you recommend this to others?', type: 'multiple', options: ['Yes', 'Maybe', 'No'], required: false },
  { id: 'missing', text: 'What features are missing that you would want?', type: 'text', required: false },
  { id: 'overall', text: 'Overall satisfaction score', type: 'rating', required: true },
]