import { formatReturn, returnColor } from '../utils/returns'
import type { BlockPerformance, Block } from '../types'
import { LAYER_COLORS } from '../types'

interface BlockHeatmapProps {
  blocks: Block[]
  performances: Map<string, BlockPerformance>
  onBlockClick: (blockId: string) => void
}

export function BlockHeatmap({ blocks, performances, onBlockClick }: BlockHeatmapProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {blocks.map((block) => {
        const perf = performances.get(block.id)
        const ret = perf?.medianReturn1Y ?? null
        const layerColor = LAYER_COLORS[block.layerId] ?? '#71717a'
        const intensity = ret != null ? Math.min(Math.abs(ret) / 80, 1) : 0
        const bg =
          ret == null
            ? 'rgba(39,39,42,0.8)'
            : ret >= 0
              ? `rgba(16,185,129,${0.15 + intensity * 0.35})`
              : `rgba(239,68,68,${0.15 + intensity * 0.35})`

        return (
          <button
            key={block.id}
            onClick={() => onBlockClick(block.id)}
            className="group rounded-lg border border-zinc-800 p-4 text-left transition hover:border-zinc-600 hover:ring-1 hover:ring-zinc-600"
            style={{ backgroundColor: bg }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: layerColor }}
              />
              <span className="text-xs font-medium text-zinc-400">{block.id}</span>
              {block.overlooked && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
                  易忽视
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-zinc-100">{block.shortName}</div>
            <div className={`mt-2 font-mono text-xl font-bold ${returnColor(ret)}`}>
              {formatReturn(ret)}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              1 年中位数 · {perf?.validCount ?? 0}/{perf?.constituentCount ?? 0} 只
            </div>
          </button>
        )
      })}
    </div>
  )
}
