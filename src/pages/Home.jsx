import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StepBar from '../components/StepBar'
import { getAllProjects } from '../services/storage'

function Home() {
  const [idea, setIdea] = useState('')
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalComponents: 0,
    lastIdea: null,
    lastDate: null,
  })

  useEffect(() => {
    const projects = getAllProjects()
    if (projects.length > 0) {
      const totalComponents = projects.reduce((sum, p) => sum + (p.components?.length || 0), 0)
      setStats({
        totalProjects: projects.length,
        totalComponents,
        lastIdea: projects[0].idea,
        lastDate: new Date(projects[0].createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        }),
      })
    }
  }, [])

  function handleGenerate() {
    if (idea.trim().length > 0) {
      navigate('/components', { state: { idea } })
    }
  }

  return (
    <div className="flex flex-col items-center text-center px-4 sm:px-8 md:px-10 pt-6 pb-16 page-enter">
      <StepBar currentStep={1} />

      <div className="bg-indigo-950 text-indigo-400 text-xs sm:text-sm px-4 py-1.5 rounded-full border border-indigo-800 mb-4 mt-4">
        AI Prototype Generator
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
        Turn Your Idea Into a<br />
        <span className="text-indigo-400">Real Prototype</span>
      </h1>

      <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-6">
        Describe your idea in one sentence. ProtoMind suggests components,
        shows placement, and generates a 3D model.
      </p>

      <div className="w-full max-w-2xl flex flex-col gap-3">
        <div className="relative w-full">
          <textarea
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm sm:text-base resize-none outline-none focus:border-indigo-500 transition placeholder-slate-600"
            placeholder="e.g. A smart water bottle that tracks temperature..."
            value={idea}
            onChange={(e) => setIdea(e.target.value.slice(0, 200))}
            rows={3}
            maxLength={200}
          />
          <span className={`absolute bottom-3 right-4 text-xs ${
            idea.length > 180 ? 'text-orange-400' : 'text-slate-600'
          }`}>
            {idea.length}/200
          </span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={idea.length === 0}
          className={`w-full py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold transition ${
            idea.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white'
              : 'bg-[#1e1e2e] text-slate-600 cursor-not-allowed'
          }`}
        >
          {idea.length > 0 ? '⚡ Generate Prototype' : 'Type your idea first...'}
        </button>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap justify-center items-center">
        <span className="text-slate-600 text-xs sm:text-sm">Try:</span>
        {[
          ['Smart Helmet', 'A smart helmet with collision detection and SOS alert'],
          ['Plant Watering', 'An automatic plant watering system with soil moisture sensor'],
          ['Robotic Arm', 'A gesture controlled robotic arm'],
        ].map(([label, value]) => (
          <span
            key={label}
            onClick={() => setIdea(value)}
            className="bg-[#13131f] border border-[#2e2e4e] text-slate-400 px-3 py-1 rounded-full text-xs sm:text-sm cursor-pointer hover:border-indigo-500 hover:text-indigo-300 transition"
          >
            {label}
          </span>
        ))}
      </div>

      {stats.totalProjects > 0 && (
        <div className="w-full max-w-3xl mt-10 mb-4">
          <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3 text-center">
            Your ProtoMind Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Prototypes Built', value: stats.totalProjects, icon: '⚡' },
              { label: 'Components Used', value: stats.totalComponents, icon: '🔧' },
              { label: 'Last Built', value: stats.lastDate, icon: '📅' },
              { label: 'AI Engine', value: 'Ollama', icon: '🧠' },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-3 sm:p-4 text-center hover:border-indigo-800 transition"
              >
                <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg sm:text-xl font-bold text-indigo-400 mb-1">{stat.value}</div>
                <div className="text-slate-600 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
          {stats.lastIdea && (
            <div
              className="mt-3 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-indigo-800 transition"
              onClick={() => setIdea(stats.lastIdea)}
            >
              <span className="text-slate-500 text-xs shrink-0">Last:</span>
              <span className="text-indigo-400 text-xs italic flex-1 truncate">"{stats.lastIdea}"</span>
              <span className="text-slate-600 text-xs shrink-0">Reload →</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-6 mb-8 flex-wrap justify-center">
        {[
  { label: '📂 History', path: '/history' },
  { label: '📋 Templates', path: '/templates' },
  { label: '📊 Dashboard', path: '/dashboard' },
  { label: '📦 Inventory', path: '/inventory' },
  { label: '📈 Progress', path: '/progress' },
  { label: '🆘 Help', path: '/help' },
].map(action => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="px-4 py-2 bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 text-slate-400 hover:text-white rounded-xl text-xs sm:text-sm transition"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {[
          { icon: '🧠', title: 'AI Component Picker', desc: 'AI suggests the best components for your idea' },
          { icon: '📐', title: '2D Layout Preview', desc: 'See how components connect before building' },
          { icon: '🖨️', title: '3D Print Ready', desc: 'Export STL files for any 3D printing service' },
        ].map((card) => (
          <div key={card.title} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 sm:p-8 text-center hover:border-indigo-800 transition">
            <div className="text-3xl sm:text-4xl mb-3">{card.icon}</div>
            <h3 className="text-sm sm:text-base font-semibold mb-2">{card.title}</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-3xl mt-16 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 text-slate-300">How ProtoMind Works</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Describe', desc: 'Type your prototype idea' },
            { step: '02', title: 'AI Picks', desc: 'AI suggests components' },
            { step: '03', title: 'Arrange', desc: 'Design the layout' },
            { step: '04', title: 'Export', desc: 'Download STL and PDF' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-indigo-900 mb-2">{item.step}</div>
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home