import { useState } from 'react'
import { findMissingComponents, generateShoppingList, downloadShoppingListCSV } from '../services/missingComponents'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Microcontroller: { bg: '#1e1b4b', border: '#6366f1', text: '#a5b4fc' },
  Sensor: { bg: '#14293d', border: '#0ea5e9', text: '#7dd3fc' },
  Display: { bg: '#1a2e1a', border: '#22c55e', text: '#86efac' },
  Communication: { bg: '#2d1b1b', border: '#ef4444', text: '#fca5a5' },
  Power: { bg: '#2d2000', border: '#f59e0b', text: '#fcd34d' },
  Actuator: { bg: '#1f1635', border: '#a855f7', text: '#d8b4fe' },
  Module: { bg: '#1a2535', border: '#64748b', text: '#94a3b8' },
}

function MissingComponentCard({ comp, isMissing }) {
  const colors = CATEGORY_COLORS[comp.category] || CATEGORY_COLORS.Module
  const buyLink = 'https://www.amazon.com/s?k=' + encodeURIComponent(comp.name)

  return (
    <div
      className="rounded-xl border p-4 transition"
      style={{
        backgroundColor: isMissing ? '#1a0a0a' : colors.bg,
        borderColor: isMissing ? '#ef4444' : colors.border,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isMissing && (
              <span className="text-xs bg-red-900 text-red-400 px-2 py-0.5 rounded-full border border-red-800">
                ⚠️ Missing
              </span>
            )}
            {comp.urgent && (
              <span className="text-xs bg-orange-900 text-orange-400 px-2 py-0.5 rounded-full border border-orange-800">
                Urgent
              </span>
            )}
          </div>
          <p className="text-white text-sm font-semibold">{comp.name}</p>
          <p className="text-xs mt-0.5" style={{ color: isMissing ? '#f87171' : colors.text }}>
            {comp.category}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Qty: {comp.quantity || 1}</p>
          {comp.estimatedPrice && (
            <p className="text-xs text-emerald-400">${comp.estimatedPrice}</p>
          )}
        </div>
      </div>

      {comp.reason && (
        <p className="text-xs text-slate-400 leading-relaxed mb-3">{comp.reason}</p>
      )}

      <a
        href={buyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
      >
        🛒 Buy on Amazon →
      </a>
    </div>
  )
}

function MissingComponents({ idea, components }) {
  const [analysis, setAnalysis] = useState(null)
  const [shoppingList, setShoppingList] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showShopping, setShowShopping] = useState(false)

  async function handleAnalyse() {
    setLoading(true)
    setAnalysis(null)
    setShoppingList(null)
    try {
      const result = await findMissingComponents(idea, components)
      setAnalysis(result)

      const shopping = await generateShoppingList(idea, components, result.missing)
      setShoppingList(shopping)

      if (result.missing.length === 0) {
        notify.success('Your component list is complete!')
      } else {
        notify.warning(result.missing.length + ' missing component' + (result.missing.length !== 1 ? 's' : '') + ' found!')
      }
    } catch {
      notify.error('Analysis failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">🔍 Missing Components Check</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            AI scans for missing resistors, capacitors, protection circuits and more
          </p>
        </div>
        <button
          onClick={handleAnalyse}
          disabled={loading}
          className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? '🔍 Scanning...' : '🔍 Find Missing Parts'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is reviewing your component list...</p>
        </div>
      )}

      {analysis && !loading && (
        <>
          {/* Verdict */}
          <div className={`rounded-xl border px-5 py-4 mb-4 flex items-start gap-3 ${
            analysis.readyToBuild
              ? 'bg-green-950 border-green-800'
              : 'bg-orange-950 border-orange-800'
          }`}>
            <span className="text-2xl shrink-0">
              {analysis.readyToBuild ? '✅' : '⚠️'}
            </span>
            <div>
              <p className={`font-semibold text-sm mb-1 ${
                analysis.readyToBuild ? 'text-green-400' : 'text-orange-400'
              }`}>
                {analysis.readyToBuild ? 'Ready to Build!' : 'Not Ready Yet'}
              </p>
              <p className="text-slate-300 text-sm">{analysis.verdict}</p>
            </div>
          </div>

          {/* Missing components */}
          {analysis.missing?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-3">
                ⚠️ Missing Components ({analysis.missing.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {analysis.missing.map((comp, i) => (
                  <MissingComponentCard key={i} comp={comp} isMissing={true} />
                ))}
              </div>
            </div>
          )}

          {analysis.missing?.length === 0 && (
            <div className="bg-green-950 border border-green-900 rounded-xl p-4 text-center mb-4">
              <p className="text-green-400 font-semibold text-sm">✅ No missing components!</p>
              <p className="text-green-700 text-xs mt-1">Your component list looks complete for this prototype.</p>
            </div>
          )}

          {/* Shopping List */}
          {shoppingList && (
            <div className="border border-[#2e2e4e] rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-white font-semibold text-sm">🛒 Shopping List</h4>
                  <p className="text-slate-500 text-xs">
                    {shoppingList.itemCount} items · Est. ${shoppingList.totalMin} — ${shoppingList.totalMax} USD
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowShopping(!showShopping)}
                    className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
                  >
                    {showShopping ? 'Hide ↑' : 'Show ↓'}
                  </button>
                  <button
                    onClick={() => {
                      downloadShoppingListCSV(shoppingList, idea)
                      notify.success('Shopping list downloaded!')
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition"
                  >
                    ⬇️ Download CSV
                  </button>
                </div>
              </div>

              {showShopping && (
                <div className="space-y-2 mt-3">
                  {shoppingList.items.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                        item.status === 'missing'
                          ? 'bg-red-950 border border-red-900'
                          : 'bg-[#13131f]'
                      }`}
                    >
                      <span className={item.status === 'missing' ? 'text-red-400' : 'text-slate-500'}>
                        {item.status === 'missing' ? '⚠️' : '✓'}
                      </span>
                      <span className={`flex-1 ${item.status === 'missing' ? 'text-red-300' : 'text-slate-300'}`}>
                        {item.name}
                      </span>
                      <span className="text-slate-600">×{item.quantity}</span>
                      <span className="text-emerald-400">${item.estimatedPrice}</span>
                      <a
                        href={'https://www.amazon.com/s?k=' + encodeURIComponent(item.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 transition"
                      >
                        Buy →
                      </a>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-2 border-t border-[#2e2e4e] mt-2">
                    <span className="text-slate-500 text-xs">Total estimated cost</span>
                    <span className="text-emerald-400 font-semibold text-sm">
                      ${shoppingList.totalMin} — ${shoppingList.totalMax} USD
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MissingComponents