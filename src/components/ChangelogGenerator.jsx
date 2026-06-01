import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects, getAllVersions } from '../services/storage'
import {
  generateChangelog,
  buildMarkdownChangelog,
  saveChangelog,
  getChangelog,
} from '../services/changelogService'
import { notify } from '../services/toast'

const VERSION_TYPE_STYLES = {
  major: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🚀', label: 'Major' },
  minor: { color: 'text-indigo-400', bg: 'bg-indigo-950', border: 'border-indigo-800', icon: '✨', label: 'Minor' },
  patch: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🔧', label: 'Patch' },
}

function VersionEntry({ version }) {
  const [expanded, setExpanded] = useState(false)
  const typeStyle = VERSION_TYPE_STYLES[version.type] || VERSION_TYPE_STYLES.patch
  const hasChanges = (version.added?.length || 0) + (version.changed?.length || 0) +
    (version.removed?.length || 0) + (version.fixed?.length || 0)

  return (
    <div className={'border rounded-xl overflow-hidden ' + typeStyle.border}>
      <button
        onClick={function() { setExpanded(!expanded) }}
        className={'w-full flex items-center gap-3 p-4 text-left hover:opacity-90 transition ' + typeStyle.bg}
      >
        <span className="text-xl shrink-0">{typeStyle.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={'text-sm font-bold ' + typeStyle.color}>v{version.version}</span>
            <span className={'text-xs px-2 py-0.5 rounded-full border ' + typeStyle.color + ' ' + typeStyle.bg + ' ' + typeStyle.border}>
              {typeStyle.label}
            </span>
            {version.date && (
              <span className="text-slate-500 text-xs">{version.date}</span>
            )}
            <span className="text-slate-500 text-xs ml-auto">{hasChanges} change{hasChanges !== 1 ? 's' : ''}</span>
          </div>
          {version.headline && (
            <p className="text-slate-300 text-xs">{version.headline}</p>
          )}
        </div>
        <span className="text-slate-500 shrink-0">{expanded ? '↑' : '↓'}</span>
      </button>

      {expanded && (
        <div className="p-4 bg-[#13131f] space-y-3">
          {version.added && version.added.length > 0 && (
            <div>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-1">✅ Added</p>
              <ul className="space-y-1">
                {version.added.map(function(item, i) {
                  return (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <span className="text-green-400 shrink-0">+</span> {item}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {version.changed && version.changed.length > 0 && (
            <div>
              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-1">🔄 Changed</p>
              <ul className="space-y-1">
                {version.changed.map(function(item, i) {
                  return (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <span className="text-yellow-400 shrink-0">~</span> {item}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {version.removed && version.removed.length > 0 && (
            <div>
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">❌ Removed</p>
              <ul className="space-y-1">
                {version.removed.map(function(item, i) {
                  return (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <span className="text-red-400 shrink-0">-</span> {item}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {version.fixed && version.fixed.length > 0 && (
            <div>
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-1">🔵 Fixed</p>
              <ul className="space-y-1">
                {version.fixed.map(function(item, i) {
                  return (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <span className="text-blue-400 shrink-0">•</span> {item}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {version.notes && (
            <p className="text-slate-500 text-xs italic border-t border-[#2e2e4e] pt-2">{version.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}

function ChangelogGenerator({ idea }) {
  const navigate = useNavigate()
  const [changelog, setChangelog] = useState(getChangelog(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('visual')
  const [copied, setCopied] = useState(false)
  const [versions, setVersions] = useState([])

  useEffect(function() {
    const all = getAllVersions()
    const projectVersions = all.filter(function(v) {
      return v.idea === idea
    }).sort(function(a, b) {
      return new Date(b.savedAt) - new Date(a.savedAt)
    })
    setVersions(projectVersions)
  }, [idea])

  async function handleGenerate() {
    if (versions.length < 2) {
      notify.warning('Need at least 2 saved versions to generate changelog')
      return
    }
    setLoading(true)
    setChangelog(null)
    try {
      const data = await generateChangelog(idea, versions)
      setChangelog(data)
      saveChangelog(idea, data)
      notify.success('Changelog generated!')
    } catch (err) {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!changelog) return
    const md = buildMarkdownChangelog(changelog, idea)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'CHANGELOG.md'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('CHANGELOG.md downloaded!')
  }

  function handleCopy() {
    if (!changelog) return
    const md = buildMarkdownChangelog(changelog, idea)
    navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Changelog copied!')
  }

  const TABS = [
    { id: 'visual', label: '📋 Visual' },
    { id: 'markdown', label: '📝 Markdown' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-slate-400 text-sm">
            AI generates professional release notes from your version history
          </p>
          {versions.length < 2 && (
            <p className="text-yellow-400 text-xs mt-1">
              ⚠️ Need at least 2 saved versions — you have {versions.length}
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || versions.length < 2}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '📋 Writing...' : '📋 Generate Changelog'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is writing your changelog...</p>
        </div>
      )}

      {changelog && !loading && (
        <>
          {/* Header */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white font-black text-lg">{changelog.projectName}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-indigo-400 text-xs font-bold">Latest: v{changelog.latestVersion}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 text-xs">{changelog.releaseDate}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 text-xs">{(changelog.versions || []).length} versions</span>
                </div>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{changelog.summary}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-300 rounded-lg text-xs transition"
                >
                  {copied ? '✅' : '📋'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  ⬇️ .md
                </button>
              </div>
            </div>

            {/* Highlights */}
            {changelog.highlights && changelog.highlights.length > 0 && (
              <div className="mt-4 bg-indigo-950 border border-indigo-900 rounded-xl p-3">
                <p className="text-indigo-400 text-xs font-semibold mb-2">✨ Key Highlights</p>
                <ul className="space-y-1">
                  {changelog.highlights.map(function(h, i) {
                    return (
                      <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                        <span className="text-indigo-400 shrink-0">→</span> {h}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Breaking changes */}
            {changelog.breakingChanges && changelog.breakingChanges.length > 0 && (
              <div className="mt-3 bg-red-950 border border-red-900 rounded-xl p-3">
                <p className="text-red-400 text-xs font-semibold mb-2">⚠️ Breaking Changes</p>
                <ul className="space-y-1">
                  {changelog.breakingChanges.map(function(b, i) {
                    return (
                      <li key={i} className="text-red-200 text-xs flex items-start gap-2">
                        <span className="text-red-400 shrink-0">!</span> {b}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
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

          {/* Visual tab */}
          {activeTab === 'visual' && (
            <div className="space-y-2">
              {(changelog.versions || []).map(function(version, i) {
                return (
                  <VersionEntry key={version.version || i} version={version} />
                )
              })}

              {changelog.contributors && changelog.contributors.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-semibold mb-2">👥 Contributors</p>
                  <div className="flex flex-wrap gap-2">
                    {changelog.contributors.map(function(contributor, i) {
                      return (
                        <span key={i} className="text-xs bg-[#0d0d1a] text-slate-300 border border-[#2e2e4e] px-2 py-1 rounded-full">
                          👤 {contributor}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Markdown tab */}
          {activeTab === 'markdown' && (
            <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-500 text-xs ml-2">CHANGELOG.md</span>
                <button
                  onClick={handleCopy}
                  className="ml-auto text-xs text-slate-500 hover:text-white"
                >
                  {copied ? '✅ Copied' : '📋 Copy'}
                </button>
              </div>
              <pre className="p-4 text-xs text-green-400 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap max-h-80">
                {buildMarkdownChangelog(changelog, idea)}
              </pre>
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Changelog
          </button>
        </>
      )}

      {!changelog && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-white font-semibold mb-1">Changelog Generator</p>
          <p className="text-slate-500 text-sm mb-4">
            Generate professional release notes from your version history
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Version entries</span>
            <span>✓ Added/Changed/Removed</span>
            <span>✓ CHANGELOG.md export</span>
            <span>✓ Breaking changes</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChangelogGenerator