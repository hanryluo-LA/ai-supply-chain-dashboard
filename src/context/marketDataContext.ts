import { createContext } from 'react'
import type { useMarketData } from '../hooks/useMarketData'

export type MarketDataContextValue = ReturnType<typeof useMarketData>

export const MarketDataContext = createContext<MarketDataContextValue | null>(null)
