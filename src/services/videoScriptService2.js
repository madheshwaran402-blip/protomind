export async function generateVideoScript(idea, components, style) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const componentList = components.map(function(c) { return c.name }).join(', ')
  const prompt = [
    'You are a YouTube video script writer for tech products.',
    'Write an explainer video script for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Style: ' + (style || 'Educational'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'title (string),',
    'duration (string),',
    'hook (string, first 15 seconds),',
    'sections (array of objects with: title, duration, script, bRoll string, transition)',
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

export function saveVideoScript(idea, style, result) {
  try {
    const raw = localStorage.getItem('protomind_video_script')
    const all = raw ? JSON.parse(raw) : {}
    if (!all[idea]) all[idea] = {}
    all[idea][style] = { result, savedAt: new Date().toISOString() }
    localStorage.setItem('protomind_video_script', JSON.stringify(all))
  } catch {}
}

export function getVideoScript(idea, style) {
  try {
    const raw = localStorage.getItem('protomind_video_script')
    const all = raw ? JSON.parse(raw) : {}
    return all[idea]?.[style]?.result || null
  } catch { return null }
}

export const VIDEO_STYLES = ['Educational', 'Hype/Marketing', 'Tutorial', 'Documentary', 'Shorts (60s)']
