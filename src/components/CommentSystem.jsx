import { useState, useEffect } from 'react'
import {
  getCommentsForProject,
  addComment,
  addReply,
  addReaction,
  flagComment,
  deleteComment,
} from '../services/commentService'
import { notify } from '../services/toast'

const REACTION_EMOJIS = ['👍', '❤️', '🔥', '🤯', '👏', '💡']

const AVATAR_OPTIONS = ['👨‍💻', '👩‍💻', '🧑‍🔧', '👨‍🔬', '👩‍🔬', '🤖', '👾', '🦾']

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = (now - date) / 1000

  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

function ReactionBar({ reactions, commentId, projectId, onReact }) {
  const hasReactions = Object.values(reactions || {}).some(function(c) { return c > 0 })
  return (
    <div className="flex items-center gap-1 flex-wrap mt-2">
      {hasReactions && Object.entries(reactions || {}).map(function(entry) {
        const emoji = entry[0]
        const count = entry[1]
        if (count === 0) return null
        return (
          <button
            key={emoji}
            onClick={function() { onReact(commentId, emoji) }}
            className="flex items-center gap-0.5 text-xs bg-[#1e1e2e] hover:bg-[#2e2e4e] border border-[#2e2e4e] rounded-full px-2 py-0.5 transition"
          >
            <span>{emoji}</span>
            <span className="text-slate-400">{count}</span>
          </button>
        )
      })}
      <div className="flex gap-0.5 ml-1">
        {REACTION_EMOJIS.map(function(emoji) {
          return (
            <button
              key={emoji}
              onClick={function() { onReact(commentId, emoji) }}
              className="text-sm hover:scale-125 transition-transform"
              title={'React with ' + emoji}
            >
              {emoji}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CommentCard({ comment, projectId, onReact, onReply, onFlag, onDelete, currentUser }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReplies, setShowReplies] = useState(false)

  function handleReply() {
    if (!replyText.trim()) return
    onReply(comment.id, replyText)
    setReplyText('')
    setShowReplyForm(false)
    setShowReplies(true)
  }

  return (
    <div className={'bg-[#13131f] border rounded-xl p-4 ' + (comment.flagged ? 'border-red-900 opacity-60' : 'border-[#2e2e4e]')}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{comment.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white text-xs font-semibold">{comment.author}</p>
            <p className="text-slate-600 text-xs">{formatTime(comment.createdAt)}</p>
            {comment.flagged && (
              <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded-full">
                Flagged
              </span>
            )}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{comment.text}</p>

          <ReactionBar
            reactions={comment.reactions}
            commentId={comment.id}
            projectId={projectId}
            onReact={onReact}
          />

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={function() { setShowReplyForm(!showReplyForm) }}
              className="text-xs text-slate-500 hover:text-indigo-400 transition"
            >
              💬 Reply
            </button>
            {(comment.replies || []).length > 0 && (
              <button
                onClick={function() { setShowReplies(!showReplies) }}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                {showReplies ? '▲' : '▼'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
            {!comment.flagged && (
              <button
                onClick={function() { onFlag(comment.id) }}
                className="text-xs text-slate-600 hover:text-red-400 transition ml-auto"
              >
                🚩
              </button>
            )}
            <button
              onClick={function() { onDelete(comment.id) }}
              className="text-xs text-slate-600 hover:text-red-400 transition"
            >
              🗑
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={function(e) { setReplyText(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleReply() }}
                placeholder="Write a reply..."
                className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs disabled:opacity-50 transition"
              >
                Send
              </button>
            </div>
          )}

          {showReplies && (comment.replies || []).length > 0 && (
            <div className="mt-3 space-y-2 border-l-2 border-[#2e2e4e] pl-3">
              {comment.replies.map(function(reply) {
                return (
                  <div key={reply.id} className="flex items-start gap-2">
                    <span className="text-lg shrink-0">{reply.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-white text-xs font-semibold">{reply.author}</p>
                        <p className="text-slate-600 text-xs">{formatTime(reply.createdAt)}</p>
                      </div>
                      <p className="text-slate-300 text-xs">{reply.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CommentSystem({ projectId, projectTitle }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState(
    localStorage.getItem('protomind_username') || ''
  )
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem('protomind_avatar') || '👨‍💻'
  )
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(function() {
    setComments(getCommentsForProject(projectId))
  }, [projectId])

  function refresh() {
    setComments(getCommentsForProject(projectId))
  }

  function handleSubmit() {
    if (!newComment.trim()) {
      notify.warning('Write a comment first')
      return
    }
    const name = authorName.trim() || 'Anonymous Builder'
    localStorage.setItem('protomind_username', name)
    localStorage.setItem('protomind_avatar', selectedAvatar)
    addComment(projectId, { text: newComment, author: name, avatar: selectedAvatar })
    setNewComment('')
    refresh()
    notify.success('Comment posted!')
  }

  function handleReact(commentId, emoji) {
    addReaction(projectId, commentId, emoji)
    refresh()
  }

  function handleReply(commentId, text) {
    const name = authorName.trim() || 'Anonymous Builder'
    addReply(projectId, commentId, { text, author: name, avatar: selectedAvatar })
    refresh()
    notify.success('Reply posted!')
  }

  function handleFlag(commentId) {
    flagComment(projectId, commentId)
    refresh()
    notify.info('Comment flagged for review')
  }

  function handleDelete(commentId) {
    deleteComment(projectId, commentId)
    refresh()
    notify.success('Comment deleted')
  }

  const sorted = [...comments].sort(function(a, b) {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'reactions') {
      const aR = Object.values(a.reactions || {}).reduce(function(s, c) { return s + c }, 0)
      const bR = Object.values(b.reactions || {}).reduce(function(s, c) { return s + c }, 0)
      return bR - aR
    }
    return 0
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">
          💬 Comments {comments.length > 0 && '(' + comments.length + ')'}
        </h3>
        {comments.length > 1 && (
          <select
            value={sortBy}
            onChange={function(e) { setSortBy(e.target.value) }}
            className="bg-[#13131f] border border-[#2e2e4e] rounded-lg px-2 py-1 text-slate-400 text-xs outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="reactions">Most reactions</option>
          </select>
        )}
      </div>

      {/* New comment form */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={function() { setShowAvatarPicker(!showAvatarPicker) }}
            className="text-2xl hover:scale-110 transition-transform"
            title="Change avatar"
          >
            {selectedAvatar}
          </button>
          <input
            value={authorName}
            onChange={function(e) { setAuthorName(e.target.value) }}
            placeholder="Your name (optional)"
            className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
          />
        </div>

        {showAvatarPicker && (
          <div className="flex gap-2 flex-wrap">
            {AVATAR_OPTIONS.map(function(av) {
              return (
                <button
                  key={av}
                  onClick={function() { setSelectedAvatar(av); setShowAvatarPicker(false) }}
                  className={'text-xl p-1.5 rounded-lg transition ' + (
                    selectedAvatar === av ? 'bg-indigo-600' : 'hover:bg-[#1e1e2e]'
                  )}
                >
                  {av}
                </button>
              )
            })}
          </div>
        )}

        <textarea
          value={newComment}
          onChange={function(e) { setNewComment(e.target.value) }}
          placeholder={'Share your thoughts on this prototype...'}
          className="w-full bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
          rows={3}
        />

        <button
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition disabled:opacity-50"
        >
          💬 Post Comment
        </button>
      </div>

      {/* Comments list */}
      {sorted.length === 0 ? (
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-3xl mb-2">💬</div>
          <p className="text-slate-500 text-sm">No comments yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(function(comment) {
            return (
              <CommentCard
                key={comment.id}
                comment={comment}
                projectId={projectId}
                onReact={handleReact}
                onReply={handleReply}
                onFlag={handleFlag}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommentSystem