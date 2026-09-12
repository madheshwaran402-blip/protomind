export async function generateQualityControl(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a hardware quality control expert.\nGenerate QC plan for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: checkpoints (array of objects with: stage, tests array of objects with: test, method, passValue, failAction, frequency)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveQualityControl(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_qc')||'{}');all[idea]=r;localStorage.setItem('pm_qc',JSON.stringify(all))}catch{}}
export function getQualityControl(idea){try{return JSON.parse(localStorage.getItem('pm_qc')||'{}')[idea]||null}catch{return null}}
