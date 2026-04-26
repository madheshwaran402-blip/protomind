import { useState } from 'react'
import { generatePrototypeName } from '../services/nameGenerator'
import { notify } from '../services/toast'

const NAME_STYLES = {
  Tech: { color: 'text-indigo-400', bg: 'bg-indigo-950', border: 'border-indigo-800' },
  Action: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  Nature: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Premium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Playful: { color: 'text-pink-400', bg: 'bg-pink-950', border: 'border-pink-800' },
  Simple: { color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-700' },
}

function ScoreBadge({ score }) {
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : '#6366f1'
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0"
      style={{ border: '2px solid ' + color, color }}
    >
      {score}
    </div>
  )
}

function ColorSwatch({ color }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(color.hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
    notify.success('Color copied: ' + color.hex)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex flex-col items-center gap-1 group"
      title={color.hex}
    >
      <div
        className="w-12 h-12 rounded-xl border-2 border-[#2e2e4e] group-hover:border-white transition"
        style={{ backgroundColor: color.hex }}
      />
      <p className="text-slate-400 text-xs font-medium">{color.name}</p>
      <p className="text-slate-600 text-xs font-mono">{copied ? 'Copied!' : color.hex}</p>
      <p className="text-slate-700 text-xs">{color.use}</p>
    </button>
  )
}

function NameGenerator({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedName, setSelectedName] = useState(null)
  const [activeTab, setActiveTab] = useState('names')
  const [copied, setCopied] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    try {
      const data = await generatePrototypeName(idea, components)
      setResult(data)
      if (data.names?.length > 0) setSelectedName(data.names[0])
      notify.success('Brand kit generated! ' + (data.names?.length || 0) + ' name ideas')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function copyText(text, label) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
    notify.success(label + ' copied!')
  }

  function exportBrandKit() {
    if (!result) return
    const lines = [
      '=== PROTOMIND BRAND KIT ===',
      'Generated for: ' + idea,
      '',
      '=== PRODUCT NAMES ===',
      ...(result.names || []).map(n => n.name + ' (' + n.style + ') — Score: ' + n.score),
      '',
      '=== TAGLINES ===',
      ...(result.taglines || []),
      '',
      '=== ELEVATOR PITCH ===',
      result['elevator pitch'] || '',
      '',
      '=== TARGET AUDIENCE ===',
      result.targetAudience || '',
      '',
      '=== UNIQUE SELLING POINT ===',
      result.uniqueSellingPoint || '',
      '',
      '=== BRAND COLORS ===',
      ...(result.colors || []).map(c => c.name + ': ' + c.hex + ' — ' + c.use),
      '',
      '=== LOGO IDEA ===',
      result.logoIdea || '',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ProtoMind_BrandKit.txt'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Brand kit exported!')
  }

  const TABS = [
    { id: 'names', label: '✨ Names' },
    { id: 'taglines', label: '💬 Taglines' },
    { id: 'brand', label: '🎨 Brand' },
    { id: 'pitch', label: '🚀 Pitch' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI creates product names, taglines, colors and pitch for your prototype
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-pink-700 hover:bg-pink-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '✨ Creating...' : '✨ Generate Brand Kit'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is branding your prototype...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Selected name hero */}
          {selectedName && (
            <div className="bg-gradient-to-br from-indigo-950 to-purple-950 border border-indigo-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Selected Name</p>
              <h2 className="text-4xl font-black text-white mb-2">{selectedName.name}</h2>
              <p className="text-indigo-300 text-sm italic mb-3">"{result.taglines?.[0]}"</p>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full border ${(NAME_STYLES[selectedName.style] || NAME_STYLES.Tech).color} ${(NAME_STYLES[selectedName.style] || NAME_STYLES.Tech).bg} ${(NAME_STYLES[selectedName.style] || NAME_STYLES.Tech).border}`}>
                  {selectedName.style}
                </span>
                <ScoreBadge score={selectedName.score} />
              </div>
            </div>
          )}

          {/* Export button */}
          <button
            onClick={exportBrandKit}
            className="w-full py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
          >
            ⬇️ Export Full Brand Kit as .txt
          </button>

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

          {/* Names tab */}
          {activeTab === 'names' && (
            <div className="space-y-2">
              {result.names?.map((name, i) => {
                const style = NAME_STYLES[name.style] || NAME_STYLES.Tech
                const isSelected = selectedName?.name === name.name
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedName(name)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition ${
                      isSelected ? 'bg-indigo-950 border-indigo-700' : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-800'
                    }`}
                  >
                    <ScoreBadge score={name.score} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold text-lg">{name.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${style.color} ${style.bg} ${style.border}`}>
                          {name.style}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{name.meaning}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); copyText(name.name, name.name) }}
                      className="px-3 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-400 rounded-lg text-xs transition shrink-0"
                    >
                      {copied === name.name ? '✅' : '📋'}
                    </button>
                  </button>
                )
              })}
            </div>
          )}

          {/* Taglines tab */}
          {activeTab === 'taglines' && (
            <div className="space-y-2">
              {result.taglines?.map((tagline, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                  <p className="text-white text-sm italic flex-1">"{tagline}"</p>
                  <button
                    onClick={() => copyText(tagline, 'Tagline')}
                    className="px-3 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-400 rounded-lg text-xs transition shrink-0"
                  >
                    {copied === 'Tagline' ? '✅' : '📋'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Brand tab */}
          {activeTab === 'brand' && (
            <div className="space-y-4">
              {/* Color palette */}
              {result.colors?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">🎨 Brand Colors</h4>
                  <div className="flex gap-4 flex-wrap">
                    {result.colors.map((color, i) => (
                      <ColorSwatch key={i} color={color} />
                    ))}
                  </div>
                </div>
              )}

              {/* Logo idea */}
              {result.logoIdea && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">🎯 Logo Concept</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.logoIdea}</p>
                </div>
              )}

              {/* Competitors */}
              {result.competitorApps?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">🏆 Similar Products</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.competitorApps.map((comp, i) => (
                      <span key={i} className="text-xs bg-[#0d0d1a] text-slate-400 px-3 py-1.5 rounded-full border border-[#2e2e4e]">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pitch tab */}
          {activeTab === 'pitch' && (
            <div className="space-y-3">
              {result['elevator pitch'] && (
                <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-5">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">🚀 Elevator Pitch</h4>
                  <p className="text-white text-sm leading-relaxed">{result['elevator pitch']}</p>
                  <button
                    onClick={() => copyText(result['elevator pitch'], 'Pitch')}
                    className="mt-3 px-4 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-300 rounded-lg text-xs transition"
                  >
                    {copied === 'Pitch' ? '✅ Copied!' : '📋 Copy Pitch'}
                  </button>
                </div>
              )}

              {result.uniqueSellingPoint && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">⭐ Unique Selling Point</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.uniqueSellingPoint}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.targetAudience && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">👥 Target Audience</h4>
                    <p className="text-slate-300 text-sm">{result.targetAudience}</p>
                  </div>
                )}
                {result.marketSize && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">📈 Market Size</h4>
                    <p className="text-slate-300 text-sm">{result.marketSize}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">✨</div>
          <p className="text-white font-semibold mb-1">AI Brand Kit Generator</p>
          <p className="text-slate-500 text-sm mb-4">Turn your prototype into a real product with a full brand identity</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Product names</span>
            <span>✓ Taglines</span>
            <span>✓ Brand colors</span>
            <span>✓ Pitch</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default NameGenerator