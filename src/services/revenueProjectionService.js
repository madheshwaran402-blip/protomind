export async function projectRevenue(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a hardware startup financial expert.\nProject revenue for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: scenarios (array of objects with: name, year1, year2, year3, assumptions array, risks array), breakEven (string), burnRate (string)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveRevenue(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_revenue')||'{}');all[idea]=r;localStorage.setItem('pm_revenue',JSON.stringify(all))}catch{}}
export function getRevenue(idea){try{return JSON.parse(localStorage.getItem('pm_revenue')||'{}')[idea]||null}catch{return null}}
