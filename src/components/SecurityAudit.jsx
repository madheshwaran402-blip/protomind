import { useState } from 'react'
import { auditSecurity, saveAudit, getAudit } from '../services/securityAuditService'
import { notify } from '../services/toast'

const SEVERITY_STYLES = {
  Critical: 'text-red-400 bg-red-950 border-red-800',
  High: 'text-orange-400 bg-orange-950 border-orange-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-blue-400 bg-blue-950 border-blue-800',
}

function SecurityAudit({ idea, components }) {
  const [result, setResult] = useState(getAudit(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('vulns')

  async function handleAudit() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await auditSecurity(idea, components)
      setResult(data)
      saveAudit(idea, data)
      notify.success('Security audit complete!')
    } catch { notify.error('Audit failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const scoreColor = result ? (result.securityScore >= 75 ? '#22c55e' : result.securityScore >= 50 ? '#f59e0b' : '#ef4444') : '#6366f1'
  const TABS = [{ id: 'vulns', label: 'Vulnerabilities' }, { id: 'hardening', label: 'Hardening' }, { id: 'secure', label: 'Secure Features' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Audit your prototype for IoT security vulnerabilities and hardening steps</p>
        <button onClick={handleAudit} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-red-800 hover:bg-red-700 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Auditing...' : 'Security Audit'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Auditing security...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#1e1e2e" strokeWidth="6" />
                <circle cx="40" cy="40" r="35" fill="none" stroke={scoreColor} strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 35}
                  strokeDashoffset={2 * Math.PI * 35 * (1 - result.securityScore / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xl font-black" style={{ color: scoreColor }}>{result.securityScore}</p>
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Security Score</p>
              <p className="text-slate-400 text-xs">{(result.vulnerabilities || []).length} vulnerabilities found</p>
              {result.vulnerabilities && result.vulnerabilities.filter(function(v) { return v.severity === 'Critical' }).length > 0 && (
                <p className="text-red-400 text-xs">{result.vulnerabilities.filter(function(v) { return v.severity === 'Critical' }).length} Critical issues</p>
              )}
            </div>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-red-800 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'vulns' && (
            <div className="space-y-2">
              {(result.vulnerabilities || []).length === 0 ? (
                <p className="text-green-400 text-center py-4">No vulnerabilities found!</p>
              ) : (
                (result.vulnerabilities || []).map(function(vuln, i) {
                  const style = SEVERITY_STYLES[vuln.severity] || SEVERITY_STYLES.Low
                  return (
                    <div key={i} className={'rounded-xl border p-4 ' + style.split(' ').slice(1).join(' ')}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={'text-xs px-1.5 py-0.5 rounded border ' + style}>{vuln.severity}</span>
                        <p className="text-white font-semibold text-sm">{vuln.title}</p>
                      </div>
                      <p className="text-slate-300 text-xs mb-2">{vuln.description}</p>
                      {vuln.fix && (
                        <div className="bg-[#0d0d1a] rounded-lg p-2">
                          <p className="text-green-400 text-xs">Fix: {vuln.fix}</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'hardening' && (
            <div className="space-y-3">
              {(result.hardening || []).map(function(h, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">{h.category}</p>
                    <ul className="space-y-1">
                      {(h.steps || []).map(function(step, j) {
                        return <li key={j} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400 shrink-0">{j+1}.</span>{step}</li>
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'secure' && (
            <div className="bg-green-950 border border-green-800 rounded-xl p-4">
              <p className="text-green-400 text-xs font-semibold mb-2">Secure Features Already Present</p>
              <ul className="space-y-1">
                {(result.secureFeatures || []).map(function(f, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-green-400">+</span>{f}</li>
                })}
              </ul>
            </div>
          )}

          <button onClick={handleAudit} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-audit</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔒</div>
          <p className="text-white font-semibold mb-1">Security Audit Tool</p>
          <p className="text-slate-500 text-sm">Find IoT security vulnerabilities and get hardening recommendations</p>
        </div>
      )}
    </div>
  )
}

export default SecurityAudit
