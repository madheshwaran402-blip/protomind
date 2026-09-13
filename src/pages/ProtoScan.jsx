import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

const COMPONENT_DB = [
  { name:'Arduino Uno', category:'Microcontroller', voltage:'5V', interface:'USB/UART', pins:'14 digital, 6 analog', icon:'🔵', id:2 },
  { name:'Arduino Nano', category:'Microcontroller', voltage:'5V', interface:'USB/UART', pins:'14 digital, 8 analog', icon:'🔵', id:1 },
  { name:'ESP32', category:'Microcontroller', voltage:'3.3V', interface:'WiFi/BT/UART', pins:'34 GPIO', icon:'📡', id:3 },
  { name:'ESP8266 NodeMCU', category:'Microcontroller', voltage:'3.3V', interface:'WiFi/UART', pins:'11 GPIO', icon:'📡', id:4 },
  { name:'Raspberry Pi Pico', category:'Microcontroller', voltage:'3.3V', interface:'USB/UART', pins:'26 GPIO', icon:'🟢', id:5 },
  { name:'DHT22 Sensor', category:'Sensor', voltage:'3.3-5V', interface:'Single wire', pins:'VCC GND DATA', icon:'🌡️', id:6 },
  { name:'HC-SR04', category:'Sensor', voltage:'5V', interface:'GPIO', pins:'VCC GND TRIG ECHO', icon:'📡', id:8 },
  { name:'PIR Sensor', category:'Sensor', voltage:'5V', interface:'GPIO', pins:'VCC GND OUT', icon:'👁️', id:9 },
  { name:'OLED 128x64', category:'Display', voltage:'3.3V', interface:'I2C', pins:'VCC GND SDA SCL', icon:'🖥️', id:13 },
  { name:'LCD 16x2', category:'Display', voltage:'5V', interface:'I2C/Parallel', pins:'VCC GND SDA SCL', icon:'🖥️', id:14 },
  { name:'Servo SG90', category:'Actuator', voltage:'5V', interface:'PWM', pins:'VCC GND Signal', icon:'🔄', id:17 },
  { name:'L298N Motor Driver', category:'Actuator', voltage:'5-35V', interface:'GPIO/PWM', pins:'IN1 IN2 IN3 IN4 ENA ENB', icon:'⚙️', id:16 },
  { name:'HC-05 Bluetooth', category:'Communication', voltage:'3.3V', interface:'UART', pins:'VCC GND TX RX', icon:'📶', id:19 },
  { name:'Relay Module', category:'Module', voltage:'5V', interface:'GPIO', pins:'VCC GND IN', icon:'⚡', id:22 },
  { name:'MPU-6050', category:'Sensor', voltage:'3.3V', interface:'I2C', pins:'VCC GND SDA SCL INT', icon:'🎯', id:12 },
  { name:'MQ-135 Gas Sensor', category:'Sensor', voltage:'5V', interface:'Analog/GPIO', pins:'VCC GND AO DO', icon:'💨', id:10 },
  { name:'Soil Moisture Sensor', category:'Sensor', voltage:'3.3-5V', interface:'Analog', pins:'VCC GND AO', icon:'🌱', id:11 },
  { name:'RFID RC522', category:'Communication', voltage:'3.3V', interface:'SPI', pins:'VCC GND MISO MOSI SCK SDA RST', icon:'📶', id:25 },
  { name:'LM7805 Regulator', category:'Power', voltage:'Input 7-35V → 5V', interface:'None', pins:'Input GND Output', icon:'⚡', id:24 },
  { name:'Neopixel/WS2812', category:'Display', voltage:'5V', interface:'Single wire', pins:'VCC GND DIN', icon:'🌈', id:99 },
]

const CAT_COLORS = {
  Microcontroller:'#6366f1', Sensor:'#0ea5e9', Display:'#22c55e',
  Communication:'#ef4444', Power:'#f59e0b', Actuator:'#a855f7', Module:'#64748b'
}

async function identifyWithAI(imageBase64) {
  const settings = localStorage.getItem('protomind_settings')
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'

  // First try Anthropic API (claude-sonnet-4-6 has vision)
  const anthropicKey = settings ? JSON.parse(settings).anthropicKey : null

  if (anthropicKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
            },
            {
              type: 'text',
              text: 'Identify this electronics component. Reply ONLY with JSON: { "name": "...", "category": "...", "partNumber": "...", "voltage": "...", "interface": "...", "pins": "...", "confidence": 85, "description": "...", "useCase": "...", "howToConnect": "..." }'
            }
          ]
        }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  }

  // Fallback: use llama3.2 with text description (ask user to describe)
  const prompt = 'You are an electronics component identification expert. A user is showing you an unknown electronic component. Based on common components, suggest what it might be. Reply ONLY with JSON: { "name": "Arduino Uno", "category": "Microcontroller", "partNumber": "ATmega328P", "voltage": "5V", "interface": "USB/UART", "pins": "VCC GND D0-D13 A0-A5", "confidence": 70, "description": "Standard Arduino board", "useCase": "General purpose prototyping", "howToConnect": "Connect via USB" }'

  const r = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({model:'llama3.2', prompt, stream:false})
  })
  const d = await r.json()
  const m = d.response.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  return JSON.parse(m[0])
}

function ProtoScan() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()
  const [mode, setMode] = useState('upload') // upload | camera | result
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [history, setHistory] = useState(function() {
    try { return JSON.parse(localStorage.getItem('protoscan_history')||'[]') } catch { return [] }
  })
  const [dragOver, setDragOver] = useState(false)

  function loadImage(file) {
    if (!file || !file.type.startsWith('image/')) { notify.warning('Please upload an image file'); return }
    const reader = new FileReader()
    reader.onload = function(e) {
      setImage(e.target.result)
      // Extract base64 without data URL prefix
      const b64 = e.target.result.split(',')[1]
      setImageBase64(b64)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  function handleFileDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    loadImage(file)
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
        setMode('camera')
      }
    } catch(e) {
      notify.error('Camera access denied or not available')
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setImage(dataUrl)
    setImageBase64(dataUrl.split(',')[1])
    setResult(null)
    // Stop camera
    const stream = videoRef.current.srcObject
    if (stream) stream.getTracks().forEach(function(t){t.stop()})
    setCameraActive(false)
    setMode('upload')
  }

  async function handleIdentify() {
    if (!imageBase64) { notify.warning('Upload or capture a photo first'); return }
    setLoading(true)
    try {
      const identified = await identifyWithAI(imageBase64)

      // Try to match with our component DB
      const dbMatch = COMPONENT_DB.find(function(c) {
        return c.name.toLowerCase().includes(identified.name.toLowerCase()) ||
               identified.name.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
      })

      const fullResult = Object.assign({}, identified, {
        dbComponent: dbMatch || null,
        identifiedAt: new Date().toISOString()
      })

      setResult(fullResult)

      // Save to history
      const newHistory = [fullResult, ...history].slice(0,10)
      setHistory(newHistory)
      localStorage.setItem('protoscan_history', JSON.stringify(newHistory))

      notify.success('Component identified: ' + identified.name)
    } catch(e) {
      notify.error('Identification failed — check your API key or Ollama connection')
    } finally {
      setLoading(false)
    }
  }

  function handleAddToPrototype() {
    if (!result?.dbComponent) {
      notify.warning('Component not in database — start a new prototype with this component name')
      navigate('/wizard')
      return
    }
    // Save to pending additions
    const pending = JSON.parse(localStorage.getItem('protoscan_pending')||'[]')
    pending.push(result.dbComponent)
    localStorage.setItem('protoscan_pending', JSON.stringify(pending))
    notify.success('Added ' + result.name + ' — go to Home to build your prototype!')
    navigate('/')
  }

  const catColor = result ? (CAT_COLORS[result.category] || '#6366f1') : '#6366f1'

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Animated bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-600 opacity-4 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-600 opacity-4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <button onClick={function(){navigate('/')}} className="text-slate-500 hover:text-white text-sm mb-4 flex items-center gap-2">
            ← Home
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-3xl">
              📷
            </div>
            <div>
              <h1 className="text-3xl font-black">ProtoScan</h1>
              <p className="text-slate-400 text-sm">AI Component Photo Identification</p>
            </div>
          </div>
        </div>

        {/* Upload / Camera area */}
        {!result && (
          <div className="space-y-4">
            {/* Mode selector */}
            <div className="flex gap-2 bg-[#0d0d1a] rounded-xl p-1">
              <button onClick={function(){setMode('upload')}}
                className={"flex-1 py-2 rounded-lg text-sm font-medium transition " + (mode==='upload'?'bg-cyan-700 text-white':'text-slate-500 hover:text-white')}>
                📁 Upload Photo
              </button>
              <button onClick={function(){startCamera()}}
                className={"flex-1 py-2 rounded-lg text-sm font-medium transition " + (mode==='camera'?'bg-cyan-700 text-white':'text-slate-500 hover:text-white')}>
                📷 Use Camera
              </button>
            </div>

            {/* Camera view */}
            {mode === 'camera' && (
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <video ref={videoRef} className="w-full rounded-2xl" autoPlay playsInline />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <button onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white border-4 border-cyan-500 flex items-center justify-center text-2xl hover:scale-105 transition">
                    📷
                  </button>
                </div>
              </div>
            )}

            {/* Upload area */}
            {mode === 'upload' && (
              <div
                onDrop={handleFileDrop}
                onDragOver={function(e){e.preventDefault();setDragOver(true)}}
                onDragLeave={function(){setDragOver(false)}}
                onClick={function(){fileRef.current.click()}}
                className={"relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition " + (
                  dragOver ? 'border-cyan-500 bg-cyan-950' :
                  image ? 'border-cyan-700 bg-[#0d0d1a]' :
                  'border-[#2e2e4e] hover:border-cyan-700 bg-[#0d0d1a]'
                )}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={function(e){loadImage(e.target.files[0])}} />
                {image ? (
                  <div className="space-y-3">
                    <img src={image} alt="Component" className="max-h-72 mx-auto rounded-xl object-contain" />
                    <p className="text-cyan-400 text-sm">Photo loaded — click Identify to analyse</p>
                    <button onClick={function(e){e.stopPropagation();setImage(null);setImageBase64(null)}}
                      className="text-xs text-slate-500 hover:text-white">Remove</button>
                  </div>
                ) : (
                  <div>
                    <div className="text-6xl mb-4">📸</div>
                    <p className="text-white font-bold text-lg mb-1">Drop component photo here</p>
                    <p className="text-slate-500 text-sm mb-3">or click to browse</p>
                    <p className="text-slate-600 text-xs">Supports JPG, PNG, WEBP • Best results with clear, well-lit photos</p>
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
              <p className="text-cyan-400 text-xs font-semibold mb-2">📷 Tips for best results</p>
              <ul className="space-y-1">
                {[
                  'Good lighting — natural or bright indoor light',
                  'Focus on the component markings and text',
                  'Include the full component in frame',
                  'For ICs — capture the text printed on the chip',
                  'For modules — show the entire PCB',
                ].map(function(tip,i){return(
                  <li key={i} className="text-slate-400 text-xs flex gap-2">
                    <span className="text-cyan-600">•</span>{tip}
                  </li>
                )})}
              </ul>
            </div>

            {/* Identify button */}
            <button onClick={handleIdentify} disabled={loading || !imageBase64}
              className={"w-full py-4 rounded-2xl font-black text-lg transition " + (
                loading||!imageBase64
                  ? 'bg-[#1e1e2e] text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white'
              )}>
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analysing component...</span>
                </div>
              ) : '🔍 Identify Component'}
            </button>

            {/* API key notice */}
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3">
              <p className="text-yellow-400 text-xs font-semibold">Vision AI</p>
              <p className="text-slate-400 text-xs">For best accuracy, add an Anthropic API key in Settings (uses Claude Vision). Without it, ProtoMind uses a text-based AI guess.</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={function(){setResult(null)}}
                className="text-slate-500 hover:text-white text-sm flex items-center gap-1">
                ← Try another
              </button>
            </div>

            {/* Component card */}
            <div className="rounded-2xl border p-6" style={{backgroundColor:catColor+'15',borderColor:catColor+'40'}}>
              <div className="flex items-start gap-4">
                {image && (
                  <img src={image} alt="Component" className="w-24 h-24 rounded-xl object-cover shrink-0 border border-[#2e2e4e]" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-black text-2xl">{result.name}</p>
                    {result.confidence && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{backgroundColor:catColor+'30',color:catColor}}>
                        {result.confidence}% confident
                      </span>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full border"
                    style={{backgroundColor:catColor+'20',borderColor:catColor+'40',color:catColor}}>
                    {result.category}
                  </span>
                  {result.partNumber && (
                    <p className="text-slate-400 text-sm mt-1 font-mono">{result.partNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {label:'Voltage', value:result.voltage, icon:'⚡'},
                {label:'Interface', value:result.interface, icon:'🔌'},
                {label:'Pins', value:result.pins, icon:'📌'},
                {label:'Category', value:result.category, icon:'📦'},
              ].map(function(spec){return spec.value&&(
                <div key={spec.label} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-3">
                  <p className="text-slate-500 text-xs">{spec.icon} {spec.label}</p>
                  <p className="text-white font-medium text-sm mt-0.5">{spec.value}</p>
                </div>
              )})}
            </div>

            {/* Description */}
            {result.description && (
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
                <p className="text-slate-500 text-xs font-semibold mb-1">About</p>
                <p className="text-slate-300 text-sm">{result.description}</p>
              </div>
            )}

            {/* Use case */}
            {result.useCase && (
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
                <p className="text-slate-500 text-xs font-semibold mb-1">Common Use Cases</p>
                <p className="text-slate-300 text-sm">{result.useCase}</p>
              </div>
            )}

            {/* How to connect */}
            {result.howToConnect && (
              <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4">
                <p className="text-indigo-400 text-xs font-semibold mb-1">🔌 How to Connect</p>
                <p className="text-slate-300 text-sm">{result.howToConnect}</p>
              </div>
            )}

            {/* DB match notice */}
            {result.dbComponent ? (
              <div className="bg-green-950 border border-green-800 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">{result.dbComponent.icon}</span>
                <div>
                  <p className="text-green-400 text-xs font-semibold">Found in ProtoMind Database</p>
                  <p className="text-white text-sm">{result.dbComponent.name} — ready to add to prototype</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3">
                <p className="text-yellow-400 text-xs">Not in ProtoMind database — you can still start a project with this component name</p>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleAddToPrototype}
                className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition">
                + Add to Prototype
              </button>
              <button onClick={function(){
                navigate('/wizard', {state:{prefillIdea:'Build a project using '+result.name}})
              }}
                className="py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl font-medium text-sm transition">
                Start New Project →
              </button>
            </div>

            <button onClick={function(){setResult(null);setImage(null);setImageBase64(null)}}
              className="w-full py-2 text-slate-500 hover:text-white text-sm transition">
              Scan Another Component
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && !result && (
          <div className="mt-8">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Recent Scans</p>
            <div className="space-y-2">
              {history.slice(0,5).map(function(item,i){
                const color = CAT_COLORS[item.category]||'#6366f1'
                return(
                  <div key={i} onClick={function(){setResult(item)}}
                    className="flex items-center gap-3 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-3 cursor-pointer hover:border-indigo-500 transition">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{backgroundColor:color+'20'}}>
                      <span style={{color}}>{item.dbComponent?.icon||'📦'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{item.name}</p>
                      <p className="text-slate-500 text-xs">{item.category} • {new Date(item.identifiedAt).toLocaleDateString()}</p>
                    </div>
                    {item.confidence && <span className="text-xs" style={{color}}>{item.confidence}%</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProtoScan
