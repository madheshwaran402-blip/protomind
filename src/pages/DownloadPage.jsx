import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RELEASES = {
  version: '1.0.0',
  windows: {
    label: 'Windows 10 / 11',
    icon: '🪟',
    color: '#0078d4',
    file: 'ProtoMind-Setup-1.0.0.exe',
    size: '~320MB',
    arch: '64-bit',
    note: 'Includes AI engine auto-setup',
    // Replace with real GitHub release URL when built
    url: '#windows',
  },
  mac: {
    label: 'macOS 12+',
    icon: '🍎',
    color: '#555555',
    file: 'ProtoMind-1.0.0.dmg',
    size: '~280MB',
    arch: 'Intel + Apple Silicon',
    note: 'Universal binary (M1/M2/M3 + Intel)',
    url: '#mac',
  },
  linux: {
    label: 'Linux (Ubuntu/Debian)',
    icon: '🐧',
    color: '#f97316',
    file: 'ProtoMind-1.0.0.AppImage',
    size: '~300MB',
    arch: 'x86_64',
    note: 'AppImage — runs on most distros',
    url: '#linux',
  },
}

function DownloadCard({ platform, data, onDownload }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={function() { setHovered(true) }}
      onMouseLeave={function() { setHovered(false) }}
      className="relative rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        borderColor: hovered ? data.color + '60' : '#2e2e4e',
        backgroundColor: hovered ? data.color + '08' : '#0d0d1a',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 20px 40px ' + data.color + '20' : 'none',
      }}>

      {/* Top accent line */}
      <div className="h-0.5 w-full transition-all duration-300"
        style={{ backgroundColor: hovered ? data.color : 'transparent' }}/>

      <div className="p-6">
        {/* Platform icon + name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: data.color + '15' }}>
            {data.icon}
          </div>
          <div>
            <p className="text-white font-black text-lg">{data.label}</p>
            <p className="text-slate-500 text-xs">{data.arch}</p>
          </div>
        </div>

        {/* File info */}
        <div className="bg-[#080814] rounded-xl p-3 mb-4 font-mono">
          <p className="text-xs text-slate-500 mb-0.5">File</p>
          <p className="text-white text-sm truncate">{data.file}</p>
          <p className="text-xs mt-1" style={{ color: data.color }}>{data.size}</p>
        </div>

        {/* Note */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-green-500 text-sm">✓</span>
          <span className="text-slate-400 text-sm">{data.note}</span>
        </div>

        {/* Download button */}
        <button
          onClick={function() { onDownload(platform, data) }}
          className="w-full py-3.5 rounded-xl font-black text-white transition-all duration-200 flex items-center justify-center gap-2 text-base"
          style={{
            backgroundColor: data.color,
            opacity: hovered ? 1 : 0.9,
            boxShadow: hovered ? '0 0 20px ' + data.color + '40' : 'none',
          }}>
          <span>⬇</span>
          <span>Download for {data.label.split(' ')[0]}</span>
        </button>
      </div>
    </div>
  )
}

function CountUp({ end, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(function() {
    const start = Date.now()
    const timer = setInterval(function() {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / 1500, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return function() { clearInterval(timer) }
  }, [end])
  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function DownloadPage() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(null)
  const [activeTab, setActiveTab] = useState('desktop') // desktop | web

  function handleDownload(platform, data) {
    if (data.url === '#windows' || data.url === '#mac' || data.url === '#linux') {
      // Not built yet — show coming soon
      setShowModal(platform)
      return
    }
    window.open(data.url, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 opacity-5 rounded-full blur-3xl animate-pulse"/>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600 opacity-5 rounded-full blur-3xl"/>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(#1e1e2e15 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}/>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-[#1e1e2e] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={function() { navigate('/') }}
            className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white">P</div>
            <span className="font-black text-xl">ProtoMind</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={function() { navigate('/') }}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm transition">
              Open Web App
            </button>
            <button onClick={function() { navigate('/hub') }}
              className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-sm transition">
              All Features
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-5 py-2 text-indigo-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"/>
            Free Forever • No Subscription • AI Runs Locally
          </div>

          <h1 className="text-5xl sm:text-7xl font-black leading-tight mb-6">
            Get{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ProtoMind
            </span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
            Build hardware prototypes with AI. Choose between the instant web app
            or the full desktop experience with automatic AI setup.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { n: 360, s: '+', label: 'AI Tools' },
              { n: 270, s: ' days', label: 'Built over' },
              { n: 0, s: '$', label: 'Cost forever' },
            ].map(function(stat) {
              return (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-black text-white">
                    <CountUp end={stat.n} suffix={stat.s}/>
                  </p>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl p-1.5 flex gap-1">
            <button
              onClick={function() { setActiveTab('desktop') }}
              className={"px-8 py-3 rounded-xl font-bold text-sm transition-all " + (
                activeTab === 'desktop'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              )}>
              💻 Desktop App
            </button>
            <button
              onClick={function() { setActiveTab('web') }}
              className={"px-8 py-3 rounded-xl font-bold text-sm transition-all " + (
                activeTab === 'web'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              )}>
              🌐 Web App
            </button>
          </div>
        </div>

        {/* ── DESKTOP TAB ── */}
        {activeTab === 'desktop' && (
          <div>
            {/* What's included banner */}
            <div className="bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-800 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="text-4xl">📦</div>
                <div className="flex-1">
                  <p className="text-white font-black text-xl mb-2">Desktop App includes everything</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: '🤖', text: 'Ollama AI engine — auto installed' },
                      { icon: '🧠', text: 'llama3.2 model — auto downloaded' },
                      { icon: '⚡', text: 'Starts in 3 seconds, every time' },
                      { icon: '🔒', text: 'Fully offline, data stays local' },
                    ].map(function(f) {
                      return (
                        <div key={f.text} className="flex items-start gap-2">
                          <span className="text-xl shrink-0">{f.icon}</span>
                          <span className="text-slate-300 text-sm">{f.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Download cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {Object.entries(RELEASES).filter(function(e) { return e[0] !== 'version' }).map(function(entry) {
                return (
                  <DownloadCard
                    key={entry[0]}
                    platform={entry[0]}
                    data={entry[1]}
                    onDownload={handleDownload}/>
                )
              })}
            </div>

            {/* How it works */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-8">
              <h2 className="text-white font-black text-2xl text-center mb-8">How Desktop Install Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {[
                  { n: '1', icon: '⬇', title: 'Download', desc: 'Click your platform above. One installer file (~320MB).' },
                  { n: '2', icon: '📂', title: 'Install', desc: 'Run the installer. Installs like any normal app.' },
                  { n: '3', icon: '🤖', title: 'Auto Setup', desc: 'First launch downloads Ollama AI and llama3.2 model automatically.' },
                  { n: '4', icon: '🚀', title: 'Ready', desc: 'ProtoMind opens with AI fully working. Every time.' },
                ].map(function(step) {
                  return (
                    <div key={step.n} className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-2xl mx-auto mb-3">
                        {step.icon}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-black mx-auto mb-2">
                        {step.n}
                      </div>
                      <p className="text-white font-bold mb-1">{step.title}</p>
                      <p className="text-slate-500 text-sm">{step.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* System requirements */}
            <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">System Requirements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {[
                  { label: 'RAM', min: '4GB', rec: '8GB+' },
                  { label: 'Storage', min: '3GB free', rec: '5GB+' },
                  { label: 'CPU', min: 'Dual core', rec: '4+ cores' },
                  { label: 'Browser', min: 'Built-in', rec: 'Chrome engine' },
                ].map(function(req) {
                  return (
                    <div key={req.label} className="bg-[#080814] rounded-xl p-3">
                      <p className="text-indigo-400 text-xs font-semibold mb-1">{req.label}</p>
                      <p className="text-white text-xs">Min: {req.min}</p>
                      <p className="text-slate-500 text-xs">Rec: {req.rec}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── WEB APP TAB ── */}
        {activeTab === 'web' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0d0d1a] border border-indigo-900 rounded-2xl p-8 text-center mb-6">
              <div className="text-6xl mb-4">🌐</div>
              <h2 className="text-white font-black text-3xl mb-3">Use ProtoMind in Your Browser</h2>
              <p className="text-slate-400 mb-6">No download needed. Open the web app instantly in Chrome or Edge. Works on any device.</p>

              
                href="https://protomind-ten.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-xl transition mb-4">
                <span>🚀</span>
                <span>Open ProtoMind Web App</span>
              </a>

              <p className="text-indigo-400 text-sm mb-8">protomind-ten.vercel.app</p>

              <div className="text-left space-y-3 mb-8">
                <p className="text-white font-bold mb-3">Web app requirements:</p>
                {[
                  { icon: '✓', text: 'Chrome 89+ or Edge 89+ browser (required for Web Serial API)', color: 'text-green-400' },
                  { icon: '✓', text: 'Ollama installed and running: ollama serve', color: 'text-green-400' },
                  { icon: '✓', text: 'llama3.2 model downloaded: ollama pull llama3.2', color: 'text-green-400' },
                  { icon: '→', text: 'No installation needed beyond Ollama', color: 'text-indigo-400' },
                ].map(function(item, i) {
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className={"font-bold " + item.color}>{item.icon}</span>
                      <span className="text-slate-300 text-sm">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Manual Ollama setup steps */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Manual Ollama Setup (one time)</h3>
              <div className="space-y-3">
                {[
                  { step: '1', label: 'Install Ollama', cmd: null, link: 'https://ollama.ai', linkText: 'Download from ollama.ai →' },
                  { step: '2', label: 'Download AI model', cmd: 'ollama pull llama3.2' },
                  { step: '3', label: 'Start AI server', cmd: 'ollama serve' },
                  { step: '4', label: 'Open ProtoMind', cmd: null, link: 'https://protomind-ten.vercel.app', linkText: 'protomind-ten.vercel.app →' },
                ].map(function(item) {
                  return (
                    <div key={item.step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.label}</p>
                        {item.cmd && (
                          <code className="block bg-[#050510] border border-[#2e2e4e] rounded-lg px-3 py-1.5 text-green-400 text-xs mt-1 font-mono">
                            {item.cmd}
                          </code>
                        )}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noreferrer"
                            className="text-indigo-400 hover:underline text-xs mt-1 inline-block">
                            {item.linkText}
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div className="mt-12 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#1e1e2e]">
            <h2 className="text-white font-black text-xl">Desktop App vs Web App</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e2e]">
                  <th className="text-left text-slate-500 font-medium px-6 py-3 w-1/2">Feature</th>
                  <th className="text-center text-indigo-400 font-bold px-4 py-3">💻 Desktop</th>
                  <th className="text-center text-slate-400 font-medium px-4 py-3">🌐 Web</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Ollama auto-install', '✅ Yes', '❌ Manual'],
                  ['AI auto-start', '✅ Yes', '❌ Run ollama serve'],
                  ['Works offline', '✅ Fully', '⚠️ First load needs internet'],
                  ['No terminal needed', '✅ Ever', '❌ Setup needs terminal'],
                  ['Download required', '⚠️ ~320MB', '✅ None'],
                  ['All 360+ AI features', '✅ Yes', '✅ Yes'],
                  ['ProtoSim simulator', '✅ Yes', '✅ Yes'],
                  ['ProtoIDE + Web Serial', '✅ Yes', '✅ Chrome/Edge only'],
                  ['ProtoTwin', '✅ Yes', '✅ Chrome/Edge only'],
                  ['Any laptop/OS', '✅ Win/Mac/Linux', '✅ Any browser'],
                  ['Cost', '✅ Free', '✅ Free'],
                ].map(function(row, i) {
                  return (
                    <tr key={i} className={"border-b border-[#1e1e2e] " + (i % 2 === 0 ? '' : 'bg-[#080814]')}>
                      <td className="px-6 py-3 text-slate-300">{row[0]}</td>
                      <td className="px-4 py-3 text-center font-medium" style={{color: row[1].startsWith('✅') ? '#22c55e' : row[1].startsWith('⚠️') ? '#f59e0b' : '#ef4444'}}>{row[1]}</td>
                      <td className="px-4 py-3 text-center font-medium" style={{color: row[2].startsWith('✅') ? '#22c55e' : row[2].startsWith('⚠️') ? '#f59e0b' : '#ef4444'}}>{row[2]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm mb-4">
            ProtoMind is free and open source •{' '}
            <a href="https://github.com/madheshwaran402-blip/protomind" target="_blank" rel="noreferrer"
              className="text-indigo-400 hover:underline">View on GitHub</a>
          </p>
          <p className="text-slate-700 text-xs">
            AI runs locally on your device. No data is sent to any server. No subscription required.
          </p>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-70" onClick={function(){setShowModal(null)}}/>
          <div className="relative bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">🚧</div>
            <h3 className="text-white font-black text-2xl mb-2">Desktop App Coming Soon</h3>
            <p className="text-slate-400 mb-6">
              The desktop installer is being built. Use the web app in the meantime — it has all the same features.
            </p>
            <div className="flex gap-3">
              <button onClick={function(){setShowModal(null)}}
                className="flex-1 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl font-medium transition">
                Close
              </button>
              <a href="https://protomind-ten.vercel.app" target="_blank" rel="noreferrer"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition text-center">
                Open Web App →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
