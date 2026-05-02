const BUILD_LOG_KEY = 'protomind_build_logs'

export function getAllLogs() {
  try {
    const data = localStorage.getItem(BUILD_LOG_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getLogsForProject(idea) {
  const all = getAllLogs()
  return all[idea] || []
}

export function addLogEntry(idea, entry) {
  const all = getAllLogs()
  if (!all[idea]) all[idea] = []
  const newEntry = {
    id: 'log_' + Date.now(),
    text: entry.text,
    mood: entry.mood || 'neutral',
    tags: entry.tags || [],
    imageUrl: entry.imageUrl || '',
    hoursWorked: entry.hoursWorked || 0,
    milestone: entry.milestone || '',
    createdAt: new Date().toISOString(),
  }
  all[idea].unshift(newEntry)
  localStorage.setItem(BUILD_LOG_KEY, JSON.stringify(all))
  return newEntry
}

export function updateLogEntry(idea, entryId, updates) {
  const all = getAllLogs()
  if (!all[idea]) return
  all[idea] = all[idea].map(e => e.id === entryId ? { ...e, ...updates } : e)
  localStorage.setItem(BUILD_LOG_KEY, JSON.stringify(all))
}

export function deleteLogEntry(idea, entryId) {
  const all = getAllLogs()
  if (!all[idea]) return
  all[idea] = all[idea].filter(e => e.id !== entryId)
  localStorage.setItem(BUILD_LOG_KEY, JSON.stringify(all))
}

export function getLogStats(idea) {
  const logs = getLogsForProject(idea)
  const totalHours = logs.reduce((sum, e) => sum + (parseFloat(e.hoursWorked) || 0), 0)
  const allTags = logs.flatMap(e => e.tags || [])
  const tagFreq = {}
  allTags.forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1 })
  const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag]) => tag)
  const moods = logs.map(e => e.mood).filter(Boolean)
  const moodFreq = {}
  moods.forEach(m => { moodFreq[m] = (moodFreq[m] || 0) + 1 })
  const topMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'
  return {
    totalEntries: logs.length,
    totalHours: totalHours.toFixed(1),
    topTags,
    topMood,
    lastEntry: logs[0]?.createdAt || null,
  }
}

export function exportBuildLog(idea) {
  const logs = getLogsForProject(idea)
  const lines = [
    '=== BUILD LOG: ' + idea + ' ===',
    'Exported: ' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    'Total entries: ' + logs.length,
    '',
    ...logs.flatMap(entry => [
      '--- ' + new Date(entry.createdAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }) + ' ---',
      entry.mood ? 'Mood: ' + entry.mood : '',
      entry.hoursWorked ? 'Hours worked: ' + entry.hoursWorked : '',
      entry.milestone ? 'Milestone: ' + entry.milestone : '',
      entry.tags?.length ? 'Tags: ' + entry.tags.join(', ') : '',
      '',
      entry.text,
      '',
    ]).filter(line => line !== null),
    '=== END OF BUILD LOG ===',
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'BuildLog_' + idea.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20) + '.txt'
  link.click()
  URL.revokeObjectURL(url)
}