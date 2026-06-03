import { useState, useEffect } from 'react'
import {
  generateTestSuite,
  saveTestResult,
  getTestResults,
  clearTestResults,
  exportTestReport,
} from '../services/testSuiteService'
import { notify } from '../services/toast'

const SEVERITY_STYLES = {
  Critical: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  High: { color: 'text-orange-400', bg: 'bg-orange-950', border: 'border-orange-800' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Low: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
}

const TYPE_ICONS = {
  functional: '⚙️',
  integration: '🔗',
  performance: '📊',
  safety: '🛡️',
  stress: '💪',
  unit: '🧩',
}

const RESULT_STYLES = {
  pass: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅' },
  fail: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '❌' },
  skip: { color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-700', icon: '⏭️' },
}

function TestCard({ test, suiteId, onResultChange }) {
  const [expanded, setExpanded] = useState(false)
  const [result, setResult] = useState(function() {
    const results = getTestResults(suiteId)
    return results[test.id]?.result || null
  })

  const sevStyle = SEVERITY_STYLES[test.severity] || SEVERITY_STYLES.Medium
  const typeIcon = TYPE_ICONS[test.type] || '🧪'
  const resultStyle = result ? RESULT_STYLES[result] : null

  function handleResult(newResult) {
    setResult(newResult)
    saveTestResult(suiteId, test.id, newResult)
    onResultChange && onResultChange()
    if (newResult === 'pass') notify.success(test.name + ' passed!')
    else if (newResult === 'fail') notify.warning(test.name + ' failed — check the steps')
  }

  return (
    <div className={'border rounded-xl overflow-hidden ' + (resultStyle ? resultStyle.border : 'border-[#2e2e4e]')}>
      <div
        className={'flex items-start gap-3 p-4 cursor-pointer transition ' + (
          resultStyle ? resultStyle.bg : 'bg-[#13131f]'
        ) + ' hover:opacity-90'}
        onClick={function() { setExpanded(!expanded) }}
      >
        <span className="text-xl shrink-0 mt-0.5">{typeIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white text-sm font-semibold">{test.name}</p>
            <span className={'text-xs px-1.5 py-0.5 rounded border ' + sevStyle.color + ' ' + sevStyle.bg + ' ' + sevStyle.border}>
              {test.severity}
            </span>
            {test.automated && (
              <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded">
                Auto
              </span>
            )}
            {result && (
              <span className={'text-xs font-bold ml-auto ' + resultStyle.color}>
                {resultStyle.icon} {result.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs">{test.description}</p>
        </div>
        <span className="text-slate-600 shrink-0">{expanded ? '↑' : '↓'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 bg-[#0d0d1a] border-t border-[#2e2e4e] pt-3 space-y-3">
          {/* Test steps */}
          {test.steps && test.steps.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">Test Steps</p>
              <ol className="space-y-1">
                {test.steps.map(function(step, i) {
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                      <p className="text-slate-300">{step}</p>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {/* Expected result */}
          {test.expectedResult && (
            <div className="bg-green-950 border border-green-900 rounded-lg p-3">
              <p className="text-green-400 text-xs font-semibold mb-1">Expected Result</p>
              <p className="text-slate-300 text-xs">{test.expectedResult}</p>
            </div>
          )}

          {/* Result buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={function() { handleResult('pass') }}
              className={'flex-1 py-2 rounded-xl text-xs font-semibold transition ' + (
                result === 'pass'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-950 hover:bg-green-900 text-green-400 border border-green-800'
              )}
            >
              ✅ Pass
            </button>
            <button
              onClick={function() { handleResult('fail') }}
              className={'flex-1 py-2 rounded-xl text-xs font-semibold transition ' + (
                result === 'fail'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-950 hover:bg-red-900 text-red-400 border border-red-800'
              )}
            >
              ❌ Fail
            </button>
            <button
              onClick={function() { handleResult('skip') }}
              className={'flex-1 py-2 rounded-xl text-xs font-semibold transition ' + (
                result === 'skip'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700'
              )}
            >
              ⏭️ Skip
            </button>
            {result && (
              <button
                onClick={function() { handleResult(null); saveTestResult(suiteId, test.id, null) }}
                className="px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-500 rounded-xl text-xs transition"
              >
                ↺
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function TestSuite({ idea, components }) {
  const [suite, setSuite] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [stats, setStats] = useState({ pass: 0, fail: 0, skip: 0, total: 0 })
  const [ticker, setTicker] = useState(0)

  const suiteId = 'suite_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')

  useEffect(function() {
    if (suite) recalcStats()
  }, [suite, ticker])

  function recalcStats() {
    if (!suite) return
    const results = getTestResults(suiteId)
    let pass = 0
    let fail = 0
    let skip = 0
    let total = 0
    ;(suite.categories || []).forEach(function(cat) {
      ;(cat.tests || []).forEach(function(test) {
        total++
        const r = results[test.id]?.result
        if (r === 'pass') pass++
        else if (r === 'fail') fail++
        else if (r === 'skip') skip++
      })
    })
    setStats({ pass, fail, skip, total })
  }

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setSuite(null)
    try {
      const data = await generateTestSuite(idea, components)
      setSuite(data)
      setActiveCategory(0)
      notify.success('Test suite ready — ' + (data.totalTests || 0) + ' tests generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    clearTestResults(suiteId)
    setTicker(function(t) { return t + 1 })
    notify.success('All test results cleared')
  }

  function handleExport() {
    if (!suite) return
    const results = getTestResults(suiteId)
    exportTestReport(suite, results, idea)
    notify.success('Test report exported!')
  }

  const coveragePct = stats.total > 0
    ? Math.round(((stats.pass + stats.fail + stats.skip) / stats.total) * 100)
    : 0

  const passPct = stats.total > 0
    ? Math.round((stats.pass / stats.total) * 100)
    : 0

  const categories = suite?.categories || []
  const currentCategory = categories[activeCategory]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">
          AI generates a comprehensive test suite — mark each test as pass, fail, or skip
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '🧪 Creating...' : '🧪 Generate Tests'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Creating test suite...</p>
        </div>
      )}

      {suite && !loading && (
        <>
          {/* Test summary */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">{suite.suiteName}</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  {stats.total} tests · Est. {suite.estimatedTime}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
                >
                  ↺ Reset
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  ⬇️ Report
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Pass', value: stats.pass, color: 'text-green-400', bg: 'bg-green-950' },
                { label: 'Fail', value: stats.fail, color: 'text-red-400', bg: 'bg-red-950' },
                { label: 'Skip', value: stats.skip, color: 'text-slate-400', bg: 'bg-slate-900' },
                { label: 'Remaining', value: stats.total - stats.pass - stats.fail - stats.skip, color: 'text-indigo-400', bg: 'bg-indigo-950' },
              ].map(function(stat) {
                return (
                  <div key={stat.label} className={'rounded-xl p-2 text-center ' + stat.bg}>
                    <p className={'text-xl font-black ' + stat.color}>{stat.value}</p>
                    <p className="text-slate-600 text-xs">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Progress bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Coverage</span>
                  <span className="text-slate-400">{coveragePct}%</span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-2">
                  <div
                    className="h-2 bg-indigo-600 rounded-full transition-all"
                    style={{ width: coveragePct + '%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Pass Rate</span>
                  <span className={passPct >= 80 ? 'text-green-400' : passPct >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                    {passPct}%
                  </span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: passPct + '%',
                      backgroundColor: passPct >= 80 ? '#22c55e' : passPct >= 60 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(function(cat, i) {
              const catResults = getTestResults(suiteId)
              const catTests = cat.tests || []
              const catPassed = catTests.filter(function(t) { return catResults[t.id]?.result === 'pass' }).length
              return (
                <button
                  key={i}
                  onClick={function() { setActiveCategory(i) }}
                  className={'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition ' + (
                    activeCategory === i
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-700'
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={'px-1.5 py-0.5 rounded-full text-xs ' + (
                    activeCategory === i ? 'bg-indigo-500' : 'bg-[#1e1e2e]'
                  )}>
                    {catPassed}/{catTests.length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Current category tests */}
          {currentCategory && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{currentCategory.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{currentCategory.name}</p>
                  <p className="text-slate-500 text-xs">{currentCategory.description}</p>
                </div>
              </div>
              {(currentCategory.tests || []).map(function(test) {
                return (
                  <TestCard
                    key={test.id}
                    test={test}
                    suiteId={suiteId}
                    onResultChange={function() { setTicker(function(t) { return t + 1 }) }}
                  />
                )
              })}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Tests
          </button>
        </>
      )}

      {!suite && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🧪</div>
          <p className="text-white font-semibold mb-1">Test Suite Generator</p>
          <p className="text-slate-500 text-sm mb-4">
            AI creates tests for every component — hardware, integration, safety and more
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Hardware tests</span>
            <span>✓ Pass/Fail tracking</span>
            <span>✓ Coverage metrics</span>
            <span>✓ Export report</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestSuite