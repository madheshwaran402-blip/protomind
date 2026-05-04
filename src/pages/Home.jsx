import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { chat } from '../services/chat'
import { getAllProjects, getAllVersions } from '../services/storage'
import { notify } from '../services/toast'
import {
  checkAndUnlockAchievements,
  getUnlockedAchievements,
  getTotalXP,
  getLevel,
  ALL_ACHIEVEMENTS,
} from '../services/achievementService'

const COMPONENT_DATABASE = [
  { id: 1, name: 'Arduino Nano', icon: '🔵', category: 'Microcontroller', description: 'Compact ATmega328P microcontroller', estimatedPrice: '$5-12' },
  { id: 2, name: 'Arduino Uno', icon: '🔵', category: 'Microcontroller', description: 'Standard ATmega328P board', estimatedPrice: '$10-25' },
  { id: 3, name: 'ESP32', icon: '📡', category: 'Microcontroller', description: 'Dual-core WiFi+BT microcontroller', estimatedPrice: '$4-10' },
  { id: 4, name: 'ESP8266', icon: '📡', category: 'Microcontroller', description: 'WiFi enabled microcontroller', estimatedPrice: '$2-6' },
  { id: 5, name: 'Raspberry Pi Pico', icon: '🟢', category: 'Microcontroller', description: 'RP2040 dual-core microcontroller', estimatedPrice: '$4-8' },
  { id: 6, name: 'DHT22 Sensor', icon: '🌡️', category: 'Sensor', description: 'Temperature and humidity sensor', estimatedPrice: '$2-5' },
  { id: 7, name: 'DHT11 Sensor', icon: '🌡️', category: 'Sensor', description: 'Basic temperature and humidity', estimatedPrice: '$1-3' },
  { id: 8, name: 'HC-SR04 Ultrasonic', icon: '📡', category: 'Sensor', description: 'Distance measuring sensor', estimatedPrice: '$1-3' },
  { id: 9, name: 'PIR Motion Sensor', icon: '👁️', category: 'Sensor', description: 'Passive infrared motion detector', estimatedPrice: '$1-4' },
  { id: 10, name: 'MQ-135 Gas Sensor', icon: '💨', category: 'Sensor', description: 'Air quality and gas sensor', estimatedPrice: '$2-5' },
  { id: 11, name: 'Soil Moisture Sensor', icon: '🌱', category: 'Sensor', description: 'Detects soil water content', estimatedPrice: '$1-3' },
  { id: 12, name: 'MPU-6050 Gyro', icon: '🎯', category: 'Sensor', description: '6-axis accelerometer and gyroscope', estimatedPrice: '$1-4' },
  { id: 13, name: 'OLED Display 128x64', icon: '🖥️', category: 'Display', description: 'Small I2C OLED screen', estimatedPrice: '$3-8' },
  { id: 14, name: 'LCD 16x2 I2C', icon: '🖥️', category: 'Display', description: '16 character LCD with I2C', estimatedPrice: '$2-6' },
  { id: 15, name: 'TFT Display 2.4"', icon: '🖥️', category: 'Display', description: 'Color touchscreen display', estimatedPrice: '$5-15' },
  { id: 16, name: 'L298N Motor Driver', icon: '⚙️', category: 'Actuator', description: 'Dual H-bridge motor driver', estimatedPrice: '$2-6' },
  { id: 17, name: 'Servo Motor SG90', icon: '🔄', category: 'Actuator', description: 'Micro servo motor 180°', estimatedPrice: '$1-4' },
  { id: 18, name: 'Stepper Motor', icon: '⚙️', category: 'Actuator', description: '28BYJ-48 stepper motor', estimatedPrice: '$2-5' },
  { id: 19, name: 'HC-05 Bluetooth', icon: '📶', category: 'Communication', description: 'Classic Bluetooth serial module', estimatedPrice: '$3-8' },
  { id: 20, name: 'nRF24L01 Radio', icon: '📻', category: 'Communication', description: '2.4GHz wireless transceiver', estimatedPrice: '$1-4' },
  { id: 21, name: 'LoRa SX1278', icon: '📡', category: 'Communication', description: 'Long range wireless module', estimatedPrice: '$5-15' },
  { id: 22, name: 'Relay Module', icon: '⚡', category: 'Module', description: '5V relay for mains control', estimatedPrice: '$1-3' },
  { id: 23, name: 'LiPo Battery 3.7V', icon: '🔋', category: 'Power', description: 'Rechargeable lithium polymer', estimatedPrice: '$3-10' },
  { id: 24, name: 'LM7805 Regulator', icon: '⚡', category: 'Power', description: '5V voltage regulator IC', estimatedPrice: '$0.50-2' },
  { id: 25, name: 'RFID RC522', icon: '📶', category: 'Communication', description: 'RFID reader/writer module', estimatedPrice: '$2-5' },
]

const QUICK_EXAMPLES = [
  'Smart plant watering system with soil sensor and water pump',
  'Bluetooth robot car with obstacle avoidance',
  'Home weather station with temperature and humidity display',
  'Smart door lock with RFID and keypad',
  'Heart rate monitor with OLED display',
]

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
}

function AchievementPopup({ achievement, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-yellow-950 border border-yellow-700 rounded-2xl p-4 flex items-center gap-3 shadow-2xl max-w-xs animate-bounce-once">
      <span className="text-4xl">{achievement.icon}</span>
      <div>
        <p className="text-yellow-400 text-xs font-bold uppercase tracking-wide">Achievement Unlocked!</p>
        <p className="text-white font-bold text-sm">{achievement.title}</p>
        <p className="text-yellow-300 text-xs">{achievement.desc}</p>
        <p className="text-yellow-500 text-xs">+{achievement.xp} XP</p>
      </div>
      <button onClick={onClose} className="text-yellow-700 hover:text-yellow-400 ml-2">✕</button>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [idea, setIdea] = useState(location.state?.prefillIdea || '')
  const [loading, setLoading] = useState(false)
  const [selectedComponents, setSelectedComponents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [step, setStep] = useState(1)
  const [newAchievement, setNewAchievement] = useState(null)
  const [projects, setProjects] = useState([])
  const [xp, setXp] = useState(getTotalXP())
  const [level, setLevel] = useState(getLevel(getTotalXP()))
  const [unlockedCount, setUnlockedCount] = useState(getUnlockedAchievements().length)

  useEffect(() => {
    const all = getAllProjects()
    const versions = getAllVersions()
    setProjects(all)
    const newlyUnlocked = checkAndUnlockAchievements(all, versions)
    if (newlyUnlocked.length > 0) {
      setNewAchievement(newlyUnlocked[0])
      setXp(getTotalXP())
      setLevel(getLevel(getTotalXP()))
      setUnlockedCount(getUnlockedAchievements().length)
    }
  }, [])

  const categories = ['All', ...new Set(COMPONENT_DATABASE.map(c => c.category))]

  const filteredComponents = COMPONENT_DATABASE.filter(comp => {
    const matchSearch = !searchQuery ||
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = activeCategory === 'All' || comp.category === activeCategory
    return matchSearch && matchCategory
  })

  function toggleComponent(comp) {
    setSelectedComponents(prev => {
      if (prev.find(c => c.id === comp.id)) {
        return prev.filter(c => c.id !== comp.id)
      }
      if (prev.length >= 12) {
        notify.warning('Maximum 12 components')
        return prev
      }
      return [...prev, comp]
    })
  }

  function isSelected(compId) {
    return selectedComponents.some(c => c.id === compId)
  }

  async function handleAISelect() {
    if (!idea.trim()) {
      notify.warning('Please describe your idea first')
      return
    }
    setLoading(true)
    try {
      const result = await chat(idea, COMPONENT_DATABASE)
      if (result && result.length > 0) {
        setSelectedComponents(result.slice(0, 8))
        setStep(2)
        notify.success('AI selected ' + result.length + ' components!')
      }
    } catch {
      notify.error('AI failed — is Ollama running? You can still select manually.')
    } finally {
      setLoading(false)
    }
  }

  function handleBuild() {
    if (selectedComponents.length === 0) {
      notify.warning('Please select at least one component')
      return
    }
    navigate('/viewer', {
      state: { idea, selectedComponents },
    })
  }

  const progressPercent = level.next
    ? Math.min(((xp - (level.level === 1 ? 0 : level.level === 2 ? 200 : level.level === 3 ? 500 : 1000)) / (level.next - (level.level === 1 ? 0 : level.level === 2 ? 200 : level.level === 3 ? 500 : 1000))) * 100, 100)
    : 100

  return (
    <div className="min-h-screen page-enter">

      {/* Achievement popup */}
      {newAchievement && (
        <AchievementPopup
          achievement={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}

      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#0a0a0f] to-[#0a0a0f] pointer-events-none" />
        <div className="relative px-4 sm:px-8 md:px-16 pt-12 pb-8">

          {/* Day 100 celebration banner */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-950 border border-yellow-700 rounded-full px-6 py-2 flex items-center gap-2">
              <span className="text-xl">🎊</span>
              <span className="text-yellow-400 text-sm font-bold">Day 100 — ProtoMind is 100 days old!</span>
              <span className="text-xl">🎊</span>
            </div>
          </div>

          {/* Level + XP bar */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl px-5 py-3 flex items-center gap-4">
              <div className="text-center">
                <p className="text-indigo-400 font-black text-xl">Lv.{level.level}</p>
                <p className="text-slate-500 text-xs">{level.title}</p>
              </div>
              <div className="w-32">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{xp} XP</span>
                  {level.next && <span className="text-slate-600">{level.next}</span>}
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-2">
                  <div
                    className="h-2 bg-indigo-600 rounded-full transition-all"
                    style={{ width: progressPercent + '%' }}
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-yellow-400 font-bold text-sm">{unlockedCount}/{ALL_ACHIEVEMENTS.length}</p>
                <p className="text-slate-500 text-xs">Achievements</p>
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-center leading-tight mb-4">
            Build Electronics
            <span className="text-indigo-400"> With AI</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg text-center max-w-2xl mx-auto mb-8">
            Describe your idea → AI picks components → 3D preview → Code, docs, shopping list. Everything in one place.
          </p>

          {/* Quick stats */}
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            {[
              { value: projects.length, label: 'Prototypes Built', icon: '🔧' },
              { value: '30+', label: 'AI Tools', icon: '🤖' },
              { value: '100', label: 'Days Building', icon: '📅' },
              { value: ALL_ACHIEVEMENTS.length, label: 'Achievements', icon: '🏆' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-white">{stat.icon} {stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main build interface */}
      <div className="px-4 sm:px-8 md:px-16 pb-12">

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6 max-w-2xl mx-auto">
          {[
            { n: 1, label: 'Describe Idea' },
            { n: 2, label: 'Pick Components' },
            { n: 3, label: 'Build & Explore' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step >= s.n ? 'bg-indigo-600 text-white' : 'bg-[#1e1e2e] text-slate-500'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <p className={`text-xs hidden sm:block ${step >= s.n ? 'text-white' : 'text-slate-600'}`}>{s.label}</p>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${step > s.n ? 'bg-indigo-600' : 'bg-[#1e1e2e]'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Idea input */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Step 1 — Describe Your Prototype Idea</p>
            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="e.g. A smart plant watering system that monitors soil moisture and automatically waters plants when dry, with a display showing current readings..."
              className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder-slate-600 leading-relaxed transition"
              rows={3}
            />

            {/* Example ideas */}
            <div className="flex flex-wrap gap-2 mt-3 mb-4">
              {QUICK_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setIdea(ex); setStep(1) }}
                  className="text-xs px-3 py-1.5 bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-600 text-slate-400 hover:text-white rounded-xl transition"
                >
                  {ex.slice(0, 30)}...
                </button>
              ))}
            </div>

            <button
              onClick={handleAISelect}
              disabled={loading || !idea.trim()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-base font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI is picking components...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>AI Pick Components Automatically</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2 — Component picker */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Step 2 — Select Components Manually ({selectedComponents.length} selected)
              </p>
              {selectedComponents.length > 0 && (
                <button
                  onClick={() => setSelectedComponents([])}
                  className="text-xs text-slate-500 hover:text-white transition"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Search + categories */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search components..."
                  className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl pl-8 pr-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
      {/* Component grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredComponents.map(comp => {
                const selected = isSelected(comp.id)
                const color = CATEGORY_COLORS[comp.category] || '#6366f1'
                return (
                  <button
                    key={comp.id}
                    onClick={() => toggleComponent(comp)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selected
                        ? 'border-indigo-600 bg-indigo-950'
                        : 'border-[#2e2e4e] bg-[#13131f] hover:border-indigo-800'
                    }`}
                  >
                    <div className="text-2xl mb-1">{comp.icon}</div>
                    <p className={`text-xs font-medium leading-tight mb-0.5 ${selected ? 'text-white' : 'text-slate-300'}`}>
                      {comp.name}
                    </p>
                    <p className="text-xs" style={{ color: color + (selected ? '' : '99') }}>{comp.category}</p>
                    {selected && <div className="mt-1 text-xs text-indigo-400">✓ Selected</div>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected components preview */}
        {selectedComponents.length > 0 && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-[#0d0d1a] border border-indigo-900 rounded-2xl p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                Step 3 — Build Your Prototype ({selectedComponents.length} components)
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedComponents.map(comp => (
                  <div key={comp.id} className="flex items-center gap-1.5 bg-[#13131f] border border-indigo-800 rounded-xl px-3 py-1.5">
                    <span className="text-base">{comp.icon}</span>
                    <span className="text-white text-xs font-medium">{comp.name}</span>
                    <button
                      onClick={() => toggleComponent(comp)}
                      className="text-slate-600 hover:text-red-400 text-xs ml-1 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBuild}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-base font-black transition shadow-lg shadow-indigo-900"
              >
                🚀 Build Prototype → View in 3D
              </button>
            </div>
          </div>
        )}

        {/* Quick navigation */}
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-slate-600 uppercase tracking-wide mb-3 text-center">Quick Access</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { label: '💡 Ideas', path: '/ideas' },
              { label: '🎯 Recommender', path: '/recommend' },
              { label: '📂 History', path: '/history' },
              { label: '📋 Templates', path: '/templates' },
              { label: '📊 Dashboard', path: '/dashboard' },
              { label: '🆘 Help', path: '/help' },
            ].map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-3 py-2 bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 text-slate-400 hover:text-white rounded-xl text-xs transition"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements section */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-600 uppercase tracking-wide">🏆 Achievements ({unlockedCount}/{ALL_ACHIEVEMENTS.length})</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ALL_ACHIEVEMENTS.map(achievement => {
              const unlocked = getUnlockedAchievements().find(a => a.id === achievement.id)
              return (
                <div
                  key={achievement.id}
                  title={achievement.title + ' — ' + achievement.desc}
                  className={`p-3 rounded-xl border text-center transition ${
                    unlocked
                      ? 'bg-yellow-950 border-yellow-800'
                      : 'bg-[#0d0d1a] border-[#1e1e2e] opacity-40'
                  }`}
                >
                  <p className="text-2xl mb-1">{achievement.icon}</p>
                  <p className={`text-xs font-medium leading-tight ${unlocked ? 'text-yellow-400' : 'text-slate-600'}`}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-slate-600">+{achievement.xp} XP</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home