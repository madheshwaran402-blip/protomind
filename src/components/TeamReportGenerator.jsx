import { useState } from 'react'
import { generateTeamReport, exportReportAsText } from '../services/teamReportService'
import { notify } from '../services/toast'

const STATUS_STYLES = {
  'On Track': { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅' },
  'At Risk': { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚠️' },
  'Delayed': { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🛑' },
}

const MILESTONE_STATUS_COLORS = {
  Complete: 'text-green-400 bg-green-950 border-green-800',
  'In Progress': 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Pending: 'text-slate-400 bg-slate-900 border-slate-700',
  Delayed: 'text-red-400 bg-red-950 border-red-800',
}

function TeamReportGenerator({ idea, components }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [copied, setCopied] = useState(false)
  const [options, setOptions] = useState({
    teamName: '',
    progressPercent: 50,
    reportType: 'weekly',
  })

  function updateOption(key, value) {
    setOptions(function(prev) {
      const next = {}
      Object.keys(prev).forEach(function(k) { next[k] = prev[k] })
      next[key] = value
      return next
    })
  }

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setReport(null)
    try {
      const data = await generateTeamReport(idea, components, options)
      setReport(data)
      notify.success('Team report generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleExport() {
    if (!report) return
    const text = exportReportAsText(report, idea, options)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ProjectReport_' + new Date().toISOString().slice(0, 10) + '.txt'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Report downloaded!')
  }

  function handleCopy() {
    if (!report) return
    const text = exportReportAsText(report, idea, options)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Report copied!')
  }

  const statusStyle = report ? (STATUS_STYLES[report.projectStatus] || STATUS_STYLES['On Track']) : null

  const TABS = [
    { id: 'summary', label: '📋 Summary' },
    { id: 'components', label: '🔧 Components' },
    { id: 'challenges', label: '⚠️ Challenges' },
    { id: 'milestones', label: '🎯 Milestones' },
  ]

  return (
    <div className="space-y-4">

      {/* Report options */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide">Report Settings</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Team Name</p>
            <input
              value={options.teamName}
              onChange={function(e) { updateOption('teamName', e.target.value) }}
              placeholder="e.g. Team Alpha"
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Report Type</p>
            <select
              value={options.reportType}
              onChange={function(e) { updateOption('reportType', e.target.value) }}
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none"
            >
              <option value="weekly">Weekly Status</option>
              <option value="milestone">Milestone Report</option>
              <option value="final">Final Report</option>
              <option value="client">Client Presentation</option>
            </select>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-xs text-slate-500">Overall Progress</p>
            <p className="text-xs text-indigo-400 font-bold">{options.progressPercent}%</p>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={options.progressPercent}
            onChange={function(e) { updateOption('progressPercent', parseInt(e.target.value)) }}
            className="w-full accent-indigo-600"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || components.length === 0}
        className="w-full py-3 bg-blue-700 hover:bg-blue-600 rounded-xl text-sm font-bold transition disabled:opacity-50"
      >
        {loading ? '📋 Generating...' : '📋 Generate Team Report'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is writing your team report...</p>
        </div>
      )}

      {report && !loading && (
        <>
          {/* Status banner */}
          <div className={'rounded-2xl border p-5 ' + statusStyle.bg + ' ' + statusStyle.border}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-black text-base mb-1">{report.reportTitle}</h3>
                <div className="flex items-center gap-3">
                  <span className={'text-sm font-bold ' + statusStyle.color}>
                    {statusStyle.icon} {report.projectStatus}
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-slate-400 text-xs">{report.completionPercent || options.progressPercent}% complete</span>
                  {report.nextMeeting && (
                    <>
                      <span className="text-slate-400 text-xs">·</span>
                      <span className="text-slate-400 text-xs">Next: {report.nextMeeting}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-300 rounded-lg text-xs transition"
                >
                  {copied ? '✅' : '📋'}
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  ⬇️ Export
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#1e1e2e] rounded-full h-2.5 mb-3">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: (report.completionPercent || options.progressPercent) + '%',
                  backgroundColor: report.projectStatus === 'On Track' ? '#22c55e' :
                    report.projectStatus === 'At Risk' ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">{report.executiveSummary}</p>
          </div>

          {/* Budget status */}
          {report.budgetStatus && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Estimated', value: report.budgetStatus.estimated, color: 'text-slate-300' },
                { label: 'Spent', value: report.budgetStatus.spent, color: 'text-red-400' },
                { label: 'Remaining', value: report.budgetStatus.remaining, color: 'text-green-400' },
              ].map(function(item) {
                return (
                  <div key={item.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
                    <p className={'text-base font-bold ' + item.color}>{item.value || 'N/A'}</p>
                    <p className="text-slate-600 text-xs">{item.label}</p>
                  </div>
                )
              })}
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

          {/* Summary tab */}
          {activeTab === 'summary' && (
            <div className="space-y-3">
              {(report.sections || []).map(function(section, i) {
                const secStatusColor = section.status === 'Complete' ? 'text-green-400' :
                  section.status === 'In Progress' ? 'text-yellow-400' : 'text-red-400'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold text-sm">{section.title}</p>
                      <span className={'text-xs ' + secStatusColor}>{section.status}</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{section.content}</p>
                  </div>
                )
              })}

              {report.recommendations && report.recommendations.length > 0 && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                  <p className="text-indigo-400 text-xs font-semibold mb-2">💡 Recommendations</p>
                  <ul className="space-y-1">
                    {report.recommendations.map(function(rec, i) {
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

          {/* Components tab */}
          {activeTab === 'components' && (
            <div className="space-y-2">
              {(report.componentDecisions || []).map(function(cd, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <p className="text-white font-semibold text-sm mb-1">{cd.component}</p>
                    <p className="text-indigo-400 text-xs mb-1">Decision: {cd.decision}</p>
                    <p className="text-slate-400 text-xs">Rationale: {cd.rationale}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Challenges tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-2">
              {(report.challenges || []).length === 0 ? (
                <div className="text-center py-6 text-slate-600 text-sm">No challenges recorded</div>
              ) : (
                report.challenges.map(function(ch, i) {
                  return (
                    <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                      <p className="text-white font-semibold text-sm mb-2">{ch.challenge}</p>
                      <div className="space-y-1">
                        <p className="text-red-300 text-xs">
                          <span className="text-red-400 font-semibold">Impact: </span>{ch.impact}
                        </p>
                        <p className="text-green-300 text-xs">
                          <span className="text-green-400 font-semibold">Resolution: </span>{ch.resolution}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Milestones tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-2">
              {(report.milestones || []).map(function(milestone, i) {
                const msClass = MILESTONE_STATUS_COLORS[milestone.status] || MILESTONE_STATUS_COLORS.Pending
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={'w-4 h-4 rounded-full border-2 mt-0.5 ' + (
                        milestone.status === 'Complete' ? 'bg-green-600 border-green-500' :
                        milestone.status === 'In Progress' ? 'bg-yellow-600 border-yellow-500' :
                        'bg-[#1e1e2e] border-slate-600'
                      )} />
                      {i < (report.milestones || []).length - 1 && (
                        <div className="w-0.5 h-8 bg-[#2e2e4e] mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-semibold">{milestone.name}</p>
                        <span className={'text-xs px-2 py-0.5 rounded-full border ' + msClass}>
                          {milestone.status}
                        </span>
                      </div>
                      {milestone.dueDate && (
                        <p className="text-slate-500 text-xs">Due: {milestone.dueDate}</p>
                      )}
                      {milestone.notes && (
                        <p className="text-slate-400 text-xs mt-1">{milestone.notes}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Report
          </button>
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-white font-semibold mb-1">Team Report Generator</p>
          <p className="text-slate-500 text-sm mb-4">
            Generate a professional project status report for your team or supervisor
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Executive summary</span>
            <span>✓ Component decisions</span>
            <span>✓ Challenges</span>
            <span>✓ Milestones</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamReportGenerator