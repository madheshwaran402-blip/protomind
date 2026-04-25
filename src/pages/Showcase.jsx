import { useState, useEffect, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Stars } from '@react-three/drei'
import ComponentBox3D from '../components/ComponentBox3D'
import ConnectionLines3D from '../components/ConnectionLines3D'
import { getRatingForProject } from '../services/ratings'
import { getProgress } from '../services/timeline'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
  Memory: '#64748b',
}

const THEMES = [
  { id: 'dark', label: '🌑 Dark', bg: '#0a0a0f', accent: '#6366f1', stars: false },
  { id: 'space', label: '🚀 Space', bg: '#000005', accent: '#4444ff', stars: true },
  { id: 'neon', label: '🌈 Neon', bg: '#0a0018', accent: '#ff00ff', stars: false },
  { id: 'ocean', label: '🌊 Ocean', bg: '#000d1a', accent: '#0088ff', stars: false },
]

function get3DPositions(count) {
  const positions = []
  const cols = 3
  for (let i = 0; i < count; i++) {
    positions.push([
      (i % cols) * 3 - (3 * (Math.min(count, cols) - 1)) / 2,
      0,
      Math.floor(i / cols) * 3 - 1.5,
    ])
  }
  return positions
}

function Scene({ components, accent, showStars }) {
  const positions = get3DPositions(components.length)
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.6} color={accent} />
      <pointLight position={[10, 5, -10]} intensity={0.4} color={accent} />
      {showStars && <Stars radius={100} depth={50} count={5000} factor={4} fade speed={0.5} />}
      <Grid args={[30, 30]} position={[0, -0.5, 0]} cellColor="#1e1e2e" sectionColor="#2e2e4e" fadeDistance={25} />
      <ConnectionLines3D components={components} positions={positions} />
      {components.map((comp, index) => (
        <ComponentBox3D key={comp.id} comp={comp} position={positions[index]} />
      ))}
      <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} autoRotate={true} autoRotateSpeed={0.8} minDistance={5} maxDistance={25} />
    </>
  )
}

function Showcase() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || 'Your Prototype'
  const components = location.state?.selectedComponents || []

  const [theme, setTheme] = useState('dark')
  const [slide, setSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const rating = getRatingForProject(idea)
  const progress = getProgress(idea)
  const categories = [...new Set(components.map(c => c.category))]
  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0]

  const SLIDES = [
    { id: 'intro', label: '🏠 Intro' },
    { id: 'components', label: '🔧 Components' },
    { id: 'stats', label: '📊 Stats' },
    { id: 'model', label: '🧊 3D Model' },
  ]

  useEffect(() => {
    let timer
    if (autoPlay) {
      timer = setInterval(() => {
        setSlide(prev => (prev + 1) % SLIDES.length)
      }, 5000)
    }
    return () => clearInterval(timer)
  }, [autoPlay])

  useEffect(() => {
    let timer
    const handleMove = () => {
      setShowControls(true)
      clearTimeout(timer)
      timer = setTimeout(() => setShowControls(false), 3000)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  function handleKeyDown(e) {
    if (e.key === 'ArrowRight') setSlide(prev => Math.min(prev + 1, SLIDES.length - 1))
    if (e.key === 'ArrowLeft') setSlide(prev => Math.max(prev - 1, 0))
    if (e.key === 'Escape') navigate(-1)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ backgroundColor: currentTheme.bg }}
    >
      {/* Top controls bar */}
      <div className={`flex items-center justify-between px-6 py-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 font-bold">⚡ ProtoMind</span>
          <span className="text-slate-600 text-xs">Showcase Mode</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme picker */}
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`text-xs px-2 py-1 rounded-lg transition ${theme === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}

          {/* Auto play */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${autoPlay ? 'bg-green-700 text-green-200' : 'bg-[#1e1e2e] text-slate-400'}`}
          >
            {autoPlay ? '⏸ Pause' : '▶️ Auto'}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
          >
            ✕ Exit
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Intro slide */}
        {SLIDES[slide].id === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-2xl"
              style={{ background: currentTheme.accent + '20', border: '2px solid ' + currentTheme.accent + '40' }}
            >
              {components[0]?.icon || '⚡'}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight max-w-4xl">
              {idea}
            </h1>

            <div className="flex items-center gap-4 mb-8 flex-wrap justify-center">
              <span className="text-slate-400 text-sm">🔧 {components.length} components</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 text-sm">📦 {categories.length} categories</span>
              {rating.stars > 0 && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-yellow-400 text-sm">{'★'.repeat(rating.stars)} {rating.stars}/5</span>
                </>
              )}
              {progress.percent > 0 && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-indigo-400 text-sm">⚡ {progress.percent}% built</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map(cat => (
                <span
                  key={cat}
                  className="text-sm px-4 py-1.5 rounded-full font-medium"
                  style={{
                    backgroundColor: (CATEGORY_COLORS[cat] || '#6366f1') + '20',
                    color: CATEGORY_COLORS[cat] || '#6366f1',
                    border: '1px solid ' + (CATEGORY_COLORS[cat] || '#6366f1') + '40',
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>

            <p className="text-slate-500 text-sm">Built with ProtoMind AI · protomind-ten.vercel.app</p>
          </div>
        )}

        {/* Components slide */}
        {SLIDES[slide].id === 'components' && (
          <div className="flex-1 flex flex-col px-8 py-6 overflow-y-auto">
            <h2 className="text-3xl font-black text-white mb-6 text-center">🔧 Component List</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
              {components.map((comp, i) => (
                <div
                  key={comp.id}
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: (CATEGORY_COLORS[comp.category] || '#6366f1') + '10',
                    border: '1px solid ' + (CATEGORY_COLORS[comp.category] || '#6366f1') + '30',
                  }}
                >
                  <div className="text-4xl mb-2">{comp.icon}</div>
                  <p className="text-white text-sm font-semibold leading-tight mb-1">{comp.name}</p>
                  <p className="text-xs font-medium" style={{ color: CATEGORY_COLORS[comp.category] || '#6366f1' }}>
                    {comp.category}
                  </p>
                  <div className="mt-2 text-slate-600 text-xs">#{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats slide */}
        {SLIDES[slide].id === 'stats' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-3xl font-black text-white mb-8 text-center">📊 Prototype Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl w-full mb-8">
              {[
                { icon: '🔧', label: 'Components', value: components.length, color: '#6366f1' },
                { icon: '📦', label: 'Categories', value: categories.length, color: '#0ea5e9' },
                { icon: '⚡', label: 'Build Progress', value: progress.percent + '%', color: '#22c55e' },
                { icon: '⭐', label: 'Rating', value: rating.stars > 0 ? rating.stars + '/5' : 'N/A', color: '#f59e0b' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-6 text-center"
                  style={{ background: stat.color + '10', border: '1px solid ' + stat.color + '30' }}
                >
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-4xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            <div className="w-full max-w-2xl space-y-3">
              {categories.map(cat => {
                const count = components.filter(c => c.category === cat).length
                const pct = Math.round((count / components.length) * 100)
                const color = CATEGORY_COLORS[cat] || '#6366f1'
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <p className="text-sm w-36 shrink-0" style={{ color }}>{cat}</p>
                    <div className="flex-1 bg-[#1e1e2e] rounded-full h-3">
                      <div className="h-3 rounded-full transition-all" style={{ width: pct + '%', backgroundColor: color }} />
                    </div>
                    <span className="text-slate-400 text-xs w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3D Model slide */}
        {SLIDES[slide].id === 'model' && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-black text-white text-center py-4">🧊 3D Prototype Model</h2>
            <div className="flex-1">
              {components.length > 0 ? (
                <Canvas
                  camera={{ position: [0, 8, 14], fov: 50 }}
                  style={{ background: currentTheme.bg }}
                >
                  <Suspense fallback={null}>
                    <Scene
                      components={components}
                      accent={currentTheme.accent}
                      showStars={currentTheme.stars}
                    />
                  </Suspense>
                </Canvas>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-slate-400">No components to display</p>
                </div>
              )}
            </div>
            <p className="text-center text-slate-600 text-xs py-2">Drag to rotate · Scroll to zoom · Auto-rotating</p>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className={`flex items-center justify-center gap-4 py-4 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
      >
        <button
          onClick={() => setSlide(prev => Math.max(prev - 1, 0))}
          disabled={slide === 0}
          className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition disabled:opacity-30"
        >
          ← Prev
        </button>

        <div className="flex gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSlide(i)}
              className={`transition ${
                i === slide
                  ? 'w-8 h-3 rounded-full'
                  : 'w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-500'
              }`}
              style={i === slide ? { backgroundColor: currentTheme.accent } : {}}
              title={s.label}
            />
          ))}
        </div>

        <button
          onClick={() => setSlide(prev => Math.min(prev + 1, SLIDES.length - 1))}
          disabled={slide === SLIDES.length - 1}
          className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition disabled:opacity-30"
        >
          Next →
        </button>

        <span className="text-slate-600 text-xs ml-4 hidden sm:block">
          ← → arrow keys · Esc to exit
        </span>
      </div>
    </div>
  )
}

export default Showcase