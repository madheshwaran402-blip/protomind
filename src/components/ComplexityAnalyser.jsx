import { useState } from 'react'
import { analyseComplexity } from '../services/complexityAnalyser'
import { notify } from '../services/toast'

const STATUS_COLORS = {
  Excellent: { color: 'text-emerald-400', bg: 'bg-emerald-950', border: 'border-emerald-800' },
  Good: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Fair: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Poor: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  Critical: { color: 'text-red-600', bg: 'bg-red-950', border: 'border-red-700' },
}

const GRADE_COLORS = {
  A: '#22c55e',
  B: '#84cc16',
  C: '#f59e0b',
  D: '#ef4444',
  F: '#dc2626',
}

function RadarChart({ dimensions }) {
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 60
  const count = dimensions.length

  function getPoint(index, value) {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2
    const dist = (value / 100) * r
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    }
  }

  function getAxisPoint(index, scale = 1) {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2
    return {
      x: cx + r * scale * Math.cos(angle),
      y: cy + r * scale * Math.sin(angle),
    }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const points = dimensions.map((d, i) => getPoint(i, d.score))
  const polyPoints = points.map(p => p.x + ',' + p.y).join(' ')

  return (
    <svg width={size} height={size} viewBox={'0 0 ' + size + ' ' + size} className="mx-auto">
      {/* Grid circles */}
      {gridLevels.map(level => {
        const gridPoints = dimensions.map((_, i) => getAxisPoint(i, level))
        const gp = gridPoints.map(p => p.x + ',' + p.y).join(' ')
        return <polygon key={level} points={gp} fill="none" stroke="#1e1e2e" strokeWidth="1" />
      })}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const end = getAxisPoint(i)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#2e2e4e" strokeWidth="1" />
      })}

      {/* Data polygon */}
      <polygon
        points={polyPoints}
        fill="#6366f120"
        stroke="#6366f1"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" />
      ))}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const labelPoint = getAxisPoint(i, 1.25)
        return (
          <text
            key={i}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="#94a3b8"
          >
            {d.icon}
          </text>
        )
      })}
    </svg>
  )
}

function ScoreBar({ score, status }) {
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.Fair
  const barColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: score + '%', backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color: barColor }}>{score}</span>
    </div>
  )
}

function DimensionCard({ dimension }) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_COLORS[dimension.status] || STATUS_COLORS.Fair

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
      >
        <span className="text-2xl shrink-0">{dimension.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white text-sm font-semibold">{dimension.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color} ${status.bg} ${status.border}`}>
              {dimension.status}
            </span>
          </div>
          <ScoreBar score={dimension.score} status={dimension.status} />
        </div>
        <span className="text-slate-600 shrink-0">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#2e2e4e] pt-3">
          {dimension.findings?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Findings</p>
              <ul className="space-y-1">
                {dimension.findings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-slate-500 shrink-0">•</span>
                    <p className="text-slate-300">{finding}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dimension.recommendations?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Recommendations</p>
              <ul className="space-y-1">
                {dimension.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-indigo-400 shrink-0">→</span>
                    <p className="text-slate-300">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ComplexityAnalyser({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleAnalyse() {
    setLoading(true)
    setResult(null)
    try {
      const data = await analyseComplexity(idea, components)
      setResult(data)
      notify.success('Analysis complete! Score: ' + data.overallScore + '/100')
    } catch {
      notify.error('Analysis failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const gradeColor = result ? (GRADE_COLORS[result.grade] || '#6366f1') : '#6366f1'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI analyses your prototype health across 5 engineering dimensions
        </p>
        <button
          onClick={handleAnalyse}
          disabled={loading}
          className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🔬 Analysing...' : '🔬 Analyse Health'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is reviewing your design...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Overall score */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
            <div className="flex items-center gap-6">
              <div className="text-center shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black border-2"
                  style={{ color: gradeColor, borderColor: gradeColor + '50', backgroundColor: gradeColor + '10' }}
                >
                  {result.grade}
                </div>
                <p className="text-slate-500 text-xs mt-1">Grade</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-white font-bold text-2xl">{result.overallScore}</p>
                  <p className="text-slate-500 text-sm">/ 100</p>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-3 mb-2">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: result.overallScore + '%',
                      backgroundColor: gradeColor,
                    }}
                  />
                </div>
                <p className="text-slate-400 text-xs">{result.summary}</p>
              </div>
            </div>
          </div>

          {/* Radar chart */}
          {result.dimensions?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 text-center">
                Design Health Radar
              </h4>
              <RadarChart dimensions={result.dimensions} />
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {result.dimensions.map(d => (
                  <div key={d.id} className="flex items-center gap-1 text-xs">
                    <span>{d.icon}</span>
                    <span className="text-slate-500">{d.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical issues */}
          {result.criticalIssues?.length > 0 && (
            <div className="bg-red-950 border border-red-900 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2">
                🚨 Critical Issues
              </p>
              <ul className="space-y-1">
                {result.criticalIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-red-400 shrink-0">!</span>
                    <p className="text-red-200">{issue}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dimension cards */}
          <div className="space-y-2">
            {result.dimensions?.map(dimension => (
              <DimensionCard key={dimension.id} dimension={dimension} />
            ))}
          </div>

          {/* Quick fixes */}
          {result.quickFixes?.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                ⚡ Quick Fixes
              </p>
              <div className="flex flex-wrap gap-2">
                {result.quickFixes.map((fix, i) => (
                  <span key={i} className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-1 rounded-full">
                    {fix}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.estimatedDebugTime && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-3">
              <span className="text-xl">⏱️</span>
              <div>
                <p className="text-slate-500 text-xs">Estimated debug time</p>
                <p className="text-white text-sm font-medium">{result.estimatedDebugTime}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyse}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Re-analyse
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🔬</div>
          <p className="text-white font-semibold mb-1">Prototype Health Analyser</p>
          <p className="text-slate-500 text-sm mb-4">
            Get a grade across power, signal integrity, thermal, reliability and buildability
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ 5 dimensions</span>
            <span>✓ Radar chart</span>
            <span>✓ Critical issues</span>
            <span>✓ Quick fixes</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplexityAnalyser