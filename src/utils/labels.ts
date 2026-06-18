import type { MarketCapTier } from '../types'

export const TIER_LABELS: Record<MarketCapTier, string> = {
  mega: '超大型',
  large: '大型',
  mid: '中型',
  small: '小型',
}

export const LAYER_NAV_LABELS: Record<string, string> = {
  A: '上游',
  B: '中游',
  C: '下游',
  D: '易被忽视',
}
