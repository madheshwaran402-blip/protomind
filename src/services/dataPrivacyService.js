export async function generatePrivacyGuide(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a data privacy expert for IoT and hardware.','Generate data privacy guide for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: dataCollected (array of objects with: dataType, purpose, retention, storage), gdprChecklist (array of strings), privacyByDesign (array of strings), policyTemplate (string)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function savePrivacy(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_privacy') || '{}'); all[idea] = r; localStorage.setItem('pm_privacy', JSON.stringify(all)) } catch {} }
export function getPrivacy(idea) { try { return JSON.parse(localStorage.getItem('pm_privacy') || '{}')[idea] || null } catch { return null } }
