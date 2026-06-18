import { useParams, Navigate } from 'react-router-dom'
import { BlockDetail } from '../components/BlockDetail'
import { useMarketDataContext } from '../context/useMarketDataContext'
import blocksData from '../../data/blocks.json'

interface BlockPageProps {
  onCompanyClick: (ticker: string) => void
}

const ADJACENCY: Record<string, string[]> = {
  A1: ['A2', 'D2'],
  A2: ['A1', 'A4', 'B1'],
  A3: ['B1', 'B2'],
  A4: ['A2', 'B1', 'B3'],
  B1: ['A2', 'A4', 'B3', 'B5', 'B6', 'C1'],
  B2: ['A3', 'B6'],
  B3: ['A4', 'B1', 'B6'],
  B4: ['C1', 'B6'],
  B5: ['B1', 'B6', 'C1', 'B7'],
  B6: ['B1', 'B2', 'B3', 'B5', 'C1', 'C2'],
  B7: ['B5', 'B1', 'B6', 'C1'],
  C1: ['B1', 'B5', 'B6', 'C2', 'C4'],
  C2: ['B6', 'C1', 'C3', 'D1'],
  C3: ['C2', 'D1'],
  C4: ['C1'],
  D1: ['C2', 'C3'],
  D2: ['A1', 'A2'],
}

export function BlockPage({ onCompanyClick }: BlockPageProps) {
  const { id } = useParams<{ id: string }>()
  const { blocks, layers, companies, blockPerformances, getSummary, loading } = useMarketDataContext()

  const block = blocks.find((b) => b.id === id)
  if (!block) return <Navigate to="/" replace />

  const layer = layers.find((l) => l.id === block.layerId)
  const blockCompanies = companies.filter((c) => c.blockIds.includes(block.id))
  const adjacentIds = ADJACENCY[block.id] ?? []
  const adjacentBlocks = blocksData.blocks.filter((b) => adjacentIds.includes(b.id))

  if (loading && blockCompanies.every((c) => !getSummary(c.ticker))) {
    return (
      <div className="py-16 text-center text-sm text-zinc-400">正在加载板块数据…</div>
    )
  }

  return (
    <BlockDetail
      block={block}
      layerName={layer?.name ?? block.layerId}
      companies={blockCompanies}
      adjacentBlocks={adjacentBlocks}
      performance={blockPerformances.get(block.id)}
      getSummary={getSummary}
      onCompanyClick={onCompanyClick}
    />
  )
}
