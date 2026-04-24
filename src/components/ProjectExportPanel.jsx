import { useState } from 'react'
import { exportProject, exportAllProjects, importProject } from '../services/projectExport'
import { getAllProjects } from '../services/storage'
import { notify } from '../services/toast'

function ProjectExportPanel() {
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [selectedProject, setSelectedProject] = useState('')
  const [activeTab, setActiveTab] = useState('export')
  const projects = getAllProjects()

  function handleExportSingle() {
    if (!selectedProject) {
      notify.warning('Please select a project to export')
      return
    }
    try {
      exportProject(selectedProject)
      notify.success('Project exported successfully!')
    } catch (err) {
      notify.error('Export failed: ' + err.message)
    }
  }

  function handleExportAll() {
    try {
      exportAllProjects()
      notify.success('All ' + projects.length + ' projects exported!')
    } catch (err) {
      notify.error('Export failed: ' + err.message)
    }
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const results = importProject(ev.target.result)
        setImportResult(results)
        if (results.imported > 0) {
          notify.success('Imported ' + results.imported + ' project' + (results.imported > 1 ? 's' : '') + '!')
        }
        if (results.errors.length > 0) {
          notify.warning(results.errors.length + ' project(s) had errors')
        }
      } catch (err) {
        notify.error('Import failed: ' + err.message)
        setImportResult({ imported: 0, skipped: 0, errors: [err.message] })
      } finally {
        setImporting(false)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const TABS = [
    { id: 'export', label: '📤 Export' },
    { id: 'import', label: '📥 Import' },
    { id: 'info', label: 'ℹ️ Format' },
  ]

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Export tab */}
      {activeTab === 'export' && (
        <div className="space-y-4">

          {/* Export single project */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h4 className="text-white text-sm font-semibold mb-3">Export Single Project</h4>
            <p className="text-slate-500 text-xs mb-3">
              Exports everything — components, notes, ratings, pin assignments, and version history.
            </p>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-[#2e2e4e] text-white text-xs rounded-xl px-3 py-2.5 outline-none mb-3"
            >
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.thumbnail} {p.idea.slice(0, 50)}
                </option>
              ))}
            </select>
            <button
              onClick={handleExportSingle}
              disabled={!selectedProject}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              📤 Export Project as JSON
            </button>
          </div>

          {/* Export all projects */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h4 className="text-white text-sm font-semibold mb-2">Export All Projects</h4>
            <p className="text-slate-500 text-xs mb-3">
              Creates a complete backup of all {projects.length} project{projects.length !== 1 ? 's' : ''} in a single file.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Projects', value: projects.length },
                { label: 'Est. Size', value: Math.round(JSON.stringify(projects).length / 1024) + 'KB' },
                { label: 'Format', value: 'JSON' },
              ].map(item => (
                <div key={item.label} className="bg-[#0d0d1a] rounded-lg p-2 text-center">
                  <p className="text-white text-sm font-bold">{item.value}</p>
                  <p className="text-slate-600 text-xs">{item.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleExportAll}
              disabled={projects.length === 0}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              📦 Export All Projects
            </button>
          </div>
        </div>
      )}

      {/* Import tab */}
      {activeTab === 'import' && (
        <div className="space-y-4">

          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h4 className="text-white text-sm font-semibold mb-2">Import Projects</h4>
            <p className="text-slate-500 text-xs mb-4">
              Import a ProtoMind JSON file exported from this or another device. Existing projects with the same idea will be updated.
            </p>

            <label className={`block w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              importing
                ? 'border-indigo-700 bg-indigo-950'
                : 'border-[#2e2e4e] hover:border-indigo-700'
            }`}>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <div className="text-3xl mb-2">{importing ? '⏳' : '📥'}</div>
              <p className="text-white text-sm font-medium mb-1">
                {importing ? 'Importing...' : 'Click to select file'}
              </p>
              <p className="text-slate-500 text-xs">
                Accepts ProtoMind .json export files
              </p>
            </label>
          </div>

          {/* Import result */}
          {importResult && (
            <div className={`rounded-xl border p-4 ${
              importResult.errors.length > 0
                ? 'bg-yellow-950 border-yellow-900'
                : 'bg-green-950 border-green-900'
            }`}>
              <p className={`font-semibold text-sm mb-2 ${
                importResult.errors.length > 0 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {importResult.imported > 0
                  ? '✅ Imported ' + importResult.imported + ' project' + (importResult.imported > 1 ? 's' : '') + ' successfully'
                  : '⚠️ No projects imported'}
              </p>
              {importResult.skipped > 0 && (
                <p className="text-yellow-300 text-xs mb-1">{importResult.skipped} project(s) skipped</p>
              )}
              {importResult.errors.map((err, i) => (
                <p key={i} className="text-red-300 text-xs">• {err}</p>
              ))}
              {importResult.imported > 0 && (
                <p className="text-slate-400 text-xs mt-2">
                  Go to History to see your imported projects
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info tab */}
      {activeTab === 'info' && (
        <div className="space-y-3">
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <h4 className="text-white text-sm font-semibold mb-3">📋 What Gets Exported</h4>
            <div className="space-y-2">
              {[
                { icon: '💡', label: 'Prototype idea', desc: 'The original idea text' },
                { icon: '🔧', label: 'Components', desc: 'All selected components with specs' },
                { icon: '🏷️', label: 'Tags', desc: 'Project category tags' },
                { icon: '📝', label: 'Notes', desc: 'Build log, next steps, component notes' },
                { icon: '⭐', label: 'Rating', desc: 'Star rating, review, difficulty' },
                { icon: '📌', label: 'Pin Assignments', desc: 'MCU pin connection table' },
                { icon: '🕐', label: 'Version History', desc: 'Last 10 saved versions' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 py-1.5 border-b border-[#2e2e4e] last:border-0">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-white text-xs font-medium">{item.label}</p>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
            <h4 className="text-indigo-400 text-sm font-semibold mb-2">💡 Use Cases</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>• Share prototypes with teammates or classmates</li>
              <li>• Back up your projects before clearing browser data</li>
              <li>• Move projects between devices</li>
              <li>• Submit projects for school or university assignments</li>
              <li>• Build a personal portfolio of prototypes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectExportPanel