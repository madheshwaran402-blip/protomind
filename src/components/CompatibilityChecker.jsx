import { useState } from 'react'
import { checkCompatibility } from '../services/compatibilityService'
import { notify } from '../services/toast'

const COMPAT_STYLES = {
  Compatible: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅' },
  'Minor Issues': { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚠️' },
  'Major Issues': { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '❌' },
  Incompatible: { color: 'text-red-600', bg: 'bg-red-950', border: 'border-red-700', icon: '🚫' },
}

const PAIR_STATUS_STYLES = {
  Compatible: { color: 'text-green-400', dot: 'bg-green-500' },
  Warning: { color: 'text-yellow-400', dot: 'bg-yellow-500' },
  Conflict: { color: 'text-red-400', dot: 'bg-red-500' },
  Unknown: { color: 'text-slate-400', dot: 'bg-slate-500' },
}

function CompatibilityMatrix({ pairs, components }) {
  if (!pairs || pairs.length === 0) return null

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Compatibility Pairs</p>
      <div className="space-y-2">
        {pairs.map(function(pair, i) {
          const style = PAIR_STATUS_STYLES[pair.status] || PAIR_STATUS_STYLES.Unknown
          return (
            <div key={i} className="bg-[#0d0d1a] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={'w-2 h-2 rounded-full shrink-0 ' + style.dot} />
                <span className="text-white text-xs font-medium">{pair.comp1}</span>
                <span className="text-slate-500 text-xs">↔️</span>
                <span className="text-white text-xs font-medium">{pair.comp2}</span>
                <span className={'text-xs ml-auto ' + style.color}>{pair.status}</span>
              </div>
              {pair.issue && (
                <p className="text-slate-400 text-xs ml-4">{pair.issue}</p>
              )}
              {pair.fix && pair.status !== 'Compatible' && (
                <p className="text-green-400 text-xs ml-4 mt-1">Fix: {pair.fix}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function IssueCard({ title, items, color, bgColor, borderColor, icon }) {
  const [expanded, setExpanded] = useState(false)

  if (!items || items.length === 0) return null

  return (
    <div className={'rounded-xl border p-4 ' + bgColor + ' ' + borderColor}>
      <button
        onClick={function() { setExpanded(!expanded) }}
        className="w-full flex items-center gap-2 text-left"
      >
        <span>{icon}</span>
        <p className={'font-semibold text-sm ' + color}>{title}</p>
        <span className={'text-xs px-2 py-0.5 rounded-full border ml-1 ' + color + ' ' + bgColor + ' ' + borderColor}>
          {items.length}
        </span>
        <span className="text-slate-600 ml-auto">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {items.map(function(item, i) {
            return (
              <div key={i} className="bg-[#0d0d1a] rounded-lg p-3 text-xs space-y-1">
                {item.component && (
                  <p className="text-white font-medium">{item.component}</p>
                )}
                {item.protocol && (
                  <p className="text-white font-medium">Protocol: {item.protocol}</p>
                )}
                {item.pin && (
                  <p className="text-white font-medium">Pin: {item.pin}</p>
                )}
                {item.components && (
                  <p className="text-slate-400">Affects: {Array.isArray(item.components) ? item.components.join(', ') : item.components}</p>
                )}
                {(item.conflict || item.issue) && (
                  <p className="text-red-300">{item.conflict || item.issue}</p>
                )}
                {item.expected && (
                  <p className="text-slate-400">Expected: {item.expected} → Actual: {item.actual}</p>
                )}
                {item.risk && (
                  <p className="text-yellow-300">Risk: {item.risk}</p>
                )}
                {item.fix && (
                  <p className="text-green-300">Fix: {item.fix}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CompatibilityChecker({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('matrix')

  async function handleCheck() {
    if (components.length < 2) {
      notify.warning('Need at least 2 components to check compatibility')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await checkCompatibility(idea, components)
      setResult(data)
      notify.success('Compatibility check complete — ' + (data.overallCompatibility || 'done'))
    } catch {
      notify.error('Check failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const compatStyle = result ? (COMPAT_STYLES[result.overallCompatibility] || COMPAT_STYLES['Minor Issues']) : null

  const TABS = [
    { id: 'matrix', label: '🔗 Pairs' },
    { id: 'voltage', label: '⚡ Voltage' },
    { id: 'protocols', label: '📡 Protocols' },
    { id: 'pins', label: '📌 Pins' },
  ]

  const hasIssues = result && (
    (result.voltageIssues && result.voltageIssues.length > 0) ||
    (result.protocolConflicts && result.protocolConflicts.length > 0) ||
    (result.pinConflicts && result.pinConflicts.length > 0)
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI checks voltage, protocol and pin compatibility between all components
        </p>
        <button
          onClick={handleCheck}
          disabled={loading || components.length < 2}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🔗 Checking...' : '🔗 Check Compatibility'}
        </button>
      </div>

      {components.length < 2 && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
          <p className="text-slate-500 text-sm">Add at least 2 components to check compatibility</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is checking all {components.length} components...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Overall result */}
          <div className={'rounded-2xl border p-5 ' + compatStyle.bg + ' ' + compatStyle.border}>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">{compatStyle.icon}</span>
              <div className="flex-1">
                <p className={'font-black text-xl ' + compatStyle.color}>
                  {result.overallCompatibility}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-[#1e1e2e] rounded-full h-2 max-w-40">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: (result.compatibilityScore || 0) + '%',
                        backgroundColor: result.compatibilityScore >= 80 ? '#22c55e' :
                          result.compatibilityScore >= 60 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className={'text-sm font-bold ' + compatStyle.color}>
                    {result.compatibilityScore || 0}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-300 text-sm">{result.summary}</p>
          </div>

          {/* Power budget */}
          {result.powerBudget && (
            <div className={'rounded-xl border p-4 ' + (
              result.powerBudget.status === 'OK' ? 'bg-green-950 border-green-900' :
              'bg-red-950 border-red-900'
            )}>
              <p className={'text-xs font-semibold mb-2 ' + (
                result.powerBudget.status === 'OK' ? 'text-green-400' : 'text-red-400'
              )}>
                ⚡ Power Budget — {result.powerBudget.status}
              </p>
              <div className="flex gap-4 text-xs">
                <span className="text-slate-300">Required: {result.powerBudget.totalRequired}</span>
                <span className="text-slate-300">Available: {result.powerBudget.available}</span>
              </div>
              {result.powerBudget.recommendation && (
                <p className="text-slate-400 text-xs mt-1">{result.powerBudget.recommendation}</p>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button
                  key={tab.id}
                  onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Pairs tab */}
          {activeTab === 'matrix' && (
            <div className="space-y-3">
              <CompatibilityMatrix pairs={result.pairs} components={components} />

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Recommendations</p>
                  <ul className="space-y-1">
                    {result.recommendations.map(function(rec, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                          <p className="text-slate-300">{rec}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Voltage tab */}
          {activeTab === 'voltage' && (
            <div className="space-y-2">
              {(result.voltageIssues && result.voltageIssues.length > 0) ? (
                <IssueCard
                  title={'Voltage Issues (' + result.voltageIssues.length + ')'}
                  items={result.voltageIssues}
                  color="text-red-400"
                  bgColor="bg-red-950"
                  borderColor="border-red-900"
                  icon="⚡"
                />
              ) : (
                <div className="text-center py-6 bg-green-950 border border-green-900 rounded-xl">
                  <p className="text-green-400 font-semibold">✅ No voltage issues found!</p>
                  <p className="text-green-700 text-xs mt-1">All components have compatible voltage levels</p>
                </div>
              )}
            </div>
          )}

          {/* Protocols tab */}
          {activeTab === 'protocols' && (
            <div className="space-y-2">
              {(result.protocolConflicts && result.protocolConflicts.length > 0) ? (
                <IssueCard
                  title={'Protocol Conflicts (' + result.protocolConflicts.length + ')'}
                  items={result.protocolConflicts}
                  color="text-orange-400"
                  bgColor="bg-orange-950"
                  borderColor="border-orange-800"
                  icon="📡"
                />
              ) : (
                <div className="text-center py-6 bg-green-950 border border-green-900 rounded-xl">
                  <p className="text-green-400 font-semibold">✅ No protocol conflicts!</p>
                  <p className="text-green-700 text-xs mt-1">All communication protocols are compatible</p>
                </div>
              )}
            </div>
          )}

          {/* Pins tab */}
          {activeTab === 'pins' && (
            <div className="space-y-2">
              {(result.pinConflicts && result.pinConflicts.length > 0) ? (
                <IssueCard
                  title={'Pin Conflicts (' + result.pinConflicts.length + ')'}
                  items={result.pinConflicts}
                  color="text-purple-400"
                  bgColor="bg-purple-950"
                  borderColor="border-purple-800"
                  icon="📌"
                />
              ) : (
                <div className="text-center py-6 bg-green-950 border border-green-900 rounded-xl">
                  <p className="text-green-400 font-semibold">✅ No pin conflicts!</p>
                  <p className="text-green-700 text-xs mt-1">All pins can be assigned without conflicts</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCheck}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Re-check
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🔗</div>
          <p className="text-white font-semibold mb-1">Component Compatibility Checker</p>
          <p className="text-slate-500 text-sm mb-4">
            Check for voltage, protocol and pin conflicts between all components
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Compatibility matrix</span>
            <span>✓ Voltage checks</span>
            <span>✓ Protocol conflicts</span>
            <span>✓ Pin assignment</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompatibilityChecker