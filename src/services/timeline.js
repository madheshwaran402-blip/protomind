const TIMELINE_KEY = 'protomind_timeline'

export const DEFAULT_MILESTONES = [
  { id: 'designed', label: 'Prototype Designed', icon: '💡', desc: 'Idea created and components selected in ProtoMind' },
  { id: 'ordered', label: 'Parts Ordered', icon: '🛒', desc: 'All components ordered from suppliers' },
  { id: 'received', label: 'Parts Received', icon: '📦', desc: 'All components arrived and checked' },
  { id: 'breadboard', label: 'Breadboard Test', icon: '🔌', desc: 'Circuit tested on breadboard' },
  { id: 'code', label: 'Code Written', icon: '💻', desc: 'Arduino/ESP32 code uploaded and running' },
  { id: 'soldered', label: 'Soldered / Assembled', icon: '🔧', desc: 'Components soldered to PCB or permanent setup' },
  { id: 'tested', label: 'Fully Tested', icon: '🧪', desc: 'All features tested and working correctly' },
  { id: 'complete', label: 'Build Complete', icon: '🎉', desc: 'Prototype is complete and working!' },
]

export function getAllTimelines() {
  try {
    const data = localStorage.getItem(TIMELINE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getTimeline(idea) {
  const all = getAllTimelines()
  return all[idea] || {
    milestones: DEFAULT_MILESTONES.map(m => ({
      ...m,
      completed: m.id === 'designed',
      completedAt: m.id === 'designed' ? new Date().toISOString() : null,
      notes: '',
    })),
    startedAt: new Date().toISOString(),
    customMilestones: [],
  }
}

export function saveTimeline(idea, timeline) {
  const all = getAllTimelines()
  all[idea] = timeline
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(all))
}

export function toggleMilestone(idea, milestoneId) {
  const timeline = getTimeline(idea)
  timeline.milestones = timeline.milestones.map(m => {
    if (m.id === milestoneId) {
      return {
        ...m,
        completed: !m.completed,
        completedAt: !m.completed ? new Date().toISOString() : null,
      }
    }
    return m
  })
  saveTimeline(idea, timeline)
  return timeline
}

export function updateMilestoneNote(idea, milestoneId, note) {
  const timeline = getTimeline(idea)
  timeline.milestones = timeline.milestones.map(m =>
    m.id === milestoneId ? { ...m, notes: note } : m
  )
  saveTimeline(idea, timeline)
  return timeline
}

export function addCustomMilestone(idea, label, icon = '📌') {
  const timeline = getTimeline(idea)
  const custom = {
    id: 'custom_' + Date.now(),
    label,
    icon,
    desc: 'Custom milestone',
    completed: false,
    completedAt: null,
    notes: '',
    isCustom: true,
  }
  timeline.milestones.push(custom)
  saveTimeline(idea, timeline)
  return timeline
}

export function deleteCustomMilestone(idea, milestoneId) {
  const timeline = getTimeline(idea)
  timeline.milestones = timeline.milestones.filter(m => m.id !== milestoneId)
  saveTimeline(idea, timeline)
  return timeline
}

export function getProgress(idea) {
  const timeline = getTimeline(idea)
  const total = timeline.milestones.length
  const done = timeline.milestones.filter(m => m.completed).length
  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
}