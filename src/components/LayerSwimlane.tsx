import type { Block, Layer } from '../types'
import { LAYER_COLORS } from '../types'
import type { BlockPerformance } from '../types'
import { formatReturn, returnColor } from '../utils/returns'

interface LayerSwimlaneProps {
  layers: Layer[]
  blocks: Block[]
  performances: Map<string, BlockPerformance>
  onBlockClick: (blockId: string) => void
}

export function LayerSwimlane({ layers, blocks, performances, onBlockClick }: LayerSwimlaneProps) {
  return (
    <div className="space-y-4">
      {layers.map((layer) => {
        const layerBlocks = blocks.filter((b) => b.layerId === layer.id)
        const color = LAYER_COLORS[layer.id] ?? '#71717a'

        return (
          <div key={layer.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div
                className="h-8 w-1 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  {layer.id} 层 — {layer.name}
                </h3>
                <p className="text-xs text-zinc-500">{layer.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {layerBlocks.map((block) => {
                const perf = performances.get(block.id)
                const ret = perf?.medianReturn1Y ?? null
                return (
                  <button
                    key={block.id}
                    onClick={() => onBlockClick(block.id)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-3 py-2 text-left transition hover:border-zinc-500 hover:bg-zinc-800"
                  >
                    <span className="text-xs font-medium text-zinc-300">{block.shortName}</span>
                    <span className={`font-mono text-xs font-bold ${returnColor(ret)}`}>
                      {formatReturn(ret)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
