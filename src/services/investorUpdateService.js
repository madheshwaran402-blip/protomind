export async function generateInvestorUpdate(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a startup investor relations expert.','Generate monthly investor update email for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: subject (string), highlights (array of strings), metrics (array of objects with: metric, value, trend), challenges (array of strings), nextMonth (array of strings), ask (string)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveInvestorUpdate(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_investorupdate') || '{}'); all[idea] = r; localStorage.setItem('pm_investorupdate', JSON.stringify(all)) } catch {} }
export function getInvestorUpdate(idea) { try { return JSON.parse(localStorage.getItem('pm_investorupdate') || '{}')[idea] || null } catch { return null } }
