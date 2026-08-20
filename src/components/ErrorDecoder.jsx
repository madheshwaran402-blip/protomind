import { useState } from 'react'
import { decodeError, COMMON_ERRORS, saveDecodedError, getErrorHistory } from '../services/errorDecoderService'
import { notify } from '../services/toast'

const PRIORITY_STYLES = {
  High: 'text-red-400 bg-red-950 border-red-800',
  Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Low: 'text-green-400 bg-green-950 border-green-800',
}

function ErrorDecoder({ idea, components }) {
  const [errorInput, setErrorInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState(getErrorHistory())
  const [showHistory, setShowHistory] = useState(false)

  async function handleDecode(err) {
    const text = err || errorInput
    if (!text.trim()) { notify.warning('Paste an error message first'); return }
    setLoading(true)
    setResult(null)
    try {
      const data = await decodeError(text, idea, components)
      setResult(Object.assign({}, data, { errorMsg: text }))
      saveDecodedError(text, data)
      setHistory(getErrorHistory())
      notify.success('Error decoded!')
    } catch { notify.error('Decoding failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          value={errorInput}
          onChange={function(e) { setErrorInput(e.target.value) }}
          placeholder="Paste your error message here...\ne.g. avrdude: stk500_getsync() attempt 1 of 10: not in sync: resp=0x00"
          className="w-full bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-red-400 text-xs font-mono outline-none focus:border-red-700 resize-none placeholder-slate-700"
          rows={4}
        />
        <div className="flex flex-wrap gap-1">
          {COMMON_ERRORS.slice(0, 4).map(function(err, i) {
            return (
              <button key={i} onClick={function() { handleDecode(err) }}
                className="text-xs px-2 py-1 bg-[#13131f] border border-[#2e2e4e] hover:border-red-700 text-slate-500 hover:text-white rounded-lg transition truncate max-w-48">
                {err.slice(0, 30)}...
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <button onClick={function() { handleDecode() }} disabled={loading || !errorInput.trim()}
            className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
            {loading ? '🔍 Decoding...' : '🔍 Decode Error'}
          </button>
          <button onClick={function() { setShowHistory(!showHistory) }}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            📋 History ({history.length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Decoding error message...</p>
        </div>
      )}

      {showHistory && !loading && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
          <p className="text-xs text-slate-500 font-semibold mb-2">Recent Errors</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-slate-600 text-xs">No history yet</p>
            ) : (
              history.map(function(item, i) {
                return (
                  <div key={i} onClick={function() { setResult(Object.assign({}, item.result, { errorMsg: item.errorMsg })); setShowHistory(false) }}
                    className="cursor-pointer hover:bg-[#0d0d1a] rounded-lg p-2 transition">
                    <p className="text-red-400 text-xs font-mono truncate">{item.errorMsg}</p>
                    <p className="text-slate-500 text-xs">{item.result.errorType}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          <div className="bg-red-950 border border-red-800 rounded-xl p-4">
            <p className="text-red-400 text-xs font-semibold mb-1">Error Type: {result.errorType}</p>
            <p className="text-white text-sm">{result.explanation}</p>
          </div>

          {result.causes && result.causes.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-slate-500 text-xs font-semibold mb-2">Possible Causes</p>
              <ul className="space-y-1">
                {result.causes.map(function(cause, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-orange-400">{i+1}.</span>{cause}</li>
                })}
              </ul>
            </div>
          )}

          {result.fixes && result.fixes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Fixes</p>
              {result.fixes.map(function(fix, i) {
                const priStyle = PRIORITY_STYLES[fix.priority] || PRIORITY_STYLES.Medium
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={'text-xs px-1.5 py-0.5 rounded border ' + priStyle}>{fix.priority}</span>
                      <p className="text-white text-sm font-medium">{fix.fix}</p>
                    </div>
                    {fix.code && (
                      <pre className="mt-2 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-2 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {fix.code}
                      </pre>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {result.preventionTips && result.preventionTips.length > 0 && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
              <p className="text-indigo-400 text-xs font-semibold mb-2">🛡️ Prevention Tips</p>
              <ul className="space-y-1">
                {result.preventionTips.map(function(tip, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-indigo-400">→</span>{tip}</li>
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {!result && !loading && !showHistory && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-white font-semibold mb-1">Error Code Decoder</p>
          <p className="text-slate-500 text-sm">Paste any Arduino, ESP32 or compiler error to get instant explanation and fixes</p>
        </div>
      )}
    </div>
  )
}

export default ErrorDecoder
