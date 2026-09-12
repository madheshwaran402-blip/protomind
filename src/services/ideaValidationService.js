export async function validateIdea(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a startup idea validation expert.\nValidate this hardware idea: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: score (number 0-100), dimensions (array of objects with: name, score, verdict, evidence), verdict (string), topRisks (array of strings), goSignals (array of strings)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveValidation(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_ideavalidation')||'{}');all[idea]=r;localStorage.setItem('pm_ideavalidation',JSON.stringify(all))}catch{}}
export function getValidation(idea){try{return JSON.parse(localStorage.getItem('pm_ideavalidation')||'{}')[idea]||null}catch{return null}}
