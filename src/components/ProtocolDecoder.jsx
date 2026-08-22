import { useState } from 'react'
import { decodeProtocol, PROTOCOLS, saveProtocolData, getProtocolData } from '../services/protocolDecoderService'
import { notify } from '../services/toast'

function ProtocolDecoder({ idea, components }) {
  const [selectedProtocol, setSelectedProtocol] = useState('I2C')
  const [result, setResult] = useState(getProtocolData(idea, 'I2C'))
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  function handleSelectProtocol(proto) {
    setSelectedProtocol(proto)
    setResult(getProtocolData(idea, proto))
    setActiveTab('overview')
  }

  async function handleDecode() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await decodeProtocol(idea, components, selectedProtocol)
      setResult(data)
      saveProtocolData(idea, selectedProtocol, data)
      notify.success(selectedProtocol + ' protocol decoded!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  function handleCopy() {
    if (!result?.codeExample) return
    navigator.clipboard.writeText(result.codeExample)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Code copied!')
  }

  const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'pinout', label: 'Pinout' }, { id: 'timing', label: 'Timing' }, { id: 'code', label: 'Code' }]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {PROTOCOLS.map(function(proto) {
          const isSel = selectedProtocol === proto.value
          const hasCache = !!getProtocolData(idea, proto.value)
          return (
            <button key={proto.value} onClick={function() { handleSelectProtocol(proto.value) }}
              className={'p-3 rounded-xl border text-left transition relative ' + (isSel ? 'bg-indigo-950 border-indigo-700' : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-700')}>
              <p className="text-lg">{proto.icon}</p>
              <p className={'text-xs font-bold ' + (isSel ? 'text-white' : 'text-slate-400')}>{proto.value}</p>
              <p className="text-slate-600 text-xs">{proto.desc}</p>
              {hasCache && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          )
        })}
      </div>

      <button onClick={handleDecode} disabled={loading || components.length === 0}
        className="w-full py-3 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
        {loading ? 'Decoding...' : 'Decode ' + selectedProtocol + ' Protocol'}
      </button>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Decoding {selectedProtocol}...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
            {TABS.map(function(tab) {
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id) }}
                  className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (activeTab === tab.id ? 'bg-indigo-700 text-white' : 'text-slate-500 hover:text-white')}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
                <p className="text-indigo-400 text-xs font-semibold mb-2">{result.protocol}</p>
                <p className="text-white text-sm leading-relaxed">{result.overview}</p>
              </div>
              {result.commonIssues && result.commonIssues.length > 0 && (
                <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-semibold mb-2">Common Issues</p>
                  <ul className="space-y-1">
                    {result.commonIssues.map(function(issue, i) {
                      return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-red-400">-</span>{issue}</li>
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pinout' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#0d0d1a] border-b border-[#2e2e4e]">
                    <th className="text-left px-3 py-2 text-slate-500">Pin</th>
                    <th className="text-left px-3 py-2 text-slate-500">Name</th>
                    <th className="text-left px-3 py-2 text-slate-500">Dir</th>
                    <th className="text-left px-3 py-2 text-slate-500">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.pinout || []).map(function(pin, i) {
                    return (
                      <tr key={i} className={'border-b border-[#1e1e2e] last:border-0 ' + (i % 2 === 0 ? 'bg-[#13131f]' : 'bg-[#0d0d1a]')}>
                        <td className="px-3 py-2 text-indigo-400 font-mono font-bold">{pin.pin}</td>
                        <td className="px-3 py-2 text-white font-mono">{pin.name}</td>
                        <td className="px-3 py-2">
                          <span className={'text-xs px-1 py-0.5 rounded ' + (pin.direction === 'Output' ? 'text-green-400 bg-green-950' : pin.direction === 'Input' ? 'text-blue-400 bg-blue-950' : 'text-yellow-400 bg-yellow-950')}>
                            {pin.direction}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-400">{pin.description}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'timing' && result.timingDiagram && (
            <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Timing Diagram</p>
              <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                {result.timingDiagram}
              </pre>
            </div>
          )}

          {activeTab === 'code' && result.codeExample && (
            <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
                <span className="text-slate-500 text-xs">{selectedProtocol.toLowerCase()}_example.ino</span>
                <button onClick={handleCopy} className="ml-auto text-xs text-slate-500 hover:text-white">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="px-4 py-3 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64">
                {result.codeExample}
              </pre>
            </div>
          )}

          <button onClick={handleDecode} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔌</div>
          <p className="text-white font-semibold mb-1">Protocol Decoder</p>
          <p className="text-slate-500 text-sm">Decode I2C, SPI, UART and other protocols with pinout and timing diagrams</p>
        </div>
      )}
    </div>
  )
}

export default ProtocolDecoder
