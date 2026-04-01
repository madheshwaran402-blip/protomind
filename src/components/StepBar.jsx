function StepBar({ currentStep }) {
  const steps = [
    { number: 1, label: 'Idea' },
    { number: 2, label: 'Components' },
    { number: 3, label: 'Layout' },
    { number: 4, label: '3D View' },
  ]

  return (
    <div className="flex items-center justify-center py-6 px-10">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">

          {/* Circle */}
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
              step.number < currentStep
                ? 'bg-indigo-600 text-white'
                : step.number === currentStep
                ? 'bg-indigo-500 text-white ring-4 ring-indigo-900'
                : 'bg-[#1e1e2e] text-slate-500'
            }`}>
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <span className={`text-xs mt-1.5 font-medium ${
              step.number === currentStep ? 'text-indigo-400' : 'text-slate-600'
            }`}>
              {step.label}
            </span>
          </div>

          {/* Line between steps */}
          {index < steps.length - 1 && (
            <div className={`w-24 h-0.5 mx-2 mb-5 rounded ${
              step.number < currentStep ? 'bg-indigo-600' : 'bg-[#1e1e2e]'
            }`} />
          )}

        </div>
      ))}
    </div>
  )
}

export default StepBar