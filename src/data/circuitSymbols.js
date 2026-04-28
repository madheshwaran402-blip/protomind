export const CIRCUIT_SYMBOLS = [
  {
    id: 'resistor',
    name: 'Resistor',
    category: 'Passive',
    symbol: 'R',
    unit: 'Ohm (Ω)',
    description: 'Limits current flow in a circuit',
    usage: 'Current limiting, voltage dividers, pull-up/pull-down',
    commonValues: ['100Ω', '1kΩ', '10kΩ', '100kΩ'],
    tips: 'Use E24 series values. Always calculate max power dissipation.',
    svg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="20" x2="20" y2="20" stroke="#6366f1" stroke-width="2"/>
      <rect x="20" y="10" width="60" height="20" fill="none" stroke="#6366f1" stroke-width="2" rx="2"/>
      <line x1="80" y1="20" x2="100" y2="20" stroke="#6366f1" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    category: 'Passive',
    symbol: 'C',
    unit: 'Farad (F)',
    description: 'Stores electrical energy in an electric field',
    usage: 'Filtering, decoupling, timing circuits',
    commonValues: ['100nF', '10µF', '100µF', '1000µF'],
    tips: 'Electrolytic caps are polarised — check + and - terminals.',
    svg: `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="25" x2="40" y2="25" stroke="#0ea5e9" stroke-width="2"/>
      <line x1="40" y1="10" x2="40" y2="40" stroke="#0ea5e9" stroke-width="2.5"/>
      <line x1="48" y1="10" x2="48" y2="40" stroke="#0ea5e9" stroke-width="2.5"/>
      <line x1="48" y1="25" x2="100" y2="25" stroke="#0ea5e9" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'led',
    name: 'LED',
    category: 'Output',
    symbol: 'LED',
    unit: 'Volt (forward)',
    description: 'Light Emitting Diode — emits light when current flows',
    usage: 'Status indicators, displays, lighting',
    commonValues: ['2V red', '2.1V yellow', '3.2V blue/white', '2.1V green'],
    tips: 'Always use a current limiting resistor. Typical current: 10-20mA.',
    svg: `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="30" x2="30" y2="30" stroke="#22c55e" stroke-width="2"/>
      <polygon points="30,15 30,45 60,30" fill="#22c55e" opacity="0.3" stroke="#22c55e" stroke-width="2"/>
      <line x1="60" y1="15" x2="60" y2="45" stroke="#22c55e" stroke-width="2.5"/>
      <line x1="60" y1="30" x2="100" y2="30" stroke="#22c55e" stroke-width="2"/>
      <line x1="65" y1="12" x2="75" y2="2" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="2"/>
      <line x1="72" y1="18" x2="82" y2="8" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="2"/>
    </svg>`,
  },
  {
    id: 'npn_transistor',
    name: 'NPN Transistor',
    category: 'Active',
    symbol: 'Q',
    unit: 'N/A',
    description: 'Current-controlled switch and amplifier',
    usage: 'Switching loads, signal amplification, motor control',
    commonValues: ['2N2222', 'BC547', 'TIP120', '2N3904'],
    tips: 'Base resistor required. VBE ≈ 0.7V. Check hFE for gain.',
    svg: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="40" x2="40" y2="40" stroke="#f59e0b" stroke-width="2"/>
      <line x1="40" y1="15" x2="40" y2="65" stroke="#f59e0b" stroke-width="2.5"/>
      <line x1="40" y1="28" x2="70" y2="10" stroke="#f59e0b" stroke-width="2"/>
      <line x1="40" y1="52" x2="70" y2="70" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="58,62 70,70 62,58" fill="#f59e0b"/>
      <line x1="70" y1="10" x2="70" y2="0" stroke="#f59e0b" stroke-width="2"/>
      <line x1="70" y1="70" x2="70" y2="80" stroke="#f59e0b" stroke-width="2"/>
      <text x="75" y="12" font-size="8" fill="#f59e0b">C</text>
      <text x="75" y="78" font-size="8" fill="#f59e0b">E</text>
      <text x="2" y="38" font-size="8" fill="#f59e0b">B</text>
    </svg>`,
  },
  {
    id: 'diode',
    name: 'Diode',
    category: 'Active',
    symbol: 'D',
    unit: 'Volt (forward)',
    description: 'Allows current to flow in one direction only',
    usage: 'Reverse polarity protection, rectification',
    commonValues: ['1N4007', '1N4148', 'Schottky 1N5819'],
    tips: 'Anode (+) to Cathode (-). VF ≈ 0.7V silicon, 0.3V Schottky.',
    svg: `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="25" x2="30" y2="25" stroke="#ef4444" stroke-width="2"/>
      <polygon points="30,10 30,40 60,25" fill="#ef4444" opacity="0.3" stroke="#ef4444" stroke-width="2"/>
      <line x1="60" y1="10" x2="60" y2="40" stroke="#ef4444" stroke-width="2.5"/>
      <line x1="60" y1="25" x2="100" y2="25" stroke="#ef4444" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'inductor',
    name: 'Inductor',
    category: 'Passive',
    symbol: 'L',
    unit: 'Henry (H)',
    description: 'Stores energy in a magnetic field, opposes current changes',
    usage: 'Filters, power supplies, RF circuits',
    commonValues: ['100µH', '1mH', '10mH', '100mH'],
    tips: 'Check saturation current rating for power inductors.',
    svg: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="20" x2="15" y2="20" stroke="#a855f7" stroke-width="2"/>
      <path d="M15,20 Q22,5 30,20 Q37,35 45,20 Q52,5 60,20 Q67,35 75,20 Q82,5 90,20 Q97,35 105,20" fill="none" stroke="#a855f7" stroke-width="2"/>
      <line x1="105" y1="20" x2="120" y2="20" stroke="#a855f7" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'switch',
    name: 'Push Button',
    category: 'Input',
    symbol: 'SW',
    unit: 'N/A',
    description: 'Momentary switch — connects circuit when pressed',
    usage: 'User input, resets, triggers',
    commonValues: ['SPST', 'SPDT', 'Tactile 6x6mm'],
    tips: 'Add a pull-up or pull-down resistor to avoid floating input.',
    svg: `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="35" x2="30" y2="35" stroke="#64748b" stroke-width="2"/>
      <circle cx="30" cy="35" r="3" fill="#64748b"/>
      <circle cx="70" cy="35" r="3" fill="#64748b"/>
      <line x1="30" y1="35" x2="65" y2="15" stroke="#64748b" stroke-width="2"/>
      <line x1="70" y1="35" x2="100" y2="35" stroke="#64748b" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'ground',
    name: 'Ground',
    category: 'Power',
    symbol: 'GND',
    unit: '0V Reference',
    description: 'Common reference point for all voltages in the circuit',
    usage: 'Power return path, voltage reference',
    commonValues: ['0V', 'GND', 'VSS', '⏚'],
    tips: 'Always connect all grounds together. Separate analog and digital grounds in sensitive designs.',
    svg: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="0" x2="30" y2="25" stroke="#22c55e" stroke-width="2"/>
      <line x1="10" y1="25" x2="50" y2="25" stroke="#22c55e" stroke-width="2.5"/>
      <line x1="16" y1="33" x2="44" y2="33" stroke="#22c55e" stroke-width="2"/>
      <line x1="22" y1="41" x2="38" y2="41" stroke="#22c55e" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'vcc',
    name: 'Power Supply (VCC)',
    category: 'Power',
    symbol: 'VCC',
    unit: 'Volt (V)',
    description: 'Positive power supply voltage for the circuit',
    usage: 'Power source reference, supply connection',
    commonValues: ['3.3V', '5V', '9V', '12V'],
    tips: 'Decouple VCC with 100nF capacitor close to each IC.',
    svg: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="60" x2="30" y2="35" stroke="#ef4444" stroke-width="2"/>
      <line x1="10" y1="35" x2="50" y2="35" stroke="#ef4444" stroke-width="2.5"/>
      <text x="30" y="25" font-size="10" fill="#ef4444" text-anchor="middle" font-weight="bold">VCC</text>
    </svg>`,
  },
  {
    id: 'opamp',
    name: 'Op-Amp',
    category: 'Active',
    symbol: 'U',
    unit: 'N/A',
    description: 'Operational amplifier — voltage amplifier with very high gain',
    usage: 'Signal amplification, comparators, filters, buffers',
    commonValues: ['LM358', 'LM741', 'TL071', 'MCP6002'],
    tips: 'Most op-amps need dual supply. Check output swing specifications.',
    svg: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,10 20,70 80,40" fill="#6366f1" opacity="0.15" stroke="#6366f1" stroke-width="2"/>
      <line x1="0" y1="25" x2="20" y2="25" stroke="#6366f1" stroke-width="2"/>
      <line x1="0" y1="55" x2="20" y2="55" stroke="#6366f1" stroke-width="2"/>
      <line x1="80" y1="40" x2="100" y2="40" stroke="#6366f1" stroke-width="2"/>
      <text x="26" y="30" font-size="10" fill="#6366f1">+</text>
      <text x="26" y="60" font-size="10" fill="#6366f1">-</text>
    </svg>`,
  },
  {
    id: 'voltage_regulator',
    name: 'Voltage Regulator',
    category: 'Power',
    symbol: 'VR',
    unit: 'Volt (V)',
    description: 'Maintains a constant output voltage regardless of input',
    usage: 'Power supply regulation, protecting sensitive components',
    commonValues: ['7805 (5V)', '7812 (12V)', 'LM317 (adj)', 'AMS1117'],
    tips: 'Add input/output capacitors. Check dropout voltage requirements.',
    svg: `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="15" width="60" height="30" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" stroke-width="2" rx="4"/>
      <line x1="0" y1="30" x2="20" y2="30" stroke="#f59e0b" stroke-width="2"/>
      <line x1="80" y1="30" x2="100" y2="30" stroke="#f59e0b" stroke-width="2"/>
      <line x1="50" y1="45" x2="50" y2="60" stroke="#f59e0b" stroke-width="2"/>
      <text x="50" y="35" font-size="9" fill="#f59e0b" text-anchor="middle">VReg</text>
    </svg>`,
  },
  {
    id: 'crystal',
    name: 'Crystal Oscillator',
    category: 'Passive',
    symbol: 'Y',
    unit: 'Hertz (Hz)',
    description: 'Precise frequency reference for microcontrollers and timing',
    usage: 'Clock generation, precise timing, communication',
    commonValues: ['8MHz', '16MHz', '20MHz', '32.768kHz'],
    tips: 'Add load capacitors (usually 22pF) on both pins as per datasheet.',
    svg: `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="25" x2="25" y2="25" stroke="#0ea5e9" stroke-width="2"/>
      <line x1="25" y1="10" x2="25" y2="40" stroke="#0ea5e9" stroke-width="2.5"/>
      <rect x="30" y="12" width="40" height="26" fill="#0ea5e9" opacity="0.15" stroke="#0ea5e9" stroke-width="2"/>
      <line x1="70" y1="10" x2="70" y2="40" stroke="#0ea5e9" stroke-width="2.5"/>
      <line x1="70" y1="25" x2="100" y2="25" stroke="#0ea5e9" stroke-width="2"/>
    </svg>`,
  },
]

export const SYMBOL_CATEGORIES = [
  'All', 'Passive', 'Active', 'Input', 'Output', 'Power',
]

export function getSymbolsByCategory(category) {
  if (category === 'All') return CIRCUIT_SYMBOLS
  return CIRCUIT_SYMBOLS.filter(s => s.category === category)
}