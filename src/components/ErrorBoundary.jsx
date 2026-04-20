import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ProtoMind Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center">
            <div className="text-6xl mb-6">⚡💥</div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              ProtoMind encountered an unexpected error. Your saved projects are safe — this is just a display issue.
            </p>

            <div className="bg-[#0d0d1a] border border-red-900 rounded-xl p-4 mb-6 text-left">
              <p className="text-red-400 text-xs font-mono">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null })
                  window.location.href = '/'
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition text-white"
              >
                ⚡ Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#1e1e2e] hover:bg-[#2e2e4e] rounded-xl text-sm text-slate-300 transition"
              >
                ↺ Reload App
              </button>
            </div>

            <p className="text-slate-600 text-xs mt-6">
              Your local projects are saved in your browser and will not be lost.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary