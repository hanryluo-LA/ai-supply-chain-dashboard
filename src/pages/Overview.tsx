import { useNavigate } from 'react-router-dom'
import { BlockHeatmap } from '../components/BlockHeatmap'
import { LayerSwimlane } from '../components/LayerSwimlane'
import { useMarketDataContext } from '../context/useMarketDataContext'
import { formatReturn, returnColor } from '../utils/returns'
import type { Block, BlockPerformance, Company, TickerSummary } from '../types'

interface OverviewProps {
  onCompanyClick: (ticker: string) => void
}

export function Overview({ onCompanyClick }: OverviewProps) {
  const navigate = useNavigate()
  const {
    blocks,
    layers,
    benchmarks,
    companies,
    blockPerformances,
    getSummary,
    loading,
    error,
    fetchedAt,
    cached,
    fundamentalsAsOf,
    reload,
  } = useMarketDataContext()

  const overlookedBlocks = blocks.filter((b) => b.overlooked)

  const handleBlockClick = (blockId: string) => {
    navigate(`/block/${blockId}`)
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          AI 产业链股价表现
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
          覆盖 AI 工业链上的上市公司——从半导体设备、先进封装，到算力、网络、存储与云——按板块展示近一年股价涨跌幅。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span>基本面数据截至 {fundamentalsAsOf}</span>
          {fetchedAt && (
            <span>
              股价更新于 {new Date(fetchedAt).toLocaleString('zh-CN')}
              {cached ? '（缓存）' : ''}
            </span>
          )}
          <button
            onClick={reload}
            className="rounded border border-zinc-700 px-2 py-0.5 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            刷新
          </button>
        </div>
      </header>

      {loading && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-8 text-center text-sm text-zinc-400">
          正在从 Yahoo Finance 加载行情数据…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error} — 请确认价格代理服务已启动（
          <code className="text-red-300">npm run dev:all</code>）
        </div>
      )}

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          市场基准
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {benchmarks.map((b) => {
            const s = getSummary(b.ticker)
            return (
              <div
                key={b.ticker}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm font-bold text-zinc-200">{b.ticker}</div>
                    <div className="text-xs text-zinc-500">{b.name}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-lg font-bold ${returnColor(s?.return1Y)}`}>
                      {formatReturn(s?.return1Y)}
                    </div>
                    <div className="text-[10px] text-zinc-600">近 1 年</div>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-zinc-600">{b.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          板块表现热力图
        </h2>
        <BlockHeatmap
          blocks={blocks}
          performances={blockPerformances}
          onBlockClick={handleBlockClick}
        />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          易被忽视的板块
        </h2>
        <p className="mb-4 text-sm text-zinc-500">
          结构上至关重要、但相对 GPU 与 NeoCloud  headline 常被市场低配——EDA、封装、电力、光互联与测试等。
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {overlookedBlocks.map((block) => (
            <OverlookedCard
              key={block.id}
              block={block}
              companies={companies.filter((c) => c.blockIds.includes(block.id))}
              performance={blockPerformances.get(block.id)}
              getSummary={getSummary}
              onBlockClick={handleBlockClick}
              onCompanyClick={onCompanyClick}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          产业链分层
        </h2>
        <LayerSwimlane
          layers={layers}
          blocks={blocks}
          performances={blockPerformances}
          onBlockClick={handleBlockClick}
        />
      </section>
    </div>
  )
}

function OverlookedCard({
  block,
  companies,
  performance,
  getSummary,
  onBlockClick,
  onCompanyClick,
}: {
  block: Block
  companies: Company[]
  performance: BlockPerformance | undefined
  getSummary: (ticker: string) => TickerSummary | undefined
  onBlockClick: (id: string) => void
  onCompanyClick: (ticker: string) => void
}) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <button onClick={() => onBlockClick(block.id)} className="w-full text-left">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-200">{block.name}</h3>
          <span className={`font-mono text-sm font-bold ${returnColor(performance?.medianReturn1Y)}`}>
            {formatReturn(performance?.medianReturn1Y)}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{block.description}</p>
      </button>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {companies.slice(0, 4).map((c) => {
          const s = getSummary(c.ticker)
          return (
            <button
              key={c.ticker}
              onClick={() => onCompanyClick(c.ticker)}
              className="rounded bg-zinc-800/80 px-2 py-1 font-mono text-[10px] text-zinc-400 transition hover:text-cyan-400"
            >
              {c.ticker}{' '}
              <span className={returnColor(s?.return1Y)}>{formatReturn(s?.return1Y, 0)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
