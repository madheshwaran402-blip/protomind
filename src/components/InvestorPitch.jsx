import { useState } from 'react'
import { generateInvestorPitch, saveInvestorPitch, getInvestorPitch } from '../services/investorPitchService'
import { notify } from '../services/toast'

const FUND_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444']

function InvestorPitch({ idea, components }) {
  const [pitch, setPitch] = useState(getInvestorPitch(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateInvestorPitch(idea, components)
      setPitch(data)
      saveInvestorPitch(idea, data)
      notify.success('Investor pitch ready!')
    } catch { notify.error('Generation failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleCopy() {
    if (!pitch) return
    const text = [
      pitch.companyName + ' - ' + pitch.tagline,
      '',
      'PROBLEM: ' + pitch.problem,
      'SOLUTION: ' + pitch.solution,
      'MARKET SIZE: ' + pitch.marketSize,
      'BUSINESS MODEL: ' + pitch.businessModel,
      '',
      'FINANCIALS:',
      'Unit Cost: ' + pitch.financials?.unitCost,
      'Selling Price: ' + pitch.financials?.sellingPrice,
      'Margin: ' + pitch.financials?.margin,
      '',
      'ASK: ' + pitch.askAmount,
    ].join('\n')
    navigator.clipboard.writeText(text)
    notify.success('Pitch copied!')
  }

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'financials', label: '💰 Financials' },
    { id: 'funds', label: '💸 Use of Funds' },
    { id: 'team', label: '👥 Team' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate a complete investor pitch deck data with financials and use of funds</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '💼 Building...' : '💼 Build Pitch'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building investor pitch...</p>
        </div>
      )}

      {pitch && !loading && (
        <>
          <div className="bg-gradient-to-r from-emerald-950 to-[#0d0d1a] border border-emerald-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-emerald-400 text-xs font-semibold mb-1">💼 INVESTOR PITCH</p>
                <h3 className="text-white font-black text-2xl">{pitch.companyName}</h3>
                <p className="text-emerald-300 text-sm italic mt-0.5">{pitch.tagline}</p>
                {pitch.askAmount && (
                  <p className="text-yellow-400 font-bold mt-2">Seeking: {pitch.askAmount}</p>
                )}
              </div>
              <button onClick={handleCopy} className="px-3 py-2 bg-emerald-900 text-emerald-300 rounded-xl text-xs shrink-0">📋 Copy</button>
            </div>
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (activeTab === tab.id ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-3">
              {[
                { label: '❗ Problem', value: pitch.problem },
                { label: '💡 Solution', value: pitch.solution },
                { label: '📈 Market Size', value: pitch.marketSize },
                { label: '💰 Business Model', value: pitch.businessModel },
                { label: '🚪 Exit Strategy', value: pitch.exitStrategy },
              ].map(function(item) {
                return item.value ? (
                  <div key={item.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-emerald-400 text-xs font-semibold mb-1">{item.label}</p>
                    <p className="text-white text-sm">{item.value}</p>
                  </div>
                ) : null
              })}
              {pitch.traction && pitch.traction.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-emerald-400 text-xs font-semibold mb-2">📊 Traction</p>
                  <ul className="space-y-1">
                    {pitch.traction.map(function(t, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-emerald-400">✓</span>{t}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financials' && pitch.financials && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Unit Cost', value: pitch.financials.unitCost, color: 'text-red-400' },
                  { label: 'Selling Price', value: pitch.financials.sellingPrice, color: 'text-green-400' },
                  { label: 'Gross Margin', value: pitch.financials.margin, color: 'text-blue-400' },
                  { label: 'Break-Even', value: pitch.financials.breakEven, color: 'text-yellow-400' },
                ].map(function(item) {
                  return item.value ? (
                    <div key={item.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
                      <p className={'text-xl font-black ' + item.color}>{item.value}</p>
                      <p className="text-slate-500 text-xs">{item.label}</p>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {activeTab === 'funds' && (
            <div className="space-y-3">
              {(pitch.useOfFunds || []).map(function(fund, i) {
                const color = FUND_COLORS[i % FUND_COLORS.length]
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <p className="text-white font-semibold text-sm">{fund.category}</p>
                      <span className="ml-auto font-black" style={{ color }}>{fund.percentage}</span>
                    </div>
                    <div className="w-full bg-[#1e1e2e] rounded-full h-1.5 mb-1">
                      <div className="h-1.5 rounded-full" style={{ width: fund.percentage, backgroundColor: color }} />
                    </div>
                    <p className="text-slate-400 text-xs">{fund.description}</p>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-2">
              {(pitch.teamRoles || []).map(function(role, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <p className="text-slate-300 text-sm">{role}</p>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Rebuild Pitch</button>
        </>
      )}

      {!pitch && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">💼</div>
          <p className="text-white font-semibold mb-1">Investor Pitch Generator</p>
          <p className="text-slate-500 text-sm">Generate a complete investor pitch with financials, market size and use of funds</p>
        </div>
      )}
    </div>
  )
}

export default InvestorPitch
