import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

const COMMUNICATION_OPTIONS = [
  { id: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { id: 'bluetooth', label: 'Bluetooth', icon: '🔵' },
  { id: 'lora', label: 'LoRa', icon: '📡' },
  { id: 'gsm', label: 'GSM/4G', icon: '📱' },
  { id: 'zigbee', label: 'Zigbee', icon: '⚡' },
  { id: 'none', label: 'None', icon: '🚫' },
]

const POWER_OPTIONS = [
  { id: 'battery', label: 'Battery', icon: '🔋' },
  { id: 'usb', label: 'USB', icon: '🔌' },
  { id: 'adapter', label: 'AC Adapter', icon: '🔌' },
  { id: 'solar', label: 'Solar', icon: '☀️' },
  { id: 'poe', label: 'PoE', icon: '🌐' },
]

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting with electronics', icon: '🌱', color: '#22c55e' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Comfortable with Arduino basics', icon: '⚡', color: '#f59e0b' },
  { id: 'advanced', label: 'Advanced', desc: 'PCB design, embedded systems', icon: '🚀', color: '#6366f1' },
]

const TARGET_OPTIONS = [
  { id: 'prototype', label: 'Quick Prototype', icon: '🔧' },
  { id: 'college', label: 'College Project', icon: '🎓' },
  { id: 'product', label: 'Product Launch', icon: '🚀' },
  { id: 'research', label: 'Research', icon: '🔬' },
  { id: 'hackathon', label: 'Hackathon', icon: '⚡' },
  { id: 'competition', label: 'Competition', icon: '🏆' },
]

const WORKING_DAYS = [
  { id: 'mon', label: 'Mon' }, { id: 'tue', label: 'Tue' }, { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' }, { id: 'fri', label: 'Fri' }, { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
]

function MultiSelect({ options, selected, onChange, colorKey }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(function(opt) {
        const isSelected = selected.includes(opt.id)
        return (
          <button key={opt.id}
            type="button"
            onClick={function() {
              onChange(isSelected
                ? selected.filter(function(s) { return s !== opt.id })
                : [...selected, opt.id]
              )
            }}
            className={"px-3 py-2 rounded-xl border-2 text-sm font-medium transition flex items-center gap-1.5 " + (
              isSelected
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-[#0d0d1a] border-[#2e2e4e] text-slate-400 hover:border-indigo-500 hover:text-white"
            )}>
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map(function(_, i) {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all " + (
              done ? "bg-green-600 text-white" : active ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#050510]" : "bg-[#1e1e2e] text-slate-500"
            )}>
              {done ? "✓" : i + 1}
            </div>
            {i < total - 1 && (
              <div className={"h-0.5 w-12 transition-all " + (done ? "bg-green-600" : "bg-[#1e1e2e]")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ProjectWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    // Step 1 - Idea
    idea: '',
    purpose: '',
    users: '',
    // Step 2 - Requirements
    communication: [],
    power: [],
    hasDisplay: '',
    hasMobileApp: '',
    parameters: '',
    budget: '',
    existingComponents: '',
    skillLevel: '',
    target: [],
    physicalConstraints: '',
    additionalInfo: '',
    // Step 3 - Timeline
    months: 1,
    hoursPerDay: 2,
    workingDays: ['mon','tue','wed','thu','fri'],
    startDate: new Date().toISOString().split('T')[0],
  })

  function update(key, value) {
    setForm(function(prev) { return Object.assign({}, prev, { [key]: value }) })
  }

  async function handleGenerate() {
    if (!form.idea.trim()) { notify.warning('Please describe your idea'); return }
    setLoading(true)

    // Build full requirements context
    const requirements = {
      idea: form.idea,
      purpose: form.purpose,
      users: form.users,
      communication: form.communication,
      power: form.power,
      hasDisplay: form.hasDisplay,
      hasMobileApp: form.hasMobileApp,
      parameters: form.parameters,
      budget: form.budget,
      existingComponents: form.existingComponents,
      skillLevel: form.skillLevel,
      target: form.target,
      physicalConstraints: form.physicalConstraints,
      additionalInfo: form.additionalInfo,
      timeline: {
        months: form.months,
        hoursPerDay: form.hoursPerDay,
        workingDays: form.workingDays,
        startDate: form.startDate,
        totalDays: form.months * 30,
        totalHours: form.months * 30 * form.workingDays.length / 7 * form.hoursPerDay,
      }
    }

    try {
      const settings = localStorage.getItem('protomind_settings')
      const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
      const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

      const prompt = [
        'You are an expert electronics engineer and project planner.',
        'Based on these requirements, select the best components for this prototype.',
        'Requirements: ' + JSON.stringify(requirements),
        'Reply ONLY with valid JSON:',
        '{ "components": [{ "id": "...", "name": "...", "category": "...", "description": "...", "icon": "...", "price": "..." }] }',
        'Select 4-8 components. Categories: Microcontroller, Sensor, Display, Power, Communication, Actuator, Memory, Module',
      ].join('\n')

      const response = await fetch(ollamaUrl + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false }),
      })
      const data = await response.json()
      const match = data.response.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No JSON')
      const result = JSON.parse(match[0])

      // Save requirements and navigate with full context
      localStorage.setItem('protomind_current_requirements', JSON.stringify(requirements))

      navigate('/viewer', {
        state: {
          idea: form.idea,
          selectedComponents: result.components || [],
          requirements,
          fromWizard: true,
        }
      })
    } catch (e) {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  const STEPS = ['Your Idea', 'Requirements', 'Timeline']

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full opacity-5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full opacity-5 blur-3xl animate-pulse" style={{animationDelay:'1s'}} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-600 rounded-full opacity-5 blur-3xl animate-pulse" style={{animationDelay:'2s'}} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <button onClick={function() { navigate('/') }} className="text-slate-500 hover:text-white text-sm mb-6 inline-flex items-center gap-2 transition">
            ← Back to Home
          </button>
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-4 py-1.5 text-indigo-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Project Generation
          </div>
          <h1 className="text-4xl font-black mb-3">Create Your Prototype</h1>
          <p className="text-slate-400">Tell ProtoMind what you want to build. The more detail you give, the better the output.</p>
        </div>

        <StepIndicator current={step} total={3} />

        {/* Step 0 — Idea */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Describe Your Idea</h2>
              <p className="text-slate-500 text-sm mb-4">What do you want to build? Be as specific as you can.</p>
              <textarea
                value={form.idea}
                onChange={function(e) { update('idea', e.target.value) }}
                placeholder="Example: A smart plant watering system that monitors soil moisture and automatically waters the plant when it gets dry. It should send notifications to my phone via WiFi..."
                className="w-full h-32 bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder:text-slate-600"
              />
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Main Purpose</h2>
              <p className="text-slate-500 text-sm mb-4">What problem does it solve?</p>
              <input
                value={form.purpose}
                onChange={function(e) { update('purpose', e.target.value) }}
                placeholder="Monitor soil moisture and automate irrigation to prevent plant overwatering"
                className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Who Will Use It?</h2>
              <p className="text-slate-500 text-sm mb-4">Target users or audience</p>
              <input
                value={form.users}
                onChange={function(e) { update('users', e.target.value) }}
                placeholder="Home gardeners, people who travel frequently and can't water plants manually"
                className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={function() { navigate('/') }}
                className="flex-1 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl font-medium transition">
                Cancel
              </button>
              <button
                onClick={function() {
                  if (!form.idea.trim()) { notify.warning('Please describe your idea first'); return }
                  setStep(1)
                }}
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">
                Continue → Requirements
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Requirements */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Communication</h2>
              <p className="text-slate-500 text-sm mb-4">Select all that apply</p>
              <MultiSelect
                options={COMMUNICATION_OPTIONS}
                selected={form.communication}
                onChange={function(v) { update('communication', v) }}
              />
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Power Source</h2>
              <p className="text-slate-500 text-sm mb-4">How will it be powered?</p>
              <MultiSelect
                options={POWER_OPTIONS}
                selected={form.power}
                onChange={function(v) { update('power', v) }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h2 className="text-base font-bold mb-3">Display Required?</h2>
                <div className="flex gap-2">
                  {['Yes', 'No', 'Maybe'].map(function(opt) {
                    return (
                      <button key={opt} onClick={function() { update('hasDisplay', opt) }}
                        className={"flex-1 py-2 rounded-xl border-2 text-xs font-bold transition " + (form.hasDisplay === opt ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#050510] border-[#2e2e4e] text-slate-400 hover:border-indigo-500")}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h2 className="text-base font-bold mb-3">Mobile App?</h2>
                <div className="flex gap-2">
                  {['Yes', 'No', 'Maybe'].map(function(opt) {
                    return (
                      <button key={opt} onClick={function() { update('hasMobileApp', opt) }}
                        className={"flex-1 py-2 rounded-xl border-2 text-xs font-bold transition " + (form.hasMobileApp === opt ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#050510] border-[#2e2e4e] text-slate-400 hover:border-indigo-500")}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">What to Measure / Control?</h2>
              <p className="text-slate-500 text-sm mb-4">Parameters, sensors, actuators needed</p>
              <input
                value={form.parameters}
                onChange={function(e) { update('parameters', e.target.value) }}
                placeholder="Soil moisture, temperature, humidity, water pump control"
                className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h2 className="text-base font-bold mb-3">Budget (₹ or $)</h2>
                <input
                  value={form.budget}
                  onChange={function(e) { update('budget', e.target.value) }}
                  placeholder="₹2000 or $30"
                  className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                <h2 className="text-base font-bold mb-3">Size Constraints</h2>
                <input
                  value={form.physicalConstraints}
                  onChange={function(e) { update('physicalConstraints', e.target.value) }}
                  placeholder="Must fit in a 10x10cm box"
                  className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Your Experience Level</h2>
              <p className="text-slate-500 text-sm mb-4">This helps ProtoMind adjust the complexity</p>
              <div className="grid grid-cols-3 gap-3">
                {SKILL_LEVELS.map(function(skill) {
                  return (
                    <button key={skill.id}
                      onClick={function() { update('skillLevel', skill.id) }}
                      className={"rounded-xl border-2 p-4 text-left transition " + (form.skillLevel === skill.id ? "border-indigo-500 bg-indigo-950" : "border-[#2e2e4e] bg-[#050510] hover:border-indigo-800")}>
                      <div className="text-2xl mb-1">{skill.icon}</div>
                      <p className="text-white font-bold text-sm">{skill.label}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{skill.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Project Target</h2>
              <p className="text-slate-500 text-sm mb-4">What are you building this for?</p>
              <MultiSelect
                options={TARGET_OPTIONS}
                selected={form.target}
                onChange={function(v) { update('target', v) }}
              />
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Components You Already Have</h2>
              <p className="text-slate-500 text-sm mb-4">ProtoMind will prioritize using these</p>
              <input
                value={form.existingComponents}
                onChange={function(e) { update('existingComponents', e.target.value) }}
                placeholder="Arduino Uno, DHT22 sensor, breadboard"
                className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Anything Else ProtoMind Should Know?</h2>
              <p className="text-slate-500 text-sm mb-4">Any special requirements, challenges or context</p>
              <textarea
                value={form.additionalInfo}
                onChange={function(e) { update('additionalInfo', e.target.value) }}
                placeholder="It will be placed outdoors, needs to be waterproof. The water pump runs on 12V..."
                className="w-full h-24 bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={function() { setStep(0) }}
                className="flex-1 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl font-medium transition">
                ← Back
              </button>
              <button onClick={function() { setStep(2) }}
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">
                Continue → Timeline
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Timeline */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Project Timeline</h2>
              <p className="text-slate-500 text-sm mb-6">ProtoMind will build a personalized daily plan based on your availability</p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-medium">Available Time</label>
                    <span className="text-indigo-400 font-bold">{form.months} month{form.months > 1 ? 's' : ''}</span>
                  </div>
                  <input type="range" min="1" max="12" value={form.months}
                    onChange={function(e) { update('months', parseInt(e.target.value)) }}
                    className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>1 month</span><span>6 months</span><span>12 months</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-medium">Daily Hours Available</label>
                    <span className="text-indigo-400 font-bold">{form.hoursPerDay} hrs/day</span>
                  </div>
                  <input type="range" min="1" max="12" value={form.hoursPerDay}
                    onChange={function(e) { update('hoursPerDay', parseInt(e.target.value)) }}
                    className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>1 hr</span><span>6 hrs</span><span>12 hrs</span>
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium block mb-3">Working Days</label>
                  <div className="flex gap-2">
                    {WORKING_DAYS.map(function(day) {
                      const selected = form.workingDays.includes(day.id)
                      return (
                        <button key={day.id}
                          onClick={function() {
                            update('workingDays', selected
                              ? form.workingDays.filter(function(d) { return d !== day.id })
                              : [...form.workingDays, day.id]
                            )
                          }}
                          className={"flex-1 py-2 rounded-xl border-2 text-xs font-bold transition " + (selected ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#050510] border-[#2e2e4e] text-slate-500 hover:border-indigo-500")}>
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium block mb-2">Start Date</label>
                  <input type="date" value={form.startDate}
                    onChange={function(e) { update('startDate', e.target.value) }}
                    className="w-full bg-[#050510] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-gradient-to-br from-indigo-950 to-[#0d0d1a] border border-indigo-800 rounded-2xl p-6">
              <h3 className="text-indigo-400 text-xs font-semibold mb-3 uppercase tracking-wide">Your Project Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Idea</p>
                  <p className="text-white font-medium">{form.idea.slice(0, 50)}{form.idea.length > 50 ? '...' : ''}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Skill Level</p>
                  <p className="text-white font-medium capitalize">{form.skillLevel || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Timeline</p>
                  <p className="text-white font-medium">{form.months} month{form.months > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Daily Hours</p>
                  <p className="text-white font-medium">{form.hoursPerDay} hours/day</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Working Days</p>
                  <p className="text-white font-medium">{form.workingDays.length} days/week</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Total Hours</p>
                  <p className="text-indigo-400 font-bold">
                    ~{Math.round(form.months * 30 * form.workingDays.length / 7 * form.hoursPerDay)} hrs
                  </p>
                </div>
              </div>
              {form.target.length > 0 && (
                <div className="mt-3">
                  <p className="text-slate-500 text-xs mb-1">Target</p>
                  <div className="flex flex-wrap gap-1">
                    {form.target.map(function(t) {
                      const opt = TARGET_OPTIONS.find(function(o) { return o.id === t })
                      return opt ? (
                        <span key={t} className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">
                          {opt.icon} {opt.label}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={function() { setStep(1) }}
                className="flex-1 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl font-medium transition">
                ← Back
              </button>
              <button onClick={handleGenerate} disabled={loading}
                className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating your prototype...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Generate My Prototype</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectWizard
