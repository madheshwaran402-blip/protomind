export async function generateTechTransfer(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a technology transfer expert.','Generate tech transfer package for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: documents (array of objects with: title, purpose, contents array), ipAssets (array of objects with: asset, type, protection), manufacturingNotes (array of strings), qualityStandards (array of strings)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveTechTransfer(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_techtransfer') || '{}'); all[idea] = r; localStorage.setItem('pm_techtransfer', JSON.stringify(all)) } catch {} }
export function getTechTransfer(idea) { try { return JSON.parse(localStorage.getItem('pm_techtransfer') || '{}')[idea] || null } catch { return null } }
