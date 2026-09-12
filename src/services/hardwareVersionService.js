export async function generateVersionHistory(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a hardware versioning expert.\nGenerate version history for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: versions (array of objects with: version, date, changes array, breaking boolean, notes)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveVersionHistory(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_versions')||'{}');all[idea]=r;localStorage.setItem('pm_versions',JSON.stringify(all))}catch{}}
export function getVersionHistory(idea){try{return JSON.parse(localStorage.getItem('pm_versions')||'{}')[idea]||null}catch{return null}}
