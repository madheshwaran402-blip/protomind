import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateWeeklyReport, getMotivationalMessage } from '../services/progressReport'

function ActivityBar({ day, count, max }) {
  const height = max > 0 ? Math.max((count / max) * 100, count > 0 ? 8 : 0) : 0
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs text-slate-600">{count > 0 ? count : ''}</span>
      <div className="w-full bg-[#1e1e2e] rounded-t-lg relative" style={{ height: '60px' }}>
        <div
          className="absolute bottom-0 w-full bg-indigo-600 rounded-t-lg transition-all"
          style={{ height: height + '%' }}
        />
      </div>
      <span className="text-xs text-slate-600 whitespace-nowrap">{day.split(',')[0]}</span>
    </div>
  )
}

function ProgressReport() {
  const navigate = useNavigate()
  const [report, setReport] = useState(null)

  useEffect(() => {
    const data = generateWeeklyReport()
    setReport(data)
  }, [])

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const motivation = getMotivationalMessage(report)
  const activityValues = Object.values(report.recentActivity)
  const maxActivity = Math.max(...activityValues, 1)

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">📈 Progress Report</h2>
          <p className="text-slate-400 text-sm">
            Generated {new Date(report.generatedAt).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            ⚡ Build New
          </button>
        </div>
      </div>

      {/* Motivational banner */}
      <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-5 mb-8 flex items-center gap-4">
        <span className="text-4xl">{motivation.emoji}</span>
        <div>
          <p className="text-white font-bold text-lg">{motivation.msg}</p>
          <p className="text-indigo-400 text-sm mt-0.5">Day 70 of your ProtoMind journey</p>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { icon: '🔥', label: 'Day Streak', value: report.totals.streak || 0, color: 'text-orange-400', suffix: '' },
          { icon: '⚡', label: 'This Week', value: report.totals.thisWeek, color: 'text-indigo-400', suffix: ' built' },
          { icon: '📅', label: 'This Month', value: report.totals.thisMonth, color: 'text-blue-400', suffix: ' built' },
          { icon: '💾', label: 'Saves', value: report.totals.weekVersions, color: 'text-purple-400', suffix: ' this week' },
          { icon: '⭐', label: 'Avg Rating', value: report.totals.avgRating, color: 'text-yellow-400', suffix: '/5' },
          { icon: '🔧', label: 'Total Built', value: report.totals.projects, color: 'text-emerald-400', suffix: ' all time' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 text-center hover:border-indigo-800 transition">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-600 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 7-day activity */}
      <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 mb-6">
        <h3 className="text-white font-semibold text-sm mb-4">📅 Last 7 Days Activity</h3>
        <div className="flex gap-2 items-end">
          {Object.entries(report.recentActivity).map(([day, count]) => (
            <ActivityBar key={day} day={day} count={count} max={maxActivity} />
          ))}
        </div>
        <p className="text-slate-600 text-xs mt-3 text-center">
          {report.totals.weekVersions} saves this week
        </p>
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">

        {/* Top stats */}
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">🏆 Your Bests</h3>
          <div className="space-y-3">
            {report.topComponent && (
              <div className="flex items-center gap-3 bg-[#13131f] rounded-xl p-3">
                <span className="text-2xl">🔧</span>
                <div>
                  <p className="text-xs text-slate-500">Favourite Component</p>
                  <p className="text-white text-sm font-medium">{report.topComponent.name}</p>
                  <p className="text-indigo-400 text-xs">Used {report.topComponent.count} times</p>
                </div>
              </div>
            )}
            {report.topCategory && (
              <div className="flex items-center gap-3 bg-[#13131f] rounded-xl p-3">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="text-xs text-slate-500">Top Category</p>
                  <p className="text-white text-sm font-medium">{report.topCategory.name}</p>
                  <p className="text-indigo-400 text-xs">{report.topCategory.count} components used</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 bg-[#13131f] rounded-xl p-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-xs text-slate-500">Total Versions Saved</p>
                <p className="text-white text-sm font-medium">{report.totals.versions}</p>
                <p className="text-indigo-400 text-xs">Across all projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Build progress */}
        {report.buildProgresses.length > 0 && (
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">🔨 Build Progress</h3>
            <div className="space-y-3">
              {report.buildProgresses.map((bp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-white text-xs truncate flex-1 mr-2">{bp.idea.slice(0, 35)}...</p>
                    <span className="text-indigo-400 text-xs font-bold shrink-0">{bp.progress.percent}%</span>
                  </div>
                  <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-indigo-600 transition-all"
                      style={{ width: bp.progress.percent + '%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent projects */}
      {report.recentProjects.length > 0 && (
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 mb-6">
          <h3 className="text-white font-semibold text-sm mb-4">🕐 Recent Projects</h3>
          <div className="space-y-3">
            {report.recentProjects.map((project, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#13131f] rounded-xl p-3">
                <span className="text-2xl">{project.thumbnail || '🔧'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{project.idea}</p>
                  <p className="text-slate-500 text-xs">
                    {project.components?.length || 0} components · v{project.version || 1}
                  </p>
                </div>
                <span className="text-slate-600 text-xs shrink-0">
                  {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next goals */}
      <div className="bg-indigo-950 border border-indigo-900 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">🎯 Suggested Next Goals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: '⭐',
              title: 'Rate your prototypes',
              desc: 'Go to 3D Viewer → Rate This Prototype for each project',
              done: report.totals.avgRating > 0,
            },
            {
              icon: '🔨',
              title: 'Track your builds',
              desc: 'Use Build Timeline to track physical progress',
              done: report.buildProgresses.some(b => b.progress.percent > 50),
            },
            {
              icon: '🚀',
              title: 'Try showcase mode',
              desc: 'Present your prototype in Showcase Mode',
              done: false,
            },
          ].map(goal => (
            <div
              key={goal.title}
              className={`rounded-xl p-4 border ${
                goal.done
                  ? 'bg-green-950 border-green-900 opacity-70'
                  : 'bg-[#13131f] border-[#2e2e4e]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{goal.done ? '✅' : goal.icon}</span>
                <p className={`text-sm font-semibold ${goal.done ? 'text-green-400 line-through' : 'text-white'}`}>
                  {goal.title}
                </p>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">{goal.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressReport