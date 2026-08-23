import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Cylinder, Text, Torus, Sphere } from '@react-three/drei'
import * as THREE from 'three'

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
  Memory: '#8b5cf6',
  Input: '#06b6d4',
  Output: '#f97316',
}

// PCB green board base
function PCBBoard({ width, depth }) {
  return (
    <group position={[0, -0.18, 0]}>
      {/* Main board */}
      <mesh>
        <boxGeometry args={[width, 0.12, depth]} />
        <meshStandardMaterial color="#1a4a2e" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Silkscreen layer - slightly lighter */}
      <mesh position={[0, 0.062, 0]}>
        <boxGeometry args={[width - 0.1, 0.001, depth - 0.1]} />
        <meshStandardMaterial color="#1f5233" />
      </mesh>
      {/* Copper traces - horizontal */}
      {[-0.8, -0.3, 0.2, 0.7].map((z, i) => (
        <mesh key={'th' + i} position={[0, 0.063, z * (depth / 2)]}>
          <boxGeometry args={[width * 0.9, 0.002, 0.02]} />
          <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Copper traces - vertical */}
      {[-0.6, -0.1, 0.4, 0.9].map((x, i) => (
        <mesh key={'tv' + i} position={[x * (width / 2), 0.063, 0]}>
          <boxGeometry args={[0.02, 0.002, depth * 0.85]} />
          <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Corner mounting holes */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={'hole' + i} position={[sx * (width / 2 - 0.3), 0.07, sz * (depth / 2 - 0.3)]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// Glowing LED indicator
function LED({ color, position, on = true }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current && on) {
      ref.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.4
    }
  })
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial ref={ref} color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  )
}

// IC chip shape (flat square chip)
function ICChip({ color, emissive, hovered, size = [0.8, 0.1, 0.8] }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={hovered ? '#818cf8' : '#1a1a2e'} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Chip marking circle */}
      <mesh position={[-size[0]/2 + 0.15, size[1]/2 + 0.001, -size[2]/2 + 0.15]}>
        <cylinderGeometry args={[0.06, 0.06, 0.002, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* Pins on all 4 sides */}
      {Array.from({length: 4}).map((_, side) => {
        const count = 4
        const angle = side * Math.PI / 2
        return Array.from({length: count}).map((_, j) => {
          const offset = (j - count/2 + 0.5) * (size[0] / count)
          const x = side === 0 ? offset : side === 2 ? offset : (side === 1 ? size[0]/2 + 0.08 : -size[0]/2 - 0.08)
          const z = side === 1 ? offset : side === 3 ? offset : (side === 0 ? size[2]/2 + 0.08 : -size[2]/2 - 0.08)
          return (
            <mesh key={side + '_' + j} position={[x, 0, z]}>
              <boxGeometry args={[0.04, 0.03, 0.04]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
            </mesh>
          )
        })
      })}
    </group>
  )
}

function MicrocontrollerShape({ color, emissive, hovered }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.emissiveIntensity = hovered ? 0.4 : 0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05
    }
  })
  return (
    <group>
      {/* Main board */}
      <mesh>
        <boxGeometry args={[2.2, 0.15, 1.3]} />
        <meshStandardMaterial color="#1a4a2e" roughness={0.7} />
      </mesh>
      {/* Main chip */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshStandardMaterial ref={ref} color={hovered ? '#818cf8' : color} emissive={emissive} emissiveIntensity={0.2} metalness={0.5} />
      </mesh>
      {/* Chip dot marker */}
      <mesh position={[-0.25, 0.18, -0.25]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* USB port */}
      <mesh position={[1.15, 0.1, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.35]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Pin headers left */}
      {Array.from({length: 7}).map((_, i) => (
        <mesh key={'pl' + i} position={[-0.8 + i * 0.22, 0.18, 0.65]}>
          <cylinderGeometry args={[0.04, 0.04, 0.22, 6]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
        </mesh>
      ))}
      {/* Pin headers right */}
      {Array.from({length: 7}).map((_, i) => (
        <mesh key={'pr' + i} position={[-0.8 + i * 0.22, 0.18, -0.65]}>
          <cylinderGeometry args={[0.04, 0.04, 0.22, 6]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
        </mesh>
      ))}
      {/* Status LEDs */}
      <LED color="#22c55e" position={[0.9, 0.18, 0.4]} />
      <LED color="#f59e0b" position={[0.9, 0.18, 0.15]} on={hovered} />
      {/* Reset button */}
      <mesh position={[-0.9, 0.18, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}

function SensorShape({ color, emissive, hovered }) {
  const pulseRef = useRef()
  useFrame((state) => {
    if (pulseRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08
      pulseRef.current.scale.set(s, 1, s)
      pulseRef.current.material.opacity = 0.3 - Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
  })
  return (
    <group>
      {/* PCB base */}
      <mesh>
        <boxGeometry args={[1.1, 0.12, 1.1]} />
        <meshStandardMaterial color="#1a4a2e" roughness={0.7} />
      </mesh>
      {/* Sensor element */}
      <Cylinder args={[0.3, 0.3, 0.25, 16]} position={[0, 0.18, 0]}>
        <meshStandardMaterial color={hovered ? '#38bdf8' : color} emissive={emissive} emissiveIntensity={hovered ? 0.6 : 0.3} metalness={0.4} />
      </Cylinder>
      {/* Sensor lens */}
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.15, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a2a3e" metalness={0.8} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Detection wave pulse */}
      <mesh ref={pulseRef} position={[0, 0.35, 0]}>
        <torusGeometry args={[0.4, 0.02, 8, 24]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {/* Pins */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, -0.15, -0.55]}>
          <cylinderGeometry args={[0.035, 0.035, 0.3, 6]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
        </mesh>
      ))}
      <LED color={color} position={[0.35, 0.14, 0.35]} />
    </group>
  )
}

function DisplayShape({ color, emissive, hovered }) {
  const screenRef = useRef()
  useFrame((state) => {
    if (screenRef.current) {
      screenRef.current.emissiveIntensity = hovered ? 0.9 : 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  return (
    <group>
      {/* PCB base */}
      <mesh>
        <boxGeometry args={[2.0, 0.1, 1.4]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
      {/* Screen bezel */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.85, 0.08, 1.25]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.7, 0.02, 1.1]} />
        <meshStandardMaterial ref={screenRef} color={hovered ? '#4ade80' : color} emissive={hovered ? '#4ade80' : color} emissiveIntensity={0.5} />
      </mesh>
      {/* Pixel grid effect */}
      {[[-0.4, 0.2], [0, 0.2], [0.4, 0.2], [-0.4, -0.1], [0, -0.1], [0.4, -0.1]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]}>
          <boxGeometry args={[0.25, 0.01, 0.12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
      ))}
      {/* Corner pins */}
      {[[-0.8, -0.55], [0.8, -0.55], [-0.8, 0.55], [0.8, 0.55]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.12, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.28, 6]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function CommunicationShape({ color, emissive, hovered }) {
  const ant1 = useRef()
  const ant2 = useRef()
  useFrame((state) => {
    const wave = Math.sin(state.clock.elapsedTime * 4) * 0.1
    if (ant1.current) ant1.current.rotation.z = Math.PI / 12 + wave
    if (ant2.current) ant2.current.rotation.z = -Math.PI / 12 - wave
  })
  return (
    <group>
      {/* Module board */}
      <mesh>
        <boxGeometry args={[1.6, 0.12, 1.0]} />
        <meshStandardMaterial color="#1a4a2e" roughness={0.7} />
      </mesh>
      {/* Main chip */}
      <ICChip color={color} emissive={emissive} hovered={hovered} size={[0.7, 0.08, 0.5]} />
      {/* Shield/metal cover */}
      <mesh position={[0.15, 0.15, 0]}>
        <boxGeometry args={[0.9, 0.18, 0.7]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Antenna 1 */}
      <group ref={ant1} position={[0.6, 0.3, 0.3]}>
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 1.0, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
        </mesh>
      </group>
      {/* Antenna 2 */}
      <group ref={ant2} position={[0.6, 0.3, -0.3]}>
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 1.0, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
        </mesh>
      </group>
      <LED color={hovered ? color : '#ef4444'} position={[-0.55, 0.14, 0.35]} />
      <LED color="'#22c55e'" position={[-0.55, 0.14, 0.0]} on={hovered} />
    </group>
  )
}

function PowerShape({ color, emissive, hovered }) {
  const chargeRef = useRef()
  useFrame((state) => {
    if (chargeRef.current) {
      chargeRef.current.emissiveIntensity = 0.3 + Math.abs(Math.sin(state.clock.elapsedTime * 0.8)) * 0.4
    }
  })
  return (
    <group>
      {/* Battery cell body */}
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 1.8, 20]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color={hovered ? '#fcd34d' : color} emissive={emissive} emissiveIntensity={hovered ? 0.5 : 0.2} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Positive terminal */}
      <mesh position={[0.95, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Negative terminal */}
      <mesh position={[-0.95, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.06, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      {/* Charge indicator strip */}
      <mesh ref={chargeRef} position={[0, 0, 0.52]}>
        <boxGeometry args={[1.2, 0.15, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.9} />
      </mesh>
      {/* Label band */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 1.2, 20]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function ActuatorShape({ color, emissive, hovered }) {
  const shaftRef = useRef()
  useFrame((state) => {
    if (shaftRef.current && hovered) {
      shaftRef.current.rotation.y += 0.05
    }
  })
  return (
    <group>
      {/* Motor body */}
      <Cylinder args={[0.6, 0.6, 1.4, 20]}>
        <meshStandardMaterial color={hovered ? '#c084fc' : color} emissive={emissive} emissiveIntensity={hovered ? 0.5 : 0.2} metalness={0.5} roughness={0.3} />
      </Cylinder>
      {/* Motor endcap */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.12, 20]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rotating shaft */}
      <group ref={shaftRef} position={[0, 0.9, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 12]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* D-shaft flat */}
        <mesh position={[0.08, 0.15, 0]}>
          <boxGeometry args={[0.04, 0.3, 0.12]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} />
        </mesh>
      </group>
      {/* Mounting tabs */}
      {[0, Math.PI].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.6, -0.5, 0]} rotation={[0, 0, angle]}>
          <boxGeometry args={[0.35, 0.15, 0.25]} />
          <meshStandardMaterial color="#555" metalness={0.7} />
        </mesh>
      ))}
      {/* Wire leads */}
      {[-0.15, 0.15].map((z, i) => (
        <mesh key={i} position={[0, -0.8, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
          <meshStandardMaterial color={i === 0 ? '#ef4444' : '#1a1a2e'} />
        </mesh>
      ))}
    </group>
  )
}

function MemoryShape({ color, emissive, hovered }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.6, 0.08, 0.6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Memory chips row */}
      {[-0.4, 0.1, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.09, 0]}>
          <boxGeometry args={[0.38, 0.08, 0.48]} />
          <meshStandardMaterial color={hovered ? '#a78bfa' : color} emissive={emissive} emissiveIntensity={hovered ? 0.4 : 0.15} metalness={0.6} />
        </mesh>
      ))}
      {/* Gold contact fingers */}
      {Array.from({length: 10}).map((_, i) => (
        <mesh key={i} position={[-0.72 + i * 0.16, -0.02, 0.28]}>
          <boxGeometry args={[0.08, 0.1, 0.22]} />
          <meshStandardMaterial color="#b8860b" metalness={0.95} roughness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

function DefaultShape({ color, emissive, hovered }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.2, 0.1, 0.9]} />
        <meshStandardMaterial color="#1a4a2e" roughness={0.7} />
      </mesh>
      <ICChip color={color} emissive={emissive} hovered={hovered} size={[0.6, 0.09, 0.5]} />
      <LED color={color} position={[0.4, 0.14, 0.3]} />
    </group>
  )
}

function ComponentBox3D({ comp, position }) {
  const groupRef = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)

  const color = CATEGORY_COLORS[comp.category] || '#64748b'
  const emissive = color

  useFrame((state) => {
    if (!groupRef.current) return
    // Gentle float
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0] * 0.5) * 0.08
    // Hover rotate
    if (hovered) {
      groupRef.current.rotation.y += 0.008
    } else {
      groupRef.current.rotation.y *= 0.96
    }
    // Glow pulse
    if (glowRef.current) {
      glowRef.current.opacity = hovered ? 0.18 : 0.06 + Math.sin(state.clock.elapsedTime * 1.2 + position[0]) * 0.03
    }
  })

  function getShape() {
    const props = { color, emissive, hovered }
    switch (comp.category) {
      case 'Microcontroller': return <MicrocontrollerShape {...props} />
      case 'Sensor': return <SensorShape {...props} />
      case 'Display': return <DisplayShape {...props} />
      case 'Communication': return <CommunicationShape {...props} />
      case 'Power': return <PowerShape {...props} />
      case 'Actuator': return <ActuatorShape {...props} />
      case 'Memory': return <MemoryShape {...props} />
      default: return <DefaultShape {...props} />
    }
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Glow halo beneath */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 24]} />
        <meshStandardMaterial ref={glowRef} color={color} transparent opacity={0.08} />
      </mesh>

      {getShape()}

      {/* Hover highlight ring */}
      {hovered && (
        <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.0, 24]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Component name - always faces camera */}
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.2}
        color={hovered ? '#ffffff' : '#e2e8f0'}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.8}
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {comp.name.length > 16 ? comp.name.slice(0, 16) + '…' : comp.name}
      </Text>
      <Text
        position={[0, 1.1, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        {comp.category}
      </Text>
      <Text
        position={[0, 1.7, 0]}
        fontSize={0.32}
        anchorX="center"
        anchorY="middle"
      >
        {comp.icon}
      </Text>
    </group>
  )
}

export default ComponentBox3D
