import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Overview } from './pages/Overview'
import { BlockPage } from './pages/BlockPage'
import { CompanyPanel } from './components/CompanyPanel'
import { MarketDataProvider } from './context/MarketDataProvider'
import { useMarketDataContext } from './context/useMarketDataContext'
import relationshipsData from '../data/relationships.json'
import { LAYER_NAV_LABELS } from './utils/labels'

function AppShell() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const { companies, blocks, getSummary, fundamentalsAsOf } = useMarketDataContext()

  const handleCompanyClick = useCallback((ticker: string) => {
    setSelectedTicker(ticker)
  }, [])

  const selectedCompany = selectedTicker
    ? companies.find((c) => c.ticker === selectedTicker) ?? null
    : null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              AI 供应链仪表盘
            </span>
            <span className="hidden rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-400 sm:inline">
              股价表现
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="hidden sm:inline">仅供参考，不构成投资建议</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> {LAYER_NAV_LABELS.A}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> {LAYER_NAV_LABELS.B}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> {LAYER_NAV_LABELS.C}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-1.5 text-center text-[11px] text-zinc-500">
        静态基本面（营收、市值档位、产业链关系）截至{' '}
        <span className="font-mono text-zinc-400">{fundamentalsAsOf}</span>
        — 股价数据在页面加载时刷新
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<Overview onCompanyClick={handleCompanyClick} />} />
          <Route
            path="/block/:id"
            element={<BlockPage onCompanyClick={handleCompanyClick} />}
          />
        </Routes>
      </main>

      <CompanyPanel
        company={selectedCompany}
        summary={selectedTicker ? getSummary(selectedTicker) : undefined}
        blocks={blocks}
        allCompanies={companies}
        edges={relationshipsData.edges}
        onClose={() => setSelectedTicker(null)}
        onCompanyClick={handleCompanyClick}
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <MarketDataProvider>
        <AppShell />
      </MarketDataProvider>
    </BrowserRouter>
  )
}
