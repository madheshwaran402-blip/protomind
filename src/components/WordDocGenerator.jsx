import { useState } from 'react'
import { generateWordDoc } from '../services/wordDocService'
import { notify } from '../services/toast'

export default function WordDocGenerator({ idea, components }) {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [options, setOptions] = useState({
    title: '',
    summary: '',
    features: '',
    challenges: '',
    recommendations: '',
  })
  const [showOptions, setShowOptions] = useState(false)

  function updateOption(key, value) {
    setOptions(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = value
      return next
    })
  }

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const aiContent = {
        title: options.title || idea,
        summary: options.summary || ('This document describes the ' + idea + ' prototype.'),
        features: options.features ? options.features.split('\n').filter(Boolean) : [],
        challenges: options.challenges ? options.challenges.split('\n').filter(Boolean) : [],
        recommendations: options.recommendations ? options.recommendations.split('\n').filter(Boolean) : [],
      }

      const blob = await generateWordDoc(idea, components, aiContent)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = (aiContent.title || 'ProtoMind_Report').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) + '.docx'
      link.click()
      URL.revokeObjectURL(url)
      setGenerated(true)
      setTimeout(function() { setGenerated(false) }, 3000)
      notify.success('Word document downloaded!')
    } catch (err) {
      notify.error('Failed to generate document: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">
        Generate a professional Word document (.docx) report for your prototype
      </p>

      {/* Options toggle */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <button
          onClick={function() { setShowOptions(!showOptions) }}
          className="text-xs text-slate-500 hover:text-white transition"
        >
          {showOptions ? '▲ Hide options' : '▼ Customise report content (optional)'}
        </button>

        {showOptions && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Report Title</p>
              <input
                value={options.title}
                onChange={function(e) { updateOption('title', e.target.value) }}
                placeholder={idea}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Executive Summary</p>
              <textarea
                value={options.summary}
                onChange={function(e) { updateOption('summary', e.target.value) }}
                placeholder="Brief summary of your prototype..."
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none resize-none"
                rows={2}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Features (one per line)</p>
              <textarea
                value={options.features}
                onChange={function(e) { updateOption('features', e.target.value) }}
                placeholder="Real-time monitoring&#10;Automatic alerts&#10;Low power mode"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none resize-none font-mono"
                rows={3}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Challenges (one per line)</p>
              <textarea
                value={options.challenges}
                onChange={function(e) { updateOption('challenges', e.target.value) }}
                placeholder="I2C bus conflicts&#10;Power consumption optimization"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none resize-none font-mono"
                rows={2}
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Recommendations (one per line)</p>
              <textarea
                value={options.recommendations}
                onChange={function(e) { updateOption('recommendations', e.target.value) }}
                placeholder="Add pull-up resistors&#10;Use decoupling capacitors"
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none resize-none font-mono"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Report preview info */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Document Includes</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '📄', label: 'Cover Page' },
            { icon: '📋', label: 'Executive Summary' },
            { icon: '🔧', label: 'Component Table' },
            { icon: '💰', label: 'Cost Analysis' },
            { icon: '⚠️', label: 'Challenges' },
            { icon: '💡', label: 'Recommendations' },
            { icon: '📊', label: 'Project Overview' },
            { icon: '🏁', label: 'Conclusion' },
          ].map(function(item) {
            return (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span>{item.icon}</span>
                <span className="text-slate-400">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || components.length === 0}
        className={'w-full py-4 rounded-2xl text-sm font-bold transition disabled:opacity-50 ' + (
          generated
            ? 'bg-green-700 text-green-100'
            : 'bg-blue-700 hover:bg-blue-600 text-white'
        )}
      >
        {loading ? '📝 Generating .docx...' : generated ? '✅ Document Downloaded!' : '📝 Generate Word Document (.docx)'}
      </button>

      {components.length === 0 && (
        <p className="text-slate-600 text-xs text-center">Add components to generate a document</p>
      )}

      <div className="text-xs text-slate-600 text-center">
        Opens in Microsoft Word, Google Docs, or LibreOffice
      </div>
    </div>
  )
}