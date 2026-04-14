import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllVersions, restoreVersion } from '../services/storage'
import { notify } from '../services/toast'

function VersionCard({ version, isLatest, onRestore, onLoad }) {
  const date = new Date(version.savedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const time = new Date(version.savedAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`bg-[#13131f] border rounded-xl p-4 transition ${
      isLatest ? 'border-indigo-700' : 'border-[#2e2e4e]'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            isLatest ? 'bg-indigo-600 text-white' : 'bg-[#2e2e4e] text-slate-400'
          }`}>
            v{version.version}
          </div>
          {isLatest && (
            <span className="text-xs bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-800">
              Latest
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{date}</p>
          <p className="text-xs text-slate-600">{time}</p>
        </div>
      </div>

      <p className="text-white text-xs font-medium mb-1 line-clamp-1">{version.idea}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{version.thumbnail}</span>
        <span className="text-xs text-slate-500">
          {version.componentCount} component{version.componentCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onLoad(version)}
          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition"
        >
          Load →
        </button>
        {!isLatest && (
          <button
            onClick={() => onRestore(version)}
            className="flex-1 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
          >
            ↺ Restore
          </button>
        )}
      </div>
    </div>
  )
}

function VersionHistory({ idea, currentComponents }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const allVersions = getAllVersions()
  const projectVersions = allVersions
    .filter(v => v.idea === idea)
    .sort((a, b) => b.version - a.version)

  function handleLoad(version) {
    navigate('/viewer', {
      state: {
        idea: version.idea,
        selectedComponents: version.components,
        positions: version.positions,
      },
    })
    notify.info('Loaded version ' + version.version)
  }

  function handleRestore(version) {
    restoreVersion(version)
    notify.success('Restored to version ' + version.version)
    setTimeout(() => {
      navigate('/viewer', {
        state: {
          idea: version.idea,
          selectedComponents: version.components,
          positions: version.positions,
        },
      })
    }, 500)
  }

  if (projectVersions.length === 0) return null

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="text-lg font-bold text-white">🕐 Version History</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {projectVersions.length} saved version{projectVersions.length !== 1 ? 's' : ''} of this prototype
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {projectVersions.slice(0, 5).map((v, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-indigo-900 border border-indigo-700 flex items-center justify-center text-xs text-indigo-400 font-bold"
              >
                {v.version}
              </div>
            ))}
          </div>
          <span className="text-slate-500 text-sm">{isOpen ? '↑' : '↓'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            {projectVersions.map((version, i) => (
              <VersionCard
                key={version.id}
                version={version}
                isLatest={i === 0}
                onLoad={handleLoad}
                onRestore={handleRestore}
              />
            ))}
          </div>

          {projectVersions.length > 1 && (
            <div className="mt-4 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                📊 Version Timeline
              </h4>
              <div className="flex items-center gap-0 overflow-x-auto pb-2">
                {projectVersions.slice().reverse().map((v, i) => (
                  <div key={v.id} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        i === projectVersions.length - 1
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-[#1e1e2e] border-[#2e2e4e] text-slate-400'
                      }`}>
                        v{v.version}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 text-center w-16">
                        {new Date(v.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-700 text-center">
                        {v.componentCount}c
                      </p>
                    </div>
                    {i < projectVersions.length - 1 && (
                      <div className="w-8 h-0.5 bg-[#2e2e4e] mx-1 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VersionHistory