import type { PriceBar, TickerSummary, Company, BlockPerformance } from '../types'

export function computeReturn1Y(history: PriceBar[]): number | null {
  if (history.length < 2) return null
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0].close
  const last = sorted[sorted.length - 1].close
  if (first <= 0) return null
  return ((last - first) / first) * 100
}

export function computeReturnYTD(history: PriceBar[]): number | null {
  if (history.length < 2) return null
  const year = new Date().getFullYear()
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const ytdStart = sorted.find((b) => b.date.startsWith(String(year)))
  if (!ytdStart) return null
  const last = sorted[sorted.length - 1].close
  if (ytdStart.close <= 0) return null
  return ((last - ytdStart.close) / ytdStart.close) * 100
}

export function rebaseHistory(history: PriceBar[], base = 100): { date: string; value: number }[] {
  if (history.length === 0) return []
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0].close
  if (first <= 0) return []
  return sorted.map((b) => ({
    date: b.date,
    value: (b.close / first) * base,
  }))
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

export function computeBlockPerformance(
  blockId: string,
  companies: Company[],
  summaries: Map<string, TickerSummary>,
): BlockPerformance {
  const constituents = companies.filter((c) => c.blockIds.includes(blockId))
  const returns: number[] = []
  let capWeightedSum = 0
  let capTotal = 0

  for (const c of constituents) {
    const s = summaries.get(c.ticker)
    if (s?.return1Y != null && !s.error) {
      returns.push(s.return1Y)
      capWeightedSum += s.return1Y * c.marketCapUSD_B
      capTotal += c.marketCapUSD_B
    }
  }

  return {
    blockId,
    medianReturn1Y: median(returns),
    capWeightedReturn1Y: capTotal > 0 ? capWeightedSum / capTotal : null,
    constituentCount: constituents.length,
    validCount: returns.length,
  }
}

export function formatReturn(value: number | null | undefined, digits = 1): string {
  if (value == null) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

export function returnColor(value: number | null | undefined): string {
  if (value == null) return 'text-zinc-400'
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-zinc-400'
}

export function formatMarketCap(billions: number): string {
  if (billions >= 1000) return `$${(billions / 1000).toFixed(1)}T`
  if (billions >= 1) return `$${billions.toFixed(0)}B`
  return `$${(billions * 1000).toFixed(0)}M`
}

export function formatRevenue(billions: number): string {
  if (billions >= 1) return `$${billions.toFixed(1)}B`
  return `$${(billions * 1000).toFixed(0)}M`
}
