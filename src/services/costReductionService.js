export async function analyseCostReduction(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are a hardware cost reduction expert.\nAnalyse cost reduction for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: opportunities (array of objects with: area, currentCost, reducedCost, saving, method, risk), totalSaving (string), quickWins (array of strings)'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveCostReduction(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_costreduction')||'{}');all[idea]=r;localStorage.setItem('pm_costreduction',JSON.stringify(all))}catch{}}
export function getCostReduction(idea){try{return JSON.parse(localStorage.getItem('pm_costreduction')||'{}')[idea]||null}catch{return null}}
