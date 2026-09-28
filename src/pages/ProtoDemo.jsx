import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ProtoDemo is now handled by ProtoDemoOverlay in App.jsx
// This page just triggers it via a custom event and redirects home
export default function ProtoDemo() {
  const navigate = useNavigate()
  useEffect(function() {
    // Fire event to trigger the overlay
    window.dispatchEvent(new CustomEvent('start-protodemo'))
    navigate('/', { replace: true })
  }, [])
  return null
}
