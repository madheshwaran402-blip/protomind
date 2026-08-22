import { useState } from 'react'
import { checkSignalIntegrity, saveSignalReport, getSignalReport } from '../services/signalIntegrityService'
import { notify } from '../services/toast'

function SignalIntegrityChecker({ idea, components }) {
  const [result, setResult] = useState(getSignalReport(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('signals')

  async function handleCheck() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await checkSignalIntegrity(idea, components)
      setResult(data)
      saveSignalReport(idea, data)
      notify.success('Signal integrity check complete!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const scoreColor = result ? (result.overallScore >= 75 ? '#22c55e' : result.overallScore >= 50 ? '#f59e0b' : '#ef4444') : '#6366f1'
  const TABS = [{ id: 'signals', label: 'Signals' }, { id: 'noise', label: 'Noise Risks' }, { id: 'pcb', label: 'PCB Tips' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Check for signal integrity issues across all communication protocols</p>
        <button onClick={handleCheck} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Checking...' : 'Check Signals'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Checking signal integrity...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1e1e2e" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={scoreColor} strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - result.overallScore / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-black" style={{ color: scoreColor }}>{result.overallScore}</p>
              </div>
            </div>
            <div>
              <p className="text-white font-bold">Signal Integrity Score</p>
              <p className="text-slate-400 text-xs">{(result.signals || []).length} signals analysed</p>
            </div>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-violet-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'signals' && (
            <div className="space-y-3">
              {(result.signals || []).map(function(sig, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-bold text-sm">{sig.name}</p>
                      <span className="text-xs bg-violet-950 text-violet-400 border border-violet-800 px-1.5 py-0.5 rounded">{sig.protocol}</span>
                      {sig.frequency && <span className="text-slate-500 text-xs">{sig.frequency}</span>}
                    </div>
                    {sig.issues && sig.issues.length > 0 && (
                      <div className="mb-2">
                        <p className="text-red-400 text-xs font-semibold mb-1">Issues:</p>
                        {sig.issues.map(function(issue, j) {
                          return <p key={j} className="text-slate-300 text-xs">- {issue}</p>
                        })}
                      </div>
                    )}
                    {sig.fixes && sig.fixes.length > 0 && (
                      <div>
                        <p className="text-green-400 text-xs font-semibold mb-1">Fixes:</p>
                        {sig.fixes.map(function(fix, j) {
                          return <p key={j} className="text-slate-300 text-xs">+ {fix}</p>
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'noise' && (
            <div className="space-y-2">
              {(result.noiseRisks || []).map(function(risk, i) {
                return (
                  <div key={i} className="bg-orange-950 border border-orange-800 rounded-xl p-4">
                    <p className="text-orange-400 font-semibold text-sm mb-1">{risk.source}</p>
                    <p className="text-slate-400 text-xs mb-1">Affects: {risk.affected}</p>
                    <p className="text-green-400 text-xs">Fix: {risk.mitigation}</p>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'pcb' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-2">PCB Layout Guidelines</p>
              <ul className="space-y-2">
                {(result.pcbGuidelines || []).map(function(tip, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-violet-400 shrink-0">{i+1}.</span>{tip}</li>
                })}
              </ul>
            </div>
          )}

          <button onClick={handleCheck} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Re-check</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📡</div>
          <p className="text-white font-semibold mb-1">Signal Integrity Checker</p>
          <p className="text-slate-500 text-sm">Check SPI, I2C, UART and other signals for integrity issues</p>
        </div>
      )}
    </div>
  )
}

export default SignalIntegrityChecker
