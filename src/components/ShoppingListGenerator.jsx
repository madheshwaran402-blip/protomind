import { useState } from 'react'
import { generateShoppingList, exportShoppingListCSV, generateShareText } from '../services/shoppingList'
import { notify } from '../services/toast'

const PRIORITY_COLORS = {
  Essential: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
  Important: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Optional: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Recommended: { color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-800' },
}

const SUPPLIER_CONFIGS = {
  amazon: { name: 'Amazon', icon: '📦', color: '#f59e0b', key: 'amazonPrice' },
  aliexpress: { name: 'AliExpress', icon: '🌏', color: '#ef4444', key: 'aliexpressPrice' },
  local: { name: 'Local', icon: '🏪', color: '#22c55e', key: 'localPrice' },
}

function ShoppingListGenerator({ idea, components }) {
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(false)
  const [supplier, setSupplier] = useState('aliexpress')
  const [checkedItems, setCheckedItems] = useState({})
  const [activeTab, setActiveTab] = useState('list')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setList(null)
    setCheckedItems({})
    try {
      const data = await generateShoppingList(idea, components)
      setList(data)
      notify.success('Shopping list ready! ' + (data.items?.length || 0) + ' items')
    } catch {
      notify.error('Generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function toggleCheck(itemName) {
    setCheckedItems(prev => ({ ...prev, [itemName]: !prev[itemName] }))
  }

  function handleCopyText() {
    if (!list) return
    const text = generateShareText(list, idea)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    notify.success('Shopping list copied!')
  }

  function handleWhatsApp() {
    if (!list) return
    const text = generateShareText(list, idea)
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
  }

  const currentSupplier = SUPPLIER_CONFIGS[supplier]
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const totalItems = (list?.items?.length || 0) + (list?.extras?.length || 0) + (list?.tools?.length || 0)

  const TABS = [
    { id: 'list', label: '📋 List' },
    { id: 'extras', label: '🔧 Extras' },
    { id: 'tips', label: '💡 Tips' },
    { id: 'share', label: '📤 Share' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <p className="text-slate-400 text-sm">
          Complete shopping list with prices from multiple suppliers
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0 ml-4"
        >
          {loading ? '🛒 Building...' : '🛒 Build Shopping List'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is building your shopping list...</p>
        </div>
      )}

      {list && !loading && (
        <>
          {/* Supplier selector + totals */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(SUPPLIER_CONFIGS).map(([key, sup]) => (
              <button
                key={key}
                onClick={() => setSupplier(key)}
                className={`p-3 rounded-xl border text-center transition ${
                  supplier === key ? 'border-opacity-100' : 'border-[#2e2e4e] bg-[#13131f] opacity-70 hover:opacity-100'
                }`}
                style={supplier === key ? {
                  backgroundColor: sup.color + '15',
                  borderColor: sup.color + '60',
                } : {}}
              >
                <p className="text-lg mb-1">{sup.icon}</p>
                <p className="text-xs font-medium" style={{ color: supplier === key ? sup.color : '#94a3b8' }}>{sup.name}</p>
                <p className="text-white font-bold text-sm">${(list.totals?.[key] || 0).toFixed(2)}</p>
                <p className="text-slate-600 text-xs">{list.estimatedDelivery?.[key]}</p>
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Shopping Progress</span>
                <span className="text-indigo-400">{checkedCount}/{totalItems} items</span>
              </div>
              <div className="w-full bg-[#1e1e2e] rounded-full h-2">
                <div
                  className="h-2 bg-emerald-600 rounded-full transition-all"
                  style={{ width: totalItems > 0 ? (checkedCount / totalItems * 100) + '%' : '0%' }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { exportShoppingListCSV(list, idea); notify.success('CSV downloaded!') }}
                className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
              >
                ⬇️ CSV
              </button>
              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131f] rounded-xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List tab */}
          {activeTab === 'list' && (
            <div className="space-y-2">
              {list.items?.map((item, i) => {
                const priority = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Essential
                const price = item[currentSupplier.key]
                const isChecked = checkedItems[item.name]
                const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(
                  (item[supplier + 'Search'] || item.name) + ' ' + currentSupplier.name
                )

                return (
                  <div
                    key={i}
                    className={`bg-[#13131f] border rounded-xl p-4 transition ${
                      isChecked ? 'border-green-900 opacity-60' : 'border-[#2e2e4e]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleCheck(item.name)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isChecked ? 'bg-green-600 border-green-600' : 'border-slate-600 hover:border-emerald-500'
                        }`}
                      >
                        {isChecked && <span className="text-white text-xs">✓</span>}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className={`text-sm font-semibold ${isChecked ? 'line-through text-slate-500' : 'text-white'}`}>
                            {item.name}
                          </p>
                          <span className="text-slate-500 text-xs">×{item.quantity}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${priority.color} ${priority.bg} ${priority.border}`}>
                            {item.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold" style={{ color: currentSupplier.color }}>
                            ${price?.toFixed(2) || 'N/A'}
                          </span>
                          <span className="text-slate-600 text-xs">{currentSupplier.icon} {currentSupplier.name}</span>
                          <a
                            href={searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                            onClick={e => e.stopPropagation()}
                          >
                            Search ↗️
                          </a>
                        </div>

                        {item.notes && (
                          <p className="text-slate-500 text-xs">{item.notes}</p>
                        )}

                        {item.alternatives?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <span className="text-slate-600 text-xs">Alt:</span>
                            {item.alternatives.map((alt, j) => (
                              <span key={j} className="text-xs bg-[#0d0d1a] text-slate-500 px-2 py-0.5 rounded-full">
                                {alt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Extras tab */}
          {activeTab === 'extras' && (
            <div className="space-y-3">
              {list.extras?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">🔧 Recommended Extras</h4>
                  <div className="space-y-2">
                    {list.extras.map((extra, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1e1e2e] last:border-0">
                        <button
                          onClick={() => toggleCheck('extra_' + extra.name)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                            checkedItems['extra_' + extra.name] ? 'bg-green-600 border-green-600' : 'border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {checkedItems['extra_' + extra.name] && <span className="text-white text-xs">✓</span>}
                        </button>
                        <div>
                          <p className="text-white text-sm">{extra.name}</p>
                          <p className="text-slate-500 text-xs">{extra.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {list.tools?.length > 0 && (
                <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">🛠️ Tools Needed</h4>
                  <div className="space-y-2">
                    {list.tools.map((tool, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1e1e2e] last:border-0">
                        <button
                          onClick={() => toggleCheck('tool_' + tool.name)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                            checkedItems['tool_' + tool.name] ? 'bg-green-600 border-green-600' : 'border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {checkedItems['tool_' + tool.name] && <span className="text-white text-xs">✓</span>}
                        </button>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-white text-sm">{tool.name}</p>
                            {tool.estimatedCost && (
                              <span className="text-emerald-400 text-xs">{tool.estimatedCost}</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs">{tool.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tips tab */}
          {activeTab === 'tips' && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-xl p-5">
              <h4 className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-3">💡 Buying Tips</h4>
              <ul className="space-y-2">
                {list.buyingTips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                    <p className="text-slate-300">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share tab */}
          {activeTab === 'share' && (
            <div className="space-y-3">
              <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
                <pre className="text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-48">
                  {generateShareText(list, idea)}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyText}
                  className="py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
                >
                  {copied ? '✅ Copied!' : '📋 Copy Text'}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition"
                >
                  💬 Send via WhatsApp
                </button>
                <button
                  onClick={() => { exportShoppingListCSV(list, idea); notify.success('CSV downloaded!') }}
                  className="py-2.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-300 rounded-xl text-xs transition"
                >
                  ⬇️ Download CSV
                </button>
                <button
                  onClick={() => {
                    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(
                      'Building a ' + idea + ' with ProtoMind! 🔧 #electronics #maker #protomind'
                    )
                    window.open(url, '_blank')
                  }}
                  className="py-2.5 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition"
                >
                  🐦 Share on X
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition"
          >
            ↺ Regenerate List
          </button>
        </>
      )}

      {!list && !loading && (
        <div className="text-center py-10 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-white font-semibold mb-1">Smart Shopping List</p>
          <p className="text-slate-500 text-sm mb-4">Prices from Amazon, AliExpress and local stores with buy links</p>
          <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
            <span>✓ Priority ranked</span>
            <span>✓ Multi-supplier prices</span>
            <span>✓ Tick off as you buy</span>
            <span>✓ Share via WhatsApp</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShoppingListGenerator