import { useState } from 'react'
import { generateReadme, buildReadmeMarkdown } from '../services/readmeService'
import { notify } from '../services/toast'

function ReadmeGenerator({ idea, components }) {
  const [readme, setReadme] = useState(null)
  const [loading, setLoading] = useState(false)
  const [author, setAuthor] = useState('')
  const [activeTab, setActiveTab] = useState('preview')
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setReadme(null)
    try {
      const data = await generateReadme(idea, components, { author })
      setReadme(data)
      notify.success('README generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function getMarkdown() {
    if (!readme) return ''
    return buildReadmeMarkdown(readme, idea, components, { author })
  }

  function handleCopy() {
    const md = getMarkdown()
    navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    notify.success('README copied to clipboard!')
  }

  function handleDownload() {
    const md = getMarkdown()
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'README.md'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('README.md downloaded!')
  }

  const TABS = [
    { id: 'preview', label: '👁️ Preview' },
    { id: 'raw', label: '📝 Raw Markdown' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          Generate a complete GitHub README.md for your prototype
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '📝 Writing...' : '📝 Generate README'}
        </button>
      </div>

      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-xs text-slate-500 hover:text-white transition"
        >
          {showOptions ? '▲ Hide options' : '▼ Options (optional)'}
        </button>
        {showOptions && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-1">Your GitHub Username</p>
            <input
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="e.g. madheshwaran402-blip"
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is writing your README...</p>
        </div>
      )}

      {readme && !loading && (
        <>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              {copied ? '✅ Copied!' : '📋 Copy Markdown'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              ⬇️ Download README.md
            </button>
          </div>

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

          {activeTab === 'preview' && (
            <div className="bg-white rounded-2xl p-5 space-y-3">
              <h1 className="text-gray-900 font-black text-2xl">{readme.projectTitle}</h1>
              <div className="flex flex-wrap gap-1">
                {['Arduino', 'MIT License', 'Prototype', 'ProtoMind'].map((badge, i) => {
                  const colors = ['#00979D', '#22c55e', '#f59e0b', '#6366f1']
                  return (
                    <span key={i} className="text-white text-xs px-2 py-1 rounded font-bold" style={{ backgroundColor: colors[i] }}>
                      {badge}
                    </span>
                  )
                })}
              </div>
              <p className="text-gray-500 italic text-sm border-l-4 border-gray-200 pl-3">
                {readme.shortDescription}
              </p>
              <div>
                <h2 className="text-gray-900 font-bold text-base mb-1">📋 Description</h2>
                <p className="text-gray-600 text-sm">{readme.longDescription}</p>
              </div>
              {readme.features?.length > 0 && (
                <div>
                  <h2 className="text-gray-900 font-bold text-base mb-1">✨ Features</h2>
                  <ul className="space-y-0.5">
                    {readme.features.map((f, i) => (
                      <li key={i} className="text-gray-600 text-sm flex items-center gap-1">
                        <span className="text-green-500">✅</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h2 className="text-gray-900 font-bold text-base mb-1">🔧 Components</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-3 py-1.5 text-gray-700 border border-gray-200">Component</th>
                        <th className="text-left px-3 py-1.5 text-gray-700 border border-gray-200">Category</th>
                        <th className="text-left px-3 py-1.5 text-gray-700 border border-gray-200">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((comp, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-1.5 text-gray-900 border border-gray-200 font-medium">{comp.name}</td>
                          <td className="px-3 py-1.5 text-gray-600 border border-gray-200">{comp.category}</td>
                          <td className="px-3 py-1.5 text-gray-600 border border-gray-200">{comp.estimatedPrice || '$5-15'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {readme.troubleshooting?.length > 0 && (
                <div>
                  <h2 className="text-gray-900 font-bold text-base mb-1">🛠️ Troubleshooting</h2>
                  <div className="space-y-2">
                    {readme.troubleshooting.map((t, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-800 text-xs font-bold">Problem: {t.problem}</p>
                        <p className="text-gray-600 text-xs">Solution: {t.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2">
                <p className="text-gray-400 text-xs text-center">Built with ProtoMind</p>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-500 text-xs ml-2">README.md</span>
                <button onClick={handleCopy} className="ml-auto text-xs text-slate-500 hover:text-white transition">
                  {copied ? '✅ Copied' : '📋 Copy'}
                </button>
              </div>
              <pre className="p-4 text-xs text-green-400 overflow-x-auto font-mono leading-relaxed max-h-96 whitespace-pre-wrap">
                {getMarkdown()}
              </pre>
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Regenerate README
          </button>
        </>
      )}

      {!readme && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-white font-semibold mb-1">GitHub README Generator</p>
          <p className="text-slate-500 text-sm mb-4">Generate a professional README.md ready to paste into GitHub</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Badges</span>
            <span>✓ Component table</span>
            <span>✓ Installation steps</span>
            <span>✓ Troubleshooting</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadmeGenerator
