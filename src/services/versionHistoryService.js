import { getAllVersions } from './storage'

export function getVersionsForProject(idea) {
  try {
    const all = getAllVersions()
    return all
      .filter(function(v) { return v.idea === idea })
      .sort(function(a, b) { return new Date(b.savedAt) - new Date(a.savedAt) })
  } catch {
    return []
  }
}

export function diffVersions(versionA, versionB) {
  const compsA = versionA.components || []
  const compsB = versionB.components || []

  const namesA = compsA.map(function(c) { return c.name })
  const namesB = compsB.map(function(c) { return c.name })

  const added = compsB.filter(function(c) { return !namesA.includes(c.name) })
  const removed = compsA.filter(function(c) { return !namesB.includes(c.name) })
  const kept = compsA.filter(function(c) { return namesB.includes(c.name) })

  const costA = compsA.reduce(function(sum, c) {
    return sum + (parseInt((c.estimatedPrice || '$5').match(/\d+/)?.[0] || '5'))
  }, 0)

  const costB = compsB.reduce(function(sum, c) {
    return sum + (parseInt((c.estimatedPrice || '$5').match(/\d+/)?.[0] || '5'))
  }, 0)

  return {
    added,
    removed,
    kept,
    componentCountChange: compsB.length - compsA.length,
    costChange: costB - costA,
    costA,
    costB,
  }
}

export function getVersionStats(versions) {
  if (!versions || versions.length === 0) return null

  const total = versions.length
  const latest = versions[0]
  const oldest = versions[versions.length - 1]
  const daySpan = oldest.savedAt
    ? Math.ceil((new Date(latest.savedAt) - new Date(oldest.savedAt)) / (1000 * 60 * 60 * 24))
    : 0

  const allComponents = versions.flatMap(function(v) { return v.components || [] })
  const componentFreq = {}
  allComponents.forEach(function(c) {
    componentFreq[c.name] = (componentFreq[c.name] || 0) + 1
  })
  const mostUsed = Object.entries(componentFreq)
    .sort(function(a, b) { return b[1] - a[1] })
    .slice(0, 3)
    .map(function(e) { return { name: e[0], count: e[1] } })

  const maxComps = Math.max.apply(null, versions.map(function(v) { return (v.components || []).length }))
  const minComps = Math.min.apply(null, versions.map(function(v) { return (v.components || []).length }))

  return { total, daySpan, mostUsed, maxComps, minComps, latest, oldest }
}