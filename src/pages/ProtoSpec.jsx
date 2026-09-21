import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notify } from '../services/toast'

const STEPS = [
  { id: 'idea', label: 'Idea', icon: '💡' },
  { id: 'requirements', label: 'Requirements', icon: '📋' },
  { id: 'components', label: 'Components', icon: '🧩' },
]

const COMPONENT_DB = [
  { id:1, name:'Arduino Uno', icon:'🔵', category:'Microcontroller', price:'$10-25', voltage:'5V' },
  { id:2, name:'Arduino Nano', icon:'🔵', category:'Microcontroller', price:'$5-12', voltage:'5V' },
  { id:3, name:'ESP32', icon:'📡', category:'Microcontroller', price:'$4-10', voltage:'3.3V' },
  { id:4, name:'ESP8266', icon:'📡', category:'Microcontroller', price:'$2-6', voltage:'3.3V' },
  { id:5, name:'Raspberry Pi Pico', icon:'🟢', category:'Microcontroller', price:'$4-8', voltage:'3.3V' },
  { id:6, name:'DHT22 Sensor', icon:'🌡️', category:'Sensor', price:'$2-5', voltage:'3.3-5V' },
  { id:7, name:'DHT11 Sensor', icon:'🌡️', category:'Sensor', price:'$1-3', voltage:'3.3-5V' },
  { id:8, name:'HC-SR04 Ultrasonic', icon:'📡', category:'Sensor', price:'$1-3', voltage:'5V' },
  { id:9, name:'PIR Motion Sensor', icon:'👁️', category:'Sensor', price:'$1-4', voltage:'5V' },
  { id:10, name:'Soil Moisture Sensor', icon:'🌱', category:'Sensor', price:'$1-3', voltage:'3.3-5V' },
  { id:11, name:'MPU-6050 Gyro', icon:'🎯', category:'Sensor', price:'$1-4', voltage:'3.3V' },
  { id:12, name:'MQ-135 Gas', icon:'💨', category:'Sensor', price:'$2-5', voltage:'5V' },
  { id:13, name:'OLED 128x64', icon:'🖥️', category:'Display', price:'$3-8', voltage:'3.3V' },
  { id:14, name:'LCD 16x2 I2C', icon:'🖥️', category:'Display', price:'$2-6', voltage:'5V' },
  { id:15, name:'TFT 2.4"', icon:'🖥️', category:'Display', price:'$5-15', voltage:'3.3V' },
  { id:16, name:'L298N Motor Driver', icon:'⚙️', category:'Actuator', price:'$2-6', voltage:'5-35V' },
  { id:17, name:'Servo SG90', icon:'🔄', category:'Actuator', price:'$1-4', voltage:'5V' },
  { id:18, name:'Relay Module', icon:'⚡', category:'Module', price:'$1-3', voltage:'5V' },
  { id:19, name:'HC-05 Bluetooth', icon:'📶', category:'Communication', price:'$3-8', voltage:'3.3V' },
  { id:20, name:'LoRa SX1278', icon:'📡', category:'Communication', price:'$5-15', voltage:'3.3V' },
  { id:21, name:'RFID RC522', icon:'📶', category:'Communication', price:'$2-5', voltage:'3.3V' },
  { id:22, name:'LiPo 3.7V', icon:'🔋', category:'Power', price:'$3-10', voltage:'3.7V' },
  { id:23, name:'LM7805 Regulator', icon:'⚡', category:'Power', price:'$0.5-2', voltage:'5V' },
  { id:24, name:'Neopixel WS2812', icon:'🌈', category:'Module', price:'$2-8', voltage:'5V' },
  { id:25, name:'MAX30102 Heart Rate', icon:'❤️', category:'Sensor', price:'$3-8', voltage:'3.3V' },
]

const COMM_OPTIONS = [
  {id:'wifi',label:'Wi-Fi',icon:'📶'},{id:'bluetooth',label:'Bluetooth',icon:'🔵'},
  {id:'lora',label:'LoRa',icon:'📡'},{id:'gsm',label:'GSM/4G',icon:'📱'},
  {id:'zigbee',label:'Zigbee',icon:'⚡'},{id:'none',label:'None',icon:'🚫'},
]
const POWER_OPTIONS = [
  {id:'battery',label:'Battery',icon:'🔋'},{id:'usb',label:'USB',icon:'🔌'},
  {id:'adapter',label:'AC Adapter',icon:'🔌'},{id:'solar',label:'Solar',icon:'☀️'},
]
const SKILL_LEVELS = [
  {id:'beginner',label:'Beginner',desc:'New to electronics',icon:'🌱',color:'#22c55e'},
  {id:'intermediate',label:'Intermediate',desc:'Comfortable with Arduino',icon:'⚡',color:'#f59e0b'},
  {id:'advanced',label:'Advanced',desc:'PCB design, embedded',icon:'🚀',color:'#6366f1'},
]

function MultiChip({ options, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(function(opt) {
        const isSel = selected.includes(opt.id)
        return (
          <button key={opt.id} type="button"
            onClick={function() { onChange(isSel ? selected.filter(function(s){return s!==opt.id}) : [...selected,opt.id]) }}
            className={"px-3 py-2 rounded-xl border-2 text-sm font-medium transition flex items-center gap-1.5 " + (isSel ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0d0d1a] border-[#2e2e4e] text-slate-400 hover:border-indigo-500 hover:text-white')}>
            <span>{opt.icon}</span><span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function ProtoSpec() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedComponents, setSelectedComponents] = useState([])

  const [form, setForm] = useState({
    idea: location.state?.prefillIdea || '',
    purpose: '', users: '',
    communication: [], power: [],
    hasDisplay: '', hasMobileApp: '',
    parameters: '', budget: '', skillLevel: '',
    existingComponents: '', additionalInfo: '',
    months: 2, hoursPerDay: 2,
    workingDays: ['mon','tue','wed','thu','fri'],
    startDate: new Date().toISOString().split('T')[0],
  })

  function update(key, val) {
    setForm(function(prev) {
      const next = Object.assign({}, prev, {[key]: val})
      try { localStorage.setItem('protomind_wizard_draft', JSON.stringify(next)) } catch(e) {}
      return next
    })
  }

  useEffect(function() {
    try {
      const draft = localStorage.getItem('protomind_wizard_draft')
      if (draft) { const p = JSON.parse(draft); if (p.idea) setForm(p) }
    } catch(e) {}
  }, [])

  const categories = ['All', ...new Set(COMPONENT_DB.map(function(c){return c.category}))]
  const filtered = COMPONENT_DB.filter(function(c) {
    const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = activeCategory === 'All' || c.category === activeCategory
    return matchSearch && matchCat
  })

  function toggleComp(comp) {
    setSelectedComponents(function(prev) {
      if (prev.find(function(c){return c.id===comp.id})) return prev.filter(function(c){return c.id!==comp.id})
      if (prev.length >= 12) { notify.warning('Max 12 components'); return prev }
      return [...prev, comp]
    })
  }

  async function handleAIPick() {
    if (!form.idea.trim()) { notify.warning('Describe your idea first'); return }
    setLoading(true)
    try {
      const settings = localStorage.getItem('protomind_settings')
      const model = settings ? (JSON.parse(settings).aiModel||'llama3.2') : 'llama3.2'
      const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl||'http://localhost:11434') : 'http://localhost:11434'
      const prompt = 'Select the best components for: ' + form.idea + '. Communication: ' + form.communication.join(',') + '. Power: ' + form.power.join(',') + '. Reply ONLY with JSON: { "ids": [1,3,6] } — choose from IDs 1-25.'
      const r = await fetch(ollamaUrl + '/api/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false})})
      const d = await r.json()
      const m = d.response.match(/\{[\s\S]*\}/)
      if (m) {
        const result = JSON.parse(m[0])
        const picked = COMPONENT_DB.filter(function(c){return (result.ids||[]).includes(c.id)})
        setSelectedComponents(picked)
        notify.success('AI picked ' + picked.length + ' components!')
      }
    } catch(e) { notify.error('AI failed — pick manually below') }
    finally { setLoading(false) }
  }

  async function handleContinue() {
    if (selectedComponents.length === 0) { notify.warning('Select at least one component'); return }
    const requirements = {
      idea: form.idea, purpose: form.purpose, users: form.users,
      communication: form.communication, power: form.power,
      hasDisplay: form.hasDisplay, hasMobileApp: form.hasMobileApp,
      parameters: form.parameters, budget: form.budget,
      skillLevel: form.skillLevel, existingComponents: form.existingComponents,
      additionalInfo: form.additionalInfo,
      components: selectedComponents,
      timeline: { months: form.months, hoursPerDay: form.hoursPerDay, workingDays: form.workingDays, startDate: form.startDate },
    }
    try {
      localStorage.setItem('protomind_current_requirements', JSON.stringify(requirements))
      localStorage.removeItem('protomind_wizard_draft')
      // Save to all projects
      const allRaw = localStorage.getItem('protomind_all_projects')
      const all = allRaw ? JSON.parse(allRaw) : []
      const exists = all.findIndex(function(p){return p.idea===form.idea})
      const proj = { id: Date.now().toString(), idea: form.idea, selectedComponents, requirements, createdAt: new Date().toISOString() }
      if (exists >= 0) all[exists] = proj; else all.unshift(proj)
      localStorage.setItem('protomind_all_projects', JSON.stringify(all))
    } catch(e) {}
    // Check if roadmap exists
    const roadmapKey = 'protomind_roadmap_' + btoa(form.idea.slice(0,50)).slice(0,20)
    const hasRoadmap = !!localStorage.getItem(roadmapKey)
    if (hasRoadmap) {
      navigate('/viewer', { state: { idea: form.idea, selectedComponents, requirements } })
    } else {
      navigate('/roadmap', { state: { requirements, idea: form.idea, selectedComponents, fromSpec: true } })
    }
  }

  const DAYS_MAP = [{id:'mon',l:'Mon'},{id:'tue',l:'Tue'},{id:'wed',l:'Wed'},{id:'thu',l:'Thu'},{id:'fri',l:'Fri'},{id:'sat',l:'Sat'},{id:'sun',l:'Sun'}]
  const totalHours = Math.round(form.months * 30 * form.workingDays.length / 7 * form.hoursPerDay)

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 opacity-5 rounded-full blur-3xl animate-pulse"/>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600 opacity-5 rounded-full blur-3xl"/>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-4 py-1.5 text-indigo-400 text-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"/>
            ProtoSpec — Requirements Intelligence
          </div>
          <h1 className="text-4xl font-black mb-2">Build Your Prototype Right</h1>
          <p className="text-slate-400">ProtoMind needs to understand your project before generating anything.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map(function(s, i) {
            const done = i < step, active = i === step
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={"w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all " + (done?'bg-green-600 text-white':active?'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#050510]':'bg-[#1e1e2e] text-slate-500')}>
                  {done ? '✓' : s.icon}
                </div>
                <span className={"text-xs " + (active?'text-white font-medium':done?'text-green-400':'text-slate-600')}>{s.label}</span>
                {i < STEPS.length-1 && <div className={"w-8 h-0.5 " + (done?'bg-green-600':'bg-[#1e1e2e]')}/>}
              </div>
            )
          })}
        </div>

        {/* ── STEP 0: IDEA ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">What do you want to build?</h2>
              <p className="text-slate-500 text-sm mb-4">Be specific — the more detail, the better the AI output.</p>
              <textarea value={form.idea} onChange={function(e){update('idea',e.target.value)}}
                placeholder="Example: A smart plant watering system that monitors soil moisture and automatically waters plants when dry, sends alerts to my phone via WiFi..."
                className="w-full h-32 bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder:text-slate-600"/>
              <p className="text-slate-600 text-xs mt-2">{form.idea.length} characters — aim for 100+</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2">Main Purpose</h3>
                <input value={form.purpose} onChange={function(e){update('purpose',e.target.value)}}
                  placeholder="What problem does it solve?" className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"/>
              </div>
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2">Who Uses It?</h3>
                <input value={form.users} onChange={function(e){update('users',e.target.value)}}
                  placeholder="Target users or audience" className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"/>
              </div>
            </div>
            <button onClick={function(){if(!form.idea.trim()){notify.warning('Describe your idea');return}setStep(1)}}
              disabled={form.idea.length < 10}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-black text-lg transition disabled:opacity-40">
              Continue → Requirements
            </button>
          </div>
        )}

        {/* ── STEP 1: REQUIREMENTS ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Communication</h2>
              <MultiChip options={COMM_OPTIONS} selected={form.communication} onChange={function(v){update('communication',v)}}/>
            </div>
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Power Source</h2>
              <MultiChip options={POWER_OPTIONS} selected={form.power} onChange={function(v){update('power',v)}}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">Display?</h3>
                <div className="flex gap-2">
                  {['Yes','No','Maybe'].map(function(o){return(
                    <button key={o} onClick={function(){update('hasDisplay',o)}} className={"flex-1 py-2 rounded-xl border-2 text-xs font-bold transition " + (form.hasDisplay===o?'bg-indigo-600 border-indigo-500 text-white':'bg-[#050510] border-[#2e2e4e] text-slate-400 hover:border-indigo-500')}>{o}</button>
                  )})}
                </div>
              </div>
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">Mobile App?</h3>
                <div className="flex gap-2">
                  {['Yes','No','Maybe'].map(function(o){return(
                    <button key={o} onClick={function(){update('hasMobileApp',o)}} className={"flex-1 py-2 rounded-xl border-2 text-xs font-bold transition " + (form.hasMobileApp===o?'bg-indigo-600 border-indigo-500 text-white':'bg-[#050510] border-[#2e2e4e] text-slate-400 hover:border-indigo-500')}>{o}</button>
                  )})}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2">Budget</h3>
                <input value={form.budget} onChange={function(e){update('budget',e.target.value)}} placeholder="₹2000 or $30" className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"/>
              </div>
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2">Parameters to Measure</h3>
                <input value={form.parameters} onChange={function(e){update('parameters',e.target.value)}} placeholder="Temperature, humidity..." className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"/>
              </div>
            </div>
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Your Experience Level</h2>
              <div className="grid grid-cols-3 gap-3">
                {SKILL_LEVELS.map(function(skill){return(
                  <button key={skill.id} onClick={function(){update('skillLevel',skill.id)}}
                    className={"rounded-xl border-2 p-4 text-left transition " + (form.skillLevel===skill.id?'border-indigo-500 bg-indigo-950':'border-[#2e2e4e] bg-[#050510] hover:border-indigo-800')}>
                    <div className="text-2xl mb-1">{skill.icon}</div>
                    <p className="text-white font-bold text-sm">{skill.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{skill.desc}</p>
                  </button>
                )})}
              </div>
            </div>
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2">Project Timeline</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1"><label className="text-white text-sm">Duration</label><span className="text-indigo-400 font-bold">{form.months} month{form.months>1?'s':''}</span></div>
                  <input type="range" min="1" max="12" value={form.months} onChange={function(e){update('months',parseInt(e.target.value))}} className="w-full accent-indigo-500"/>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><label className="text-white text-sm">Hours per day</label><span className="text-indigo-400 font-bold">{form.hoursPerDay}h</span></div>
                  <input type="range" min="1" max="12" value={form.hoursPerDay} onChange={function(e){update('hoursPerDay',parseInt(e.target.value))}} className="w-full accent-indigo-500"/>
                </div>
                <div>
                  <label className="text-white text-sm block mb-2">Working Days</label>
                  <div className="flex gap-1">
                    {DAYS_MAP.map(function(d){const sel=form.workingDays.includes(d.id);return(
                      <button key={d.id} onClick={function(){update('workingDays',sel?form.workingDays.filter(function(x){return x!==d.id}):[...form.workingDays,d.id])}}
                        className={"flex-1 py-2 rounded-xl border-2 text-xs font-bold transition " + (sel?'bg-indigo-600 border-indigo-500 text-white':'bg-[#050510] border-[#2e2e4e] text-slate-500 hover:border-indigo-500')}>
                        {d.l}
                      </button>
                    )})}
                  </div>
                </div>
                <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Total project hours</span>
                  <span className="text-indigo-400 font-black text-xl">~{totalHours}h</span>
                </div>
              </div>
            </div>
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
              <h3 className="text-white font-bold mb-2">Anything Else ProtoMind Should Know?</h3>
              <textarea value={form.additionalInfo} onChange={function(e){update('additionalInfo',e.target.value)}}
                placeholder="Outdoor use, waterproof, existing components you have..." rows={3}
                className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none"/>
            </div>
            <div className="flex gap-3">
              <button onClick={function(){setStep(0)}} className="flex-1 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl font-medium transition">← Back</button>
              <button onClick={function(){setStep(2)}} className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">Continue → Pick Components</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: COMPONENTS ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                  <input value={searchQuery} onChange={function(e){setSearchQuery(e.target.value)}} placeholder="Search components..."
                    className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl pl-8 pr-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"/>
                </div>
                <button onClick={handleAIPick} disabled={loading}
                  className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shrink-0">
                  {loading ? 'Picking...' : '✨ AI Pick'}
                </button>
              </div>
              <div className="flex gap-1 flex-wrap mb-4">
                {categories.map(function(cat){return(
                  <button key={cat} onClick={function(){setActiveCategory(cat)}}
                    className={"text-xs px-3 py-1.5 rounded-xl border transition " + (activeCategory===cat?'bg-indigo-600 text-white border-indigo-600':'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-800')}>
                    {cat}
                  </button>
                )})}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {filtered.map(function(comp){
                  const isSel = selectedComponents.some(function(c){return c.id===comp.id})
                  return(
                    <button key={comp.id} onClick={function(){toggleComp(comp)}}
                      className={"p-3 rounded-xl border text-left transition " + (isSel?'border-indigo-600 bg-indigo-950':'border-[#2e2e4e] bg-[#13131f] hover:border-indigo-800')}>
                      <div className="text-xl mb-0.5">{comp.icon}</div>
                      <p className={"text-xs font-medium " + (isSel?'text-white':'text-slate-300')}>{comp.name}</p>
                      <p className="text-xs text-slate-600">{comp.category}</p>
                      {isSel && <p className="text-xs text-indigo-400 mt-0.5">✓ Selected</p>}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedComponents.length > 0 && (
              <div className="bg-[#0d0d1a] border border-indigo-900 rounded-2xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{selectedComponents.length} components selected</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedComponents.map(function(c){return(
                    <div key={c.id} className="flex items-center gap-1.5 bg-[#13131f] border border-indigo-800 rounded-xl px-3 py-1.5">
                      <span>{c.icon}</span><span className="text-white text-xs">{c.name}</span>
                      <button onClick={function(){toggleComp(c)}} className="text-slate-600 hover:text-red-400 text-xs ml-1">✕</button>
                    </div>
                  )})}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={function(){setStep(1)}} className="flex-1 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl font-medium transition">← Back</button>
              <button onClick={handleContinue} disabled={selectedComponents.length===0}
                className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg transition disabled:opacity-40 flex items-center justify-center gap-2">
                <span>🗺️</span> Generate My Roadmap →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
