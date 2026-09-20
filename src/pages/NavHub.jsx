import { useNavigate } from 'react-router-dom'
import { OllamaStatusBadge } from '../components/OllamaStatus'

const PAGES = [
  { path:'/', icon:'⚡', title:'Quick Build', desc:'Type idea, get components instantly', color:'#6366f1', tag:'Core' },
  { path:'/wizard', icon:'⚙️', title:'Project Wizard', desc:'Full requirements + timeline setup', color:'#a855f7', tag:'New' },
  { path:'/roadmap', icon:'🗺️', title:'AI Roadmap', desc:'Daily adaptive project planner', color:'#8b5cf6', tag:'New' },
  { path:'/protoscan', icon:'📷', title:'ProtoScan', desc:'AI component photo identification', color:'#06b6d4', tag:'New' },
  { path:'/ide', icon:'💻', title:'Hardware IDE', desc:'Monaco editor + Web Serial', color:'#64748b', tag:'New' },
  { path:'/esim', icon:'🎨', title:'Enhanced Sim', desc:'Drag-drop SVG canvas simulator', color:'#06b6d4', tag:'New' },
  { path:'/simulator2', icon:'🔌', title:'Simulator', desc:'Wokwi-style circuit simulation', color:'#22c55e', tag:'New' },
  { path:'/digitaltwin', icon:'🔮', title:'Digital Twin', desc:'Real hardware live sync', color:'#f59e0b', tag:'New' },
  { path:'/viewer', icon:'🔭', title:'3D Viewer', desc:'270+ AI tools accordion', color:'#6366f1', tag:'Core' },
  { path:'/dashboard', icon:'📊', title:'Dashboard', desc:'XP, analytics, journey', color:'#22c55e', tag:'Core' },
  { path:'/gallery', icon:'🖼️', title:'Gallery', desc:'Community showcase', color:'#f59e0b', tag:'Core' },
  { path:'/history', icon:'📜', title:'History', desc:'All saved prototypes', color:'#0ea5e9', tag:'Core' },
  { path:'/inventory', icon:'📦', title:'Inventory', desc:'Component stock tracker', color:'#a855f7', tag:'Core' },
  { path:'/templates', icon:'📋', title:'Templates', desc:'Pre-built prototypes', color:'#ef4444', tag:'Core' },
  { path:'/landing', icon:'🏠', title:'Landing Page', desc:'Product showcase', color:'#6366f1', tag:'New' },
]

function NavHub() {
  const navigate = useNavigate()
  const newPages = PAGES.filter(function(p){return p.tag==='New'})
  const corePages = PAGES.filter(function(p){return p.tag==='Core'})

  return (
    <div className="min-h-screen bg-[#050510] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black mb-1">ProtoMind Navigation Hub</h1>
            <p className="text-slate-400">All pages and features in one place</p>
          </div>
          <OllamaStatusBadge />
        </div>
        </div>

        <h2 className="text-lg font-bold text-indigo-400 mb-3">New Features (Days 1-10)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {newPages.map(function(page){return(
            <button key={page.path} onClick={function(){navigate(page.path)}}
              className="p-4 rounded-2xl border text-left hover:scale-105 transition-all duration-200 group"
              style={{backgroundColor:page.color+'10',borderColor:page.color+'30'}}>
              <div className="text-3xl mb-2">{page.icon}</div>
              <p className="text-white font-bold text-sm">{page.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{page.desc}</p>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-bold" style={{backgroundColor:page.color+'20',color:page.color}}>NEW</span>
            </button>
          )})}
        </div>

        <h2 className="text-lg font-bold text-slate-400 mb-3">Core Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {corePages.map(function(page){return(
            <button key={page.path} onClick={function(){navigate(page.path)}}
              className="p-4 rounded-2xl border border-[#1e1e2e] bg-[#0d0d1a] text-left hover:border-indigo-700 hover:scale-105 transition-all duration-200">
              <div className="text-3xl mb-2">{page.icon}</div>
              <p className="text-white font-bold text-sm">{page.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{page.desc}</p>
            </button>
          )})}
        </div>

        <div className="mt-8 bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-800 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {[
              {l:'⚡ Quick Build',p:'/'},
              {l:'⚙️ Start with Requirements',p:'/wizard'},
              {l:'📷 Scan a Component',p:'/protoscan'},
              {l:'🔌 Open Simulator',p:'/simulator2'},
              {l:'💻 Open IDE',p:'/ide'},
              {l:'🔮 Digital Twin',p:'/digitaltwin'},
            ].map(function(item){return(
              <button key={item.p} onClick={function(){navigate(item.p)}}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-indigo-300 rounded-xl text-sm font-medium transition">
                {item.l}
              </button>
            )})}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavHub
