import { useState } from 'react'
import { generateArduinoCode } from '../services/codeGenerator'
import { getPinAssignments } from '../services/pinAssignment'
import { notify } from '../services/toast'

function CodeGenerator({ idea, components }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('code')

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    try {
      const pinAssignments = getPinAssignments(idea)
      const data = await generateArduinoCode(idea, components, pinAssignments)
      setResult(data)
      notify.success('Code generated! Ready to upload to your ' + data.platform)
    } catch {
      notify.error('Code generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result?.code) return
    navigator.clipboard.writeText(result.code)
    setCopied(true)
    notify.success('Code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!result?.code) return
    const blob = new Blob([result.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.filename || 'ProtoMind_Sketch.ino'
    link.click()
    URL.revokeObjectURL(url)
    notify.success('Code file downloaded — open in Arduino IDE!')
  }

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm">
            AI generates complete, working Arduino/ESP32 code for your prototype
          </p>
          <p className="text-slate-600 text-xs mt-1">
            💡 Set up pin assignments first for more accurate code
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '⚙️ Generating...' : '⚙️ Generate Code'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is writing your code...</p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Header info */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-indigo-950 border border-indigo-800 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              <div>
                <p className="text-white text-xs font-semibold">{result.filename}</p>
                <p className="text-indigo-400 text-xs">{result.platform}</p>
              </div>
            </div>

            {result.libraries?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {result.libraries.map(lib => (
                  <span key={lib} className="text-xs bg-[#13131f] border border-[#2e2e4e] text-slate-400 px-2 py-1 rounded-lg font-mono">
                    #{lib.replace('.h', '')}
                  </span>
                ))}
              </div>
            )}

            <div className="ml-auto flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
              >
                ⬇️ Download .ino
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {[
              { id: 'code', label: '💻 Code' },
              { id: 'explanation', label: '📖 Explanation' },
              { id: 'upload', label: '🚀 How to Upload' },
            ].map(tab => (
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

          {/* Code tab */}
          {activeTab === 'code' && (
            <div className="relative">
              <div className="bg-[#0a0a12] border border-[#1e1e2e] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[#13131f] border-b border-[#1e1e2e]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-500 text-xs ml-2 font-mono">{result.filename}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-slate-500 hover:text-white transition"
                  >
                    {copied ? '✅' : '📋 Copy'}
                  </button>
                </div>
                <pre className="p-4 text-xs text-slate-300 overflow-x-auto max-h-96 font-mono leading-relaxed">
                  <code>{result.code}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Explanation tab */}
          {activeTab === 'explanation' && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-5">
              <h4 className="text-white font-semibold mb-3">What this code does</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>

              {result.libraries?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-semibold mb-2 text-sm">Libraries needed</h4>
                  <div className="space-y-1">
                    {result.libraries.map(lib => (
                      <div key={lib} className="flex items-center gap-2 text-xs">
                        <span className="text-indigo-400 font-mono">#include &lt;{lib}&gt;</span>
                        <span className="text-slate-600">— Install via Arduino Library Manager</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload instructions tab */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-4">
                <h4 className="text-indigo-300 font-semibold text-sm mb-3">
                  🚀 How to upload to your {result.platform}
                </h4>
                <ol className="space-y-2">
                  {result.uploadInstructions?.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-indigo-400 font-bold shrink-0 w-5">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <h4 className="text-slate-400 font-semibold text-sm mb-2">Quick Steps</h4>
                <ol className="space-y-1 text-xs text-slate-500">
                  <li>1. Download Arduino IDE from arduino.cc</li>
                  <li>2. Click ⬇️ Download .ino above to get your code file</li>
                  <li>3. Open Arduino IDE → File → Open → select the .ino file</li>
                  <li>4. Install any missing libraries from Tools → Library Manager</li>
                  <li>5. Select your board from Tools → Board</li>
                  <li>6. Connect your {result.platform} via USB</li>
                  <li>7. Click the Upload button (→)</li>
                  <li>8. Open Serial Monitor to see output</li>
                </ol>
              </div>
            </div>
          )}

          {/* Regenerate button */}
          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate Code
          </button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">💻</div>
          <p className="text-white font-semibold mb-1">Arduino Code Generator</p>
          <p className="text-slate-500 text-sm mb-4">AI writes complete working code for your prototype</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600">
            <span>✓ Includes & libraries</span>
            <span>✓ Pin definitions</span>
            <span>✓ setup() & loop()</span>
            <span>✓ Comments</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeGenerator