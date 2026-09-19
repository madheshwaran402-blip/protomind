import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function CountUp({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef()
  useEffect(function() {
    const start = Date.now()
    const timer = setInterval(function() {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return function() { clearInterval(timer) }
  }, [end])
  return <span>{count.toLocaleString()}{suffix}</span>
}

function FeatureCard({ icon, title, desc, color, onClick }) {
  return (
    <div onClick={onClick}
      className={"group relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden " + (onClick ? 'hover:border-opacity-100' : '')}
      style={{backgroundColor:color+'08', borderColor:color+'30'}}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{background:`radial-gradient(circle at center, ${color}10, transparent 70%)`}}/>
      <div className="relative z-10">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        {onClick && (
          <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{color}}>
            Open <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        )}
      </div>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mousePos, setMousePos] = useState({x:0,y:0})

  useEffect(function() {
    function handleScroll() { setScrolled(window.scrollY > 50) }
    function handleMouse(e) { setMousePos({x:e.clientX,y:e.clientY}) }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouse)
    return function() {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  const FEATURES = [
    { icon:'⚙️', title:'Smart Wizard', desc:'Tell ProtoMind your requirements. Get perfectly matched components and architecture.', color:'#6366f1', path:'/wizard' },
    { icon:'🗺️', title:'AI Roadmap', desc:'Daily personalized project plan adapted to your schedule and skill level.', color:'#a855f7', path:'/roadmap' },
    { icon:'📷', title:'ProtoScan', desc:'Unknown component? Photograph it. ProtoMind identifies it instantly.', color:'#06b6d4', path:'/protoscan' },
    { icon:'💻', title:'Hardware IDE', desc:'VS Code-quality editor with Web Serial, compile checking, and AI code generation.', color:'#64748b', path:'/ide' },
    { icon:'🔌', title:'Circuit Simulator', desc:'Wire up components on realistic board SVGs. Watch LEDs glow in real time.', color:'#22c55e', path:'/simulator2' },
    { icon:'🔮', title:'Digital Twin', desc:'Connect real hardware and mirror it virtually. Live sensor data synced both ways.', color:'#f59e0b', path:'/digitaltwin' },
  ]

  const STATS = [
    { n:270, suffix:'+', label:'AI Features' },
    { n:8, suffix:'', label:'Board Types' },
    { n:200, suffix:'+', label:'Components' },
    { n:30, suffix:'', label:'Days Build Sprint' },
  ]

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {/* Mouse-following gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
        style={{background:`radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, #6366f108, transparent 40%)`}}/>

      {/* Navbar */}
      <nav className={"fixed top-0 left-0 right-0 z-50 transition-all duration-300 " + (scrolled?'bg-[#050510] border-b border-[#1e1e2e] backdrop-blur-xl':'bg-transparent')}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <button onClick={function(){window.scrollTo({top:0,behavior:'smooth'})}} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-black">P</div>
            <span className="text-white font-black text-xl">ProtoMind</span>
          </button>
          <div className="flex-1"/>
          <div className="hidden sm:flex items-center gap-1">
            {[{l:'Wizard',p:'/wizard'},{l:'Roadmap',p:'/roadmap'},{l:'ProtoScan',p:'/protoscan'},{l:'IDE',p:'/ide'},{l:'Simulator',p:'/simulator2'},{l:'Twin',p:'/digitaltwin'}].map(function(item){return(
              <button key={item.l} onClick={function(){navigate(item.p)}}
                className="px-3 py-1.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-white hover:bg-opacity-5 transition">
                {item.l}
              </button>
            )})}
          </div>
          <button onClick={function(){navigate('/')}}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition">
            Build Now →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 opacity-8 rounded-full blur-3xl animate-pulse"/>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 opacity-8 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}}/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600 opacity-5 rounded-full blur-3xl"/>
          {/* Grid */}
          <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(#1e1e2e20 1px, transparent 1px), linear-gradient(90deg, #1e1e2e20 1px, transparent 1px)',backgroundSize:'60px 60px'}}/>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-5 py-2 text-sm text-indigo-400 mb-8">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"/>
            270+ AI Features • Live Circuit Simulator • Digital Twin
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black leading-tight mb-6">
            <span className="text-white">From</span>{'  '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Idea
            </span>
            <br/>
            <span className="text-white">to </span>
            <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
              Working Prototype
            </span>
          </h1>

          <p className="text-slate-400 text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            ProtoMind is the AI-powered hardware engineering platform that takes your idea and
            generates components, wiring, code, 3D models, compliance reports, pitch decks — and guides
            you every day until it's built.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={function(){navigate('/')}}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-black text-lg transition shadow-2xl shadow-indigo-900/40 flex items-center gap-2">
              <span>⚡</span> Start Building Free
            </button>
            <button onClick={function(){navigate('/wizard')}}
              className="px-8 py-4 bg-[#0d0d1a] border border-[#2e2e4e] hover:border-indigo-500 rounded-2xl font-bold text-lg transition flex items-center gap-2">
              <span>⚙️</span> Detailed Setup
            </button>
            <button onClick={function(){navigate('/simulator2')}}
              className="px-8 py-4 bg-[#0d0d1a] border border-[#2e2e4e] hover:border-cyan-500 rounded-2xl font-bold text-lg transition flex items-center gap-2">
              <span>🔌</span> Try Simulator
            </button>
          </div>

          {/* URL badge */}
          <div className="inline-flex items-center gap-2 bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl px-4 py-2 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            Live at <span className="text-indigo-400 font-medium">protomind-ten.vercel.app</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-[#1e1e2e]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(function(stat){return(
            <div key={stat.label} className="text-center">
              <p className="text-4xl sm:text-5xl font-black text-white mb-1">
                <CountUp end={stat.n} suffix={stat.suffix}/>
              </p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          )})}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">
              Everything You Need to{'  '}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Build Hardware</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Six powerful tools, one unified platform. From first idea to shipped product.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(function(f){return(
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} color={f.color} onClick={function(){navigate(f.path)}}/>
            )})}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#0a0a1a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-14">How ProtoMind Works</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-500"/>
            {[
              {step:1,icon:'💡',title:'Describe Your Idea',desc:'Type what you want to build in plain English. "Smart greenhouse monitor with ESP32 and DHT22".',color:'#6366f1'},
              {step:2,icon:'⚙️',title:'Set Requirements',desc:'Communication, power, budget, skill level. ProtoMind uses this to make better engineering decisions.',color:'#a855f7'},
              {step:3,icon:'🤖',title:'AI Generates Everything',desc:'Components, wiring, code, 3D model, compliance, pitch deck — all in seconds.',color:'#06b6d4'},
              {step:4,icon:'🗺️',title:'Get Your Daily Plan',desc:'ProtoMind creates a personalized day-by-day roadmap based on your available time.',color:'#22c55e'},
              {step:5,icon:'🔌',title:'Simulate Before Building',desc:'Test your circuit in the browser. Wire LEDs, run code, see serial output — before buying parts.',color:'#f59e0b'},
              {step:6,icon:'🔮',title:'Connect Real Hardware',desc:'Plug in your Arduino or ESP32. Digital Twin mirrors real sensor data into your virtual prototype.',color:'#ef4444'},
            ].map(function(item){return(
              <div key={item.step} className="relative flex gap-6 mb-10 pl-20">
                <div className="absolute left-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                  style={{backgroundColor:item.color+'20',border:'2px solid '+item.color+'40'}}>
                  {item.icon}
                </div>
                <div className="flex-1 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{backgroundColor:item.color+'20',color:item.color}}>Step {item.step}</span>
                    <h3 className="text-white font-bold">{item.title}</h3>
                  </div>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-10 rounded-3xl blur-xl"/>
            <div className="relative bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-800 rounded-3xl p-12">
              <h2 className="text-4xl font-black mb-4">Ready to Build?</h2>
              <p className="text-slate-400 text-lg mb-8">
                Join thousands of makers, students and startups who build faster with ProtoMind.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={function(){navigate('/wizard')}}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-black text-lg transition">
                  Start with Requirements ⚙️
                </button>
                <button onClick={function(){navigate('/')}}
                  className="px-8 py-4 border border-[#2e2e4e] hover:border-indigo-500 rounded-2xl font-bold text-lg transition">
                  Quick Start ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-10 px-6 text-center text-slate-600 text-sm">
        <p className="font-black text-white text-lg mb-2">ProtoMind</p>
        <p>AI-Powered Electronics Prototyping Platform • protomind-ten.vercel.app</p>
        <p className="mt-1">Built over 270 days • React + Three.js + Ollama + Supabase + Vercel</p>
      </footer>
    </div>
  )
}

export default LandingPage
