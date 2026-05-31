import { useState } from 'react'
import { generatePCBChecklist } from '../services/pcbHelperService'
import { notify } from '../services/toast'

const ORDERING_SERVICES = [
  {
    name: 'JLCPCB',
    icon: '🟡',
    price: '$2 for 5 boards',
    turnaround: '24-48 hours production',
    url: 'https://jlcpcb.com',
    notes: 'Best for beginners, cheapest option',
    color: '#eab308',
  },
  {
    name: 'PCBWay',
    icon: '🔵',
    price: '$5 for 5 boards',
    turnaround: '3-5 days production',
    url: 'https://www.pcbway.com',
    notes: 'Good quality, great customer service',
    color: '#3b82f6',
  },
  {
    name: 'OSH Park',
    icon: '🟣',
    price: '$5 per sq inch',
    turnaround: '12 days production',
    url: 'https://oshpark.com',
    notes: 'Purple PCBs, USA made, high quality',
    color: '#a855f7',
  },
  {
    name: 'Elecrow',
    icon: '🟢',
    price: '$4.90 for 10 boards',
    turnaround: '5-7 days production',
    url: 'https://www.elecrow.com',
    notes: 'Good value, assembly service available',
    color: '#22c55e',
  },
]

const FREE_TOOLS = [
  { name: 'KiCad', icon: '⚡', type: 'Full EDA Suite', free: true, url: 'https://www.kicad.org', best: 'Professional open-source' },
  { name: 'EasyEDA', icon: '🌐', type: 'Online Designer', free: true, url: 'https://easyeda.com', best: 'Beginner friendly, JLCPCB integrated' },
  { name: 'Fritzing', icon: '🎨', type: 'Beginner EDA', free: false, url: 'https://fritzing.org', best: 'Best for breadboard to PCB' },
  { name: 'Altium 365', icon: '🔵', type: 'Professional', free: false, url: 'https://365.altium.com', best: 'Industry standard' },
  { name: 'Fusion 360', icon: '🟠', type: 'CAD + PCB', free: true, url: 'https://www.autodesk.com/products/fusion-360', best: 'Good for mechanical integration' },
]

function ChecklistSection({ title, icon, checks, color }) {
  const [taskStates, setTaskStates] = useState({})

  function toggleTask(id) {
    setTaskStates(function(prev) {
      const next = Object.assign({}, prev)
      next[id] = !prev[id]
      return next
    })
  }

  const doneCount = Object.values(taskStates).filter(Boolean).length
  const totalCount = checks.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2e2e4e]">
        <span className="text-lg">{icon}</span>
        <p className="text-white font-semibold text-sm flex-1">{title}</p>
        <span className="text-xs text-slate-500">{doneCount}/{totalCount}</span>
        <div className="w-16 bg-[#1e1e2e] rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: progress + '%', backgroundColor: color }}
          />
        </div>
      </div>
      <div className="p-3 space-y-1">
        {checks.map(function(check) {
          const isDone = taskStates[check.id] || false
          return (
            <div
              key={check.id}
              className={'flex items-start gap-2 rounded-lg px-3 py-2 cursor-pointer transition ' + (
                isDone ? 'bg-green-950 border border-green-900' : 'bg-[#0d0d1a] border border-[#2e2e4e] hover:border-indigo-600'
              )}
              onClick={function() { toggleTask(check.id) }}
            >
              <div className={'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ' + (
                isDone ? 'bg-green-600 border-green-500' : 'border-slate-600'
              )}>
                {isDone && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={'text-xs ' + (isDone ? 'line-through text-slate-500' : 'text-white')}>
                  {check.task}
                </p>
                {check.notes && (
                  <p className="text-slate-600 text-xs mt-0.5">{check.notes}</p>
                )}
              </div>
              {check.critical && !isDone && (
                <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded shrink-0">
                  Critical
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PCBHelper({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('checklist')

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await generatePCBChecklist(idea, components)
      setResult(data)
      notify.success('PCB checklist generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'checklist', label: '✅ Checklist' },
    { id: 'footprints', label: '📦 Footprints' },
    { id: 'ordering', label: '🛒 Order' },
    { id: 'tools', label: '🔧 Tools' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          Complete PCB design checklist and ordering guide for your prototype
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '📐 Generating...' : '📐 Generate PCB Guide'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Generating PCB design guide...</p>
        </div>
      )}

      {/* PCB Services — always visible */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">PCB Ordering Services</p>
        <div className="grid grid-cols-2 gap-3">
          {ORDERING_SERVICES.map(function(service) {
            return (
              <div
                key={service.name}
                className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 cursor-pointer hover:border-indigo-700 transition"
                onClick={function() { window.open(service.url, '_blank') }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{service.icon}</span>
                  <p className="text-white font-semibold text-sm">{service.name}</p>
                </div>
                <p style={{ color: service.color }} className="text-xs font-bold">{service.price}</p>
                <p className="text-slate-500 text-xs">{service.turnaround}</p>
                <p className="text-slate-600 text-xs mt-1">{service.notes}</p>
              </div>
            )
          })}
        </div>
      </div>

      {result && !loading && (
        <>
          {/* PCB Summary */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
            <h3 className="text-white font-bold text-base mb-3">{result.pcbName}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Layers', value: (result.estimatedLayers || 2) + ' Layer', icon: '📐' },
                { label: 'Board Size', value: result.estimatedSize || '50x50mm', icon: '📏' },
                { label: 'Est. Cost', value: result.estimatedCost || '$5-15', icon: '💰' },
                { label: 'Turnaround', value: result.estimatedTurnAround || '2-3 weeks', icon: '⏱️' },
              ].map(function(stat) {
                return (
                  <div key={stat.label} className="bg-[#0d0d1a] rounded-xl p-3 text-center">
                    <p className="text-lg mb-0.5">{stat.icon}</p>
                    <p className="text-white font-bold text-xs">{stat.value}</p>
                    <p className="text-slate-600 text-xs">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Design rules */}
            {result.designRules && (
              <div className="mt-4 bg-indigo-950 border border-indigo-900 rounded-xl p-3">
                <p className="text-indigo-400 text-xs font-semibold mb-2">📏 Design Rules</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { label: 'Min Trace', value: result.designRules.minTraceWidth },
                    { label: 'Min Clearance', value: result.designRules.minClearance },
                    { label: 'Min Via', value: result.designRules.minViaSize },
                    { label: 'Copper Weight', value: result.designRules.copperWeight },
                  ].map(function(rule) {
                    return (
                      <div key={rule.label} className="bg-[#0d0d1a] rounded-lg p-2 text-center">
                        <p className="text-white font-mono">{rule.value || 'N/A'}</p>
                        <p className="text-slate-600">{rule.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

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

          {/* Checklist tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              {result.schematicChecks && result.schematicChecks.length > 0 && (
                <ChecklistSection
                  title="Schematic Checks"
                  icon="📋"
                  checks={result.schematicChecks}
                  color="#6366f1"
                />
              )}
              {result.layoutChecks && result.layoutChecks.length > 0 && (
                <ChecklistSection
                  title="Layout Checks"
                  icon="📐"
                  checks={result.layoutChecks}
                  color="#0ea5e9"
                />
              )}
              {result.routingChecks && result.routingChecks.length > 0 && (
                <ChecklistSection
                  title="Routing Checks"
                  icon="🔌"
                  checks={result.routingChecks}
                  color="#22c55e"
                />
              )}

              {result.commonMistakes && result.commonMistakes.length > 0 && (
                <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
                  <p className="text-orange-400 text-xs font-semibold mb-2">❌ Common PCB Mistakes</p>
                  <ul className="space-y-1">
                    {result.commonMistakes.map(function(mistake, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-orange-400 shrink-0">×</span>
                          <p className="text-orange-200">{mistake}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footprints tab */}
          {activeTab === 'footprints' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2e2e4e] bg-[#0d0d1a]">
                    <th className="text-left px-4 py-2 text-slate-500">Component</th>
                    <th className="text-left px-4 py-2 text-slate-500">Footprint</th>
                    <th className="text-left px-4 py-2 text-slate-500">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.componentFootprints || []).map(function(fp, i) {
                    return (
                      <tr key={i} className={'border-b border-[#1e1e2e] last:border-0 ' + (i % 2 === 0 ? 'bg-[#13131f]' : 'bg-[#0d0d1a]')}>
                        <td className="px-4 py-2.5 text-white font-medium">{fp.component}</td>
                        <td className="px-4 py-2.5 text-indigo-400 font-mono">{fp.footprint}</td>
                        <td className="px-4 py-2.5 text-slate-500">{fp.notes || ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Ordering tab */}
          {activeTab === 'ordering' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs mb-2">Step-by-step guide to ordering your PCB</p>
              {(result.orderingSteps || []).map(function(step, i) {
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                    <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                      {step.step || i + 1}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm mb-0.5">{step.title}</p>
                      <p className="text-slate-400 text-xs">{step.description}</p>
                      {step.tool && (
                        <p className="text-indigo-400 text-xs mt-1">Tool: {step.tool}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tools tab — always show free tools */}
          {activeTab === 'tools' && (
            <div className="space-y-2">
              {FREE_TOOLS.map(function(tool) {
                return (
                  <div
                    key={tool.name}
                    className="flex items-center gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 cursor-pointer hover:border-indigo-700 transition"
                    onClick={function() { window.open(tool.url, '_blank') }}
                  >
                    <span className="text-2xl shrink-0">{tool.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{tool.name}</p>
                        <span className={'text-xs px-1.5 py-0.5 rounded ' + (
                          tool.free ? 'bg-green-950 text-green-400' : 'bg-[#1e1e2e] text-slate-400'
                        )}>
                          {tool.free ? 'Free' : 'Paid'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">{tool.type}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{tool.best}</p>
                    </div>
                    <span className="text-slate-600 text-xs shrink-0">↗️</span>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Guide
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📐</div>
          <p className="text-white font-semibold mb-1">PCB Design Helper</p>
          <p className="text-slate-500 text-sm mb-4">
            Get a complete checklist and ordering guide for your PCB
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Design checklist</span>
            <span>✓ Component footprints</span>
            <span>✓ Ordering guide</span>
            <span>✓ Free tools</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PCBHelper