import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl mb-6">🔌</div>
      <h1 className="text-6xl font-black text-indigo-400 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
      <p className="text-slate-400 text-lg mb-10 max-w-md">
        This page doesn't exist or was moved. Let's get you back to building prototypes.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition"
        >
          ⚡ Go to Home
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-4 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-slate-300 transition"
        >
          ← Go Back
        </button>
      </div>
    </div>
  )
}

export default NotFound