import { useState } from 'react'
import { generateExportBundle } from '../services/exportBundleService'
import { notify } from '../services/toast'

const BUNDLE_FILES = [
  { icon: '📝', name: 'README.md', desc: 'Project overview and getting started guide' },
  { icon: '📊', name: 'BOM.csv', desc: 'Complete bill of materials with prices' },
  { icon: '🔌', name: 'WIRING.md', desc: 'Pin connections and wiring instructions' },
  { icon: '📋', name: 'SPECS.md', desc: 'Technical specifications for all components' },
  { icon: '✅', name: 'CHECKLIST.md', desc: 'Step-by-step build checklist' },
  { icon: '💻', name: 'code/main.ino', desc: 'Arduino starter code with pin definitions' },
  { icon: '📄', name: 'SUMMARY.txt', desc: 'Complete bundle summary and cost breakdown' },
]

export default function ExportBundle({ idea, components }) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  async function handleExport() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setProgress(0)
    setDone(false)

    const progressInterval = setInterval(function() {
      setProgress(function(prev) {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const result = await generateExportBundle(idea, components, {})
      clearInterval(progressInterval)
      setProgress(100)

      const url = URL.createObjectURL(result.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      link.click()
      URL.revokeObjectURL(url)

      setDone(true)
      notify.success('Bundle downloaded: ' + result.filename)
      setTimeout(function() { setDone(false); setProgress(0) }, 3000)
    } catch (err) {
      clearInterval(progressInterval)
      notify.error('Export failed: ' + err.message)
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">
        Download a complete ZIP bundle with all your prototype documentation
      </p>

      {/* Bundle contents */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Bundle Contains {BUNDLE_FILES.length} Files
        </p>
        <div className="space-y-2">
          {BUNDLE_FILES.map(function(file) {
            return (
              <div key={file.name} className="flex items-center gap-3">
                <span className="text-xl shrink-0">{file.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-mono font-medium">{file.name}</p>
                  <p className="text-slate-500 text-xs">{file.desc}</p>
                </div>
                <span className="text-green-400 text-xs shrink-0">✓</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Component summary */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-2">Will be bundled with {components.length} components</p>
        <div className="flex flex-wrap gap-1">
          {components.slice(0, 6).map(function(comp, i) {
            return (
              <span key={i} className="text-xs bg-[#13131f] border border-[#2e2e4e] text-slate-300 px-2 py-0.5 rounded-full">
                {comp.icon} {comp.name.split(' ')[0]}
              </span>
            )
          })}
          {components.length > 6 && (
            <span className="text-xs text-slate-600">+{components.length - 6} more</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Generating bundle...</span>
            <span className="text-indigo-400">{progress}%</span>
          </div>
          <div className="w-full bg-[#1e1e2e] rounded-full h-2">
            <div
              className="h-2 bg-indigo-600 rounded-full transition-all duration-200"
              style={{ width: progress + '%' }}
            />
          </div>
          <p className="text-slate-600 text-xs text-center">
            {progress < 30 ? 'Creating files...' :
             progress < 60 ? 'Generating code...' :
             progress < 90 ? 'Compressing bundle...' :
             'Finalising...'}
          </p>
        </div>
      )}

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={loading || components.length === 0}
        className={'w-full py-4 rounded-2xl text-sm font-bold transition disabled:opacity-50 ' + (
          done
            ? 'bg-green-700 text-green-100'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
        )}
      >
        {loading ? '📦 Building Bundle...' :
         done ? '✅ Bundle Downloaded!' :
         '📦 Download Complete Bundle (.zip)'}
      </button>

      {components.length === 0 && (
        <p className="text-slate-600 text-xs text-center">Add components to generate an export bundle</p>
      )}

      <div className="text-xs text-slate-600 text-center">
        No internet required — everything generated locally
      </div>
    </div>
  )
}