import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box } from '@react-three/drei'

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

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1.8, 0.6, 1.2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.1}
          roughness={0.3}
          metalness={0.6}
        />
      </Box>

      {/* Component name below box */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {comp.name.length > 18 ? comp.name.slice(0, 18) + '...' : comp.name}
      </Text>

      {/* Category label above box */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {comp.category}
      </Text>
    </group>
  )
}

export default ComponentBox3D