import { useState } from 'react'
import { generateEmailCampaign, saveEmailCampaign, getEmailCampaign } from '../services/emailCampaignService'
import { notify } from '../services/toast'
function EmailCampaignBuilder({ idea, components }) {
  const [result, setResult] = useState(getEmailCampaign(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const [copied, setCopied] = useState(false)
  async function handle() {
    if (!components.length) { notify.warning('Add components first'); return }
    setLoading(true)
    try { const d = await generateEmailCampaign(idea, components); setResult(d); saveEmailCampaign(idea, d); setSelected(0); notify.success((d.sequence||[]).length+' emails in sequence!') }
    catch { notify.error('Failed - is Ollama running?') } finally { setLoading(false) }
  }
  const emails = result?.sequence || []
  const active = emails[selected]
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate a complete email campaign sequence for your product launch</p>
        <button onClick={handle} disabled={loading||!components.length} className="px-5 py-2.5 bg-pink-700 hover:bg-pink-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">{loading?'Generating...':'Generate Campaign'}</button>
      </div>
      {loading&&<div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"/><p className="text-slate-400 text-sm">Generating email campaign...</p></div>}
      {result&&!loading&&(
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">{emails.map(function(e,i){return<button key={i} onClick={function(){setSelected(i)}} className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition '+(selected===i?'bg-pink-700 text-white':'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>Email {e.emailNum||i+1}</button>})}</div>
          {active&&<div className="space-y-3">
            <div className="bg-pink-950 border border-pink-800 rounded-xl p-4"><p className="text-pink-400 text-xs font-semibold mb-1">Email {active.emailNum} - Day {active.sendDay}</p><p className="text-white font-bold">{active.subject}</p>{active.purpose&&<p className="text-slate-400 text-xs mt-1">{active.purpose}</p>}</div>
            {active.body&&<div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4"><p className="text-slate-500 text-xs font-semibold mb-2">Body</p><p className="text-slate-300 text-sm leading-relaxed">{active.body}</p></div>}
            {active.cta&&<div className="bg-[#0d0d1a] border border-pink-800 rounded-xl p-3"><p className="text-pink-400 text-xs font-semibold">Call to Action</p><p className="text-white text-sm font-bold">{active.cta}</p></div>}
            <div className="flex gap-2"><button onClick={function(){setSelected(Math.max(0,selected-1))}} disabled={selected===0} className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev</button><button onClick={function(){setSelected(Math.min(emails.length-1,selected+1))}} disabled={selected===emails.length-1} className="flex-1 py-1.5 bg-pink-700 text-white rounded-lg text-xs disabled:opacity-30">Next Email</button></div>
          </div>}
          <button onClick={handle} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}
      {!result&&!loading&&<div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl"><div className="text-4xl mb-2">✉️</div><p className="text-white font-semibold mb-1">Email Campaign Builder</p><p className="text-slate-500 text-sm">Generate complete email sequence for product launch</p></div>}
    </div>
  )
}
export default EmailCampaignBuilder
