import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSummaries, getPrices } from './priceProxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '../dist')
const isProduction = process.env.NODE_ENV === 'production'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.get('/api/summary', async (req, res) => {
  try {
    const tickersParam = req.query.tickers as string
    if (!tickersParam) {
      res.status(400).json({ error: 'tickers query param required' })
      return
    }
    const tickers = tickersParam.split(',').map((t) => t.trim()).filter(Boolean)
    const data = await getSummaries(tickers)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' })
  }
})

app.get('/api/prices', async (req, res) => {
  try {
    const tickersParam = req.query.tickers as string
    if (!tickersParam) {
      res.status(400).json({ error: 'tickers query param required' })
      return
    }
    const tickers = tickersParam.split(',').map((t) => t.trim()).filter(Boolean)
    const data = await getPrices(tickers)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' })
  }
})

if (isProduction) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(
    isProduction
      ? `AI Supply Chain Dashboard running on port ${PORT}`
      : `Price proxy running on http://localhost:${PORT}`,
  )
})
