import { Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import StepBar from '../components/StepBar'
import ComponentBox3D from '../components/ComponentBox3D'
import ConnectionLines3D from '../components/ConnectionLines3D'

function get3DPositions(count) {
  const positions = []
  const cols = 3
  for (let i = 0; i < count; i++) {
    positions.push([
      (i % cols) * 3 - 3,
      0,
      Math.floor(i / cols) * 3 - 1.5,
    ])
  }
  return positions
}

function Scene({ components }) {
  const positions = get3DPositions(components.length)

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />

      {/* Grid floor */}
      <Grid
        args={[20, 20]}
        position={[0, -0.5, 0]}
        cellColor="#1e1e2e"
        sectionColor="#2e2e4e"
        fadeDistance={25}
      />

      {/* Connection lines */}
      <ConnectionLines3D
        components={components}
        positions={positions}
      />

      {/* Component boxes */}
      {components.map((comp, index) => (
        <ComponentBox3D
          key={comp.id}
          comp={comp}
          position={positions[index]}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
    </>
  )
}

function Viewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || 'Your prototype'
  const selectedComponents = location.state?.selectedComponents || []

  return (
    <div className="min-h-screen">
      <StepBar currentStep={4} />

      <div className="px-16 pb-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-white text-sm mb-2 flex items-center gap-2 transition"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold mb-1">3D Prototype View</h2>
            <p className="text-slate-400 text-sm">
              Idea: <span className="text-indigo-400 italic">"{idea}"</span>
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-sm transition"
            >
              Start New
            </button>
            <button
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
              onClick={() => alert('STL Export coming in Day 9!')}
            >
              🖨️ Export STL
            </button>
          </div>
        </div>

        {/* Controls hint */}
        <div className="flex gap-6 mb-4 text-xs text-slate-600">
          <span>🖱️ Left click + drag — Rotate</span>
          <span>🖱️ Right click + drag — Pan</span>
          <span>🖱️ Scroll — Zoom</span>
          <span>Hover a box — it spins</span>
        </div>

        {/* 3D Canvas */}
        <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]" style={{ height: '520px' }}>
          {selectedComponents.length > 0 ? (
            <Canvas
              camera={{ position: [6, 5, 8], fov: 50 }}
              style={{ background: '#0a0a0f' }}
            >
              <Suspense fallback={null}>
                <Scene components={selectedComponents} />
              </Suspense>
            </Canvas>
          ) : (
            <div className="h-full flex items-center justify-center bg-[#0d0d1a]">
              <div className="text-center">
                <div className="text-5xl mb-4">🧊</div>
                <p className="text-slate-400">No components to display</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 px-6 py-2 bg-indigo-600 rounded-xl text-sm"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Component list below */}
        <div className="mt-6 grid grid-cols-6 gap-3">
          {selectedComponents.map(comp => (
            <div
              key={comp.id}
              className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-3 text-center"
            >
              <div className="text-2xl mb-1">{comp.icon}</div>
              <div className="text-xs text-white font-medium leading-tight">{comp.name}</div>
              <div className="text-xs text-slate-600 mt-1">{comp.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Viewer