import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getVersionsForProject,
  diffVersions,
  getVersionStats,
} from '../services/versionHistoryService'
import { notify } from '../services/toast'

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatRelative(dateStr) {
  if (!dateStr) return ''
  const diff = (new Date() - new Date(dateStr)) / 1000
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago'
  return Math.floor(diff / 604800) + 'w ago'
}

function DiffBadge({ count, type }) {
  if (!count || count === 0) return null
  const styles = {
    added: 'bg-green-950 text-green-400 border-green-800',
    removed: 'bg-red-950 text-red-400 border-red-800',
    kept: 'bg-slate-900 text-slate-400 border-slate-700',
  }
  const labels = { added: '+', removed: '-', kept: '=' }
  return (
    <span className={'text-xs px-1.5 py-0.5 rounded border ' + styles[type]}>
      {labels[type]}{count}
    </span>
  )
}

function VersionCard({ version, index, isLatest, isSelected, onClick, diff }) {
  const compCount = (version.components || []).length

  return (
    <div
      onClick={onClick}
      className={'flex gap-3 cursor-pointer group ' + (index === 0 ? '' : '')}
    >
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center shrink-0">
        <div className={'w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ' + (
          isSelected
            ? 'bg-indigo-600 border-indigo-500 text-white'
            : isLatest
            ? 'bg-green-950 border-green-700 text-green-400'
            : 'bg-[#13131f] border-[#2e2e4e] text-slate-500 group-hover:border-indigo-600'
        )}>
          {isLatest ? '★' : 'v' + (index + 1)}
        </div>
        {index < 99 && (
          <div className="w-0.5 flex-1 bg-[#2e2e4e] mt-1 min-h-6" />
        )}
      </div>

      {/* Version content */}
      <div className={'flex-1 pb-4 ' + (isSelected ? '' : '')}>
        <div className={'rounded-xl border p-3 transition ' + (
          isSelected
            ? 'bg-indigo-950 border-indigo-700'
            : 'bg-[#13131f] border-[#2e2e4e] group-hover:border-indigo-800'
        )}>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white text-xs font-semibold">
              {isLatest ? '⭐ Latest' : 'Version ' + (index + 1)}
            </p>
            {isLatest && (
              <span className="text-xs bg-green-950 text-green-400 border border-green-800 px-1.5 py-0.5 rounded-full">
                Current
              </span>
            )}
            <span className="text-slate-600 text-xs ml-auto">{formatRelative(version.savedAt)}</span>
          </div>

          <p className="text-slate-500 text-xs mb-2">{formatDate(version.savedAt)}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-xs">{compCount} components</span>
            {diff && (
              <>
                <DiffBadge count={diff.added.length} type="added" />
                <DiffBadge count={diff.removed.length} type="removed" />
              </>
            )}
          </div>

          {/* Component preview */}
          <div className="flex flex-wrap gap-1 mt-2">
            {(version.components || []).slice(0, 4).map(function(comp, i) {
              return (
                <span key={i} className="text-xs bg-[#0d0d1a] text-slate-500 px-1.5 py-0.5 rounded-full">
                  {comp.icon} {comp.name.split(' ')[0]}
                </span>
              )
            })}
            {compCount > 4 && (
              <span className="text-xs text-slate-600">+{compCount - 4}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DiffView({ diff, versionA, versionB, indexA, indexB }) {
  if (!diff) return null

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-white font-bold text-sm">
          Changes: v{indexB + 1} → v{indexA + 1}
        </p>
        <div className="flex gap-2 ml-auto">
          {diff.costChange !== 0 && (
            <span className={'text-xs px-2 py-0.5 rounded-full border ' + (
              diff.costChange > 0
                ? 'bg-red-950 text-red-400 border-red-800'
                : 'bg-green-950 text-green-400 border-green-800'
            )}>
              {diff.costChange > 0 ? '+' : ''}${diff.costChange} cost
            </span>
          )}
          {diff.componentCountChange !== 0 && (
            <span className={'text-xs px-2 py-0.5 rounded-full border ' + (
              diff.componentCountChange > 0
                ? 'bg-green-950 text-green-400 border-green-800'
                : 'bg-red-950 text-red-400 border-red-800'
            )}>
              {diff.componentCountChange > 0 ? '+' : ''}{diff.componentCountChange} components
            </span>
          )}
        </div>
      </div>

      {diff.added.length > 0 && (
        <div>
          <p className="text-green-400 text-xs font-semibold mb-2">✅ Added ({diff.added.length})</p>
          <div className="space-y-1">
            {diff.added.map(function(comp, i) {
              return (
                <div key={i} className="flex items-center gap-2 bg-green-950 border border-green-900 rounded-lg px-3 py-1.5">
                  <span className="text-green-400 font-bold">+</span>
                  <span className="text-lg">{comp.icon}</span>
                  <span className="text-green-300 text-xs font-medium">{comp.name}</span>
                  <span className="text-green-700 text-xs">{comp.category}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {diff.removed.length > 0 && (
        <div>
          <p className="text-red-400 text-xs font-semibold mb-2">❌ Removed ({diff.removed.length})</p>
          <div className="space-y-1">
            {diff.removed.map(function(comp, i) {
              return (
                <div key={i} className="flex items-center gap-2 bg-red-950 border border-red-900 rounded-lg px-3 py-1.5">
                  <span className="text-red-400 font-bold">-</span>
                  <span className="text-lg">{comp.icon}</span>
                  <span className="text-red-300 text-xs font-medium">{comp.name}</span>
                  <span className="text-red-700 text-xs">{comp.category}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {diff.kept.length > 0 && (
        <div>
          <p className="text-slate-500 text-xs font-semibold mb-2">= Unchanged ({diff.kept.length})</p>
          <div className="flex flex-wrap gap-1">
            {diff.kept.map(function(comp, i) {
              return (
                <span key={i} className="text-xs bg-[#13131f] border border-[#2e2e4e] text-slate-400 px-2 py-0.5 rounded-full">
                  {comp.icon} {comp.name.split(' ')[0]}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {diff.added.length === 0 && diff.removed.length === 0 && (
        <p className="text-slate-500 text-xs text-center py-2">No component changes between these versions</p>
      )}
    </div>
  )
}

function VersionHistory({ idea, onRestore }) {
  const navigate = useNavigate()
  const [versions, setVersions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [compareIndex, setCompareIndex] = useState(null)
  const [diff, setDiff] = useState(null)
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('timeline')

  useEffect(function() {
    const v = getVersionsForProject(idea)
    setVersions(v)
    setStats(getVersionStats(v))
  }, [idea])

  function handleSelectVersion(index) {
    if (selectedIndex === index) {
      setSelectedIndex(null)
      setCompareIndex(null)
      setDiff(null)
      return
    }

    if (selectedIndex !== null && selectedIndex !== index) {
      setCompareIndex(index)
      const d = diffVersions(versions[index], versions[selectedIndex])
      setDiff(d)
      return
    }

    setSelectedIndex(index)
    setCompareIndex(null)
    setDiff(null)
  }

  function handleRestore(version) {
    if (onRestore) {
      onRestore(version)
      notify.success('Restored version from ' + formatDate(version.savedAt))
    } else {
      navigate('/viewer', {
        state: { idea: version.idea, selectedComponents: version.components },
      })
    }
  }

  const TABS = [
    { id: 'timeline', label: '📅 Timeline' },
    { id: 'stats', label: '📊 Stats' },
  ]

  if (versions.length === 0) {
    return (
      <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
        <div className="text-4xl mb-3">📅</div>
        <p className="text-white font-semibold mb-1">No Version History</p>
        <p className="text-slate-500 text-sm">Save versions of your prototype to see the timeline here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 max-w-xs">
        {TABS.map(function(tab) {
          return (
            <button
              key={tab.id}
              onClick={function() { setActiveTab(tab.id) }}
              className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'timeline' && (
        <>
          {/* Instructions */}
          <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-3">
            <p className="text-indigo-300 text-xs">
              💡 Click a version to select it. Click another to compare.
              {selectedIndex !== null && ' Version v' + (selectedIndex + 1) + ' selected — click another to diff.'}
            </p>
          </div>

          {/* Timeline */}
          <div>
            {versions.map(function(version, i) {
              const prevVersion = versions[i + 1]
              const vDiff = prevVersion ? diffVersions(prevVersion, version) : null
              return (
                <VersionCard
                  key={version.id || i}
                  version={version}
                  index={i}
                  isLatest={i === 0}
                  isSelected={selectedIndex === i || compareIndex === i}
                  onClick={function() { handleSelectVersion(i) }}
                  diff={vDiff}
                />
              )
            })}
          </div>

          {/* Diff view */}
          {diff && selectedIndex !== null && compareIndex !== null && (
            <DiffView
              diff={diff}
              versionA={versions[selectedIndex]}
              versionB={versions[compareIndex]}
              indexA={selectedIndex}
              indexB={compareIndex}
            />
          )}

          {/* Selected version actions */}
          {selectedIndex !== null && compareIndex === null && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-white font-semibold text-sm mb-1">
                Version {selectedIndex + 1} selected
              </p>
              <p className="text-slate-500 text-xs mb-3">
                {(versions[selectedIndex].components || []).length} components · {formatDate(versions[selectedIndex].savedAt)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={function() { handleRestore(versions[selectedIndex]) }}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  ⚡ Load This Version
                </button>
                <button
                  onClick={function() { setSelectedIndex(null); setDiff(null) }}
                  className="px-4 py-2 bg-[#1e1e2e] text-slate-400 rounded-xl text-xs transition"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Clear diff */}
          {diff && (
            <button
              onClick={function() { setSelectedIndex(null); setCompareIndex(null); setDiff(null) }}
              className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
            >
              ✕ Clear Comparison
            </button>
          )}
        </>
      )}

      {activeTab === 'stats' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Versions', value: stats.total, icon: '💾', color: 'text-indigo-400' },
              { label: 'Days Active', value: stats.daySpan + 'd', icon: '📅', color: 'text-blue-400' },
              { label: 'Max Components', value: stats.maxComps, icon: '🔧', color: 'text-green-400' },
              { label: 'Min Components', value: stats.minComps, icon: '📉', color: 'text-yellow-400' },
            ].map(function(stat) {
              return (
                <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className={'text-xl font-black ' + stat.color}>{stat.value}</p>
                  <p className="text-slate-600 text-xs">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {stats.mostUsed.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Most Used Components</p>
              {stats.mostUsed.map(function(comp, i) {
                return (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className="text-indigo-400 font-bold text-xs w-4">{i + 1}.</span>
                    <p className="text-slate-300 text-xs flex-1">{comp.name}</p>
                    <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded-full">
                      {comp.count}x
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Component Count Over Time</p>
            <div className="flex items-end gap-1 h-16">
              {versions.slice(0, 10).reverse().map(function(v, i) {
                const count = (v.components || []).length
                const maxC = stats.maxComps || 1
                const height = Math.max(8, (count / maxC) * 100)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-indigo-600 rounded-t-sm transition-all"
                      style={{ height: height + '%' }}
                    />
                    <span className="text-slate-700 text-xs">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VersionHistory