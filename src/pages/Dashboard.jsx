import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardAnalytics } from '../services/analyticsService'
import { ALL_ACHIEVEMENTS } from '../services/achievementService'

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
  Passive: '#14b8a6',
  Other: '#64748b',
}

const CATEGORY_ICONS = {
  Microcontroller: '🔵',
  Sensor: '📡',
  Display: '🖥️',
  Communication: '📶',
  Power: '🔋',
  Actuator: '⚙️',
  Module: '📦',
  Passive: '🔌',
}

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div
      className={'bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 ' + (onClick ? 'cursor-pointer hover:border-indigo-800 transition' : '')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {color && <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: color }} />}
      </div>
      <p className={'text-2xl font-black mb-0.5 ' + (color ? '' : 'text-white')} style={color ? { color } : {}}>
        {value}
      </p>
      <p className="text-slate-400 text-xs">{label}</p>
      {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function MiniBarChart({ data, colorKey }) {
  if (!data || data.length === 0) return (
    <p className="text-slate-600 text-xs text-center py-4">No data yet</p>
  )
  const max = Math.max(...data.map(function(d) { return d.count }), 1)
  return (
    <div className="space-y-2">
      {data.map(function(item, i) {
        const color = colorKey ? (CATEGORY_COLORS[item[colorKey]] || '#6366f1') : '#6366f1'
        const pct = (item.count / max) * 100
        const label = item.category || item.name || item.month || ''
        return (
          <div key={i} className="flex items-center gap-3">
            <p className="text-slate-400 text-xs w-28 shrink-0 truncate">
              {colorKey === 'category' && CATEGORY_ICONS[item.category]}
              {' '}{label}
            </p>
            <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: pct + '%', backgroundColor: color }}
              />
            </div>
            <span className="text-xs font-bold w-6 text-right shrink-0" style={{ color }}>
              {item.count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ActivityGrid({ projectsByMonth }) {
  const entries = Object.entries(projectsByMonth || {})
  if (entries.length === 0) return (
    <p className="text-slate-600 text-xs text-center py-4">Build some prototypes to see activity</p>
  )
  const max = Math.max(...entries.map(function(e) { return e[1] }), 1)
  return (
    <div className="flex gap-2 flex-wrap">
      {entries.map(function(entry, i) {
        const month = entry[0]
        const count = entry[1]
        const opacity = 0.2 + (count / max) * 0.8
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: 'rgba(99, 102, 241, ' + opacity + ')' }}
            >
              {count}
            </div>
            <p className="text-slate-600 text-xs">{month}</p>
          </div>
        )
      })}
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(function() {
    setAnalytics(getDashboardAnalytics())
  }, [])

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'components', label: '🔧 Components' },
    { id: 'achievements', label: '🏆 Achievements' },
    { id: 'activity', label: '📅 Activity' },
  ]

  const levelProgress = analytics.level.next
    ? Math.min(((analytics.xp - [0, 0, 200, 500, 1000][analytics.level.level]) /
        (analytics.level.next - [0, 0, 200, 500, 1000][analytics.level.level])) * 100, 100)
    : 100

  const PHASES = [
    { label: 'Month 1 — Foundation', days: '1-30', done: true },
    { label: 'Month 2 — Core Features', days: '31-60', done: true },
    { label: 'Month 3 — AI Tools', days: '61-90', done: true },
    { label: 'Month 4 — Polish', days: '91-120', done: true },
    { label: 'Month 5 — Advanced', days: '121-150', done: true },
    { label: 'Month 6 — Collaboration', days: '151-180', done: false },
    { label: 'Month 7 — Desktop App', days: '181-210', done: false },
    { label: 'Month 8 — Launch Prep', days: '211-240', done: false },
    { label: 'Month 9 — Launch! 🚀', days: '241-270', done: false },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      {/* XP Level Card */}
      <div className="bg-gradient-to-br from-indigo-950 to-[#0d0d1a] border border-indigo-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-5">
          <div className="text-center shrink-0">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-1">
              <p className="text-white font-black text-xl">L{analytics.level.level}</p>
            </div>
            <p className="text-indigo-400 text-xs">{analytics.level.title}</p>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">{analytics.xp} XP total</span>
              {analytics.level.next && <span className="text-slate-600">{analytics.level.next} XP next</span>}
            </div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-3 mb-2">
              <div className="h-3 rounded-full bg-indigo-600 transition-all" style={{ width: levelProgress + '%' }} />
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-yellow-400">🏆 {analytics.achievements.length}/{ALL_ACHIEVEMENTS.length} achievements</span>
              <span className="text-orange-400">🔥 {analytics.streakDays} day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(function(tab) {
          return (
            <button
              key={tab.id}
              onClick={function() { setActiveTab(tab.id) }}
              className={'flex-1 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' + (
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon="⚡" label="Prototypes Built" value={analytics.totalProjects} color="#6366f1" onClick={function() { navigate('/history') }} />
            <StatCard icon="💾" label="Versions Saved" value={analytics.totalVersions} color="#0ea5e9" />
            <StatCard icon="🔧" label="Components Used" value={analytics.totalComponents} sub={'avg ' + analytics.avgComponentsPerProject + ' per build'} color="#22c55e" />
            <StatCard icon="📦" label="Inventory Items" value={analytics.inventoryItems} sub={'$' + analytics.inventoryValue.toFixed(0) + ' total value'} color="#f59e0b" onClick={function() { navigate('/inventory') }} />
          </div>

          {/* Journey */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">ProtoMind Journey</h3>
            <div className="space-y-3">
              {PHASES.map(function(phase, i) {
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ' + (
                      phase.done ? 'bg-green-600' : phase.current ? 'bg-indigo-600 animate-pulse' : 'bg-[#1e1e2e]'
                    )}>
                      {phase.done ? '✓' : phase.current ? '●' : '○'}
                    </div>
                    <div className="flex-1">
                      <p className={'text-sm ' + (phase.done ? 'text-slate-400 line-through' : phase.current ? 'text-white font-bold' : 'text-slate-600')}>
                        {phase.label}
                      </p>
                    </div>
                    <span className="text-slate-600 text-xs">{phase.days}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* Quick action */}
      <div className="mt-6 text-center">
        <button onClick={function() { navigate('/') }} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition">
          ⚡ Build Now →
        </button>
      </div>

    </div>
  )
}

export default Dashboard
