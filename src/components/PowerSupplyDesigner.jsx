import { useState } from 'react'
import {
  designPowerSupply,
  calculateVoltageDivider,
  calculateLinearRegulator,
  calculateBatteryLife,
} from '../services/powerSupplyService'
import { notify } from '../services/toast'

const TOPOLOGY_COLORS = {
  'Linear Regulator': '#6366f1',
  'Buck Converter': '#22c55e',
  'Boost Converter': '#f59e0b',
  'Buck-Boost': '#ef4444',
  'LDO Regulator': '#0ea5e9',
  'Charge Pump': '#a855f7',
}

function CalcCard({ title, icon, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
      <button
        onClick={function() { setOpen(!open) }}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1e1e2e] transition"
      >
        <span className="text-xl">{icon}</span>
        <p className="text-white font-semibold text-sm flex-1">{title}</p>
        <span className="text-slate-600">{open ? '↑' : '↓'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[#2e2e4e] pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

function VoltageDividerCalc() {
  const [vin, setVin] = useState('5')
  const [vout, setVout] = useState('3.3')
  const [r1, setR1] = useState('10000')
  const result = vin && vout && r1 ? calculateVoltageDivider(parseFloat(vin), parseFloat(vout), parseFloat(r1)) : null

  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-xs">Calculate R2 for a voltage divider</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Vin (V)', value: vin, setter: setVin },
          { label: 'Vout (V)', value: vout, setter: setVout },
          { label: 'R1 (Ω)', value: r1, setter: setR1 },
        ].map(function(field) {
          return (
            <div key={field.label}>
              <p className="text-xs text-slate-500 mb-1">{field.label}</p>
              <input
                type="number"
                value={field.value}
                onChange={function(e) { field.setter(e.target.value) }}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                step="any"
              />
            </div>
          )
        })}
      </div>
      {result && (
        <div className="bg-[#0d0d1a] rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">R2 =</span>
            <span className="text-indigo-400 font-bold text-lg">{result.r2} Ω</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Actual Vout', value: result.actualVout + ' V', color: 'text-green-400' },
              { label: 'Current', value: result.current + ' mA', color: 'text-blue-400' },
              { label: 'Power', value: result.power + ' mW', color: 'text-yellow-400' },
            ].map(function(item) {
              return (
                <div key={item.label} className="bg-[#13131f] rounded-lg p-2">
                  <p className="text-slate-500">{item.label}</p>
                  <p className={item.color + ' font-bold'}>{item.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function LinearRegCalc() {
  const [vin, setVin] = useState('9')
  const [vout, setVout] = useState('5')
  const [iload, setIload] = useState('0.5')
  const result = vin && vout && iload ? calculateLinearRegulator(parseFloat(vin), parseFloat(vout), parseFloat(iload)) : null

  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-xs">Calculate linear regulator dissipation (e.g. LM7805)</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Vin (V)', value: vin, setter: setVin },
          { label: 'Vout (V)', value: vout, setter: setVout },
          { label: 'Iload (A)', value: iload, setter: setIload },
        ].map(function(field) {
          return (
            <div key={field.label}>
              <p className="text-xs text-slate-500 mb-1">{field.label}</p>
              <input
                type="number"
                value={field.value}
                onChange={function(e) { field.setter(e.target.value) }}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                step="any"
              />
            </div>
          )
        })}
      </div>
      {result && (
        <div className="bg-[#0d0d1a] rounded-xl p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Voltage Drop', value: result.voltageDrop + ' V', color: 'text-orange-400' },
              { label: 'Power Dissipation', value: result.powerDissipation + ' W', color: result.heatsinkRequired ? 'text-red-400' : 'text-yellow-400' },
              { label: 'Efficiency', value: result.efficiency + '%', color: 'text-green-400' },
              { label: 'Package', value: result.recommendedPackage, color: 'text-indigo-400' },
            ].map(function(item) {
              return (
                <div key={item.label} className="bg-[#13131f] rounded-lg p-2">
                  <p className="text-slate-500">{item.label}</p>
                  <p className={item.color + ' font-bold text-xs'}>{item.value}</p>
                </div>
              )
            })}
          </div>
          {result.heatsinkRequired && (
            <div className="bg-red-950 border border-red-900 rounded-lg p-2">
              <p className="text-red-400 text-xs">⚠️ Heatsink required — high power dissipation!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BatteryLifeCalc() {
  const [capacity, setCapacity] = useState('2000')
  const [current, setCurrent] = useState('100')
  const [dutyCycle, setDutyCycle] = useState('30')
  const result = capacity && current && dutyCycle ? calculateBatteryLife(parseFloat(capacity), parseFloat(current), parseFloat(dutyCycle)) : null

  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-xs">Estimate battery life for your prototype</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Capacity (mAh)', value: capacity, setter: setCapacity },
          { label: 'Current (mA)', value: current, setter: setCurrent },
          { label: 'Duty Cycle (%)', value: dutyCycle, setter: setDutyCycle },
        ].map(function(field) {
          return (
            <div key={field.label}>
              <p className="text-xs text-slate-500 mb-1">{field.label}</p>
              <input
                type="number"
                value={field.value}
                onChange={function(e) { field.setter(e.target.value) }}
                className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-2 text-white text-sm outline-none"
                step="any"
              />
            </div>
          )
        })}
      </div>
      {result && (
        <div className="bg-[#0d0d1a] rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            {[
              { label: 'Hours', value: result.hours + 'h', color: 'text-blue-400' },
              { label: 'Days', value: result.days + 'd', color: 'text-green-400' },
              { label: 'Weeks', value: result.weeks + 'w', color: 'text-indigo-400' },
              { label: 'Avg Current', value: result.effectiveCurrent + ' mA', color: 'text-yellow-400' },
            ].map(function(item) {
              return (
                <div key={item.label} className="bg-[#13131f] rounded-xl p-3">
                  <p className={'text-xl font-black ' + item.color}>{item.value}</p>
                  <p className="text-slate-600 text-xs">{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function PowerSupplyDesigner({ idea, components }) {
  const [requirements, setRequirements] = useState({
    inputVoltage: '12',
    outputVoltage: '5',
    maxCurrent: '500',
    batteryPowered: false,
  })
  const [design, setDesign] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('design')

  function updateReq(key, value) {
    setRequirements(function(prev) {
      const next = Object.assign({}, prev)
      next[key] = value
      return next
    })
  }

  async function handleDesign() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    setDesign(null)
    try {
      const data = await designPowerSupply(requirements, components)
      setDesign(data)
      notify.success('Power supply design complete!')
    } catch {
      notify.error('Design failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const topoColor = design ? (TOPOLOGY_COLORS[design.topology] || '#6366f1') : '#6366f1'

  const TABS = [
    { id: 'design', label: '⚡ AI Design' },
    { id: 'divider', label: '÷ Divider' },
    { id: 'regulator', label: '🔌 Regulator' },
    { id: 'battery', label: '🔋 Battery' },
  ]

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131f] rounded-xl p-1 overflow-x-auto">
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

      {/* AI Design tab */}
      {activeTab === 'design' && (
        <div className="space-y-4">
          {/* Requirements */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Power Requirements</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Input Voltage</p>
                <div className="relative">
                  <input
                    type="number"
                    value={requirements.inputVoltage}
                    onChange={function(e) { updateReq('inputVoltage', e.target.value) }}
                    className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none pr-8"
                    step="any"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">V</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Output Voltage</p>
                <div className="relative">
                  <input
                    type="number"
                    value={requirements.outputVoltage}
                    onChange={function(e) { updateReq('outputVoltage', e.target.value) }}
                    className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none pr-8"
                    step="any"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">V</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Max Current</p>
                <div className="relative">
                  <input
                    type="number"
                    value={requirements.maxCurrent}
                    onChange={function(e) { updateReq('maxCurrent', e.target.value) }}
                    className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">mA</span>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={function() { updateReq('batteryPowered', !requirements.batteryPowered) }}
                  className={'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition w-full justify-center ' + (
                    requirements.batteryPowered
                      ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
                      : 'bg-[#0d0d1a] text-slate-400 border-[#2e2e4e]'
                  )}
                >
                  🔋 Battery Powered
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleDesign}
            disabled={loading || components.length === 0}
            className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? '⚡ Designing...' : '⚡ Design Power Supply'}
          </button>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Designing your power supply...</p>
            </div>
          )}
          {design && !loading && (
            <>
              {/* Design header */}
              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: topoColor + '15', borderColor: topoColor + '40' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <p className="text-white font-bold text-base">{design.design}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: topoColor + '20', color: topoColor }}
                      >
                        {design.topology}
                      </span>
                      <span className="text-green-400 text-xs">{design.efficiency} efficient</span>
                    </div>
                  </div>
                </div>
                {design.schematic && (
                  <div className="bg-[#0d0d1a] rounded-xl p-3 mt-3">
                    <p className="text-xs text-slate-500 mb-1">Circuit Description</p>
                    <p className="text-slate-300 text-xs font-mono leading-relaxed">{design.schematic}</p>
                  </div>
                )}
              </div>

              {/* Components needed */}
              {design.components && design.components.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl overflow-hidden">
                  <div className="px-4 py-2 border-b border-[#2e2e4e]">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Components Needed</p>
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      {design.components.map(function(comp, i) {
                        return (
                          <tr key={i} className={'border-b border-[#1e1e2e] last:border-0 ' + (i % 2 === 0 ? 'bg-[#13131f]' : 'bg-[#0d0d1a]')}>
                            <td className="px-4 py-2.5 text-white font-medium">{comp.name}</td>
                            <td className="px-4 py-2.5 text-indigo-400 font-mono">{comp.value}</td>
                            <td className="px-4 py-2.5 text-slate-500">{comp.reason}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Calculations */}
              {design.calculations && design.calculations.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Key Calculations</p>
                  <div className="space-y-2">
                    {design.calculations.map(function(calc, i) {
                      return (
                        <div key={i} className="flex items-center gap-3 bg-[#0d0d1a] rounded-lg p-2">
                          <p className="text-slate-400 text-xs flex-1">{calc.name}</p>
                          <p className="text-slate-600 text-xs font-mono">{calc.formula}</p>
                          <p className="text-indigo-400 text-xs font-bold">{calc.result}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {design.warnings && design.warnings.length > 0 && (
                <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
                  <p className="text-orange-400 text-xs font-semibold mb-2">⚠️ Warnings</p>
                  <ul className="space-y-1">
                    {design.warnings.map(function(w, i) {
                      return (
                        <li key={i} className="text-orange-200 text-xs flex items-start gap-2">
                          <span className="shrink-0">!</span> {w}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Alternatives */}
              {design.alternatives && design.alternatives.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Alternative Topologies</p>
                  {design.alternatives.map(function(alt, i) {
                    return (
                      <div key={i} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
                        <p className="text-white font-semibold text-sm mb-1">{alt.name}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <p className="text-green-400">{alt.pros}</p>
                          <p className="text-red-400">{alt.cons}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                onClick={handleDesign}
                className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
              >
                ↺ Redesign
              </button>
            </>
          )}

          {!design && !loading && (
            <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
              <div className="text-4xl mb-2">⚡</div>
              <p className="text-white font-semibold mb-1">Power Supply Designer</p>
              <p className="text-slate-500 text-sm">Set requirements above and AI will design your power circuit</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'divider' && (
        <CalcCard title="Voltage Divider Calculator" icon="÷">
          <VoltageDividerCalc />
        </CalcCard>
      )}

      {activeTab === 'regulator' && (
        <CalcCard title="Linear Regulator Calculator" icon="🔌">
          <LinearRegCalc />
        </CalcCard>
      )}

      {activeTab === 'battery' && (
        <CalcCard title="Battery Life Estimator" icon="🔋">
          <BatteryLifeCalc />
        </CalcCard>
      )}
    </div>
  )
}

export default PowerSupplyDesigner