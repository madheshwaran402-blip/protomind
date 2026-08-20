import { useState } from 'react'
import { buildCrowdfundingCampaign, saveCampaign, getCampaign } from '../services/crowdfundingService'
import { notify } from '../services/toast'

const TIER_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7']

function CrowdfundingBuilder({ idea, components }) {
  const [campaign, setCampaign] = useState(getCampaign(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('story')

  async function handleBuild() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await buildCrowdfundingCampaign(idea, components)
      setCampaign(data)
      saveCampaign(idea, data)
      notify.success('Crowdfunding campaign ready!')
    } catch { notify.error('Build failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    notify.success('Copied!')
  }

  const TABS = [{ id: 'story', label: '📖 Story' }, { id: 'tiers', label: '🎁 Tiers' }, { id: 'faq', label: '❓ FAQ' }, { id: 'platforms', label: '🚀 Platforms' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Build a complete crowdfunding campaign with tiers, story and platform recommendations</p>
        <button onClick={handleBuild} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? '🚀 Building...' : '🚀 Build Campaign'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Building crowdfunding campaign...</p>
        </div>
      )}

      {campaign && !loading && (
        <>
          <div className="bg-gradient-to-r from-emerald-950 to-[#0d0d1a] border border-emerald-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-emerald-400 text-xs font-semibold mb-1">🚀 CAMPAIGN</p>
                <h3 className="text-white font-black text-xl">{campaign.campaignTitle}</h3>
                <p className="text-emerald-300 text-sm italic mt-0.5">{campaign.tagline}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  {campaign.fundingGoal && <span className="text-emerald-400">Goal: {campaign.fundingGoal}</span>}
                  {campaign.campaignDuration && <span className="text-slate-400">Duration: {campaign.campaignDuration}</span>}
                </div>
              </div>
              <button onClick={function() { handleCopy(campaign.campaignTitle + '\n' + campaign.tagline + '\n\n' + campaign.story) }}
                className="px-3 py-2 bg-emerald-900 text-emerald-300 rounded-xl text-xs transition shrink-0">
                📋 Copy All
              </button>
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

          {activeTab === 'story' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">Campaign Story</p>
                <button onClick={function() { handleCopy(campaign.story) }} className="text-xs text-slate-500 hover:text-white">📋 Copy</button>
              </div>
              <p className="text-white text-sm leading-relaxed">{campaign.story}</p>
            </div>
          )}

          {activeTab === 'tiers' && (
            <div className="space-y-3">
              {(campaign.rewardTiers || []).map(function(tier, i) {
                const color = TIER_COLORS[i % TIER_COLORS.length]
                return (
                  <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: color + '10', borderColor: color + '40' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-bold">{tier.tier}</p>
                      <span className="font-black text-lg" style={{ color }}>{tier.price}</span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{tier.description}</p>
                    <div className="flex gap-3 text-xs">
                      {tier.limit && <span style={{ color }}>Limited: {tier.limit}</span>}
                      {tier.estimatedDelivery && <span className="text-slate-500">📅 {tier.estimatedDelivery}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              {(campaign.faq || []).map(function(item, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-emerald-400 font-semibold text-sm mb-1">❓ {item.question}</p>
                    <p className="text-slate-300 text-sm">{item.answer}</p>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'platforms' && (
            <div className="space-y-3">
              {(campaign.platforms || []).map(function(platform, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-bold text-sm mb-2">{platform.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                      {platform.pros && <p className="text-green-400">✓ {platform.pros}</p>}
                      {platform.cons && <p className="text-red-400">✗ {platform.cons}</p>}
                    </div>
                    {platform.bestFor && <p className="text-indigo-400 text-xs">Best for: {platform.bestFor}</p>}
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleBuild} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">↺ Rebuild Campaign</button>
        </>
      )}

      {!campaign && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🚀</div>
          <p className="text-white font-semibold mb-1">Crowdfunding Campaign Builder</p>
          <p className="text-slate-500 text-sm">Build a Kickstarter/Indiegogo campaign with reward tiers and FAQ</p>
        </div>
      )}
    </div>
  )
}

export default CrowdfundingBuilder
