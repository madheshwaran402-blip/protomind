import { useState, useEffect } from 'react'

function ElectronSetup() {
  const [step, setStep] = useState('checking') // checking | needed | installing | done | error
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Checking your system...')
  const [details, setDetails] = useState({ ollamaInstalled: false, modelDownloaded: false })
  const isElectron = typeof window !== 'undefined' && window.electronAPI

  useEffect(function() {
    if (!isElectron) return
    async function check() {
      const result = await window.electronAPI.checkSetup()
      setDetails(result)
      if (result.ollamaInstalled && result.modelDownloaded) {
        setStep('done')
        setMessage('Everything is ready!')
        setTimeout(function() { window.electronAPI.setupComplete() }, 1500)
      } else {
        setStep('needed')
      }
    }
    check()
  }, [])

  useEffect(function() {
    if (!isElectron) return
    const unsub = window.electronAPI.onSetupProgress(function(data) {
      setMessage(data.message)
      if (data.progress !== undefined) setProgress(data.progress)
      if (data.step === 'complete') {
        setStep('done')
        setTimeout(function() { window.electronAPI.setupComplete() }, 2000)
      }
      if (data.step === 'error') setStep('error')
    })
    return unsub
  }, [])

  async function startSetup() {
    setStep('installing')
    setMessage('Starting setup...')
    await window.electronAPI.runSetup()
  }

  const STEPS_INFO = [
    { label: 'Install Ollama AI Engine', done: details.ollamaInstalled, desc: '~50MB download' },
    { label: 'Download llama3.2 Model', done: details.modelDownloaded, desc: '~2GB download' },
    { label: 'Start AI Server', done: false, desc: 'Runs in background' },
  ]

  if (!isElectron) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-4xl mb-4">🌐</p>
          <p className="text-xl font-bold">Running in browser mode</p>
          <p className="text-slate-400">Setup page is for desktop app only</p>
          <a href="/" className="mt-4 inline-block px-6 py-3 bg-indigo-600 rounded-xl">Go to ProtoMind →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-900/50">
            P
          </div>
          <h1 className="text-3xl font-black">ProtoMind</h1>
          <p className="text-slate-400 text-sm mt-1">AI-Powered Hardware Engineering</p>
        </div>

        {/* Status card */}
        <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl p-6 mb-4">
          {step === 'checking' && (
            <div className="text-center py-4">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
              <p className="text-white font-medium">Checking your system...</p>
            </div>
          )}

          {step === 'needed' && (
            <>
              <h2 className="text-white font-black text-xl mb-4">One-time Setup Required</h2>
              <div className="space-y-3 mb-6">
                {STEPS_INFO.map(function(s, i) {
                  return (
                    <div key={i} className={"flex items-center gap-3 p-3 rounded-xl " + (s.done ? 'bg-green-950 border border-green-800' : 'bg-[#13131f] border border-[#1e1e2e]')}>
                      <div className={"w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold " + (s.done ? 'bg-green-600 text-white' : 'bg-[#1e1e2e] text-slate-400')}>
                        {s.done ? '✓' : i + 1}
                      </div>
                      <div className="flex-1">
                        <p className={"text-sm font-medium " + (s.done ? 'text-green-400 line-through' : 'text-white')}>{s.label}</p>
                        <p className="text-slate-600 text-xs">{s.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-slate-500 text-xs mb-4">
                This is a one-time setup. After this, ProtoMind starts instantly with no manual steps.
              </p>
              <button onClick={startSetup}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-lg transition">
                🚀 Set Up ProtoMind
              </button>
            </>
          )}

          {step === 'installing' && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0"/>
                <p className="text-white font-medium">{message}</p>
              </div>
              {progress > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-[#1e1e2e] rounded-full h-2">
                    <div className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                      style={{width: progress + '%'}}/>
                  </div>
                </div>
              )}
              <p className="text-slate-600 text-xs mt-4 text-center">
                Do not close this window during setup
              </p>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-white font-black text-xl mb-1">ProtoMind is Ready!</p>
              <p className="text-slate-400 text-sm">Opening your workspace...</p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-white font-bold mb-1">Setup Failed</p>
              <p className="text-red-400 text-sm mb-4">{message}</p>
              <button onClick={function(){setStep('needed')}}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition">
                Try Again
              </button>
            </div>
          )}
        </div>

        <p className="text-slate-700 text-xs text-center">
          ProtoMind is free and open source • AI runs locally on your device
        </p>
      </div>
    </div>
  )
}

export default ElectronSetup
