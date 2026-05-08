import { useState } from 'react'
import { generateSpecSheet, exportSpecSheetMarkdown } from '../services/specSheetService'
import { notify } from '../services/toast'

function SpecTable({ title, rows }) {
  if (!rows || rows.length === 0) return null
  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</h4>
      <div className="bg-[#0d0d1a] rounded-xl overflow-hidden border border-[#2e2e4e]">
        <table className="w-full text-xs">
          <tbody>
            {rows.map(([label, value], i) => (
              <tr key={i} className={`border-b border-[#1e1e2e] last:border-0 ${i % 2 === 0 ? 'bg-[#0d0d1a]' : 'bg-[#13131f]'}`}>
                <td className="px-4 py-2.5 text-slate-400 w-2/5 font-medium">{label}</td>
                <td className="px-4 py-2.5 text-white">{value || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SpecSheetGenerator({ idea, components }) {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('electrical')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setSpec(null)
    try {
      const data = await generateSpecSheet(idea, components)
      setSpec(data)
      notify.success('Spec sheet generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!spec) return
    const md = exportSpecSheetMarkdown(spec, idea, components)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = (spec.productName || 'SpecSheet').replace(/[^a-zA-Z0-9]/g, '_') + '.md'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Spec sheet downloaded!')
  }

  function handleCopy() {
    if (!spec) return
    const md = exportSpecSheetMarkdown(spec, idea, components)
    navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    notify.success('Spec sheet copied!')
  }

  const TABS = [
    { id: 'electrical', label: '⚡ Electrical' },
    { id: 'mechanical', label: '📐 Mechanical' },
    { id: 'performance', label: '🚀 Performance' },
    { id: 'interfaces', label: '🔌 Interfaces' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          AI generates a professional technical specification document
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '📋 Writing...' : '📋 Generate Spec Sheet'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is writing your technical spec sheet...</p>
        </div>
      )}

      {spec && !loading && (
        <>
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white font-black text-base">{spec.productName}</h3>
                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                  <span>v{spec.version}</span>
                  <span>·</span>
                  <span>{spec.date}</span>
                  <span>·</span>
                  <span>{spec.classification}</span>
                </div>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{spec.overview}</p>
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
          </div>

          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'electrical' && spec.electrical && (
            <div className="space-y-3">
              <SpecTable
                title="Power"
                rows={[
                  ['Supply Voltage', spec.electrical.supplyVoltage],
                  ['Input Range', spec.electrical.inputVoltageRange],
                  ['Logic Level', spec.electrical.logicLevel],
                  ['Max Pin Current', spec.electrical.maxPinCurrent],
                ]}
              />
              <SpecTable
                title="Current Consumption"
                rows={[
                  ['Idle', spec.electrical.currentConsumption?.idle],
                  ['Active', spec.electrical.currentConsumption?.active],
                  ['Peak', spec.electrical.currentConsumption?.peak],
                ]}
              />
            </div>
          )}

          {activeTab === 'mechanical' && spec.mechanical && (
            <div className="space-y-3">
              <SpecTable
                title="Physical"
                rows={[
                  ['Dimensions', spec.mechanical.dimensions],
                  ['Weight', spec.mechanical.weight],
                  ['PCB Layers', spec.mechanical.pcbLayers],
                  ['Mounting Holes', spec.mechanical.mountingHoles],
                  ['Enclosure', spec.mechanical.enclosureType],
                ]}
              />
              {spec.environmental && (
                <SpecTable
                  title="Environmental"
                  rows={[
                    ['Operating Temp', spec.environmental.operatingTemp],
                    ['Storage Temp', spec.environmental.storageTemp],
                    ['Humidity', spec.environmental.humidity],
                    ['IP Rating', spec.environmental.ipRating],
                  ]}
                />
              )}
            </div>
          )}

          {activeTab === 'performance' && spec.performance && (
            <div className="space-y-3">
              <SpecTable
                title="Processing"
                rows={[
                  ['Speed', spec.performance.processingSpeed],
                  ['ADC Resolution', spec.performance.adcResolution],
                  ['PWM Channels', spec.performance.pwmChannels],
                  ['Analog Inputs', spec.performance.analogInputs],
                  ['Digital I/O', spec.performance.digitalIO],
                ]}
              />
              {spec.compliance?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Compliance</h4>
                  <div className="flex flex-wrap gap-2">
                    {spec.compliance.map((c, i) => (
                      <span key={i} className="text-xs bg-green-950 text-green-400 border border-green-800 px-3 py-1 rounded-full">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {spec.limitations?.length > 0 && (
                <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">⚠️ Known Limitations</h4>
                  <ul className="space-y-1">
                    {spec.limitations.map((l, i) => (
                      <li key={i} className="text-orange-200 text-xs flex items-start gap-2">
                        <span className="shrink-0">•</span> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'interfaces' && (
            <div className="space-y-3">
              {spec.interfaces?.map((iface, i) => (
                <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-indigo-400 font-bold text-sm">{iface.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#0d0d1a] rounded-lg p-2">
                      <p className="text-slate-500 mb-1">Pins</p>
                      <p className="text-white font-mono">{iface.pins}</p>
                    </div>
                    <div className="bg-[#0d0d1a] rounded-lg p-2">
                      <p className="text-slate-500 mb-1">Speed</p>
                      <p className="text-white">{iface.speed}</p>
                    </div>
                    <div className="bg-[#0d0d1a] rounded-lg p-2">
                      <p className="text-slate-500 mb-1">Devices</p>
                      <p className="text-white">{iface.devices}</p>
                    </div>
                  </div>
                </div>
              ))}
              {spec.revision?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                  <div className="px-4 py-2 border-b border-[#2e2e4e]">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Revision History</p>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#1e1e2e]">
                        <th className="text-left px-4 py-2 text-slate-500">Version</th>
                        <th className="text-left px-4 py-2 text-slate-500">Date</th>
                        <th className="text-left px-4 py-2 text-slate-500">Changes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spec.revision.map((rev, i) => (
                        <tr key={i} className="border-b border-[#1e1e2e] last:border-0">
                          <td className="px-4 py-2 text-indigo-400 font-mono">{rev.version}</td>
                          <td className="px-4 py-2 text-slate-400">{rev.date}</td>
                          <td className="px-4 py-2 text-slate-300">{rev.changes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Spec Sheet
          </button>
        </>
      )}

      {!spec && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-white font-semibold mb-1">Technical Spec Sheet Generator</p>
          <p className="text-slate-500 text-sm mb-4">
            Professional engineering spec document for university or client submissions
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Electrical specs</span>
            <span>✓ Mechanical dims</span>
            <span>✓ Interfaces</span>
            <span>✓ Export as .md</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpecSheetGenerator