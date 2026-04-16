export function exportAsOBJ(components, idea) {
  const lines = []
  lines.push('# ProtoMind OBJ Export')
  lines.push('# Idea: ' + idea)
  lines.push('# Generated: ' + new Date().toISOString())
  lines.push('')

  let vertexOffset = 1
  const cols = 3

  components.forEach((comp, index) => {
    const x = (index % cols) * 3 - 3
    const y = 0
    const z = Math.floor(index / cols) * 3 - 1.5

    const w = 1.0
    const h = 0.4
    const d = 0.8

    lines.push('# Component: ' + comp.name + ' (' + comp.category + ')')
    lines.push('o ' + comp.name.replace(/\s+/g, '_'))

    lines.push('v ' + (x - w) + ' ' + (y - h) + ' ' + (z - d))
    lines.push('v ' + (x + w) + ' ' + (y - h) + ' ' + (z - d))
    lines.push('v ' + (x + w) + ' ' + (y + h) + ' ' + (z - d))
    lines.push('v ' + (x - w) + ' ' + (y + h) + ' ' + (z - d))
    lines.push('v ' + (x - w) + ' ' + (y - h) + ' ' + (z + d))
    lines.push('v ' + (x + w) + ' ' + (y - h) + ' ' + (z + d))
    lines.push('v ' + (x + w) + ' ' + (y + h) + ' ' + (z + d))
    lines.push('v ' + (x - w) + ' ' + (y + h) + ' ' + (z + d))

    const o = vertexOffset
    lines.push('f ' + o + ' ' + (o+1) + ' ' + (o+2) + ' ' + (o+3))
    lines.push('f ' + (o+4) + ' ' + (o+7) + ' ' + (o+6) + ' ' + (o+5))
    lines.push('f ' + o + ' ' + (o+4) + ' ' + (o+5) + ' ' + (o+1))
    lines.push('f ' + (o+2) + ' ' + (o+6) + ' ' + (o+7) + ' ' + (o+3))
    lines.push('f ' + o + ' ' + (o+3) + ' ' + (o+7) + ' ' + (o+4))
    lines.push('f ' + (o+1) + ' ' + (o+5) + ' ' + (o+6) + ' ' + (o+2))
    lines.push('')

    vertexOffset += 8
  })

  const content = lines.join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_' + idea.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) + '.obj'
  link.click()
  URL.revokeObjectURL(url)
}

export function exportAsGLTF(components, idea) {
  const CATEGORY_COLORS = {
    Microcontroller: [0.4, 0.4, 0.9],
    Sensor: [0.0, 0.6, 0.9],
    Display: [0.1, 0.8, 0.3],
    Communication: [0.9, 0.2, 0.2],
    Power: [0.9, 0.6, 0.1],
    Actuator: [0.6, 0.2, 0.9],
    Module: [0.4, 0.5, 0.6],
    Memory: [0.4, 0.5, 0.6],
  }

  const cols = 3
  const meshes = []
  const materials = []
  const accessors = []
  const bufferViews = []
  const buffers = []

  const gltf = {
    asset: { version: '2.0', generator: 'ProtoMind' },
    scene: 0,
    scenes: [{ name: idea, nodes: components.map((_, i) => i) }],
    nodes: components.map((comp, i) => ({
      name: comp.name,
      mesh: i,
      translation: [
        (i % cols) * 3 - 3,
        0,
        Math.floor(i / cols) * 3 - 1.5,
      ],
    })),
    meshes: components.map((comp, i) => ({
      name: comp.name,
      primitives: [{
        attributes: { POSITION: i },
        material: i,
      }],
    })),
    materials: components.map(comp => {
      const color = CATEGORY_COLORS[comp.category] || [0.4, 0.5, 0.6]
      return {
        name: comp.name,
        pbrMetallicRoughness: {
          baseColorFactor: [...color, 1.0],
          metallicFactor: 0.1,
          roughnessFactor: 0.8,
        },
      }
    }),
  }

  const content = JSON.stringify(gltf, null, 2)
  const blob = new Blob([content], { type: 'model/gltf+json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_' + idea.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) + '.gltf'
  link.click()
  URL.revokeObjectURL(url)
}

export function estimate3DPrintCost(components, wallThickness = 2, material = 'pla') {
  const MATERIAL_PRICES = {
    pla: { pricePerKg: 20, density: 1.24 },
    petg: { pricePerKg: 25, density: 1.27 },
    abs: { pricePerKg: 22, density: 1.05 },
    tpu: { pricePerKg: 35, density: 1.21 },
  }

  const mat = MATERIAL_PRICES[material] || MATERIAL_PRICES.pla

  const baseVolumeCm3 = components.length * 8
  const wallVolumeCm3 = baseVolumeCm3 * (wallThickness / 10) * 2
  const totalVolumeCm3 = wallVolumeCm3 + 5

  const weightGrams = totalVolumeCm3 * mat.density
  const filamentCost = (weightGrams / 1000) * mat.pricePerKg
  const electricityCost = 0.50
  const totalCost = filamentCost + electricityCost

  const printTimeHours = totalVolumeCm3 / 8
  const printTimeMinutes = Math.round(printTimeHours * 60)

  return {
    weightGrams: Math.round(weightGrams),
    filamentCost: filamentCost.toFixed(2),
    electricityCost: electricityCost.toFixed(2),
    totalCost: totalCost.toFixed(2),
    printTimeMinutes,
    printTimeLabel: printTimeMinutes < 60
      ? printTimeMinutes + ' minutes'
      : Math.floor(printTimeMinutes / 60) + 'h ' + (printTimeMinutes % 60) + 'm',
    filamentLength: Math.round(weightGrams / 0.029),
    material: material.toUpperCase(),
  }
}