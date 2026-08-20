import { useState } from 'react'
import { translateCode, SUPPORTED_LANGUAGES } from '../services/codeTranslatorService'
import { notify } from '../services/toast'

function CodeTranslator({ idea, components }) {
  const [fromLang, setFromLang] = useState('Arduino C++')
  const [toLang, setToLang] = useState('MicroPython')
  const [inputCode, setInputCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleTranslate() {
    if (!inputCode.trim()) { notify.warning('Paste code first'); return }
    if (fromLang === toLang) { notify.warning('Select different languages'); return }
    setLoading(true)
    setResult(null)
    try {
      const data = await translateCode(inputCode, fromLang, toLang, idea)
      setResult(data)
      notify.success('Code translated to ' + toLang + '!')
    } catch { notify.error('Translation failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.translatedCode)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Translated code copied!')
  }

  function handleSwap() {
    const temp = fromLang
    setFromLang(toLang)
    setToLang(temp)
    setResult(null)
  }

  const fromLangInfo = SUPPORTED_LANGUAGES.find(function(l) { return l.value === fromLang })
  const toLangInfo = SUPPORTED_LANGUAGES.find(function(l) { return l.value === toLang })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={fromLang} onChange={function(e) { setFromLang(e.target.value); setResult(null) }}
          className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none">
          {SUPPORTED_LANGUAGES.map(function(l) { return <option key={l.value} value={l.value}>{l.icon} {l.value}</option> })}
        </select>
        <button onClick={handleSwap} className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition">⇄</button>
        <select value={toLang} onChange={function(e) { setToLang(e.target.value); setResult(null) }}
          className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none">
          {SUPPORTED_LANGUAGES.map(function(l) { return <option key={l.value} value={l.value}>{l.icon} {l.value}</option> })}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
            <span>{fromLangInfo?.icon}</span>
            <span className="text-slate-500 text-xs">{fromLang}{fromLangInfo?.ext}</span>
            {inputCode && <button onClick={function() { setInputCode(''); setResult(null) }} className="ml-auto text-xs text-slate-600 hover:text-white">Clear</button>}
          </div>
          <textarea
            value={inputCode}
            onChange={function(e) { setInputCode(e.target.value) }}
            placeholder={'// Paste your ' + fromLang + ' code here...'}
            className="w-full bg-[#0a0a0f] px-4 py-3 text-green-400 text-xs font-mono outline-none resize-none placeholder-slate-700"
            rows={8}
            spellCheck={false}
          />
        </div>

        {result && (
          <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
              <span>{toLangInfo?.icon}</span>
              <span className="text-slate-500 text-xs">{toLang}{toLangInfo?.ext}</span>
              <button onClick={handleCopy} className="ml-auto text-xs text-slate-500 hover:text-white">
                {copied ? '✅ Copied' : '📋 Copy'}
              </button>
            </div>
            <pre className="px-4 py-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64">
              {result.translatedCode}
            </pre>
          </div>
        )}
      </div>

      <button onClick={handleTranslate} disabled={loading || !inputCode.trim()}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50">
        {loading ? '⇄ Translating...' : '⇄ Translate to ' + toLang}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-6 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Translating code...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          {result.librariesNeeded && result.librariesNeeded.length > 0 && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">📦 Libraries Needed for {toLang}</p>
              <div className="flex flex-wrap gap-1">
                {result.librariesNeeded.map(function(lib, i) {
                  return <span key={i} className="text-xs bg-[#0d0d1a] text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">{lib}</span>
                })}
              </div>
            </div>
          )}
          {result.changes && result.changes.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold mb-2">Key Changes</p>
              <ul className="space-y-1">
                {result.changes.map(function(change, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-blue-400">→</span>{change}</li>
                })}
              </ul>
            </div>
          )}
          {result.warnings && result.warnings.length > 0 && (
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-semibold mb-2">⚠️ Warnings</p>
              <ul className="space-y-1">
                {result.warnings.map(function(w, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-yellow-400">!</span>{w}</li>
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-6 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">⇄</div>
          <p className="text-white font-semibold mb-1">Code Translator</p>
          <p className="text-slate-500 text-sm">Translate code between Arduino, MicroPython, CircuitPython and more</p>
        </div>
      )}
    </div>
  )
}

export default CodeTranslator
