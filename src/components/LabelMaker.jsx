import { useState, useRef, useEffect } from 'react'
import {
  generateQRCodeUrl,
  getLabelTemplates,
  saveLabelData,
  getLabelData,
} from '../services/labelMakerService'
import { notify } from '../services/toast'

const LABEL_SIZES = [
  { id: 'small', name: 'Small (50x25mm)', w: 200, h: 100 },
  { id: 'medium', name: 'Medium (80x40mm)', w: 320, h: 160 },
  { id: 'large', name: 'Large (100x60mm)', w: 400, h: 240 },
  { id: 'square', name: 'Square (60x60mm)', w: 240, h: 240 },
]

function LabelPreview({ labelData, template, size }) {
  const qrUrl = labelData.showQR ? generateQRCodeUrl(labelData.qrText || labelData.title, 80) : null

  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl mx-auto flex flex-col justify-between p-4 relative"
      style={{
        width: size.w + 'px',
        height: size.h + 'px',
        maxWidth: '100%',
        backgroundColor: template.bg,
        border: '2px solid ' + template.border,
        color: template.text,
      }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: template.accent }} />

      <div className="flex items-start justify-between gap-2 mt-2">
        <div className="flex-1 min-w-0">
          {labelData.title && (
            <p className="font-black leading-tight truncate" style={{
              fontSize: size.id === 'small' ? '12px' : size.id === 'large' ? '20px' : '15px',
              color: template.text,
            }}>
              {labelData.title}
            </p>
          )}
          {labelData.subtitle && (
            <p className="truncate mt-0.5" style={{
              fontSize: size.id === 'small' ? '9px' : '11px',
              color: template.accent,
            }}>
              {labelData.subtitle}
            </p>
          )}
        </div>
        {labelData.emoji && (
          <span style={{ fontSize: size.id === 'small' ? '20px' : '28px' }}>{labelData.emoji}</span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-0.5">
          {labelData.line1 && (
            <p style={{ fontSize: '9px', color: template.text, opacity: 0.7 }}>{labelData.line1}</p>
          )}
          {labelData.line2 && (
            <p style={{ fontSize: '9px', color: template.text, opacity: 0.7 }}>{labelData.line2}</p>
          )}
          {labelData.voltage && (
            <span className="inline-block text-xs font-bold px-1.5 py-0.5 rounded" style={{
              backgroundColor: template.accent + '30',
              color: template.accent,
              fontSize: '9px',
            }}>
              {labelData.voltage}
            </span>
          )}
        </div>
        {qrUrl && (
          <img src={qrUrl} alt="QR" className="rounded" style={{
            width: size.id === 'small' ? '40px' : '60px',
            height: size.id === 'small' ? '40px' : '60px',
          }} />
        )}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: template.accent + '50' }} />
    </div>
  )
}

function LabelMaker({ idea, components }) {
  const templates = getLabelTemplates()
  const sizes = LABEL_SIZES
  const saved = getLabelData(idea)

  const [labelData, setLabelData] = useState(saved || {
    title: idea.slice(0, 30),
    subtitle: 'ProtoMind Build',
    emoji: '⚡',
    line1: components[0]?.name || '',
    line2: components[1]?.name || '',
    voltage: '5V',
    showQR: true,
    qrText: 'https://protomind-ten.vercel.app',
  })
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [selectedSize, setSelectedSize] = useState(1)
  const [count, setCount] = useState(1)

  function update(key, value) {
    setLabelData(function(prev) { return Object.assign({}, prev, { [key]: value }) })
  }

  function handleSave() {
    saveLabelData(idea, labelData)
    notify.success('Label saved!')
  }

  function handlePrint() {
    window.print()
    notify.info('Use browser print to print labels')
  }

  const template = templates[selectedTemplate]
  const size = sizes[selectedSize]

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4 overflow-x-auto">
        <p className="text-xs text-slate-500 mb-3">Label Preview</p>
        <LabelPreview labelData={labelData} template={template} size={size} />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Title</p>
          <input value={labelData.title} onChange={function(e) { update('title', e.target.value) }}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Subtitle</p>
          <input value={labelData.subtitle} onChange={function(e) { update('subtitle', e.target.value) }}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Line 1</p>
          <input value={labelData.line1} onChange={function(e) { update('line1', e.target.value) }}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Line 2</p>
          <input value={labelData.line2} onChange={function(e) { update('line2', e.target.value) }}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Emoji Icon</p>
          <input value={labelData.emoji} onChange={function(e) { update('emoji', e.target.value) }}
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-2xl outline-none text-center" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Voltage Badge</p>
          <input value={labelData.voltage} onChange={function(e) { update('voltage', e.target.value) }}
            placeholder="e.g. 5V, 3.3V, 12V"
            className="w-full bg-[#13131f] border border-[#2e2e4e] rounded-xl px-3 py-2 text-white text-sm outline-none" />
        </div>
      </div>

      {/* QR code toggle */}
      <div className="flex items-center gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3">
        <button
          onClick={function() { update('showQR', !labelData.showQR) }}
          className={'w-10 h-5 rounded-full transition-colors relative ' + (labelData.showQR ? 'bg-indigo-600' : 'bg-[#2e2e4e]')}
        >
          <div className={'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ' + (labelData.showQR ? 'left-5' : 'left-0.5')} />
        </button>
        <p className="text-white text-xs">Show QR Code</p>
        {labelData.showQR && (
          <input
            value={labelData.qrText}
            onChange={function(e) { update('qrText', e.target.value) }}
            placeholder="URL for QR code"
            className="flex-1 bg-[#0d0d1a] border border-[#2e2e4e] rounded-lg px-2 py-1 text-white text-xs outline-none"
          />
        )}
      </div>

      {/* Template selector */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Template</p>
        <div className="flex gap-2 flex-wrap">
          {templates.map(function(t, i) {
            return (
              <button
                key={t.id}
                onClick={function() { setSelectedTemplate(i) }}
                className={'px-3 py-1.5 rounded-xl text-xs border transition ' + (
                  selectedTemplate === i ? 'border-indigo-500 text-white' : 'border-[#2e2e4e] text-slate-400'
                )}
                style={selectedTemplate === i ? { backgroundColor: t.bg + 'cc' } : { backgroundColor: t.bg + '44' }}
              >
                {t.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Size selector */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Size</p>
        <div className="flex gap-2 flex-wrap">
          {sizes.map(function(s, i) {
            return (
              <button
                key={s.id}
                onClick={function() { setSelectedSize(i) }}
                className={'px-3 py-1.5 rounded-xl text-xs border transition ' + (
                  selectedSize === i
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-[#13131f] text-slate-400 border-[#2e2e4e] hover:border-indigo-600'
                )}
              >
                {s.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleSave}
          className="flex-1 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition">
          💾 Save Label
        </button>
        <button onClick={handlePrint}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition">
          🖨️ Print Label
        </button>
      </div>
    </div>
  )
}

export default LabelMaker