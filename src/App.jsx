import CommandPalette from './components/CommandPalette'
import ToastContainer from './components/ToastContainer'
import OfflineDetector from './components/OfflineDetector'
import InstallPrompt from './components/InstallPrompt'
import AccessibilityPanel from './components/AccessibilityPanel'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useState, useEffect, lazy, Suspense } from 'react'
import { getSettings, applyFontSize } from './services/settings'
import { applyA11ySettings, getA11ySettings } from './services/accessibility'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import UserMenu from './components/UserMenu'

const Home = lazy(() => import('./pages/Home'))
const Components = lazy(() => import('./pages/Components'))
const Viewer = lazy(() => import('./pages/Viewer'))
const Layout = lazy(() => import('./pages/Layout'))
const History = lazy(() => import('./pages/History'))
const Parts = lazy(() => import('./pages/Parts'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Settings = lazy(() => import('./pages/Settings'))
const CustomLibrary = lazy(() => import('./pages/CustomLibrary'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Templates = lazy(() => import('./pages/Templates'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-900 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-3 border-4 border-indigo-700 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-indigo-400 text-sm font-medium">Loading ProtoMind...</p>
      </div>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

function Navbar({ onOpenPalette }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const primaryLinks = [
    { label: 'Home', path: '/' },
    { label: 'Templates', path: '/templates' },
    { label: 'History', path: '/history' },
    { label: 'Gallery', path: '/gallery' },
  ]

  const secondaryLinks = [
    { label: '📊 Dashboard', path: '/dashboard' },
    { label: 'Parts', path: '/parts' },
    { label: 'Components', path: '/components' },
    { label: 'Layout', path: '/layout' },
    { label: '3D View', path: '/viewer' },
    { label: '🔧 My Library', path: '/library' },
    { label: '⚙️ Settings', path: '/settings' },
    { label: '🌐 Landing', path: '/landing' },
  ]

  return (
    <nav className="border-b border-[#1e1e2e] bg-[#0d0d1a] relative" role="navigation" aria-label="Main navigation">
      <div className="flex justify-between items-center px-4 sm:px-10 py-4">
        <div
          onClick={() => navigate('/')}
          className="text-lg sm:text-xl font-bold text-indigo-400 tracking-wider cursor-pointer shrink-0"
          role="link" tabIndex={0} aria-label="ProtoMind home"
          onKeyDown={e => e.key === 'Enter' && navigate('/')}
        >
          ⚡ ProtoMind
        </div>

        <div className="hidden md:flex items-center gap-5">
          {primaryLinks.map((link) => (
            <span
              key={link.path}
              onClick={() => navigate(link.path)}
              onKeyDown={e => e.key === 'Enter' && navigate(link.path)}
              tabIndex={0} role="link"
              aria-current={location.pathname === link.path ? 'page' : undefined}
              className={`cursor-pointer transition text-sm font-medium whitespace-nowrap ${
                location.pathname === link.path ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </span>
          ))}

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              className={`text-sm font-medium transition flex items-center gap-1 ${
                secondaryLinks.some(l => l.path === location.pathname) ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
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
                    tabIndex={0}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition ${
                      location.pathname === link.path ? 'text-indigo-400 bg-indigo-950' : 'text-slate-400 hover:text-white hover:bg-[#1e1e2e]'
                    }`}
                  >
                    {link.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-400 hover:text-white p-2" aria-label="Open menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={onOpenPalette} className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl transition">
            <span className="text-slate-400 text-sm">🔍</span>
            <span className="text-slate-500 text-xs">Search</span>
            <kbd className="text-xs text-slate-600 bg-[#13131f] px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
          <UserMenu />
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#1e1e2e] bg-[#0d0d1a] py-2">
          {[...primaryLinks, ...secondaryLinks].map(link => (
            <div
              key={link.path}
              onClick={() => { navigate(link.path); setMenuOpen(false) }}
              className={`px-6 py-3 text-sm cursor-pointer transition ${
                location.pathname === link.path ? 'text-indigo-400 bg-indigo-950' : 'text-slate-400 hover:text-white hover:bg-[#1e1e2e]'
              }`}
            >
              {link.label}
            </div>
          ))}
          <div className="px-6 py-3 border-t border-[#1e1e2e] flex items-center justify-between">
            <button onClick={() => { onOpenPalette(); setMenuOpen(false) }} className="text-slate-400 text-sm">🔍 Search</button>
            <UserMenu />
          </div>
        </div>
      )}
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
    applyA11ySettings(getA11ySettings())
    applyFontSize(settings.fontSize || 'medium')
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <a href="#main" className="skip-link">Skip to content</a>
        <OfflineDetector />
        <Navbar onOpenPalette={() => setPaletteOpen(true)} />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <ToastContainer />
        <InstallPrompt />
        <AccessibilityPanel />
        <ScrollToTop />
        <main id="main" tabIndex={-1}>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/library" element={<CustomLibrary />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App