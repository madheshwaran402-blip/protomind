import { useState } from 'react'
import { generateDemoScript, saveDemoScript, getDemoScript, AUDIENCES } from '../services/demoScriptService'
import { notify } from '../services/toast'

function DemoScriptGenerator({ idea, components }) {
  const [audience, setAudience] = useState('Investors')
  const [script, setScript] = useState(getDemoScript(idea, 'Investors'))
  const [loading, setLoading] = useState(false)
  const [activeScene, setActiveScene] = useState(0)
  const [presenting, setPresenting] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleSelectAudience(a) {
    setAudience(a)
    setScript(getDemoScript(idea, a))
    setActiveScene(0)
  }

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generateDemoScript(idea, components, audience)
      setScript(data)
      saveDemoScript(idea, audience, data)
      setActiveScene(0)
      notify.success('Demo script ready for ' + audience + '!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleCopyAll() {
    if (!script) return
    const lines = [script.title, 'Duration: ' + script.duration, '', 'SETUP:', ...(script.setup || []).map(function(s) { return '- ' + s }), '']
    ;(script.scenes || []).forEach(function(scene) {
      lines.push('SCENE ' + scene.scene + ' (' + scene.duration + ')')
      lines.push('Action: ' + scene.action)
      lines.push('Script: ' + scene.script)
      if (scene.tip) lines.push('Tip: ' + scene.tip)
      lines.push('')
    })
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Script copied!')
  }

  const scenes = script?.scenes || []

  return (
    <div className="space-y-4">
      {/* Day 200 banner */}
      <div className="bg-gradient-to-r from-yellow-950 to-orange-950 border border-yellow-700 rounded-xl p-3 flex items-center gap-2">
        <span className="text-2xl">🎊</span>
        <div>
          <p className="text-yellow-300 font-bold text-sm">Day 200 Milestone!</p>
          <p className="text-slate-500 text-xs">74.1% of the ProtoMind journey complete</p>
        </div>
        <span className="text-2xl">🎊</span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {AUDIENCES.map(function(a) {
          const hasCache = !!getDemoScript(idea, a)
          return (
            <button key={a} onClick={function() { handleSelectAudience(a) }}
              className={'text-xs px-3 py-1.5 rounded-xl border transition relative ' + (audience === a ? 'bg-indigo-700 text-white border-indigo-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600')}>
              {a}
              {hasCache && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
          {loading ? 'Writing...' : 'Generate Demo Script'}
        </button>
        {script && (
          <>
            <button onClick={handleCopyAll}
              className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={function() { setPresenting(!presenting) }}
              className={'px-4 py-2.5 rounded-xl text-xs font-semibold transition ' + (presenting ? 'bg-green-700 text-white' : 'bg-[#1e1e2e] text-slate-300')}>
              {presenting ? 'Exit' : 'Present'}
            </button>
          </>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Writing demo script for {audience}...</p>
        </div>
      )}

      {script && !loading && (
        <>
          {!presenting ? (
            <div className="space-y-3">
              <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
                <p className="text-white font-black text-lg">{script.title}</p>
                <p className="text-indigo-400 text-xs">Duration: {script.duration} | Audience: {audience}</p>
              </div>

              {script.setup && script.setup.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-yellow-400 text-xs font-semibold mb-2">Setup Before Demo</p>
                  <ul className="space-y-1">
                    {script.setup.map(function(s, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-yellow-400 shrink-0">{i+1}.</span>{s}</li>
                    })}
                  </ul>
                </div>
              )}

              <div className="flex gap-1 overflow-x-auto pb-1">
                {scenes.map(function(scene, i) {
                  return (
                    <button key={i} onClick={function() { setActiveScene(i) }}
                      className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (activeScene === i ? 'bg-indigo-700 text-white' : 'bg-[#13131f] text-slate-400 border border-[#2e2e4e]')}>
                      Scene {scene.scene}
                      <span className="ml-1 opacity-60">{scene.duration}</span>
                    </button>
                  )
                })}
              </div>

              {scenes[activeScene] && (
                <div className="bg-[#13131f] border border-indigo-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 text-xs font-bold">Scene {scenes[activeScene].scene}</span>
                    <span className="text-slate-500 text-xs">{scenes[activeScene].duration}</span>
                  </div>
                  <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-2">
                    <p className="text-yellow-400 text-xs font-semibold">Action</p>
                    <p className="text-slate-300 text-sm">{scenes[activeScene].action}</p>
                  </div>
                  <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-3">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Script (read aloud)</p>
                    <p className="text-white text-sm leading-relaxed italic">"{scenes[activeScene].script}"</p>
                  </div>
                  {scenes[activeScene].tip && (
                    <div className="bg-green-950 border border-green-800 rounded-lg p-2">
                      <p className="text-green-400 text-xs">Pro tip: {scenes[activeScene].tip}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={function() { setActiveScene(Math.max(0, activeScene - 1)) }} disabled={activeScene === 0}
                      className="flex-1 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs disabled:opacity-30">Prev</button>
                    <button onClick={function() { setActiveScene(Math.min(scenes.length - 1, activeScene + 1)) }} disabled={activeScene === scenes.length - 1}
                      className="flex-1 py-1.5 bg-indigo-700 text-white rounded-lg text-xs disabled:opacity-30">Next Scene</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Presentation mode */
            <div className="bg-[#0a0a0f] border border-indigo-700 rounded-2xl p-6 min-h-64">
              {scenes[activeScene] && (
                <div className="space-y-4 text-center">
                  <p className="text-indigo-400 text-sm">Scene {scenes[activeScene].scene} of {scenes.length} | {scenes[activeScene].duration}</p>
                  <p className="text-yellow-400 font-bold text-lg">{scenes[activeScene].action}</p>
                  <p className="text-white text-xl leading-relaxed italic max-w-lg mx-auto">"{scenes[activeScene].script}"</p>
                  {scenes[activeScene].tip && (
                    <p className="text-green-400 text-xs">Tip: {scenes[activeScene].tip}</p>
                  )}
                  <div className="flex gap-3 justify-center mt-4">
                    <button onClick={function() { setActiveScene(Math.max(0, activeScene - 1)) }} disabled={activeScene === 0}
                      className="px-6 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-sm disabled:opacity-30">Back</button>
                    {activeScene < scenes.length - 1 ? (
                      <button onClick={function() { setActiveScene(activeScene + 1) }}
                        className="px-8 py-2 bg-indigo-700 text-white rounded-xl text-sm font-bold">Next</button>
                    ) : (
                      <button onClick={function() { setPresenting(false) }}
                        className="px-6 py-2 bg-green-700 text-white rounded-xl text-sm font-bold">Done!</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!script && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🎤</div>
          <p className="text-white font-semibold mb-1">Demo Script Generator</p>
          <p className="text-slate-500 text-sm">Generate a live demo script with scenes, actions and presentation mode</p>
        </div>
      )}
    </div>
  )
}

export default DemoScriptGenerator
