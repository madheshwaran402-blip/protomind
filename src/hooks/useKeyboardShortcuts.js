import { useEffect } from 'react'

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    function handleKeyDown(e) {
      shortcuts.forEach(({ key, meta, ctrl, action }) => {
        const keyMatch = e.key.toLowerCase() === key.toLowerCase()
        if (meta && e.metaKey && keyMatch) {
          e.preventDefault()
          action()
        } else if (ctrl && e.ctrlKey && keyMatch) {
          e.preventDefault()
          action()
        }
      })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}