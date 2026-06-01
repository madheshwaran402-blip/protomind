const COMMENTS_KEY = 'protomind_comments'

export function getAllComments() {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getCommentsForProject(projectId) {
  const all = getAllComments()
  return (all[projectId] || []).sort(function(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
}

export function addComment(projectId, comment) {
  const all = getAllComments()
  if (!all[projectId]) all[projectId] = []
  const newComment = {
    id: 'comment_' + Date.now(),
    text: comment.text,
    author: comment.author || 'Anonymous Builder',
    avatar: comment.avatar || '👤',
    reactions: {},
    replies: [],
    flagged: false,
    createdAt: new Date().toISOString(),
  }
  all[projectId].unshift(newComment)
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
  return newComment
}

export function addReply(projectId, commentId, reply) {
  const all = getAllComments()
  if (!all[projectId]) return
  all[projectId] = all[projectId].map(function(comment) {
    if (comment.id === commentId) {
      const newReply = {
        id: 'reply_' + Date.now(),
        text: reply.text,
        author: reply.author || 'Anonymous Builder',
        avatar: reply.avatar || '👤',
        createdAt: new Date().toISOString(),
      }
      return { ...comment, replies: [...(comment.replies || []), newReply] }
    }
    return comment
  })
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
}

export function addReaction(projectId, commentId, emoji) {
  const all = getAllComments()
  if (!all[projectId]) return
  all[projectId] = all[projectId].map(function(comment) {
    if (comment.id === commentId) {
      const reactions = { ...(comment.reactions || {}) }
      reactions[emoji] = (reactions[emoji] || 0) + 1
      return { ...comment, reactions }
    }
    return comment
  })
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
}

export function flagComment(projectId, commentId) {
  const all = getAllComments()
  if (!all[projectId]) return
  all[projectId] = all[projectId].map(function(comment) {
    if (comment.id === commentId) return { ...comment, flagged: true }
    return comment
  })
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
}

export function deleteComment(projectId, commentId) {
  const all = getAllComments()
  if (!all[projectId]) return
  all[projectId] = all[projectId].filter(function(c) { return c.id !== commentId })
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
}

export function getCommentStats() {
  const all = getAllComments()
  let total = 0
  let totalReactions = 0
  Object.values(all).forEach(function(comments) {
    total += comments.length
    comments.forEach(function(c) {
      Object.values(c.reactions || {}).forEach(function(count) {
        totalReactions += count
      })
    })
  })
  return { total, totalReactions }
}