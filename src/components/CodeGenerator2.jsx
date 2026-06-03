import { useState } from 'react'
import { generateCodeForLanguage, getLanguageConfigs } from '../services/codeGeneratorService'
import { notify } from '../services/toast'

const LANGUAGE_CONFIGS = getLanguageConfigs()

function PinDefinitionsTable({ pins }) {
  if (!pins || pins.length === 0) return null

  return (
    <div className="bg-[#0d0d1a] rounded-xl overflow-hidden border border-[#2e2e4e]">
      <div className="px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pin Definitions</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1e1e2e]">
            <th className="text-left px-4 py-2 text-slate-500">Name</th>
            <th className="text-left px-4 py-2 text-slate-500">Pin</th>
            <th className="text-left px-4 py-2 text-slate-500">Type</th>
            <th className="text-left px-4 py-2 text-slate-500">Component</th>
          </tr>
        </thead>
        <tbody>
          {pins.map(function(pin, i) {
            return (
              <tr key={i} className={'border-b border-[#1e1e2e] last:border-0 ' + (i % 2 === 0 ? 'bg-[#0d0d1a]' : 'bg-[#13131f]')}>
                <td className="px-4 py-2 text-indigo-400 font-mono">{pin.name}</td>
                <td className="px-4 py-2 text-white font-mono font-bold">{pin.pin}</td>
                <td className="px-4 py-2">
                  <span className={'text-xs px-1.5 py-0.5 rounded ' + (
                    pin.type === 'OUTPUT' ? 'bg-green-950 text-green-400' :
                    pin.type === 'INPUT' ? 'bg-blue-950 text-blue-400' :
                    pin.type === 'ANALOG' ? 'bg-purple-950 text-purple-400' :
                    'bg-[#1e1e2e] text-slate-400'
                  )}>
                    {pin.type}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-400">{pin.component}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CodeBlock({ code, language, onCopy }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    onCopy && onCopy()
  }

  return (
    <div className="bg-[#0a0a0f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e]">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-slate-500 text-xs ml-2 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="ml-auto text-xs text-slate-500 hover:text-white transition"
        >
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>
      </div>
      <pre className="p-4 text-xs text-green-400 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap max-h-80">
        {code}
      </pre>
    </div>
  )
}

function CodeGenerator2({ idea, components }) {
  const [selectedLanguage, setSelectedLanguage] = useState('arduino')
  const [generatedCode, setGeneratedCode] = useState({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('code')
  const [activeSection, setActiveSection] = useState(0)

  const currentCode = generatedCode[selectedLanguage]
  const config = LANGUAGE_CONFIGS[selectedLanguage]

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    if (generatedCode[selectedLanguage]) {
      notify.info('Code already generated for ' + config.name)
      return
    }
    setLoading(true)
    try {
      const data = await generateCodeForLanguage(idea, components, selectedLanguage)
      setGeneratedCode(function(prev) {
        const next = Object.assign({}, prev)
        next[selectedLanguage] = data
        return next
      })
      setActiveTab('code')
      setActiveSection(0)
      notify.success(config.name + ' code generated!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!currentCode) return
    const blob = new Blob([currentCode.fullCode || ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = (currentCode.title || 'code').replace(/[^a-zA-Z0-9]/g, '_') + config.fileExt
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Code downloaded!')
  }

  function handleRegenerate() {
    setGeneratedCode(function(prev) {
      const next = Object.assign({}, prev)
      delete next[selectedLanguage]
      return next
    })
    handleGenerate()
  }

  const TABS = [
    { id: 'code', label: '💻 Full Code' },
    { id: 'sections', label: '📋 Sections' },
    { id: 'pins', label: '📌 Pins' },
    { id: 'upload', label: '⬆️ Upload' },
  ]

  return (
    <div className="space-y-4">

      {/* Language selector */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Select Language</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Object.entries(LANGUAGE_CONFIGS).map(function(entry) {
            const lang = entry[0]
            const cfg = entry[1]
            const isGenerated = !!generatedCode[lang]
            return (
              <button
                key={lang}
                onClick={function() { setSelectedLanguage(lang) }}
                className={'p-3 rounded-xl border text-center transition relative ' + (
                  selectedLanguage === lang
                    ? 'border-2 text-white'
                    : 'bg-[#0d0d1a] border-[#1e1e2e] text-slate-400 hover:border-slate-500'
                )}
                style={selectedLanguage === lang ? {
                  backgroundColor: cfg.color + '20',
                  borderColor: cfg.color,
                } : {}}
              >
                {isGenerated && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" />
                )}
                <p className="text-xl mb-1">{cfg.icon}</p>
                <p className="text-xs font-medium leading-tight" style={selectedLanguage === lang ? { color: cfg.color } : {}}>
                  {cfg.name.split(' ')[0]}
                </p>
              </button>
            )
          })}
        </div>
        <p className="text-slate-600 text-xs mt-2">{config.description}</p>
      </div>

      {/* Generate button */}
      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0 || !!generatedCode[selectedLanguage]}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50"
          style={{
            backgroundColor: generatedCode[selectedLanguage] ? '#1e1e2e' : config.color + '33',
            border: '1px solid ' + config.color + '66',
            color: generatedCode[selectedLanguage] ? '#64748b' : config.color,
          }}
        >
          {loading ? '💻 Generating...' :
           generatedCode[selectedLanguage] ? '✅ ' + config.name + ' Generated' :
           '💻 Generate ' + config.name + ' Code'}
        </button>
        {generatedCode[selectedLanguage] && (
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="px-4 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition disabled:opacity-50"
          >
            ↺
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: config.color + '40', borderTopColor: config.color }}
          />
          <p className="text-slate-400 text-sm">Generating {config.name} code...</p>
        </div>
      )}

      {currentCode && !loading && (
        <>
          {/* Header */}
          <div
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: config.color + '10', borderColor: config.color + '30' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{config.icon}</span>
                  <p className="text-white font-bold text-sm">{currentCode.title}</p>
                </div>
                <p className="text-slate-400 text-xs">{currentCode.description}</p>
              </div>
              <button
                onClick={handleDownload}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0"
                style={{ backgroundColor: config.color + '20', color: config.color, border: '1px solid ' + config.color + '40' }}
              >
                ⬇️ {config.fileExt}
              </button>
            </div>

            {currentCode.dependencies && currentCode.dependencies.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1">Libraries needed:</p>
                <div className="flex flex-wrap gap-1">
                  {currentCode.dependencies.map(function(dep, i) {
                    return (
                      <span key={i} className="text-xs bg-[#0d0d1a] text-slate-300 border border-[#2e2e4e] px-2 py-0.5 rounded-full">
                        📦 {dep}
                      </span>
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
                    activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-white'
                  )}
                  style={activeTab === tab.id ? { backgroundColor: config.color } : {}}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Full code tab */}
          {activeTab === 'code' && (
            <CodeBlock
              code={currentCode.fullCode || '// No code generated'}
              language={config.fileExt}
              onCopy={function() { notify.success('Code copied!') }}
            />
          )}

          {/* Sections tab */}
          {activeTab === 'sections' && (
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {(currentCode.sections || []).map(function(section, i) {
                  return (
                    <button
                      key={i}
                      onClick={function() { setActiveSection(i) }}
                      className={'text-xs px-3 py-1.5 rounded-xl border transition ' + (
                        activeSection === i
                          ? 'text-white'
                          : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e]'
                      )}
                      style={activeSection === i ? { backgroundColor: config.color, borderColor: config.color } : {}}
                    >
                      {section.name}
                    </button>
                  )
                })}
              </div>
              {currentCode.sections && currentCode.sections[activeSection] && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">
                    {currentCode.sections[activeSection].description}
                  </p>
                  <CodeBlock
                    code={currentCode.sections[activeSection].code || '// No code for this section'}
                    language={config.fileExt}
                    onCopy={function() { notify.success('Section copied!') }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Pins tab */}
          {activeTab === 'pins' && (
            <PinDefinitionsTable pins={currentCode.pinDefinitions} />
          )}

          {/* Upload tab */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              {currentCode.uploadInstructions && currentCode.uploadInstructions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Upload Instructions</p>
                  {currentCode.uploadInstructions.map(function(step, i) {
                    return (
                      <div key={i} className="flex items-start gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{ backgroundColor: config.color + '20', color: config.color }}
                        >
                          {i + 1}
                        </div>
                        <p className="text-slate-300 text-sm">{step}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {currentCode.troubleshooting && currentCode.troubleshooting.length > 0 && (
                <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
                  <p className="text-orange-400 text-xs font-semibold mb-2">🔧 Troubleshooting</p>
                  <div className="space-y-2">
                    {currentCode.troubleshooting.map(function(item, i) {
                      return (
                        <div key={i} className="text-xs">
                          <p className="text-orange-200 font-medium">{item.problem}</p>
                          <p className="text-slate-400 mt-0.5">→ {item.fix}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!currentCode && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">{config.icon}</div>
          <p className="text-white font-semibold mb-1">Code Generator 2.0</p>
          <p className="text-slate-500 text-sm mb-4">
            Generate {config.name} code with pin definitions, setup, and main loop
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Full working code</span>
            <span>✓ Pin definitions</span>
            <span>✓ Upload guide</span>
            <span>✓ 5 languages</span>
          </div>
        </div>
      )}

      {/* Language overview */}
      {!currentCode && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(LANGUAGE_CONFIGS).map(function(entry) {
            const lang = entry[0]
            const cfg = entry[1]
            return (
              <div
                key={lang}
                className="flex items-center gap-3 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-3 cursor-pointer hover:border-slate-500 transition"
                onClick={function() { setSelectedLanguage(lang) }}
              >
                <span className="text-2xl">{cfg.icon}</span>
                <div>
                  <p className="text-white text-xs font-medium">{cfg.name}</p>
                  <p className="text-slate-600 text-xs">{cfg.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CodeGenerator2