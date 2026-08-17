const CHAT_HISTORY_KEY = 'protomind_chat_history'

export function getChatHistory(projectId) {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[projectId] || []
  } catch {
    return []
  }
}

export function saveChatMessage(projectId, message) {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[projectId]) all[projectId] = []
    all[projectId].push(message)
    if (all[projectId].length > 50) {
      all[projectId] = all[projectId].slice(-50)
    }
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(all))
  } catch {}
}

export function clearChatHistory(projectId) {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    delete all[projectId]
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(all))
  } catch {}
}

export async function sendContextMessage(idea, components, message, history) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const recentHistory = history.slice(-6).map(function(msg) {
    return msg.role + ': ' + msg.content
  }).join('\n')

  const prompt = [
    'You are an expert electronics assistant helping with this specific prototype.',
    'Prototype: "' + idea + '"',
    'Components: ' + componentList,
    '',
    'Recent conversation:',
    recentHistory,
    '',
    'User asks: ' + message,
    '',
    'Give a helpful, specific answer about THIS prototype. Be concise (3-5 sentences max).',
    'If asked for code, provide a short relevant snippet.',
    'Focus on the specific components listed above.',
  ].join('\n')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })

  const data = await response.json()
  return data.response || 'Sorry, I could not generate a response.'
}

export const QUICK_QUESTIONS = [
  'What are the main risks with this circuit?',
  'How do I wire these components together?',
  'What code libraries do I need?',
  'What is the total power consumption?',
  'How do I test this prototype?',
  'What could go wrong with this design?',
  'Suggest improvements to this prototype',
  'What are the best alternatives for my main component?',
]