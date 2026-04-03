import * as THREE from 'three'

function addBox(stl, w, h, d, x, y, z) {
  const geo = new THREE.BoxGeometry(w, h, d)
  const matrix = new THREE.Matrix4()
  matrix.setPosition(x, y, z)
  geo.applyMatrix4(matrix)

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

  return stl
}

function generateEnclosureSTL(enclosureData, components) {
  const w = (enclosureData.dimensions?.width || 80) / 10
  const h = (enclosureData.dimensions?.height || 40) / 10
  const d = (enclosureData.dimensions?.depth || 30) / 10
  const t = 0.3 // wall thickness

  let stl = 'solid ProtoMind_Enclosure\n'

  // Bottom wall
  stl = addBox(stl, w, t, d, 0, 0, 0)
  // Top wall
  stl = addBox(stl, w, t, d, 0, h, 0)
  // Left wall
  stl = addBox(stl, t, h, d, -w / 2, h / 2, 0)
  // Right wall
  stl = addBox(stl, t, h, d, w / 2, h / 2, 0)
  // Back wall
  stl = addBox(stl, w, h, t, 0, h / 2, -d / 2)

  // Front panel (with cutouts represented as thinner sections)
  const features = enclosureData.features || []

  if (features.includes('screen_cutout')) {
    // Left side of front panel
    stl = addBox(stl, w * 0.25, h * 0.7, t, -w * 0.35, h / 2, d / 2)
    // Right side of front panel
    stl = addBox(stl, w * 0.25, h * 0.7, t, w * 0.35, h / 2, d / 2)
    // Top strip of front panel
    stl = addBox(stl, w, h * 0.15, t, 0, h * 0.925, d / 2)
    // Bottom strip
    stl = addBox(stl, w, h * 0.15, t, 0, h * 0.075, d / 2)
  } else {
    stl = addBox(stl, w, h, t, 0, h / 2, d / 2)
  }

  // Button holes on right side
  if (features.includes('button_holes')) {
    stl = addBox(stl, t, h * 0.08, d * 0.08, w / 2, h * 0.7, 0)
    stl = addBox(stl, t, h * 0.08, d * 0.08, w / 2, h * 0.55, 0)
  }

  // Port holes on bottom
  if (features.includes('port_holes')) {
    stl = addBox(stl, w * 0.15, t, d * 0.15, -w * 0.2, 0, 0)
    stl = addBox(stl, w * 0.1, t, d * 0.1, w * 0.2, 0, 0)
  }

  // Ventilation slots on sides
  if (features.includes('ventilation')) {
    for (let i = 0; i < 3; i++) {
      stl = addBox(stl, t, h * 0.06, d * 0.4, -w / 2, h * (0.3 + i * 0.2), 0)
    }
  }

  // Internal component mounts
  const cols = 3
  components.forEach((comp, index) => {
    const cx = (index % cols) * (w / cols) - w / 3
    const cz = Math.floor(index / cols) * (d / 2) - d / 4
    stl = addBox(stl, 0.3, 0.4, 0.3, cx, t + 0.2, cz)
  })

  stl += 'endsolid ProtoMind_Enclosure\n'
  return stl
}

function generateSimpleComponentSTL(components) {
  const cols = 3
  const spacing = 8
  let stl = 'solid ProtoMind_Layout\n'

  components.forEach((comp, index) => {
    const x = (index % cols) * spacing - spacing
    const z = Math.floor(index / cols) * spacing - spacing
    stl = addBox(stl, 4, 1, 3, x, 0.5, z)
    stl = addBox(stl, 4.5, 0.2, 3.5, x, 0.1, z)
  })

  stl = addBox(stl, cols * spacing - 2, 0.3, 2 * spacing - 2, 0, -0.15, 0)
  stl += 'endsolid ProtoMind_Layout\n'
  return stl
}

export function downloadSTL(components, ideaName, enclosureData) {
  const stlContent = enclosureData?.needs3DPrinting
    ? generateEnclosureSTL(enclosureData, components)
    : generateSimpleComponentSTL(components)

  const blob = new Blob([stlContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const fileName = ideaName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)
  link.download = 'ProtoMind_' + fileName + '.stl'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}