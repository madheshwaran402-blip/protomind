import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const COMMANDS = [
  // Navigation
  { id: 'home', label: 'Go to Home', icon: '🏠', path: '/', category: 'Navigate' },
  { id: 'wizard', label: 'Open Project Wizard', icon: '⚙️', path: '/wizard', category: 'Navigate' },
  { id: 'roadmap', label: 'View AI Roadmap', icon: '🗺️', path: '/roadmap', category: 'Navigate' },
  { id: 'protoscan', label: 'Open ProtoScan', icon: '📷', path: '/protoscan', category: 'Navigate' },
  { id: 'ide', label: 'Open Hardware IDE', icon: '💻', path: '/ide', category: 'Navigate' },
  { id: 'simulator', label: 'Open Simulator', icon: '🔌', path: '/simulator2', category: 'Navigate' },
  { id: 'esim', label: 'Open Enhanced Simulator', icon: '🎨', path: '/esim', category: 'Navigate' },
  { id: 'digitaltwin', label: 'Open Digital Twin', icon: '🔮', path: '/digitaltwin', category: 'Navigate' },
  { id: 'viewer', label: 'Open 3D Viewer', icon: '🔭', path: '/viewer', category: 'Navigate' },
  { id: 'dashboard', label: 'View Dashboard', icon: '📊', path: '/dashboard', category: 'Navigate' },
  { id: 'gallery', label: 'Browse Gallery', icon: '🖼️', path: '/gallery', category: 'Navigate' },
  { id: 'history', label: 'View History', icon: '📜', path: '/history', category: 'Navigate' },
  { id: 'templates', label: 'Browse Templates', icon: '📋', path: '/templates', category: 'Navigate' },
  { id: 'settings', label: 'Open Settings', icon: '⚙️', path: '/settings', category: 'Navigate' },
  { id: 'hub', label: 'Navigation Hub', icon: '🧭', path: '/hub', category: 'Navigate' },
  { id: 'landing', label: 'Landing Page', icon: '🏠', path: '/landing', category: 'Navigate' },
  // Actions
  { id: 'new_project', label: 'Start New Project', icon: '✨', path: '/wizard', category: 'Action' },
  { id: 'scan_component', label: 'Scan a Component', icon: '📷', path: '/protoscan', category: 'Action' },
  { id: 'open_ide', label: 'Write Firmware', icon: '💻', path: '/ide', category: 'Action' },
  { id: 'simulate_circuit', label: 'Simulate Circuit', icon: '🔌', path: '/simulator2', category: 'Action' },
  { id: 'connect_hardware', label: 'Connect Hardware', icon: '🔮', path: '/digitaltwin', category: 'Action' },
]

function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef()

  useEffect(function() {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(function() { inputRef.current?.focus() }, 50)
    }
  }, [open])

  const filtered = query.trim()
    ? COMMANDS.filter(function(cmd) {
        return cmd.label.toLowerCase().includes(query.toLowerCase()) ||
               cmd.category.toLowerCase().includes(query.toLowerCase())
      })
    : COMMANDS

  const grouped = {}
  filtered.forEach(function(cmd) {
    if (!grouped[cmd.category]) grouped[cmd.category] = []
    grouped[cmd.category].push(cmd)
  })

  const flatFiltered = filtered

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(function(s) { return Math.min(s + 1, flatFiltered.length - 1) })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(function(s) { return Math.max(s - 1, 0) })
    } else if (e.key === 'Enter') {
      const cmd = flatFiltered[selected]
      if (cmd) { navigate(cmd.path); onClose() }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  function execute(cmd) {
    navigate(cmd.path)
    onClose()
  }

  if (!open) return null

  let globalIdx = 0

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      onClick={function(e) { if (e.target === e.currentTarget) onClose() }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"/>

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e2e]">
          <span className="text-slate-500 text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={function(e) { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, features, actions..."
            className="flex-1 bg-transparent text-white outline-none text-base placeholder:text-slate-600"
          />
          <kbd className="text-xs text-slate-600 bg-[#1e1e2e] px-2 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {flatFiltered.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No results for "{query}"</p>
          ) : (
            Object.entries(grouped).map(function(entry) {
              const cat = entry[0], items = entry[1]
              return (
                <div key={cat}>
                  <p className="text-xs text-slate-600 uppercase tracking-wide px-4 py-1.5 font-medium">{cat}</p>
                  {items.map(function(cmd) {
                    const idx = globalIdx++
                    const isSelected = idx === selected
                    return (
                      <button key={cmd.id}
                        onClick={function() { execute(cmd) }}
                        onMouseEnter={function() { setSelected(idx) }}
                        className={"w-full flex items-center gap-3 px-4 py-2.5 text-left transition " + (
                          isSelected ? 'bg-indigo-700 text-white' : 'hover:bg-[#13131f] text-slate-300'
                        )}>
                        <span className="text-xl w-7 shrink-0">{cmd.icon}</span>
                        <div className="flex-1">
                          <span className="text-sm font-medium">{cmd.label}</span>
                        </div>
                        {isSelected && <kbd className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded">↵</kbd>}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[#1e1e2e] text-xs text-slate-600">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>ESC close</span>
          <span className="ml-auto">ProtoMind Search</span>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearch
