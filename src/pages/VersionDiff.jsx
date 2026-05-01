import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects, getAllVersions } from '../services/storage'
import { diffVersions, buildChangelog } from '../services/diffService'
import { notify } from '../services/toast'

function DiffBadge({ type }) {
  const styles = {
    added: 'bg-green-950 text-green-400 border-green-800',
    removed: 'bg-red-950 text-red-400 border-red-800',
    kept: 'bg-[#13131f] text-slate-400 border-[#2e2e4e]',
  }
  const labels = { added: '+ Added', removed: '- Removed', kept: '= Kept' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}

function ComponentDiffRow({ comp, type }) {
  const bg = type === 'added'
    ? 'bg-green-950 border-green-900'
    : type === 'removed'
    ? 'bg-red-950 border-red-900'
    : 'bg-[#13131f] border-[#2e2e4e]'

  const prefix = type === 'added' ? '+' : type === 'removed' ? '-' : '='
  const prefixColor = type === 'added' ? 'text-green-400' : type === 'removed' ? 'text-red-400' : 'text-slate-600'

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border rounded-xl ${bg}`}>
      <span className={`font-mono font-bold text-sm w-4 shrink-0 ${prefixColor}`}>{prefix}</span>
      <span className="text-lg shrink-0">{comp.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{comp.name}</p>
        <p className="text-slate-500 text-xs">{comp.category}</p>
      </div>
    </div>
  )
}

function VersionDiff() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [versions, setVersions] = useState([])
  const [versionA, setVersionA] = useState('')
  const [versionB, setVersionB] = useState('')
  const [diff, setDiff] = useState(null)
  const [changelog, setChangelog] = useState([])
  const [activeTab, setActiveTab] = useState('diff')

  useEffect(() => {
    const all = getAllProjects()
    setProjects(all)
    if (all.length > 0) {
      setSelectedProject(all[0].id)
    }
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    const project = projects.find(p => p.id === selectedProject)
    if (!project) return

    const allVersions = getAllVersions()
    const projectVersions = allVersions
      .filter(v => v.projectId === selectedProject || v.idea === project.idea)
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))

    setVersions(projectVersions)
    setDiff(null)
    setVersionA('')
    setVersionB('')

    if (projectVersions.length >= 2) {
      setVersionB(String(projectVersions[0].version))
      setVersionA(String(projectVersions[1].version))
      const cl = buildChangelog(projectVersions)
      setChangelog(cl)
    }
  }, [selectedProject, projects])

  function handleCompare() {
    const va = versions.find(v => String(v.version) === versionA)
    const vb = versions.find(v => String(v.version) === versionB)
    if (!va || !vb) {
      notify.warning('Please select two different versions')
      return
    }
    if (versionA === versionB) {
      notify.warning('Please select two different versions')
      return
    }
    const result = diffVersions(va, vb)
    setDiff(result)
    notify.success('Diff complete — ' + result.totalChanges + ' change' + (result.totalChanges !== 1 ? 's' : '') + ' found')
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const TABS = [
    { id: 'diff', label: '🔀 Diff Viewer' },
    { id: 'changelog', label: '📋 Changelog' },
    { id: 'timeline', label: '⏱️ Timeline' },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🔀 Version Diff Viewer</h2>
          <p className="text-slate-400 text-sm">Compare any two versions of a prototype to see what changed</p>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
        >
          📂 History →
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🔀</div>
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-slate-500 text-sm mb-6">Build and save prototypes to use the diff viewer</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition">
            ⚡ Start Building
          </button>
        </div>
      ) : (
        <>
          {/* Project selector */}
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Select Project</p>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.thumbnail} {p.idea.slice(0, 60)}
                </option>
              ))}
            </select>
          </div>

          {versions.length < 2 ? (
            <div className="text-center py-12 bg-[#13131f] border border-[#2e2e4e] rounded-2xl">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-white font-semibold mb-1">Not enough versions</p>
              <p className="text-slate-500 text-sm">
                This project only has {versions.length} saved version{versions.length !== 1 ? 's' : ''}.
                Save more versions to use the diff viewer.
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 mb-4 max-w-md">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                      activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Diff viewer tab */}
              {activeTab === 'diff' && (
                <div className="space-y-4">
                  {/* Version selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-2">From Version (older)</p>
                      <select
                        value={versionA}
                        onChange={e => { setVersionA(e.target.value); setDiff(null) }}
                        className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                      >
                        <option value="">Select version...</option>
                        {versions.map(v => (
                          <option key={v.version} value={String(v.version)}>
                            v{v.version} — {formatDate(v.savedAt)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-2">To Version (newer)</p>
                      <select
                        value={versionB}
                        onChange={e => { setVersionB(e.target.value); setDiff(null) }}
                        className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                      >
                        <option value="">Select version...</option>
                        {versions.map(v => (
                          <option key={v.version} value={String(v.version)}>
                            v{v.version} — {formatDate(v.savedAt)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleCompare}
                    disabled={!versionA || !versionB || versionA === versionB}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                  >
                    🔀 Show Diff
                  </button>

                  {diff && (
                    <div className="space-y-4">
                      {/* Diff summary */}
                      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1 text-center">
                            <p className="text-indigo-400 font-bold text-lg">v{diff.fromVersion}</p>
                            <p className="text-slate-600 text-xs">{formatDate(diff.fromDate)}</p>
                          </div>
                          <div className="text-slate-500 text-2xl font-bold">→</div>
                          <div className="flex-1 text-center">
                            <p className="text-sky-400 font-bold text-lg">v{diff.toVersion}</p>
                            <p className="text-slate-600 text-xs">{formatDate(diff.toDate)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { label: 'Added', value: diff.added.length, color: 'text-green-400' },
                            { label: 'Removed', value: diff.removed.length, color: 'text-red-400' },
                            { label: 'Kept', value: diff.kept.length, color: 'text-slate-400' },
                            { label: 'Similarity', value: diff.similarity + '%', color: 'text-indigo-400' },
                          ].map(stat => (
                            <div key={stat.label} className="text-center bg-[#0d0d1a] rounded-xl py-3">
                              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                              <p className="text-slate-600 text-xs">{stat.label}</p>
                            </div>
                          ))}
                        </div>

                        {diff.sizeChange !== 0 && (
                          <p className={`text-xs mt-3 text-center ${diff.sizeChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {diff.sizeChange > 0 ? '↑' : '↓'} {Math.abs(diff.sizeChange)} component{Math.abs(diff.sizeChange) !== 1 ? 's' : ''} {diff.sizeChange > 0 ? 'added' : 'removed'} overall
                          </p>
                        )}
                      </div>

                      {/* Component diff */}
                      <div className="space-y-2">
                        {diff.added.length > 0 && (
                          <div>
                            <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-2">
                              ✅ Added ({diff.added.length})
                            </p>
                            <div className="space-y-1">
                              {diff.added.map((comp, i) => (
                                <ComponentDiffRow key={i} comp={comp} type="added" />
                              ))}
                            </div>
                          </div>
                        )}

                        {diff.removed.length > 0 && (
                          <div>
                            <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2 mt-3">
                              ❌ Removed ({diff.removed.length})
                            </p>
                            <div className="space-y-1">
                              {diff.removed.map((comp, i) => (
                                <ComponentDiffRow key={i} comp={comp} type="removed" />
                              ))}
                            </div>
                          </div>
                        )}

                        {diff.kept.length > 0 && (
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2 mt-3">
                              = Unchanged ({diff.kept.length})
                            </p>
                            <div className="space-y-1">
                              {diff.kept.map((comp, i) => (
                                <ComponentDiffRow key={i} comp={comp} type="kept" />
                              ))}
                            </div>
                          </div>
                        )}

                        {diff.totalChanges === 0 && (
                          <div className="text-center py-6 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
                            <p className="text-slate-400 text-sm">✓ No changes between these versions</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
{/* Changelog tab */}
              {activeTab === 'changelog' && (
                <div className="space-y-3">
                  {changelog.length === 0 ? (
                    <div className="text-center py-12 bg-[#13131f] border border-[#2e2e4e] rounded-xl text-slate-500">
                      No changelog entries yet
                    </div>
                  ) : (
                    changelog.map((entry, i) => (
                      <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-400 font-bold text-sm">v{entry.version}</span>
                            {entry.diff.totalChanges > 0 ? (
                              <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">
                                {entry.diff.totalChanges} change{entry.diff.totalChanges !== 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-xs bg-[#1e1e2e] text-slate-500 border border-[#2e2e4e] px-2 py-0.5 rounded-full">
                                No changes
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-xs">{formatDate(entry.date)}</p>
                        </div>

                        <div className="flex gap-3">
                          {entry.diff.added.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-green-400 text-xs font-bold">+{entry.diff.added.length}</span>
                              <span className="text-slate-600 text-xs">added</span>
                            </div>
                          )}
                          {entry.diff.removed.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-red-400 text-xs font-bold">-{entry.diff.removed.length}</span>
                              <span className="text-slate-600 text-xs">removed</span>
                            </div>
                          )}
                          {entry.diff.kept.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 text-xs">{entry.diff.kept.length} kept</span>
                            </div>
                          )}
                        </div>

                        {(entry.diff.added.length > 0 || entry.diff.removed.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {entry.diff.added.map((c, j) => (
                              <span key={j} className="text-xs bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded-full">
                                + {c.name}
                              </span>
                            ))}
                            {entry.diff.removed.map((c, j) => (
                              <span key={j} className="text-xs bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded-full">
                                - {c.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Timeline tab */}
              {activeTab === 'timeline' && (
                <div className="space-y-0">
                  {versions.map((version, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 shrink-0 mt-1" />
                        {i < versions.length - 1 && (
                          <div className="w-0.5 flex-1 bg-[#2e2e4e] min-h-8" />
                        )}
                      </div>
                      <div className="pb-6 flex-1">
                        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-indigo-400 font-bold text-sm">v{version.version}</span>
                              {i === 0 && (
                                <span className="text-xs bg-green-950 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">
                                  Latest
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-xs">{formatDate(version.savedAt)}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(version.components || []).slice(0, 5).map((comp, j) => (
                              <span key={j} className="text-xs bg-[#0d0d1a] text-slate-400 px-2 py-0.5 rounded-full">
                                {comp.icon} {comp.name?.split(' ')[0]}
                              </span>
                            ))}
                            {(version.components || []).length > 5 && (
                              <span className="text-xs text-slate-600">+{version.components.length - 5} more</span>
                            )}
                          </div>
                          <p className="text-slate-600 text-xs mt-1">{version.components?.length || 0} components</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default VersionDiff