import { useNavigate } from 'react-router-dom'

function Viewer() {
  const navigate = useNavigate()

  return (
    <div className="px-16 py-12">

      <button
        onClick={() => navigate('/components')}
        className="text-slate-500 hover:text-white text-sm mb-6 flex items-center gap-2 transition"
      >
        ← Back to Components
      </button>

      <h2 className="text-3xl font-bold mb-2">3D Prototype Viewer</h2>
      <p className="text-slate-400 mb-8">Your prototype will render here in 3D</p>

      {/* 3D Placeholder */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl flex items-center justify-center"
        style={{ height: '500px' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🧊</div>
          <h3 className="text-xl font-semibold mb-2">3D Viewer</h3>
          <p className="text-slate-400 text-sm">Three.js renders here in Month 4</p>
        </div>
      </div>

    </div>
  )
}

export default Viewer