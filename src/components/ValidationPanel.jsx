function ScoreRing({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Great' : score >= 60 ? 'Fair' : 'Needs Work'

  return (
    <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 shrink-0"
      style={{ borderColor: color }}>
      <span className="text-2xl font-black" style={{ color }}>{score}</span>
      <span className="text-xs" style={{ color }}>{label}</span>
    </div>
  )
}

function ValidationPanel({ result, loading, onClose }) {
  if (!result && !loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border overflow-hidden"
        style={{ backgroundColor: '#0d0d1a', borderColor: result?.valid ? '#166534' : '#991b1b' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          result?.valid ? 'bg-green-950' : 'bg-red-950'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{result?.valid ? '✅' : '⚠️'}</span>
            <div>
              <h2 className="font-bold text-white text-lg">
                {loading ? 'Validating Prototype...' : result?.valid ? 'Prototype Approved!' : 'Issues Found'}
              </h2>
              {result?.verdict && (
                <p className="text-sm text-slate-300 mt-0.5">{result.verdict}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {result && <ScoreRing score={result.score} />}
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">AI is checking your prototype...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="p-6 space-y-5">

            {/* Issues */}
            {result.issues?.length > 0 && (
              <div>
                <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wide mb-3">
                  🚨 Blocking Issues ({result.issues.length})
                </h3>
                <div className="space-y-2">
                  {result.issues.map((issue, i) => (
                    <div key={i} className="bg-red-950 border border-red-900 rounded-xl px-4 py-3 text-sm text-red-200">
                      {issue}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div>
                <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-wide mb-3">
                  ⚠️ Warnings ({result.warnings.length})
                </h3>
                <div className="space-y-2">
                  {result.warnings.map((warning, i) => (
                    <div key={i} className="bg-yellow-950 border border-yellow-900 rounded-xl px-4 py-3 text-sm text-yellow-200">
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div>
                <h3 className="text-indigo-400 font-semibold text-sm uppercase tracking-wide mb-3">
                  💡 Suggestions ({result.suggestions.length})
                </h3>
                <div className="space-y-2">
                  {result.suggestions.map((suggestion, i) => (
                    <div key={i} className="bg-indigo-950 border border-indigo-900 rounded-xl px-4 py-3 text-sm text-indigo-200">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All good */}
            {result.valid && result.issues?.length === 0 && result.warnings?.length === 0 && (
              <div className="bg-green-950 border border-green-900 rounded-xl px-6 py-5 text-center">
                <p className="text-green-400 font-semibold mb-1">All checks passed!</p>
                <p className="text-green-700 text-sm">Your prototype looks good to build.</p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
            >
              Got it — Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ValidationPanel