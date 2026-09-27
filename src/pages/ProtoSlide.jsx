import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../services/toast'

const THEMES = [
  { id:'tech', label:'Tech / Engineering', colors:['#050510','#6366f1','#ffffff'], accent:'#6366f1' },
  { id:'business', label:'Business / Corporate', colors:['#0f172a','#0ea5e9','#ffffff'], accent:'#0ea5e9' },
  { id:'startup', label:'Startup / Bold', colors:['#09090b','#a855f7','#f0f0f0'], accent:'#a855f7' },
  { id:'minimal', label:'Minimal / Clean', colors:['#ffffff','#111111','#666666'], accent:'#111111' },
  { id:'green', label:'Nature / Eco', colors:['#052e16','#22c55e','#ffffff'], accent:'#22c55e' },
  { id:'orange', label:'Creative / Warm', colors:['#1c0a00','#f97316','#ffffff'], accent:'#f97316' },
]

const FORMATS = [
  { id:'startup', label:'Startup Pitch', icon:'🚀', desc:'Problem → Solution → Market → Traction → Ask' },
  { id:'project', label:'Project Report', icon:'📊', desc:'Overview → Goals → Methods → Results → Conclusion' },
  { id:'product', label:'Product Launch', icon:'🎯', desc:'Vision → Features → Demo → Roadmap → CTA' },
  { id:'educational', label:'Educational', icon:'🎓', desc:'Introduction → Concepts → Examples → Summary → Q&A' },
  { id:'technical', label:'Technical Deep Dive', icon:'⚙️', desc:'Architecture → Implementation → Challenges → Results' },
  { id:'custom', label:'Custom Format', icon:'✏️', desc:'You define the slide structure' },
]

function SlidePreview({ slide, index, onEdit, editing, editText, onEditChange, onEditSave, onDownload }) {
  const bg = slide.bg || '#050510'
  const accent = slide.accent || '#6366f1'
  const textColor = slide.textColor || '#ffffff'

  return (
    <div className="mb-8">
      {/* Slide visual */}
      <div className="rounded-2xl overflow-hidden border-2 shadow-2xl"
        style={{ borderColor: accent + '40', aspectRatio: '16/9', position: 'relative' }}>
        <div style={{
          background: `linear-gradient(135deg, ${bg} 0%, ${bg}dd 100%)`,
          width: '100%', height: '100%', padding: '40px 48px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          minHeight: '300px', position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
            background: `linear-gradient(to bottom, ${accent}, ${accent}44)`
          }}/>
          <div style={{
            position: 'absolute', bottom: '20px', right: '24px',
            fontSize: '11px', color: accent, opacity: 0.6, fontFamily: 'monospace'
          }}>
            {index + 1} / ProtoMind
          </div>

          {/* Slide number badge */}
          <div style={{
            position: 'absolute', top: '20px', right: '24px',
            background: accent + '20', border: '1px solid ' + accent + '40',
            borderRadius: '8px', padding: '4px 10px',
            fontSize: '11px', color: accent, fontWeight: 700
          }}>
            Slide {index + 1}
          </div>

          {/* Content */}
          <div style={{ paddingLeft: '16px' }}>
            <p style={{ fontSize: '13px', color: accent, fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {slide.label || 'Slide ' + (index + 1)}
            </p>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, color: textColor, marginBottom: '16px', lineHeight: 1.2 }}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p style={{ fontSize: 'clamp(13px, 1.5vw, 16px)', color: textColor, opacity: 0.7, marginBottom: '16px', lineHeight: 1.5 }}>
                {slide.subtitle}
              </p>
            )}
            {slide.bullets && slide.bullets.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {slide.bullets.slice(0, 5).map(function(bullet, bi) {
                  return (
                    <li key={bi} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: accent, fontWeight: 800, marginTop: '2px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: 'clamp(11px, 1.3vw, 14px)', color: textColor, opacity: 0.85, lineHeight: 1.5 }}>{bullet}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Slide actions */}
      <div className="mt-3 flex items-start gap-3">
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <p className="text-xs text-indigo-400 font-medium">Editing slide {index + 1} — describe changes:</p>
              <textarea
                value={editText}
                onChange={function(e) { onEditChange(e.target.value) }}
                placeholder="E.g. Add a bullet about cost savings, change title to Market Opportunity, make it more concise..."
                className="w-full bg-[#0d0d1a] border border-indigo-600 rounded-xl px-4 py-2.5 text-white text-sm outline-none resize-none"
                rows={3}/>
              <div className="flex gap-2">
                <button onClick={onEditSave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition">
                  Apply Changes
                </button>
                <button onClick={function(){onEdit(null)}}
                  className="px-4 py-2 bg-[#1e1e2e] text-slate-400 rounded-lg text-sm transition">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <button onClick={function(){onEdit(index)}}
                className="px-4 py-2 bg-[#0d0d1a] border border-[#2e2e4e] hover:border-indigo-500 text-slate-300 rounded-lg text-sm transition flex items-center gap-1.5">
                ✏️ Want changes?
              </button>
              <button onClick={function(){onDownload(index)}}
                className="px-4 py-2 bg-[#0d0d1a] border border-[#2e2e4e] hover:border-green-600 text-slate-300 rounded-lg text-sm transition flex items-center gap-1.5">
                ⬇ Download Slide
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProtoSlide() {
  const navigate = useNavigate()
  const [step, setStep] = useState('setup') // setup | generating | review | ppt
  const [form, setForm] = useState({
    idea: '',
    slideCount: 10,
    theme: 'tech',
    format: 'startup',
    audience: 'investors',
    customFormat: '',
  })
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingSlide, setEditingSlide] = useState(null)
  const [editText, setEditText] = useState('')
  const [pptLoading, setPptLoading] = useState(false)
  const [generatingIdx, setGeneratingIdx] = useState(0)

  useEffect(function() {
    try {
      const req = JSON.parse(localStorage.getItem('protomind_current_requirements') || '{}')
      if (req.idea) setForm(function(prev) { return Object.assign({}, prev, { idea: req.idea }) })
    } catch(e) {}
  }, [])

  const selectedTheme = THEMES.find(function(t) { return t.id === form.theme }) || THEMES[0]

  async function callAI(prompt) {
    const settings = localStorage.getItem('protomind_settings')
    const model = settings ? (JSON.parse(settings).aiModel || 'llama3.2') : 'llama3.2'
    const ollamaUrl = settings ? (JSON.parse(settings).ollamaUrl || 'http://localhost:11434') : 'http://localhost:11434'
    const r = await fetch(ollamaUrl + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false })
    })
    const d = await r.json()
    return d.response || ''
  }

  async function generateSlides() {
    if (!form.idea.trim()) { notify.warning('Enter your presentation idea first'); return }
    setLoading(true)
    setStep('generating')

    const selectedFormat = FORMATS.find(function(f) { return f.id === form.format })
    const formatDesc = form.format === 'custom' ? form.customFormat : selectedFormat?.desc

    const prompt = `Create a ${form.slideCount}-slide presentation about: "${form.idea}"

Format: ${formatDesc}
Audience: ${form.audience}
Theme: ${selectedTheme.label}

Reply ONLY with valid JSON array. No text outside the JSON. No markdown.

[
  {
    "slideNumber": 1,
    "label": "Introduction",
    "title": "Slide Title Here",
    "subtitle": "Supporting subtitle text",
    "bullets": ["Key point one", "Key point two", "Key point three", "Key point four"]
  }
]

Generate exactly ${form.slideCount} slides. Make content professional and specific to the topic.`

    try {
      const response = await callAI(prompt)
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const parsed = JSON.parse(jsonMatch[0])
      const enriched = parsed.map(function(slide) {
        return Object.assign({}, slide, {
          bg: selectedTheme.colors[0],
          accent: selectedTheme.colors[1],
          textColor: selectedTheme.colors[2],
        })
      })

      setSlides(enriched)
      setStep('review')
      notify.success('Presentation generated!')
    } catch(e) {
      notify.error('Generation failed — ' + e.message)
      setStep('setup')
    } finally {
      setLoading(false)
    }
  }

  async function applySlideEdit(index) {
    if (!editText.trim()) return
    setLoading(true)

    const slide = slides[index]
    const prompt = `Current slide ${index + 1}:
Title: ${slide.title}
Subtitle: ${slide.subtitle || ''}
Bullets: ${(slide.bullets || []).join(' | ')}

User wants changes: "${editText}"

Reply ONLY with JSON for the updated slide:
{
  "slideNumber": ${index + 1},
  "label": "${slide.label || 'Slide ' + (index + 1)}",
  "title": "Updated title",
  "subtitle": "Updated subtitle",
  "bullets": ["Updated bullet 1", "Updated bullet 2", "Updated bullet 3"]
}`

    try {
      const response = await callAI(prompt)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON')

      const updated = JSON.parse(jsonMatch[0])
      const newSlides = slides.map(function(s, i) {
        if (i !== index) return s
        return Object.assign({}, s, updated, {
          bg: selectedTheme.colors[0],
          accent: selectedTheme.colors[1],
          textColor: selectedTheme.colors[2],
        })
      })
      setSlides(newSlides)
      setEditingSlide(null)
      setEditText('')
      notify.success('Slide ' + (index + 1) + ' updated!')
    } catch(e) {
      notify.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  function downloadSlide(index) {
    const slide = slides[index]
    if (!slide) return

    // Create a canvas to draw the slide
    const canvas = document.createElement('canvas')
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = slide.bg || '#050510'
    ctx.fillRect(0, 0, 1920, 1080)

    // Accent left bar
    const accent = slide.accent || '#6366f1'
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, 8, 1080)

    // Gradient overlay
    const grad = ctx.createLinearGradient(0, 0, 1920, 1080)
    grad.addColorStop(0, accent + '15')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1920, 1080)

    // Slide number badge
    ctx.fillStyle = accent + '30'
    ctx.beginPath()
    ctx.roundRect(1780, 40, 100, 36, 10)
    ctx.fill()
    ctx.fillStyle = accent
    ctx.font = 'bold 16px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Slide ' + (index + 1), 1830, 64)

    // Label
    ctx.fillStyle = accent
    ctx.font = 'bold 22px -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText((slide.label || 'SLIDE ' + (index + 1)).toUpperCase(), 80, 200)

    // Title
    ctx.fillStyle = slide.textColor || '#ffffff'
    ctx.font = 'bold 72px -apple-system, sans-serif'
    // Word wrap title
    const titleWords = (slide.title || '').split(' ')
    let titleLine = ''
    let titleY = 320
    for (const word of titleWords) {
      const testLine = titleLine + word + ' '
      if (ctx.measureText(testLine).width > 1500 && titleLine) {
        ctx.fillText(titleLine.trim(), 80, titleY)
        titleLine = word + ' '
        titleY += 90
      } else {
        titleLine = testLine
      }
    }
    if (titleLine) ctx.fillText(titleLine.trim(), 80, titleY)

    // Subtitle
    if (slide.subtitle) {
      ctx.fillStyle = (slide.textColor || '#ffffff') + 'aa'
      ctx.font = '32px -apple-system, sans-serif'
      ctx.fillText(slide.subtitle.slice(0, 80), 80, titleY + 70)
    }

    // Bullets
    const bulletStartY = Math.max(titleY + 160, 600)
    ctx.font = '28px -apple-system, sans-serif'
    ;(slide.bullets || []).slice(0, 4).forEach(function(bullet, bi) {
      const y = bulletStartY + bi * 70
      if (y > 980) return
      ctx.fillStyle = accent
      ctx.font = 'bold 28px -apple-system, sans-serif'
      ctx.fillText('›', 80, y)
      ctx.fillStyle = (slide.textColor || '#ffffff') + 'cc'
      ctx.font = '26px -apple-system, sans-serif'
      ctx.fillText(bullet.slice(0, 90), 110, y)
    })

    // ProtoMind watermark
    ctx.fillStyle = accent + '40'
    ctx.font = 'bold 18px -apple-system, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('Made with ProtoMind', 1900, 1060)

    // Download
    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'slide-' + (index + 1) + '-' + (slide.title || 'slide').slice(0, 20).replace(/\s+/g, '-') + '.png'
      a.click()
      URL.revokeObjectURL(url)
      notify.success('Slide ' + (index + 1) + ' downloaded!')
    })
  }

  function downloadAllSlides() {
    slides.forEach(function(_, i) {
      setTimeout(function() { downloadSlide(i) }, i * 800)
    })
    notify.info('Downloading all ' + slides.length + ' slides...')
  }

  async function generatePPT() {
    setPptLoading(true)
    notify.info('Generating PowerPoint...')

    try {
      // Dynamically import pptxgenjs
      let PptxGenJS
      try {
        const module = await import('pptxgenjs')
        PptxGenJS = module.default
      } catch(e) {
        throw new Error('pptxgenjs not installed. Run: npm install pptxgenjs')
      }

      const pptx = new PptxGenJS()
      pptx.layout = 'LAYOUT_WIDE' // 16:9

      slides.forEach(function(slide) {
        const pSlide = pptx.addSlide()
        const bg = slide.bg.replace('#', '') || '050510'
        const accent = slide.accent.replace('#', '') || '6366f1'
        const textColor = slide.textColor.replace('#', '') || 'ffffff'

        // Background
        pSlide.background = { color: bg }

        // Left accent bar
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.08, h: 7.5,
          fill: { color: accent }
        })

        // Label
        if (slide.label) {
          pSlide.addText(slide.label.toUpperCase(), {
            x: 0.5, y: 1.2, w: 12, h: 0.4,
            fontSize: 12, bold: true, color: accent,
            charSpacing: 2,
          })
        }

        // Title
        pSlide.addText(slide.title || '', {
          x: 0.5, y: 1.7, w: 11.5, h: 1.8,
          fontSize: 40, bold: true, color: textColor,
          wrap: true,
        })

        // Subtitle
        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 0.5, y: 3.6, w: 11, h: 0.6,
            fontSize: 18, color: textColor, transparency: 30,
            wrap: true,
          })
        }

        // Bullets
        if (slide.bullets && slide.bullets.length > 0) {
          const bulletText = slide.bullets.map(function(b) {
            return { text: b, options: { bullet: { type: 'number', style: 'arabicPeriod' }, fontSize: 16, color: textColor, paraSpaceAfter: 8 } }
          })
          pSlide.addText(bulletText, {
            x: 0.5, y: 4.3, w: 11, h: 2.5,
            wrap: true,
          })
        }

        // Slide number
        pSlide.addText((slide.slideNumber || '').toString(), {
          x: 12, y: 7, w: 0.5, h: 0.3,
          fontSize: 11, color: accent, align: 'right',
        })
      })

      const fileName = form.idea.slice(0, 30).replace(/\s+/g, '-') + '-ProtoMind.pptx'
      await pptx.writeFile({ fileName })
      notify.success('PowerPoint downloaded!')
      setStep('done')
    } catch(e) {
      notify.error('PPT failed: ' + e.message)
    } finally {
      setPptLoading(false)
    }
  }

  const updateForm = function(key, val) {
    setForm(function(prev) { return Object.assign({}, prev, { [key]: val }) })
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a14] border-b border-[#1e1e2e] px-4 py-3 flex items-center gap-3">
        <button onClick={function(){navigate('/')}} className="text-slate-500 hover:text-white text-sm transition">← Home</button>
        <div className="w-px h-5 bg-[#2e2e4e]"/>
        <span className="text-xl">🎨</span>
        <p className="text-white font-black">ProtoSlide</p>
        <span className="text-slate-600 text-xs">AI Presentation Creator</span>
        {step !== 'setup' && (
          <button onClick={function(){setStep('setup');setSlides([])}}
            className="ml-auto px-3 py-1.5 bg-[#1e1e2e] text-slate-400 rounded-lg text-xs hover:text-white transition">
            ← New Presentation
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── SETUP STEP ── */}
        {step === 'setup' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🎨</div>
              <h1 className="text-3xl font-black mb-2">ProtoSlide</h1>
              <p className="text-slate-400">AI creates your presentation slide by slide. Review, edit, then export as images or PowerPoint.</p>
            </div>

            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-6 space-y-5">
              {/* Idea */}
              <div>
                <label className="text-white font-bold text-sm block mb-2">What is your presentation about?</label>
                <textarea value={form.idea} onChange={function(e){updateForm('idea',e.target.value)}}
                  placeholder="E.g. Smart irrigation system using ESP32 and soil moisture sensors — for investor pitch..."
                  className="w-full bg-[#050510] border border-[#2e2e4e] focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none"
                  rows={3}/>
              </div>

              {/* Slide count */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-white font-bold text-sm">Number of Slides</label>
                  <span className="text-indigo-400 font-black">{form.slideCount} slides</span>
                </div>
                <input type="range" min="5" max="25" value={form.slideCount}
                  onChange={function(e){updateForm('slideCount',parseInt(e.target.value))}}
                  className="w-full accent-indigo-500"/>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>5 (Quick)</span><span>15 (Standard)</span><span>25 (Full)</span>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="text-white font-bold text-sm block mb-3">Presentation Format</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FORMATS.map(function(fmt) {
                    return (
                      <button key={fmt.id} onClick={function(){updateForm('format',fmt.id)}}
                        className={"p-3 rounded-xl border-2 text-left transition " + (form.format===fmt.id?'border-indigo-500 bg-indigo-950':'border-[#2e2e4e] bg-[#050510] hover:border-indigo-800')}>
                        <div className="text-xl mb-1">{fmt.icon}</div>
                        <p className="text-white font-bold text-xs">{fmt.label}</p>
                        <p className="text-slate-600 text-xs mt-0.5 leading-tight">{fmt.desc.split('→')[0]}</p>
                      </button>
                    )
                  })}
                </div>
                {form.format === 'custom' && (
                  <textarea value={form.customFormat} onChange={function(e){updateForm('customFormat',e.target.value)}}
                    placeholder="Describe your slide structure: Introduction → Problem → Solution → Market → Team → Ask"
                    className="w-full mt-3 bg-[#050510] border border-[#2e2e4e] focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none"
                    rows={2}/>
                )}
              </div>

              {/* Theme */}
              <div>
                <label className="text-white font-bold text-sm block mb-3">Visual Theme</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {THEMES.map(function(theme) {
                    return (
                      <button key={theme.id} onClick={function(){updateForm('theme',theme.id)}}
                        className={"p-3 rounded-xl border-2 text-center transition " + (form.theme===theme.id?'border-indigo-500':'border-[#2e2e4e] hover:border-indigo-800')}>
                        <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center"
                          style={{background:theme.colors[0],border:'2px solid '+theme.colors[1]}}>
                          <div className="w-3 h-3 rounded-sm" style={{background:theme.colors[1]}}/>
                        </div>
                        <p className="text-xs text-slate-400">{theme.label.split(' / ')[0]}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="text-white font-bold text-sm block mb-2">Target Audience</label>
                <div className="flex gap-2 flex-wrap">
                  {['investors','customers','team','students','general public','technical team'].map(function(aud) {
                    return (
                      <button key={aud} onClick={function(){updateForm('audience',aud)}}
                        className={"px-3 py-1.5 rounded-xl border text-xs font-medium transition " + (form.audience===aud?'bg-indigo-600 border-indigo-500 text-white':'border-[#2e2e4e] text-slate-400 hover:border-indigo-600 hover:text-white')}>
                        {aud}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button onClick={generateSlides} disabled={!form.idea.trim()}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-xl transition disabled:opacity-40 flex items-center justify-center gap-3">
              <span>✨</span>
              <span>Generate {form.slideCount} Slides</span>
            </button>
          </div>
        )}

        {/* ── GENERATING STEP ── */}
        {step === 'generating' && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 animate-bounce">🎨</div>
            <h2 className="text-2xl font-black mb-3">Creating Your Presentation</h2>
            <p className="text-slate-400 mb-8">AI is generating {form.slideCount} slides for: {form.idea.slice(0, 60)}...</p>
            <div className="w-64 mx-auto bg-[#1e1e2e] rounded-full h-2">
              <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse" style={{width:'70%'}}/>
            </div>
            <p className="text-slate-600 text-sm mt-4">This may take 30-60 seconds depending on your AI model</p>
          </div>
        )}

        {/* ── REVIEW STEP ── */}
        {step === 'review' && slides.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black">Review Your Slides</h2>
                <p className="text-slate-400 text-sm">{slides.length} slides generated · Click "Want changes?" to edit any slide</p>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadAllSlides}
                  className="px-4 py-2.5 bg-[#0d0d1a] border border-[#2e2e4e] hover:border-green-600 text-slate-300 rounded-xl text-sm font-bold transition">
                  ⬇ Download All Images
                </button>
              </div>
            </div>

            {/* All slides */}
            {slides.map(function(slide, i) {
              return (
                <SlidePreview
                  key={i}
                  slide={slide}
                  index={i}
                  onEdit={function(idx) { setEditingSlide(idx); setEditText('') }}
                  editing={editingSlide === i}
                  editText={editingSlide === i ? editText : ''}
                  onEditChange={setEditText}
                  onEditSave={function() { applySlideEdit(i) }}
                  onDownload={downloadSlide}
                />
              )
            })}

            {/* Generate PPT section */}
            <div className="bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-800 rounded-2xl p-8 text-center mt-4">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-white font-black text-2xl mb-2">Ready to Generate PowerPoint?</h3>
              <p className="text-slate-400 mb-6">
                All {slides.length} slides reviewed. Generate a complete .pptx file with all slides, styling, and layout.
              </p>
              <button onClick={generatePPT} disabled={pptLoading}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-lg transition disabled:opacity-50 flex items-center gap-3 mx-auto">
                {pptLoading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Generating...</span></>
                ) : (
                  <><span>📊</span><span>Generate Full PowerPoint</span></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── DONE STEP ── */}
        {step === 'done' && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black mb-2">Presentation Complete!</h2>
            <p className="text-slate-400 mb-8">Your PowerPoint has been downloaded.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={function(){setStep('review')}}
                className="px-6 py-3 bg-[#1e1e2e] text-slate-300 rounded-xl font-bold transition">
                ← Back to Slides
              </button>
              <button onClick={function(){setStep('setup');setSlides([]);setForm(function(prev){return Object.assign({},prev,{idea:''})})}}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">
                Create New Presentation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
