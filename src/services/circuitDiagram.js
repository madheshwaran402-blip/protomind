export async function generateCircuitData(idea, components) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: 'You are an expert electronics engineer. Generate a circuit diagram data for this prototype:\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\n\nReply ONLY with this exact JSON, no explanation:\n\n{"connections": [{"from": {"component": "Arduino Uno", "pin": "5V"}, "to": {"component": "DHT22 Sensor", "pin": "VCC"}, "wire": "red", "label": "Power"}, {"from": {"component": "Arduino Uno", "pin": "GND"}, "to": {"component": "DHT22 Sensor", "pin": "GND"}, "wire": "black", "label": "Ground"}, {"from": {"component": "Arduino Uno", "pin": "D2"}, "to": {"component": "DHT22 Sensor", "pin": "DATA"}, "wire": "yellow", "label": "Data"}]}\n\nWire colors: red=power, black=ground, yellow=data, blue=I2C, green=signal, orange=PWM\nGenerate 6-10 realistic connections for the given components.',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}