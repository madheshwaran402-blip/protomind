export async function generateReadme(idea, components, options) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are a technical writer. Generate a professional GitHub README for this electronics prototype.',
    'Idea: ' + idea,
    'Components: ' + componentList,
    'Author: ' + (options.author || 'ProtoMind Builder'),
    'Reply ONLY with valid JSON with these keys:',
    'projectTitle, shortDescription, longDescription, features (array),',
    'requirements (object with hardware and software arrays),',
    'installation (array), usage, wiringDescription,',
    'troubleshooting (array of objects with problem and solution),',
    'license, contributing',
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

export function buildReadmeMarkdown(readme, idea, components, options) {
  const tableRows = components.map(function(c) {
    return '| ' + c.name + ' | ' + c.category + ' | ' + (c.estimatedPrice || 'N/A') + ' |'
  })

  const componentTable = [
    '| Component | Category | Price |',
    '|-----------|----------|-------|',
  ].concat(tableRows).join('\n')

  const featureLines = (readme.features || []).map(function(f) {
    return '- ' + f
  }).join('\n')

  const softwareLines = (readme.requirements ? readme.requirements.software || [] : []).map(function(s) {
    return '- ' + s
  }).join('\n')

  const installLines = (readme.installation || []).map(function(step, i) {
    return (i + 1) + '. ' + step
  }).join('\n')

  const troubleshootLines = (readme.troubleshooting || []).map(function(t) {
    return 'Problem: ' + t.problem + '\nSolution: ' + t.solution
  }).join('\n\n')

  const parts = [
    '# ' + (readme.projectTitle || idea),
    '',
    readme.shortDescription || '',
    '',
    '## Description',
    '',
    readme.longDescription || '',
    '',
    '## Features',
    '',
    featureLines,
    '',
    '## Components',
    '',
    componentTable,
    '',
    '## Software Requirements',
    '',
    softwareLines,
    '',
    '## Installation',
    '',
    installLines,
    '',
    '## Wiring',
    '',
    readme.wiringDescription || '',
    '',
    '## Troubleshooting',
    '',
    troubleshootLines,
    '',
    '## License',
    '',
    (readme.license || 'MIT') + ' License',
    '',
    '---',
    '',
    'Built with ProtoMind',
  ]

  return parts.join('\n')
}