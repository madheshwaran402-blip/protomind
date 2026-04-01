import { useLocation, useNavigate } from 'react-router-dom'

function Components() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || 'No idea provided'

  return (
    <div className="px-16 py-12">

      {/* Header */}
      <div className="mb-10">
        <button
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-white text-sm mb-4 flex items-center gap-2 transition"
        >
          ← Back to Home
        </button>
        <h2 className="text-3xl font-bold mb-2">Component Suggestions</h2>
        <p className="text-slate-400">Idea: <span className="text-indigo-400 italic">"{idea}"</span></p>
      </div>

      {/* AI Working Placeholder */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">🧠</div>
        <h3 className="text-xl font-semibold mb-2">AI is analysing your idea...</h3>
        <p className="text-slate-400 text-sm">Component suggestions will appear here in Day 5 when we connect the AI</p>
        <button
          onClick={() => navigate('/viewer')}
          className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          Go to 3D Viewer →
        </button>
      </div>

    </div>
  )
}

export default Components