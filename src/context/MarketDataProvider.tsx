import { type ReactNode } from 'react'
import { useMarketData } from '../hooks/useMarketData'
import { MarketDataContext } from './marketDataContext'

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const value = useMarketData()
  return (
    <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>
  )
}
