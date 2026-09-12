export async function generateNetworkingScript(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a startup networking coach.\nGenerate networking scripts for: ' + idea + '\nReply ONLY with valid JSON: elevatorPitch (string), contexts (array of objects with: context, opener, pitch, ask, followUp))'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveNetworking(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_networking')||'{}');all[idea]=r;localStorage.setItem('pm_networking',JSON.stringify(all))}catch{}}
export function getNetworking(idea){try{return JSON.parse(localStorage.getItem('pm_networking')||'{}')[idea]||null}catch{return null}}
