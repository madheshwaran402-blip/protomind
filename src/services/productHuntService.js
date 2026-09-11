export async function generateProductHuntLaunch(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a Product Hunt launch expert.','Generate Product Hunt launch strategy for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: tagline (string), description (string), firstComment (string), topics (array of strings), launchDaySchedule (array of objects with: time, action), hunterProfile (string), galleryDescriptions (array of strings)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveProductHunt(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_producthunt') || '{}'); all[idea] = r; localStorage.setItem('pm_producthunt', JSON.stringify(all)) } catch {} }
export function getProductHunt(idea) { try { return JSON.parse(localStorage.getItem('pm_producthunt') || '{}')[idea] || null } catch { return null } }
