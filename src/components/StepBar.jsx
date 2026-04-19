function StepBar({ currentStep }) {
  const steps = [
    { number: 1, label: 'Idea', icon: '💡' },
    { number: 2, label: 'Components', icon: '🔧' },
    { number: 3, label: 'Layout', icon: '📐' },
    { number: 4, label: '3D View', icon: '🧊' },
  ]

  return (
    <div className="flex items-center justify-center py-4 px-4 sm:px-10 bg-[#0d0d1a] border-b border-[#1e1e2e] w-full">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition ${
              step.number < currentStep
                ? 'bg-indigo-600 text-white'
                : step.number === currentStep
                ? 'bg-indigo-500 text-white ring-2 sm:ring-4 ring-indigo-900'
                : 'bg-[#1e1e2e] text-slate-500'
            }`}>
              {step.number < currentStep ? '✓' : step.icon}
            </div>
            <span className={`text-xs mt-1 font-medium hidden sm:block ${
              step.number === currentStep
                ? 'text-indigo-400'
                : step.number < currentStep
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 sm:w-20 h-0.5 mx-1 sm:mx-3 mb-0 sm:mb-5 rounded transition ${
              step.number < currentStep ? 'bg-indigo-600' : 'bg-[#1e1e2e]'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default StepBar