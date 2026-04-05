import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-16 py-5 border-b border-[#1e1e2e]">
        <div className="text-xl font-bold text-indigo-400">⚡ ProtoMind</div>
        <div className="flex gap-8 items-center">
          <span className="text-slate-400 text-sm hover:text-white cursor-pointer transition">Features</span>
          <span className="text-slate-400 text-sm hover:text-white cursor-pointer transition">How it Works</span>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            Launch App →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-10 pt-24 pb-16 relative">
        {/* Glow effect */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-900 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="bg-indigo-950 text-indigo-400 text-xs px-4 py-1.5 rounded-full border border-indigo-800 mb-6">
          🧠 Powered by Local AI — Free & Private
        </div>

        <h1 className="text-7xl font-black leading-tight mb-6 max-w-4xl">
          Turn Any Idea Into a
          <span className="text-indigo-400"> Real Prototype</span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl leading-relaxed mb-10">
          Describe your idea in one sentence. ProtoMind uses AI to suggest components,
          generate circuit diagrams, create 3D models, and export STL files for 3D printing.
        </p>

        <div className="flex gap-4 mb-16">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-base font-semibold transition"
          >
            ⚡ Start Building Free →
          </button>
          <button
            onClick={() => navigate('/parts')}
            className="px-8 py-4 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-base font-semibold transition"
          >
            Browse Parts Database
          </button>
        </div>

        {/* App Preview */}
        <div className="w-full max-w-4xl bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6 text-left">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-600 text-xs ml-2">ProtoMind App</span>
          </div>
          <div className="bg-[#13131f] rounded-xl p-4 mb-3">
            <p className="text-slate-500 text-xs mb-1">Your idea:</p>
            <p className="text-indigo-300 text-sm">"A smart helmet with collision detection and SOS alert"</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🧠', name: 'Arduino Uno', cat: 'Microcontroller', color: '#6366f1' },
              { icon: '📡', name: 'MPU6050 Sensor', cat: 'Sensor', color: '#0ea5e9' },
              { icon: '📶', name: 'GSM Module', cat: 'Communication', color: '#ef4444' },
            ].map(c => (
              <div key={c.name} className="bg-[#0d0d1a] border rounded-xl p-3" style={{ borderColor: c.color }}>
                <div className="text-xl mb-1">{c.icon}</div>
                <div className="text-xs text-white font-medium">{c.name}</div>
                <div className="text-xs mt-0.5" style={{ color: c.color }}>{c.cat}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-16 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Everything You Need to Build</h2>
        <p className="text-slate-400 text-center mb-16 text-lg">From idea to 3D printed prototype in minutes</p>

        <div className="grid grid-cols-3 gap-6">
          {[
            {
              icon: '🧠',
              title: 'AI Component Suggestions',
              desc: 'Describe your idea and local AI instantly suggests the perfect components with reasons why each one is needed.',
              color: '#6366f1',
            },
            {
              icon: '📐',
              title: '2D Layout Canvas',
              desc: 'Drag and drop components on a visual canvas to design your circuit layout before building anything physical.',
              color: '#0ea5e9',
            },
            {
              icon: '🧊',
              title: '3D Prototype Viewer',
              desc: 'See your prototype in full 3D. Rotate, zoom, and hover over components to explore your design.',
              color: '#22c55e',
            },
            {
              icon: '⚡',
              title: 'Circuit Diagram Generator',
              desc: 'AI generates a complete wiring diagram showing how all components connect with color coded wires.',
              color: '#f59e0b',
            },
            {
              icon: '🖨️',
              title: 'Smart 3D Print Detection',
              desc: 'AI decides if your prototype needs a 3D printed enclosure and generates the exact STL file with cutouts.',
              color: '#a855f7',
            },
            {
              icon: '📄',
              title: 'PDF Report Export',
              desc: 'Export a professional PDF report with components list, wiring guide, and AI validation score to share with anyone.',
              color: '#ef4444',
            },
          ].map(f => (
            <div
              key={f.title}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6 hover:border-opacity-50 transition"
              style={{ '--hover-color': f.color }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="px-16 py-20 bg-[#0d0d1a]">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="flex justify-center gap-8 flex-wrap">
          {[
            { step: '01', title: 'Describe Your Idea', desc: 'Type your prototype idea in plain English — one sentence is all you need' },
            { step: '02', title: 'AI Picks Components', desc: 'Local AI analyses your idea and suggests the perfect components with reasons' },
            { step: '03', title: 'Design the Layout', desc: 'Drag components on a canvas and generate a full circuit diagram automatically' },
            { step: '04', title: 'Export & Build', desc: 'Download STL files, BOM spreadsheet, and a full PDF report to start building' },
          ].map((item, i) => (
            <div key={item.step} className="flex flex-col items-center text-center max-w-xs">
              <div className="text-5xl font-black text-indigo-900 mb-4">{item.step}</div>
              {i < 3 && (
                <div className="hidden lg:block absolute text-slate-700 text-2xl mt-6">→</div>
              )}
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-16 py-16 border-t border-[#1e1e2e]">
        <div className="flex justify-center gap-20 flex-wrap">
          {[
            { value: '100%', label: 'Free to use' },
            { value: 'Local AI', label: 'No data sent online' },
            { value: '< 30s', label: 'From idea to prototype' },
            { value: 'STL + PDF', label: 'Export formats' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-black text-indigo-400 mb-1">{stat.value}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-16 py-24 text-center border-t border-[#1e1e2e]">
        <h2 className="text-5xl font-black mb-6">
          Ready to Build Your
          <span className="text-indigo-400"> First Prototype?</span>
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Free, private, runs on your computer. No account needed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-lg font-bold transition"
        >
          ⚡ Launch ProtoMind Free →
        </button>
      </div>

      {/* Footer */}
      <div className="px-16 py-8 border-t border-[#1e1e2e] flex justify-between items-center">
        <div className="text-indigo-400 font-bold">⚡ ProtoMind</div>
        <p className="text-slate-600 text-xs">Built with React, Three.js, Ollama AI & Tauri</p>
        <p className="text-slate-600 text-xs">©️ 2026 ProtoMind</p>
      </div>
    </div>
  )
}

export default Landing