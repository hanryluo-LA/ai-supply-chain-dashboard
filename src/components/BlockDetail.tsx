import { Link } from 'react-router-dom'
import type { Block, Company, TickerSummary, BlockPerformance } from '../types'
import { formatReturn, returnColor } from '../utils/returns'
import { CompanyTable } from './CompanyTable'
import { MultiPriceChart } from './PriceChart'
import { LAYER_COLORS } from '../types'

interface BlockDetailProps {
  block: Block
  layerName: string
  companies: Company[]
  adjacentBlocks: Block[]
  performance: BlockPerformance | undefined
  getSummary: (ticker: string) => TickerSummary | undefined
  onCompanyClick: (ticker: string) => void
}

const CHART_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#fb923c', '#818cf8', '#2dd4bf']

export function BlockDetail({
  block,
  layerName,
  companies,
  adjacentBlocks,
  performance,
  getSummary,
  onCompanyClick,
}: BlockDetailProps) {
  const layerColor = LAYER_COLORS[block.layerId] ?? '#71717a'

  const chartSeries = companies
    .filter((c) => {
      const s = getSummary(c.ticker)
      return s && !s.error && s.history.length > 0
    })
    .map((c, i) => ({
      ticker: c.ticker,
      history: getSummary(c.ticker)!.history,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }))

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
          <Link to="/" className="hover:text-zinc-300">
            总览
          </Link>
          <span>/</span>
          <span style={{ color: layerColor }}>{layerName}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-100">
                {block.id} — {block.name}
              </h1>
              {block.expansionFocus && (
                <span className="rounded bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
                  拓展重点
                </span>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              {block.description}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center">
              <div className="text-xs text-zinc-500">1 年中位数</div>
              <div className={`font-mono text-xl font-bold ${returnColor(performance?.medianReturn1Y)}`}>
                {formatReturn(performance?.medianReturn1Y)}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center">
              <div className="text-xs text-zinc-500">市值加权 1 年</div>
              <div className={`font-mono text-xl font-bold ${returnColor(performance?.capWeightedReturn1Y)}`}>
                {formatReturn(performance?.capWeightedReturn1Y)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">子组件</h2>
          {block.subComponentDetails && block.subComponentDetails.length > 0 ? (
            <ul className="space-y-4">
              {block.subComponentDetails.map((sc) => (
                <li key={sc.name} className="border-b border-zinc-800/60 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: layerColor }}
                    />
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{sc.name}</div>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{sc.description}</p>
                      {sc.typicalVendors && sc.typicalVendors.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sc.typicalVendors.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => onCompanyClick(t)}
                              className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-cyan-500/80 transition hover:text-cyan-400"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2">
              {block.subComponents.map((sc) => (
                <li key={sc} className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: layerColor }} />
                  {sc}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">竞争格局</h2>
            <p className="text-sm leading-relaxed text-zinc-400">{block.competitionNotes}</p>
          </div>
          {block.supplyChainNotes && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <h2 className="mb-3 text-sm font-semibold text-violet-300">产业链位置</h2>
              <p className="text-sm leading-relaxed text-zinc-400">{block.supplyChainNotes}</p>
            </div>
          )}
        </div>
      </div>

      {adjacentBlocks.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">相邻板块</h2>
          <div className="flex flex-wrap gap-2">
            {adjacentBlocks.map((b) => (
              <Link
                key={b.id}
                to={`/block/${b.id}`}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
              >
                {b.id}: {b.shortName}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">
          归一化走势（1 年前 = 100）
        </h2>
        {chartSeries.length > 0 ? (
          <MultiPriceChart series={chartSeries} />
        ) : (
          <div className="rounded-lg border border-zinc-800 p-8 text-center text-sm text-zinc-500">
            正在加载图表数据…
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">成分股</h2>
        <CompanyTable
          companies={companies}
          getSummary={getSummary}
          onCompanyClick={onCompanyClick}
          showSegment={block.expansionFocus}
        />
      </div>
    </div>
  )
}
