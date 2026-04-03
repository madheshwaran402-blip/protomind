const CATEGORY_COLORS = {
  Microcontroller: { bg: '#1e1b4b', border: '#6366f1', text: '#a5b4fc' },
  Sensor: { bg: '#14293d', border: '#0ea5e9', text: '#7dd3fc' },
  Display: { bg: '#1a2e1a', border: '#22c55e', text: '#86efac' },
  Communication: { bg: '#2d1b1b', border: '#ef4444', text: '#fca5a5' },
  Power: { bg: '#2d2000', border: '#f59e0b', text: '#fcd34d' },
  Actuator: { bg: '#1f1635', border: '#a855f7', text: '#d8b4fe' },
  Module: { bg: '#1a2535', border: '#64748b', text: '#94a3b8' },
  Memory: { bg: '#1a2535', border: '#64748b', text: '#94a3b8' },
}

const WIRING_GUIDES = {
  Microcontroller: ['Connect VCC to 3.3V or 5V power', 'Connect GND to ground rail', 'Use GPIO pins for sensor data', 'Use I2C (SDA/SCL) for displays'],
  Sensor: ['Connect VCC to 3.3V', 'Connect GND to ground', 'Connect DATA/OUT to GPIO pin', 'Add 10kΩ pull-up resistor if needed'],
  Display: ['Connect VCC to 3.3V', 'Connect GND to ground', 'SDA → I2C data pin', 'SCL → I2C clock pin'],
  Communication: ['Connect VCC to 3.3V', 'Connect GND to ground', 'TX → RX of microcontroller', 'RX → TX of microcontroller'],
  Power: ['Connect positive to VIN or VCC rail', 'Connect negative to GND rail', 'Add capacitor for stability', 'Check voltage rating matches components'],
  Actuator: ['Connect control pin to PWM GPIO', 'Use separate power supply if high current', 'Add flyback diode for motors', 'Connect GND to common ground'],
  Module: ['Follow module-specific datasheet', 'Check voltage compatibility', 'Connect to appropriate communication bus'],
  Memory: ['Connect to SPI or I2C bus', 'Check chip select pin', 'Connect VCC to 3.3V'],
}

function ComponentDetail({ comp, onClose }) {
  if (!comp) return null

  const colors = CATEGORY_COLORS[comp.category] || CATEGORY_COLORS.Module
  const wiring = WIRING_GUIDES[comp.category] || WIRING_GUIDES.Module
  const buyLink = 'https://www.amazon.com/s?k=' + encodeURIComponent(comp.name)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 border"
        style={{ backgroundColor: '#0d0d1a', borderColor: colors.border }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{comp.icon}</div>
            <div>
              <h2 className="text-lg font-bold text-white">{comp.name}</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: colors.bg, color: colors.text, border: '1px solid ' + colors.border }}
              >
                {comp.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Why this component */}
        <div className="bg-[#13131f] rounded-xl p-4 mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Why This Component</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{comp.reason}</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#13131f] rounded-xl p-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Quantity</h3>
            <p className="text-white font-semibold">{comp.quantity || 1} unit{comp.quantity > 1 ? 's' : ''}</p>
          </div>
          <div className="bg-[#13131f] rounded-xl p-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Est. Price</h3>
            <p className="text-white font-semibold">$2 — $25 USD</p>
          </div>
        </div>

        {/* Wiring Guide */}
        <div className="bg-[#13131f] rounded-xl p-4 mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Wiring Guide</h3>
          <ul className="space-y-1.5">
            {wiring.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span style={{ color: colors.text }} className="font-bold mt-0.5">→</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Buy Link */}
        <a
          href={buyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl text-sm font-semibold text-center block transition"
          style={{ backgroundColor: colors.bg, color: colors.text, border: '1px solid ' + colors.border }}
        >
          🛒 Search on Amazon → {comp.name}
        </a>
      </div>
    </div>
  )
}

export default ComponentDetail