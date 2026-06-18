import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineSeries } from 'lightweight-charts'
import type { PriceBar } from '../types'
import { rebaseHistory } from '../utils/returns'

interface PriceChartProps {
  history: PriceBar[]
  height?: number
  rebase?: boolean
  color?: string
}

export function PriceChart({ history, height = 280, rebase = false, color = '#22d3ee' }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || history.length === 0) return

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      rightPriceScale: { borderColor: '#3f3f46' },
      timeScale: { borderColor: '#3f3f46' },
    })

    const series = chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
    })

    const data = rebase
      ? rebaseHistory(history).map((d) => ({ time: d.date, value: d.value }))
      : history
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((d) => ({ time: d.date, value: d.close }))

    series.setData(data as { time: string; value: number }[])
    chart.timeScale().fitContent()

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
    }
  }, [history, height, rebase, color])

  if (history.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-500"
        style={{ height }}
      >
        暂无股价数据
      </div>
    )
  }

  return <div ref={containerRef} className="w-full rounded-lg border border-zinc-800" />
}

interface MultiPriceChartProps {
  series: { ticker: string; history: PriceBar[]; color: string }[]
  height?: number
}

const CHART_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#fb923c']

export function MultiPriceChart({ series, height = 320 }: MultiPriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const valid = series.filter((s) => s.history.length > 0)
    if (valid.length === 0) return

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      rightPriceScale: { borderColor: '#3f3f46' },
      timeScale: { borderColor: '#3f3f46' },
    })

    const lines = valid.map((s, i) => {
      const line = chart.addSeries(LineSeries, {
        color: s.color || CHART_COLORS[i % CHART_COLORS.length],
        lineWidth: 2,
        title: s.ticker,
      })
      const data = rebaseHistory(s.history).map((d) => ({ time: d.date, value: d.value }))
      line.setData(data as { time: string; value: number }[])
      return line
    })

    chart.timeScale().fitContent()

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
      void lines
    }
  }, [series, height])

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-3">
        {series.map((s, i) => (
          <span key={s.ticker} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color || CHART_COLORS[i % CHART_COLORS.length] }}
            />
            {s.ticker}
          </span>
        ))}
      </div>
      <div ref={containerRef} className="w-full rounded-lg border border-zinc-800" />
    </div>
  )
}
