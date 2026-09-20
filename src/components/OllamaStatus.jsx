import { useState, useEffect } from 'react'

export function useOllamaStatus() {
  const [status, setStatus] = useState('checking') // checking | online | offline
  const [model, setModel] = useState('')

  useEffect(function() {
    async function check() {
      try {
        const settings = localStorage.getItem('protomind_settings')
        const url = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
        const response = await fetch(url + '/api/tags', { signal: AbortSignal.timeout(3000) })
        const data = await response.json()
        const models = data.models || []
        const savedModel = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
        setModel(models[0]?.name || savedModel)
        setStatus('online')
      } catch(e) {
        setStatus('offline')
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return function() { clearInterval(interval) }
  }, [])

  return { status, model }
}

export function OllamaStatusBadge() {
  const { status, model } = useOllamaStatus()

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"/>
        <span>Checking AI...</span>
      </div>
    )
  }

  if (status === 'offline') {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"/>
        <span className="text-red-400">Ollama offline</span>
        <a href="https://ollama.ai" target="_blank" rel="noreferrer"
          className="text-indigo-400 hover:underline">Install →</a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500"/>
      <span className="text-green-400">{model || 'llama3.2'}</span>
    </div>
  )
}

export default OllamaStatusBadge
