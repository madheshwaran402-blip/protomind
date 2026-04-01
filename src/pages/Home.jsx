import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [idea, setIdea] = useState('')
  const navigate = useNavigate()

  function handleGenerate() {
    if (idea.trim().length > 0) {
      navigate('/components', { state: { idea } })
    }
  }

  return (
    <div className="flex flex-col items-center text-center px-10 pt-20 pb-16">

      <div className="bg-indigo-950 text-indigo-400 text-sm px-5 py-2 rounded-full border border-indigo-800 mb-6">
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

      <div className="flex justify-center gap-6 px-16 mt-16 flex-wrap">
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

    </div>
  )
}

export default Home