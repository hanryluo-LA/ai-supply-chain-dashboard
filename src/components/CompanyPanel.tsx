import type { Company, TickerSummary, Block } from '../types'
import { formatReturn, returnColor, formatMarketCap, formatRevenue } from '../utils/returns'
import { TIER_LABELS } from '../utils/labels'
import { PriceChart } from './PriceChart'
import { SupplyChainGraph } from './SupplyChainGraph'
import type { RelationshipEdge } from '../types'

interface CompanyPanelProps {
  company: Company | null
  summary: TickerSummary | undefined
  blocks: Block[]
  allCompanies: Company[]
  edges: RelationshipEdge[]
  onClose: () => void
  onCompanyClick: (ticker: string) => void
}

export function CompanyPanel({
  company,
  summary,
  blocks,
  allCompanies,
  edges,
  onClose,
  onCompanyClick,
}: CompanyPanelProps) {
  if (!company) return null

  const companyBlocks = blocks.filter((b) => company.blockIds.includes(b.id))

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-cyan-400">{company.ticker}</span>
              {company.otcWarning && (
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                  OTC — 流动性有限
                </span>
              )}
            </div>
            <h2 className="text-lg text-zinc-200">{company.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="text-xs text-zinc-500">近 1 年</div>
              <div className={`font-mono text-lg font-bold ${returnColor(summary?.return1Y)}`}>
                {summary?.error ? '—' : formatReturn(summary?.return1Y)}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="text-xs text-zinc-500">年初至今</div>
              <div className={`font-mono text-lg font-bold ${returnColor(summary?.returnYTD)}`}>
                {summary?.error ? '—' : formatReturn(summary?.returnYTD)}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="text-xs text-zinc-500">现价</div>
              <div className="font-mono text-lg font-bold text-zinc-200">
                {summary?.price != null ? `$${summary.price.toFixed(2)}` : '—'}
              </div>
            </div>
          </div>

          {summary?.error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              无法获取股价：{summary.error}
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-300">近 1 年股价</h3>
            <PriceChart history={summary?.history ?? []} />
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">基本面</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-zinc-500">市值</dt>
                <dd className="font-mono text-zinc-200">{formatMarketCap(company.marketCapUSD_B)}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">营收 TTM</dt>
                <dd className="font-mono text-zinc-200">{formatRevenue(company.revenueTTM_USD_B)}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">规模档位</dt>
                <dd className="text-zinc-200">{TIER_LABELS[company.marketCapTier]}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">上市地</dt>
                <dd className="text-zinc-200">{company.listingNote}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <dt className="text-xs text-zinc-500">主要产品</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {company.primaryProducts.map((p) => (
                  <span key={p} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                    {p}
                  </span>
                ))}
              </dd>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">{company.moatNotes}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-300">所属板块</h3>
            <div className="flex flex-wrap gap-2">
              {companyBlocks.map((b) => (
                <span
                  key={b.id}
                  className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300"
                >
                  {b.id}: {b.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">产业链位置</h3>
            <SupplyChainGraph
              company={company}
              allCompanies={allCompanies}
              blocks={blocks}
              edges={edges}
              onCompanyClick={onCompanyClick}
            />
          </div>
        </div>
      </div>
    </>
  )
}
