export async function generateDevEnvironment(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a dev environment expert.','Generate dev environment setup for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: tools (array of objects with: name, version, purpose, installCmd), configs (array of objects with: filename, content), tips (array of strings)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveDevEnv(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_devenv') || '{}'); all[idea] = r; localStorage.setItem('pm_devenv', JSON.stringify(all)) } catch {} }
export function getDevEnv(idea) { try { return JSON.parse(localStorage.getItem('pm_devenv') || '{}')[idea] || null } catch { return null } }
