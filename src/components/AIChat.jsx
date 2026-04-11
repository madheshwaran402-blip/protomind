import { useState, useRef, useEffect } from 'react'
import { sendChatMessage, generateQuickSuggestions } from '../services/chat'
import { notify } from '../services/toast'

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  const isSystem = msg.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center mb-3">
        <span className="text-xs text-slate-600 bg-[#13131f] px-3 py-1 rounded-full">
          {msg.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center text-xs mr-2 shrink-0 mt-0.5">
          🧠
        </div>
      )}
      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-indigo-600 text-white rounded-br-sm'
          : 'bg-[#1e1e2e] text-slate-300 rounded-bl-sm'
      }`}>
        {!isUser && (
          <span className="text-indigo-400 font-semibold text-xs block mb-1">
            ProtoMind AI
          </span>
        )}
        {msg.content}
        {msg.timestamp && (
          <div className={`text-xs mt-1 ${isUser ? 'text-indigo-300' : 'text-slate-600'}`}>
            {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center text-xs mr-2 shrink-0">
        🧠
      </div>
      <div className="bg-[#1e1e2e] px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function AIChat({ idea, components }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Your 3D prototype is ready! I have full context of your idea and all ' + components.length + ' components. Ask me anything — I remember our entire conversation.',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([
    'Will this work?',
    'What voltage do I need?',
    'Suggest improvements',
  ])
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text) {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMsg = {
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setMessageCount(prev => prev + 1)

    try {
      const allMessages = [...messages, userMsg]
      const response = await sendChatMessage(allMessages, idea, components)

      const assistantMsg = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, assistantMsg])

      if (messageCount % 3 === 0) {
        try {
          const newSuggestions = await generateQuickSuggestions(idea, components, messageText)
          setSuggestions(newSuggestions)
        } catch {/* ignore suggestion errors */}
      }

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection lost. Make sure Ollama is running with: ollama serve',
        timestamp: Date.now(),
      }])
      notify.error('AI disconnected — check Ollama')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared! Starting fresh. I still know about your prototype: "' + idea + '" with ' + components.length + ' components.',
      timestamp: Date.now(),
    }])
    setMessageCount(0)
    notify.info('Chat cleared')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">🧠 AI Engineering Assistant</h3>
          <p className="text-xs text-slate-600">{messageCount} message{messageCount !== 1 ? 's' : ''} · Full context memory</p>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-slate-600 hover:text-slate-400 transition"
        >
          Clear ✕
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-4 overflow-y-auto mb-3"
        style={{ height: '380px' }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            disabled={loading}
            className="text-xs bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
          placeholder="Ask anything about your prototype..."
          className="flex-1 bg-[#13131f] border border-[#2e2e4e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm transition disabled:opacity-50"
        >
          {loading ? '...' : '→'}
        </button>
      </div>

      {/* Context info */}
      <p className="text-xs text-slate-700 text-center mt-2">
        AI knows: {idea.slice(0, 40)}{idea.length > 40 ? '...' : ''} · {components.length} components
      </p>
    </div>
  )
}

export default AIChat