export async function generateFinalLaunchChecklist(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a hardware product launch director.\nGenerate the final launch day checklist for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: categories (array of objects with: name, icon, items array of objects with: task, critical boolean, timeBeforeLaunch string)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveFinalLaunch(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_finallaunch')||'{}');all[idea]=r;localStorage.setItem('pm_finallaunch',JSON.stringify(all))}catch{}}
export function getFinalLaunch(idea){try{return JSON.parse(localStorage.getItem('pm_finallaunch')||'{}')[idea]||null}catch{return null}}
