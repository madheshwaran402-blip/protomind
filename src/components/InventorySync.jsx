import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  syncPrototypeWithInventory,
  deductFromInventory,
  addMissingToInventory,
} from '../services/inventorySyncService'
import { notify } from '../services/toast'

const STATUS_STYLES = {
  available: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '✅', label: 'In Stock' },
  out_of_stock: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '❌', label: 'Out of Stock' },
  not_tracked: { color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-700', icon: '❓', label: 'Not Tracked' },
}

function InventorySync({ idea, components }) {
  const navigate = useNavigate()
  const [syncResults, setSyncResults] = useState(null)
  const [deducted, setDeducted] = useState({})

  function handleSync() {
    if (components.length === 0) {
      notify.warning('Add components first')
      return
    }
    const results = syncPrototypeWithInventory(components)
    setSyncResults(results)
    notify.success('Synced ' + results.length + ' components with inventory!')
  }

  function handleDeduct(compName) {
    const success = deductFromInventory(compName, 1)
    if (success) {
      setDeducted(function(prev) { return Object.assign({}, prev, { [compName]: true }) })
      setSyncResults(syncPrototypeWithInventory(components))
      notify.success('Deducted 1x ' + compName + ' from inventory')
    } else {
      notify.warning('Component not found in inventory')
    }
  }

  function handleAddToInventory(compName, icon) {
    addMissingToInventory(compName, icon)
    setSyncResults(syncPrototypeWithInventory(components))
    notify.success(compName + ' added to inventory with 0 stock')
  }

  if (!syncResults) {
    return (
      <div className="space-y-4">
        <p className="text-slate-400 text-sm">Check which components are available in your inventory</p>
        <button
          onClick={handleSync}
          disabled={components.length === 0}
          className="w-full py-3 bg-teal-700 hover:bg-teal-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        >
          🔄 Sync with Inventory
        </button>
        <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-4xl mb-2">🔄</div>
          <p className="text-white font-semibold mb-1">Inventory Sync</p>
          <p className="text-slate-500 text-sm">Check stock levels and deduct components when building</p>
        </div>
      </div>
    )
  }

  const available = syncResults.filter(function(r) { return r.status === 'available' }).length
  const outOfStock = syncResults.filter(function(r) { return r.status === 'out_of_stock' }).length
  const notTracked = syncResults.filter(function(r) { return r.status === 'not_tracked' }).length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Available', value: available, color: 'text-green-400' },
          { label: 'Out of Stock', value: outOfStock, color: 'text-red-400' },
          { label: 'Not Tracked', value: notTracked, color: 'text-slate-400' },
        ].map(function(stat) {
          return (
            <div key={stat.label} className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 text-center">
              <p className={'text-xl font-black ' + stat.color}>{stat.value}</p>
              <p className="text-slate-600 text-xs">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Component list */}
      <div className="space-y-2">
        {syncResults.map(function(result) {
          const style = STATUS_STYLES[result.status]
          return (
            <div key={result.component}
              className={'rounded-xl border p-3 ' + style.bg + ' ' + style.border}>
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">{result.icon || '🔧'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{result.component}</p>
                  <div className="flex items-center gap-2">
                    <span className={'text-xs ' + style.color}>{style.icon} {style.label}</span>
                    {result.found && (
                      <span className="text-slate-500 text-xs">Stock: {result.quantity}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {result.status === 'available' && !deducted[result.component] && (
                    <button
                      onClick={function() { handleDeduct(result.component) }}
                      className="text-xs px-2 py-1 bg-green-900 hover:bg-green-800 text-green-300 rounded-lg transition"
                    >
                      -1 Use
                    </button>
                  )}
                  {result.status === 'not_tracked' && (
                    <button
                      onClick={function() { handleAddToInventory(result.component, result.icon) }}
                      className="text-xs px-2 py-1 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-lg transition"
                    >
                      + Track
                    </button>
                  )}
                  {result.status === 'out_of_stock' && (
                    <button
                      onClick={function() { navigate('/parts') }}
                      className="text-xs px-2 py-1 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg transition"
                    >
                      🛒 Buy
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={handleSync}
          className="flex-1 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition">
          ↺ Re-sync
        </button>
        <button onClick={function() { navigate('/inventory') }}
          className="flex-1 py-2 bg-teal-900 hover:bg-teal-800 text-teal-300 rounded-xl text-xs transition">
          📦 Open Inventory
        </button>
      </div>
    </div>
  )
}

export default InventorySync