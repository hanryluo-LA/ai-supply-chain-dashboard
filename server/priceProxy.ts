import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

const CACHE_TTL_MS = 15 * 60 * 1000

interface CacheEntry {
  data: unknown
  expires: number
}

const cache = new Map<string, CacheEntry>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && entry.expires > Date.now()) return entry.data as T
  return null
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS })
}

export interface PriceBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TickerSummaryResult {
  ticker: string
  price: number | null
  return1Y: number | null
  returnYTD: number | null
  marketCap: number | null
  history: PriceBar[]
  error?: string
}

function computeReturnFromHistory(history: PriceBar[]): { return1Y: number | null; returnYTD: number | null } {
  if (history.length < 2) return { return1Y: null, returnYTD: null }
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0].close
  const last = sorted[sorted.length - 1].close
  const return1Y = first > 0 ? ((last - first) / first) * 100 : null

  const year = new Date().getFullYear()
  const ytdBar = sorted.find((b) => b.date.startsWith(String(year)))
  const returnYTD =
    ytdBar && ytdBar.close > 0 ? ((last - ytdBar.close) / ytdBar.close) * 100 : null

  return { return1Y, returnYTD }
}

async function fetchTickerSummary(ticker: string): Promise<TickerSummaryResult> {
  const cacheKey = `summary:${ticker}`
  const cached = getCached<TickerSummaryResult>(cacheKey)
  if (cached) return cached

  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 1)

    const [historyResult, quoteResult] = await Promise.all([
      yahooFinance.chart(ticker, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      }),
      yahooFinance.quote(ticker).catch(() => null),
    ])

    const history: PriceBar[] = (historyResult.quotes ?? [])
      .filter((q) => q.close != null && q.date != null)
      .map((q) => ({
        date: q.date instanceof Date ? q.date.toISOString().slice(0, 10) : String(q.date).slice(0, 10),
        open: q.open ?? q.close!,
        high: q.high ?? q.close!,
        low: q.low ?? q.close!,
        close: q.close!,
        volume: q.volume ?? 0,
      }))

    const { return1Y, returnYTD } = computeReturnFromHistory(history)
    const price = history.length > 0 ? history[history.length - 1].close : null
    const marketCap = quoteResult?.marketCap ?? null

    const result: TickerSummaryResult = {
      ticker,
      price,
      return1Y,
      returnYTD,
      marketCap,
      history,
    }

    setCache(cacheKey, result)
    return result
  } catch (e) {
    const result: TickerSummaryResult = {
      ticker,
      price: null,
      return1Y: null,
      returnYTD: null,
      marketCap: null,
      history: [],
      error: e instanceof Error ? e.message : 'Fetch failed',
    }
    return result
  }
}

export async function getSummaries(tickers: string[]) {
  const unique = [...new Set(tickers.map((t) => t.trim().toUpperCase()).filter(Boolean))]
  const batchCacheKey = `batch:${unique.sort().join(',')}`
  const batchCached = getCached<{ summaries: TickerSummaryResult[]; fetchedAt: string }>(batchCacheKey)
  if (batchCached) return { ...batchCached, cached: true }

  const summaries = await Promise.all(unique.map(fetchTickerSummary))
  const result = { summaries, fetchedAt: new Date().toISOString(), cached: false }
  setCache(batchCacheKey, result)
  return result
}

export async function getPrices(tickers: string[]) {
  return getSummaries(tickers)
}
