import Layout from './pages/Layout'
import History from './pages/History'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Components from './pages/Components'
import Viewer from './pages/Viewer'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const links = [
    { label: 'Home', path: '/' },
    { label: 'History', path: '/history' },
    { label: 'Components', path: '/components' },
    { label: 'Layout', path: '/layout' },
    { label: '3D View', path: '/viewer' },
  ]

  return (
    <nav className="flex justify-between items-center px-16 py-5 border-b border-[#1e1e2e] bg-[#0d0d1a]">
      <div
        onClick={() => navigate('/')}
        className="text-xl font-bold text-indigo-400 tracking-wider cursor-pointer"
      >
        ⚡ ProtoMind
      </div>
      <div className="flex gap-10">
        {links.map((link) => (
          <span
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`cursor-pointer transition text-sm font-medium ${
              location.pathname === link.path
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {link.label}
          </span>
        ))}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/layout" element={<Layout />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App