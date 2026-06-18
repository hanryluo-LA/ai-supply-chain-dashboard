# AI Supply Chain Dashboard

Interactive dashboard mapping **~50 listed companies** across the AI industrial chain — from semiconductor equipment and packaging through GPU, networking, storage, cloud, and often-overlooked segments like power and testing.

## Features

- **Block heatmap** — 1-year median return per supply-chain block
- **Layer swimlane** — upstream → midstream → downstream navigation
- **Block drill-down** — sub-components, competitive notes, rebased charts, sortable constituent table
- **Company panel** — live price chart, fundamentals, competitors, upstream/downstream chain
- **Hybrid data** — curated static fundamentals + live Yahoo Finance prices

## 部署到公网（分享给朋友）

项目已支持**单服务生产模式**：Express 同时提供前端静态页 + 股价 API，适合 Render / Railway 等平台。

### 方式一：Render（推荐，免费）

1. 把代码推到 GitHub（新建仓库并 push）
2. 打开 [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. 连接你的 GitHub 仓库，Render 会读取根目录 [`render.yaml`](render.yaml) 自动部署
4. 部署完成后得到公网地址，例如 `https://ai-supply-chain-dashboard.onrender.com`

**注意：** 免费实例约 15 分钟无访问会休眠，朋友首次打开可能要等 ~30 秒唤醒。

本地验证生产构建：

```bash
npm run build
NODE_ENV=production npm start
# 浏览器打开 http://localhost:3001
```

### 方式二：Railway

1. 打开 [Railway](https://railway.app/) → New Project → Deploy from GitHub
2. 选择仓库，Railway 自动检测 Node 项目
3. 设置启动命令：`npm start`，构建命令：`npm run build`
4. 添加环境变量 `NODE_ENV=production`

### 方式三：临时分享（不部署，Mac 需开着）

若暂时不想上云，可用 Cloudflare Tunnel 把本机服务暴露到公网：

```bash
npm run dev:all
# 另开终端
npx cloudflared tunnel --url http://localhost:5173
```

终端会输出一个 `https://xxx.trycloudflare.com` 链接，发给朋友即可（关掉终端或合盖后链接失效）。

---

## 本地开发

```bash
npm install
npm run dev:all
```

浏览器打开 [http://localhost:5173](http://localhost:5173)。开发模式下股价代理在 **3001** 端口。

手机同 Wi‑Fi 访问：启动后看终端 **Network** 行，例如 `http://192.168.x.x:5173`。

或分开启动：

```bash
npm run server   # 3001
npm run dev      # 5173
```

---

## 添加公司

Edit [`data/companies.json`](data/companies.json):

```json
{
  "ticker": "TICK",
  "name": "Company Name",
  "blockIds": ["B1"],
  "marketCapTier": "mid",
  "marketCapUSD_B": 10,
  "revenueTTM_USD_B": 2,
  "revenueSource": "FY2024 annual report",
  "primaryProducts": ["Product A"],
  "competitors": ["NVDA"],
  "upstream": ["TSM"],
  "downstream": ["AMZN"],
  "moatNotes": "Brief competitive note",
  "listingNote": "NASDAQ",
  "otcWarning": false
}
```

Update `asOf` at the top of the file when refreshing fundamentals.

## Adding a Block

Edit [`data/blocks.json`](data/blocks.json) — add to the `blocks` array with `id`, `layerId`, `subComponents`, and `competitionNotes`.

## Supply Chain Edges

Edit [`data/relationships.json`](data/relationships.json) to add directed `from` → `to` edges with labels.

## Data Sources

| Data | Source | Refresh |
|------|--------|---------|
| Prices, 1Y/YTD returns | Yahoo Finance via local proxy | On page load (15-min cache) |
| Revenue, market cap tiers | Curated JSON | Manual (`npm run refresh-fundamentals`) |

## OTC Tickers

Samsung (`SSNLF`) and SK Hynix (`HXSCF`) are flagged with OTC warnings. Thin liquidity may cause fetch failures — these are excluded from block median calculations when data is unavailable.

## Disclaimer

This dashboard is for informational purposes only. It is not investment advice.
