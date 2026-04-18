import { useState, useEffect } from 'react'

function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)
  const [justCameBack, setJustCameBack] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      setJustCameBack(true)
      setShowBanner(true)
      setTimeout(() => {
        setShowBanner(false)
        setJustCameBack(false)
      }, 3000)
    }

    function handleOffline() {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner && isOnline) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-2 px-4 text-sm font-medium transition-all ${
      justCameBack
        ? 'bg-green-600 text-white'
        : 'bg-orange-600 text-white'
    }`}>
      {justCameBack ? (
        <span>✅ Back online! Everything is working again.</span>
      ) : (
        <span>
          📡 You are offline. AI features need internet for cloud sync — local features still work.
          <button
            onClick={() => setShowBanner(false)}
            className="ml-4 text-white opacity-70 hover:opacity-100 transition"
          >
            ✕
          </button>
        </span>
      )}
    </div>
  )
}

export default OfflineDetector