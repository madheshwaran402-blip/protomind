import { useState } from 'react'
import { generatePressRelease, savePressRelease, getPressRelease, PRESS_ANGLES } from '../services/pressReleaseService'
import { notify } from '../services/toast'

function PressReleaseGenerator({ idea, components }) {
  const [angle, setAngle] = useState('Product Launch')
  const [result, setResult] = useState(getPressRelease(idea, 'Product Launch'))
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleSelectAngle(a) {
    setAngle(a)
    setResult(getPressRelease(idea, a))
  }

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generatePressRelease(idea, components, angle)
      setResult(data)
      savePressRelease(idea, angle, data)
      notify.success('Press release ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function buildFullRelease() {
    if (!result) return ''
    const parts = [
      'FOR IMMEDIATE RELEASE', '',
      result.headline,
      result.subheadline, '',
      result.dateline, '',
      result.leadParagraph, '',
      ...(result.bodyParagraphs || []).flatMap(function(p) { return [p, ''] }),
      '"' + (result.quote?.text || '') + '"',
      '— ' + (result.quote?.attribution || ''), '',
      'About:', result.boilerplate, '',
      'Media Contact:',
      result.contact?.name || '',
      result.contact?.email || '',
      result.contact?.phone || '',
      '', '###',
    ]
    return parts.join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildFullRelease())
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Press release copied!')
  }

  function handleDownload() {
    const blob = new Blob([buildFullRelease()], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'press_release.txt'; link.click()
    URL.revokeObjectURL(url)
    notify.success('Downloaded!')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap">
        {PRESS_ANGLES.map(function(a) {
          const hasCache = !!getPressRelease(idea, a)
          return (
            <button key={a} onClick={function() { handleSelectAngle(a) }}
              className={'text-xs px-3 py-1.5 rounded-xl border transition relative ' + (angle === a ? 'bg-slate-700 text-white border-slate-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]')}>
              {a}
              {hasCache && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
          {loading ? 'Writing...' : 'Generate Press Release'}
        </button>
        {result && (
          <>
            <button onClick={handleCopy} className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
              {copied ? '✅' : '📋'}
            </button>
            <button onClick={handleDownload} className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">⬇️</button>
          </>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Writing press release...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-5">
            <p className="text-slate-600 text-xs mb-2">FOR IMMEDIATE RELEASE</p>
            <p className="text-white font-black text-xl leading-snug mb-1">{result.headline}</p>
            <p className="text-slate-400 text-sm">{result.subheadline}</p>
            <p className="text-slate-600 text-xs mt-2">{result.dateline}</p>
          </div>

          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-white text-sm leading-relaxed font-medium">{result.leadParagraph}</p>
          </div>

          {(result.bodyParagraphs || []).map(function(para, i) {
            return (
              <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <p className="text-slate-300 text-sm leading-relaxed">{para}</p>
              </div>
            )
          })}

          {result.quote && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 border-l-4 border-l-slate-400">
              <p className="text-white text-sm italic mb-2">"{result.quote.text}"</p>
              <p className="text-slate-400 text-xs">— {result.quote.attribution}</p>
            </div>
          )}

          {result.boilerplate && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-slate-500 text-xs font-semibold mb-1">About</p>
              <p className="text-slate-400 text-xs">{result.boilerplate}</p>
            </div>
          )}

          {result.contact && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-slate-500 text-xs font-semibold mb-1">Media Contact</p>
              <p className="text-white text-xs">{result.contact.name}</p>
              <p className="text-blue-400 text-xs">{result.contact.email}</p>
              {result.contact.phone && <p className="text-slate-400 text-xs">{result.contact.phone}</p>}
            </div>
          )}

          <p className="text-slate-600 text-sm text-center font-bold">###</p>
          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📰</div>
          <p className="text-white font-semibold mb-1">Press Release Generator</p>
          <p className="text-slate-500 text-sm">Generate professional press releases for launches, funding and milestones</p>
        </div>
      )}
    </div>
  )
}

export default PressReleaseGenerator
