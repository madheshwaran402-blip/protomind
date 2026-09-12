export async function generateEmailCampaign(idea, components) {
  const s = localStorage.getItem('protomind_settings'); const m = s ? (JSON.parse(s).aiModel||'llama3.2') : 'llama3.2'; const u = s ? (JSON.parse(s).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
  const prompt = 'You are an email marketing expert for hardware products.\nGenerate email campaign for: ' + idea + '\nComponents: ' + components.map(function(c){return c.name}).join(', ') + '\nReply ONLY with valid JSON: sequence (array of objects with: emailNum, subject, sendDay, purpose, body, cta))'
  const r = await fetch(u+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:m,prompt,stream:false})})
  const d = await r.json(); const match = d.response.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON'); return JSON.parse(match[0])
}
export function saveEmailCampaign(idea,r){try{const all=JSON.parse(localStorage.getItem('pm_emailcampaign')||'{}');all[idea]=r;localStorage.setItem('pm_emailcampaign',JSON.stringify(all))}catch{}}
export function getEmailCampaign(idea){try{return JSON.parse(localStorage.getItem('pm_emailcampaign')||'{}')[idea]||null}catch{return null}}
