import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Cylinder, Text } from '@react-three/drei'

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

const CATEGORY_EMISSIVE = {
  Microcontroller: '#1e1b4b',
  Sensor: '#0c2640',
  Display: '#0a2010',
  Communication: '#2d0a0a',
  Power: '#2d1a00',
  Actuator: '#1a0a2d',
  Module: '#1a2535',
  Memory: '#1a2535',
}

function MicrocontrollerShape({ color, emissive, hovered }) {
  return (
    <group>
      <RoundedBox args={[2, 0.25, 1.2]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={hovered ? '#818cf8' : color} emissive={emissive} emissiveIntensity={hovered ? 0.5 : 0.2} />
      </RoundedBox>
      {[-0.7, -0.3, 0.1, 0.5].map((x, i) => (
        <mesh key={'f' + i} position={[x, 0.18, 0.7]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
      ))}
      {[-0.7, -0.3, 0.1, 0.5].map((x, i) => (
        <mesh key={'b' + i} position={[x, 0.18, -0.7]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
      ))}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  )
}

function SensorShape({ color, emissive, hovered }) {
  return (
    <group>
      <Cylinder args={[0.55, 0.55, 0.4, 16]}>
        <meshStandardMaterial color={hovered ? '#38bdf8' : color} emissive={emissive} emissiveIntensity={hovered ? 0.6 : 0.3} />
      </Cylinder>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <mesh key={i} position={[Math.cos((deg * Math.PI) / 180) * 0.7, -0.3, Math.sin((deg * Math.PI) / 180) * 0.7]}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
      ))}
    </group>
  )
}

function DisplayShape({ color, emissive, hovered }) {
  return (
    <group>
      <RoundedBox args={[1.8, 0.1, 1.2]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#1a1a2e" />
      </RoundedBox>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.6, 0.05, 1.0]} />
        <meshStandardMaterial color={hovered ? '#4ade80' : color} emissive={emissive} emissiveIntensity={hovered ? 0.8 : 0.5} />
      </mesh>
      {[[-0.6, -0.55], [0.6, -0.55], [-0.6, 0.55], [0.6, 0.55]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.1, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.25, 6]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
      ))}
    </group>
  )
}

function CommunicationShape({ color, emissive, hovered }) {
  return (
    <group>
      <RoundedBox args={[1.4, 0.2, 1.0]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={hovered ? '#f87171' : color} emissive={emissive} emissiveIntensity={hovered ? 0.5 : 0.2} />
      </RoundedBox>
      <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, Math.PI / 12]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
      </mesh>
      <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
      </mesh>
    </group>
  )
}

function PowerShape({ color, emissive, hovered }) {
  return (
    <group>
      <RoundedBox args={[1.6, 0.6, 0.9]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={hovered ? '#fcd34d' : color} emissive={emissive} emissiveIntensity={hovered ? 0.5 : 0.2} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0.7, 0.35, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
      </mesh>
      <mesh position={[-0.7, 0.35, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  )
}

function ActuatorShape({ color, emissive, hovered }) {
  return (
    <group>
      <RoundedBox args={[1.2, 0.8, 1.2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={hovered ? '#c084fc' : color} emissive={emissive} emissiveIntensity={hovered ? 0.5 : 0.2} />
      </RoundedBox>
      <Cylinder args={[0.2, 0.2, 0.5, 16]} position={[0, 0.65, 0]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <mesh position={[0.8, 0, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  )
}

function DefaultShape({ color, emissive, hovered }) {
  return (
    <RoundedBox args={[1.4, 0.4, 1.0]} radius={0.08} smoothness={4}>
      <meshStandardMaterial color={hovered ? '#94a3b8' : color} emissive={emissive} emissiveIntensity={hovered ? 0.4 : 0.15} />
    </RoundedBox>
  )
}

function ComponentBox3D({ comp, position }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)

  const color = CATEGORY_COLORS[comp.category] || '#64748b'
  const emissive = CATEGORY_EMISSIVE[comp.category] || '#1a2535'

  useFrame((state) => {
    if (!groupRef.current) return
    if (hovered) {
      groupRef.current.rotation.y += 0.015
    } else {
      groupRef.current.rotation.y *= 0.95
    }
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.06
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
      {getShape()}
      <Text position={[0, 1.2, 0]} fontSize={0.22} color={hovered ? '#ffffff' : '#94a3b8'} anchorX="center" anchorY="middle" maxWidth={2.5}>
        {comp.name.length > 14 ? comp.name.slice(0, 14) + '...' : comp.name}
      </Text>
      <Text position={[0, -1.0, 0]} fontSize={0.18} color={color} anchorX="center" anchorY="middle">
        {comp.category}
      </Text>
      <Text position={[0, 1.55, 0]} fontSize={0.28} anchorX="center" anchorY="middle">
        {comp.icon}
      </Text>
    </group>
  )
}

export default ComponentBox3D