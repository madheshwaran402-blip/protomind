export async function generatePostLaunchPlan(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a hardware post-launch expert.','Generate post-launch plan for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: week1 (array of strings), month1 (array of strings), month3 (array of strings), kpis (array of objects with: metric, target, frequency), commonIssues (array of objects with: issue, response))'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function savePostLaunch(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_postlaunch') || '{}'); all[idea] = r; localStorage.setItem('pm_postlaunch', JSON.stringify(all)) } catch {} }
export function getPostLaunch(idea) { try { return JSON.parse(localStorage.getItem('pm_postlaunch') || '{}')[idea] || null } catch { return null } }
