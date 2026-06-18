import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchMarketData } from '../services/api'
import type { TickerSummary, BlockPerformance, Company, Block, Layer, Benchmark } from '../types'
import { computeBlockPerformance } from '../utils/returns'
import companiesData from '../../data/companies.json'
import blocksData from '../../data/blocks.json'
import benchmarksData from '../../data/benchmarks.json'

const companies = companiesData.companies as Company[]
const blocks = blocksData.blocks as Block[]

export function useMarketData() {
  const [summaries, setSummaries] = useState<Map<string, TickerSummary>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [cached, setCached] = useState(false)

  const allTickers = useMemo(() => {
    const companyTickers = companies.map((c) => c.ticker)
    const benchmarkTickers = benchmarksData.benchmarks.map((b) => b.ticker)
    return [...new Set([...companyTickers, ...benchmarkTickers])]
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMarketData(allTickers)
        if (cancelled) return
        const map = new Map(data.summaries.map((s) => [s.ticker, s]))
        setSummaries(map)
        setFetchedAt(data.fetchedAt)
        setCached(data.cached)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '加载行情数据失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchData()
    return () => {
      cancelled = true
    }
  }, [allTickers])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMarketData(allTickers)
      const map = new Map(data.summaries.map((s) => [s.ticker, s]))
      setSummaries(map)
      setFetchedAt(data.fetchedAt)
      setCached(data.cached)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载行情数据失败')
    } finally {
      setLoading(false)
    }
  }, [allTickers])

  const blockPerformances = useMemo(() => {
    const perfMap = new Map<string, BlockPerformance>()
    for (const block of blocks) {
      perfMap.set(block.id, computeBlockPerformance(block.id, companies, summaries))
    }
    return perfMap
  }, [summaries])

  const getSummary = useCallback(
    (ticker: string) => summaries.get(ticker),
    [summaries],
  )

  return {
    summaries,
    loading,
    error,
    fetchedAt,
    cached,
    blockPerformances,
    getSummary,
    reload,
    companies,
    blocks,
    layers: blocksData.layers as Layer[],
    benchmarks: benchmarksData.benchmarks as Benchmark[],
    fundamentalsAsOf: companiesData.asOf,
  }
}
