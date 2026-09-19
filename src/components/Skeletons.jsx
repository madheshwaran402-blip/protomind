import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function SkeletonCard({ lines = 3, height = 'h-4' }) {
  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="h-5 bg-[#1e1e2e] rounded-lg w-1/3" />
      {Array.from({ length: lines }).map(function(_, i) {
        return <div key={i} className={"bg-[#1e1e2e] rounded-lg " + height} style={{ width: (60 + Math.random()*35) + '%' }} />
      })}
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map(function(_, i) {
        return <SkeletonCard key={i} lines={2} />
      })}
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-[#050510] p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-[#1e1e2e] rounded-xl w-1/4 mb-6" />
      <div className="h-4 bg-[#1e1e2e] rounded-lg w-1/2" />
      <div className="h-4 bg-[#1e1e2e] rounded-lg w-1/3" />
      <div className="grid grid-cols-3 gap-4 mt-8">
        {Array.from({ length: 6 }).map(function(_, i) {
          return <SkeletonCard key={i} />
        })}
      </div>
    </div>
  )
}

export function PageTransition({ children }) {
  const location = useLocation()
  const [show, setShow] = useState(false)
  useEffect(function() {
    setShow(false)
    const t = setTimeout(function() { setShow(true) }, 30)
    return function() { clearTimeout(t) }
  }, [location.pathname])
  return (
    <div className={"transition-all duration-300 " + (show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')}>
      {children}
    </div>
  )
}

export default SkeletonPage
