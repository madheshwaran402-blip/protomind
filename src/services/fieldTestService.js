export async function generateFieldTest(idea, components) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
  const prompt = ['You are a hardware field testing expert.','Generate field test plan for: ' + idea,'Components: ' + components.map(function(c){return c.name}).join(', '),'Reply ONLY with valid JSON: testSites (array of strings), testCases (array of objects with: name, setup, procedure array, passCriteria, failCriteria), equipment (array of strings), duration (string), reportTemplate (array of strings)'].join("\n")
  const response = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
  const data = await response.json()
  const m = data.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}
export function saveFieldTest(idea, r) { try { const all = JSON.parse(localStorage.getItem('pm_fieldtest') || '{}'); all[idea] = r; localStorage.setItem('pm_fieldtest', JSON.stringify(all)) } catch {} }
export function getFieldTest(idea) { try { return JSON.parse(localStorage.getItem('pm_fieldtest') || '{}')[idea] || null } catch { return null } }
