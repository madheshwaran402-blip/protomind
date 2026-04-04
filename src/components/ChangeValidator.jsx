import { useState } from 'react'
import { validateComponentChange } from '../services/validation'

function ChangeValidator({ idea, components }) {
  const [change, setChange] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleValidate() {
    if (!change.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await validateComponentChange(idea, components, change)
      setResult(res)
    } catch {
      setResult({
        approved: false,
        reason: 'Could not validate. Make sure Ollama is running.',
        impact: 'Unknown',
        alternative: null,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 mt-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">
        🔬 Validate a Change
      </h3>
      <p className="text-xs text-slate-600 mb-3">
        Describe a change you want to make — AI will check if it's a good idea
      </p>

      <div className="flex gap-2 mb-4">
        <input
          value={change}
          onChange={e => setChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleValidate()}
          placeholder='e.g. "Replace Arduino with ESP32" or "Add a GPS module"'
          className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
        />
        <button
          onClick={handleValidate}
          disabled={loading || !change.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm transition disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '...' : 'Check'}
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          'Replace Arduino with ESP32',
          'Add WiFi module',
          'Use solar power instead of battery',
          'Add OLED display',
        ].map(s => (
          <button
            key={s}
            onClick={() => setChange(s)}
            className="text-xs bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-500 px-3 py-1 rounded-full transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Result */}
      {loading && (
        <div className="flex items-center gap-3 py-3">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">AI is checking this change...</span>
        </div>
      )}

      {result && !loading && (
        <div className={`rounded-xl border p-4 ${
          result.approved
            ? 'bg-green-950 border-green-800'
            : 'bg-red-950 border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{result.approved ? '✅' : '❌'}</span>
            <span className={`font-semibold text-sm ${result.approved ? 'text-green-400' : 'text-red-400'}`}>
              {result.approved ? 'Good Change!' : 'Not Recommended'}
            </span>
          </div>
          <p className={`text-sm mb-2 ${result.approved ? 'text-green-200' : 'text-red-200'}`}>
            {result.reason}
          </p>
          {result.impact && (
            <p className="text-xs text-slate-400 mb-2">
              <span className="text-slate-500">Impact: </span>{result.impact}
            </p>
          )}
          {result.alternative && (
            <div className="mt-3 bg-indigo-950 border border-indigo-800 rounded-lg px-3 py-2">
              <p className="text-xs text-indigo-400">
                <span className="font-semibold">Better alternative: </span>
                {result.alternative}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChangeValidator