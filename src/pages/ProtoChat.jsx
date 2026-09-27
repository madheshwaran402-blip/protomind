import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

const QUICK_PROMPTS = [
  'How do I wire DHT22 to Arduino?',
  'Explain I2C protocol simply',
  'What resistor do I need for an LED?',
  'Best battery for ESP32 project?',
  'How to reduce power consumption?',
  'Explain PWM with an example',
  'What should I do today on my project?',
  'How do I debounce a button in code?',
]

function CodeBlock({ code }) {
  return (
    <pre className="bg-[#050510] border border-[#2e2e4e] rounded-xl p-3 my-2 overflow-x-auto text-green-400 text-xs font-mono whitespace-pre-wrap">
      {code}
    </pre>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'

  function renderContent(text) {
    const parts = text.split(/(```[\s\S]*?```)/g)
    return parts.map(function(part, i) {
      if (part.startsWith('```')) {
        const code = part.replace(/^```[a-z]*\n?/, '').replace(/```$/, '')
        return <CodeBlock key={i} code={code} />
      }
      const inlineParts = part.split(/(`[^`]+`)/g)
      return (
        <span key={i}>
          {inlineParts.map(function(p, j) {
            if (p.startsWith('`') && p.endsWith('`')) {
              return (
                <code key={j} className="bg-[#1e1e2e] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  {p.slice(1, -1)}
                </code>
              )
            }
            return <span key={j} style={{ whiteSpace: 'pre-wrap' }}>{p}</span>
          })}
        </span>
      )
    })
  }

  return (
    <div className={"flex gap-3 " + (isUser ? 'flex-row-reverse' : '')}>
      <div className={"w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 " + (isUser ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-700 to-purple-700')}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={"max-w-3xl rounded-2xl px-4 py-3 " + (
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : msg.error
          ? 'bg-red-950 border border-red-800 text-red-300 rounded-tl-sm'
          : 'bg-[#0d0d1a] border border-[#2e2e4e] text-slate-200 rounded-tl-sm'
      )}>
        <div className="text-sm leading-relaxed">
          {isUser ? msg.content : renderContent(msg.content)}
        </div>
        <p className="text-xs opacity-40 mt-1.5 text-right">{msg.time}</p>
      </div>
    </div>
  )
}

export default function ProtoChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi! I am ProtoMentor, your AI engineering assistant. I know about your current project and can help with circuit design, code, components, debugging, business strategy, or any general questions. What would you like to know?',
    time: new Date().toLocaleTimeString(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [projectContext, setProjectContext] = useState('')
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(function() {
    try {
      const req = JSON.parse(localStorage.getItem('protomind_current_requirements') || '{}')
      if (req.idea) {
        const comps = (req.components || []).map(function(c) { return c.name }).join(', ')
        setProjectContext('Project: ' + req.idea + (comps ? '. Components: ' + comps : ''))
      }
    } catch(e) {}
  }, [])

  useEffect(function() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userMsg = (text || input).trim()
    if (!userMsg) return
    setInput('')
    setLoading(true)

    const userEntry = { role: 'user', content: userMsg, time: new Date().toLocaleTimeString() }
    setMessages(function(prev) { return [...prev, userEntry] })

    try {
      const settings = localStorage.getItem('protomind_settings')
      const parsed = settings ? JSON.parse(settings) : {}
      const model = parsed.aiModel || 'llama3.2'
      const ollamaUrl = parsed.ollamaUrl || 'http://localhost:11434'

      const historyText = messages.slice(-6).map(function(m) {
        return m.role + ': ' + m.content
      }).join('\n---\n')

      const systemText = 'You are ProtoMentor, an expert AI engineering assistant inside ProtoMind. You specialize in electronics, Arduino/ESP32/Raspberry Pi programming, circuit design, IoT, and hardware prototyping. You also know about business and product development. Be helpful, clear, and practical. Give code examples when relevant.'
      const contextText = projectContext ? '\n\nContext: ' + projectContext : ''
      const promptText = systemText + contextText + '\n\nConversation:\n' + historyText + '\n\nUser: ' + userMsg + '\n\nProtoMentor:'

      const response = await fetch(ollamaUrl + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model, prompt: promptText, stream: false }),
      })
      const data = await response.json()
      const reply = (data.response || 'Sorry, I could not generate a response.').trim()

      setMessages(function(prev) {
        return [...prev, { role: 'assistant', content: reply, time: new Date().toLocaleTimeString() }]
      })
    } catch(e) {
      setMessages(function(prev) {
        return [...prev, {
          role: 'assistant',
          content: 'Cannot connect to AI. Make sure Ollama is running (ollama serve) and try again.',
          time: new Date().toLocaleTimeString(),
          error: true,
        }]
      })
    } finally {
      setLoading(false)
      setTimeout(function() { inputRef.current?.focus() }, 100)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. Ask me anything!',
      time: new Date().toLocaleTimeString(),
    }])
  }

  return (
    <div className="h-screen bg-[#050510] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0a0a14] border-b border-[#1e1e2e] flex-shrink-0">
        <button onClick={function() { navigate('/') }} className="text-slate-500 hover:text-white transition text-sm">
          Back
        </button>
        <div className="w-px h-5 bg-[#2e2e4e]" />
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-lg">
          🤖
        </div>
        <div>
          <p className="text-white font-black text-sm">ProtoMentor</p>
          <p className="text-slate-600 text-xs">General Purpose AI Assistant</p>
        </div>
        {projectContext && (
          <div className="hidden sm:flex items-center gap-1.5 ml-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-slate-500 text-xs truncate max-w-xs">{projectContext.slice(0, 55)}...</span>
          </div>
        )}
        <div className="flex-1" />
        <button onClick={clearChat} className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition">
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(function(msg, i) {
          return <MessageBubble key={i} msg={msg} />
        })}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — show only at start */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_PROMPTS.map(function(prompt, i) {
            return (
              <button key={i} onClick={function() { sendMessage(prompt) }}
                className="flex-shrink-0 px-3 py-2 bg-[#0d0d1a] border border-[#2e2e4e] hover:border-indigo-500 text-slate-400 hover:text-white rounded-xl text-xs transition">
                {prompt}
              </button>
            )
          })}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-[#0a0a14] border-t border-[#1e1e2e] flex-shrink-0">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={function(e) { setInput(e.target.value) }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — circuits, code, components, business strategy..."
            rows={1}
            className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] focus:border-indigo-500 rounded-2xl px-4 py-3 text-white text-sm outline-none resize-none transition placeholder:text-slate-600"
            style={{ maxHeight: '120px' }}
            onInput={function(e) {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={function() { sendMessage() }}
            disabled={loading || !input.trim()}
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition flex-shrink-0">
            ↑
          </button>
        </div>
        <p className="text-slate-700 text-xs text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
