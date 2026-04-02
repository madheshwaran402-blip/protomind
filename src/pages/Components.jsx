import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepBar from '../components/StepBar'
import ComponentCard from '../components/ComponentCard'
import { analyseIdea } from '../services/claude'

function Components() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || 'A smart water bottle with temperature sensor'

  const [components, setComponents] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchComponents() {
      try {
        setLoading(true)
        const result = await analyseIdea(idea)
        setComponents(result)
        setSelected(result.map((c) => c.id))
      } catch {
        setError('Failed to analyse idea. Check your API key.')
      } finally {
        setLoading(false)
      }
    }
    fetchComponents()
  }, [idea])

  function toggleComponent(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function handleConfirm() {
  const selectedComponents = components.filter((c) => selected.includes(c.id))
  navigate('/layout', { state: { idea, selectedComponents } })
}

  return (
    <div className="min-h-screen page-enter">

      <StepBar currentStep={2} />

      <div className="px-16 pb-16">

        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-white text-sm mb-3 flex items-center gap-2 transition"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold mb-1">Suggested Components</h2>
          <p className="text-slate-400 text-sm">
            Idea: <span className="text-indigo-400 italic">"{idea}"</span>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
  <div className="flex flex-col items-center justify-center py-24 gap-6">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-indigo-900 rounded-full" />
      <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <div className="absolute inset-3 border-4 border-indigo-700 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
    </div>
    <div className="text-center">
      <p className="text-white font-semibold mb-1">AI is analysing your idea...</p>
      <p className="text-slate-500 text-sm">Selecting the best components for</p>
      <p className="text-indigo-400 text-sm italic mt-1">"{idea}"</p>
    </div>
    <div className="flex gap-2">
      {['Researching components', 'Checking compatibility', 'Finalising list'].map((step, i) => (
        <div key={step} className="flex items-center gap-1.5 text-xs text-slate-600 bg-[#0d0d1a] px-3 py-1.5 rounded-full border border-[#1e1e2e]">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: i * 200 + 'ms' }} />
          {step}
        </div>
      ))}
    </div>
  </div>
)}

        {/* Error State */}
        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-6 py-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Components Grid */}
        {!loading && !error && (
          <>
            <div className="bg-indigo-950 border border-indigo-800 rounded-xl px-5 py-3 mb-8 flex items-center gap-3">
              <span className="text-xl">🧠</span>
              <p className="text-indigo-300 text-sm">
                AI suggested these components specifically for your idea. Select the ones you want.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {components.map((comp) => (
                <ComponentCard
                  key={comp.id}
                  {...comp}
                  selected={selected.includes(comp.id)}
                  onToggle={() => toggleComponent(comp.id)}
                />
              ))}
            </div>

            <div className="flex justify-between items-center bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl px-8 py-5">
              <div>
                <p className="text-white font-semibold">
                  {selected.length} component{selected.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-slate-500 text-sm">Review placement in the next step</p>
              </div>
              <button
                onClick={handleConfirm}
                disabled={selected.length === 0}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition ${
                  selected.length > 0
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                    : 'bg-[#1e1e2e] text-slate-600 cursor-not-allowed'
                }`}
              >
                Confirm Components →
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Components