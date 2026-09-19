import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ProtoMind Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white p-6">
          <div className="max-w-lg text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred in this component.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={function() { window.location.reload() }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition">
                Reload Page
              </button>
              <button
                onClick={function() { window.location.href = '/' }}
                className="px-6 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl font-bold transition">
                Go Home
              </button>
            </div>
            <details className="mt-6 text-left bg-[#0d0d1a] border border-[#2e2e4e] rounded-xl p-4">
              <summary className="text-slate-500 text-xs cursor-pointer">Error details</summary>
              <pre className="text-red-400 text-xs mt-2 overflow-x-auto">
                {this.state.error?.stack || String(this.state.error)}
              </pre>
            </details>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
