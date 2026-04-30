import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPublicProjects, likeProject } from '../services/supabase'
import { getAllProjects } from '../services/storage'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  IoT: { bg: 'bg-indigo-950', text: 'text-indigo-400', border: 'border-indigo-800' },
  Robotics: { bg: 'bg-blue-950', text: 'text-blue-400', border: 'border-blue-800' },
  Wearable: { bg: 'bg-purple-950', text: 'text-purple-400', border: 'border-purple-800' },
  Agriculture: { bg: 'bg-green-950', text: 'text-green-400', border: 'border-green-800' },
  Health: { bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-800' },
  'Home Automation': { bg: 'bg-yellow-950', text: 'text-yellow-400', border: 'border-yellow-800' },
  Vehicle: { bg: 'bg-orange-950', text: 'text-orange-400', border: 'border-orange-800' },
  Display: { bg: 'bg-pink-950', text: 'text-pink-400', border: 'border-pink-800' },
  Security: { bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-700' },
  Other: { bg: 'bg-[#1e1e2e]', text: 'text-slate-400', border: 'border-[#2e2e4e]' },
}

const DEMO_PROJECTS = [
  {
    id: 'demo1',
    idea: 'Smart Plant Watering System with soil moisture sensor and automatic pump control',
    components: [
      { id: 1, name: 'Arduino Nano', icon: '🔵', category: 'Microcontroller' },
      { id: 2, name: 'Soil Moisture Sensor', icon: '🌱', category: 'Sensor' },
      { id: 3, name: 'Water Pump', icon: '💧', category: 'Actuator' },
      { id: 4, name: 'Relay Module', icon: '⚡', category: 'Module' },
    ],
    tags: ['Agriculture', 'IoT'],
    thumbnail: '🌱',
    likes: 42,
    is_public: true,
  },
  {
    id: 'demo2',
    idea: 'Bluetooth-controlled robot car with obstacle avoidance using ultrasonic sensor',
    components: [
      { id: 1, name: 'ESP32', icon: '📡', category: 'Microcontroller' },
      { id: 2, name: 'L298N Motor Driver', icon: '⚙️', category: 'Actuator' },
      { id: 3, name: 'HC-SR04', icon: '📡', category: 'Sensor' },
      { id: 4, name: 'DC Motors', icon: '🔄', category: 'Actuator' },
    ],
    tags: ['Robotics'],
    thumbnail: '🤖',
    likes: 38,
    is_public: true,
  },
  {
    id: 'demo3',
    idea: 'Air quality monitor with OLED display showing PM2.5, CO2, temperature and humidity',
    components: [
      { id: 1, name: 'ESP8266', icon: '📡', category: 'Microcontroller' },
      { id: 2, name: 'MQ-135 Gas Sensor', icon: '🌡️', category: 'Sensor' },
      { id: 3, name: 'DHT22', icon: '🌡️', category: 'Sensor' },
      { id: 4, name: 'OLED Display', icon: '🖥️', category: 'Display' },
    ],
    tags: ['Health', 'IoT'],
    thumbnail: '💨',
    likes: 31,
    is_public: true,
  },
  {
    id: 'demo4',
    idea: 'Smart door lock with RFID authentication, keypad and LCD status display',
    components: [
      { id: 1, name: 'Arduino Uno', icon: '🔵', category: 'Microcontroller' },
      { id: 2, name: 'RFID RC522', icon: '📶', category: 'Communication' },
      { id: 3, name: 'Servo Motor', icon: '⚙️', category: 'Actuator' },
      { id: 4, name: 'LCD 16x2', icon: '🖥️', category: 'Display' },
    ],
    tags: ['Security', 'Home Automation'],
    thumbnail: '🔐',
    likes: 27,
    is_public: true,
  },
  {
    id: 'demo5',
    idea: 'Wearable heart rate monitor with pulse sensor and mobile app via Bluetooth',
    components: [
      { id: 1, name: 'Arduino Nano', icon: '🔵', category: 'Microcontroller' },
      { id: 2, name: 'Pulse Sensor', icon: '❤️', category: 'Sensor' },
      { id: 3, name: 'HC-05 Bluetooth', icon: '📶', category: 'Communication' },
      { id: 4, name: 'OLED Display', icon: '🖥️', category: 'Display' },
    ],
    tags: ['Health', 'Wearable'],
    thumbnail: '❤️',
    likes: 55,
    is_public: true,
  },
  {
    id: 'demo6',
    idea: 'ESP32 weather station with BME280 sensor, e-ink display and WiFi data upload',
    components: [
      { id: 1, name: 'ESP32', icon: '📡', category: 'Microcontroller' },
      { id: 2, name: 'BME280', icon: '🌡️', category: 'Sensor' },
      { id: 3, name: 'E-Ink Display', icon: '🖥️', category: 'Display' },
      { id: 4, name: 'LiPo Battery', icon: '🔋', category: 'Power' },
    ],
    tags: ['IoT'],
    thumbnail: '🌤️',
    likes: 48,
    is_public: true,
  },
]

function ProjectCard({ project, onLoad, onLike, isLocal }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(project.likes || 0)
  const primaryTag = project.tags?.[0]
  const tagColors = CATEGORY_COLORS[primaryTag] || CATEGORY_COLORS.Other

  function handleLike(e) {
    e.stopPropagation()
    if (liked || isLocal) return
    setLiked(true)
    setLikeCount(prev => prev + 1)
    onLike && onLike(project.id)
  }

  return (
    <div
      onClick={() => onLoad && onLoad(project)}
      className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-4 sm:p-5 transition cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl sm:text-4xl">{project.thumbnail || '🔧'}</div>
        <div className="flex items-center gap-2">
          {isLocal && (
            <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">
              Mine
            </span>
          )}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition ${
              liked
                ? 'bg-red-950 text-red-400'
                : 'bg-[#1e1e2e] text-slate-500 hover:text-red-400'
            }`}
          >
            {liked ? '❤️' : '🤍'} {likeCount}
          </button>
        </div>
      </div>

      {/* Idea */}
      <p className="text-white text-sm font-medium leading-relaxed mb-3 line-clamp-2 group-hover:text-indigo-300 transition">
        {project.idea}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {(project.tags || []).slice(0, 2).map(tag => {
          const colors = CATEGORY_COLORS[tag] || CATEGORY_COLORS.Other
          return (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}>
              {tag}
            </span>
          )
        })}
      </div>

      {/* Components */}
      <div className="flex flex-wrap gap-1 mb-3">
        {(project.components || []).slice(0, 3).map((comp, i) => (
          <span key={i} className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-0.5 rounded-full">
            {comp.icon} {comp.name?.split(' ')[0]}
          </span>
        ))}
        {(project.components || []).length > 3 && (
          <span className="text-xs text-slate-600 px-1 py-0.5">
            +{project.components.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-600 text-xs">{(project.components || []).length} components</span>
        <span className="text-indigo-400 text-xs group-hover:text-indigo-300 transition">Load →</span>
      </div>
    </div>
  )
}

function Gallery() {
  const navigate = useNavigate()
  const [cloudProjects, setCloudProjects] = useState([])
  const [localProjects, setLocalProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')
  const [sortBy, setSortBy] = useState('likes')
  const [activeSource, setActiveSource] = useState('community')

  const ALL_TAGS = ['All', 'IoT', 'Robotics', 'Health', 'Wearable', 'Agriculture', 'Home Automation', 'Security', 'Display', 'Vehicle']

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getPublicProjects()
        setCloudProjects(data?.length > 0 ? data : DEMO_PROJECTS)
      } catch {
        setCloudProjects(DEMO_PROJECTS)
      }
      setLocalProjects(getAllProjects().filter(p => p.components?.length > 0))
      setLoading(false)
    }
    load()
  }, [])

  function handleLoad(project) {
    navigate('/viewer', {
      state: {
        idea: project.idea,
        selectedComponents: project.components,
      },
    })
  }

  async function handleLike(projectId) {
    try {
      await likeProject(projectId)
    } catch {
      // silent fail
    }
  }

  const sourceProjects = activeSource === 'community' ? cloudProjects : localProjects

  const filtered = sourceProjects.filter(p => {
    const matchSearch = !search.trim() ||
      p.idea.toLowerCase().includes(search.toLowerCase()) ||
      (p.components || []).some(c => c.name?.toLowerCase().includes(search.toLowerCase()))
    const matchTag = selectedTag === 'All' ||
      (p.tags || []).includes(selectedTag)
    return matchSearch && matchTag
  }).sort((a, b) => {
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0)
    if (sortBy === 'components') return (b.components?.length || 0) - (a.components?.length || 0)
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    return 0
  })

  const featuredProject = cloudProjects.sort((a, b) => (b.likes || 0) - (a.likes || 0))[0]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🌐 Community Gallery</h2>
          <p className="text-slate-400 text-sm">
            Discover prototypes built by the ProtoMind community
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            + Share Your Prototype
          </button>
        </div>
      </div>

      {/* Featured project */}
      {featuredProject && !loading && (
        <div
          className="bg-gradient-to-br from-indigo-950 to-[#0d0d1a] border border-indigo-800 rounded-2xl p-5 mb-6 cursor-pointer hover:border-indigo-600 transition"
          onClick={() => handleLoad(featuredProject)}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-wide">Featured Prototype</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-5xl">{featuredProject.thumbnail || '🔧'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight mb-2">
                {featuredProject.idea}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex flex-wrap gap-1">
                  {(featuredProject.components || []).slice(0, 4).map((comp, i) => (
                    <span key={i} className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">
                      {comp.icon} {comp.name?.split(' ')[0]}
                    </span>
                  ))}
                </div>
                <span className="text-indigo-400 text-xs ml-auto">❤️ {featuredProject.likes || 0} likes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Source toggle */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 mb-4 max-w-xs">
        {[
          { id: 'community', label: '🌐 Community' },
          { id: 'mine', label: '🔧 My Projects' },
        ].map(source => (
          <button
            key={source.id}
            onClick={() => setActiveSource(source.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
              activeSource === source.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
            }`}
          >
            {source.label}
          </button>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search prototypes or components..."
            className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder-slate-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-sm text-white outline-none"
        >
          <option value="likes">Most Liked</option>
          <option value="components">Most Components</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {ALL_TAGS.map(tag => {
          const colors = CATEGORY_COLORS[tag] || { text: 'text-indigo-400', bg: 'bg-indigo-950', border: 'border-indigo-800' }
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                selectedTag === tag
                  ? tag === 'All'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : colors.bg + ' ' + colors.text + ' ' + colors.border
                  : 'bg-[#0d0d1a] text-slate-400 border-[#1e1e2e] hover:border-indigo-800'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mb-4">
        Showing {filtered.length} prototype{filtered.length !== 1 ? 's' : ''}
        {selectedTag !== 'All' && <span> · Tag: <span className="text-indigo-400">{selectedTag}</span></span>}
        {search && <span> · "{search}"</span>}
      </p>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading community projects...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">
            {activeSource === 'mine' ? '🔧' : '🌐'}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {activeSource === 'mine' ? 'No saved projects yet' : 'No results found'}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {activeSource === 'mine'
              ? 'Build and save prototypes to see them here'
              : 'Try a different search or tag filter'}
          </p>
          <button
            onClick={() => activeSource === 'mine' ? navigate('/') : setSelectedTag('All')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            {activeSource === 'mine' ? 'Start Building' : 'Clear Filters'}
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onLoad={handleLoad}
              onLike={handleLike}
              isLocal={activeSource === 'mine'}
            />
          ))}
        </div>
      )}

      {/* Day 90 celebration */}
      <div className="mt-10 bg-gradient-to-br from-indigo-950 to-purple-950 border border-indigo-800 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-3">🎊</div>
        <h3 className="text-white font-black text-xl mb-2">Day 90 — One Third Complete!</h3>
        <p className="text-indigo-300 text-sm mb-4">
          90 days of building · 25+ pages · 30+ AI tools · 90 features shipped!
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { value: '90', label: 'Days Built' },
            { value: '25+', label: 'Pages' },
            { value: '30+', label: 'AI Tools' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-2xl font-black text-indigo-400">{stat.value}</p>
              <p className="text-slate-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Gallery