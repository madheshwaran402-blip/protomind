import { useState, useEffect } from 'react'
import {
  createShareableLink,
  saveSharedProject,
  generateQRCodeUrl,
  getSocialShareLinks,
} from '../services/shareService'
import { notify } from '../services/toast'

function ShareModal({ project, onClose }) {
  const [shareUrl, setShareUrl] = useState('')
  const [shareId, setShareId] = useState('')
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(function() {
    if (project) {
      const id = saveSharedProject(project)
      const url = createShareableLink({ ...project, shareId: id })
      setShareId(id)
      setShareUrl(url)
      setQrUrl(generateQRCodeUrl(url))
    }
  }, [project])

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success('Link copied!')
  }

  const socialLinks = getSocialShareLinks(shareUrl, project?.idea || 'My Prototype')

  if (!project) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden"
        onClick={function(e) { e.stopPropagation() }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <div>
            <p className="text-white font-bold">🔗 Share Prototype</p>
            <p className="text-slate-500 text-xs">Anyone with the link can view this prototype</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Project preview */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
            <p className="text-white text-sm font-medium line-clamp-2">{project.idea}</p>
            <p className="text-slate-500 text-xs mt-1">
              {(project.components || []).length} components
            </p>
          </div>

          {/* Share URL */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Share Link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-slate-300 text-xs font-mono truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={'px-4 py-2 rounded-xl text-xs font-semibold transition ' + (
                  copied ? 'bg-green-700 text-green-100' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                )}
              >
                {copied ? '✅' : '📋 Copy'}
              </button>
            </div>
          </div>

          {/* QR Code toggle */}
          <div>
            <button
              onClick={function() { setShowQR(!showQR) }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              {showQR ? '▲ Hide QR Code' : '▼ Show QR Code'}
            </button>
            {showQR && qrUrl && (
              <div className="mt-3 flex justify-center">
                <div className="bg-white p-3 rounded-xl">
                  <img
                    src={qrUrl}
                    alt="QR Code"
                    className="w-40 h-40"
                    onError={function(e) { e.target.style.display = 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Social share */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Share on</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'Twitter', icon: '🐦', url: socialLinks.twitter, color: '#1d9bf0' },
                { name: 'Reddit', icon: '🔴', url: socialLinks.reddit, color: '#ff4500' },
                { name: 'WhatsApp', icon: '💬', url: socialLinks.whatsapp, color: '#25d366' },
                { name: 'Telegram', icon: '✈️', url: socialLinks.telegram, color: '#229ed9' },
              ].map(function(social) {
                return (
                  <button
                    key={social.name}
                    onClick={function() { window.open(social.url, '_blank') }}
                    className="flex flex-col items-center gap-1 p-2 bg-[#13131f] border border-[#2e2e4e] hover:border-slate-500 rounded-xl transition"
                  >
                    <span className="text-xl">{social.icon}</span>
                    <span className="text-xs text-slate-500">{social.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Share ID */}
          <p className="text-slate-700 text-xs text-center">Share ID: {shareId}</p>
        </div>
      </div>
    </div>
  )
}

export default ShareModal