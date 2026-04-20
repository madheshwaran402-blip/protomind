import { Component } from 'react'

class PanelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Panel error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-950 border border-red-900 rounded-xl p-4 text-center">
          <p className="text-red-400 text-sm font-medium mb-1">
            ⚠️ This panel encountered an error
          </p>
          <p className="text-red-700 text-xs mb-3">
            {this.props.name || 'Component'} failed to load
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-1.5 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg text-xs transition"
          >
            ↺ Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default PanelErrorBoundary