import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects } from '../services/storage'
import { searchParts } from '../data/components'

const NAVIGATION_COMMANDS = [
  { id: 'home', label: 'Go to Home', icon: '🏠', path: '/', category: 'Navigation' },
  { id: 'history', label: 'Go to History', icon: '📂', path: '/history', category: 'Navigation' },
  { id: 'parts', label: 'Browse Parts Database', icon: '🔧', path: '/parts', category: 'Navigation' },
  { id: 'settings', label: 'Open Settings', icon: '⚙️', path: '/settings', category: 'Navigation' },
  { id: 'landing', label: 'View Landing Page', icon: '🌐', path: '/landing', category: 'Navigation' },
]

const ACTION_COMMANDS = [
  { id: 'new', label: 'Start New Prototype', icon: '⚡', path: '/', category: 'Actions' },
  { id: 'theme', label: 'Toggle Dark/Light Theme', icon: '🌙', action: 'toggleTheme', category: 'Actions' },
]

function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const projects = getAllProjects()

  useEffect(() => {
  if (!open) return
  const timer = setTimeout(() => {
    setQuery('')
    setSelected(0)
    inputRef.current?.focus()
  }, 50)
  return () => clearTimeout(timer)
}, [open])

  function getResults() {
    if (!query.trim()) {
      return [...NAVIGATION_COMMANDS, ...ACTION_COMMANDS]
    }

    const q = query.toLowerCase()
    const navResults = [...NAVIGATION_COMMANDS, ...ACTION_COMMANDS].filter(c =>
      c.label.toLowerCase().includes(q)
    )

    const projectResults = projects
      .filter(p => p.idea.toLowerCase().includes(q))
      .slice(0, 3)
      .map(p => ({
        id: 'project-' + p.id,
        label: p.idea,
        icon: p.thumbnail || '🔧',
        category: 'Your Projects',
        project: p,
      }))

    const partResults = searchParts(query)
      .slice(0, 3)
      .map(part => ({
        id: 'part-' + part.id,
        label: part.name,
        icon: part.icon,
        category: 'Parts Database',
        part,
      }))

    return [...navResults, ...projectResults, ...partResults]
  }

  const results = getResults()

  function handleSelect(item) {
    if (item.project) {
      navigate('/viewer', {
        state: {
          idea: item.project.idea,
          selectedComponents: item.project.components,
        },
      })
    } else if (item.part) {
      navigate('/parts')
    } else if (item.action === 'toggleTheme') {
      try {
        const stored = localStorage.getItem('protomind_settings')
        const s = stored ? JSON.parse(stored) : {}
        const newTheme = s.theme === 'light' ? 'dark' : 'light'
        localStorage.setItem('protomind_settings', JSON.stringify({ ...s, theme: newTheme }))
        const bg = newTheme === 'light' ? '#f8fafc' : '#0a0a0f'
        const col = newTheme === 'light' ? '#0f172a' : '#ffffff'
        document.body.setAttribute('style', 'background-color:' + bg + ';color:' + col)
      } catch { /* ignore */ }
    } else if (item.path) {
      navigate(item.path)
    }
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      if (results[selected]) handleSelect(results[selected])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!open) return null

  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e1e2e]">
          <span className="text-slate-500 text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, projects, parts..."
            className="flex-1 bg-transparent text-white text-base outline-none placeholder-slate-600"
          />
          <kbd className="text-xs text-slate-600 bg-[#1e1e2e] px-2 py-1 rounded-md">ESC</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              No results for "{query}"
            </div>
          )}

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-5 py-2 text-xs text-slate-600 font-semibold uppercase tracking-wide">
                {category}
              </div>
              {items.map((item) => {
                const flatIndex = results.indexOf(item)
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition ${
                      flatIndex === selected
                        ? 'bg-indigo-600'
                        : 'hover:bg-[#1e1e2e]'
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.label}</p>
                      {item.part && (
                        <p className="text-slate-500 text-xs">
                          {item.part.category} · ${item.part.price.min}–${item.part.price.max}
                        </p>
                      )}
                      {item.project && (
                        <p className="text-slate-500 text-xs">Saved project</p>
                      )}
                    </div>
                    <kbd className="text-xs text-slate-600">↵</kbd>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-[#1e1e2e] flex gap-6 text-xs text-slate-600">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
          <span className="ml-auto">⌘K to open</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette