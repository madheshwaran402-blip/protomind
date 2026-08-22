import { useState } from 'react'
import { generatePersonas, savePersonas, getPersonas } from '../services/customerPersonaService'
import { notify } from '../services/toast'

const PERSONA_COLORS = ['#6366f1', '#0ea5e9', '#22c55e']
const PERSONA_AVATARS = ['👨‍💼', '👩‍🔬', '🧑‍🎓']
const TECH_COLORS = { Beginner: 'text-green-400', Intermediate: 'text-yellow-400', Expert: 'text-red-400' }

function CustomerPersonas({ idea, components }) {
  const [result, setResult] = useState(getPersonas(idea))
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  async function handleGenerate() {
    if (components.length === 0) { notify.warning('Add components first'); return }
    setLoading(true)
    try {
      const data = await generatePersonas(idea, components)
      setResult(data)
      savePersonas(idea, data)
      notify.success('Personas generated!')
    } catch { notify.error('Failed - is Ollama running?') }
    finally { setLoading(false) }
  }

  const personas = result?.personas || []
  const persona = personas[selected]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate realistic customer personas to understand who will use your prototype</p>
        <button onClick={handleGenerate} disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-pink-700 hover:bg-pink-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0">
          {loading ? 'Creating...' : 'Generate Personas'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Creating customer personas...</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {personas.map(function(p, i) {
              const color = PERSONA_COLORS[i % PERSONA_COLORS.length]
              const avatar = PERSONA_AVATARS[i % PERSONA_AVATARS.length]
              return (
                <button key={i} onClick={function() { setSelected(i) }}
                  className={'p-3 rounded-xl border text-center transition ' + (selected === i ? 'border-2' : 'bg-[#13131f] border-[#2e2e4e]')}
                  style={selected === i ? { backgroundColor: color + '15', borderColor: color } : {}}>
                  <p className="text-3xl mb-1">{avatar}</p>
                  <p className={'text-xs font-bold ' + (selected === i ? 'text-white' : 'text-slate-400')}>{p.name}</p>
                  <p className="text-slate-600 text-xs">{p.age}</p>
                </button>
              )
            })}
          </div>

          {persona && (
            <div className="space-y-3">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-5xl">{PERSONA_AVATARS[selected % PERSONA_AVATARS.length]}</span>
                  <div>
                    <p className="text-white font-black text-xl">{persona.name}</p>
                    <p className="text-slate-400 text-sm">{persona.occupation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-500 text-xs">Age: {persona.age}</span>
                      {persona.techLevel && (
                        <span className={'text-xs ' + (TECH_COLORS[persona.techLevel] || 'text-slate-400')}>
                          Tech: {persona.techLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {persona.quote && (
                  <div className="bg-[#13131f] rounded-xl p-3 border-l-4" style={{ borderColor: PERSONA_COLORS[selected % PERSONA_COLORS.length] }}>
                    <p className="text-slate-300 text-sm italic">"{persona.quote}"</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {persona.goals && persona.goals.length > 0 && (
                  <div className="bg-green-950 border border-green-800 rounded-xl p-3">
                    <p className="text-green-400 text-xs font-semibold mb-2">Goals</p>
                    <ul className="space-y-1">
                      {persona.goals.map(function(g, i) {
                        return <li key={i} className="text-slate-300 text-xs flex gap-1"><span className="text-green-400 shrink-0">+</span>{g}</li>
                      })}
                    </ul>
                  </div>
                )}
                {persona.painPoints && persona.painPoints.length > 0 && (
                  <div className="bg-red-950 border border-red-800 rounded-xl p-3">
                    <p className="text-red-400 text-xs font-semibold mb-2">Pain Points</p>
                    <ul className="space-y-1">
                      {persona.painPoints.map(function(p, i) {
                        return <li key={i} className="text-slate-300 text-xs flex gap-1"><span className="text-red-400 shrink-0">-</span>{p}</li>
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {persona.willingToPay && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <p className="text-slate-500 text-xs">Willing to Pay</p>
                    <p className="text-emerald-400 font-black text-lg">{persona.willingToPay}</p>
                  </div>
                )}
                {persona.channels && persona.channels.length > 0 && (
                  <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                    <p className="text-slate-500 text-xs mb-1">Reach via</p>
                    <div className="flex flex-wrap gap-1">
                      {persona.channels.map(function(ch, i) {
                        return <span key={i} className="text-xs bg-[#0d0d1a] text-slate-400 border border-[#2e2e4e] px-1.5 py-0.5 rounded-full">{ch}</span>
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button onClick={handleGenerate} className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">Regenerate Personas</button>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-white font-semibold mb-1">Customer Persona Generator</p>
          <p className="text-slate-500 text-sm">Understand who will use your prototype with realistic user personas</p>
        </div>
      )}
    </div>
  )
}

export default CustomerPersonas
