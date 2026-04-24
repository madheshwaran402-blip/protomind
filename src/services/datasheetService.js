export async function generateDatasheet(component) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert electronics engineer. Generate a detailed technical datasheet for this component.\n\nComponent: ' + component.name + '\nCategory: ' + component.category + '\n\nReply ONLY with this exact JSON:\n\n{"overview": "2 sentence technical overview", "specs": {"voltage": "3.3V - 5V", "current": "20mA typical", "frequency": "N/A", "temperature": "-40°C to 85°C", "package": "DIP-8", "interface": "I2C / SPI"}, "pins": [{"number": 1, "name": "VCC", "description": "Power supply 3.3V-5V"}, {"number": 2, "name": "GND", "description": "Ground reference"}], "applications": ["Temperature monitoring", "Weather station", "Industrial automation"], "features": ["Low power consumption", "High accuracy", "Wide voltage range"], "warnings": ["Do not exceed 5.5V", "Avoid reverse polarity"], "buyLinks": [{"store": "Amazon", "search": "component name amazon"}, {"store": "AliExpress", "search": "component name aliexpress"}, {"store": "Adafruit", "search": "component name adafruit"}], "codeExample": "// Basic usage example\\nvoid setup() {\\n  Serial.begin(9600);\\n  // Initialize component\\n}\\n\\nvoid loop() {\\n  // Read data\\n}"}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

const DATASHEET_CACHE_KEY = 'protomind_datasheets'

export function getCachedDatasheet(componentName) {
  try {
    const cache = JSON.parse(localStorage.getItem(DATASHEET_CACHE_KEY) || '{}')
    return cache[componentName] || null
  } catch {
    return null
  }
}

export function cacheDatasheet(componentName, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(DATASHEET_CACHE_KEY) || '{}')
    cache[componentName] = data
    localStorage.setItem(DATASHEET_CACHE_KEY, JSON.stringify(cache))
  } catch { /* ignore */ }
}