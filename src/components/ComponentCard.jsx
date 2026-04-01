function ComponentCard({ icon, name, category, reason, quantity, selected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`bg-[#0d0d1a] border rounded-2xl p-5 cursor-pointer transition ${
        selected
          ? 'border-indigo-500 ring-1 ring-indigo-500'
          : 'border-[#1e1e2e] hover:border-indigo-800'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{icon}</div>
          <div>
            <h3 className="text-sm font-semibold text-white">{name}</h3>
            <span className="text-xs text-slate-500">{category}</span>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
          selected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
        }`}>
          {selected && <span className="text-white text-xs">✓</span>}
        </div>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed mb-3">{reason}</p>

      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-600">Qty: {quantity}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          selected ? 'bg-indigo-950 text-indigo-400' : 'bg-[#1a1a2e] text-slate-500'
        }`}>
          {selected ? 'Selected' : 'Click to select'}
        </span>
      </div>
    </div>
  )
}

export default ComponentCard