export async function estimateDifficulty(idea, components) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics engineer and educator. Analyse this prototype:\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\n\nRate the difficulty and estimate build time. Reply ONLY with this exact JSON:\n\n{"difficulty": "Beginner", "difficultyScore": 2, "buildTimeHours": 4, "buildTimeDays": 1, "skillsRequired": ["Basic soldering", "Arduino programming"], "tools": ["Soldering iron", "Multimeter", "Breadboard"], "steps": [{"step": 1, "title": "Set up the breadboard", "duration": "30 min", "difficulty": "Easy"}, {"step": 2, "title": "Wire the microcontroller", "duration": "1 hour", "difficulty": "Medium"}], "tips": ["Start with breadboard before soldering", "Test each component individually"], "verdict": "one sentence summary"}\n\nDifficulty must be one of: Beginner, Intermediate, Advanced, Expert\ndifficultyScore: 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert\nProvide 4-6 realistic build steps with durations.',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}