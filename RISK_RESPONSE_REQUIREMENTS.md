# 风险应对决策支持系统 - 完整需求

你是一名资深全栈架构师。请基于现有项目架构，实现"基于 Agent 的风险应对决策支持系统"。

## 现有项目概述
- React + TypeScript + Vite 8 + Tailwind CSS v4 + ECharts + Zustand + React Query
- 已有 Dashboard、风险详情、策略、舆情、量化等页面
- 后端脚本指向 backend/app/main.py (Python FastAPI)
- 保持现有 Dashboard 和所有现有路由不变

## 技术栈新增
- 前端：复用现有 UI 组件 (Card, Badge, Button 等)，新增 ECharts 图表
- 后端：Python FastAPI + SQLite + JWT + RBAC
- Agent 引擎：简单状态机工作流

---

## 1. 后端实现 (backend/)

### 1.1 更新 backend/app/main.py
创建 FastAPI app，开启 CORS，挂载路由，添加 Swagger 文档。

### 1.2 API 端点
- `POST /api/v1/risk/evaluate` — 风险评估（蒙特卡洛 + VaR + 行业对标），返回 risk_score(0-100), trend, probability_distribution, var_table, factor_contributions
- `POST /api/v1/strategy/optimize` — 参数: risk_appetite, budget, time_window (天)。返回 conservative/balanced/aggressive 三套方案，含 gantt 数据
- `POST /api/v1/pdca/execute/{plan_id}` — 执行策略，返回执行指令 JSON
- `POST /api/v1/feedback` — 提交反馈记录，触发闭环优化
- `GET /api/v1/risk/report/{id}` — 获取风险报告
- `GET /api/v1/monitor/kpi` — KPI 监控数据 (hedge_deviation, default_rate, delivery_rate 等)
- `GET /api/v1/monitor/events` — 风险事件列表 (含 lat/lng 地图数据)
- `GET /api/v1/scenario/fx` — 汇率场景: USD/EUR/JPY 敞口 + 对冲数据
- `GET /api/v1/scenario/credit` — 信用场景: PD/LGD/贷款组合
- `GET /api/v1/scenario/supply` — 供应链场景: 中断概率/备选供应商

### 1.3 数据模型 (SQLite)
- `risk_events`: id, type, severity, region, lat, lng, description, timestamp
- `strategies`: id, name, type(conservative/balanced/aggressive), params_json, cost, residual_risk, status, created_at
- `kpi_logs`: id, kpi_name, actual, target, threshold, period, recorded_at
- `feedback_records`: id, strategy_id, plan_params, actual_loss, actual_cost, residual_risk, suggestions, recorded_at

### 1.4 JWT 认证 + RBAC
预置用户表，四个角色：admin, risk_analyst, executor, viewer
登录端点：POST /api/v1/auth/login

### 1.5 模拟数据生成器
为三大场景生成丰富的仿真数据

---

## 2. 前端新增页面

### 2.1 RiskResponseCenter.tsx (`/risk-response`)
- 风险评分大卡片 (0-100) + 趋势箭头 (↑/↓/→)
- ECharts 概率分布曲线图 (JSON 格式 density curve)
- VaR 表格 (置信度 95%/99% + 历史模拟/参数法)
- 因子贡献表 (说明每个因素对风险评分的贡献)
- 时间敏感度指示器 (风险爆发倒计时)
- "触发评估" 按钮调用 POST /api/v1/risk/evaluate

### 2.2 StrategyOptimizer.tsx (`/strategy-optimizer`)
- 约束配置表单: 风险偏好金额、预算上限、时间窗口天数
- 三套策略对比卡片 (保守/平衡/激进) 展开显示详细策略组合
- ECharts 甘特图 (时间轴 T+0 到 T+窗口期，包含审批/签约/执行/监控节点)
- 成本 vs 剩余风险散点图 (三套方案的帕累托前沿)
- "优化计算" 按钮调用 POST /api/v1/strategy/optimize

### 2.3 PDCACycle.tsx (`/pdca`)
Plan 区域:
- 方案设计界面 + 三套对比矩阵
- 审批状态机 (提交→风控审核→财务总监批准)

Do 区域:
- 一键执行按钮，输出可执行指令 JSON

Check 区域:
- KPI 监控看板 (hedge_deviation_rate, default_trigger_rate, delivery_rate)
- 风险事件地图 (ECharts map/scatter by region) + 时间轴
- 策略甘特图 (与计划对比)
- 效果对比折线图: 实际损失 vs 预期损失

Act 区域:
- 反馈记录表
- 闭环优化建议 (基于历史反馈的自动建议)

### 2.4 ScenarioViewer.tsx (`/scenarios`)
三个 Tab:
- **汇率风险**: 敞口数据表 (USD/EUR/JPY, 账期30/60/90天), 敞口覆盖率, 对冲成本占比, 对冲 vs 无对冲对比图, 实时预警
- **信用风险**: 借款人 PD/LGD 表, 贷款组合优化建议, RAROC 计算, 不良率预测
- **供应链风险**: 中断概率 (Prophet-like 预测), 备选供应商列表, 安全库存建议, 原材料价格监控

---

## 3. 导航集成
在 AppShell.tsx 侧边栏中添加新菜单项:
- 智能评估 (/risk-response)
- 策略优化 (/strategy-optimizer)  
- PDCA管理 (/pdca)
- 场景分析 (/scenarios)

## 4. API 客户端 (src/api/risk-response.ts)
封装所有后端 API 调用，使用现有 http.ts 的 axios 实例，含 fallback 模拟数据

## 5. 类型定义 (src/types/risk-response.ts)
所有相关 TypeScript 接口定义

## 6. UI 风格
- 保持现有暗色主题
- 复用 Card/Badge/Button/Input 组件
- 使用 ECharts 绘制图表
- 保持 CSS 变量命名惯例

## 验收清单
1. `npm run dev` 正常启动，所有新页面可导航
2. 四个新页面渲染正确，图表和交互正常
3. 后端 API 端点完整，`npm run backend:dev` 可启动
4. 无 TypeScript 编译错误
5. 侧边栏菜单正确显示新入口

完成后运行: openclaw system event --text "Done: 风险应对决策支持系统已完成，包含智能评估、策略优化、PDCA全周期、三大场景落地页面及后端API" --mode now
