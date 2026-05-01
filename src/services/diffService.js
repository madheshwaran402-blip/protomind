export function diffVersions(versionA, versionB) {
  const compsA = versionA.components || []
  const compsB = versionB.components || []

  const namesA = new Set(compsA.map(c => c.name))
  const namesB = new Set(compsB.map(c => c.name))

  const added = compsB.filter(c => !namesA.has(c.name))
  const removed = compsA.filter(c => !namesB.has(c.name))
  const kept = compsA.filter(c => namesB.has(c.name))

  const totalChanges = added.length + removed.length
  const similarity = compsA.length + compsB.length > 0
    ? Math.round((kept.length * 2) / (compsA.length + compsB.length) * 100)
    : 100

  return {
    added,
    removed,
    kept,
    totalChanges,
    similarity,
    sizeChange: compsB.length - compsA.length,
    fromVersion: versionA.version || '?',
    toVersion: versionB.version || '?',
    fromDate: versionA.savedAt,
    toDate: versionB.savedAt,
  }
}

export function buildChangelog(versions) {
  if (!versions || versions.length < 2) return []

  const sorted = [...versions].sort((a, b) =>
    new Date(a.savedAt) - new Date(b.savedAt)
  )

  const changelog = []
  for (let i = 1; i < sorted.length; i++) {
    const diff = diffVersions(sorted[i - 1], sorted[i])
    if (diff.totalChanges > 0 || i === sorted.length - 1) {
      changelog.push({
        version: sorted[i].version,
        date: sorted[i].savedAt,
        diff,
        note: sorted[i].note || '',
      })
    }
  }
  return changelog.reverse()
}