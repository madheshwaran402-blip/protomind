import { useState } from 'react'
import { generateUnitTests, saveTests, getTests } from '../services/unitTestService'
import { notify } from '../services/toast'

const LANGUAGES = ['Arduino C++', 'MicroPython', 'CircuitPython', 'Python']

function UnitTestGenerator({ idea, components }) {
  const [result, setResult] = useState(getTests(idea))
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('Arduino C++')
  const [passedTests, setPassedTests] = useState({})
  const [copiedIdx, setCopiedIdx] = useState(null)

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    setPassedTests({})
    try {
      const data = await generateUnitTests(idea, components, code, language)
      setResult(data)
      saveTests(idea, data)
      notify.success(data.tests?.length + ' unit tests generated!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function toggleTest(idx) {
    setPassedTests(function(prev) {
      const next = Object.assign({}, prev)
      next[idx] = !next[idx]
      return next
    })
  }

  function copyTest(code, idx) {
    navigator.clipboard.writeText(code)
    setCopiedIdx(idx)
    setTimeout(function() { setCopiedIdx(null) }, 2000)
    notify.success('Test code copied!')
  }

  const tests = result?.tests || []
  const passedCount = Object.values(passedTests).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select value={language} onChange={function(e) { setLanguage(e.target.value) }}
          className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none flex-1">
          {LANGUAGES.map(function(l) { return <option key={l} value={l}>{l}</option> })}
        </select>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Generating...' : 'Generate Tests'}
        </button>
      </div>

      <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e] flex items-center gap-2">
          <span className="text-slate-500 text-xs">Optional: paste your code to test</span>
          {code && <button onClick={function() { setCode('') }} className="ml-auto text-xs text-slate-600 hover:text-white">Clear</button>}
        </div>
        <textarea value={code} onChange={function(e) { setCode(e.target.value) }}
          placeholder="// Paste code to test (optional - will generate generic tests if empty)"
          className="w-full bg-[#0a0a0f] px-4 py-3 text-green-400 text-xs font-mono outline-none resize-none placeholder-slate-700"
          rows={5} spellCheck={false} />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Generating unit tests...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex items-center gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
            <span className="text-green-400 text-xs font-mono">{result.testFramework}</span>
            <div className="flex-1 bg-[#1e1e2e] rounded-full h-1.5">
              <div className="h-1.5 bg-green-600 rounded-full transition-all"
                style={{ width: tests.length > 0 ? (passedCount / tests.length * 100) + '%' : '0%' }} />
            </div>
            <span className="text-green-400 text-xs">{passedCount}/{tests.length} passed</span>
          </div>

          <div className="space-y-3">
            {tests.map(function(test, i) {
              const passed = !!passedTests[i]
              return (
                <div key={i} className={'rounded-xl border overflow-hidden transition ' + (passed ? 'border-green-800' : 'border-[#2e2e4e]')}>
                  <div className={'flex items-center gap-3 p-3 ' + (passed ? 'bg-green-950' : 'bg-[#13131f]')}>
                    <button onClick={function() { toggleTest(i) }}
                      className={'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition ' + (passed ? 'bg-green-600 border-green-500 text-white' : 'border-[#2e2e4e] text-slate-600 hover:border-green-600')}>
                      {passed ? 'v' : 'o'}
                    </button>
                    <div className="flex-1">
                      <p className={'text-sm font-semibold ' + (passed ? 'text-green-300' : 'text-white')}>{test.name}</p>
                      <p className="text-slate-500 text-xs">{test.description}</p>
                    </div>
                    <button onClick={function() { copyTest(test.testCode, i) }}
                      className="text-xs text-slate-600 hover:text-white transition shrink-0">
                      {copiedIdx === i ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  {test.testCode && (
                    <pre className="bg-[#0a0a0f] px-4 py-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap border-t border-[#1e1e2e]">
                      {test.testCode}
                    </pre>
                  )}
                  {test.expectedResult && (
                    <div className="px-4 py-2 bg-[#0d0d1a] border-t border-[#1e1e2e]">
                      <p className="text-indigo-400 text-xs">Expected: {test.expectedResult}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate Tests</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🧪</div>
          <p className="text-white font-semibold mb-1">Unit Test Generator</p>
          <p className="text-slate-500 text-sm">Generate and track unit tests for your prototype code</p>
        </div>
      )}
    </div>
  )
}

export default UnitTestGenerator
