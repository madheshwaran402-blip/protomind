export async function designPackaging(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a product packaging design expert.','Design packaging for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: boxType (string), dimensions (string), materials (array of strings), inTheBox (array of strings), unboxingExperience (array of strings), sustainabilityNotes (string), printingSpecs (string)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function savePackaging(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_packaging') || '{}'); all[idea] = r; localStorage.setItem('pm_packaging', JSON.stringify(all)) } catch {} }
export function getPackaging(idea) { try { return JSON.parse(localStorage.getItem('pm_packaging') || '{}')[idea] || null } catch { return null } }
