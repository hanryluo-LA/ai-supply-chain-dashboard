import type { Company, Block, RelationshipEdge } from '../types'
import { LAYER_COLORS } from '../types'

interface SupplyChainGraphProps {
  company: Company
  allCompanies: Company[]
  blocks: Block[]
  edges: RelationshipEdge[]
  onCompanyClick: (ticker: string) => void
}

interface ChainNodeListProps {
  tickers: string[]
  title: string
  direction: 'upstream' | 'downstream'
  companyMap: Map<string, Company>
  blocks: Block[]
  edges: RelationshipEdge[]
  onCompanyClick: (ticker: string) => void
}

function ChainNodeList({
  tickers,
  title,
  direction,
  companyMap,
  blocks,
  edges,
  onCompanyClick,
}: ChainNodeListProps) {
  function getBlockLabel(ticker: string) {
    const c = companyMap.get(ticker)
    if (!c) return ''
    const block = blocks.find((b) => b.id === c.blockIds[0])
    return block?.shortName ?? ''
  }

  const filteredEdges = edges.filter((e) =>
    direction === 'upstream' ? tickers.includes(e.from) : tickers.includes(e.to),
  )

  return (
    <div className="flex-1">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h4>
      <div className="space-y-1.5">
        {tickers.length === 0 && <p className="text-xs text-zinc-600">暂无</p>}
        {tickers.map((ticker) => {
          const c = companyMap.get(ticker)
          const blockLabel = getBlockLabel(ticker)
          const edge = filteredEdges.find((e) =>
            direction === 'upstream' ? e.from === ticker : e.to === ticker,
          )
          return (
            <button
              key={ticker}
              onClick={() => onCompanyClick(ticker)}
              className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left transition hover:border-zinc-600 hover:bg-zinc-800/60"
            >
              <div>
                <span className="font-mono text-sm font-semibold text-cyan-400">{ticker}</span>
                {c && <span className="ml-2 text-xs text-zinc-500">{c.name}</span>}
              </div>
              <div className="text-right">
                {blockLabel && <span className="text-[10px] text-zinc-500">{blockLabel}</span>}
                {edge && <div className="text-[10px] text-zinc-600">{edge.label}</div>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function SupplyChainGraph({
  company,
  allCompanies,
  blocks,
  edges,
  onCompanyClick,
}: SupplyChainGraphProps) {
  const companyMap = new Map(allCompanies.map((c) => [c.ticker, c]))

  const upstreamTickers = [
    ...new Set([...company.upstream, ...edges.filter((e) => e.to === company.ticker).map((e) => e.from)]),
  ]
  const downstreamTickers = [
    ...new Set([...company.downstream, ...edges.filter((e) => e.from === company.ticker).map((e) => e.to)]),
  ]

  const primaryBlock = blocks.find((b) => b.id === company.blockIds[0])
  const layerColor = primaryBlock ? LAYER_COLORS[primaryBlock.layerId] : '#71717a'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div
          className="rounded-xl border-2 px-6 py-4 text-center"
          style={{ borderColor: layerColor }}
        >
          <div className="font-mono text-lg font-bold text-zinc-100">{company.ticker}</div>
          <div className="text-sm text-zinc-400">{company.name}</div>
          {primaryBlock && (
            <div className="mt-1 text-xs" style={{ color: layerColor }}>
              {primaryBlock.name}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <ChainNodeList
          tickers={upstreamTickers}
          title="上游 — 采购自"
          direction="upstream"
          companyMap={companyMap}
          blocks={blocks}
          edges={edges.filter((e) => e.to === company.ticker)}
          onCompanyClick={onCompanyClick}
        />
        <ChainNodeList
          tickers={downstreamTickers}
          title="下游 — 供应给"
          direction="downstream"
          companyMap={companyMap}
          blocks={blocks}
          edges={edges.filter((e) => e.from === company.ticker)}
          onCompanyClick={onCompanyClick}
        />
      </div>
      {company.competitors.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            竞争对手
          </h4>
          <div className="flex flex-wrap gap-2">
            {company.competitors.map((t) => (
              <button
                key={t}
                onClick={() => onCompanyClick(t)}
                className="rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 font-mono text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-cyan-400"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
