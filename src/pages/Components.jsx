import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepBar from '../components/StepBar'
import ComponentCard from '../components/ComponentCard'
import { analyseIdea } from '../services/claude'
import { notify } from '../services/toast'

function Components() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || 'A smart water bottle with temperature sensor'

  const [components, setComponents] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  useEffect(() => {
    async function fetchComponents() {
      try {
        setLoading(true)
        const result = await analyseIdea(idea)
        setComponents(result)
        setSelected(result.map((c) => c.id))
      } catch {
        setError('Failed to analyse idea. Make sure Ollama is running.')
        notify.error('AI failed — is Ollama running?')
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

  function handleDragStart(id) {
    setDraggedId(id)
  }

  function handleDragOver(e, id) {
    e.preventDefault()
    setDragOverId(id)
  }

  function handleDrop(id) {
    if (!draggedId || draggedId === id) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const oldIndex = components.findIndex(c => c.id === draggedId)
    const newIndex = components.findIndex(c => c.id === id)

    const updated = [...components]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)

    setComponents(updated)
    setDraggedId(null)
    setDragOverId(null)
    notify.info('Component reordered')
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

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-6 py-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-indigo-950 border border-indigo-800 rounded-xl px-5 py-3 mb-4 flex items-center gap-3">
              <span className="text-xl">🧠</span>
              <p className="text-indigo-300 text-sm">
  AI suggested these {components.length} components for your idea. Drag to reorder, click to select or deselect.
</p>
            </div>

            <p className="text-slate-600 text-xs mb-4">
              💡 Drag any component card to reorder it
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={() => handleDragStart(comp.id)}
                  onDragOver={(e) => handleDragOver(e, comp.id)}
                  onDrop={() => handleDrop(comp.id)}
                  onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}
                  className={`transition-all duration-150 ${
                    draggedId === comp.id ? 'opacity-40 scale-95' : ''
                  } ${
                    dragOverId === comp.id && draggedId !== comp.id
                      ? 'ring-2 ring-indigo-400 scale-105'
                      : ''
                  }`}
                  style={{ cursor: 'grab' }}
                >
                  <ComponentCard
                    {...comp}
                    selected={selected.includes(comp.id)}
                    onToggle={() => toggleComponent(comp.id)}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl px-8 py-5">
              <div>
                <p className="text-white font-semibold">
                  {selected.length} component{selected.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-slate-500 text-sm">Drag to reorder · click to select/deselect</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelected(components.map(c => c.id))
                    notify.info('All components selected')
                  }}
                  className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    setSelected([])
                    notify.info('All components deselected')
                  }}
                  className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
                >
                  Deselect All
                </button>
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Components