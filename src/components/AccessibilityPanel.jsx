import { useState } from 'react'
import { getA11ySettings, saveA11ySettings } from '../services/accessibility'
import { notify } from '../services/toast'

function Toggle({ value, onChange, label, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors relative focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        value ? 'bg-indigo-600' : 'bg-[#2e2e4e]'
      }`}
      aria-label={label}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
        value ? 'left-6' : 'left-0.5'
      }`} />
    </button>
  )
}

function AccessibilityPanel() {
  const [settings, setSettings] = useState(getA11ySettings())
  const [isOpen, setIsOpen] = useState(false)

  function update(key, value) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveA11ySettings(updated)
    notify.success('Accessibility setting updated')
  }

  const OPTIONS = [
    {
      key: 'highContrast',
      label: 'High Contrast',
      desc: 'Increases contrast for better visibility',
      icon: '🔆',
    },
    {
      key: 'largeText',
      label: 'Large Text',
      desc: 'Increases text size across the app',
      icon: '🔤',
    },
    {
      key: 'reduceMotion',
      label: 'Reduce Motion',
      desc: 'Disables animations and transitions',
      icon: '🧘',
    },
    {
      key: 'focusIndicators',
      label: 'Focus Indicators',
      desc: 'Shows visible outlines when using keyboard',
      icon: '⌨️',
    },
    {
      key: 'screenReaderMode',
      label: 'Screen Reader Mode',
      desc: 'Adds extra labels for screen readers',
      icon: '🔊',
    },
  ]

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-600 rounded-full flex items-center justify-center text-xl transition shadow-xl"
        aria-label="Accessibility settings"
        title="Accessibility settings"
      >
        ♿
      </button>

      {isOpen && (
        <div
          className="absolute bottom-14 left-0 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 w-72 shadow-2xl"
          role="dialog"
          aria-label="Accessibility Settings"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold text-sm">♿ Accessibility</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-white text-xs transition"
              aria-label="Close accessibility panel"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {OPTIONS.map(opt => (
              <div key={opt.key} className="flex justify-between items-center">
                <div>
                  <p className="text-white text-xs font-medium">
                    {opt.icon} {opt.label}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{opt.desc}</p>
                </div>
                <Toggle
                  value={settings[opt.key]}
                  onChange={v => update(opt.key, v)}
                  label={opt.label}
                  id={'a11y-' + opt.key}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e1e2e]">
            <p className="text-slate-600 text-xs">
              Keyboard: Tab to navigate, Enter to select, Esc to close dialogs
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessibilityPanel