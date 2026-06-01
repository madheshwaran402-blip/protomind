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

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      {/* Month 4 celebration */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-700 rounded-2xl px-6 py-3 flex items-center gap-3">
          <span className="text-2xl">🎊</span>
          <div>
            <p className="text-indigo-400 font-bold text-sm">Month 4 Complete — Day 120!</p>
            <p className="text-slate-400 text-xs">44% of the journey to launch</p>
          </div>
          <span className="text-2xl">🎊</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">📊 Dashboard</h2>
          <p className="text-slate-400 text-sm">Your ProtoMind journey at a glance</p>
        </div>
        <button
          onClick={function() { navigate('/') }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          ⚡ Build Now →
        </button>
      </div>

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
              <div
                className="h-3 rounded-full bg-indigo-600 transition-all"
                style={{ width: levelProgress + '%' }}
              />
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
            <StatCard
              icon="⚡"
              label="Prototypes Built"
              value={analytics.totalProjects}
              color="#6366f1"
              onClick={function() { navigate('/history') }}
            />
            <StatCard
              icon="💾"
              label="Versions Saved"
              value={analytics.totalVersions}
              color="#0ea5e9"
            />
            <StatCard
              icon="🔧"
              label="Components Used"
              value={analytics.totalComponents}
              sub={'avg ' + analytics.avgComponentsPerProject + ' per build'}
              color="#22c55e"
            />
            <StatCard
              icon="📦"
              label="Inventory Items"
              value={analytics.inventoryItems}
              sub={'$' + analytics.inventoryValue.toFixed(0) + ' total value'}
              color="#f59e0b"
              onClick={function() { navigate('/inventory') }}
            />
          </div>

          {/* Recent prototypes */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Recent Prototypes</h3>
              <button
                onClick={function() { navigate('/history') }}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                View all →
              </button>
            </div>
            {analytics.recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 text-sm">No prototypes yet</p>
                <button
                  onClick={function() { navigate('/') }}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
                >
                  Build your first →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.recentProjects.map(function(project, i) {
                  return (
                    <div
                      key={project.id || i}
                      className="flex items-center gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 cursor-pointer hover:border-indigo-700 transition"
                      onClick={function() {
                        navigate('/viewer', { state: { idea: project.idea, selectedComponents: project.components } })
                      }}
                    >
                      <span className="text-2xl shrink-0">{project.thumbnail || '⚡'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{project.idea}</p>
                        <p className="text-slate-500 text-xs">
                          {(project.components || []).length} components ·
                          {project.createdAt ? ' ' + new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </p>
                      </div>
                      <span className="text-slate-600 text-xs shrink-0">→</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '💡', label: 'Get Ideas', path: '/ideas', color: '#f59e0b' },
              { icon: '🔍', label: 'Find Parts', path: '/search', color: '#0ea5e9' },
              { icon: '📚', label: 'Learn', path: '/kb', color: '#22c55e' },
              { icon: '🛒', label: 'Buy Parts', path: '/parts', color: '#a855f7' },
            ].map(function(link) {
              return (
                <button
                  key={link.path}
                  onClick={function() { navigate(link.path) }}
                  className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-700 rounded-2xl p-4 text-center transition"
                >
                  <p className="text-3xl mb-2">{link.icon}</p>
                  <p className="text-white text-xs font-medium">{link.label}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Components Tab */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Most Used Categories</h3>
            <MiniBarChart data={analytics.topCategories} colorKey="category" />
          </div>

          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Most Used Components</h3>
            {analytics.topComponents.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-4">Build some prototypes to see component stats</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {analytics.topComponents.map(function(comp, i) {
                  return (
                    <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
                        style={{ backgroundColor: '#6366f1' + (i === 0 ? '' : '80') }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{comp.name}</p>
                        <p className="text-slate-500 text-xs">used {comp.count}×</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
            <span className="text-3xl">🏆</span>
            <div className="flex-1">
              <p className="text-white font-bold">{analytics.achievements.length} / {ALL_ACHIEVEMENTS.length} Unlocked</p>
              <div className="w-full bg-[#1e1e2e] rounded-full h-2 mt-1">
                <div
                  className="h-2 bg-yellow-500 rounded-full"
                  style={{ width: (analytics.achievements.length / ALL_ACHIEVEMENTS.length * 100) + '%' }}
                />
              </div>
            </div>
            <span className="text-yellow-400 font-bold">{analytics.xp} XP</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ALL_ACHIEVEMENTS.map(function(achievement) {
              const unlocked = analytics.achievements.find(function(a) { return a.id === achievement.id })
              return (
                <div
                  key={achievement.id}
                  title={achievement.title + ' — ' + achievement.desc}
                  className={'p-3 rounded-xl border text-center transition ' + (
                    unlocked ? 'bg-yellow-950 border-yellow-800' : 'bg-[#0d0d1a] border-[#1e1e2e] opacity-40'
                  )}
                >
                  <p className="text-2xl mb-1">{achievement.icon}</p>
                  <p className={'text-xs font-medium leading-tight ' + (unlocked ? 'text-yellow-400' : 'text-slate-600')}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">+{achievement.xp} XP</p>
                  {unlocked && unlocked.unlockedAt && (
                    <p className="text-yellow-700 text-xs mt-0.5">
                      {new Date(unlocked.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Build Activity by Month</h3>
            <ActivityGrid projectsByMonth={analytics.projectsByMonth} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 text-center">
              <p className="text-4xl font-black text-orange-400 mb-1">🔥 {analytics.streakDays}</p>
              <p className="text-white text-sm font-bold">Best Streak</p>
              <p className="text-slate-500 text-xs">consecutive build days</p>
            </div>
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 text-center">
              <p className="text-4xl font-black text-indigo-400 mb-1">{analytics.avgComponentsPerProject}</p>
              <p className="text-white text-sm font-bold">Avg Components</p>
              <p className="text-slate-500 text-xs">per prototype</p>
            </div>
          </div>

          {/* Journey progress */}
          <div className="bg-gradient-to-br from-indigo-950 to-[#0d0d1a] border border-indigo-800 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">🚀 ProtoMind Journey — Day 120 / 270</h3>
            <div className="space-y-3">
              {[
                { label: 'Month 1 — Foundation', days: '1-30', done: true },
                { label: 'Month 2 — Core Features', days: '31-60', done: true },
                { label: 'Month 3 — AI Tools', days: '61-90', done: true },
                { label: 'Month 4 — Polish & Analytics', days: '91-120', done: true },
                { label: 'Month 5 — UX & Performance', days: '121-150', done: false, current: true },
                { label: 'Month 6 — Collaboration', days: '151-180', done: false },
                { label: 'Month 7 — Desktop App', days: '181-210', done: false },
                { label: 'Month 8 — Launch Prep', days: '211-240', done: false },
                { label: 'Month 9 — Launch! 🚀', days: '241-270', done: false },
              ].map(function(phase, i) {
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
    </div>
  )
}

export default Dashboard