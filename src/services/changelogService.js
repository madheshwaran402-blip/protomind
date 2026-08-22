const CHANGELOG_KEY = 'protomind_changelog'

export function getChangelog(projectId) {
  try {
    const raw = localStorage.getItem(CHANGELOG_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[projectId] || { versions: [] }
  } catch { return { versions: [] } }
}

export function saveChangelog(projectId, data) {
  try {
    const raw = localStorage.getItem(CHANGELOG_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[projectId] = data
    localStorage.setItem(CHANGELOG_KEY, JSON.stringify(all))
  } catch {}
}

export function addVersion(projectId, version) {
  const data = getChangelog(projectId)
  const newVersion = {
    id: 'v_' + Date.now(),
    version: version.version,
    date: version.date || new Date().toISOString().split('T')[0],
    type: version.type || 'minor',
    changes: {
      added: version.added || [],
      changed: version.changed || [],
      fixed: version.fixed || [],
      removed: version.removed || [],
    },
    notes: version.notes || '',
  }
  data.versions = [newVersion].concat(data.versions || [])
  saveChangelog(projectId, data)
  return newVersion
}

export async function generateVersionNotes(idea, components, versionNum) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a technical writer creating a changelog.',
    'Generate changelog entries for version ' + versionNum + ' of this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'added (array of strings),',
    'changed (array of strings),',
    'fixed (array of strings)',
  ].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })
  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

export const VERSION_TYPES = ['major', 'minor', 'patch', 'alpha', 'beta']
