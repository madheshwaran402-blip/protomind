import { useState, useEffect, useRef } from 'react'
import {
  getNotesForProject,
  addNote,
  updateNote,
  deleteNote,
  togglePin,
  exportAllNotes,
} from '../services/notesService2'
import { notify } from '../services/toast'

const CATEGORIES = ['General', 'Wiring', 'Code', 'Ideas', 'Problems', 'Shopping', 'Research', 'Milestones']

const NOTE_COLORS = {
  default: { bg: 'bg-[#13131f]', border: 'border-[#2e2e4e]', label: 'Default' },
  indigo: { bg: 'bg-indigo-950', border: 'border-indigo-800', label: 'Indigo' },
  green: { bg: 'bg-green-950', border: 'border-green-800', label: 'Green' },
  yellow: { bg: 'bg-yellow-950', border: 'border-yellow-800', label: 'Yellow' },
  red: { bg: 'bg-red-950', border: 'border-red-800', label: 'Red' },
  purple: { bg: 'bg-purple-950', border: 'border-purple-800', label: 'Purple' },
}

const CATEGORY_ICONS = {
  General: '📝',
  Wiring: '🔌',
  Code: '💻',
  Ideas: '💡',
  Problems: '🔍',
  Shopping: '🛒',
  Research: '📚',
  Milestones: '🏆',
}

const FORMAT_BUTTONS = [
  { label: 'B', action: 'bold', wrap: '**', title: 'Bold' },
  { label: 'I', action: 'italic', wrap: '_', title: 'Italic' },
  { label: 'H', action: 'heading', prefix: '## ', title: 'Heading' },
  { label: '•', action: 'bullet', prefix: '- ', title: 'Bullet list' },
  { label: '1.', action: 'numbered', prefix: '1. ', title: 'Numbered list' },
  { label: '[ ]', action: 'checkbox', prefix: '- [ ] ', title: 'Checkbox' },
  { label: '```', action: 'code', wrap: '`', title: 'Code' },
]

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = (now - date) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#1e1e2e;padding:1px 4px;border-radius:3px;font-family:monospace;font-size:11px">$1</code>')
    .replace(/^## (.*)/gm, '<h3 style="font-weight:bold;font-size:14px;color:#a5b4fc;margin:4px 0">$1</h3>')
    .replace(/^- \[ \] (.*)/gm, '<div style="display:flex;gap:6px;align-items:center"><input type="checkbox" disabled/><span>$1</span></div>')
    .replace(/^- \[x\] (.*)/gm, '<div style="display:flex;gap:6px;align-items:center"><input type="checkbox" checked disabled/><span style="text-decoration:line-through;opacity:0.5">$1</span></div>')
    .replace(/^- (.*)/gm, '<div style="display:flex;gap:6px;color:#cbd5e1">→ $1</div>')
    .replace(/^(\d+)\. (.*)/gm, '<div style="display:flex;gap:6px;color:#cbd5e1"><span style="color:#6366f1;font-weight:bold">$1.</span>$2</div>')
    .replace(/\n/g, '<br/>')
}

function NoteCard({ note, onEdit, onDelete, onPin }) {
  const colors = NOTE_COLORS[note.color] || NOTE_COLORS.default
  const catIcon = CATEGORY_ICONS[note.category] || '📝'

  return (
    <div className={'rounded-xl border overflow-hidden ' + colors.bg + ' ' + colors.border}>
      <div className="px-4 py-3">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-base">{catIcon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {note.pinned && <span className="text-yellow-400 text-xs">📌</span>}
              <p className="text-white font-semibold text-sm truncate">{note.title}</p>
              <span className="text-slate-600 text-xs ml-auto">{formatTime(note.updatedAt)}</span>
            </div>
            <span className="text-xs text-slate-500">{note.category}</span>
          </div>
        </div>

        {note.content && (
          <div
            className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-2"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content.slice(0, 200)) }}
          />
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.map(function(tag, i) {
              return (
                <span key={i} className="text-xs bg-[#0d0d1a] text-slate-500 px-1.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={function() { onEdit(note) }}
            className="flex-1 py-1.5 bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-400 rounded-lg text-xs transition"
          >
            ✏️ Edit
          </button>
          <button
            onClick={function() { onPin(note.id) }}
            className={'py-1.5 px-3 rounded-lg text-xs transition ' + (
              note.pinned ? 'bg-yellow-950 text-yellow-400' : 'bg-[#0d0d1a] hover:bg-[#1e1e2e] text-slate-500'
            )}
          >
            📌
          </button>
          <button
            onClick={function() { onDelete(note.id) }}
            className="py-1.5 px-3 bg-[#0d0d1a] hover:bg-red-950 text-slate-500 hover:text-red-400 rounded-lg text-xs transition"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}

function NoteEditorModal({ note, projectId, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [category, setCategory] = useState(note?.category || 'General')
  const [color, setColor] = useState(note?.color || 'default')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState(note?.tags || [])
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef(null)

  function applyFormat(action, wrap, prefix) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end)
    let newContent = content

    if (wrap) {
      const replacement = wrap + (selected || 'text') + wrap
      newContent = content.slice(0, start) + replacement + content.slice(end)
    } else if (prefix) {
      const lineStart = content.lastIndexOf('\n', start - 1) + 1
      newContent = content.slice(0, lineStart) + prefix + content.slice(lineStart)
    }

    setContent(newContent)
    setTimeout(function() {
      ta.focus()
      ta.setSelectionRange(start + (wrap ? wrap.length : (prefix ? prefix.length : 0)), start + (wrap ? wrap.length : (prefix ? prefix.length : 0)) + (selected.length || 4))
    }, 0)
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t)) {
      setTags(function(prev) { return prev.concat([t]) })
    }
    setTagInput('')
  }

  function removeTag(tag) {
    setTags(function(prev) { return prev.filter(function(t) { return t !== tag }) })
  }

  function handleSave() {
    if (!title.trim()) {
      notify.warning('Add a title')
      return
    }
    onSave({ title, content, category, color, tags })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={function(e) { e.stopPropagation() }}
      >
        {/* Modal header */}
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center gap-3">
          <p className="text-white font-bold flex-1">{note ? 'Edit Note' : 'New Note'}</p>
          <button
            onClick={function() { setShowPreview(!showPreview) }}
            className={'text-xs px-3 py-1.5 rounded-lg border transition ' + (
              showPreview ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-[#13131f] text-slate-400 border-[#2e2e4e]'
            )}
          >
            {showPreview ? '✏️ Edit' : '👁️ Preview'}
          </button>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Title */}
          <input
            value={title}
            onChange={function(e) { setTitle(e.target.value) }}
            placeholder="Note title..."
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2.5 text-white text-base font-semibold outline-none focus:border-indigo-500"
          />

          {/* Category and color */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={category}
              onChange={function(e) { setCategory(e.target.value) }}
              className="bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none"
            >
              {CATEGORIES.map(function(cat) {
                return <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
              })}
            </select>
            <div className="flex gap-1">
              {Object.entries(NOTE_COLORS).map(function(entry) {
                const colorKey = entry[0]
                const colorVal = entry[1]
                return (
                  <button
                    key={colorKey}
                    onClick={function() { setColor(colorKey) }}
                    className={'w-6 h-6 rounded-full border-2 transition ' + colorVal.bg + ' ' + (
                      color === colorKey ? 'border-white' : 'border-transparent'
                    )}
                    title={colorVal.label}
                  />
                )
              })}
            </div>
          </div>

          {/* Format toolbar */}
          {!showPreview && (
            <div className="flex gap-1 bg-[#13131f] rounded-xl p-1.5 flex-wrap">
              {FORMAT_BUTTONS.map(function(btn) {
                return (
                  <button
                    key={btn.action}
                    onClick={function() { applyFormat(btn.action, btn.wrap, btn.prefix) }}
                    title={btn.title}
                    className="px-2.5 py-1 bg-[#0d0d1a] hover:bg-[#2e2e4e] text-slate-400 hover:text-white rounded-lg text-xs font-mono transition"
                  >
                    {btn.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Content area */}
          {showPreview ? (
            <div
              className="min-h-40 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 text-slate-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) || '<p style="color:#4b5563">Nothing to preview yet...</p>' }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={function(e) { setContent(e.target.value) }}
              placeholder="Write your note here... Supports **bold**, _italic_, ## headings, - bullets, - [ ] checkboxes"
              className="w-full min-h-40 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 resize-none font-mono placeholder-slate-600 leading-relaxed"
              rows={8}
            />
          )}

          {/* Tags */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Tags</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map(function(tag, i) {
                return (
                  <span
                    key={i}
                    className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-1"
                  >
                    #{tag}
                    <button onClick={function() { removeTag(tag) }} className="text-indigo-600 hover:text-indigo-300">✕</button>
                  </span>
                )
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={function(e) { setTagInput(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') { addTag(); e.preventDefault() } }}
                placeholder="Add tag..."
                className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
              />
              <button onClick={addTag} className="px-3 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs">+</button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#1e1e2e] flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#1e1e2e] text-slate-400 rounded-xl text-sm">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
            💾 Save Note
          </button>
        </div>
      </div>
    </div>
  )
}

function NotesEditor({ idea, projectId }) {
  const id = projectId || 'notes_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  const [notes, setNotes] = useState(getNotesForProject(id))
  const [editingNote, setEditingNote] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterTag, setFilterTag] = useState('')

  function refresh() {
    setNotes(getNotesForProject(id))
  }

  function handleSave(noteData) {
    if (editingNote && editingNote.id) {
      updateNote(id, editingNote.id, noteData)
      notify.success('Note updated!')
    } else {
      addNote(id, noteData)
      notify.success('Note saved!')
    }
    setShowEditor(false)
    setEditingNote(null)
    refresh()
  }

  function handleEdit(note) {
    setEditingNote(note)
    setShowEditor(true)
  }

  function handleDelete(noteId) {
    deleteNote(id, noteId)
    refresh()
    notify.success('Note deleted')
  }

  function handlePin(noteId) {
    togglePin(id, noteId)
    refresh()
  }

  const allTags = [...new Set(notes.flatMap(function(n) { return n.tags }))]

  const filtered = notes.filter(function(note) {
    const matchSearch = !search ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some(function(t) { return t.includes(search.toLowerCase()) })
    const matchCat = filterCategory === 'All' || note.category === filterCategory
    const matchTag = !filterTag || note.tags.includes(filterTag)
    return matchSearch && matchCat && matchTag
  }).sort(function(a, b) {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  const pinnedCount = notes.filter(function(n) { return n.pinned }).length

  return (
    <div className="space-y-4">


      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={function() { setEditingNote(null); setShowEditor(true) }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
        >
          + New Note
        </button>
        {notes.length > 0 && (
          <button
            onClick={function() { exportAllNotes(id, idea); notify.success('Notes exported!') }}
            className="px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
          >
            ⬇️ Export
          </button>
        )}
        {pinnedCount > 0 && (
          <span className="flex items-center gap-1 px-3 py-2 bg-yellow-950 border border-yellow-800 rounded-xl text-yellow-400 text-xs">
            📌 {pinnedCount} pinned
          </span>
        )}
      </div>

      {/* Search and filters */}
      {notes.length > 2 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            <input
              value={search}
              onChange={function(e) { setSearch(e.target.value) }}
              placeholder="Search notes..."
              className="w-full bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl pl-8 pr-4 py-2 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={function(e) { setFilterCategory(e.target.value) }}
            className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl px-3 py-2 text-white text-xs outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(function(cat) {
              return <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
            })}
          </select>
        </div>
      )}

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {allTags.map(function(tag) {
            return (
              <button
                key={tag}
                onClick={function() { setFilterTag(filterTag === tag ? '' : tag) }}
                className={'text-xs px-2 py-1 rounded-full border transition ' + (
                  filterTag === tag
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-[#0d0d1a] text-slate-500 border-[#1e1e2e] hover:border-indigo-600'
                )}
              >
                #{tag}
              </button>
            )
          })}
        </div>
      )}

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-white font-semibold mb-1">Notes 2.0</p>
          <p className="text-slate-500 text-sm mb-2">
            {notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}
          </p>
          <p className="text-slate-600 text-xs">
            Supports **bold**, _italic_, ## headings, - bullets, - [ ] checkboxes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(function(note) {
            return (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
              />
            )
          })}
        </div>
      )}

      {showEditor && (
        <NoteEditorModal
          note={editingNote}
          projectId={id}
          onSave={handleSave}
          onClose={function() { setShowEditor(false); setEditingNote(null) }}
        />
      )}
    </div>
  )
}

export default NotesEditor