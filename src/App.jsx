import NotFound from './pages/NotFound'
import CommandPalette from './components/CommandPalette'
import ToastContainer from './components/ToastContainer'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useState, useEffect } from 'react'
import Auth from './pages/Auth'
import Gallery from './pages/Gallery'
import UserMenu from './components/UserMenu'
import Landing from './pages/Landing'
import Parts from './pages/Parts'
import Layout from './pages/Layout'
import History from './pages/History'
import Settings from './pages/Settings'
import { getSettings } from './services/settings'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Components from './pages/Components'
import Viewer from './pages/Viewer'

function Navbar({ onOpenPalette }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const primaryLinks = [
    { label: 'Home', path: '/' },
    { label: 'History', path: '/history' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Parts', path: '/parts' },
  ]

  const secondaryLinks = [
    { label: 'Components', path: '/components' },
    { label: 'Layout', path: '/layout' },
    { label: '3D View', path: '/viewer' },
    { label: '⚙️ Settings', path: '/settings' },
    { label: '🌐 Landing', path: '/landing' },
  ]

  return (
    <nav className="border-b border-[#1e1e2e] bg-[#0d0d1a] relative">
      <div className="flex justify-between items-center px-10 py-4">
        <div
          onClick={() => navigate('/')}
          className="text-xl font-bold text-indigo-400 tracking-wider cursor-pointer shrink-0"
        >
          ⚡ ProtoMind
        </div>

        <div className="flex items-center gap-6">
          {primaryLinks.map((link) => (
            <span
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`cursor-pointer transition text-sm font-medium whitespace-nowrap ${
                location.pathname === link.path
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </span>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`text-sm font-medium transition flex items-center gap-1 ${
                secondaryLinks.some(l => l.path === location.pathname)
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              More {menuOpen ? '▲' : '▼'}
            </button>
            {menuOpen && (
              <div className="absolute top-10 left-0 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl py-2 w-44 z-50 shadow-xl">
                {secondaryLinks.map(link => (
                  <div
                    key={link.path}
                    onClick={() => { navigate(link.path); setMenuOpen(false) }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition ${
                      location.pathname === link.path
                        ? 'text-indigo-400 bg-indigo-950'
                        : 'text-slate-400 hover:text-white hover:bg-[#1e1e2e]'
                    }`}
                  >
                    {link.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPalette}
            className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl transition"
          >
            <span className="text-slate-400 text-sm">🔍</span>
            <span className="text-slate-500 text-xs hidden lg:block">Search</span>
            <kbd className="text-xs text-slate-600 bg-[#13131f] px-1.5 py-0.5 rounded hidden lg:block">⌘K</kbd>
          </button>
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useKeyboardShortcuts([
    { key: 'k', meta: true, action: () => setPaletteOpen(prev => !prev) },
  ])

  useEffect(() => {
    const settings = getSettings()
    if (settings.theme === 'light') {
      document.body.style.backgroundColor = '#f8fafc'
      document.body.style.color = '#0f172a'
    } else {
      document.body.style.backgroundColor = '#0a0a0f'
      document.body.style.color = '#ffffff'
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar onOpenPalette={() => setPaletteOpen(true)} />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/layout" element={<Layout />} />
          <Route path="/history" element={<History />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App