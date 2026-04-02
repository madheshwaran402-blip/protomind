import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'

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

function ComponentBox3D({ comp, position }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const color = CATEGORY_COLORS[comp.category] || '#64748b'

  useFrame((state) => {
    if (meshRef.current) {
      if (hovered) {
        meshRef.current.rotation.y += 0.02
      } else {
        meshRef.current.rotation.y *= 0.95
      }
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05
    }
  })

  const shortName = comp.name.length > 16
    ? comp.name.slice(0, 16) + '...'
    : comp.name

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[2, 0.5, 1.2]}
        radius={0.1}
        smoothness={4}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.15}
          roughness={0.2}
          metalness={0.7}
        />
      </RoundedBox>

      <Text
        position={[0, 0.55, 0]}
        fontSize={0.18}
        color={color}
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        {comp.category}
      </Text>

      <Text
        position={[0, -0.55, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
        renderOrder={1}
      >
        {shortName}
      </Text>

      <Text
        position={[0, 0, 0]}
        fontSize={0.28}
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        {comp.icon}
      </Text>
    </group>
  )
}

export default ComponentBox3D