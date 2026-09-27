import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

function ProtoChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am ProtoMentor, your AI engineering assistant. I know about your current project and can help with circuit design, code, components, debugging, business strategy, or any general questions. What would you like to know?',
      time: new Date().toLocaleTimeString()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [projectContext, setProjectContext] = useState('')
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(function() {
    try {
      const req = JSON.parse(localStorage.getItem('protomind_current_requirements') || '{}')
      if (req.idea) {
        const components = (req.components || []).map(function(c) { return c.name }).join(', ')
        setProjectContext('Current project: ' + req.idea + (components ? '. Components: ' + components : ''))
      }
    } catch(e) {}
  }, [])

  useEffect(function() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const QUICK_PROMPTS = [
    'How do I wire DHT22 to Arduino?',
    'Explain I2C protocol simply',
    'What resistor do I need for an LED?',
    'Debug my servo not moving',
    'Best battery for ESP32 project?',
    'How to reduce power consumption?',
    'Explain my roadmap for today',
    'What is PWM and how do I use it?',
  ]

  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')
    setLoading(true)

    const userEntry = { role: 'user', content: userMsg, time: new Date().toLocaleTimeString() }
    setMessages(function(prev) { return [...prev, userEntry] })

    try {
      const settings = localStorage.getItem('protomind_settings')
      const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
      const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

      // Build conversation history
      const history = messages.slice(-8).map(function(m) {
        return m.role + ': ' + m.content
      }).join('\n'))

      const systemPrompt = 'You are ProtoMentor, an expert AI engineering assistant inside ProtoMind. You specialize in electronics, Arduino/ESP32/Raspberry Pi programming, circuit design, IoT, and hardware prototyping. You also know about business, pitch decks, and product development. Be helpful, clear, and practical. Give code examples when relevant. ' + (projectContext ? '

Context: ' + projectContext : '')

      const prompt = systemPrompt + '

Conversation so far:
' + history + '

User: ' + userMsg + '

ProtoMentor:'

      const response = await fetch(ollamaUrl + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false })
      })
      const data = await response.json()
      const reply = data.response || 'Sorry, I could not generate a response.'

      setMessages(function(prev) {
        return [...prev, { role: 'assistant', content: reply.trim(), time: new Date().toLocaleTimeString() }]
      })
    } catch(e) {
      setMessages(function(prev) {
        return [...prev, {
          role: 'assistant',
          content: 'I cannot connect to AI right now. Make sure Ollama is running (ollama serve) and try again.',
          time: new Date().toLocaleTimeString(),
          error: true
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
      content: 'Chat cleared! Ask me anything about your project or electronics.',
      time: new Date().toLocaleTimeString()
    }])
  }

  // Format message content with code highlighting
  function formatMessage(text) {
    // Split by code blocks
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g)
    return parts.map(function(part, i) {
      if (part.startsWith('```')) {
        const code = part.slice(3).replace(/^[a-z]+
/, '').replace(/```$/, '')
        return (
          <pre key={i} className="bg-[#050510] border border-[#2e2e4e] rounded-xl p-3 my-2 overflow-x-auto text-green-400 text-xs font-mono">
            {code}
          </pre>
        )
      } else if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-[#1e1e2e] text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>
      }
      return <span key={i} style={{whiteSpace:'pre-wrap'}}>{part}</span>
    })
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col" style={{height:'100vh'}}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0a0a14] border-b border-[#1e1e2e] flex-shrink-0">
        <button onClick={function(){navigate('/')}} className="text-slate-500 hover:text-white transition">
          ← Home
        </button>
        <div className="w-px h-5 bg-[#2e2e4e]"/>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-lg">🤖</div>
        <div>
          <p className="text-white font-black">ProtoMentor</p>
          <p className="text-slate-600 text-xs">General Purpose AI Assistant</p>
        </div>
        {projectContext && (
          <div className="flex items-center gap-1.5 ml-4 hidden sm:flex">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"/>
            <span className="text-slate-500 text-xs truncate max-w-64">{projectContext.slice(0, 60)}...</span>
          </div>
        )}
        <div className="flex-1"/>
        <button onClick={clearChat} className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition">
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(function(msg, i) {
          const isUser = msg.role === 'user'
          return (
            <div key={i} className={"flex gap-3 " + (isUser ? 'flex-row-reverse' : '')}>
              {/* Avatar */}
              <div className={"w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 " + (isUser ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-700 to-purple-700')}>
                {isUser ? '👤' : '🤖'}
              </div>
              {/* Bubble */}
              <div className={"max-w-[75%] rounded-2xl px-4 py-3 " + (
                isUser
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : msg.error
                  ? 'bg-red-950 border border-red-800 text-red-300 rounded-tl-sm'
                  : 'bg-[#0d0d1a] border border-[#2e2e4e] text-slate-200 rounded-tl-sm'
              )}>
                <div className="text-sm leading-relaxed">
                  {isUser ? msg.content : formatMessage(msg.content)}
                </div>
                <p className="text-xs opacity-40 mt-1.5 text-right">{msg.time}</p>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-sm">🤖</div>
            <div className="bg-[#0d0d1a] border border-[#2e2e4e] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_PROMPTS.map(function(prompt, i) {
            return (
              <button key={i} onClick={function(){sendMessage(prompt)}}
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
            placeholder="Ask anything — circuit design, code help, component selection, business strategy..."
            rows={1}
            className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] focus:border-indigo-500 rounded-2xl px-4 py-3 text-white text-sm outline-none resize-none transition placeholder:text-slate-600"
            style={{maxHeight:'120px', overflowY:'auto'}}
            onInput={function(e) {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={function(){sendMessage()}}
            disabled={loading || !input.trim()}
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-slate-700 text-xs text-center mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

export default ProtoChat
