import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects, getAllVersions } from '../services/storage'
import { getAllRatings, getAverageRating } from '../services/ratings'
import { getCustomLibrary } from '../services/customLibrary'
import { notify } from '../services/toast'

const CATEGORY_COLORS = {
  Microcontroller: '#6366f1',
  Sensor: '#0ea5e9',
  Display: '#22c55e',
  Communication: '#ef4444',
  Power: '#f59e0b',
  Actuator: '#a855f7',
  Module: '#64748b',
  Memory: '#64748b',
}

function StatCard({ icon, label, value, sub, color = 'text-indigo-400' }) {
  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 hover:border-indigo-800 transition">
      <div className="text-2xl mb-2">{icon}</div>
      <p className={`text-2xl font-black ${color} mb-1`}>{value}</p>
      <p className="text-white text-sm font-medium">{label}</p>
      {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function BarChart({ data, max, colorKey }) {
  return (
    <div className="space-y-2">
      {data.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <p className="text-slate-400 text-xs w-28 shrink-0 truncate">{item.label}</p>
          <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: max > 0 ? (item.value / max * 100) + '%' : '0%',
                backgroundColor: CATEGORY_COLORS[colorKey || item.label] || '#6366f1',
              }}
            />
          </div>
          <p className="text-slate-500 text-xs w-6 text-right shrink-0">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const projects = getAllProjects()
    const versions = getAllVersions()
    const ratings = getAllRatings()
    const customComponents = getCustomLibrary()
    const avgRating = getAverageRating()

    // Component frequency
    const componentFreq = {}
    projects.forEach(p => {
      p.components?.forEach(c => {
        componentFreq[c.name] = (componentFreq[c.name] || 0) + 1
      })
    })

    // Category frequency
    const categoryFreq = {}
    projects.forEach(p => {
      p.components?.forEach(c => {
        categoryFreq[c.category] = (categoryFreq[c.category] || 0) + 1
      })
    })

    // Tag frequency
    const tagFreq = {}
    projects.forEach(p => {
      (p.tags || []).forEach(tag => {
        tagFreq[tag] = (tagFreq[tag] || 0) + 1
      })
    })

    // Projects by month
    const monthFreq = {}
    projects.forEach(p => {
      const month = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      monthFreq[month] = (monthFreq[month] || 0) + 1
    })

    // Rated projects
    const ratedProjects = Object.entries(ratings).filter(([, r]) => r.stars > 0)
    const topRated = ratedProjects.sort((a, b) => b[1].stars - a[1].stars).slice(0, 3)

    // Total components across all projects
    const totalComponents = projects.reduce((sum, p) => sum + (p.components?.length || 0), 0)

    // Favorite component
    const topComponents = Object.entries(componentFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }))

    // Category breakdown
    const topCategories = Object.entries(categoryFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }))

    // Tag breakdown
    const topTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }))

    // Activity by month
    const activity = Object.entries(monthFreq)
      .slice(-6)
      .map(([label, value]) => ({ label, value }))

    setStats({
      totalProjects: projects.length,
      totalComponents,
      totalVersions: versions.length,
      avgRating: avgRating.toFixed(1),
      ratedCount: ratedProjects.length,
      customComponents: customComponents.length,
      topComponents,
      topCategories,
      topTags,
      activity,
      topRated,
      favoriteComponent: topComponents[0]?.label || 'None yet',
      favoriteCategory: topCategories[0]?.label || 'None yet',
      mostUsedTag: topTags[0]?.label || 'None yet',
    })
  }, [])

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">📊 Your Dashboard</h2>
          <p className="text-slate-400 text-sm">Your complete ProtoMind building history at a glance</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          ⚡ Build New
        </button>
      </div>

      {/* Empty state */}
      {stats.totalProjects === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No data yet</h3>
          <p className="text-slate-500 text-sm mb-6">Build and save some prototypes to see your stats here</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            Start Building
          </button>
        </div>
      )}

      {stats.totalProjects > 0 && (
        <>
          {/* Main stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard icon="⚡" label="Prototypes" value={stats.totalProjects} sub="Total built" />
            <StatCard icon="🔧" label="Components" value={stats.totalComponents} sub="Across all projects" color="text-sky-400" />
            <StatCard icon="🕐" label="Versions" value={stats.totalVersions} sub="Total saves" color="text-purple-400" />
            <StatCard icon="⭐" label="Avg Rating" value={stats.avgRating} sub={stats.ratedCount + ' rated'} color="text-yellow-400" />
            <StatCard icon="🔩" label="Custom Parts" value={stats.customComponents} sub="In your library" color="text-green-400" />
            <StatCard icon="🏷️" label="Top Tag" value={stats.mostUsedTag} sub="Most used" color="text-orange-400" />
          </div>

          {/* Highlights row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-indigo-950 border border-indigo-900 rounded-2xl p-5">
              <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-1">Favourite Component</p>
              <p className="text-white text-lg font-bold">{stats.favoriteComponent}</p>
              <p className="text-indigo-700 text-xs mt-1">Used most across all projects</p>
            </div>
            <div className="bg-sky-950 border border-sky-900 rounded-2xl p-5">
              <p className="text-sky-400 text-xs font-semibold uppercase tracking-wide mb-1">Favourite Category</p>
              <p className="text-white text-lg font-bold">{stats.favoriteCategory}</p>
              <p className="text-sky-700 text-xs mt-1">Most selected component type</p>
            </div>
            <div className="bg-emerald-950 border border-emerald-900 rounded-2xl p-5">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">Top Project Tag</p>
              <p className="text-white text-lg font-bold">{stats.mostUsedTag}</p>
              <p className="text-emerald-700 text-xs mt-1">Most common project type</p>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            {/* Component frequency */}
            {stats.topComponents.length > 0 && (
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">🔧 Most Used Components</h3>
                <BarChart
                  data={stats.topComponents}
                  max={stats.topComponents[0]?.value || 1}
                />
              </div>
            )}

            {/* Category breakdown */}
            {stats.topCategories.length > 0 && (
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">📦 Component Categories</h3>
                <BarChart
                  data={stats.topCategories}
                  max={stats.topCategories[0]?.value || 1}
                />
              </div>
            )}

            {/* Tag breakdown */}
            {stats.topTags.length > 0 && (
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">🏷️ Project Tags</h3>
                <BarChart
                  data={stats.topTags}
                  max={stats.topTags[0]?.value || 1}
                />
              </div>
            )}
          </div>

          {/* Activity + Top rated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

            {/* Monthly activity */}
            {stats.activity.length > 0 && (
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">📅 Monthly Activity</h3>
                <div className="flex items-end gap-2 h-24">
                  {stats.activity.map(item => {
                    const max = Math.max(...stats.activity.map(a => a.value))
                    const height = max > 0 ? (item.value / max * 100) : 0
                    return (
                      <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-indigo-600 rounded-t-lg transition-all"
                          style={{ height: height + '%', minHeight: item.value > 0 ? '8px' : '0' }}
                        />
                        <p className="text-slate-600 text-xs">{item.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Top rated */}
            {stats.topRated.length > 0 && (
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">⭐ Your Top Rated</h3>
                <div className="space-y-3">
                  {stats.topRated.map(([idea, rating], i) => (
                    <div
                      key={idea}
                      className="flex items-center gap-3 cursor-pointer hover:bg-[#13131f] p-2 rounded-xl transition"
                      onClick={() => navigate('/history')}
                    >
                      <span className="text-lg w-6 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{idea}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-xs ${s <= rating.stars ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      {rating.difficulty && (
                        <span className="text-xs text-slate-600 shrink-0">{rating.difficulty}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'View History', icon: '📂', path: '/history' },
                { label: 'Templates', icon: '📋', path: '/templates' },
                { label: 'My Library', icon: '🔧', path: '/library' },
                { label: 'Settings', icon: '⚙️', path: '/settings' },
              ].map(action => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2 px-4 py-3 bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-800 rounded-xl text-sm text-slate-400 hover:text-white transition"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard