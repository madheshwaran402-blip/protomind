export async function generateSlides(idea, components) {
  const componentList = components.map(function(c) {
    return c.name + ' (' + c.category + ')'
  }).join(', ')

  const settings = localStorage.getItem('protomind_settings')
  const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
  const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'

  const prompt = [
    'You are a professional technical presenter.',
    'Create a complete slide deck for this electronics prototype.',
    'Prototype: ' + idea,
    'Components: ' + componentList,
    'Reply ONLY with valid JSON with exactly these keys:',
    'title (string, project title),',
    'subtitle (string, one line tagline),',
    'presenter (string, default ProtoMind Builder),',
    'slides (array of objects with: id, type, title, content, bullets, highlight, icon, notes),',
    'theme (string: dark or light)',
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

export function buildHTMLPresentation(deck, idea, components) {
  const slides = deck.slides || []

  const componentTableRows = components.map(function(c, i) {
    return '<tr><td>' + (i + 1) + '</td><td>' + (c.icon || '') + ' ' + c.name + '</td><td>' + c.category + '</td><td>' + (c.estimatedPrice || 'N/A') + '</td></tr>'
  }).join('')

  const slideHTML = slides.map(function(slide, i) {
    const bullets = (slide.bullets || []).map(function(b) {
      return '<li>' + b + '</li>'
    }).join('')

    return '<div class="slide" id="slide-' + i + '" style="display:' + (i === 0 ? 'flex' : 'none') + '">' +
      '<div class="slide-number">' + (i + 1) + ' / ' + slides.length + '</div>' +
      '<div class="slide-icon">' + (slide.icon || '') + '</div>' +
      '<h2>' + (slide.title || '') + '</h2>' +
      (slide.content ? '<p class="content">' + slide.content + '</p>' : '') +
      (bullets ? '<ul>' + bullets + '</ul>' : '') +
      (slide.highlight ? '<div class="highlight">' + slide.highlight + '</div>' : '') +
      (slide.notes ? '<div class="notes">Speaker notes: ' + slide.notes + '</div>' : '') +
      '</div>'
  }).join('')

  const html = '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' + (deck.title || idea) + '</title>' +
    '<style>' +
    '* { margin: 0; padding: 0; box-sizing: border-box; }' +
    'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; background: #0a0a0f; color: white; height: 100vh; overflow: hidden; }' +
    '.presentation { width: 100%; height: 100vh; position: relative; }' +
    '.slide { width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; background: linear-gradient(135deg, #0d0d1a 0%, #0a0a0f 100%); border: 1px solid #1e1e2e; position: relative; }' +
    '.slide-number { position: absolute; top: 20px; right: 30px; color: #4b5563; font-size: 14px; }' +
    '.slide-icon { font-size: 64px; margin-bottom: 24px; }' +
    'h2 { font-size: clamp(24px, 4vw, 48px); font-weight: 900; text-align: center; margin-bottom: 24px; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }' +
    '.content { font-size: clamp(14px, 2vw, 20px); color: #94a3b8; text-align: center; max-width: 800px; line-height: 1.8; margin-bottom: 20px; }' +
    'ul { list-style: none; max-width: 700px; width: 100%; }' +
    'ul li { font-size: clamp(13px, 1.8vw, 18px); color: #cbd5e1; padding: 10px 0; border-bottom: 1px solid #1e1e2e; display: flex; align-items: center; gap: 12px; }' +
    'ul li::before { content: "→"; color: #6366f1; font-weight: bold; flex-shrink: 0; }' +
    '.highlight { background: linear-gradient(135deg, #312e81, #1e1b4b); border: 1px solid #4338ca; border-radius: 16px; padding: 20px 40px; font-size: clamp(16px, 2.5vw, 28px); font-weight: 900; color: #a5b4fc; margin-top: 20px; text-align: center; }' +
    '.notes { position: absolute; bottom: 20px; left: 30px; right: 30px; background: #13131f; border: 1px solid #2e2e4e; border-radius: 8px; padding: 10px 16px; font-size: 12px; color: #4b5563; }' +
    'table { width: 100%; max-width: 800px; border-collapse: collapse; font-size: clamp(12px, 1.5vw, 16px); }' +
    'th { background: #1e1e2e; color: #6366f1; padding: 12px 16px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }' +
    'td { padding: 10px 16px; border-bottom: 1px solid #1e1e2e; color: #cbd5e1; }' +
    'tr:hover td { background: #13131f; }' +
    '.controls { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; z-index: 100; }' +
    '.btn { background: #1e1e2e; border: 1px solid #2e2e4e; color: white; padding: 12px 28px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }' +
    '.btn:hover { background: #6366f1; border-color: #6366f1; }' +
    '.btn:disabled { opacity: 0.3; cursor: not-allowed; }' +
    '.progress { position: fixed; top: 0; left: 0; height: 3px; background: #6366f1; transition: width 0.3s; }' +
    '.title-slide h2 { font-size: clamp(32px, 6vw, 72px); }' +
    '.title-slide .subtitle { font-size: clamp(14px, 2vw, 22px); color: #6366f1; margin-top: 8px; }' +
    '.title-slide .presenter { position: absolute; bottom: 80px; color: #4b5563; font-size: 14px; }' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="progress" id="progress"></div>' +
    '<div class="presentation">' +
    '<div class="slide title-slide" id="slide-0" style="display:flex">' +
    '<div class="slide-number">1 / ' + (slides.length + 1) + '</div>' +
    '<div class="slide-icon">⚡</div>' +
    '<h2>' + (deck.title || idea) + '</h2>' +
    '<p class="subtitle">' + (deck.subtitle || '') + '</p>' +
    '<div class="presenter">Presented by ' + (deck.presenter || 'ProtoMind Builder') + ' · Built with ProtoMind</div>' +
    '</div>' +
    slides.map(function(slide, i) {
      const bullets = (slide.bullets || []).map(function(b) { return '<li>' + b + '</li>' }).join('')
      return '<div class="slide" id="slide-' + (i + 1) + '" style="display:none">' +
        '<div class="slide-number">' + (i + 2) + ' / ' + (slides.length + 1) + '</div>' +
        '<div class="slide-icon">' + (slide.icon || '') + '</div>' +
        '<h2>' + (slide.title || '') + '</h2>' +
        (slide.content ? '<p class="content">' + slide.content + '</p>' : '') +
        (bullets ? '<ul>' + bullets + '</ul>' : '') +
        (slide.highlight ? '<div class="highlight">' + slide.highlight + '</div>' : '') +
        '</div>'
    }).join('') +
    '</div>' +
    '<div class="controls">' +
    '<button class="btn" id="prev" onclick="changeSlide(-1)" disabled>← Prev</button>' +
    '<button class="btn" id="slideCounter">1 / ' + (slides.length + 1) + '</button>' +
    '<button class="btn" id="next" onclick="changeSlide(1)">Next →</button>' +
    '</div>' +
    '<script>' +
    'var current = 0;' +
    'var total = ' + (slides.length + 1) + ';' +
    'function changeSlide(dir) {' +
    '  var slides = document.querySelectorAll(".slide");' +
    '  slides[current].style.display = "none";' +
    '  current = Math.max(0, Math.min(total - 1, current + dir));' +
    '  slides[current].style.display = "flex";' +
    '  document.getElementById("prev").disabled = current === 0;' +
    '  document.getElementById("next").disabled = current === total - 1;' +
    '  document.getElementById("slideCounter").textContent = (current + 1) + " / " + total;' +
    '  document.getElementById("progress").style.width = ((current + 1) / total * 100) + "%";' +
    '}' +
    'document.addEventListener("keydown", function(e) {' +
    '  if (e.key === "ArrowRight" || e.key === "Space") changeSlide(1);' +
    '  if (e.key === "ArrowLeft") changeSlide(-1);' +
    '});' +
    '</script>' +
    '</body>' +
    '</html>'

  return html
}