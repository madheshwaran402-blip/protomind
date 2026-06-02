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
    'slides (array of objects with: id, type, title, content, bullets array of strings, highlight, icon, notes),',
    'theme (string: dark)',
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
  const total = slides.length + 1

  const slideItems = slides.map(function(slide, i) {
    const bullets = (slide.bullets || []).map(function(b) {
      return '<li>' + b + '</li>'
    }).join('')

    return '<div class="slide" id="slide-' + (i + 1) + '" style="display:none">' +
      '<div class="slide-number">' + (i + 2) + ' / ' + total + '</div>' +
      '<div class="slide-icon">' + (slide.icon || '') + '</div>' +
      '<h2>' + (slide.title || '') + '</h2>' +
      (slide.content ? '<p class="content">' + slide.content + '</p>' : '') +
      (bullets ? '<ul>' + bullets + '</ul>' : '') +
      (slide.highlight ? '<div class="highlight">' + slide.highlight + '</div>' : '') +
      '</div>'
  }).join('')

  const css = [
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; background: #0a0a0f; color: white; height: 100vh; overflow: hidden; }',
    '.slide { width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; background: linear-gradient(135deg, #0d0d1a 0%, #0a0a0f 100%); position: relative; }',
    '.slide-number { position: absolute; top: 20px; right: 30px; color: #4b5563; font-size: 14px; }',
    '.slide-icon { font-size: 64px; margin-bottom: 24px; }',
    'h2 { font-size: clamp(24px, 4vw, 48px); font-weight: 900; text-align: center; margin-bottom: 24px; color: #a5b4fc; }',
    '.content { font-size: clamp(14px, 2vw, 20px); color: #94a3b8; text-align: center; max-width: 800px; line-height: 1.8; margin-bottom: 20px; }',
    'ul { list-style: none; max-width: 700px; width: 100%; }',
    'ul li { font-size: clamp(13px, 1.8vw, 18px); color: #cbd5e1; padding: 10px 0; border-bottom: 1px solid #1e1e2e; display: flex; align-items: center; gap: 12px; }',
    'ul li::before { content: "\2192"; color: #6366f1; font-weight: bold; flex-shrink: 0; }',
    '.highlight { background: #1e1b4b; border: 1px solid #4338ca; border-radius: 16px; padding: 20px 40px; font-size: clamp(16px, 2.5vw, 28px); font-weight: 900; color: #a5b4fc; margin-top: 20px; text-align: center; }',
    '.controls { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; z-index: 100; }',
    '.btn { background: #1e1e2e; border: 1px solid #2e2e4e; color: white; padding: 12px 28px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600; }',
    '.btn:hover { background: #6366f1; }',
    '.btn:disabled { opacity: 0.3; cursor: not-allowed; }',
    '.progress { position: fixed; top: 0; left: 0; height: 3px; background: #6366f1; transition: width 0.3s; }',
  ].join('')

  const js = [
    'var current = 0;',
    'var total = ' + total + ';',
    'function changeSlide(dir) {',
    '  var slides = document.querySelectorAll(".slide");',
    '  slides[current].style.display = "none";',
    '  current = Math.max(0, Math.min(total - 1, current + dir));',
    '  slides[current].style.display = "flex";',
    '  document.getElementById("prev").disabled = current === 0;',
    '  document.getElementById("next").disabled = current === total - 1;',
    '  document.getElementById("counter").textContent = (current + 1) + " / " + total;',
    '  document.getElementById("progress").style.width = ((current + 1) / total * 100) + "%";',
    '}',
    'document.addEventListener("keydown", function(e) {',
    '  if (e.key === "ArrowRight" || e.key === " ") changeSlide(1);',
    '  if (e.key === "ArrowLeft") changeSlide(-1);',
    '});',
  ].join('')

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>' +
    (deck.title || idea) +
    '</title><style>' + css + '</style></head><body>' +
    '<div class="progress" id="progress" style="width:' + (1 / total * 100) + '%"></div>' +
    '<div class="slide" id="slide-0" style="display:flex">' +
    '<div class="slide-number">1 / ' + total + '</div>' +
    '<div class="slide-icon">⚡</div>' +
    '<h2>' + (deck.title || idea) + '</h2>' +
    '<p class="content">' + (deck.subtitle || '') + '</p>' +
    '</div>' +
    slideItems +
    '<div class="controls">' +
    '<button class="btn" id="prev" onclick="changeSlide(-1)" disabled>← Prev</button>' +
    '<button class="btn" id="counter">1 / ' + total + '</button>' +
    '<button class="btn" id="next" onclick="changeSlide(1)">Next →</button>' +
    '</div>' +
    '<script>' + js + '</' + 'script>' +
    '</body></html>'
}
