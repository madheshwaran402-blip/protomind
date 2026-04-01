import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepBar from '../components/StepBar'
import ComponentCard from '../components/ComponentCard'

const SAMPLE_COMPONENTS = [
  {
    id: 1,
    icon: '🧠',
    name: 'Arduino Uno R3',
    category: 'Microcontroller',
    reason: 'The brain of your prototype. Reads sensor data and controls outputs.',
    quantity: 1,
  },
  {
    id: 2,
    icon: '🌡️',
    name: 'DHT22 Sensor',
    category: 'Sensor',
    reason: 'Measures temperature and humidity with high accuracy.',
    quantity: 1,
  },
  {
    id: 3,
    icon: '📡',
    name: 'HC-05 Bluetooth Module',
    category: 'Communication',
    reason: 'Sends data wirelessly to your phone or computer.',
    quantity: 1,
  },
  {
    id: 4,
    icon: '🔋',
    name: 'Li-Po Battery 3.7V',
    category: 'Power',
    reason: 'Rechargeable power source. Keeps the device portable.',
    quantity: 1,
  },
  {
    id: 5,
    icon: '💡',
    name: 'OLED Display 0.96"',
    category: 'Display',
    reason: 'Shows readings in real time directly on the device.',
    quantity: 1,
  },
  {
    id: 6,
    icon: '⚡',
    name: 'TP4056 Charging Module',
    category: 'Power',
    reason: 'Safely charges the Li-Po battery via USB.',
    quantity: 1,
  },
]

function Components() {
  const location = useLocation()
  const navigate = useNavigate()
  const idea = location.state?.idea || 'A smart water bottle with temperature sensor'

  const [selected, setSelected] = useState([1, 2, 3, 4])

  function toggleComponent(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function handleConfirm() {
    navigate('/viewer', { state: { idea, selectedComponents: selected } })
  }

  return (
    <div className="min-h-screen">

      <StepBar currentStep={2} />

      <div className="px-16 pb-16">

        {/* Header */}
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

        {/* AI Notice Banner */}
        <div className="bg-indigo-950 border border-indigo-800 rounded-xl px-5 py-3 mb-8 flex items-center gap-3">
          <span className="text-xl">🧠</span>
          <p className="text-indigo-300 text-sm">
            These components are AI-suggested based on your idea. Select the ones you want to include, then confirm.
          </p>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {SAMPLE_COMPONENTS.map((comp) => (
            <ComponentCard
              key={comp.id}
              {...comp}
              selected={selected.includes(comp.id)}
              onToggle={() => toggleComponent(comp.id)}
            />
          ))}
        </div>

        {/* Bottom Bar */}
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

      </div>
    </div>
  )
}

export default Components