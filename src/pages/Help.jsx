import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const KEYBOARD_SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette / search' },
      { keys: ['Tab'], description: 'Navigate between interactive elements' },
      { keys: ['Enter'], description: 'Activate focused button or link' },
      { keys: ['Esc'], description: 'Close modals and dialogs' },
    ],
  },
  {
    category: '3D Viewer',
    shortcuts: [
      { keys: ['🖱️ Drag'], description: 'Rotate the 3D view' },
      { keys: ['Scroll'], description: 'Zoom in and out' },
      { keys: ['Hover'], description: 'Spin individual component' },
      { keys: ['Click'], description: 'Select component for details' },
    ],
  },
  {
    category: 'General',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save current project' },
      { keys: ['⌘', 'Z'], description: 'Undo last change' },
      { keys: ['⌘', 'Shift', 'Z'], description: 'Redo last change' },
      { keys: ['⌘', '/'], description: 'Toggle help center' },
    ],
  },
]

const FAQ_ITEMS = [
  {
    q: 'Why is the AI not responding?',
    a: 'Make sure Ollama is running in your terminal. Open a new terminal window and run "ollama serve". Keep it running in the background while using ProtoMind.',
  },
  {
    q: 'How do I change the AI model?',
    a: 'Go to Settings → AI Configuration → AI Model. You can switch between Llama 3.2, Mistral, CodeLlama and more. Make sure you have pulled the model first with "ollama pull model-name".',
  },
  {
    q: 'Why are my projects not syncing to the cloud?',
    a: 'Cloud sync requires a Supabase account. Go to Settings → Sign In to create an account. Without signing in, all projects are saved locally on your device.',
  },
  {
    q: 'How do I 3D print my prototype?',
    a: 'In the 3D Viewer, click "3D Print?" to analyse your prototype. If printing is recommended, click "STL" to download the file. Send this file to a 3D printing service like JLCPCB, Shapeways, or your local print shop.',
  },
  {
    q: 'How do I export my project as a PDF?',
    a: 'In the 3D Viewer, click the "PDF" button at the top. This generates a complete prototype report with all components, specifications, and your validation results.',
  },
  {
    q: 'Can I use ProtoMind offline?',
    a: 'Most features work offline since AI runs locally via Ollama. You only need internet for cloud sync, the public gallery, and sharing links. The app can be installed as a PWA for offline access.',
  },
  {
    q: 'How do I add my own components?',
    a: 'Go to More → My Library → Add Component. You can create custom components with your own specs, prices, and datasheets. These appear alongside the default components.',
  },
  {
    q: 'How do I share my prototype?',
    a: 'In the 3D Viewer, click "Share". You can generate a public link, share directly to WhatsApp/Twitter/LinkedIn, copy embed code, or share a preview card.',
  },
  {
    q: 'Why does the 3D viewer show a blank screen?',
    a: 'This usually happens when no components are selected. Go back to the Components page and select at least one component before proceeding to the 3D viewer.',
  },
  {
    q: 'How do I restore an older version of my project?',
    a: 'In the 3D Viewer, scroll down and open the "Version History" accordion. You can see all saved versions with timestamps and click "Restore" to go back to any previous version.',
  },
]

const TIPS = [
  {
    icon: '🧠',
    title: 'Be specific with your idea',
    desc: 'Instead of "smart device", try "A wearable smart ring that monitors heart rate and syncs to iPhone via Bluetooth". More detail = better AI component suggestions.',
  },
  {
    icon: '⚡',
    title: 'Start with a template',
    desc: 'Use the Templates page to start from a pre-built prototype instead of blank. This saves time and gives you a solid starting point to customise.',
  },
  {
    icon: '💾',
    title: 'Save often',
    desc: 'Click Save in the 3D Viewer after each session. ProtoMind keeps version history so you can always go back to any previous state of your project.',
  },
  {
    icon: '📌',
    title: 'Set up pin assignments first',
    desc: 'Before generating code, use the Pin Assignment Editor to map all your connections. This makes the generated Arduino code much more accurate and ready to upload.',
  },
  {
    icon: '🔋',
    title: 'Check power requirements',
    desc: 'Always run the Power Calculator before building. It tells you if your power supply is adequate and estimates battery life for portable projects.',
  },
  {
    icon: '🛡️',
    title: 'Run the safety checklist',
    desc: 'Before physically building, expand the Safety Checklist in the viewer. The AI identifies voltage mismatches, missing protection circuits, and other common mistakes.',
  },
]

const TROUBLESHOOTING = [
  {
    problem: 'Ollama not connecting',
    steps: [
      'Open Terminal on your Mac',
      'Run: ollama serve',
      'Keep the terminal open',
      'Refresh ProtoMind',
      'Check Settings → Ollama URL is http://localhost:11434',
    ],
  },
  {
    problem: 'Build fails on Vercel',
    steps: [
      'Go to vercel.com → your project → Settings',
      'Set Framework Preset to Vite',
      'Set Build Command to npm run build',
      'Set Output Directory to dist',
      'Click Save and Redeploy',
    ],
  },
  {
    problem: '3D viewer is slow',
    steps: [
      'Reduce number of components (keep under 10)',
      'Close other browser tabs',
      'Try a different environment (Dark Lab is fastest)',
      'Disable exploded view if not needed',
      'Refresh the page to clear memory',
    ],
  },
  {
    problem: 'AI generates wrong components',
    steps: [
      'Be more specific in your prototype idea',
      'Try a different Ollama model in Settings',
      'Use Templates as a starting point',
      'Manually add/remove components after AI suggestion',
      'Use the Change Validator to verify AI suggestions',
    ],
  },
]

function ShortcutKey({ label }) {
  return (
    <kbd className="px-2 py-1 bg-[#1e1e2e] border border-[#2e2e4e] rounded-lg text-xs text-slate-300 font-mono">
      {label}
    </kbd>
  )
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#1e1e2e] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-4 bg-[#0d0d1a] hover:bg-[#13131f] transition text-left"
      >
        <p className="text-white text-sm font-medium pr-4">{item.q}</p>
        <span className="text-slate-500 shrink-0">{open ? '↑' : '↓'}</span>
      </button>
      {open && (
        <div className="px-5 py-4 bg-[#13131f] border-t border-[#1e1e2e]">
          <p className="text-slate-300 text-sm leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  )
}

function Help() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('shortcuts')

  const SECTIONS = [
    { id: 'shortcuts', label: '⌨️ Shortcuts' },
    { id: 'faq', label: '❓ FAQ' },
    { id: 'tips', label: '💡 Tips' },
    { id: 'troubleshooting', label: '🔧 Troubleshooting' },
  ]

  return (
    <div className="min-h-screen page-enter px-4 sm:px-8 md:px-16 py-8 sm:py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">🆘 Help Center</h2>
          <p className="text-slate-400 text-sm">
            Keyboard shortcuts, FAQ, tips and troubleshooting
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-sm transition"
        >
          ← Back to Home
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeSection === section.id
                ? 'bg-indigo-600 text-white'
                : 'bg-[#0d0d1a] border border-[#1e1e2e] text-slate-400 hover:border-indigo-800'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Keyboard Shortcuts */}
      {activeSection === 'shortcuts' && (
        <div className="space-y-6">
          {KEYBOARD_SHORTCUTS.map(group => (
            <div key={group.category} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
              <h3 className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0">
                    <p className="text-slate-300 text-sm">{shortcut.description}</p>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      {shortcut.keys.map((key, j) => (
                        <span key={j} className="flex items-center gap-1">
                          <ShortcutKey label={key} />
                          {j < shortcut.keys.length - 1 && (
                            <span className="text-slate-600 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-indigo-950 border border-indigo-900 rounded-2xl p-5">
            <h3 className="text-indigo-400 font-semibold text-sm mb-2">⌨️ Pro Tip</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Press <ShortcutKey label="⌘K" /> anywhere in the app to open the command palette.
              You can navigate to any page, search your projects, and access all features without
              using your mouse.
            </p>
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeSection === 'faq' && (
        <div className="space-y-3 max-w-3xl">
          <p className="text-slate-500 text-sm mb-4">
            {FAQ_ITEMS.length} frequently asked questions
          </p>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} item={item} />
          ))}
        </div>
      )}

      {/* Tips */}
      {activeSection === 'tips' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPS.map((tip, i) => (
            <div
              key={i}
              className="bg-[#0d0d1a] border border-[#1e1e2e] hover:border-indigo-800 rounded-2xl p-5 transition"
            >
              <div className="text-3xl mb-3">{tip.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-2">{tip.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Troubleshooting */}
      {activeSection === 'troubleshooting' && (
        <div className="space-y-4 max-w-3xl">
          {TROUBLESHOOTING.map((item, i) => (
            <div key={i} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔧</span>
                <h3 className="text-white font-semibold text-sm">{item.problem}</h3>
              </div>
              <ol className="space-y-2">
                {item.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="text-indigo-400 font-bold text-xs shrink-0 w-5 mt-0.5">{j + 1}.</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Still having issues?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              If none of the above solutions work, try clearing your browser cache and reloading the app. All your projects are saved in localStorage and will not be affected.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition"
              >
                ↺ Reload App
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
              >
                ⚙️ Open Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Help