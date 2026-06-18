# Render 部署指南

## 第一步：推送到 GitHub

在终端执行（若尚未登录 GitHub CLI，先运行 `gh auth login`）：

```bash
cd ~/Projects/ai-supply-chain-dashboard

# 创建 GitHub 仓库并推送（仓库名可改）
gh repo create ai-supply-chain-dashboard --public --source=. --remote=origin --push
```

或手动：在 https://github.com/new 创建空仓库，然后：

```bash
git remote add origin https://github.com/你的用户名/ai-supply-chain-dashboard.git
git push -u origin main
```

## 第二步：在 Render 部署

1. 打开 **https://dashboard.render.com/**
2. 用 GitHub 账号登录
3. 点击 **New +** → **Blueprint**
4. 选择刚推送的 `ai-supply-chain-dashboard` 仓库
5. Render 读取 [`render.yaml`](render.yaml)，点击 **Apply**
6. 等待 3–5 分钟，状态变为 **Live**

部署完成后地址类似：

```text
https://ai-supply-chain-dashboard.onrender.com
```

## 第三步：发给朋友

把上面的 **Live** 链接复制发给朋友即可。手机、电脑均可访问。

## 说明

| 项目 | 说明 |
|------|------|
| 免费版休眠 | 约 15 分钟无访问会休眠，首次打开需等待 ~30 秒唤醒 |
| 自动更新 | 之后每次 `git push` 到 main，Render 会自动重新部署 |
| 健康检查 | `/api/health` 用于 Render 检测服务是否正常 |

## 本地模拟生产环境

```bash
npm run build
NODE_ENV=production npm start
# 打开 http://localhost:3001
```
