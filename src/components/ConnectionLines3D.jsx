import { } from 'react'
import * as THREE from 'three'

function ConnectionLines3D({ components, positions }) {
  const microcontroller = components.find(c => c.category === 'Microcontroller')
  if (!microcontroller) return null

  const mcIndex = components.findIndex(c => c.category === 'Microcontroller')
  const mcPos = positions[mcIndex]

  return (
    <>
      {components.map((comp, index) => {
        if (comp.category === 'Microcontroller') return null
        const pos = positions[index]

        const points = [
          new THREE.Vector3(...mcPos),
          new THREE.Vector3(...pos),
        ]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <line key={comp.id} geometry={geometry}>
            <lineBasicMaterial color="#2e2e4e" linewidth={1} />
          </line>
        )
      })}
    </>
  )
}

export default ConnectionLines3D