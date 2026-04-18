import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function makeIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#4f46e5')
  grad.addColorStop(1, '#0ea5e9')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()
  ctx.fillStyle = 'white'
  ctx.font = `bold ${size * 0.55}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚡', size / 2, size / 2)
  return canvas.toBuffer('image/png')
}

writeFileSync('icon-192.png', makeIcon(192))
writeFileSync('icon-512.png', makeIcon(512))
console.log('Icons created!')
