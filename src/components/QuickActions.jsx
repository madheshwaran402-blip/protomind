import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notify } from '../services/toast'

const QUICK_ACTIONS = [
  {
    id: 'new',
    label: 'New Prototype',
    icon: '⚡',
    color: '#6366f1',
    description: 'Start building',
    path: '/',
  },
  {
    id: 'ideas',
    label: 'Get Ideas',
    icon: '💡',
    color: '#f59e0b',
    description: 'Generate ideas',
    path: '/ideas',
  },
  {
    id: 'search',
    label: 'Find Parts',
    icon: '🔍',
    color: '#0ea5e9',
    description: 'Component search',
    path: '/search',
  },
  {
    id: 'kb',
    label: 'Learn',
    icon: '📚',
    color: '#22c55e',
    description: 'Knowledge base',
    path: '/kb',
  },
  {
    id: 'history',
    label: 'History',
    icon: '📂',
    color: '#a855f7',
    description: 'Saved prototypes',
    path: '/history',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: '📦',
    color: '#14b8a6',
    description: 'Component stock',
    path: '/inventory',
  },
]

const SHORTCUT_PAGES = [
  { key: '1', label: 'Home', path: '/' },
  { key: '2', label: 'Ideas', path: '/ideas' },
  { key: '3', label: 'Search', path: '/search' },
  { key: '4', label: 'History', path: '/history' },
  { key: '5', label: 'Gallery', path: '/gallery' },
  { key: '6', label: 'Dashboard', path: '/dashboard' },
  { key: '7', label: 'Inventory', path: '/inventory' },
  { key: '8', label: 'Knowledge Base', path: '/kb' },
  { key: '9', label: 'Settings', path: '/settings' },
]

function ShortcutOverlay({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6"
        onClick={function(e) { e.stopPropagation() }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-white font-bold text-lg">⌨️ Keyboard Shortcuts</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Navigation (press number)</p>
            <div className="grid grid-cols-3 gap-2">
              {SHORTCUT_PAGES.map(function(page) {
                return (
                  <div key={page.key} className="flex items-center gap-2 bg-[#13131f] rounded-lg px-3 py-2">
                    <kbd className="text-xs bg-[#0d0d1a] border border-[#2e2e4e] px-2 py-0.5 rounded text-slate-300 font-mono">
                      {page.key}
                    </kbd>
                    <span className="text-slate-400 text-xs">{page.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Global Shortcuts</p>
            <div className="space-y-2">
              {[
                { keys: ['⌘', 'K'], desc: 'Open command palette' },
                { keys: ['?'], desc: 'Show this overlay' },
                { keys: ['Esc'], desc: 'Close modals' },
                { keys: ['⌘', 'B'], desc: 'Build new prototype (go to home)' },
                { keys: ['⌘', 'H'], desc: 'Go to history' },
              ].map(function(shortcut, i) {
                return (
                  <div key={i} className="flex items-center justify-between bg-[#13131f] rounded-lg px-3 py-2">
                    <span className="text-slate-300 text-sm">{shortcut.desc}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map(function(key, j) {
                        return (
                          <kbd key={j} className="text-xs bg-[#0d0d1a] border border-[#2e2e4e] px-2 py-0.5 rounded text-slate-300 font-mono">
                            {key}
                          </kbd>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs text-center mt-4">Press ? anytime to show this overlay</p>
      </div>
    </div>
  )
}

function QuickActions() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const fabRef = useRef(null)

  useEffect(function() {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return

      if (e.key === '?') {
        setShowShortcuts(function(prev) { return !prev })
        return
      }

      if (e.key === 'Escape') {
        setOpen(false)
        setShowShortcuts(false)
        return
      }

      if (e.metaKey && e.key === 'b') {
        e.preventDefault()
        navigate('/')
        notify.info('Building new prototype!')
        return
      }

      if (e.metaKey && e.key === 'h') {
        e.preventDefault()
        navigate('/history')
        return
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const page = SHORTCUT_PAGES.find(function(p) { return p.key === e.key })
        if (page) {
          navigate(page.path)
          return
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return function() { window.removeEventListener('keydown', handleKey) }
  }, [navigate])

  useEffect(function() {
    setOpen(false)
  }, [location.pathname])

  useEffect(function() {
    function handleClickOutside(e) {
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return function() { document.removeEventListener('mousedown', handleClickOutside) }
  }, [open])

  if (location.pathname === '/showcase') return null

  return (
    <>
      {showShortcuts && <ShortcutOverlay onClose={function() { setShowShortcuts(false) }} />}

      <div className="fixed bottom-6 right-6 z-40" ref={fabRef}>
        {/* Action buttons */}
        {open && (
          <div className="absolute bottom-16 right-0 space-y-2 mb-2">
            {QUICK_ACTIONS.map(function(action, i) {
              return (
                <div
                  key={action.id}
                  className="flex items-center gap-3 justify-end"
                  style={{
                    animation: 'fadeSlideIn 0.15s ease forwards',
                    animationDelay: (i * 0.04) + 's',
                    opacity: 0,
                  }}
                >
                  <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-1.5 shadow-lg">
                    <p className="text-white text-xs font-medium whitespace-nowrap">{action.label}</p>
                    <p className="text-slate-500 text-xs">{action.description}</p>
                  </div>
                  <button
                    onClick={function() { navigate(action.path); setOpen(false) }}
                    className="w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl transition hover:scale-110"
                    style={{ backgroundColor: action.color }}
                  >
                    {action.icon}
                  </button>
                </div>
              )
            })}

            {/* Shortcuts button */}
            <div className="flex items-center gap-3 justify-end">
              <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-1.5 shadow-lg">
                <p className="text-white text-xs font-medium whitespace-nowrap">Keyboard Shortcuts</p>
                <p className="text-slate-500 text-xs">Press ? anytime</p>
              </div>
              <button
                onClick={function() { setShowShortcuts(true); setOpen(false) }}
                className="w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl transition hover:scale-110 bg-slate-700"
              >
                ⌨️
              </button>
            </div>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={function() { setOpen(function(prev) { return !prev }) }}
          className={
            'w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-all duration-200 ' +
            (open ? 'bg-red-600 hover:bg-red-500 rotate-45' : 'bg-indigo-600 hover:bg-indigo-500')
          }
          aria-label="Quick actions"
        >
          {open ? '✕' : '⚡'}
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

export default QuickActions