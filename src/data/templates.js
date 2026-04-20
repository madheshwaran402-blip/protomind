export const PROTOTYPE_TEMPLATES = [
  {
    id: 'smart-watch',
    name: 'Smart Watch',
    category: 'Wearable',
    icon: '⌚',
    difficulty: 'Intermediate',
    buildTime: '2 days',
    description: 'A wearable smartwatch with heart rate monitoring, step counting, and Bluetooth connectivity.',
    idea: 'A smart watch with heart rate sensor, OLED display, step counter and Bluetooth connectivity',
    tags: ['Wearable', 'Health', 'IoT'],
    components: [
      { id: 'tmpl_1', name: 'ESP32', category: 'Microcontroller', icon: '🧠', reason: 'Main processor with Bluetooth and WiFi built in', quantity: 1 },
      { id: 'tmpl_2', name: 'MAX30102 Heart Rate Sensor', category: 'Sensor', icon: '❤️', reason: 'Measures heart rate and blood oxygen levels', quantity: 1 },
      { id: 'tmpl_3', name: 'OLED Display 0.96"', category: 'Display', icon: '🖥️', reason: 'Small display for showing time and health data', quantity: 1 },
      { id: 'tmpl_4', name: 'MPU6050 Accelerometer', category: 'Sensor', icon: '📡', reason: 'Counts steps and detects motion', quantity: 1 },
      { id: 'tmpl_5', name: 'LiPo Battery 500mAh', category: 'Power', icon: '🔋', reason: 'Compact rechargeable battery for wearable use', quantity: 1 },
    ],
  },
  {
    id: 'weather-station',
    name: 'Weather Station',
    category: 'Monitoring',
    icon: '🌤️',
    difficulty: 'Beginner',
    buildTime: '1 day',
    description: 'An indoor/outdoor weather station that monitors temperature, humidity, and air pressure.',
    idea: 'An IoT weather station that monitors temperature, humidity, pressure and displays data on LCD',
    tags: ['Monitoring', 'IoT', 'Home Automation'],
    components: [
      { id: 'tmpl_6', name: 'Arduino Nano', category: 'Microcontroller', icon: '🧠', reason: 'Main controller for reading sensors', quantity: 1 },
      { id: 'tmpl_7', name: 'DHT22 Temperature Sensor', category: 'Sensor', icon: '🌡️', reason: 'Measures temperature and humidity accurately', quantity: 1 },
      { id: 'tmpl_8', name: 'BMP280 Pressure Sensor', category: 'Sensor', icon: '📊', reason: 'Measures barometric pressure for weather prediction', quantity: 1 },
      { id: 'tmpl_9', name: 'LCD 16x2 Display', category: 'Display', icon: '🖥️', reason: 'Shows sensor readings clearly', quantity: 1 },
      { id: 'tmpl_10', name: 'ESP8266 WiFi Module', category: 'Communication', icon: '📶', reason: 'Sends data to cloud for remote monitoring', quantity: 1 },
    ],
  },
  {
    id: 'smart-plant',
    name: 'Smart Plant Watering',
    category: 'Agriculture',
    icon: '🌱',
    difficulty: 'Beginner',
    buildTime: '1 day',
    description: 'Automatically waters plants when soil moisture drops below a threshold.',
    idea: 'An automatic plant watering system with soil moisture sensor and water pump control',
    tags: ['Agriculture', 'Home Automation', 'IoT'],
    components: [
      { id: 'tmpl_11', name: 'Arduino Uno', category: 'Microcontroller', icon: '🧠', reason: 'Controls the water pump and reads sensors', quantity: 1 },
      { id: 'tmpl_12', name: 'Soil Moisture Sensor', category: 'Sensor', icon: '💧', reason: 'Detects when soil is dry and needs water', quantity: 2 },
      { id: 'tmpl_13', name: '5V Relay Module', category: 'Actuator', icon: '⚡', reason: 'Switches the water pump on and off', quantity: 1 },
      { id: 'tmpl_14', name: 'Mini Water Pump', category: 'Actuator', icon: '🚿', reason: 'Pumps water to the plant when triggered', quantity: 1 },
      { id: 'tmpl_15', name: 'OLED Display', category: 'Display', icon: '🖥️', reason: 'Shows moisture level and watering status', quantity: 1 },
    ],
  },
  {
    id: 'robot-arm',
    name: 'Gesture Robot Arm',
    category: 'Robotics',
    icon: '🦾',
    difficulty: 'Advanced',
    buildTime: '4 days',
    description: 'A 4-DOF robotic arm controlled by hand gestures using an accelerometer glove.',
    idea: 'A gesture controlled robotic arm with 4 servo motors and accelerometer hand control',
    tags: ['Robotics', 'IoT'],
    components: [
      { id: 'tmpl_16', name: 'Arduino Mega', category: 'Microcontroller', icon: '🧠', reason: 'Needs many PWM pins to control multiple servos', quantity: 1 },
      { id: 'tmpl_17', name: 'SG90 Servo Motor', category: 'Actuator', icon: '⚙️', reason: 'Each servo controls one joint of the arm', quantity: 4 },
      { id: 'tmpl_18', name: 'MPU6050 Accelerometer', category: 'Sensor', icon: '📡', reason: 'Reads hand tilt to control arm direction', quantity: 1 },
      { id: 'tmpl_19', name: 'PCA9685 PWM Driver', category: 'Module', icon: '🔧', reason: 'Expands PWM outputs to control all servos', quantity: 1 },
      { id: 'tmpl_20', name: 'Li-Ion Battery Pack', category: 'Power', icon: '🔋', reason: 'Servos need more power than USB can provide', quantity: 1 },
    ],
  },
  {
    id: 'smart-door',
    name: 'Smart Door Lock',
    category: 'Security',
    icon: '🔐',
    difficulty: 'Intermediate',
    buildTime: '2 days',
    description: 'A keypad-controlled door lock with RFID card access and remote unlock via Bluetooth.',
    idea: 'A smart door lock with RFID access, keypad entry and Bluetooth remote control',
    tags: ['Security', 'IoT', 'Home Automation'],
    components: [
      { id: 'tmpl_21', name: 'ESP32', category: 'Microcontroller', icon: '🧠', reason: 'Bluetooth and WiFi for remote access', quantity: 1 },
      { id: 'tmpl_22', name: 'RC522 RFID Reader', category: 'Sensor', icon: '📡', reason: 'Reads RFID cards and key fobs', quantity: 1 },
      { id: 'tmpl_23', name: '4x4 Keypad', category: 'Sensor', icon: '⌨️', reason: 'PIN code entry for manual unlock', quantity: 1 },
      { id: 'tmpl_24', name: 'Servo Motor', category: 'Actuator', icon: '⚙️', reason: 'Physically turns the door lock mechanism', quantity: 1 },
      { id: 'tmpl_25', name: 'OLED Display', category: 'Display', icon: '🖥️', reason: 'Shows access status and instructions', quantity: 1 },
    ],
  },
  {
    id: 'air-quality',
    name: 'Air Quality Monitor',
    category: 'Monitoring',
    icon: '💨',
    difficulty: 'Beginner',
    buildTime: '1 day',
    description: 'Monitors indoor air quality including CO2, dust particles, and VOC gases.',
    idea: 'An indoor air quality monitor measuring CO2, dust, VOC gases with LED air quality indicator',
    tags: ['Monitoring', 'Health', 'IoT'],
    components: [
      { id: 'tmpl_26', name: 'Arduino Nano', category: 'Microcontroller', icon: '🧠', reason: 'Reads multiple sensors and controls display', quantity: 1 },
      { id: 'tmpl_27', name: 'MQ-135 Gas Sensor', category: 'Sensor', icon: '💨', reason: 'Detects CO2 and harmful gases in air', quantity: 1 },
      { id: 'tmpl_28', name: 'Sharp Dust Sensor', category: 'Sensor', icon: '🌫️', reason: 'Measures PM2.5 dust particles', quantity: 1 },
      { id: 'tmpl_29', name: 'OLED Display', category: 'Display', icon: '🖥️', reason: 'Shows real-time air quality readings', quantity: 1 },
      { id: 'tmpl_30', name: 'RGB LED', category: 'Actuator', icon: '💡', reason: 'Green/yellow/red indicator for air quality level', quantity: 3 },
    ],
  },
  {
    id: 'rc-car',
    name: 'Bluetooth RC Car',
    category: 'Vehicle',
    icon: '🚗',
    difficulty: 'Intermediate',
    buildTime: '2 days',
    description: 'A remote controlled car operated via Bluetooth from a smartphone app.',
    idea: 'A Bluetooth remote controlled car with 4 DC motors and smartphone control app',
    tags: ['Vehicle', 'IoT', 'Robotics'],
    components: [
      { id: 'tmpl_31', name: 'Arduino Nano', category: 'Microcontroller', icon: '🧠', reason: 'Controls motor driver and reads Bluetooth commands', quantity: 1 },
      { id: 'tmpl_32', name: 'HC-05 Bluetooth Module', category: 'Communication', icon: '📶', reason: 'Receives commands from smartphone', quantity: 1 },
      { id: 'tmpl_33', name: 'L298N Motor Driver', category: 'Actuator', icon: '⚙️', reason: 'Controls speed and direction of 4 DC motors', quantity: 1 },
      { id: 'tmpl_34', name: 'DC Motor TT', category: 'Actuator', icon: '🔄', reason: 'Drives each wheel of the car', quantity: 4 },
      { id: 'tmpl_35', name: '18650 Battery Pack', category: 'Power', icon: '🔋', reason: 'Powers motors and electronics', quantity: 1 },
    ],
  },
  {
    id: 'voice-assistant',
    name: 'Voice Assistant Device',
    category: 'IoT',
    icon: '🎤',
    difficulty: 'Advanced',
    buildTime: '3 days',
    description: 'A standalone voice assistant that listens for commands and responds via speaker.',
    idea: 'A voice activated assistant with microphone input, speaker output and WiFi connectivity',
    tags: ['IoT', 'Connected', 'Home Automation'],
    components: [
      { id: 'tmpl_36', name: 'ESP32', category: 'Microcontroller', icon: '🧠', reason: 'Powerful enough for audio processing with WiFi', quantity: 1 },
      { id: 'tmpl_37', name: 'I2S Microphone INMP441', category: 'Sensor', icon: '🎤', reason: 'High quality digital microphone for voice capture', quantity: 1 },
      { id: 'tmpl_38', name: 'I2S DAC MAX98357', category: 'Module', icon: '🔊', reason: 'Digital audio amplifier for speaker output', quantity: 1 },
      { id: 'tmpl_39', name: '3W Speaker', category: 'Actuator', icon: '🔈', reason: 'Outputs audio responses', quantity: 1 },
      { id: 'tmpl_40', name: 'RGB LED Ring', category: 'Display', icon: '💡', reason: 'Visual indicator when listening or processing', quantity: 1 },
    ],
  },
]

export const TEMPLATE_CATEGORIES = [
  'All', 'Wearable', 'Monitoring', 'Agriculture',
  'Robotics', 'Security', 'Vehicle', 'IoT',
]

export function getTemplateById(id) {
  return PROTOTYPE_TEMPLATES.find(t => t.id === id) || null
}

export function searchTemplates(query) {
  if (!query.trim()) return PROTOTYPE_TEMPLATES
  const q = query.toLowerCase()
  return PROTOTYPE_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  )
}