import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../services/supabase'
import { notify } from '../services/toast'

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleSubmit() {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        notify.success('Welcome back!')
        navigate('/')
      } else {
        await signUp(email, password)
        notify.info('Account created! Check your email to confirm.')
        setSuccess('Account created! Check your email to confirm, then log in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
      notify.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-indigo-400 cursor-pointer mb-2"
          >
            ⚡ ProtoMind
          </div>
          <p className="text-slate-500 text-sm">
            {mode === 'login' ? 'Sign in to sync your projects' : 'Create your free account'}
          </p>
        </div>

        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>

          {error && (
            <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-950 border border-green-800 rounded-xl px-4 py-3 text-green-300 text-sm mb-4">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-slate-500 text-sm">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-400 text-xs transition"
            >
              Continue without account →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth