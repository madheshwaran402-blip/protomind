import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepBar from '../components/StepBar'
import { notify } from '../services/toast'
import html2canvas from 'html2canvas'

const CATEGORY_COLORS = {
  Microcontroller: { bg: '#1e1b4b', border: '#6366f1', text: '#a5b4fc' },
  Sensor: { bg: '#14293d', border: '#0ea5e9', text: '#7dd3fc' },
  Display: { bg: '#1a2e1a', border: '#22c55e', text: '#86efac' },
  Communication: { bg: '#2d1b1b', border: '#ef4444', text: '#fca5a5' },
  Power: { bg: '#2d2000', border: '#f59e0b', text: '#fcd34d' },
  Actuator: { bg: '#1f1635', border: '#a855f7', text: '#d8b4fe' },
  Module: { bg: '#1a2535', border: '#64748b', text: '#94a3b8' },
  Memory: { bg: '#1a2535', border: '#64748b', text: '#94a3b8' },
}

function ComponentBlock({ comp, position, onDragStart }) {
  const colors = CATEGORY_COLORS[comp.category] || CATEGORY_COLORS.Module
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, comp.id)}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        backgroundColor: colors.bg,
        border: '2px solid ' + colors.border,
        borderRadius: '12px',
        padding: '12px 16px',
        width: '160px',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{comp.icon}</div>
      <div style={{ color: colors.text, fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>
        {comp.name}
      </div>
      <div style={{ color: '#475569', fontSize: '11px' }}>{comp.category}</div>
    </div>
  )
}

function ConnectionLines({ components, positions }) {
  const microcontroller = components.find(c => c.category === 'Microcontroller')
  if (!microcontroller) return null
  const mcPos = positions[microcontroller.id]
  if (!mcPos) return null

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {components
        .filter(c => c.id !== microcontroller.id)
        .map(comp => {
          const pos = positions[comp.id]
          if (!pos) return null
          return (
            <line
              key={comp.id}
              x1={mcPos.x + 80} y1={mcPos.y + 50}
              x2={pos.x + 80} y2={pos.y + 50}
              stroke="#2e2e4e" strokeWidth="2" strokeDasharray="6,4"
            />
          )
        })}
    </svg>
  )
}

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || ''
  const selectedComponents = location.state?.selectedComponents || []
  const canvasRef = useRef(null)

  function getInitialPositions() {
    const positions = {}
    const cols = 3
    selectedComponents.forEach((comp, index) => {
      positions[comp.id] = {
        x: 60 + (index % cols) * 220,
        y: 60 + Math.floor(index / cols) * 160,
      }
    })
    return positions
  }

  const [positions, setPositions] = useState(getInitialPositions)
  const [history, setHistory] = useState([getInitialPositions()])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  function pushHistory(newPositions) {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ ...newPositions })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  function undo() {
    if (!canUndo) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setPositions({ ...history[newIndex] })
    notify.info('Undo')
  }

  function redo() {
    if (!canRedo) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setPositions({ ...history[newIndex] })
    notify.info('Redo')
  }

  function resetLayout() {
    const initial = getInitialPositions()
    setPositions(initial)
    pushHistory(initial)
    notify.info('Layout reset')
  }

  async function exportAsImage() {
    if (!canvasRef.current) return
    try {
      notify.info('Generating image...')
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#0d0d1a',
        scale: 2,
        useCORS: true,
      })
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = 'ProtoMind_Layout.png'
      link.click()
      notify.success('Layout image downloaded!')
    } catch {
      notify.error('Could not export image')
    }
  }

  function handleDragStart(e, id) {
    setDraggingId(id)
    const pos = positions[id]
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    })
  }

  function handleDragOver(e) {
    e.preventDefault()
    if (!draggingId) return
    const canvas = e.currentTarget.getBoundingClientRect()
    setPositions(prev => ({
      ...prev,
      [draggingId]: {
        x: Math.max(0, e.clientX - canvas.left - dragOffset.x),
        y: Math.max(0, e.clientY - canvas.top - dragOffset.y),
      },
    }))
  }

  function handleDrop(e) {
    e.preventDefault()
    if (draggingId) {
      pushHistory(positions)
    }
    setDraggingId(null)
  }

  function handleConfirm() {
    navigate('/viewer', {
      state: { idea, selectedComponents, positions },
    })
  }

  if (selectedComponents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No components selected.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 rounded-xl text-sm">
            Start Over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen page-enter">
      <StepBar currentStep={3} />

      <div className="px-16 pb-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-white text-sm mb-2 flex items-center gap-2 transition"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold mb-1">Component Layout</h2>
            <p className="text-slate-400 text-sm">
              Drag components to arrange your layout.
            </p>
          </div>

          <div className="flex gap-3 mt-6 items-center flex-wrap justify-end">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-sm transition disabled:opacity-30"
            >
              ↩ Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-sm transition disabled:opacity-30"
            >
              Redo ↪
            </button>
            <button
              onClick={resetLayout}
              className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
            >
              ↺ Reset
            </button>
            <button
              onClick={exportAsImage}
              className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
            >
              🖼️ Export Image
            </button>
            <button
              onClick={handleConfirm}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
            >
              View in 3D →
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs text-slate-600">
          <span>Step {historyIndex + 1} of {history.length}</span>
          <span>·</span>
          <span>{canUndo ? historyIndex + ' move' + (historyIndex !== 1 ? 's' : '') + ' made' : 'No moves yet'}</span>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          {Object.entries(CATEGORY_COLORS).slice(0, 6).map(([cat, colors]) => (
            <div
              key={cat}
              className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.bg, border: '1px solid ' + colors.border, color: colors.text }}
            >
              {cat}
            </div>
          ))}
        </div>

        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ position: 'relative', height: '500px' }}
          className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden"
        >
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#1e1e2e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <ConnectionLines components={selectedComponents} positions={positions} />

          {selectedComponents.map(comp => (
            <ComponentBlock
              key={comp.id}
              comp={comp}
              position={positions[comp.id] || { x: 0, y: 0 }}
              onDragStart={handleDragStart}
            />
          ))}
        </div>

        <p className="text-slate-600 text-xs mt-3 text-center">
          💡 Drag to move · ↩ Undo · ↪ Redo · ↺ Reset · 🖼️ Export Image
        </p>
      </div>
    </div>
  )
}

export default Layout