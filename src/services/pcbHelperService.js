export async function generatePCBChecklist(idea, components) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are an expert PCB designer.',
    'Generate a comprehensive PCB design checklist for this prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'pcbName (string),',
    'estimatedLayers (number, 1 or 2),',
    'estimatedSize (string, e.g. 50x50mm),',
    'estimatedCost (string, e.g. $5-15 for 5 boards),',
    'schematicChecks (array of objects with: id, task, category, critical, notes),',
    'layoutChecks (array of objects with: id, task, category, critical, notes),',
    'routingChecks (array of objects with: id, task, category, critical, notes),',
    'componentFootprints (array of objects with: component, footprint, notes),',
    'designRules (object with: minTraceWidth, minClearance, minViaSize, copperWeight),',
    'orderingSteps (array of objects with: step, title, description, tool),',
    'commonMistakes (array of strings),',
    'estimatedTurnAround (string)',
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