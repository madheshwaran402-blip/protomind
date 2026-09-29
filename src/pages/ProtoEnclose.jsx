import { useState, useEffect, useRef, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox, Cylinder, Sphere, Box } from '@react-three/drei'
import * as THREE from 'three'
import { notify } from '../services/toast'

// ─── ENCLOSURE TEMPLATES ──────────────────────────────────────────────────────
const ENCLOSURE_TYPES = {
  smartwatch: {
    label: 'Smartwatch', icon: '⌚',
    shape: 'watch', w: 4.5, h: 5.5, d: 1.2,
    displayW: 3.2, displayH: 3.8,
    color: '#1a1a2e', glassColor: '#0a0a2e',
    features: ['display_cutout', 'button_right', 'crown_right', 'sensor_bottom', 'strap_top', 'strap_bottom', 'charge_port'],
  },
  project_box: {
    label: 'Project Box', icon: '📦',
    shape: 'box', w: 8, h: 6, d: 3,
    displayW: 4, displayH: 3,
    color: '#2a2a2a', glassColor: '#1a1a3a',
    features: ['display_cutout', 'button_top', 'usb_side', 'led_front', 'vent_back'],
  },
  wearable_band: {
    label: 'Wearable Band', icon: '🏃',
    shape: 'band', w: 3, h: 7, d: 0.9,
    displayW: 2.4, displayH: 2.4,
    color: '#0d1117', glassColor: '#0a0a2e',
    features: ['display_cutout', 'button_side', 'charge_port', 'strap_top', 'strap_bottom'],
  },
  handheld: {
    label: 'Handheld Device', icon: '🎮',
    shape: 'handheld', w: 7, h: 12, d: 1.5,
    displayW: 5, displayH: 7,
    color: '#1a1a1a', glassColor: '#0a0a2e',
    features: ['display_cutout', 'button_right', 'usb_side', 'speaker_bottom'],
  },
  sensor_node: {
    label: 'Sensor Node', icon: '📡',
    shape: 'cylinder', w: 5, h: 5, d: 3,
    displayW: 2, displayH: 2,
    color: '#1a2a1a', glassColor: '#0a1a0a',
    features: ['led_top', 'charge_port', 'antenna_top', 'sensor_bottom'],
  },
  medical_device: {
    label: 'Medical Device', icon: '🏥',
    shape: 'rounded_box', w: 6, h: 9, d: 1.8,
    displayW: 4.5, displayH: 5,
    color: '#f0f0f0', glassColor: '#e8f0ff',
    features: ['display_cutout', 'button_right', 'charge_port', 'sensor_back'],
  },
}

// ─── AI ENCLOSURE GENERATOR ───────────────────────────────────────────────────
async function generateEnclosureAI(idea, components, ollamaUrl, model) {
  const compNames = components.map(function(c) { return c.name }).join(', ')
  const prompt = `You are a product designer. Based on this electronics project, suggest the best product enclosure.

Project: "${idea}"
Components: ${compNames}

Reply ONLY with this exact JSON (no other text):
{
  "enclosureType": "smartwatch",
  "productName": "Smart Health Watch",
  "tagline": "Your health, always on your wrist",
  "dimensions": {"width": 44, "height": 52, "depth": 12, "unit": "mm"},
  "material": "Aerospace-grade aluminum with Gorilla Glass",
  "color": "Midnight Black",
  "displayText": ["72 BPM", "98% SpO2", "36.5°C"],
  "internalComponents": [
    {"name": "ESP32", "position": "center-bottom", "hidden": true},
    {"name": "MAX30102", "position": "back-center", "visible_through": "heart_sensor_window"},
    {"name": "OLED", "position": "front-center", "visible_through": "display"},
    {"name": "LiPo Battery", "position": "bottom-half", "hidden": true}
  ],
  "externalFeatures": ["Gorilla Glass display", "Digital crown", "Side button", "Heart rate sensor window", "Magnetic charging port", "Silicone strap"],
  "manufacturingNotes": "IP67 water resistant. Injection molded polycarbonate body. Stainless steel frame.",
  "estimatedSize": "44 x 52 x 12mm"
}

Choose enclosureType from: smartwatch, project_box, wearable_band, handheld, sensor_node, medical_device`

  const r = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false })
  })
  const d = await r.json()
  const m = (d.response || '').match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON in response')
  return JSON.parse(m[0])
}

// ─── 3D WATCH ENCLOSURE ───────────────────────────────────────────────────────
function WatchEnclosure({ enclosureData, displayText, animating }) {
  const groupRef = useRef()
  const glowRef = useRef()
  const t = useRef(0)

  useFrame(function(_, delta) {
    t.current += delta
    if (groupRef.current && animating) {
      groupRef.current.rotation.y = Math.sin(t.current * 0.3) * 0.3
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + Math.sin(t.current * 2) * 0.1
    }
  })

  const enc = ENCLOSURE_TYPES[enclosureData?.enclosureType || 'smartwatch']
  const bodyColor = enclosureData?.color ? enclosureData.color.includes('Black') ? '#1a1a3e' : enclosureData.color.includes('White') ? '#e0e8ff' : enc.color : '#1a2040'

  return (
    <group ref={groupRef}>
      {/* Main watch body */}
      <RoundedBox args={[enc.w, enc.h, enc.d]} radius={0.6} smoothness={6} position={[0, 0, 0]}>
        <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.7}/>
      </RoundedBox>

      {/* Glass face */}
      <RoundedBox args={[enc.w - 0.3, enc.h - 0.3, 0.1]} radius={0.5} smoothness={6} position={[0, 0, enc.d / 2 + 0.05]}>
        <meshStandardMaterial color="#0a0a3a" roughness={0} metalness={0} transparent opacity={0.85} envMapIntensity={2}/>
      </RoundedBox>

      {/* OLED Display glow area */}
      <RoundedBox args={[enc.displayW, enc.displayH, 0.05]} radius={0.2} smoothness={4} position={[0, 0.1, enc.d / 2 + 0.12]}>
        <meshStandardMaterial color="#001133" emissive="#0033aa" emissiveIntensity={2.0} roughness={0} metalness={0}/>
      </RoundedBox>

      {/* Display light glow */}
      <RoundedBox ref={glowRef} args={[enc.displayW + 0.2, enc.displayH + 0.2, 0.02]} radius={0.2} position={[0, 0.1, enc.d / 2 + 0.09]}>
        <meshStandardMaterial color="#0044ff" emissive="#2266ff" emissiveIntensity={3} transparent opacity={0.5}/>
      </RoundedBox>

      {/* Display text lines */}
      {(displayText || ['-- BPM', '-- %', '--°C']).slice(0, 3).map(function(line, i) {
        const yPos = 0.8 - i * 0.75
        const isMain = i === 0
        return (
          <Text key={i} position={[0, yPos, enc.d / 2 + 0.2]} fontSize={isMain ? 0.45 : 0.28} color={isMain ? '#00ffff' : '#88ccff'} anchorX="center" anchorY="middle" font={undefined}>
            {line}
          </Text>
        )
      })}

      {/* Time display */}
      <Text position={[0, 1.7, enc.d / 2 + 0.2]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle">
        {new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
      </Text>

      {/* Product name */}
      <Text position={[0, -1.5, enc.d / 2 + 0.2]} fontSize={0.22} color="#4488aa" anchorX="center" anchorY="middle">
        {enclosureData?.productName?.slice(0, 16) || 'ProtoMind Watch'}
      </Text>

      {/* Digital crown / button */}
      <Cylinder args={[0.15, 0.15, 0.6, 12]} rotation={[0, 0, Math.PI / 2]} position={[enc.w / 2 + 0.3, 0.5, 0]}>
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.9}/>
      </Cylinder>
      <Cylinder args={[0.12, 0.12, 0.4, 12]} rotation={[0, 0, Math.PI / 2]} position={[enc.w / 2 + 0.3, -0.6, 0]}>
        <meshStandardMaterial color="#666666" roughness={0.3} metalness={0.9}/>
      </Cylinder>

      {/* Charging port */}
      <Box args={[0.8, 0.15, 0.3]} position={[0, -enc.h / 2 - 0.05, 0]}>
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.3}/>
      </Box>

      {/* Watch straps */}
      <RoundedBox args={[enc.w - 0.5, 3.5, enc.d - 0.3]} radius={0.3} smoothness={4} position={[0, enc.h / 2 + 2, 0]}>
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0}/>
      </RoundedBox>
      <RoundedBox args={[enc.w - 0.5, 3.5, enc.d - 0.3]} radius={0.3} smoothness={4} position={[0, -enc.h / 2 - 2, 0]}>
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0}/>
      </RoundedBox>

      {/* Strap clasp */}
      <Box args={[enc.w - 1, 0.3, enc.d - 0.2]} position={[0, -enc.h / 2 - 3.5, 0]}>
        <meshStandardMaterial color="#555555" roughness={0.3} metalness={0.8}/>
      </Box>

      {/* Back sensor window */}
      <Cylinder args={[0.4, 0.4, 0.1, 16]} position={[0, -0.5, -enc.d / 2 - 0.05]}>
        <meshStandardMaterial color="#002200" emissive="#004400" emissiveIntensity={0.5}/>
      </Cylinder>
      <Text position={[0, -1.2, -enc.d / 2 - 0.15]} fontSize={0.18} color="#444444" anchorX="center">
        HR SENSOR
      </Text>

      {/* Point light inside display */}
      <pointLight position={[0, 0.1, enc.d / 2 + 0.5]} intensity={8} color="#2255ff" distance={6}/>
      <pointLight position={[0, 0, 0]} intensity={1} color="#ffffff" distance={8}/>
      <pointLight position={[0, 0, -enc.d / 2 - 1]} intensity={0.5} color="#004400" distance={3}/>
    </group>
  )
}

// ─── 3D BOX ENCLOSURE ─────────────────────────────────────────────────────────
function BoxEnclosure({ enclosureData, displayText, animating }) {
  const groupRef = useRef()
  const t = useRef(0)

  useFrame(function(_, delta) {
    t.current += delta
    if (groupRef.current && animating) {
      groupRef.current.rotation.y = Math.sin(t.current * 0.3) * 0.25
    }
  })

  const enc = ENCLOSURE_TYPES.project_box

  return (
    <group ref={groupRef}>
      {/* Main box body */}
      <RoundedBox args={[enc.w, enc.h, enc.d]} radius={0.3} smoothness={4}>
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.4}/>
      </RoundedBox>

      {/* Display cutout */}
      <RoundedBox args={[enc.displayW + 0.2, enc.displayH + 0.2, 0.05]} radius={0.15} position={[-0.5, 0.5, enc.d / 2 + 0.05]}>
        <meshStandardMaterial color="#001133" emissive="#002266" emissiveIntensity={0.6}/>
      </RoundedBox>

      {/* Display text */}
      {(displayText || ['Sensor Ready', '25.3°C', '60% RH']).map(function(line, i) {
        return (
          <Text key={i} position={[-0.5, 0.8 - i * 0.6, enc.d / 2 + 0.12]} fontSize={0.28} color={i === 0 ? '#00ff88' : '#88ffcc'} anchorX="center">
            {line}
          </Text>
        )
      })}

      {/* Buttons */}
      {[-0.5, 0.5, 1.5].map(function(y, i) {
        return (
          <Cylinder key={i} args={[0.2, 0.2, 0.2, 12]} rotation={[Math.PI / 2, 0, 0]} position={[enc.w / 2 - 0.5, y, enc.d / 2 + 0.1]}>
            <meshStandardMaterial color={['#3333ff', '#ff3333', '#33ff33'][i]} roughness={0.4}/>
          </Cylinder>
        )
      })}

      {/* USB port */}
      <Box args={[0.6, 0.3, 0.2]} position={[0, -enc.h / 2 + 0.5, enc.d / 2 + 0.1]}>
        <meshStandardMaterial color="#111111" roughness={0.9}/>
      </Box>

      {/* LED indicators */}
      {[-1, 0, 1].map(function(x, i) {
        return (
          <Sphere key={i} args={[0.1, 8, 8]} position={[x * 0.4 + 2, enc.h / 2 - 0.5, enc.d / 2 + 0.1]}>
            <meshStandardMaterial color={['#00ff00', '#ffff00', '#ff0000'][i]} emissive={['#00ff00', '#ffff00', '#ff0000'][i]} emissiveIntensity={1}/>
          </Sphere>
        )
      })}

      <pointLight position={[-0.5, 0.5, enc.d / 2 + 1]} intensity={1.5} color="#0044ff" distance={3}/>
    </group>
  )
}

// ─── EXPLODED VIEW ────────────────────────────────────────────────────────────
function ExplodedView({ enclosureData, components, explodeAmount }) {
  const groupRef = useRef()
  const t = useRef(0)

  useFrame(function(_, delta) {
    t.current += delta
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })

  const layers = [
    { name: 'Top Cover', y: 2 + explodeAmount * 3, color: '#2a2a3a', args: [6, 0.3, 4] },
    { name: 'Display Glass', y: 1.5 + explodeAmount * 2, color: '#0a0a4a', args: [5, 0.1, 3.5], transparent: true, opacity: 0.6 },
    { name: 'OLED Screen', y: 1 + explodeAmount * 1.5, color: '#001133', args: [4, 0.2, 3], emissive: '#002266' },
    { name: 'Main PCB', y: 0 + explodeAmount * 0, color: '#1a4a1a', args: [5.5, 0.2, 3.5] },
    { name: 'Battery', y: -0.8 - explodeAmount * 1, color: '#2a2a6a', args: [4, 0.4, 2.5] },
    { name: 'Bottom Cover', y: -1.8 - explodeAmount * 2, color: '#2a2a3a', args: [6, 0.3, 4] },
  ]

  return (
    <group ref={groupRef}>
      {layers.map(function(layer, i) {
        return (
          <group key={i} position={[0, layer.y, 0]}>
            <Box args={layer.args}>
              <meshStandardMaterial
                color={layer.color}
                emissive={layer.emissive || '#000000'}
                emissiveIntensity={layer.emissive ? 0.5 : 0}
                transparent={layer.transparent}
                opacity={layer.opacity || 1}
                roughness={0.5}
                metalness={0.3}
              />
            </Box>
            <Text position={[layer.args[0] / 2 + 0.3, 0, 0]} fontSize={0.25} color="#88aacc" anchorX="left" anchorY="middle">
              {layer.name}
            </Text>
          </group>
        )
      })}

      {/* Component chips on PCB */}
      {components.slice(0, 5).map(function(comp, i) {
        const x = (i % 3 - 1) * 1.8
        const z = Math.floor(i / 3) * 1.5 - 0.5
        return (
          <group key={i} position={[x, explodeAmount * 0 + 0.2, z]}>
            <Box args={[0.8, 0.15, 0.8]}>
              <meshStandardMaterial color="#111" roughness={0.8}/>
            </Box>
            <Text position={[0, 0.15, 0]} fontSize={0.15} color="#00ff88" anchorX="center" anchorY="bottom">
              {comp.name?.slice(0, 8)}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

// ─── SCENE ────────────────────────────────────────────────────────────────────
function ProductScene({ enclosureData, displayText, components, viewMode, explodeAmount }) {
  const encType = enclosureData?.enclosureType || 'smartwatch'

  return (
    <>
      <ambientLight intensity={0.6}/>
      <hemisphereLight skyColor='#1a2a6c' groundColor='#050510' intensity={0.8}/>
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow/>
      <directionalLight position={[-5, 5, -5]} intensity={0.5}/>
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#ffffff"/>

      {viewMode === 'exploded' ? (
        <ExplodedView enclosureData={enclosureData} components={components} explodeAmount={explodeAmount}/>
      ) : encType === 'project_box' || encType === 'sensor_node' || encType === 'handheld' || encType === 'medical_device' ? (
        <BoxEnclosure enclosureData={enclosureData} displayText={displayText} animating={viewMode === 'product'}/>
      ) : (
        <WatchEnclosure enclosureData={enclosureData} displayText={displayText} animating={viewMode === 'product'}/>
      )}

      {/* Grid floor */}
      <gridHelper args={[30, 30, '#1a2040', '#0d1228']} position={[0, -8, 0]}/>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8.01, 0]}>
        <planeGeometry args={[40, 40]}/>
        <meshStandardMaterial color="#050a18" roughness={1} transparent opacity={0.8}/>
      </mesh>

      {/* Ambient particles / stars */}
      {Array.from({ length: 30 }).map(function(_, i) {
        return (
          <mesh key={i} position={[
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 30 - 5
          ]}>
            <sphereGeometry args={[0.04, 4, 4]}/>
            <meshBasicMaterial color="#6366f1" transparent opacity={Math.random() * 0.5 + 0.2}/>
          </mesh>
        )
      })}

      <OrbitControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={30} enablePan={true}/>
      <directionalLight position={[-10, 5, -5]} intensity={0.8} color="#4466ff"/>
      <directionalLight position={[10, -5, 10]} intensity={0.4} color="#ffffff"/>
    </>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProtoEnclose() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [enclosureData, setEnclosureData] = useState(null)
  const [idea, setIdea] = useState('')
  const [components, setComponents] = useState([])
  const [viewMode, setViewMode] = useState('product') // product | exploded | wireframe
  const [explodeAmount, setExplodeAmount] = useState(1)
  const [displayText, setDisplayText] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [customDisplay, setCustomDisplay] = useState('')

  useEffect(function() {
    try {
      const req = JSON.parse(localStorage.getItem('protomind_current_requirements') || '{}')
      if (req.idea) setIdea(req.idea)
      if (req.components) {
        setComponents(req.components)
        // Guess display text from components
        const hasOLED = req.components.some(function(c) { return c.name?.toLowerCase().includes('oled') || c.name?.toLowerCase().includes('display') })
        const hasHR = req.components.some(function(c) { return c.name?.toLowerCase().includes('max30') || c.name?.toLowerCase().includes('heart') })
        const hasTemp = req.components.some(function(c) { return c.name?.toLowerCase().includes('dht') || c.name?.toLowerCase().includes('temp') })
        const lines = []
        if (hasHR) lines.push('72 BPM ❤️')
        if (hasTemp) lines.push('36.5°C 🌡️')
        if (hasOLED && lines.length === 0) lines.push('ProtoMind', 'Ready ✓')
        if (lines.length === 0) lines.push('Hello!', 'ProtoMind')
        setDisplayText(lines)
      }
    } catch(e) {}
  }, [])

  async function generate() {
    if (!idea) { notify.warning('No project found. Complete ProtoSpec first.'); return }
    setLoading(true)
    try {
      const settings = localStorage.getItem('protomind_settings')
      const parsed = settings ? JSON.parse(settings) : {}
      const model = parsed.aiModel || 'llama3.2'
      const ollamaUrl = parsed.ollamaUrl || 'http://localhost:11434'
      const data = await generateEnclosureAI(idea, components, ollamaUrl, model)
      setEnclosureData(data)
      if (data.displayText) setDisplayText(data.displayText)
      notify.success('Enclosure generated!')
    } catch(e) {
      notify.error('AI failed — using default enclosure')
      // Default based on idea keywords
      const lower = idea.toLowerCase()
      let type = 'project_box'
      if (lower.includes('watch') || lower.includes('wrist') || lower.includes('wearable')) type = 'smartwatch'
      else if (lower.includes('medical') || lower.includes('health') || lower.includes('patient')) type = 'medical_device'
      else if (lower.includes('band') || lower.includes('fitness')) type = 'wearable_band'
      else if (lower.includes('sensor') || lower.includes('node') || lower.includes('iot')) type = 'sensor_node'
      setEnclosureData({
        enclosureType: type,
        productName: idea.split(' ').slice(0, 3).join(' '),
        tagline: 'Powered by ProtoMind',
        dimensions: { width: 44, height: 52, depth: 12, unit: 'mm' },
        material: 'ABS Plastic',
        externalFeatures: ['Display window', 'Side buttons', 'USB charging port'],
        manufacturingNotes: 'Standard injection molding process',
        estimatedSize: '44 x 52 x 12mm',
      })
    } finally {
      setLoading(false)
    }
  }

  function applyCustomType(typeId) {
    setSelectedType(typeId)
    setEnclosureData(function(prev) {
      return Object.assign({}, prev || {}, { enclosureType: typeId })
    })
  }

  const VIEW_MODES = [
    { id: 'product', label: 'Product View', icon: '📱', desc: 'Final product appearance' },
    { id: 'exploded', label: 'Exploded View', icon: '💥', desc: 'Layers separated' },
  ]

  return (
    <div className="h-screen bg-[#050510] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0a14] border-b border-[#1e1e2e] flex-shrink-0">
        <button onClick={function(){navigate('/viewer')}} className="text-slate-500 hover:text-white text-sm transition">← ProtoView</button>
        <div className="w-px h-5 bg-[#2e2e4e]"/>
        <span className="text-xl">📦</span>
        <div>
          <p className="text-white font-black text-sm">ProtoEnclose</p>
          <p className="text-slate-600 text-xs">AI Product Enclosure & Manufacturing View</p>
        </div>
        {idea && (
          <div className="flex items-center gap-1.5 ml-3 hidden sm:flex">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"/>
            <span className="text-slate-500 text-xs truncate max-w-48">{idea.slice(0, 45)}...</span>
          </div>
        )}
        <div className="flex-1"/>
        {/* View mode tabs */}
        <div className="flex gap-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl p-1">
          {VIEW_MODES.map(function(m) {
            return (
              <button key={m.id} onClick={function(){setViewMode(m.id)}} title={m.desc}
                className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (viewMode===m.id?'bg-indigo-600 text-white':'text-slate-500 hover:text-white')}>
                {m.icon} {m.label}
              </button>
            )
          })}
        </div>
        <button onClick={generate} disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center gap-2">
          {loading ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating...</> : <>✨ Generate Enclosure</>}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-64 bg-[#080814] border-r border-[#1e1e2e] flex flex-col overflow-y-auto flex-shrink-0">
          {/* Enclosure type */}
          <div className="p-3 border-b border-[#1e1e2e]">
            <p className="text-xs text-slate-600 uppercase tracking-wide mb-2">Enclosure Type</p>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(ENCLOSURE_TYPES).map(function(entry) {
                const id = entry[0], enc = entry[1]
                const isActive = (enclosureData?.enclosureType || selectedType) === id
                return (
                  <button key={id} onClick={function(){applyCustomType(id)}}
                    className={"p-2 rounded-xl border text-left transition " + (isActive?'border-indigo-500 bg-indigo-950':'border-[#2e2e4e] bg-[#0d0d1a] hover:border-indigo-800')}>
                    <div className="text-lg mb-0.5">{enc.icon}</div>
                    <p className="text-xs text-white font-medium leading-tight">{enc.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Explode control */}
          {viewMode === 'exploded' && (
            <div className="p-3 border-b border-[#1e1e2e]">
              <div className="flex justify-between mb-1">
                <p className="text-xs text-slate-500">Explode Amount</p>
                <span className="text-indigo-400 text-xs font-bold">{Math.round(explodeAmount * 100)}%</span>
              </div>
              <input type="range" min="0" max="3" step="0.1" value={explodeAmount}
                onChange={function(e){setExplodeAmount(parseFloat(e.target.value))}}
                className="w-full accent-indigo-500"/>
            </div>
          )}

          {/* Display text */}
          <div className="p-3 border-b border-[#1e1e2e]">
            <p className="text-xs text-slate-600 uppercase tracking-wide mb-2">Display Text</p>
            {displayText.map(function(line, i) {
              return (
                <input key={i} value={line}
                  onChange={function(e){ setDisplayText(function(prev){const n=[...prev];n[i]=e.target.value;return n}) }}
                  className="w-full mb-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500"/>
              )
            })}
            <button onClick={function(){setDisplayText(function(p){return [...p, 'New line']})}}
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-1">+ Add line</button>
          </div>

          {/* AI Result */}
          {enclosureData && (
            <div className="p-3 space-y-3">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Product</p>
                <p className="text-white font-bold text-sm">{enclosureData.productName}</p>
                <p className="text-slate-500 text-xs italic">{enclosureData.tagline}</p>
              </div>
              {enclosureData.dimensions && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Dimensions</p>
                  <p className="text-white text-xs">{enclosureData.estimatedSize || `${enclosureData.dimensions.width}x${enclosureData.dimensions.height}x${enclosureData.dimensions.depth}${enclosureData.dimensions.unit}`}</p>
                </div>
              )}
              {enclosureData.material && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Material</p>
                  <p className="text-white text-xs">{enclosureData.material}</p>
                </div>
              )}
              {enclosureData.externalFeatures && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Features</p>
                  {enclosureData.externalFeatures.map(function(f, i) {
                    return <p key={i} className="text-slate-400 text-xs flex gap-1 mb-0.5"><span className="text-indigo-500">›</span>{f}</p>
                  })}
                </div>
              )}
              {enclosureData.manufacturingNotes && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Manufacturing</p>
                  <p className="text-slate-400 text-xs">{enclosureData.manufacturingNotes}</p>
                </div>
              )}
              {enclosureData.internalComponents && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Internal Layout</p>
                  {enclosureData.internalComponents.map(function(c, i) {
                    return (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <div className={"w-1.5 h-1.5 rounded-full " + (c.hidden?'bg-slate-600':'bg-green-500')}/>
                        <span className="text-slate-400 text-xs">{c.name}</span>
                        <span className="text-slate-600 text-xs ml-auto">{c.position}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {!enclosureData && !loading && (
            <div className="p-4 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-slate-400 text-sm mb-1">No enclosure generated yet</p>
              <p className="text-slate-600 text-xs mb-3">Click "Generate Enclosure" to create an AI-designed product view</p>
              {!idea && (
                <button onClick={function(){navigate('/protospec')}}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold w-full">
                  Start with ProtoSpec →
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative">
          <Canvas shadows camera={{ position: [0, 2, 14], fov: 45 }} style={{ background: 'radial-gradient(ellipse at center, #111833 0%, #080d1a 50%, #030609 100%)' }}>
            <Suspense fallback={null}>
              <ProductScene
                enclosureData={enclosureData}
                displayText={displayText}
                components={components}
                viewMode={viewMode}
                explodeAmount={explodeAmount}
              />
            </Suspense>
          </Canvas>

          {/* Overlay hints */}
          {!enclosureData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-[#0a0a14] bg-opacity-90 border border-[#2e2e4e] rounded-2xl p-8">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-white font-black text-2xl mb-2">ProtoEnclose</p>
                <p className="text-slate-400 mb-4">AI generates a realistic 3D product enclosure<br/>based on your project and components</p>
                <p className="text-slate-600 text-sm">Click <span className="text-indigo-400 font-bold">✨ Generate Enclosure</span> to start</p>
              </div>
            </div>
          )}

          {/* Camera hint */}
          <div className="absolute bottom-4 right-4 text-slate-700 text-xs pointer-events-none">
            🖱️ Drag to rotate · Scroll to zoom · Right-drag to pan
          </div>

          {/* View mode badge */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <div className="flex items-center gap-2 bg-[#0a0a14] border border-[#2e2e4e] rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"/>
              <span className="text-purple-400 text-xs font-bold">
                {viewMode === 'product' ? 'PRODUCT VIEW' : 'EXPLODED VIEW'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
