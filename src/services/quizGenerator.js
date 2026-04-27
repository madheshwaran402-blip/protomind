export async function generateQuiz(idea, components) {
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
      prompt: 'You are an electronics education expert. Create a quiz about this prototype.\n\nPrototype: "' + idea + '"\nComponents: ' + componentList + '\n\nCreate 8 multiple choice questions. Mix easy, medium and hard difficulty. Reply ONLY with this exact JSON:\n\n{"quizTitle": "Quiz title", "questions": [{"id": 1, "question": "What is the purpose of the Arduino Nano in this circuit?", "options": ["A) Power supply", "B) Main microcontroller", "C) Sensor", "D) Display"], "correct": "B", "explanation": "The Arduino Nano acts as the brain of the circuit, processing sensor data and controlling outputs.", "difficulty": "Easy", "topic": "Microcontrollers"}, {"id": 2, "question": "What voltage does a typical DHT22 sensor require?", "options": ["A) 1.8V", "B) 3.3V only", "C) 3.3V-5V", "D) 12V"], "correct": "C", "explanation": "The DHT22 operates on 3.3V to 5V, making it compatible with both Arduino and ESP32.", "difficulty": "Medium", "topic": "Sensors"}]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}