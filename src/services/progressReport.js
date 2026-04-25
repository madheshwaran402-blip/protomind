import { getAllProjects, getAllVersions } from './storage'
import { getAllRatings } from './ratings'
import { getProgress } from './timeline'

export function generateWeeklyReport() {
  const projects = getAllProjects()
  const versions = getAllVersions()
  const ratings = getAllRatings()

  const now = new Date()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

  const thisWeek = projects.filter(p => new Date(p.createdAt) > weekAgo)
  const thisMonth = projects.filter(p => new Date(p.createdAt) > monthAgo)

  const weekVersions = versions.filter(v => new Date(v.savedAt) > weekAgo)

  const allDays = {}
  versions.forEach(v => {
    const day = new Date(v.savedAt).toLocaleDateString('en-US', { weekday: 'short' })
    allDays[day] = (allDays[day] || 0) + 1
  })

  const recentDays = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000)
    const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const dayVersions = versions.filter(v => {
      const vd = new Date(v.savedAt)
      return vd.toDateString() === d.toDateString()
    })
    recentDays[key] = dayVersions.length
  }

  const ratedList = Object.entries(ratings).filter(([, r]) => r.stars > 0)
  const avgRating = ratedList.length > 0
    ? ratedList.reduce((sum, [, r]) => sum + r.stars, 0) / ratedList.length
    : 0

  const streak = calculateStreak(versions)

  const allComponents = projects.flatMap(p => p.components || [])
  const compFreq = {}
  allComponents.forEach(c => {
    compFreq[c.name] = (compFreq[c.name] || 0) + 1
  })
  const topComponent = Object.entries(compFreq).sort((a, b) => b[1] - a[1])[0]

  const categoryFreq = {}
  allComponents.forEach(c => {
    categoryFreq[c.category] = (categoryFreq[c.category] || 0) + 1
  })
  const topCategory = Object.entries(categoryFreq).sort((a, b) => b[1] - a[1])[0]

  const buildProgresses = projects.map(p => ({
    idea: p.idea,
    progress: getProgress(p.idea),
  })).filter(p => p.progress.percent > 0)

  return {
    generatedAt: now.toISOString(),
    totals: {
      projects: projects.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      versions: versions.length,
      weekVersions: weekVersions.length,
      avgRating: avgRating.toFixed(1),
      streak,
    },
    recentActivity: recentDays,
    topComponent: topComponent ? { name: topComponent[0], count: topComponent[1] } : null,
    topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
    buildProgresses: buildProgresses.slice(0, 5),
    recentProjects: projects.slice(0, 3),
  }
}

function calculateStreak(versions) {
  if (versions.length === 0) return 0
  const dates = [...new Set(versions.map(v =>
    new Date(v.savedAt).toDateString()
  ))].sort((a, b) => new Date(b) - new Date(a))

  let streak = 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  if (dates[0] !== today && dates[0] !== yesterday) return 0

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toDateString()
    if (dates[i] === expected) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function getMotivationalMessage(stats) {
  if (stats.totals.projects === 0) return { emoji: '🚀', msg: 'Start building your first prototype today!' }
  if (stats.totals.streak >= 7) return { emoji: '🔥', msg: 'Incredible! 7+ day streak — you are on fire!' }
  if (stats.totals.streak >= 3) return { emoji: '⚡', msg: stats.totals.streak + ' day streak — keep the momentum going!' }
  if (stats.totals.thisWeek >= 3) return { emoji: '🎯', msg: 'Productive week! ' + stats.totals.thisWeek + ' prototypes built!' }
  if (stats.totals.projects >= 10) return { emoji: '🏆', msg: 'Pro builder! ' + stats.totals.projects + ' prototypes and counting!' }
  if (stats.totals.avgRating >= 4) return { emoji: '⭐', msg: 'High quality work — average rating of ' + stats.totals.avgRating + ' stars!' }
  return { emoji: '💪', msg: 'Keep building — every prototype teaches you something new!' }
}