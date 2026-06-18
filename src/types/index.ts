export type MarketCapTier = 'mega' | 'large' | 'mid' | 'small'

export interface Layer {
  id: string
  name: string
  description: string
}

export interface Block {
  id: string
  layerId: string
  name: string
  shortName: string
  description: string
  subComponents: string[]
  competitionNotes: string
  overlooked: boolean
}

export interface Company {
  ticker: string
  name: string
  blockIds: string[]
  marketCapTier: MarketCapTier
  marketCapUSD_B: number
  revenueTTM_USD_B: number
  revenueSource: string
  primaryProducts: string[]
  competitors: string[]
  upstream: string[]
  downstream: string[]
  moatNotes: string
  listingNote: string
  otcWarning: boolean
}

export interface RelationshipEdge {
  from: string
  to: string
  type: string
  label: string
}

export interface Benchmark {
  ticker: string
  name: string
  description: string
}

export interface PriceBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TickerSummary {
  ticker: string
  price: number | null
  return1Y: number | null
  returnYTD: number | null
  marketCap: number | null
  history: PriceBar[]
  error?: string
}

export interface MarketDataResponse {
  summaries: TickerSummary[]
  fetchedAt: string
  cached: boolean
}

export interface BlockPerformance {
  blockId: string
  medianReturn1Y: number | null
  capWeightedReturn1Y: number | null
  constituentCount: number
  validCount: number
}

export const LAYER_COLORS: Record<string, string> = {
  A: '#6366f1',
  B: '#22d3ee',
  C: '#34d399',
  D: '#fbbf24',
}
