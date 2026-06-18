import { useContext } from 'react'
import { MarketDataContext } from './marketDataContext'

export function useMarketDataContext() {
  const ctx = useContext(MarketDataContext)
  if (!ctx) throw new Error('useMarketDataContext must be used within MarketDataProvider')
  return ctx
}
