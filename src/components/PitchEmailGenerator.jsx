import { useState } from 'react'
import { generatePitchEmail, savePitchEmail, getPitchEmail, EMAIL_TARGETS } from '../services/pitchEmailService'
import { notify } from '../services/toast'

function PitchEmailGenerator({ idea, components }) {
  const [selectedTarget, setSelectedTarget] = useState('Investor')
  const [result, setResult] = useState(getPitchEmail(idea, 'Investor'))
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleSelectTarget(target) {
    setSelectedTarget(target)
    setResult(getPitchEmail(idea, target))
  }

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generatePitchEmail(idea, components, selectedTarget)
      setResult(data)
      savePitchEmail(idea, selectedTarget, data)
      notify.success(selectedTarget + ' pitch email ready!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function buildFullEmail() {
    if (!result) return ''
    return [
      'Subject: ' + result.subject,
      '',
      result.greeting,
      '',
      result.hook,
      '',
      result.problem,
      '',
      result.solution,
      '',
      result.traction,
      '',
      result.ask,
      '',
      result.cta,
      '',
      'Best regards,',
      '[Your Name]',
    ].join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildFullEmail())
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Email copied!')
  }

  const SECTIONS = [
    { key: 'hook', label: 'Hook', color: 'text-yellow-400' },
    { key: 'problem', label: 'Problem', color: 'text-red-400' },
    { key: 'solution', label: 'Solution', color: 'text-green-400' },
    { key: 'traction', label: 'Traction', color: 'text-blue-400' },
    { key: 'ask', label: 'The Ask', color: 'text-purple-400' },
    { key: 'cta', label: 'Call to Action', color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {EMAIL_TARGETS.map(function(target) {
          const isSel = selectedTarget === target.value
          const hasCache = !!getPitchEmail(idea, target.value)
          return (
            <button key={target.value} onClick={function() { handleSelectTarget(target.value) }}
              className={'p-3 rounded-xl border text-left transition relative ' + (isSel ? 'bg-indigo-950 border-indigo-700' : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-700')}>
              <p className="text-lg">{target.icon}</p>
              <p className={'text-xs font-bold ' + (isSel ? 'text-white' : 'text-slate-400')}>{target.value}</p>
              <p className="text-slate-600 text-xs">{target.desc}</p>
              {hasCache && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
          {loading ? 'Writing...' : 'Generate ' + selectedTarget + ' Email'}
        </button>
        {result && (
          <button onClick={handleCopy}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
            {copied ? 'Copied!' : 'Copy Email'}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Writing pitch email...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          <div className="bg-[#0d0d1a] border border-indigo-800 rounded-xl p-4">
            <p className="text-slate-500 text-xs mb-1">Subject Line</p>
            <p className="text-white font-bold">{result.subject}</p>
          </div>

          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Greeting</p>
            <p className="text-white text-sm">{result.greeting}</p>
          </div>

          {SECTIONS.map(function(section) {
            return result[section.key] ? (
              <div key={section.key} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <p className={'text-xs font-semibold mb-1 ' + section.color}>{section.label}</p>
                <p className="text-white text-sm leading-relaxed">{result[section.key]}</p>
              </div>
            ) : null
          })}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📧</div>
          <p className="text-white font-semibold mb-1">Pitch Email Generator</p>
          <p className="text-slate-500 text-sm">Generate targeted pitch emails for investors, manufacturers and press</p>
        </div>
      )}
    </div>
  )
}

export default PitchEmailGenerator
