import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSharedProject, incrementViews } from '../services/shareService'

function ShareView() {
  const { shareId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(function() {
    const found = getSharedProject(shareId)
    if (found) {
      setProject(found)
      incrementViews(shareId)
    } else {
      setNotFound(true)
    }
  }, [shareId])

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-white px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Prototype Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">This share link may have expired or been removed.</p>
        <button
          onClick={function() { navigate('/') }}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
        >
          ⚡ Build Your Own Prototype
        </button>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const components = project.components || []

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-[#1e1e2e] bg-[#0d0d1a] px-4 sm:px-10 py-4 flex items-center justify-between">
        <div
          className="text-lg font-bold text-indigo-400 cursor-pointer"
          onClick={function() { navigate('/') }}
        >
          ⚡ ProtoMind
        </div>
        <button
          onClick={function() { navigate('/') }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
        >
          Build Your Own →
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Project header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">{project.thumbnail || '⚡'}</div>
          <h1 className="text-2xl sm:text-3xl font-black mb-3 leading-tight">{project.idea}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 flex-wrap">
            <span>🔧 {components.length} components</span>
            <span>·</span>
            <span>👁️ {project.views || 0} views</span>
            <span>·</span>
            <span>📅 {new Date(project.sharedAt || project.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}</span>
          </div>
        </div>

        {/* Component grid */}
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-base mb-4">🔧 Components</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {components.map(function(comp, i) {
              return (
                <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-2">
                  <span className="text-2xl shrink-0">{comp.icon || '🔧'}</span>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{comp.name}</p>
                    <p className="text-slate-500 text-xs">{comp.category}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cost estimate */}
        {components.length > 0 && (
          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6 mb-6">
            <h2 className="text-white font-bold text-base mb-4">💰 Estimated Cost</h2>
            <div className="space-y-2">
              {components.map(function(comp, i) {
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-lg shrink-0">{comp.icon || '🔧'}</span>
                    <p className="text-slate-300 text-sm flex-1">{comp.name}</p>
                    <p className="text-emerald-400 text-sm font-mono">{comp.estimatedPrice || '$5-15'}</p>
                  </div>
                )
              })}
              <div className="border-t border-[#2e2e4e] pt-2 mt-2 flex justify-between">
                <p className="text-white font-bold">Total Estimate</p>
                <p className="text-emerald-400 font-bold">
                  ${components.reduce(function(sum, c) {
                    const price = c.estimatedPrice || '$5'
                    const num = parseInt(price.replace(/[^0-9]/g, '')) || 5
                    return sum + num
                  }, 0).toFixed(0)} — ${components.reduce(function(sum, c) {
                    const price = c.estimatedPrice || '$15'
                    const matches = price.match(/\d+/g) || ['15']
                    const num = parseInt(matches[matches.length - 1]) || 15
                    return sum + num
                  }, 0).toFixed(0)} USD
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-white font-bold text-lg mb-2">Want to build this?</h3>
          <p className="text-slate-400 text-sm mb-4">
            Use ProtoMind to generate 3D previews, code, wiring guides and more for any electronics prototype.
          </p>
          <button
            onClick={function() { navigate('/') }}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition"
          >
            🚀 Start Building for Free →
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareView