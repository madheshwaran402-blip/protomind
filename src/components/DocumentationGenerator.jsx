import { useState } from 'react'
import { generateDocumentation, generateMarkdown } from '../services/documentationGenerator'
import { getPinAssignments } from '../services/pinAssignment'
import { notify } from '../services/toast'

function DocumentationGenerator({ idea, components }) {
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setDoc(null)
    try {
      const pins = getPinAssignments(idea)
      const data = await generateDocumentation(idea, components, pins)
      setDoc(data)
      notify.success('Documentation generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleDownloadMarkdown() {
    if (!doc) return
    const md = generateMarkdown(doc, idea, components)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = (doc.title || idea).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) + '_docs.md'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Markdown documentation downloaded!')
  }

  function handleCopyMarkdown() {
    if (!doc) return
    const md = generateMarkdown(doc, idea, components)
    navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    notify.success('Documentation copied!')
  }

  const TABS = [
    { id: 'preview', label: '👁 Preview' },
    { id: 'wiring', label: '🔌 Wiring' },
    { id: 'code', label: '💻 Code' },
    { id: 'troubleshoot', label: '🔧 Troubleshoot' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI generates complete technical documentation for your prototype
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '📄 Writing...' : '📄 Generate Docs'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is writing your documentation...</p>
        </div>
      )}

      {doc && !loading && (
        <>
          {/* Header */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-white font-bold text-base">{doc.title}</h3>
              <p className="text-slate-500 text-xs mt-0.5">v{doc.version} · {components.length} components</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-300 rounded-lg text-xs transition"
              >
                {copied ? '✅' : '📋 Copy MD'}
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
              >
                ⬇️ Download .md
              </button>
            </div>
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

          {/* Preview tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Overview</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{doc.overview}</p>
              </div>

              {doc.features?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Features</h4>
                  <ul className="space-y-1">
                    {doc.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-400 shrink-0">✓</span>
                        <p className="text-slate-300">{f}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {doc.requirements?.hardware?.length > 0 && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">🔧 Hardware</h4>
                    <ul className="space-y-1">
                      {doc.requirements.hardware.map((h, i) => (
                        <li key={i} className="text-slate-300 text-xs">• {h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {doc.requirements?.software?.length > 0 && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">💻 Software</h4>
                    <ul className="space-y-1">
                      {doc.requirements.software.map((s, i) => (
                        <li key={i} className="text-slate-300 text-xs">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {doc.gettingStarted?.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">🚀 Getting Started</h4>
                  <ol className="space-y-2">
                    {doc.gettingStarted.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                        <p className="text-slate-300">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {doc.futureImprovements?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">🔮 Future Improvements</h4>
                  <ul className="space-y-1">
                    {doc.futureImprovements.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600 text-xs">☐</span>
                        <p className="text-slate-400">{f}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Wiring tab */}
          {activeTab === 'wiring' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2e2e4e] bg-[#0d0d1a]">
                    <th className="text-left px-4 py-2 text-slate-500">From</th>
                    <th className="text-left px-4 py-2 text-slate-500">To</th>
                    <th className="text-left px-4 py-2 text-slate-500">Wire</th>
                    <th className="text-left px-4 py-2 text-slate-500">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.wiringGuide?.map((wire, i) => {
                    const WIRE_COLORS = {
                      red: '#ef4444', black: '#374151', yellow: '#eab308',
                      blue: '#3b82f6', green: '#22c55e', orange: '#f97316',
                      white: '#f8fafc', brown: '#92400e', purple: '#a855f7',
                    }
                    return (
                      <tr key={i} className="border-b border-[#1e1e2e] last:border-0">
                        <td className="px-4 py-2.5 text-indigo-400 font-mono">{wire.from}</td>
                        <td className="px-4 py-2.5 text-green-400 font-mono">{wire.to}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-3 h-3 rounded-full border border-slate-600"
                              style={{ backgroundColor: WIRE_COLORS[wire.color?.toLowerCase()] || '#6366f1' }}
                            />
                            <span className="text-slate-400 capitalize">{wire.color || 'any'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{wire.notes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Code documentation tab */}
          {activeTab === 'code' && doc.codeDocumentation && (
            <div className="space-y-3">
              {doc.codeDocumentation.globalVariables?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Global Variables</p>
                  <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-4">
                    <pre className="text-green-400 text-xs font-mono leading-relaxed">
                      {doc.codeDocumentation.globalVariables.join('\n')}
                    </pre>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {doc.codeDocumentation.setupFunction && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-blue-400 mb-2 font-mono">void setup()</h4>
                    <p className="text-slate-300 text-sm">{doc.codeDocumentation.setupFunction}</p>
                  </div>
                )}
                {doc.codeDocumentation.loopFunction && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-blue-400 mb-2 font-mono">void loop()</h4>
                    <p className="text-slate-300 text-sm">{doc.codeDocumentation.loopFunction}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Troubleshooting tab */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-3">
              {doc.troubleshooting?.map((issue, i) => (
                <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-white text-sm font-semibold mb-2">🔧 {issue.problem}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">
                      <span className="text-yellow-400 font-medium">Cause: </span>
                      {issue.cause}
                    </p>
                    <p className="text-xs text-slate-400">
                      <span className="text-green-400 font-medium">Solution: </span>
                      {issue.solution}
                    </p>
                  </div>
                </div>
              ))}

              {doc.safetyNotes?.length > 0 && (
                <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                  <h4 className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2">⚠️ Safety Notes</h4>
                  <ul className="space-y-1">
                    {doc.safetyNotes.map((note, i) => (
                      <li key={i} className="text-red-200 text-sm flex items-start gap-2">
                        <span className="shrink-0">•</span> {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Documentation
          </button>
        </>
      )}

      {!doc && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-white font-semibold mb-1">Documentation Generator</p>
          <p className="text-slate-500 text-sm mb-4">Complete technical docs with wiring, code reference, and troubleshooting</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Overview & features</span>
            <span>✓ Wiring guide</span>
            <span>✓ Code docs</span>
            <span>✓ Troubleshooting</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentationGenerator