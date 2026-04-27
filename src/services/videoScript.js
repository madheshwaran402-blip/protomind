export async function generateVideoScript(idea, components, platform) {
  const componentList = components.map(c => c.name).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const platformGuide = {
    youtube: 'YouTube video (10-15 minutes, educational, detailed)',
    tiktok: 'TikTok video (60 seconds, fast-paced, hook-heavy)',
    shorts: 'YouTube Shorts (60 seconds, vertical, punchy)',
    instagram: 'Instagram Reel (30-60 seconds, visual, trending audio)',
  }

  const response = await fetch(ollamaUrl + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'You are a viral YouTube maker content creator. Write a complete video script for this prototype build.\n\nPrototype: "' + idea + '"\nComponents: ' + componentList + '\nPlatform: ' + (platformGuide[platform] || platformGuide.youtube) + '\n\nReply ONLY with this exact JSON:\n\n{"title": "Catchy video title with numbers or power words", "thumbnail": "Description of thumbnail concept", "tags": ["arduino", "diy", "electronics"], "estimatedDuration": "12 minutes", "sections": [{"name": "Hook", "duration": "0:00-0:30", "script": "Full script for this section", "bRoll": "What to film for this section", "tips": "Filming tip"}, {"name": "Intro", "duration": "0:30-1:30", "script": "Full script", "bRoll": "What to film", "tips": "Tip"}], "partsListReveal": "Script for revealing the parts list", "callToAction": "Like and subscribe script", "description": "YouTube description with timestamps", "chapters": ["0:00 - Introduction", "1:00 - Parts list"]}',
      stream: false,
    }),
  })

  const data = await response.json()
  const text = data.response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found')
  return JSON.parse(jsonMatch[0])
}