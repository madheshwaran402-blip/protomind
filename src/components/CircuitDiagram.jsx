import { useState, useRef } from 'react'
import { generateCircuitData } from '../services/CircuitDiagram'

const WIRE_COLORS = {
  red: '#ef4444',
  black: '#94a3b8',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
}

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

function ComponentNode({ comp, position, isSelected, onClick }) {
  const color = CATEGORY_COLORS[comp.category] || '#64748b'

  return (
    <g
      transform={'translate(' + position.x + ',' + position.y + ')'}
      onClick={() => onClick(comp)}
      style={{ cursor: 'pointer' }}
    >
      {/* Shadow */}
      <rect x="3" y="3" width="140" height="70" rx="10" fill="rgba(0,0,0,0.3)" />

      {/* Main box */}
      <rect
        width="140"
        height="70"
        rx="10"
        fill="#0d0d1a"
        stroke={isSelected ? '#ffffff' : color}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />

      {/* Color bar */}
      <rect width="140" height="6" rx="3" fill={color} />

      {/* Icon */}
      <text x="15" y="38" fontSize="20" dominantBaseline="middle">{comp.icon}</text>

      {/* Name */}
      <text
        x="42"
        y="32"
        fontSize="10"
        fontWeight="600"
        fill="white"
        fontFamily="system-ui"
      >
        {comp.name.length > 16 ? comp.name.slice(0, 16) + '…' : comp.name}
      </text>

      {/* Category */}
      <text x="42" y="48" fontSize="9" fill={color} fontFamily="system-ui">
        {comp.category}
      </text>

      {/* Connection dot */}
      <circle cx="140" cy="35" r="4" fill={color} />
      <circle cx="0" cy="35" r="4" fill={color} />
    </g>
  )
}

function WireLabel({ x, y, label, color }) {
  return (
    <g>
      <rect
        x={x - 20}
        y={y - 8}
        width="40"
        height="16"
        rx="4"
        fill="#0a0a0f"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.9"
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="7"
        fill={color}
        fontFamily="system-ui"
      >
        {label}
      </text>
    </g>
  )
}

function CircuitDiagram({ idea, components }) {
  const [circuitData, setCircuitData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedComp, setSelectedComp] = useState(null)
  const [positions, setPositions] = useState({})
  const svgRef = useRef(null)

  function calculatePositions() {
    const cols = 3
    const pos = {}
    components.forEach((comp, index) => {
      pos[comp.name] = {
        x: 80 + (index % cols) * 220,
        y: 60 + Math.floor(index / cols) * 140,
      }
    })
    return pos
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const data = await generateCircuitData(idea, components)
      setCircuitData(data)
      setPositions(calculatePositions())
    } catch {
      setError('Could not generate circuit. Make sure Ollama is running.')
    } finally {
      setLoading(false)
    }
  }

  function getComponentCenter(name) {
    const pos = positions[name]
    if (!pos) return null
    return { x: pos.x + 70, y: pos.y + 35 }
  }

  function downloadSVG() {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ProtoMind_Circuit.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const svgWidth = 800
  const svgHeight = Math.max(400, Math.ceil(components.length / 3) * 140 + 120)

  return (
    <div className="mt-6 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">⚡ Circuit Diagram</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Visual wiring map of your prototype
          </p>
        </div>
        <div className="flex gap-3">
          {circuitData && (
            <button
              onClick={downloadSVG}
              className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-xs text-slate-300 transition"
            >
              ⬇️ Download SVG
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? '⚡ Generating...' : circuitData ? '🔄 Regenerate' : '⚡ Generate Circuit'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(WIRE_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-500 capitalize">{name}</span>
          </div>
        ))}
      </div>

      {/* Circuit Canvas */}
      <div className="rounded-xl overflow-hidden border border-[#1e1e2e] bg-[#070710]">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">AI is mapping the connections...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-40">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !circuitData && !error && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <div className="text-5xl">⚡</div>
            <p className="text-slate-400 text-sm">Click Generate Circuit to create the wiring diagram</p>
            <p className="text-slate-600 text-xs">AI will map all connections between your components</p>
          </div>
        )}

        {circuitData && !loading && (
          <svg
            ref={svgRef}
            width="100%"
            viewBox={'0 0 ' + svgWidth + ' ' + svgHeight}
            style={{ background: '#070710', maxHeight: '500px' }}
          >
            {/* Grid background */}
            <defs>
              <pattern id="circuitGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.5" fill="#1e1e2e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuitGrid)" />

            {/* Wire connections */}
            {circuitData.connections?.map((conn, i) => {
              const fromComp = components.find(c =>
                c.name.toLowerCase().includes(conn.from.component.toLowerCase().split(' ')[0].toLowerCase()) ||
                conn.from.component.toLowerCase().includes(c.name.toLowerCase().split(' ')[0].toLowerCase())
              )
              const toComp = components.find(c =>
                c.name.toLowerCase().includes(conn.to.component.toLowerCase().split(' ')[0].toLowerCase()) ||
                conn.to.component.toLowerCase().includes(c.name.toLowerCase().split(' ')[0].toLowerCase())
              )

              if (!fromComp || !toComp) return null

              const from = getComponentCenter(fromComp.name)
              const to = getComponentCenter(toComp.name)
              if (!from || !to) return null

              const color = WIRE_COLORS[conn.wire] || '#64748b'
              const midX = (from.x + to.x) / 2
              const midY = (from.y + to.y) / 2

              return (
                <g key={i}>
                  <path
                    d={'M ' + from.x + ' ' + from.y + ' C ' + (from.x + 60) + ' ' + from.y + ', ' + (to.x - 60) + ' ' + to.y + ', ' + to.x + ' ' + to.y}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray={conn.wire === 'black' ? '4,2' : 'none'}
                    opacity="0.8"
                  />
                  {conn.label && (
                    <WireLabel x={midX} y={midY} label={conn.label} color={color} />
                  )}
                </g>
              )
            })}

            {/* Component nodes */}
            {components.map(comp => {
              const pos = positions[comp.name]
              if (!pos) return null
              return (
                <ComponentNode
                  key={comp.id}
                  comp={comp}
                  position={pos}
                  isSelected={selectedComp?.id === comp.id}
                  onClick={setSelectedComp}
                />
              )
            })}
          </svg>
        )}
      </div>

      {/* Selected component info */}
      {selectedComp && circuitData && (
        <div className="mt-4 bg-[#13131f] rounded-xl p-4 border border-[#2e2e4e]">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{selectedComp.icon}</span>
            <div>
              <h4 className="text-white font-semibold text-sm">{selectedComp.name}</h4>
              <p className="text-slate-500 text-xs">{selectedComp.category}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 mb-2">Connections:</p>
            {circuitData.connections
              ?.filter(c => {
                const name = selectedComp.name.toLowerCase()
                return c.from.component.toLowerCase().includes(name.split(' ')[0]) ||
                  c.to.component.toLowerCase().includes(name.split(' ')[0])
              })
              .map((conn, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: WIRE_COLORS[conn.wire] || '#64748b' }}
                  />
                  <span className="text-slate-400">
                    {conn.from.component} [{conn.from.pin}] → {conn.to.component} [{conn.to.pin}]
                  </span>
                  <span className="text-slate-600">({conn.label})</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CircuitDiagram