import { useState, useEffect } from 'react'
import { registerToast } from '../services/toast'

const TOAST_STYLES = {
  success: {
    bg: 'bg-green-950',
    border: 'border-green-800',
    text: 'text-green-400',
    icon: '✅',
  },
  error: {
    bg: 'bg-red-950',
    border: 'border-red-800',
    text: 'text-red-400',
    icon: '❌',
  },
  info: {
    bg: 'bg-indigo-950',
    border: 'border-indigo-800',
    text: 'text-indigo-400',
    icon: 'ℹ️',
  },
  warning: {
    bg: 'bg-yellow-950',
    border: 'border-yellow-800',
    text: 'text-yellow-400',
    icon: '⚠️',
  },
}

function Toast({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info

  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 3000)
    return () => clearTimeout(hideTimer)
  }, [])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 max-w-sm ${style.bg} ${style.border} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <span className="text-lg shrink-0">{style.icon}</span>
      <p className={`text-sm font-medium ${style.text}`}>{toast.message}</p>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onRemove(toast.id), 300)
        }}
        className="ml-auto text-slate-600 hover:text-slate-400 text-xs transition shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    registerToast((newToast) => {
      setToasts(prev => [...prev, newToast])
    })
  }, [])

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}

export default ToastContainer