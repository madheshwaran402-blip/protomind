import { useState, useEffect } from 'react'
import { notify } from '../services/toast'

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('pwa_dismissed') === 'true'
  )

  useEffect(() => {
    function handleBeforeInstall(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [dismissed])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      notify.success('ProtoMind installed! Find it in your apps.')
    }
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  function handleDismiss() {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', 'true')
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm">
      <div className="bg-[#0d0d1a] border border-indigo-700 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl shrink-0">⚡</div>
          <div>
            <p className="text-white font-semibold text-sm">Install ProtoMind</p>
            <p className="text-slate-400 text-xs mt-1">
              Add to your desktop for faster access. Works offline for local features!
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
          >
            ⬇️ Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt