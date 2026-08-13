const PROGRESS_KEY = 'protomind_progress_tracker'

export const DEFAULT_MILESTONES = [
  { id: 'idea', label: 'Idea Defined', icon: '💡', description: 'Project concept is clear', category: 'Planning' },
  { id: 'components', label: 'Components Selected', icon: '🔧', description: 'All parts chosen and listed', category: 'Planning' },
  { id: 'breadboard', label: 'Breadboard Built', icon: '🔌', description: 'Initial circuit on breadboard', category: 'Build' },
  { id: 'code_first', label: 'First Code Running', icon: '💻', description: 'Basic program uploaded and working', category: 'Code' },
  { id: 'sensors_working', label: 'Sensors Working', icon: '📡', description: 'All sensors reading correctly', category: 'Build' },
  { id: 'display_working', label: 'Display Working', icon: '🖥️', description: 'Output display functioning', category: 'Build' },
  { id: 'full_integration', label: 'Fully Integrated', icon: '🔗', description: 'All components working together', category: 'Build' },
  { id: 'tested', label: 'Tested & Validated', icon: '🧪', description: 'All tests passed', category: 'Testing' },
  { id: 'enclosure', label: 'Enclosure Designed', icon: '📦', description: '3D printed or built enclosure', category: 'Polish' },
  { id: 'documented', label: 'Documented', icon: '📄', description: 'README and docs written', category: 'Polish' },
  { id: 'shared', label: 'Shared', icon: '🌐', description: 'Published or shared with community', category: 'Launch' },
  { id: 'complete', label: 'Project Complete', icon: '🏆', description: 'Fully finished and working!', category: 'Launch' },
]

export function getProgress(projectId) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[projectId]) {
      return {
        milestones: DEFAULT_MILESTONES.map(function(m) {
          return Object.assign({}, m, { completed: false, completedAt: null, notes: '' })
        }),
        startedAt: new Date().toISOString(),
        customMilestones: [],
      }
    }
    return all[projectId]
  } catch {
    return {
      milestones: DEFAULT_MILESTONES.map(function(m) {
        return Object.assign({}, m, { completed: false, completedAt: null, notes: '' })
      }),
      startedAt: new Date().toISOString(),
      customMilestones: [],
    }
  }
}

export function saveProgress(projectId, progress) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[projectId] = progress
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
  } catch {}
}

export function toggleMilestone(projectId, milestoneId) {
  const progress = getProgress(projectId)
  progress.milestones = progress.milestones.map(function(m) {
    if (m.id === milestoneId) {
      return Object.assign({}, m, {
        completed: !m.completed,
        completedAt: !m.completed ? new Date().toISOString() : null,
      })
    }
    return m
  })
  saveProgress(projectId, progress)
  return progress
}

export function addCustomMilestone(projectId, milestone) {
  const progress = getProgress(projectId)
  const newMilestone = {
    id: 'custom_' + Date.now(),
    label: milestone.label,
    icon: milestone.icon || '⭐',
    description: milestone.description || '',
    category: milestone.category || 'Custom',
    completed: false,
    completedAt: null,
    notes: '',
    custom: true,
  }
  if (!progress.customMilestones) progress.customMilestones = []
  progress.customMilestones.push(newMilestone)
  progress.milestones.push(newMilestone)
  saveProgress(projectId, progress)
  return progress
}

export function updateMilestoneNotes(projectId, milestoneId, notes) {
  const progress = getProgress(projectId)
  progress.milestones = progress.milestones.map(function(m) {
    if (m.id === milestoneId) return Object.assign({}, m, { notes })
    return m
  })
  saveProgress(projectId, progress)
}

export function getProgressStats(progress) {
  const milestones = progress.milestones || []
  const total = milestones.length
  const completed = milestones.filter(function(m) { return m.completed }).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const completedDates = milestones
    .filter(function(m) { return m.completed && m.completedAt })
    .map(function(m) { return new Date(m.completedAt) })
    .sort(function(a, b) { return a - b })

  const startDate = progress.startedAt ? new Date(progress.startedAt) : new Date()
  const lastActivity = completedDates.length > 0 ? completedDates[completedDates.length - 1] : null
  const daysActive = lastActivity ? Math.ceil((lastActivity - startDate) / (1000 * 60 * 60 * 24)) : 0

  const categoryProgress = {}
  milestones.forEach(function(m) {
    if (!categoryProgress[m.category]) categoryProgress[m.category] = { total: 0, completed: 0 }
    categoryProgress[m.category].total++
    if (m.completed) categoryProgress[m.category].completed++
  })

  return { total, completed, pct, daysActive, categoryProgress, lastActivity }
}

export async function getAIEncouragement(idea, pct) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an enthusiastic electronics mentor.',
    'Give a short encouraging message (2-3 sentences) for a maker who is',
    pct + '% through building: ' + idea,
    'Be specific, energetic and practical.',
    'Reply ONLY with the message text, no JSON.',
  ].join(' ')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })

  const data = await response.json()
  return data.response || 'Keep going — you are making great progress!'
}