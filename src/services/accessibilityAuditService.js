export async function auditAccessibility(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are an accessibility expert for hardware products.','Audit accessibility for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: issues (array of objects with: area, issue, severity, fix), score (number 0-100), recommendations (array of strings)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveAudit(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_access') || '{}'); all[idea] = r; localStorage.setItem('pm_access', JSON.stringify(all)) } catch {} }
export function getAudit(idea) { try { return JSON.parse(localStorage.getItem('pm_access') || '{}')[idea] || null } catch { return null } }
