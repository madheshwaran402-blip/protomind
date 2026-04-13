export async function explainPrototype(idea, components, audienceLevel) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const audiencePrompts = {
    child: 'Explain like the person is 10 years old. Use simple words, fun analogies, and avoid all technical terms.',
    parent: 'Explain like you are talking to a non-technical parent. Be warm, clear, and focus on what the device does and why it is useful.',
    investor: 'Explain like you are pitching to a business investor. Focus on the problem it solves, market value, and innovation.',
    teacher: 'Explain like you are presenting to a school teacher for a science project. Be educational and structured.',
    friend: 'Explain casually like you are telling a friend about a cool project. Be enthusiastic and use everyday comparisons.',
  }

  const audienceGuide = audiencePrompts[audienceLevel] || audiencePrompts.friend

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are explaining an electronics prototype to someone. ' + audienceGuide + '\n\nPrototype idea: "' + idea + '"\nComponents used: ' + componentList + '\n\nReply ONLY with this exact JSON:\n\n{"title": "Catchy name for the prototype", "oneLiner": "One sentence that anyone can understand", "whatItDoes": "2-3 sentences explaining what it does in plain language", "howItWorks": "2-3 sentences explaining how it works without technical terms", "whyItsUseful": "2-3 sentences about real world benefits", "funFact": "One interesting or surprising fact about this prototype", "componentExplanations": [{"name": "Arduino Nano", "plainEnglish": "The brain of the device — like a tiny computer that controls everything"}], "analogy": "A relatable real world analogy for the whole prototype", "tagline": "A short marketing-style tagline"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}