export async function designBetaProgram(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a hardware beta program expert.','Design beta testing program for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: betaSize (string), testerCriteria (array of strings), phases (array of objects with: phase, duration, goal, participants), feedbackMethods (array of strings), successCriteria (array of strings), incentives (array of strings)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveBeta(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_beta') || '{}'); all[idea] = r; localStorage.setItem('pm_beta', JSON.stringify(all)) } catch {} }
export function getBeta(idea) { try { return JSON.parse(localStorage.getItem('pm_beta') || '{}')[idea] || null } catch { return null } }
