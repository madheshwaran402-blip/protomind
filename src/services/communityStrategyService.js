export async function buildCommunityStrategy(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a hardware startup community builder.','Build community strategy for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: channels (array of objects with: platform, purpose, contentTypes array, frequency), contentPillars (array of strings), growthTactics (array of strings)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveCommunity(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_community') || '{}'); all[idea] = r; localStorage.setItem('pm_community', JSON.stringify(all)) } catch {} }
export function getCommunity(idea) { try { return JSON.parse(localStorage.getItem('pm_community') || '{}')[idea] || null } catch { return null } }
