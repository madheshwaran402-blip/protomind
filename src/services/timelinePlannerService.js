export async function generateTimeline(idea, components, options) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert project manager for electronics prototyping.',
    'Generate a detailed build timeline for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Skill level: ' + (options.skillLevel || 'Intermediate'),
    'Available hours per week: ' + (options.hoursPerWeek || 10),
    'Target completion: ' + (options.targetDate || 'flexible'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'projectName (string),',
    'totalWeeks (number),',
    'totalHours (number),',
    'phases (array of objects with: id, name, description, weekStart, weekEnd, hours, status, color, tasks array of objects with: id, name, hours, done, priority),',
    'milestones (array of objects with: week, name, description, critical),',
    'risks (array of strings),',
    'tips (array of strings)',
  ].join('\n')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

const TIMELINE_KEY = 'protomind_timeline_plans'

export function saveTimelinePlan(idea, plan) {
  try {
    const all = getTimelinePlans()
    all[idea] = { plan, savedAt: new Date().toISOString() }
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(all))
  } catch {}
}

export function getTimelinePlans() {
  try {
    const raw = localStorage.getItem(TIMELINE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveTaskProgress(idea, phaseId, taskId, done) {
  try {
    const key = TIMELINE_KEY + '_progress'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    if (!all[idea][phaseId]) all[idea][phaseId] = {}
    all[idea][phaseId][taskId] = done
    localStorage.setItem(key, JSON.stringify(all))
  } catch {}
}

export function getTaskProgress(idea) {
  try {
    const key = TIMELINE_KEY + '_progress'
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    return all[idea] || {}
  } catch {
    return {}
  }
}