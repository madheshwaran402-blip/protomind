import { useState } from 'react'
import { mapDependencies, saveDependencyMap, getDependencyMap } from '../services/dependencyMapperService'
import { notify } from '../services/toast'

const LICENSE_COLORS = { MIT: 'text-green-400', GPL: 'text-red-400', Apache: 'text-blue-400', BSD: 'text-yellow-400' }

function DependencyMapper({ idea, components }) {
  const [result, setResult] = useState(getDependencyMap(idea))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('libraries')
  const [copiedCmd, setCopiedCmd] = useState(null)

  async function handleMap() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await mapDependencies(idea, components)
      setResult(data)
      saveDependencyMap(idea, data)
      notify.success('Dependencies mapped!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function copyCmd(cmd, idx) {
    navigator.clipboard.writeText(cmd)
    setCopiedCmd(idx)
    setTimeout(function() { setCopiedCmd(null) }, 2000)
    notify.success('Command copied!')
  }

  function copyAll() {
    const libs = result?.libraries || []
    const cmds = libs.map(function(l) { return l.installCommand }).filter(Boolean).join('\n')
    navigator.clipboard.writeText(cmds)
    notify.success('All install commands copied!')
  }

  const TABS = [{ id: 'libraries', label: 'Libraries' }, { id: 'hardware', label: 'Hardware Deps' }, { id: 'software', label: 'Software Deps' }]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Map all library, hardware and software dependencies for your prototype</p>
        <button onClick={handleMap} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Mapping...' : 'Map Dependencies'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Mapping dependencies...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Libraries', count: (result.libraries || []).length, color: 'text-indigo-400' },
              { label: 'HW Deps', count: (result.hardwareDependencies || []).length, color: 'text-yellow-400' },
              { label: 'SW Deps', count: (result.softwareDependencies || []).length, color: 'text-green-400' },
            ].map(function(stat) {
              return (
                <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                  <p className={'text-2xl font-black ' + stat.color}>{stat.count}</p>
                  <p className="text-slate-600 text-xs">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition ' + (activeTab === tab.id ? 'bg-orange-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'libraries' && (
            <div className="space-y-2">
              {(result.libraries || []).length > 0 && (
                <button onClick={copyAll} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
                  Copy All Install Commands
                </button>
              )}
              {(result.libraries || []).map(function(lib, i) {
                const licColor = LICENSE_COLORS[lib.license] || 'text-slate-400'
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold text-sm">{lib.name}</p>
                      {lib.version && <span className="text-slate-500 text-xs">{lib.version}</span>}
                      {lib.license && <span className={'text-xs ' + licColor}>{lib.license}</span>}
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{lib.purpose}</p>
                    {lib.installCommand && (
                      <div className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg px-3 py-1.5">
                        <code className="text-green-400 text-xs font-mono flex-1 truncate">{lib.installCommand}</code>
                        <button onClick={function() { copyCmd(lib.installCommand, i) }}
                          className="text-xs text-slate-600 hover:text-white shrink-0">
                          {copiedCmd === i ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-2">
              {(result.hardwareDependencies || []).map(function(dep, i) {
                return (
                  <div key={i} className={'rounded-xl border p-4 ' + (dep.critical ? 'bg-red-950 border-red-900' : 'bg-[#13131f] border-[#2e2e4e]')}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold text-sm">{dep.component}</p>
                      {dep.critical && <span className="text-xs bg-red-900 text-red-300 border border-red-700 px-1.5 py-0.5 rounded-full">Critical</span>}
                    </div>
                    {dep.dependsOn && dep.dependsOn.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {dep.dependsOn.map(function(d, j) {
                          return <span key={j} className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-2 py-0.5 rounded-full">Needs: {d}</span>
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'software' && (
            <div className="space-y-2">
              {(result.softwareDependencies || []).map(function(dep, i) {
                return (
                  <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-3">
                    <div className={'w-2 h-2 rounded-full shrink-0 ' + (dep.required ? 'bg-red-400' : 'bg-green-400')} />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{dep.name}</p>
                      <div className="flex gap-2 text-xs text-slate-500">
                        {dep.type && <span>{dep.type}</span>}
                        {dep.version && <span>{dep.version}</span>}
                      </div>
                    </div>
                    <span className={'text-xs ' + (dep.required ? 'text-red-400' : 'text-green-400')}>
                      {dep.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <button onClick={handleMap} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Remap</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🗂️</div>
          <p className="text-white font-semibold mb-1">Dependency Mapper</p>
          <p className="text-slate-500 text-sm">Map all libraries and dependencies with install commands</p>
        </div>
      )}
    </div>
  )
}

export default DependencyMapper
