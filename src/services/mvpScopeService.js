export async function defineMVPScope(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a hardware MVP strategy expert.','Define MVP scope for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: mustHave (array of strings), shouldHave (array of strings), wontHave (array of strings), validationGoal (string), successMetric (string), timeToMVP (string)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveMVP(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_mvp') || '{}'); all[idea] = r; localStorage.setItem('pm_mvp', JSON.stringify(all)) } catch {} }
export function getMVP(idea) { try { return JSON.parse(localStorage.getItem('pm_mvp') || '{}')[idea] || null } catch { return null } }
