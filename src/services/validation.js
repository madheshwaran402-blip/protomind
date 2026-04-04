export async function validatePrototype(idea, components) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: 'You are an expert electronics engineer. Validate this prototype:\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\n\nCheck for:\n1. Missing critical components\n2. Power/voltage mismatches\n3. Communication protocol conflicts\n4. Missing protection circuits\n5. Logical component gaps\n\nReply ONLY with this exact JSON:\n{"valid": true, "score": 85, "issues": [], "warnings": [], "suggestions": [], "verdict": "one sentence summary"}\n\nIf problems found:\n{"valid": false, "score": 45, "issues": ["specific issue 1", "specific issue 2"], "warnings": ["warning 1"], "suggestions": ["fix suggestion 1", "fix suggestion 2"], "verdict": "one sentence summary"}\n\nScore is 0-100. Issues are blocking problems. Warnings are non-blocking. Suggestions are improvements.',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

export async function validateComponentChange(idea, components, change) {
  const componentList = components.map(c => c.name + ' (' + c.category + ')').join(', ')

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: 'You are an expert electronics engineer. A user wants to make this change to their prototype:\n\nIdea: "' + idea + '"\nCurrent components: ' + componentList + '\nProposed change: "' + change + '"\n\nWill this change work? Reply ONLY with this exact JSON:\n{"approved": true, "reason": "why it works", "impact": "what this change affects", "alternative": null}\n\nIf bad change:\n{"approved": false, "reason": "why it wont work", "impact": "what problems this causes", "alternative": "better suggestion"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}