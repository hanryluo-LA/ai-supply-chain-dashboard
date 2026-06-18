import type { MarketDataResponse } from '../types'

const CACHE_TTL_MS = 15 * 60 * 1000
let clientCache: { data: MarketDataResponse; expires: number } | null = null

export async function fetchMarketData(tickers: string[]): Promise<MarketDataResponse> {
  if (clientCache && clientCache.expires > Date.now()) {
    const cachedTickers = new Set(clientCache.data.summaries.map((s) => s.ticker))
    if (tickers.every((t) => cachedTickers.has(t))) {
      return {
        ...clientCache.data,
        summaries: clientCache.data.summaries.filter((s) => tickers.includes(s.ticker)),
        cached: true,
      }
    }
  }

  const params = new URLSearchParams({ tickers: tickers.join(',') })
  const res = await fetch(`/api/summary?${params}`)
  if (!res.ok) throw new Error(`行情请求失败：${res.status}`)
  const data: MarketDataResponse = await res.json()

  clientCache = { data, expires: Date.now() + CACHE_TTL_MS }
  return data
}

export async function fetchPrices(tickers: string[]): Promise<MarketDataResponse> {
  const params = new URLSearchParams({ tickers: tickers.join(',') })
  const res = await fetch(`/api/prices?${params}`)
  if (!res.ok) throw new Error(`价格请求失败：${res.status}`)
  return res.json()
}
