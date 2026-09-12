export async function planSalesChannels(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a hardware sales channel expert.\nPlan sales channels for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: channels (array of objects with: name, type, potential, effort, steps array, commission)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveSalesChannels(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_saleschannels')||'{}');all[idea]=r;localStorage.setItem('pm_saleschannels',JSON.stringify(all))}catch{}}
export function getSalesChannels(idea){try{return JSON.parse(localStorage.getItem('pm_saleschannels')||'{}')[idea]||null}catch{return null}}
