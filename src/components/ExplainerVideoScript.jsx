import { useState } from 'react'
import { generateVideoScript, saveVideoScript, getVideoScript, VIDEO_STYLES } from '../services/videoScriptService2'
import { notify } from '../services/toast'

function ExplainerVideoScript({ idea, components }) {
  const [style, setStyle] = useState('Educational')
  const [script, setScript] = useState(getVideoScript(idea, 'Educational'))
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [copied, setCopied] = useState(false)

  function handleSelectStyle(s) {
    setStyle(s)
    setScript(getVideoScript(idea, s))
    setActiveSection(0)
  }

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateVideoScript(idea, components, style)
      setScript(data)
      saveVideoScript(idea, style, data)
      setActiveSection(0)
      notify.success('Video script ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleCopyAll() {
    if (!script) return
    const parts = [script.title, 'Duration: ' + script.duration, '', 'HOOK (0:00-0:15):', script.hook, '']
    ;(script.sections || []).forEach(function(s) {
      parts.push('[' + s.title + '] (' + s.duration + ')')
      if (s.bRoll) parts.push('B-Roll: ' + s.bRoll)
      parts.push(s.script)
      if (s.transition) parts.push('Transition: ' + s.transition)
      parts.push('')
    })
    navigator.clipboard.writeText(parts.join('
'))
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Script copied!')
  }

  const sections = script?.sections || []

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap">
        {VIDEO_STYLES.map(function(s) {
          const hasCache = !!getVideoScript(idea, s)
          return (
            <button key={s} onClick={function() { handleSelectStyle(s) }}
              className={'text-xs px-3 py-1.5 rounded-xl border transition relative ' + (style === s ? 'bg-red-700 text-white border-red-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]')}>
              {s}
              {hasCache && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
          {loading ? 'Writing...' : 'Generate Video Script'}
        </button>
        {script && (
          <button onClick={handleCopyAll}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
            {copied ? 'Copied!' : 'Copy All'}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Writing video script...</p>
        </div>
      )}

      {script && !loading && (
        <>
          <div className="bg-red-950 border border-red-800 rounded-xl p-4">
            <p className="text-red-400 text-xs font-semibold mb-1">Video Title</p>
            <p className="text-white font-black text-lg">{script.title}</p>
            <p className="text-slate-500 text-xs">Duration: {script.duration} | Style: {style}</p>
          </div>

          {script.hook && (
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-semibold mb-1">Hook (First 15 seconds)</p>
              <p className="text-white text-sm italic">"{script.hook}"</p>
            </div>
          )}

          <div className="flex gap-1 overflow-x-auto pb-1">
            {sections.map(function(section, i) {
              return (
                <button key={i} onClick={function() { setActiveSection(i) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs transition ' + (activeSection === i ? 'bg-red-700 text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>
                  {section.title}
                </button>
              )
            })}
          </div>

          {sections[activeSection] && (
            <div className="bg-[#13131f] border border-red-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold">{sections[activeSection].title}</p>
                <span className="text-slate-500 text-xs">{sections[activeSection].duration}</span>
              </div>
              {sections[activeSection].bRoll && (
                <div className="bg-[#0d0d1a] rounded-lg p-2">
                  <p className="text-red-400 text-xs">B-Roll: {sections[activeSection].bRoll}</p>
                </div>
              )}
              <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Script</p>
                <p className="text-white text-sm leading-relaxed">{sections[activeSection].script}</p>
              </div>
              {sections[activeSection].transition && (
                <p className="text-slate-500 text-xs">Transition: {sections[activeSection].transition}</p>
              )}
              <div className="flex gap-2">
                <button onClick={function() { setActiveSection(Math.max(0, activeSection-1)) }} disabled={activeSection===0}
                  className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev</button>
                <button onClick={function() { setActiveSection(Math.min(sections.length-1, activeSection+1)) }} disabled={activeSection===sections.length-1}
                  className="flex-1 py-1.5 bg-red-700 text-white rounded-lg text-xs disabled:opacity-30">Next</button>
              </div>
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}

      {!script && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-white font-semibold mb-1">Explainer Video Script</p>
          <p className="text-slate-500 text-sm">Generate YouTube video scripts with hook, sections and B-roll notes</p>
        </div>
      )}
    </div>
  )
}

export default ExplainerVideoScript
