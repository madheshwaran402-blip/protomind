import { getAllProjects, getAllVersions } from './storage'
import { getInventory } from './inventoryService'
import { getUnlockedAchievements, getTotalXP, getLevel } from './achievementService'

export function getDashboardAnalytics() {
  const projects = getAllProjects()
  const versions = getAllVersions()
  const inventory = getInventory()
  const achievements = getUnlockedAchievements()
  const xp = getTotalXP()
  const level = getLevel(xp)

  const totalProjects = projects.length
  const totalVersions = versions.length
  const totalComponents = projects.reduce(function(sum, p) {
    return sum + (p.components ? p.components.length : 0)
  }, 0)

  const categoryCount = {}
  projects.forEach(function(p) {
    (p.components || []).forEach(function(c) {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1
    })
  })

  const topCategories = Object.entries(categoryCount)
    .sort(function(a, b) { return b[1] - a[1] })
    .slice(0, 5)
    .map(function(entry) { return { category: entry[0], count: entry[1] } })

  const componentFreq = {}
  projects.forEach(function(p) {
    (p.components || []).forEach(function(c) {
      componentFreq[c.name] = (componentFreq[c.name] || 0) + 1
    })
  })

  const topComponents = Object.entries(componentFreq)
    .sort(function(a, b) { return b[1] - a[1] })
    .slice(0, 8)
    .map(function(entry) { return { name: entry[0], count: entry[1] } })

  const projectsByMonth = {}
  projects.forEach(function(p) {
    if (p.createdAt) {
      const month = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      projectsByMonth[month] = (projectsByMonth[month] || 0) + 1
    }
  })

  const avgComponentsPerProject = totalProjects > 0
    ? (totalComponents / totalProjects).toFixed(1)
    : 0

  const publicProjects = projects.filter(function(p) { return p.isPublic }).length

  const inventoryValue = inventory.reduce(function(sum, item) {
    return sum + (item.quantity * item.unitCost)
  }, 0)

  const recentProjects = [...projects]
    .sort(function(a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0) })
    .slice(0, 5)

  const streakDays = calculateStreak(projects)

  return {
    totalProjects,
    totalVersions,
    totalComponents,
    avgComponentsPerProject,
    publicProjects,
    topCategories,
    topComponents,
    projectsByMonth,
    achievements,
    xp,
    level,
    inventoryValue,
    recentProjects,
    streakDays,
    inventoryItems: inventory.length,
  }
}

function calculateStreak(projects) {
  if (projects.length === 0) return 0
  const dates = projects
    .filter(function(p) { return p.createdAt })
    .map(function(p) { return new Date(p.createdAt).toDateString() })
  const uniqueDates = [...new Set(dates)].sort()
  if (uniqueDates.length === 0) return 1
  let streak = 1
  let maxStreak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1])
    const curr = new Date(uniqueDates[i])
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
      maxStreak = Math.max(maxStreak, streak)
    } else {
      streak = 1
    }
  }
  return maxStreak
}