import * as THREE from 'three'

const CATEGORY_DIMENSIONS = {
  Microcontroller: { w: 5.5, h: 1.2, d: 4.3 },
  Sensor:          { w: 2.5, h: 0.8, d: 2.5 },
  Display:         { w: 4.0, h: 0.5, d: 3.0 },
  Communication:   { w: 2.5, h: 0.6, d: 1.5 },
  Power:           { w: 6.0, h: 2.0, d: 3.5 },
  Actuator:        { w: 3.5, h: 3.5, d: 3.5 },
  Module:          { w: 2.5, h: 0.6, d: 2.0 },
  Memory:          { w: 1.5, h: 0.3, d: 2.0 },
}

function generateSTLContent(components) {
  const geometries = []
  const cols = 3
  const spacing = 8

  components.forEach((comp, index) => {
    const dims = CATEGORY_DIMENSIONS[comp.category] || CATEGORY_DIMENSIONS.Module
    const x = (index % cols) * spacing - spacing
    const z = Math.floor(index / cols) * spacing - spacing

    const geometry = new THREE.BoxGeometry(dims.w, dims.h, dims.d)
    const matrix = new THREE.Matrix4()
    matrix.setPosition(x, dims.h / 2, z)
    geometry.applyMatrix4(matrix)
    geometries.push(geometry)

    // Add a small label base plate under each component
    const plateGeo = new THREE.BoxGeometry(dims.w + 0.5, 0.2, dims.d + 0.5)
    const plateMatrix = new THREE.Matrix4()
    plateMatrix.setPosition(x, 0.1, z)
    plateGeo.applyMatrix4(plateMatrix)
    geometries.push(plateGeo)
  })

  // Base board connecting all components
  const boardGeo = new THREE.BoxGeometry(
    cols * spacing - spacing / 2,
    0.3,
    Math.ceil(components.length / cols) * spacing - spacing / 2
  )
  const boardMatrix = new THREE.Matrix4()
  boardMatrix.setPosition(0, -0.15, 0)
  boardGeo.applyMatrix4(boardMatrix)
  geometries.push(boardGeo)

  // Merge all into one STL string
  let stl = 'solid ProtoMind_Export\n'

  geometries.forEach(geo => {
    const pos = geo.attributes.position
    const index = geo.index

    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i)
      const b = index.getX(i + 1)
      const c = index.getX(i + 2)

      const vA = new THREE.Vector3(pos.getX(a), pos.getY(a), pos.getZ(a))
      const vB = new THREE.Vector3(pos.getX(b), pos.getY(b), pos.getZ(b))
      const vC = new THREE.Vector3(pos.getX(c), pos.getY(c), pos.getZ(c))

      const edge1 = new THREE.Vector3().subVectors(vB, vA)
      const edge2 = new THREE.Vector3().subVectors(vC, vA)
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()

      stl += `  facet normal ${normal.x.toFixed(6)} ${normal.y.toFixed(6)} ${normal.z.toFixed(6)}\n`
      stl += `    outer loop\n`
      stl += `      vertex ${vA.x.toFixed(6)} ${vA.y.toFixed(6)} ${vA.z.toFixed(6)}\n`
      stl += `      vertex ${vB.x.toFixed(6)} ${vB.y.toFixed(6)} ${vB.z.toFixed(6)}\n`
      stl += `      vertex ${vC.x.toFixed(6)} ${vC.y.toFixed(6)} ${vC.z.toFixed(6)}\n`
      stl += `    endloop\n`
      stl += `  endfacet\n`
    }
  })

  stl += 'endsolid ProtoMind_Export\n'
  return stl
}

export function downloadSTL(components, ideaName) {
  const stlContent = generateSTLContent(components)
  const blob = new Blob([stlContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const fileName = ideaName
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 30)
  link.download = 'ProtoMind_' + fileName + '.stl'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}