export async function analyseComponentAging(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a hardware reliability expert.\nAnalyse component aging for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name+' ('+c.category+')'}).join(', ') + '\nReply ONLY with valid JSON: components (array of objects with: name, expectedLifespan, failureMode, wearIndicators array, replacementInterval, maintenanceTips array)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveAgingAnalysis(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_aging')||'{}');all[idea]=r;localStorage.setItem('pm_aging',JSON.stringify(all))}catch{}}
export function getAgingAnalysis(idea){try{return JSON.parse(localStorage.getItem('pm_aging')||'{}')[idea]||null}catch{return null}}
