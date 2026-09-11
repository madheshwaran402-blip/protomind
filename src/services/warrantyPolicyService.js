export async function generateWarrantyPolicy(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a hardware product policy expert.','Generate warranty and returns policy for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: warrantyPeriod (string), covered (array of strings), notCovered (array of strings), claimProcess (array of strings), returnPolicy (string), refundPolicy (string)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveWarranty(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_warranty') || '{}'); all[idea] = r; localStorage.setItem('pm_warranty', JSON.stringify(all)) } catch {} }
export function getWarranty(idea) { try { return JSON.parse(localStorage.getItem('pm_warranty') || '{}')[idea] || null } catch { return null } }
