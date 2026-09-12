export async function assessTRL(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a Technology Readiness Level expert.\nAssess TRL for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: currentTRL (number 1-9), currentLevel (object with: name, description, achieved array, gaps array), nextLevel (object with: name, requirements array, estimatedTime), recommendation (string)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveTRL(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_trl')||'{}');all[idea]=r;localStorage.setItem('pm_trl',JSON.stringify(all))}catch{}}
export function getTRL(idea){try{return JSON.parse(localStorage.getItem('pm_trl')||'{}')[idea]||null}catch{return null}}
