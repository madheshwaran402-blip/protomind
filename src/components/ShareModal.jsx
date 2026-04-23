import { useState } from 'react'
import { saveProjectCloud } from '../services/supabase'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
  Memory: '#64748b',
}

function ShareCard({ idea, components, shareUrl }) {
  const categories = [...new Set(components.map(c => c.category))]
  const thumbnail = components.slice(0, 4).map(c => c.icon).join(' ')

  return (
    <div
      id="share-card"
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0a1a2e 100%)',
        border: '1px solid #2e2e4e',
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#2e2e4e]">
        <span className="text-indigo-400 font-bold text-sm">⚡ ProtoMind</span>
        <span className="text-slate-600 text-xs">protomind-ten.vercel.app</span>
      </div>

      {/* Main content */}
      <div className="px-5 py-5">
        <div className="text-3xl mb-3">{thumbnail}</div>
        <h2 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2">
          {idea}
        </h2>

        <div className="flex flex-wrap gap-1 mb-4">
          {categories.map(cat => (
            <span
              key={cat}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: (CATEGORY_COLORS[cat] || '#6366f1') + '25',
                color: CATEGORY_COLORS[cat] || '#6366f1',
                border: '1px solid ' + (CATEGORY_COLORS[cat] || '#6366f1') + '50',
              }}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>🔧 {components.length} components</span>
          <span>🤖 AI Generated</span>
          <span>🖨️ 3D Print Ready</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#2e2e4e] bg-[#0a0a0f]">
        <p className="text-indigo-400 text-xs font-mono truncate">{shareUrl}</p>
      </div>
    </div>
  )
}

function ShareModal({ idea, components, onClose }) {
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [shared, setShared] = useState(false)
  const [activeTab, setActiveTab] = useState('link')

  const localShareUrl = window.location.origin + '/viewer?idea=' + encodeURIComponent(idea.slice(0, 50))

  async function handleShare() {
    setLoading(true)
    try {
      const project = await saveProjectCloud(idea, components, true)
      const url = window.location.origin + '/share/' + project.share_id
      setShareUrl(url)
      setShared(true)
      notify.success('Prototype shared publicly!')
    } catch {
      setShareUrl(localShareUrl)
      setShared(true)
      notify.info('Sharing locally — sign in for cloud sharing')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    notify.success('Copied to clipboard!')
  }

  const displayUrl = shareUrl || localShareUrl

  const SHARE_PLATFORMS = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-700 hover:bg-green-600',
      url: 'https://wa.me/?text=' + encodeURIComponent('Check out my prototype: ' + idea + ' ' + displayUrl),
    },
    {
      name: 'Twitter / X',
      icon: '🐦',
      color: 'bg-sky-700 hover:bg-sky-600',
      url: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('Just built a prototype with ProtoMind AI! ' + idea) + '&url=' + encodeURIComponent(displayUrl),
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-600',
      url: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(displayUrl),
    },
    {
      name: 'Reddit',
      icon: '🤖',
      color: 'bg-orange-700 hover:bg-orange-600',
      url: 'https://reddit.com/submit?url=' + encodeURIComponent(displayUrl) + '&title=' + encodeURIComponent('Built this prototype with AI: ' + idea),
    },
  ]

  const TABS = [
    { id: 'link', label: '🔗 Share Link' },
    { id: 'social', label: '📱 Social Media' },
    { id: 'card', label: '🎨 Share Card' },
    { id: 'embed', label: '💻 Embed' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden max-h-screen overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-white font-bold text-lg">🔗 Share Prototype</h2>
            <p className="text-slate-500 text-xs mt-0.5">Share your prototype with the world</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">

          {/* Generate share link */}
          {!shared ? (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
              <div className="text-4xl mb-3">🌐</div>
              <p className="text-white font-medium mb-1">Create a shareable link</p>
              <p className="text-slate-500 text-xs mb-4">
                Generate a public link anyone can use to view your prototype
              </p>
              <button
                onClick={handleShare}
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              >
                {loading ? '⏳ Generating...' : '🔗 Generate Share Link'}
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                      activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Link tab */}
              {activeTab === 'link' && (
                <div className="space-y-3">
                  <div className="bg-[#13131f] border border-indigo-900 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-2">Share Link</p>
                    <div className="flex items-center gap-2">
                      <p className="text-indigo-400 text-xs font-mono flex-1 truncate">{displayUrl}</p>
                      <button
                        onClick={() => copyToClipboard(displayUrl)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs shrink-0 transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-center">
                    {[
                      { icon: '🔧', label: components.length + ' Components' },
                      { icon: '🤖', label: 'AI Generated' },
                      { icon: '🖨️', label: '3D Print Ready' },
                      { icon: '🌐', label: 'Public Link' },
                    ].map(item => (
                      <div key={item.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl py-2 px-3">
                        <span className="text-slate-400">{item.icon} {item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social tab */}
              {activeTab === 'social' && (
                <div className="space-y-2">
                  <p className="text-slate-500 text-xs mb-3">Share directly to social media</p>
                  {SHARE_PLATFORMS.map(platform => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-4 py-3 ${platform.color} rounded-xl transition`}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <span className="text-white text-sm font-medium">Share on {platform.name}</span>
                      <span className="ml-auto text-white opacity-60 text-xs">↗️</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Card tab */}
              {activeTab === 'card' && (
                <div className="space-y-3">
                  <p className="text-slate-500 text-xs">Preview of your share card</p>
                  <ShareCard idea={idea} components={components} shareUrl={displayUrl} />
                  <button
                    onClick={() => copyToClipboard(displayUrl)}
                    className="w-full py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
                  >
                    📋 Copy Link to Share Card
                  </button>
                </div>
              )}

              {/* Embed tab */}
              {activeTab === 'embed' && (
                <div className="space-y-3">
                  <p className="text-slate-500 text-xs">Embed code for your website or blog</p>
                  <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl p-4">
                    <pre className="text-green-400 text-xs overflow-x-auto whitespace-pre-wrap">
{`<iframe
  src="${displayUrl}"
  width="100%"
  height="600"
  frameborder="0"
  title="${idea}"
></iframe>`}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`<iframe src="${displayUrl}" width="100%" height="600" frameborder="0" title="${idea}"></iframe>`)}
                    className="w-full py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
                  >
                    📋 Copy Embed Code
                  </button>
                </div>
              )}
            </>
          )}

          {/* Quick copy without account */}
          <div className="border-t border-[#1e1e2e] pt-4">
            <p className="text-slate-600 text-xs mb-2">Quick share (no account needed)</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={'Check out my prototype: ' + idea.slice(0, 60)}
                className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-xs text-slate-400 outline-none"
              />
              <button
                onClick={() => copyToClipboard('Check out my prototype: ' + idea + '\n\nBuilt with ProtoMind AI: ' + localShareUrl)}
                className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal