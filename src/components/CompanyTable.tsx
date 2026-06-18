import { useState, useMemo } from 'react'
import { formatReturn, returnColor, formatMarketCap, formatRevenue } from '../utils/returns'
import type { Company, TickerSummary } from '../types'

interface CompanyTableProps {
  companies: Company[]
  getSummary: (ticker: string) => TickerSummary | undefined
  onCompanyClick: (ticker: string) => void
}

type SortKey = 'ticker' | 'return1Y' | 'returnYTD' | 'marketCap' | 'revenue'

export function CompanyTable({ companies, getSummary, onCompanyClick }: CompanyTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('return1Y')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = useMemo(() => {
    return [...companies].sort((a, b) => {
      const sa = getSummary(a.ticker)
      const sb = getSummary(b.ticker)
      let va: number | string = 0
      let vb: number | string = 0

      switch (sortKey) {
        case 'ticker':
          va = a.ticker
          vb = b.ticker
          break
        case 'return1Y':
          va = sa?.return1Y ?? -Infinity
          vb = sb?.return1Y ?? -Infinity
          break
        case 'returnYTD':
          va = sa?.returnYTD ?? -Infinity
          vb = sb?.returnYTD ?? -Infinity
          break
        case 'marketCap':
          va = a.marketCapUSD_B
          vb = b.marketCapUSD_B
          break
        case 'revenue':
          va = a.revenueTTM_USD_B
          vb = b.revenueTTM_USD_B
          break
      }

      if (typeof va === 'string' && typeof vb === 'string') {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })
  }, [companies, getSummary, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  function renderSortHeader(label: string, col: SortKey) {
    return (
      <th
        key={col}
        className="cursor-pointer px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
        onClick={() => handleSort(col)}
      >
        {label} {sortKey === col ? (sortAsc ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/80">
          <tr>
            {renderSortHeader('代码', 'ticker')}
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              公司
            </th>
            {renderSortHeader('近 1 年', 'return1Y')}
            {renderSortHeader('年初至今', 'returnYTD')}
            {renderSortHeader('市值', 'marketCap')}
            {renderSortHeader('营收', 'revenue')}
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              状态
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/80">
          {sorted.map((c) => {
            const s = getSummary(c.ticker)
            return (
              <tr
                key={c.ticker}
                className="cursor-pointer transition hover:bg-zinc-800/40"
                onClick={() => onCompanyClick(c.ticker)}
              >
                <td className="px-3 py-2.5 font-mono font-semibold text-cyan-400">{c.ticker}</td>
                <td className="px-3 py-2.5 text-zinc-300">{c.name}</td>
                <td className={`px-3 py-2.5 font-mono font-medium ${returnColor(s?.return1Y)}`}>
                  {s?.error ? '—' : formatReturn(s?.return1Y)}
                </td>
                <td className={`px-3 py-2.5 font-mono ${returnColor(s?.returnYTD)}`}>
                  {s?.error ? '—' : formatReturn(s?.returnYTD)}
                </td>
                <td className="px-3 py-2.5 font-mono text-zinc-400">
                  {formatMarketCap(c.marketCapUSD_B)}
                </td>
                <td className="px-3 py-2.5 font-mono text-zinc-400">
                  {formatRevenue(c.revenueTTM_USD_B)}
                </td>
                <td className="px-3 py-2.5">
                  {c.otcWarning && (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                      OTC
                    </span>
                  )}
                  {s?.error && (
                    <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400">
                      无数据
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
