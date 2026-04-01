import { useState } from 'react'

function App() {
  const [idea, setIdea] = useState('')

  return (
    <div style={styles.container}>

      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>⚡ ProtoMind</div>
        <div style={styles.navLinks}>
          <span style={styles.navItem}>Home</span>
          <span style={styles.navItem}>Components</span>
          <span style={styles.navItem}>3D View</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.badge}>AI Prototype Generator</div>
        <h1 style={styles.title}>
          Turn Your Idea Into a<br />
          <span style={styles.highlight}>Real Prototype</span>
        </h1>
        <p style={styles.subtitle}>
          Describe your idea in one sentence. ProtoMind will suggest
          components, show placement, and generate a 3D model.
        </p>

        {/* Idea Input Box */}
        <div style={styles.inputWrapper}>
          <textarea
            style={styles.textarea}
            placeholder="e.g. A smart water bottle that tracks temperature and hydration..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
          />
          <button
            style={idea.length > 0 ? styles.buttonActive : styles.buttonDisabled}
            disabled={idea.length === 0}
          >
            {idea.length > 0 ? '⚡ Generate Prototype' : 'Type your idea first...'}
          </button>
        </div>

        {/* Example Ideas */}
        <div style={styles.examples}>
          <span style={styles.exampleLabel}>Try:</span>
          <span style={styles.exampleChip} onClick={() => setIdea('A smart helmet with collision detection and SOS alert')}>
            Smart Helmet
          </span>
          <span style={styles.exampleChip} onClick={() => setIdea('An automatic plant watering system with soil moisture sensor')}>
            Plant Watering System
          </span>
          <span style={styles.exampleChip} onClick={() => setIdea('A gesture controlled robotic arm')}>
            Robotic Arm
          </span>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🧠</div>
          <h3 style={styles.cardTitle}>AI Component Picker</h3>
          <p style={styles.cardText}>AI suggests the best components for your idea with reasons</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>📐</div>
          <h3 style={styles.cardTitle}>2D Layout Preview</h3>
          <p style={styles.cardText}>See how components connect before building anything</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🖨️</div>
          <h3 style={styles.cardTitle}>3D Print Ready</h3>
          <p style={styles.cardText}>Export STL files directly to send to any 3D printing service</p>
        </div>
      </div>

    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    color: '#ffffff',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 60px',
    borderBottom: '1px solid #1e1e2e',
    backgroundColor: '#0d0d1a',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#818cf8',
    letterSpacing: '1px',
  },
  navLinks: {
    display: 'flex',
    gap: '40px',
  },
  navItem: {
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '15px',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 40px 60px',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#1e1b4b',
    color: '#818cf8',
    padding: '6px 18px',
    borderRadius: '20px',
    fontSize: '13px',
    marginBottom: '24px',
    border: '1px solid #3730a3',
  },
  title: {
    fontSize: '56px',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '20px',
  },
  highlight: {
    color: '#818cf8',
  },
  subtitle: {
    fontSize: '18px',
    color: '#94a3b8',
    maxWidth: '580px',
    lineHeight: '1.7',
    marginBottom: '40px',
  },
  inputWrapper: {
    width: '100%',
    maxWidth: '660px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  textarea: {
    width: '100%',
    padding: '18px 20px',
    backgroundColor: '#13131f',
    border: '1px solid #2e2e4e',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    resize: 'none',
    outline: 'none',
    lineHeight: '1.6',
  },
  buttonActive: {
    padding: '16px',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  buttonDisabled: {
    padding: '16px',
    backgroundColor: '#1e1e2e',
    color: '#4a4a6a',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'not-allowed',
  },
  examples: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  exampleLabel: {
    color: '#4a4a6a',
    fontSize: '14px',
  },
  exampleChip: {
    backgroundColor: '#13131f',
    border: '1px solid #2e2e4e',
    color: '#94a3b8',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  cards: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    padding: '0 60px 80px',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#0d0d1a',
    border: '1px solid #1e1e2e',
    borderRadius: '16px',
    padding: '32px 28px',
    width: '260px',
    textAlign: 'center',
  },
  cardIcon: {
    fontSize: '36px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  cardText: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
}

export default App