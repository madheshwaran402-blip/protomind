export async function calibrateSensor(sensorName, readings, options) {
  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const readingStr = readings.map(function(r, i) {
    return 'Reading ' + (i + 1) + ': ' + r.value + ' ' + (r.unit || '')
  }).join(', ')

  const prompt = [
    'You are an expert electronics sensor calibration engineer.',
    'Analyse these sensor readings and provide calibration advice.',
    'Sensor: ' + sensorName,
    'Readings: ' + readingStr,
    'Environment: ' + (options.environment || 'room temperature'),
    'Expected range: ' + (options.expectedRange || 'unknown'),
    'Reply ONLY with valid JSON with exactly these keys:',
    'sensorName (string),',
    'status (string: Good, Needs Calibration, Faulty, or Drifting),',
    'accuracy (number 0-100),',
    'analysis (string, 2 sentences),',
    'issues (array of strings),',
    'calibrationSteps (array of objects with: step, description, code),',
    'expectedRange (object with: min, max, unit),',
    'drift (object with: detected boolean, amount string, direction string),',
    'recommendations (array of strings)',
  ].join('\n')

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}

const CAL_HISTORY_KEY = 'protomind_calibrations'

export function saveCalibration(sensorName, result) {
  try {
    const raw = localStorage.getItem(CAL_HISTORY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    if (!all[sensorName]) all[sensorName] = []
    all[sensorName].unshift({
      result,
      timestamp: new Date().toISOString(),
    })
    all[sensorName] = all[sensorName].slice(0, 5)
    localStorage.setItem(CAL_HISTORY_KEY, JSON.stringify(all))
  } catch {}
}

export function getCalibrationHistory(sensorName) {
  try {
    const raw = localStorage.getItem(CAL_HISTORY_KEY)
    const all = raw ? JSON.parse(raw) : {}
    return all[sensorName] || []
  } catch {
    return []
  }
}