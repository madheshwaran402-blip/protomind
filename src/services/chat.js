export async function sendChatMessage(messages, idea, components) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const systemContext = 'You are an expert electronics engineer and prototype advisor. ' +
    'The user is building: "' + idea + '". ' +
    'Components selected: ' + componentList + '. ' +
    'Give helpful, specific, concise answers. Remember the full conversation context. ' +
    'If asked about a previous topic, refer back to what was said. ' +
    'Keep answers to 2-4 sentences unless the user asks for more detail.'

  const conversationHistory = messages
    .map(m => (m.role === 'user' ? 'User: ' : 'Assistant: ') + m.content)
    .join('\n')

  const fullPrompt = systemContext + '\n\nConversation so far:\n' + conversationHistory + '\n\nAssistant:'

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: fullPrompt,
      stream: false,
    }),
  })

  if (!response.ok) throw new Error('Ollama not responding')

  const data = await response.json()
  return data.response.trim()
}

export async function generateQuickSuggestions(idea, components, lastMessage) {
  const componentList = components.map(c => c.name).join(', ')

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: 'Given this prototype: "' + idea + '" with components: ' + componentList + '. The last message was: "' + lastMessage + '". Suggest 3 very short follow-up questions the user might ask next. Reply ONLY with a JSON array of 3 strings, no explanation: ["question 1", "question 2", "question 3"]',
      stream: false,
    }),
  })

  const data = await response.json()
  try {
    const text = data.response
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {/* ignore suggestion errors */}
  return ['Will this work?', 'What voltage do I need?', 'Suggest improvements']
}