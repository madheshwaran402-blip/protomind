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
    <div className="flex flex-col items-center text-center px-10 pt-10 pb-16 page-enter">
      <StepBar currentStep={1} />

      <div className="bg-indigo-950 text-indigo-400 text-sm px-5 py-2 rounded-full border border-indigo-800 mb-6 mt-4">
        AI Prototype Generator
      </div>

      <h1 className="text-6xl font-extrabold leading-tight mb-5">
        Turn Your Idea Into a<br />
        <span className="text-indigo-400">Real Prototype</span>
      </h1>

      <p className="text-slate-400 text-lg max-w-xl leading-relaxed mb-10">
        Describe your idea in one sentence. ProtoMind will suggest
        components, show placement, and generate a 3D model.
      </p>

      <div className="w-full max-w-2xl flex flex-col gap-3">
        <textarea
          className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-5 py-4 text-white text-base resize-none outline-none focus:border-indigo-500 transition placeholder-slate-600"
          placeholder="e.g. A smart water bottle that tracks temperature and hydration..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={3}
        />
        <button
          onClick={handleGenerate}
          disabled={idea.length === 0}
          className={`w-full py-4 rounded-xl text-base font-semibold transition ${
            idea.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white'
              : 'bg-[#1e1e2e] text-slate-600 cursor-not-allowed'
          }`}
        >
          {idea.length > 0 ? '⚡ Generate Prototype' : 'Type your idea first...'}
        </button>
      </div>

      <div className="flex gap-3 mt-5 flex-wrap justify-center items-center">
        <span className="text-slate-600 text-sm">Try:</span>
        {[
          ['Smart Helmet', 'A smart helmet with collision detection and SOS alert'],
          ['Plant Watering', 'An automatic plant watering system with soil moisture sensor'],
          ['Robotic Arm', 'A gesture controlled robotic arm'],
        ].map(([label, value]) => (
          <span
            key={label}
            onClick={() => setIdea(value)}
            className="bg-[#13131f] border border-[#2e2e4e] text-slate-400 px-4 py-1.5 rounded-full text-sm cursor-pointer hover:border-indigo-500 hover:text-indigo-300 transition"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Stats Dashboard */}
      {stats.totalProjects > 0 && (
        <div className="w-full max-w-3xl mt-16 mb-4">
          <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4 text-center">
            Your ProtoMind Stats
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Prototypes Built', value: stats.totalProjects, icon: '⚡' },
              { label: 'Components Used', value: stats.totalComponents, icon: '🔧' },
              { label: 'Last Built', value: stats.lastDate, icon: '📅' },
              { label: 'AI Engine', value: 'Ollama', icon: '🧠' },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 text-center hover:border-indigo-800 transition"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-xl font-bold text-indigo-400 mb-1">{stat.value}</div>
                <div className="text-slate-600 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          {stats.lastIdea && (
            <div
              className="mt-3 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-5 py-3 flex items-center gap-3 cursor-pointer hover:border-indigo-800 transition"
              onClick={() => setIdea(stats.lastIdea)}
            >
              <span className="text-slate-500 text-xs">Last prototype:</span>
              <span className="text-indigo-400 text-xs italic flex-1 truncate">"{stats.lastIdea}"</span>
              <span className="text-slate-600 text-xs">Click to reload →</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 mt-8 mb-12 flex-wrap justify-center">
        {[
          { label: '📂 View History', path: '/history' },
          { label: '🔧 Browse Parts', path: '/parts' },
          { label: '⚙️ Settings', path: '/settings' },
        ].map(action => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="px-5 py-2 bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 text-slate-400 hover:text-white rounded-xl text-sm transition"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="flex justify-center gap-6 flex-wrap">
        {[
          { icon: '🧠', title: 'AI Component Picker', desc: 'AI suggests the best components for your idea with reasons why' },
          { icon: '📐', title: '2D Layout Preview', desc: 'See how components connect before building anything physical' },
          { icon: '🖨️', title: '3D Print Ready', desc: 'Export STL files directly to send to any 3D printing service' },
        ].map((card) => (
          <div key={card.title} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-8 w-64 text-center hover:border-indigo-800 transition">
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-base font-semibold mb-2">{card.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* How it Works */}
      <div className="w-full max-w-3xl mt-20 mb-8">
        <h2 className="text-2xl font-bold text-center mb-10 text-slate-300">How ProtoMind Works</h2>
        <div className="flex justify-between items-start gap-4">
          {[
            { step: '01', title: 'Describe Your Idea', desc: 'Type your prototype idea in plain English — one sentence is enough' },
            { step: '02', title: 'AI Picks Components', desc: 'Local AI analyses your idea and suggests the perfect components' },
            { step: '03', title: 'Arrange the Layout', desc: 'Drag components on a 2D canvas to design your circuit placement' },
            { step: '04', title: 'Export & Print', desc: 'View in 3D and export STL files to send to any 3D printing service' },
          ].map((item) => (
            <div key={item.step} className="flex-1 text-center">
              <div className="text-3xl font-black text-indigo-900 mb-3">{item.step}</div>
              <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home