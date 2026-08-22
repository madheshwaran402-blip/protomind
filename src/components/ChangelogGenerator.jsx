import { useState } from 'react'
import { getChangelog, addVersion, generateVersionNotes, VERSION_TYPES } from '../services/changelogService'
import { notify } from '../services/toast'

const TYPE_STYLES = {
  major: 'text-red-400 bg-red-950 border-red-800',
  minor: 'text-blue-400 bg-blue-950 border-blue-800',
  patch: 'text-green-400 bg-green-950 border-green-800',
  alpha: 'text-purple-400 bg-purple-950 border-purple-800',
  beta: 'text-yellow-400 bg-yellow-950 border-yellow-800',
}

function ChangelogGenerator({ idea, components }) {
  const projectId = 'changelog_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  const [data, setData] = useState(getChangelog(projectId))
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ version: '', type: 'minor', notes: '', added: '', changed: '', fixed: '' })

  function refresh() { setData(getChangelog(projectId)) }

  function updateForm(key, value) { setForm(function(prev) { return Object.assign({}, prev, { [key]: value }) }) }

  async function handleAIGenerate() {
    if (!form.version.trim()) { notify.warning('Enter version number first'); return }
    setLoading(true)
    try {
      const notes = await generateVersionNotes(idea, components, form.version)
      setForm(function(prev) {
        return Object.assign({}, prev, {
          added: (notes.added || []).join('\n'),
          changed: (notes.changed || []).join('\n'),
          fixed: (notes.fixed || []).join('\n'),
        })
      })
      notify.success('AI generated changelog entries!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleAddVersion() {
    if (!form.version.trim()) { notify.warning('Enter version number'); return }
    addVersion(projectId, {
      version: form.version,
      type: form.type,
      notes: form.notes,
      added: form.added.split('\n').filter(Boolean),
      changed: form.changed.split('\n').filter(Boolean),
      fixed: form.fixed.split('\n').filter(Boolean),
    })
    setForm({ version: '', type: 'minor', notes: '', added: '', changed: '', fixed: '' })
    setShowForm(false)
    refresh()
    notify.success('Version ' + form.version + ' added!')
  }

  function handleExport() {
    const lines = ['# Changelog\n']
    ;(data.versions || []).forEach(function(ver) {
      lines.push('## [' + ver.version + '] - ' + ver.date)
      if (ver.changes.added?.length) { lines.push('### Added'); ver.changes.added.forEach(function(a) { lines.push('- ' + a) }); lines.push('') }
      if (ver.changes.changed?.length) { lines.push('### Changed'); ver.changes.changed.forEach(function(c) { lines.push('- ' + c) }); lines.push('') }
      if (ver.changes.fixed?.length) { lines.push('### Fixed'); ver.changes.fixed.forEach(function(f) { lines.push('- ' + f) }); lines.push('') }
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'CHANGELOG.md'; link.click()
    URL.revokeObjectURL(url)
    notify.success('CHANGELOG.md downloaded!')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={function() { setShowForm(!showForm) }}
          className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition">
          + Add Version
        </button>
        {(data.versions || []).length > 0 && (
          <button onClick={handleExport}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
            Export .md
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <input value={form.version} onChange={function(e) { updateForm('version', e.target.value) }}
              placeholder="e.g. 1.0.0" className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500" />
            <select value={form.type} onChange={function(e) { updateForm('type', e.target.value) }}
              className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none">
              {VERSION_TYPES.map(function(t) { return <option key={t} value={t}>{t}</option> })}
            </select>
            <button onClick={handleAIGenerate} disabled={loading || !form.version.trim()}
              className="px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs transition disabled:opacity-50">
              {loading ? '...' : 'AI Fill'}
            </button>
          </div>
          {[
            { key: 'added', label: 'Added (one per line)', color: 'text-green-400' },
            { key: 'changed', label: 'Changed (one per line)', color: 'text-yellow-400' },
            { key: 'fixed', label: 'Fixed (one per line)', color: 'text-blue-400' },
          ].map(function(field) {
            return (
              <div key={field.key}>
                <p className={'text-xs mb-1 ' + field.color}>{field.label}</p>
                <textarea value={form[field.key]} onChange={function(e) { updateForm(field.key, e.target.value) }}
                  className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-xs outline-none resize-none" rows={2} />
              </div>
            )
          })}
          <div className="flex gap-2">
            <button onClick={function() { setShowForm(false) }} className="flex-1 py-2 bg-[#0d0d1a] text-slate-400 rounded-lg text-xs">Cancel</button>
            <button onClick={handleAddVersion} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition">Add Version</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(data.versions || []).length === 0 ? (
          <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-white font-semibold mb-1">Changelog Generator</p>
            <p className="text-slate-500 text-sm">Track version history with AI-generated changelog entries</p>
          </div>
        ) : (
          (data.versions || []).map(function(ver) {
            const typeStyle = TYPE_STYLES[ver.type] || TYPE_STYLES.minor
            return (
              <div key={ver.id} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 bg-[#0d0d1a]">
                  <p className="text-white font-black text-lg">v{ver.version}</p>
                  <span className={'text-xs px-1.5 py-0.5 rounded border ' + typeStyle}>{ver.type}</span>
                  <span className="text-slate-500 text-xs ml-auto">{ver.date}</span>
                </div>
                <div className="p-4 space-y-2">
                  {ver.changes.added?.length > 0 && (
                    <div>
                      <p className="text-green-400 text-xs font-semibold mb-1">Added</p>
                      {ver.changes.added.map(function(a, i) { return <p key={i} className="text-slate-300 text-xs">+ {a}</p> })}
                    </div>
                  )}
                  {ver.changes.changed?.length > 0 && (
                    <div>
                      <p className="text-yellow-400 text-xs font-semibold mb-1">Changed</p>
                      {ver.changes.changed.map(function(c, i) { return <p key={i} className="text-slate-300 text-xs">~ {c}</p> })}
                    </div>
                  )}
                  {ver.changes.fixed?.length > 0 && (
                    <div>
                      <p className="text-blue-400 text-xs font-semibold mb-1">Fixed</p>
                      {ver.changes.fixed.map(function(f, i) { return <p key={i} className="text-slate-300 text-xs">* {f}</p> })}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ChangelogGenerator
