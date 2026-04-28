import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  const FEATURES = [
    { icon: '🧠', title: 'AI Component Picker', desc: 'Describe your idea and AI instantly suggests the right components from a curated database of electronics parts.' },
    { icon: '📐', title: '2D Layout Designer', desc: 'Drag and drop components into a clean 2D canvas. See how everything connects before soldering.' },
    { icon: '🧊', title: '3D Prototype Viewer', desc: 'Real-time 3D model of your prototype with 6 environment themes, exploded view, and measurement annotations.' },
    { icon: '💻', title: 'Code Generator', desc: 'AI writes complete Arduino and ESP32 code based on your components and pin assignments. Download and upload directly.' },
    { icon: '🖨️', title: '3D Print Export', desc: 'Generate custom enclosures in 6 styles. Export STL files for JLCPCB, Shapeways, or your local 3D printer.' },
    { icon: '📄', title: 'Documentation', desc: 'Auto-generate complete technical docs with wiring guide, code reference, troubleshooting, and Markdown export.' },
    { icon: '🛒', title: 'Shopping List', desc: 'Get a prioritized shopping list with real prices from Amazon, AliExpress, and local stores. Share via WhatsApp.' },
    { icon: '🎬', title: 'Video Script', desc: 'Write your complete YouTube or TikTok build video script with B-roll guide, thumbnail concept, and chapter markers.' },
    { icon: '🗺️', title: 'Learning Roadmap', desc: 'Personalized step-by-step learning path based on your prototype complexity with practice projects and resources.' },
    { icon: '👥', title: 'Team Collaboration', desc: 'Add team members, assign roles, manage tasks, and share notes. Perfect for school and university projects.' },
    { icon: '📊', title: 'Dashboard & Stats', desc: 'Track your building streak, favourite components, project history, and personal progress over time.' },
    { icon: '📦', title: 'Inventory Manager', desc: 'Track your physical component stock, get low stock alerts, and export your inventory as a CSV spreadsheet.' },
  ]

  const STATS = [
    { value: '20+', label: 'AI Tools' },
    { value: '100%', label: 'Local AI' },
    { value: '8', label: 'Templates' },
    { value: 'Free', label: 'Forever' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4 sm:px-8 pt-16 pb-20">
        <div className="bg-indigo-950 text-indigo-400 text-xs sm:text-sm px-4 py-1.5 rounded-full border border-indigo-800 mb-6">
          ⚡ AI-Powered Electronics Prototyping
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 max-w-4xl">
          Build Real Prototypes
          <span className="text-indigo-400"> with AI</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-xl max-w-2xl leading-relaxed mb-8">
          Describe your idea. AI picks components, designs the layout, generates
          code, writes documentation, and creates your shopping list — all locally on your machine.
        </p>

        <div className="flex gap-4 flex-wrap justify-center mb-12">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-base font-bold transition shadow-lg shadow-indigo-900"
          >
            ⚡ Start Building Free
          </button>
          <button
            onClick={() => navigate('/templates')}
            className="px-8 py-4 bg-[#1e1e2e] hover:bg-[#2e2e4e] border border-[#2e2e4e] rounded-2xl text-base font-bold transition"
          >
            📋 Browse Templates
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl w-full">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-indigo-400 mb-1">{stat.value}</p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-4 sm:px-8 md:px-16 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black mb-3">Everything You Need to Build</h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            20+ AI-powered tools built into one app. No subscriptions, no cloud AI costs — runs 100% locally.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map(feature => (
            <div
              key={feature.title}
              className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-5 transition group cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-indigo-400 transition">{feature.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 sm:px-8 md:px-16 pb-20 bg-[#0d0d1a] py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black mb-3">How ProtoMind Works</h2>
          <p className="text-slate-400 text-base">From idea to working prototype in 4 steps</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { step: '01', icon: '💡', title: 'Describe', desc: 'Type your prototype idea in plain English' },
            { step: '02', icon: '🔧', title: 'AI Picks', desc: 'AI suggests the perfect components' },
            { step: '03', icon: '🧊', title: 'Preview', desc: 'See your prototype in 3D' },
            { step: '04', icon: '🚀', title: 'Build', desc: 'Get code, docs, and shopping list' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-indigo-900 mb-2">{item.step}</div>
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 sm:px-8 py-20 text-center">
        <h2 className="text-2xl sm:text-4xl font-black mb-4">Ready to Build Your First Prototype?</h2>
        <p className="text-slate-400 text-base mb-8 max-w-lg mx-auto">
          Join makers, students, and engineers using ProtoMind to bring their ideas to life.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-base font-bold transition shadow-lg shadow-indigo-900"
        >
          ⚡ Start Building Now — It's Free
        </button>
        <p className="text-slate-600 text-xs mt-4">
          No account required · Runs locally · No AI subscription needed
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e1e2e] px-4 sm:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 font-bold">⚡ ProtoMind</span>
          <span className="text-slate-600 text-xs">— AI Electronics Prototyping</span>
        </div>
        <div className="flex gap-6 text-xs text-slate-600">
          <span
            className="hover:text-slate-400 cursor-pointer transition"
            onClick={() => navigate('/help')}
          >
            Help
          </span>
          <span
            className="hover:text-slate-400 cursor-pointer transition"
            onClick={() => navigate('/templates')}
          >
            Templates
          </span>
          <span
            className="hover:text-slate-400 cursor-pointer transition"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </span>
        </div>
        <p className="text-slate-700 text-xs">
          Built with ❤️ · Day 80 of 270
        </p>
      </div>
    </div>
  )
}

export default Landing