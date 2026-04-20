import { useState } from 'react'
import PanelErrorBoundary from './PanelErrorBoundary'

function AccordionSection({ title, subtitle, icon, children, defaultOpen = false, badge = null }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mt-4 bg-[#0d0d1a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-4 hover:bg-[#13131f] transition text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-white font-semibold text-sm">{title}</p>
            {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-xs bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-900">
              {badge}
            </span>
          )}
          <span className="text-slate-500 text-sm">{open ? '↑' : '↓'}</span>
        </div>
      </button>
      {open && (
        <div className="px-6 pb-6">
          <PanelErrorBoundary name={title}>
            {children}
          </PanelErrorBoundary>
        </div>
      )}
    </div>
  )
}

export default AccordionSection