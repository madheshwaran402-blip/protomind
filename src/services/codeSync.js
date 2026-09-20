// Shared code sync between IDE and Simulator
// Uses localStorage as the message bus

export function syncCodeToSimulator(code) {
  try {
    localStorage.setItem('ide_code', code)
    localStorage.setItem('ide_code_updated', Date.now().toString())
  } catch(e) {}
}

export function getCodeForSimulator() {
  try {
    return localStorage.getItem('ide_code') || ''
  } catch(e) { return '' }
}

export function watchCodeUpdates(callback) {
  function handler(e) {
    if (e.key === 'ide_code_updated') {
      const code = localStorage.getItem('ide_code') || ''
      callback(code)
    }
  }
  window.addEventListener('storage', handler)
  return function() { window.removeEventListener('storage', handler) }
}

// Board state sync
export function syncBoardState(state) {
  try {
    localStorage.setItem('sim_board_state', JSON.stringify(state))
  } catch(e) {}
}

export function getBoardState() {
  try {
    const raw = localStorage.getItem('sim_board_state')
    return raw ? JSON.parse(raw) : null
  } catch(e) { return null }
}

// Serial log sync (IDE serial monitor mirrors Simulator output)
export function appendSerialLog(entry) {
  try {
    const raw = localStorage.getItem('shared_serial_log')
    const log = raw ? JSON.parse(raw) : []
    log.push(entry)
    if (log.length > 500) log.splice(0, log.length - 500)
    localStorage.setItem('shared_serial_log', JSON.stringify(log))
  } catch(e) {}
}

export function getSerialLog() {
  try {
    const raw = localStorage.getItem('shared_serial_log')
    return raw ? JSON.parse(raw) : []
  } catch(e) { return [] }
}

export function clearSerialLog() {
  try { localStorage.removeItem('shared_serial_log') } catch(e) {}
}
