import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  const QUICK_LINKS = [
    { label: '🏠 Home', path: '/' },
    { label: '📋 Templates', path: '/templates' },
    { label: '📂 History', path: '/history' },
    { label: '📊 Dashboard', path: '/dashboard' },
    { label: '🆘 Help', path: '/help' },
    { label: '⚙️ Settings', path: '/settings' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center page-enter">
      <div className="text-8xl mb-6">⚡</div>
      <h1 className="text-6xl font-black text-indigo-400 mb-3">404</h1>
      <h2 className="text-2xl font-bold text-white mb-3">Component Not Found</h2>
      <p className="text-slate-400 text-base mb-8 max-w-md leading-relaxed">
        Looks like this page got disconnected from the circuit. Let's get you back to building.
      </p>

      <button
        onClick={() => navigate('/')}
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-base font-bold transition mb-8"
      >
        ⚡ Back to ProtoMind
      </button>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-lg">
        {QUICK_LINKS.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="px-3 py-2 bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 text-slate-400 hover:text-white rounded-xl text-xs transition"
          >
            {link.label}
          </button>
        ))}
      </div>

      <p className="text-slate-700 text-xs mt-8">
        ProtoMind · Day 80 of 270
      </p>
    </div>
  )
}

export default NotFound