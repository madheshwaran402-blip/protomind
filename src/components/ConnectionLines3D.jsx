import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WIRE_COLORS = {
  Power: '#ef4444',
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#f97316',
  Actuator: '#a855f7',
  Memory: '#8b5cf6',
  default: '#475569',
}

function AnimatedWire({ start, end, color, delay = 0 }) {
  const ref = useRef()

  // Build a curved tube path between two points
  const curve = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const mid = new THREE.Vector3(
      (s.x + e.x) / 2,
      Math.max(s.y, e.y) + 0.8 + Math.random() * 0.4,
      (s.z + e.z) / 2 + (Math.random() - 0.5) * 0.5
    )
    return new THREE.QuadraticBezierCurve3(s, mid, e)
  }, [start.toString(), end.toString()])

  const points = useMemo(() => curve.getPoints(20), [curve])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  useFrame((state) => {
    if (ref.current) {
      // Pulse opacity along wire
      ref.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.25
    }
  })

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.5} linewidth={1} />
    </line>
  )
}

// PCB-style trace line (straight, L-shaped routing)
function PCBTrace({ start, end, color }) {
  const points = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    // Route: go half X, then full Z, then rest of X (Manhattan routing)
    const mid1 = new THREE.Vector3(s.x, s.y + 0.05, s.z)
    const mid2 = new THREE.Vector3(s.x + (e.x - s.x) * 0.5, s.y + 0.05, s.z)
    const mid3 = new THREE.Vector3(s.x + (e.x - s.x) * 0.5, e.y + 0.05, e.z)
    const end3 = new THREE.Vector3(e.x, e.y + 0.05, e.z)
    return [mid1, mid2, mid3, end3]
  }, [start.toString(), end.toString()])

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </line>
  )
}

// PCB base board that sits under all components
function UnifiedPCB({ positions, components }) {
  if (positions.length === 0) return null

  // Calculate board bounds
  const xs = positions.map(p => p[0])
  const zs = positions.map(p => p[2])
  const minX = Math.min(...xs) - 1.8
  const maxX = Math.max(...xs) + 1.8
  const minZ = Math.min(...zs) - 1.5
  const maxZ = Math.max(...zs) + 1.5
  const w = maxX - minX
  const d = maxZ - minZ
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2

  return (
    <group position={[cx, -0.22, cz]}>
      {/* Main PCB */}
      <mesh>
        <boxGeometry args={[w, 0.15, d]} />
        <meshStandardMaterial color="#0f3320" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Silkscreen top */}
      <mesh position={[0, 0.076, 0]}>
        <boxGeometry args={[w - 0.05, 0.001, d - 0.05]} />
        <meshStandardMaterial color="#1a4a2e" roughness={0.9} />
      </mesh>
      {/* Copper pour areas */}
      {[
        [0, 0.077, 0, w * 0.9, d * 0.85],
      ].map(([x, y, z, pw, pd], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[pw, 0.001, pd]} />
          <meshStandardMaterial color="#1a5235" metalness={0.1} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Horizontal copper traces */}
      {Array.from({length: 5}).map((_, i) => (
        <mesh key={'ht' + i} position={[0, 0.078, -d/2 + (i + 0.5) * (d / 5)]}>
          <boxGeometry args={[w * 0.85, 0.002, 0.018]} />
          <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Vertical copper traces */}
      {Array.from({length: 4}).map((_, i) => (
        <mesh key={'vt' + i} position={[-w/2 + (i + 0.5) * (w / 4), 0.078, 0]}>
          <boxGeometry args={[0.018, 0.002, d * 0.88]} />
          <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Ground plane edge */}
      <mesh position={[0, 0.079, 0]}>
        <boxGeometry args={[w - 0.2, 0.001, d - 0.2]} />
        <meshStandardMaterial color="#b87333" wireframe transparent opacity={0.08} />
      </mesh>
      {/* Corner mounting holes */}
      {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx, sz], i) => (
        <group key={i} position={[sx * (w/2 - 0.35), 0.08, sz * (d/2 - 0.35)]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.2, 12]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
          </mesh>
          {/* Copper annular ring */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.12, 0.22, 16]} />
            <meshStandardMaterial color="#b87333" metalness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Board edge chamfers */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w + 0.1, 0.12, d + 0.1]} />
        <meshStandardMaterial color="#0d2a1a" roughness={0.9} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function ConnectionLines3D({ components, positions }) {
  const mcIndex = components.findIndex(c => c.category === 'Microcontroller')
  const mcPos = mcIndex >= 0 ? positions[mcIndex] : positions[0]

  return (
    <>
      {/* Unified PCB board under everything */}
      <UnifiedPCB positions={positions} components={components} />

      {/* Animated wire connections */}
      {components.map((comp, index) => {
        if (index === mcIndex) return null
        const pos = positions[index]
        if (!pos || !mcPos) return null
        const wireColor = WIRE_COLORS[comp.category] || WIRE_COLORS.default
        const delay = index * 0.7

        return (
          <group key={comp.id}>
            <AnimatedWire
              start={[mcPos[0], mcPos[1] + 0.2, mcPos[2]]}
              end={[pos[0], pos[1] + 0.2, pos[2]]}
              color={wireColor}
              delay={delay}
            />
          </group>
        )
      })}

      {/* Power rail lines (straight horizontal) */}
      {positions.length > 1 && (
        <line>
          <bufferGeometry setFromPoints={positions.slice(0, Math.min(positions.length, 6)).map(
            p => new THREE.Vector3(p[0], p[1] - 0.1, p[2])
          )} />
          <lineBasicMaterial color="#ef4444" transparent opacity={0.12} />
        </line>
      )}
    </>
  )
}

export default ConnectionLines3D
