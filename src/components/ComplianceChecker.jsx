import { useState } from 'react'
import { checkCompliance, saveCompliance, getCompliance, REGIONS } from '../services/complianceService'
import { notify } from '../services/toast'

const COMPLIANCE_STYLES = {
  'Compliant': { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅' },
  'Needs Review': { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚠️' },
  'Non-Compliant': { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '❌' },
}

function ComplianceChecker({ idea, components }) {
  const [result, setResult] = useState(getCompliance(idea))
  const [loading, setLoading] = useState(false)
  const [region, setRegion] = useState('Global')
  const [activeTab, setActiveTab] = useState('certs')

  async function handleCheck() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await checkCompliance(idea, components, region)
      setResult(data)
      saveCompliance(idea, data)
      notify.success('Compliance check complete!')
    } catch {
      notify.error('Check failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const compStyle = result ? (COMPLIANCE_STYLES[result.overallCompliance] || COMPLIANCE_STYLES['Needs Review']) : null

  const TABS = [
    { id: 'certs', label: '📋 Certifications' },
    { id: 'standards', label: '📐 Standards' },
    { id: 'risks', label: '⚠️ Risks' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={region}
          onChange={function(e) { setRegion(e.target.value) }}
          className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none flex-1"
        >
          {REGIONS.map(function(r) { return <option key={r} value={r}>{r}</option> })}
        </select>
        <button
          onClick={handleCheck}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '📋 Checking...' : '📋 Check Compliance'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Checking regulatory compliance...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className={'rounded-2xl border p-5 flex items-center gap-4 ' + compStyle.bg + ' ' + compStyle.border}>
            <span className="text-4xl">{compStyle.icon}</span>
            <div>
              <p className={'font-black text-xl ' + compStyle.color}>{result.overallCompliance}</p>
              <p className="text-slate-400 text-xs">For: {region} region</p>
              <p className="text-slate-400 text-xs">{(result.certifications || []).filter(function(c) { return c.required }).length} required certifications</p>
            </div>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                    activeTab === tab.id ? 'bg-teal-700 text-white' : 'text-slate-500 hover:text-white'
                  )}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'certs' && (
            <div className="space-y-2">
              {(result.certifications || []).map(function(cert, i) {
                return (
                  <div key={i} className={'rounded-xl border p-4 ' + (cert.required ? 'bg-red-950 border-red-900' : 'bg-[#13131f] border-[#2e2e4e]')}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold text-sm">{cert.name}</p>
                      {cert.required && <span className="text-xs bg-red-900 text-red-300 border border-red-700 px-1.5 py-0.5 rounded-full">Required</span>}
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{cert.description}</p>
                    <div className="flex gap-3 text-xs">
                      {cert.cost && <span className="text-emerald-400">Cost: {cert.cost}</span>}
                      {cert.timeframe && <span className="text-blue-400">Time: {cert.timeframe}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'standards' && (
            <div className="space-y-2">
              {(result.standards || []).map(function(std, i) {
                return (
                  <div key={i} className={'rounded-xl border p-3 ' + (std.applicable ? 'bg-[#13131f] border-indigo-800' : 'bg-[#0d0d1a] border-[#1e1e2e] opacity-60')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded font-mono">{std.standard}</span>
                      <span className="text-slate-500 text-xs">{std.category}</span>
                      {!std.applicable && <span className="text-slate-600 text-xs ml-auto">Not applicable</span>}
                    </div>
                    {std.applicable && <p className="text-slate-300 text-xs">{std.requirement}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-3">
              {result.risks && result.risks.length > 0 && (
                <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-semibold mb-2">⚠️ Compliance Risks</p>
                  <ul className="space-y-1">
                    {result.risks.map(function(risk, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">•</span>{risk}</li>
                    })}
                  </ul>
                </div>
              )}
              {result.nextSteps && result.nextSteps.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">🚀 Next Steps</p>
                  <ol className="space-y-1">
                    {result.nextSteps.map(function(step, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400">{i+1}.</span>{step}</li>
                    })}
                  </ol>
                </div>
              )}
            </div>
          )}

          <button onClick={handleCheck}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Re-check with different region
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-white font-semibold mb-1">Regulatory Compliance Checker</p>
          <p className="text-slate-500 text-sm">Check CE, FCC, RoHS and other certifications needed for your region</p>
        </div>
      )}
    </div>
  )
}

export default ComplianceChecker