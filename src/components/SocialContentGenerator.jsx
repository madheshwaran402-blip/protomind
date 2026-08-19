import { useState } from 'react'
import { generateSocialContent, saveSocialContent, getSocialContent } from '../services/socialContentService'
import { notify } from '../services/toast'

const PLATFORMS = [
  { id: 'twitter', label: '🐦 Twitter/X', color: '#1d9bf0' },
  { id: 'instagram', label: '📸 Instagram', color: '#e1306c' },
  { id: 'reddit', label: '🔴 Reddit', color: '#ff4500' },
  { id: 'linkedin', label: '💼 LinkedIn', color: '#0077b5' },
  { id: 'youtube', label: '▶️ YouTube', color: '#ff0000' },
]

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2000)
    notify.success((label || 'Content') + ' copied!')
  }

  return (
    <button onClick={handleCopy}
      className="text-xs text-slate-500 hover:text-white transition px-2 py-1 bg-[#0d0d1a] rounded-lg">
      {copied ? '✅' : '📋 Copy'}
    </button>
  )
}

function HashtagPills({ hashtags }) {
  if (!hashtags || hashtags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {hashtags.map(function(tag, i) {
        return (
          <span key={i} className="text-xs bg-[#1e1e2e] text-indigo-400 px-2 py-0.5 rounded-full">
            {tag.startsWith('#') ? tag : '#' + tag}
          </span>
        )
      })}
    </div>
  )
}

function SocialContentGenerator({ idea, components }) {
  const [content, setContent] = useState(getSocialContent(idea))
  const [loading, setLoading] = useState(false)
  const [activePlatform, setActivePlatform] = useState('twitter')

  async function handleGenerate() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    setLoading(true)
    try {
      const data = await generateSocialContent(idea, components)
      setContent(data)
      saveSocialContent(idea, data)
      notify.success('Social content ready for 5 platforms!')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function renderPlatformContent() {
    if (!content) return null

    if (activePlatform === 'twitter' && content.twitter) {
      return (
        <div className="space-y-3">
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Main Tweet</p>
              <CopyButton text={content.twitter.post + '\n\n' + (content.twitter.hashtags || []).join(' ')} label="Tweet" />
            </div>
            <p className="text-white text-sm leading-relaxed">{content.twitter.post}</p>
            <HashtagPills hashtags={content.twitter.hashtags} />
            <p className="text-slate-600 text-xs mt-2">{(content.twitter.post || '').length}/280 chars</p>
          </div>
          {content.twitter.threadPosts && content.twitter.threadPosts.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Thread Posts</p>
              <div className="space-y-2">
                {content.twitter.threadPosts.map(function(post, i) {
                  return (
                    <div key={i} className="border-l-2 border-[#1d9bf0] pl-3">
                      <p className="text-xs text-[#1d9bf0] mb-0.5">{i + 2}/</p>
                      <p className="text-slate-300 text-sm">{post}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activePlatform === 'instagram' && content.instagram) {
      return (
        <div className="space-y-3">
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Caption</p>
              <CopyButton text={content.instagram.caption + '\n\n' + (content.instagram.hashtags || []).join(' ')} label="Caption" />
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{content.instagram.caption}</p>
            <HashtagPills hashtags={content.instagram.hashtags} />
          </div>
          {content.instagram.storyIdeas && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Story Ideas</p>
              <ul className="space-y-1">
                {content.instagram.storyIdeas.map(function(idea, i) {
                  return <li key={i} className="text-slate-300 text-xs flex gap-2"><span className="text-pink-400">{i+1}.</span>{idea}</li>
                })}
              </ul>
            </div>
          )}
        </div>
      )
    }

    if (activePlatform === 'reddit' && content.reddit) {
      return (
        <div className="space-y-3">
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Post Title</p>
              <CopyButton text={content.reddit.title} label="Title" />
            </div>
            <p className="text-white font-bold text-sm">{content.reddit.title}</p>
          </div>
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Post Body</p>
              <CopyButton text={content.reddit.body} label="Body" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{content.reddit.body}</p>
          </div>
          {content.reddit.subreddits && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Suggested Subreddits</p>
              <div className="flex flex-wrap gap-1">
                {content.reddit.subreddits.map(function(sub, i) {
                  return (
                    <span key={i} className="text-xs bg-orange-950 text-orange-400 border border-orange-800 px-2 py-0.5 rounded-full">
                      {sub.startsWith('r/') ? sub : 'r/' + sub}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activePlatform === 'linkedin' && content.linkedin) {
      return (
        <div className="space-y-3">
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">LinkedIn Post</p>
              <CopyButton text={content.linkedin.post} label="Post" />
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{content.linkedin.post}</p>
            <HashtagPills hashtags={content.linkedin.tags} />
          </div>
        </div>
      )
    }

    if (activePlatform === 'youtube' && content.youtube) {
      return (
        <div className="space-y-3">
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Video Title</p>
              <CopyButton text={content.youtube.title} label="Title" />
            </div>
            <p className="text-white font-bold text-sm">{content.youtube.title}</p>
          </div>
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Description</p>
              <CopyButton text={content.youtube.description} label="Description" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{content.youtube.description}</p>
          </div>
          {content.youtube.chapters && content.youtube.chapters.length > 0 && (
            <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Video Chapters</p>
              <ul className="space-y-1">
                {content.youtube.chapters.map(function(ch, i) {
                  return <li key={i} className="text-slate-300 text-xs">{ch}</li>
                })}
              </ul>
            </div>
          )}
          <HashtagPills hashtags={content.youtube.tags} />
        </div>
      )
    }

    return <p className="text-slate-500 text-sm text-center py-4">Content not available for this platform</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-slate-400 text-sm">Generate ready-to-post social media content for 5 platforms</p>
        <button
          onClick={handleGenerate}
          disabled={loading || components.length === 0}
          className="px-5 py-2.5 bg-pink-700 hover:bg-pink-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
        >
          {loading ? '📱 Creating...' : '📱 Generate Content'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Creating content for 5 platforms...</p>
        </div>
      )}

      {content && !loading && (
        <>
          {/* Platform tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {PLATFORMS.map(function(platform) {
              return (
                <button
                  key={platform.id}
                  onClick={function() { setActivePlatform(platform.id) }}
                  className={'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition ' + (
                    activePlatform === platform.id ? 'text-white' : 'bg-[#13131f] text-slate-400 hover:text-white'
                  )}
                  style={activePlatform === platform.id ? { backgroundColor: platform.color } : {}}
                >
                  {platform.label}
                </button>
              )
            })}
          </div>

          {renderPlatformContent()}

          <button onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
            ↺ Regenerate Content
          </button>
        </>
      )}

      {!content && !loading && (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">📱</div>
          <p className="text-white font-semibold mb-1">Social Content Generator</p>
          <p className="text-slate-500 text-sm">Generate Twitter, Instagram, Reddit, LinkedIn and YouTube content</p>
        </div>
      )}
    </div>
  )
}

export default SocialContentGenerator