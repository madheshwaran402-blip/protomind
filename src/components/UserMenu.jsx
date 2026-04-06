import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, signOut } from '../services/supabase'

function UserMenu() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getUser().then(setUser)
  }, [])

  async function handleSignOut() {
    await signOut()
    setUser(null)
    setOpen(false)
    navigate('/')
  }

  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
      >
        Sign In
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl transition"
      >
        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
          {user.email[0].toUpperCase()}
        </div>
        <span className="text-xs text-slate-300 max-w-24 truncate">{user.email}</span>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl py-2 w-48 z-50">
          <div className="px-4 py-2 border-b border-[#1e1e2e]">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="text-xs text-white truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { navigate('/history'); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-[#1e1e2e] transition"
          >
            📂 My Projects
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#1e1e2e] transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu