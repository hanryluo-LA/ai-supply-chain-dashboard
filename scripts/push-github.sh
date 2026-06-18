#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> 检查 GitHub 登录"
gh auth status

echo "==> 创建/推送 GitHub 仓库"
if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin main
else
  gh repo create ai-supply-chain-dashboard --public --source=. --remote=origin --push
fi

REPO_URL="$(gh repo view --json url -q .url)"
echo ""
echo "✅ 代码已推送到: $REPO_URL"
echo ""
echo "==> 下一步：Render 部署"
echo "1. 打开 https://dashboard.render.com/"
echo "2. New + → Blueprint"
echo "3. 选择仓库 ai-supply-chain-dashboard"
echo "4. 点击 Apply，等待 Live"
echo ""
echo "或打开: https://dashboard.render.com/blueprint/new"
