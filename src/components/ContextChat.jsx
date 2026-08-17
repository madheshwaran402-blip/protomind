import { useState, useEffect, useRef } from 'react'
import {
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
  sendContextMessage,
  QUICK_QUESTIONS,
} from '../services/contextChatService'
import { notify } from '../services/toast'

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const isCode = message.content.includes('```')

  function renderContent(content) {
    if (!content.includes('```')) return content
    const parts = content.split('```')
    return parts.map(function(part, i) {
      if (i % 2 === 1) {
        return (
          <pre key={i} className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg p-2 mt-1 text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {part.replace(/^[a-z]+\n/, '')}
          </pre>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className={'flex gap-2 mb-3 ' + (isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={'w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ' + (
        isUser ? 'bg-indigo-600' : 'bg-[#1e1e2e]'
      )}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={'max-w-xs rounded-2xl px-3 py-2 text-xs leading-relaxed ' + (
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-[#1e1e2e] text-slate-300 rounded-tl-sm'
      )}>
        {renderContent(message.content)}
        <p className={'text-xs mt-1 ' + (isUser ? 'text-indigo-300' : 'text-slate-600')}>
          {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function ContextChat({ idea, components }) {
  const projectId = 'chat_' + idea.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  const [messages, setMessages] = useState(getChatHistory(projectId))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickQ, setShowQuickQ] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(function() {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  useEffect(function() {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  async function handleSend(messageText) {
    const text = (messageText || input).trim()
    if (!text) return
    if (components.length === 0) {
      notify.warning('Add components to get context-aware answers')
      return
    }

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const newMessages = messages.concat([userMsg])
    setMessages(newMessages)
    saveChatMessage(projectId, userMsg)
    setInput('')
    setShowQuickQ(false)
    setLoading(true)

    try {
      const reply = await sendContextMessage(idea, components, text, newMessages)
      const assistantMsg = { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
      setMessages(function(prev) { return prev.concat([assistantMsg]) })
      saveChatMessage(projectId, assistantMsg)
    } catch {
      const errorMsg = { role: 'assistant', content: 'Sorry — is Ollama running? Start it with: ollama serve', timestamp: new Date().toISOString() }
      setMessages(function(prev) { return prev.concat([errorMsg]) })
      saveChatMessage(projectId, errorMsg)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    clearChatHistory(projectId)
    setMessages([])
    setShowQuickQ(true)
    notify.success('Chat cleared')
  }

  const unreadCount = 0

  return (
    <div className="space-y-3">

      {/* Toggle button */}
      <button
        onClick={function() { setIsOpen(!isOpen) }}
        className={'w-full flex items-center gap-3 p-3 rounded-xl border transition ' + (
          isOpen ? 'bg-indigo-950 border-indigo-700' : 'bg-[#13131f] border-[#2e2e4e] hover:border-indigo-700'
        )}
      >
        <div className="relative">
          <span className="text-2xl">🤖</span>
          {loading && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="text-white text-sm font-semibold">AI Prototype Assistant</p>
          <p className="text-slate-500 text-xs">
            {messages.length > 0 ? messages.length + ' messages' : 'Context-aware chat about your build'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={function(e) { e.stopPropagation(); handleClear() }}
              className="text-slate-600 hover:text-red-400 text-xs transition"
            >
              🗑
            </button>
          )}
          <span className="text-slate-500 text-sm">{isOpen ? '↑' : '↓'}</span>
        </div>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden">

          {/* Context badge */}
          <div className="px-4 py-2 bg-[#13131f] border-b border-[#2e2e4e] flex items-center gap-2">
            <span className="text-xs text-slate-500">Prototype context:</span>
            <div className="flex gap-1 flex-wrap flex-1">
              {components.slice(0, 3).map(function(comp, i) {
                return (
                  <span key={i} className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded-full">
                    {comp.icon} {comp.name.split(' ')[0]}
                  </span>
                )
              })}
              {components.length > 3 && (
                <span className="text-xs text-slate-600">+{components.length - 3} more</span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 max-h-72 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <p className="text-slate-500 text-xs mb-1">Ask anything about your prototype</p>
                <p className="text-slate-600 text-xs">I know your components and idea</p>
              </div>
            )}

            {messages.map(function(msg, i) {
              return <MessageBubble key={i} message={msg} />
            })}

            {loading && (
              <div className="flex gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#1e1e2e] flex items-center justify-center text-sm shrink-0">
                  🤖
                </div>
                <div className="bg-[#1e1e2e] rounded-2xl rounded-tl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {showQuickQ && messages.length === 0 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-slate-600 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_QUESTIONS.slice(0, 4).map(function(q, i) {
                  return (
                    <button
                      key={i}
                      onClick={function() { handleSend(q) }}
                      className="text-xs px-2 py-1 bg-[#13131f] border border-[#2e2e4e] hover:border-indigo-600 text-slate-400 hover:text-white rounded-lg transition"
                    >
                      {q}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 border-t border-[#1e1e2e] pt-3 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={function(e) { setInput(e.target.value) }}
              onKeyDown={function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={'Ask about your ' + (components[0]?.name || 'prototype') + '...'}
              className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500 placeholder-slate-600"
              disabled={loading}
            />
            <button
              onClick={function() { handleSend() }}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              {loading ? '...' : '→'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContextChat