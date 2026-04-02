export async function analyseIdea(idea) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: 'You are an expert electronics engineer. A user wants to build: "' + idea + '"\n\nSuggest exactly 6 components. Reply ONLY with a JSON array, no markdown, no explanation, no extra text. Just the raw JSON:\n\n[{"id":1,"icon":"🧠","name":"Component Name","category":"Microcontroller","reason":"Why needed for this specific idea","quantity":1}]\n\nCategories must be one of: Microcontroller, Sensor, Display, Communication, Power, Actuator',
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error('Ollama not running')
  }

  const data = await response.json()
  const text = data.response
  
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON found in response')
  
  return JSON.parse(jsonMatch[0])
}