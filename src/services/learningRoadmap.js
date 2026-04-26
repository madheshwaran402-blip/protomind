export async function generateLearningRoadmap(idea, components) {
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
      prompt: 'You are an expert electronics educator. Create a learning roadmap for someone who wants to build this prototype.\n\nPrototype: "' + idea + '"\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON:\n\n{"overallLevel": "Intermediate", "estimatedLearningTime": "2-3 weeks", "prerequisiteSkills": ["Basic electronics", "Ohms law", "Using a multimeter"], "phases": [{"phase": 1, "title": "Foundation", "duration": "3 days", "skills": ["Understanding GPIO pins", "Breadboard basics", "LED circuits"], "project": "Blink an LED with Arduino", "resources": [{"type": "Video", "title": "Arduino in 100 seconds", "platform": "YouTube"}, {"type": "Article", "title": "Getting started with Arduino", "platform": "Arduino.cc"}]}, {"phase": 2, "title": "Sensors", "duration": "4 days", "skills": ["Reading analog sensors", "Serial monitor", "Data types"], "project": "Read temperature from DHT22", "resources": []}], "finalMilestone": "Build the complete prototype from scratch", "commonMistakes": ["Forgetting pull-up resistors", "Wrong voltage levels", "Not checking polarity"], "certifications": ["Arduino Certification", "Coursera IoT Specialization"], "communityResources": ["Arduino forums", "r/arduino on Reddit", "Instructables.com"]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}