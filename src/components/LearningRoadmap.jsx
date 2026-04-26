import { useState } from 'react'
import { generateLearningRoadmap } from '../services/learningRoadmap'
import { notify } from '../services/toast'

const LEVEL_COLORS = {
  Beginner: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Intermediate: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Advanced: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  Expert: { color: 'text-purple-400', bg: 'bg-purple-950', border: 'border-purple-800' },
}

const RESOURCE_ICONS = {
  Video: '🎥',
  Article: '📄',
  Course: '🎓',
  Book: '📚',
  Project: '🔧',
  Tool: '⚙️',
}

const PLATFORM_COLORS = {
  YouTube: 'text-red-400',
  'Arduino.cc': 'text-blue-400',
  Coursera: 'text-blue-400',
  Udemy: 'text-orange-400',
  Instructables: 'text-yellow-400',
  GitHub: 'text-slate-400',
}

function PhaseCard({ phase, index, isLast }) {
  const [expanded, setExpanded] = useState(index === 0)
  const [completed, setCompleted] = useState(false)

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={() => setCompleted(!completed)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
            completed
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-[#13131f] border-[#2e2e4e] text-slate-400 hover:border-indigo-600'
          }`}
        >
          {completed ? '✓' : phase.phase}
        </button>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 min-h-8 ${completed ? 'bg-indigo-800' : 'bg-[#1e1e2e]'}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div
          className={`rounded-xl border overflow-hidden transition ${
            completed ? 'bg-indigo-950 border-indigo-900' : 'bg-[#13131f] border-[#2e2e4e]'
          }`}
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1e1e2e] transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-white text-sm font-semibold">Phase {phase.phase}: {phase.title}</p>
                <span className="text-xs bg-[#0d0d1a] text-slate-500 px-2 py-0.5 rounded-full">
                  {phase.duration}
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                {phase.skills?.length || 0} skills · {phase.resources?.length || 0} resources
              </p>
            </div>
            <span className="text-slate-600">{expanded ? '↑' : '↓'}</span>
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-3 border-t border-[#2e2e4e]">

              {/* Skills */}
              {phase.skills?.length > 0 && (
                <div className="pt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Skills to Learn</p>
                  <div className="flex flex-wrap gap-1">
                    {phase.skills.map((skill, i) => (
                      <span key={i} className="text-xs bg-[#0d0d1a] border border-[#2e2e4e] text-slate-300 px-2 py-1 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mini project */}
              {phase.project && (
                <div className="bg-indigo-950 border border-indigo-900 rounded-lg p-3">
                  <p className="text-xs text-indigo-400 font-semibold mb-1">🔧 Practice Project</p>
                  <p className="text-white text-sm">{phase.project}</p>
                </div>
              )}

              {/* Resources */}
              {phase.resources?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Learning Resources</p>
                  <div className="space-y-2">
                    {phase.resources.map((res, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg px-3 py-2">
                        <span className="text-lg shrink-0">{RESOURCE_ICONS[res.type] || '📖'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{res.title}</p>
                          <p className={`text-xs ${PLATFORM_COLORS[res.platform] || 'text-slate-500'}`}>
                            {res.platform}
                          </p>
                        </div>
                        <span className="text-xs text-slate-600 shrink-0">{res.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mark complete button */}
              <button
                onClick={() => setCompleted(!completed)}
                className={`w-full py-2 rounded-lg text-xs font-medium transition ${
                  completed
                    ? 'bg-indigo-900 text-indigo-300 hover:bg-slate-900 hover:text-slate-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {completed ? '✓ Phase Complete — click to undo' : '→ Mark Phase Complete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LearningRoadmap({ idea, components }) {
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('roadmap')

  async function handleGenerate() {
    setLoading(true)
    setRoadmap(null)
    try {
      const data = await generateLearningRoadmap(idea, components)
      setRoadmap(data)
      notify.success('Learning roadmap created! ' + (data.phases?.length || 0) + ' phases')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'roadmap', label: '🗺️ Roadmap' },
    { id: 'prereqs', label: '📋 Prerequisites' },
    { id: 'mistakes', label: '⚠️ Pitfalls' },
    { id: 'community', label: '👥 Community' },
  ]

  const level = roadmap ? LEVEL_COLORS[roadmap.overallLevel] || LEVEL_COLORS.Intermediate : null

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          Step-by-step learning path to successfully build this prototype
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🗺️ Mapping...' : '🗺️ Generate Roadmap'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is building your learning path...</p>
        </div>
      )}

      {roadmap && !loading && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`rounded-xl border p-3 text-center ${level?.bg} ${level?.border}`}>
              <p className="text-lg mb-1">🎯</p>
              <p className={`text-sm font-bold ${level?.color}`}>{roadmap.overallLevel}</p>
              <p className="text-slate-600 text-xs">Difficulty</p>
            </div>
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
              <p className="text-lg mb-1">⏱️</p>
              <p className="text-white text-sm font-bold">{roadmap.estimatedLearningTime}</p>
              <p className="text-slate-600 text-xs">Learning Time</p>
            </div>
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
              <p className="text-lg mb-1">📚</p>
              <p className="text-white text-sm font-bold">{roadmap.phases?.length || 0} Phases</p>
              <p className="text-slate-600 text-xs">Learning Path</p>
            </div>
          </div>

          {/* Final milestone */}
          {roadmap.finalMilestone && (
            <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-xs text-indigo-400 font-semibold mb-0.5">Final Milestone</p>
                <p className="text-white text-sm">{roadmap.finalMilestone}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Roadmap tab */}
          {activeTab === 'roadmap' && (
            <div>
              {roadmap.phases?.map((phase, index) => (
                <PhaseCard
                  key={index}
                  phase={phase}
                  index={index}
                  isLast={index === roadmap.phases.length - 1}
                />
              ))}
            </div>
          )}

          {/* Prerequisites tab */}
          {activeTab === 'prereqs' && (
            <div className="space-y-3">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  📋 Skills You Should Have First
                </h4>
                <div className="space-y-2">
                  {roadmap.prerequisiteSkills?.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-indigo-400 text-xs">✓</span>
                      <p className="text-slate-300 text-sm">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>

              {roadmap.certifications?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    🎓 Relevant Certifications
                  </h4>
                  <div className="space-y-2">
                    {roadmap.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[#0d0d1a] rounded-lg px-3 py-2">
                        <span className="text-yellow-400">🎓</span>
                        <p className="text-slate-300 text-sm">{cert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Common mistakes tab */}
          {activeTab === 'mistakes' && (
            <div className="bg-orange-950 border border-orange-800 rounded-xl p-5">
              <h4 className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-3">
                ⚠️ Common Mistakes to Avoid
              </h4>
              <ul className="space-y-3">
                {roadmap.commonMistakes?.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 text-sm mt-0.5">⚠️</span>
                    <p className="text-orange-100 text-sm leading-relaxed">{mistake}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Community tab */}
          {activeTab === 'community' && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs mb-2">Where to get help when you get stuck</p>
              {roadmap.communityResources?.map((resource, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3">
                  <span className="text-xl">👥</span>
                  <p className="text-slate-300 text-sm">{resource}</p>
                  <a
                    href={'https://www.google.com/search?q=' + encodeURIComponent(resource)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition shrink-0"
                  >
                    Find ↗️
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!roadmap && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🗺️</div>
          <p className="text-white font-semibold mb-1">Learning Roadmap Generator</p>
          <p className="text-slate-500 text-sm mb-4">Personalized learning path based on your prototype complexity</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Phase-by-phase</span>
            <span>✓ Practice projects</span>
            <span>✓ Resources</span>
            <span>✓ Common mistakes</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LearningRoadmap