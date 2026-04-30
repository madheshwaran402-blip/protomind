const FEEDBACK_KEY = 'protomind_feedback'

export function getAllFeedback() {
  try {
    const data = localStorage.getItem(FEEDBACK_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getFeedback(idea) {
  const all = getAllFeedback()
  return all[idea] || null
}

export function saveFeedback(idea, feedback) {
  const all = getAllFeedback()
  all[idea] = {
    ...feedback,
    idea,
    updatedAt: new Date().toISOString(),
    createdAt: all[idea]?.createdAt || new Date().toISOString(),
  }
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all))
  return all[idea]
}

export function deleteFeedback(idea) {
  const all = getAllFeedback()
  delete all[idea]
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all))
}

export function getFeedbackStats() {
  const all = getAllFeedback()
  const entries = Object.values(all)
  const total = entries.length
  const avgRating = total > 0
    ? entries.reduce((sum, f) => sum + (f.overallRating || 0), 0) / total
    : 0
  const wouldRebuild = entries.filter(f => f.wouldRebuild).length
  return { total, avgRating: avgRating.toFixed(1), wouldRebuild }
}