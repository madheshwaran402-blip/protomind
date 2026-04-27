import { useState } from 'react'
import { generateVideoScript } from '../services/videoScript'
import { notify } from '../services/toast'

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: '#ef4444', desc: '10-15 min educational' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000', desc: '60s fast-paced' },
  { id: 'shorts', label: 'Shorts', icon: '📱', color: '#ef4444', desc: '60s vertical' },
  { id: 'instagram', label: 'Reels', icon: '📸', color: '#a855f7', desc: '30-60s visual' },
]

function ScriptSection({ section, index }) {
  const [expanded, setExpanded] = useState(index === 0)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(section.script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    notify.success('Script section copied!')
  }

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-semibold">{section.name}</p>
          <p className="text-slate-500 text-xs">{section.duration}</p>
        </div>
        <span className="text-slate-600">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#2e2e4e] space-y-3">
          {/* Script */}
          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">🎤 Script</p>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                {copied ? '✅' : '📋 Copy'}
              </button>
            </div>
            <div className="bg-[#0d0d1a] rounded-xl p-4 border border-[#1e1e2e]">
              <p className="text-slate-300 text-sm leading-relaxed italic">"{section.script}"</p>
            </div>
          </div>

          {/* B-Roll */}
          {section.bRoll && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">🎥 B-Roll / What to Film</p>
              <div className="bg-blue-950 border border-blue-900 rounded-lg p-3">
                <p className="text-blue-200 text-xs">{section.bRoll}</p>
              </div>
            </div>
          )}

          {/* Tips */}
          {section.tips && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">💡 Filming Tip</p>
              <div className="bg-yellow-950 border border-yellow-900 rounded-lg p-3">
                <p className="text-yellow-200 text-xs">{section.tips}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function VideoScriptGenerator({ idea, components }) {
  const [script, setScript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [platform, setPlatform] = useState('youtube')
  const [activeTab, setActiveTab] = useState('script')
  const [copied, setCopied] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setScript(null)
    try {
      const data = await generateVideoScript(idea, components, platform)
      setScript(data)
      notify.success('Video script ready!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleExport() {
    if (!script) return
    const lines = [
      '=== VIDEO SCRIPT ===',
      'Platform: ' + platform.toUpperCase(),
      'Title: ' + script.title,
      'Duration: ' + script.estimatedDuration,
      '',
      '=== THUMBNAIL CONCEPT ===',
      script.thumbnail,
      '',
      '=== SECTIONS ===',
      '',
      ...(script.sections || []).flatMap(s => [
        '[' + s.name + '] ' + s.duration,
        'SCRIPT: ' + s.script,
        'B-ROLL: ' + (s.bRoll || ''),
        '',
      ]),
      '=== PARTS LIST REVEAL ===',
      script.partsListReveal || '',
      '',
      '=== CALL TO ACTION ===',
      script.callToAction || '',
      '',
      '=== DESCRIPTION ===',
      script.description || '',
      '',
      '=== CHAPTERS ===',
      ...(script.chapters || []),
      '',
      '=== TAGS ===',
      (script.tags || []).join(', '),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'VideoScript_' + platform + '.txt'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Script exported!')
  }

  function copyAll() {
    if (!script) return
    const allScript = (script.sections || []).map(s => s.script).join('\n\n')
    navigator.clipboard.writeText(allScript)
    setCopied('all')
    setTimeout(() => setCopied(''), 2000)
    notify.success('Full script copied!')
  }

  const TABS = [
    { id: 'script', label: '🎤 Script' },
    { id: 'metadata', label: '📋 Metadata' },
    { id: 'extras', label: '✨ Extras' },
  ]

  return (
    <div className="space-y-4">

      {/* Platform selector */}
      <div className="grid grid-cols-4 gap-2">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => { setPlatform(p.id); setScript(null) }}
            className={`p-2.5 rounded-xl border text-center transition ${
              platform === p.id
                ? 'bg-indigo-950 border-indigo-700'
                : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-800'
            }`}
          >
            <p className="text-lg mb-1">{p.icon}</p>
            <p className="text-white text-xs font-medium">{p.label}</p>
            <p className="text-slate-600 text-xs">{p.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">
          AI writes a complete {PLATFORMS.find(p => p.id === platform)?.label} script for your build
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🎬 Writing...' : '🎬 Write Script'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is writing your video script...</p>
        </div>
      )}

      {script && !loading && (
        <>
          {/* Video card */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <p className="text-white font-bold text-base leading-tight">{script.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>⏱ {script.estimatedDuration}</span>
                  <span>·</span>
                  <span>{script.sections?.length || 0} sections</span>
                  <span>·</span>
                  <span className="capitalize">{platform}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={copyAll}
                  className="px-3 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-300 rounded-lg text-xs transition"
                >
                  {copied === 'all' ? '✅' : '📋 All'}
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  ⬇️ Export
                </button>
              </div>
            </div>

            {/* Thumbnail */}
            {script.thumbnail && (
              <div className="bg-[#0d0d1a] rounded-lg p-3 border border-[#1e1e2e]">
                <p className="text-xs text-slate-500 mb-1">🖼️ Thumbnail Concept</p>
                <p className="text-slate-300 text-xs">{script.thumbnail}</p>
              </div>
            )}
          </div>

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

          {/* Script tab */}
          {activeTab === 'script' && (
            <div className="space-y-2">
              {script.sections?.map((section, i) => (
                <ScriptSection key={i} section={section} index={i} />
              ))}
            </div>
          )}

          {/* Metadata tab */}
          {activeTab === 'metadata' && (
            <div className="space-y-3">
              {/* Tags */}
              {script.tags?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags / Keywords</h4>
                    <button
                      onClick={() => { navigator.clipboard.writeText(script.tags.join(', ')); notify.success('Tags copied!') }}
                      className="text-xs text-slate-500 hover:text-white transition"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {script.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-[#0d0d1a] text-slate-400 px-2 py-1 rounded-full border border-[#2e2e4e]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapters */}
              {script.chapters?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Video Chapters</h4>
                    <button
                      onClick={() => { navigator.clipboard.writeText(script.chapters.join('\n')); notify.success('Chapters copied!') }}
                      className="text-xs text-slate-500 hover:text-white transition"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="space-y-1">
                    {script.chapters.map((ch, i) => (
                      <p key={i} className="text-slate-300 text-sm font-mono">{ch}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {script.description && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">YouTube Description</h4>
                    <button
                      onClick={() => { navigator.clipboard.writeText(script.description); notify.success('Description copied!') }}
                      className="text-xs text-slate-500 hover:text-white transition"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{script.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Extras tab */}
          {activeTab === 'extras' && (
            <div className="space-y-3">
              {script.partsListReveal && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">🔧 Parts List Reveal Script</h4>
                  <div className="bg-[#0d0d1a] rounded-lg p-3">
                    <p className="text-slate-300 text-sm italic">"{script.partsListReveal}"</p>
                  </div>
                </div>
              )}

              {script.callToAction && (
                <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">📢 Call to Action</h4>
                  <div className="bg-[#0d0d1a] rounded-lg p-3">
                    <p className="text-slate-300 text-sm italic">"{script.callToAction}"</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(script.callToAction); notify.success('CTA copied!') }}
                    className="mt-2 text-xs text-red-400 hover:text-red-300 transition"
                  >
                    📋 Copy CTA
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Script
          </button>
        </>
      )}

      {!script && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🎬</div>
          <p className="text-white font-semibold mb-1">Video Script Generator</p>
          <p className="text-slate-500 text-sm mb-4">AI writes your complete YouTube or TikTok build video script</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Hook & intro</span>
            <span>✓ Demo sections</span>
            <span>✓ B-Roll guide</span>
            <span>✓ Tags & chapters</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoScriptGenerator