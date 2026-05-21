# AstraQuant AI - MVP Skeleton

AI 驱动股票辅助分析平台前端骨架（React 19 + TypeScript + Tailwind CSS + shadcn/ui 风格组件）。

## 快速启动

```bash
npm install
cp .env.example .env
python -m pip install -r backend/requirements.txt
npm run backend:dev
npm run dev
```

## 已实现骨架

- 五大模块路由：`/sentiment`、`/live`、`/quant`、`/assistant`、`/profile`
- 深色主题变量：`--bg`、`--text`、`--brand` 等
- 量化策略工坊闭环（信息 -> 分析 -> 策略 -> 验证）
- MiniMax M2.7 AI 模型 API 模板
- 数据层模板：REST 封装、WebSocket 客户端、IndexedDB 报告缓存
- 性能优化示例：虚拟滚动 + 增量渲染
- 安全示例：API Key 前端加密（Web Crypto）
- 数据库设计：`database/schema.sql`

## 技术栈

- Frontend: React 19 + TypeScript + Tailwind CSS
- UI: shadcn/ui 风格组件（本地实现）
- Charts: ECharts + TradingView Lightweight Charts
- Data: REST + WebSocket + IndexedDB

## MVP 迭代建议

- Phase 1（2 周）：舆情雷达 + AI 投研助手基础版
- Phase 2（2 周）：实盘透视 + 量化策略工坊
- Phase 3（1 周）：个人中心 + 性能与体验优化

## 后端能力（已打通）

- FastAPI 接口：`/api/market/*`、`/api/quant/backtest`、`/api/ai/*`、`/api/sentiment/*`、`/api/tasks`、`/api/profile/api-keys`
- WebSocket：`/ws/market` 实时推送
- 定时任务：APScheduler + Cron 表达式
- 数据库：SQLite（`backend/data/astrquant.db`）自动建表与入库
- 外部 AI：MiniMax 实际调用（支持诊断码与错误提示）

## API Key 持久配置

- 后端启动时会自动读取 `backend/.env`
- 请在 `backend/.env` 填入：
  - `MINIMAX_API_KEY=你的MiniMax Key`
  - `MINIMAX_GROUP_ID=你的 GroupId`
  - `MINIMAX_MODEL=MiniMax-M2.7`
  - `MINIMAX_API_URL=https://api.minimax.chat/v1/text/chatcompletion_v2`
- 配置一次后，后续 `npm run backend:start` 无需再手动设置环境变量
