const PIN_KEY = 'protomind_pins'

export const ARDUINO_NANO_PINS = [
  { pin: 'D0', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'RX - avoid if using Serial' },
  { pin: 'D1', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'TX - avoid if using Serial' },
  { pin: 'D2', type: 'Digital', modes: ['INPUT', 'OUTPUT', 'INTERRUPT'], note: 'External interrupt 0' },
  { pin: 'D3', type: 'Digital/PWM', modes: ['INPUT', 'OUTPUT', 'PWM', 'INTERRUPT'], note: 'PWM + External interrupt 1' },
  { pin: 'D4', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'D5', type: 'Digital/PWM', modes: ['INPUT', 'OUTPUT', 'PWM'], note: 'PWM output' },
  { pin: 'D6', type: 'Digital/PWM', modes: ['INPUT', 'OUTPUT', 'PWM'], note: 'PWM output' },
  { pin: 'D7', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'D8', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'D9', type: 'Digital/PWM', modes: ['INPUT', 'OUTPUT', 'PWM'], note: 'PWM output' },
  { pin: 'D10', type: 'Digital/PWM/SPI', modes: ['INPUT', 'OUTPUT', 'PWM', 'SPI_SS'], note: 'SPI Slave Select' },
  { pin: 'D11', type: 'Digital/PWM/SPI', modes: ['INPUT', 'OUTPUT', 'PWM', 'SPI_MOSI'], note: 'SPI MOSI' },
  { pin: 'D12', type: 'Digital/SPI', modes: ['INPUT', 'OUTPUT', 'SPI_MISO'], note: 'SPI MISO' },
  { pin: 'D13', type: 'Digital/SPI', modes: ['INPUT', 'OUTPUT', 'SPI_SCK'], note: 'SPI Clock + Built-in LED' },
  { pin: 'A0', type: 'Analog', modes: ['ANALOG_INPUT', 'DIGITAL'], note: 'Analog 0-5V' },
  { pin: 'A1', type: 'Analog', modes: ['ANALOG_INPUT', 'DIGITAL'], note: 'Analog 0-5V' },
  { pin: 'A2', type: 'Analog', modes: ['ANALOG_INPUT', 'DIGITAL'], note: 'Analog 0-5V' },
  { pin: 'A3', type: 'Analog', modes: ['ANALOG_INPUT', 'DIGITAL'], note: 'Analog 0-5V' },
  { pin: 'A4', type: 'Analog/I2C', modes: ['ANALOG_INPUT', 'I2C_SDA'], note: 'I2C SDA' },
  { pin: 'A5', type: 'Analog/I2C', modes: ['ANALOG_INPUT', 'I2C_SCL'], note: 'I2C SCL' },
  { pin: '5V', type: 'Power', modes: ['POWER'], note: '5V power output' },
  { pin: '3.3V', type: 'Power', modes: ['POWER'], note: '3.3V power output (max 50mA)' },
  { pin: 'GND', type: 'Power', modes: ['GND'], note: 'Ground reference' },
  { pin: 'VIN', type: 'Power', modes: ['POWER'], note: 'Input voltage 7-12V' },
]

export const ESP32_PINS = [
  { pin: 'GPIO2', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'Built-in LED, boot mode sensitive' },
  { pin: 'GPIO4', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'GPIO5', type: 'Digital/SPI', modes: ['INPUT', 'OUTPUT', 'SPI_SS'], note: 'SPI SS' },
  { pin: 'GPIO12', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'Boot mode sensitive' },
  { pin: 'GPIO13', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'GPIO14', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'GPIO16', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'GPIO17', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'GPIO18', type: 'Digital/SPI', modes: ['INPUT', 'OUTPUT', 'SPI_SCK'], note: 'SPI Clock' },
  { pin: 'GPIO19', type: 'Digital/SPI', modes: ['INPUT', 'OUTPUT', 'SPI_MISO'], note: 'SPI MISO' },
  { pin: 'GPIO21', type: 'Digital/I2C', modes: ['INPUT', 'OUTPUT', 'I2C_SDA'], note: 'I2C SDA' },
  { pin: 'GPIO22', type: 'Digital/I2C', modes: ['INPUT', 'OUTPUT', 'I2C_SCL'], note: 'I2C SCL' },
  { pin: 'GPIO23', type: 'Digital/SPI', modes: ['INPUT', 'OUTPUT', 'SPI_MOSI'], note: 'SPI MOSI' },
  { pin: 'GPIO25', type: 'Digital/DAC', modes: ['INPUT', 'OUTPUT', 'DAC'], note: 'DAC output' },
  { pin: 'GPIO26', type: 'Digital/DAC', modes: ['INPUT', 'OUTPUT', 'DAC'], note: 'DAC output' },
  { pin: 'GPIO27', type: 'Digital', modes: ['INPUT', 'OUTPUT'], note: 'General purpose' },
  { pin: 'GPIO32', type: 'Analog', modes: ['ANALOG_INPUT', 'DIGITAL'], note: 'ADC channel 4' },
  { pin: 'GPIO33', type: 'Analog', modes: ['ANALOG_INPUT', 'DIGITAL'], note: 'ADC channel 5' },
  { pin: 'GPIO34', type: 'Input Only', modes: ['ANALOG_INPUT'], note: 'Input only, no pull-up' },
  { pin: 'GPIO35', type: 'Input Only', modes: ['ANALOG_INPUT'], note: 'Input only' },
  { pin: '3.3V', type: 'Power', modes: ['POWER'], note: '3.3V power (max 600mA)' },
  { pin: 'GND', type: 'Power', modes: ['GND'], note: 'Ground' },
  { pin: 'VIN', type: 'Power', modes: ['POWER'], note: 'Input voltage 5V' },
]

export function savePinAssignments(idea, assignments) {
  try {
    const all = JSON.parse(localStorage.getItem(PIN_KEY) || '{}')
    all[idea] = assignments
    localStorage.setItem(PIN_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

export function getPinAssignments(idea) {
  try {
    const all = JSON.parse(localStorage.getItem(PIN_KEY) || '{}')
    return all[idea] || []
  } catch {
    return []
  }
}

export function validatePinAssignments(assignments) {
  const errors = []
  const warnings = []
  const usedPins = {}

  assignments.forEach(assignment => {
    if (!assignment.mcuPin || !assignment.componentPin) return

    if (usedPins[assignment.mcuPin]) {
      errors.push('Pin ' + assignment.mcuPin + ' is assigned to both ' + usedPins[assignment.mcuPin] + ' and ' + assignment.componentName)
    } else {
      usedPins[assignment.mcuPin] = assignment.componentName
    }

    if (assignment.mcuPin === 'D0' || assignment.mcuPin === 'D1') {
      warnings.push(assignment.componentName + ' uses ' + assignment.mcuPin + ' which conflicts with Serial communication')
    }

    if (assignment.mcuPin === 'GPIO12' && assignment.mcuPin.includes('GPIO')) {
      warnings.push('GPIO12 is boot mode sensitive — avoid if possible')
    }
  })

  return { errors, warnings, isValid: errors.length === 0 }
}

export function exportPinTable(assignments, idea) {
  const rows = [
    ['ProtoMind Pin Assignment Table'],
    ['Idea: ' + idea],
    ['Generated: ' + new Date().toLocaleDateString()],
    [''],
    ['Component', 'Component Pin', 'MCU Pin', 'Mode', 'Notes'],
    ...assignments.map(a => [
      a.componentName || '',
      a.componentPin || '',
      a.mcuPin || '',
      a.mode || '',
      a.notes || '',
    ]),
  ]

  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ProtoMind_PinTable.csv'
  link.click()
  URL.revokeObjectURL(url)
}