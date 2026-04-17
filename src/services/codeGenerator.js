export async function generateArduinoCode(idea, components, pinAssignments) {
  const componentList = components.map(c =>
    c.name + ' (' + c.category + ')'
  ).join(', ')

  const pinList = pinAssignments && pinAssignments.length > 0
    ? pinAssignments.map(p =>
        p.componentName + ' ' + p.componentPin + ' → ' + p.mcuPin + ' (' + p.mode + ')'
      ).join(', ')
    : 'No pin assignments provided — use typical default pins'

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const microcontroller = components.find(c => c.category === 'Microcontroller')
  const platform = microcontroller?.name?.toLowerCase().includes('esp') ? 'ESP32' : 'Arduino'

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are an expert ' + platform + ' programmer. Generate complete working code for this prototype.\n\nIdea: "' + idea + '"\nComponents: ' + componentList + '\nPin assignments: ' + pinList + '\nPlatform: ' + platform + '\n\nGenerate complete, working, well-commented Arduino/ESP32 code. Include:\n- All necessary #include statements\n- Pin definitions as constants\n- All global variables\n- setup() function with pin modes and Serial.begin\n- loop() function with actual working logic\n- Helper functions if needed\n- Comments explaining each section\n\nReply ONLY with this exact JSON:\n{"platform": "Arduino", "filename": "ProtoMind_Sketch.ino", "libraries": ["DHT.h", "Wire.h"], "code": "// Complete Arduino code here\\n#include ...\\n\\nconst int PIN_SENSOR = 2;\\n\\nvoid setup() {\\n  Serial.begin(9600);\\n}\\n\\nvoid loop() {\\n  // main code\\n}", "explanation": "Brief explanation of what the code does", "uploadInstructions": ["Install DHT library from Library Manager", "Select Arduino Nano board", "Upload at 9600 baud"]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}