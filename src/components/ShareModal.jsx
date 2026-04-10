import { useState } from 'react'
import { saveProjectCloud, toggleProjectPublic } from '../services/supabase'
import { notify } from '../services/toast'

function ShareModal({ idea, components, onClose }) {
  const [title, setTitle] = useState(idea.slice(0, 60))
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shareLink, setShareLink] = useState(null)

  async function handleShare() {
    setLoading(true)
    try {
      const saved = await saveProjectCloud(idea, components, isPublic, title)
      if (isPublic && saved?.share_id) {
        const link = window.location.origin + '/shared/' + saved.share_id
        setShareLink(link)
        notify.success('Prototype shared successfully!')
      } else {
        notify.success('Project saved to cloud!')
        onClose()
      }
    } catch (err) {
      notify.error(err.message || 'Share failed. Are you signed in?')
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareLink)
    notify.success('Link copied to clipboard!')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Share Prototype</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">✕</button>
        </div>

        {!shareLink ? (
          <>
            <div className="mb-4">
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">
                Prototype Title
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition"
                placeholder="Give your prototype a name..."
              />
            </div>

            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 mb-4">
              <p className="text-slate-400 text-xs mb-1">Idea</p>
              <p className="text-white text-sm italic">"{idea}"</p>
              <p className="text-slate-600 text-xs mt-2">{components.length} components</p>
            </div>

            <div
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition mb-4 ${
                isPublic
                  ? 'bg-indigo-950 border-indigo-800'
                  : 'bg-[#13131f] border-[#2e2e4e]'
              }`}
            >
              <div className={`w-10 h-6 rounded-full relative transition ${
                isPublic ? 'bg-indigo-600' : 'bg-[#2e2e4e]'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  isPublic ? 'left-4' : 'left-0.5'
                }`} />
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {isPublic ? '🌐 Public — Anyone can view' : '🔒 Private — Only you'}
                </p>
                <p className="text-slate-500 text-xs">
                  {isPublic ? 'Will appear in the public gallery' : 'Saved to your cloud account'}
                </p>
              </div>
            </div>

            <button
              onClick={handleShare}
              disabled={loading || !title.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Sharing...' : isPublic ? '🌐 Share Publicly' : '💾 Save to Cloud'}
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-white font-semibold mb-2">Prototype Shared!</h3>
            <p className="text-slate-400 text-sm mb-6">Anyone with this link can view your prototype</p>

            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <p className="text-indigo-400 text-xs truncate flex-1">{shareLink}</p>
              <button
                onClick={copyLink}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition shrink-0"
              >
                Copy
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-sm transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShareModal