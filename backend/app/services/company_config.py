"""
腾讯控股(Tencent) 2025年真实财务数据配置

数据来源：腾讯控股2025年经审核综合业绩公告（2026.3.18发布，0700.HK）
市值约HK$4.5万亿，PE(TTM)~22x，港股第一大市值公司。

风险模拟场景：
- 汇率风险：国际游戏(¥774亿)+海外投资的多币种敞口
- 信用风险：广告主授信/腾讯金融科技(微粒贷/理财通)
- 供应链风险：AI GPU芯片/云基础设施/游戏引擎
- 监管风险：CMC军工黑名单/游戏版号/VIE结构
"""

# ═══════════════════════════════════════════════
# 币种敞口（国际游戏+海外投资+微信支付跨境）
# ═══════════════════════════════════════════════

CURRENCY_EXPOSURES = {
    "USD": {
        "exposure_cny": 85_000_000_000,  # 850亿（国际游戏美元收入+Riot/Epic投资收益）
        "hedge_ratio": 0.48,
        "note": "国际游戏(Supercell/Riot)+海外投资(美元计价)",
    },
    "EUR": {
        "exposure_cny": 28_000_000_000,  # 280亿（Supercell芬兰+欧洲游戏发行）
        "hedge_ratio": 0.52,
        "note": "Supercell(芬兰)+欧洲游戏+广告收入",
    },
    "KRW": {
        "exposure_cny": 12_000_000_000,  # 120亿（韩国游戏发行+投资）
        "hedge_ratio": 0.40,
        "note": "韩国游戏市场(Krafton/Netmarble合作)",
    },
    "JPY": {
        "exposure_cny": 8_000_000_000,   # 80亿（日本游戏+投资）
        "hedge_ratio": 0.55,
        "note": "日本游戏发行+动漫IP授权",
    },
    "SGD": {
        "exposure_cny": 6_000_000_000,   # 60亿（东南亚游戏/支付区域总部）
        "hedge_ratio": 0.35,
        "note": "东南亚区域总部(新加坡)+Garena投资",
    },
    "Others": {
        "exposure_cny": 21_000_000_000,  # 210亿（BRL/GBP/THB等）
        "hedge_ratio": 0.30,
        "note": "巴西/英国/东南亚其他市场",
    },
}

TOTAL_FX_EXPOSURE_CNY = 160_000_000_000  # 1,600亿

FX_RISK_PARAMS = {
    "overseas_revenue_ratio": 0.103,          # 国际游戏占营收约10.3%(¥774亿/¥7,518亿)
    "accounts_receivable_cny": 52_000_000_000,  # 应收账款约¥520亿
    "annual_fx_volatility_estimate": 0.058,     # 年化汇率波动率5.8%(港币联系汇率制)
    "avg_hedge_cost_bps": 45,                    # 平均对冲成本45bps
}

# ═══════════════════════════════════════════════
# 供应链（AI算力+云基础设施+游戏引擎）
# ═══════════════════════════════════════════════

SUPPLIERS = [
    {
        "name": "NVIDIA(GPU)",
        "disruption_prob": 0.28,
        "lead_time_days": 120,
        "region": "美国",
        "category": "AI芯片",
        "annual_spend_estimate": 35_000_000_000,  # ~¥350亿
        "is_alternative": False,
        "geo_score": 0.15,  # 出口管制风险极高
        "switching_cost": 0,
        "note": "高性能 GPU 供应受出口管制和交付周期影响，先进算力资源的获取与扩容仍是核心约束。",
    },
    {
        "name": "华为昇腾(AI芯片-备选)",
        "disruption_prob": 0.15,
        "lead_time_days": 60,
        "region": "中国",
        "category": "AI芯片",
        "annual_spend_estimate": 8_000_000_000,   # ~¥80亿
        "is_alternative": True,
        "geo_score": 0.82,
        "switching_cost": 420_000_000,
        "note": "国产替代方案，CANN生态迁移成本高，性能差距约35-40%",
    },
    {
        "name": "腾讯云(自建数据中心)",
        "disruption_prob": 0.04,
        "lead_time_days": 7,
        "region": "中国",
        "category": "云基础设施",
        "annual_spend_estimate": 0,  # 自建
        "is_alternative": False,
        "geo_score": 0.90,
        "switching_cost": 0,
        "note": "腾讯云2025年实现规模化盈利，自建数据中心覆盖全球",
    },
    {
        "name": "Epic Games(虚幻引擎)",
        "disruption_prob": 0.08,
        "lead_time_days": 30,
        "region": "美国",
        "category": "游戏引擎",
        "annual_spend_estimate": 2_500_000_000,  # ~¥25亿(授权费+投资)
        "is_alternative": False,
        "geo_score": 0.70,
        "switching_cost": 0,
        "note": "腾讯持股40%，Unreal Engine为腾讯游戏核心引擎",
    },
    {
        "name": "Unity(游戏引擎-备选)",
        "disruption_prob": 0.12,
        "lead_time_days": 15,
        "region": "美国/丹麦",
        "category": "游戏引擎",
        "annual_spend_estimate": 800_000_000,    # ~¥8亿
        "is_alternative": True,
        "geo_score": 0.60,
        "switching_cost": 180_000_000,
        "note": "备选引擎但生态与虚幻不兼容，切换成本高",
    },
    {
        "name": "寒武纪/海光(国产AI芯片)",
        "disruption_prob": 0.20,
        "lead_time_days": 70,
        "region": "中国",
        "category": "AI芯片",
        "annual_spend_estimate": 3_000_000_000,
        "is_alternative": True,
        "geo_score": 0.78,
        "switching_cost": 250_000_000,
        "note": "国产AI芯片第二梯队，性能与产能均有限，作为补充方案",
    },
]

# ═══════════════════════════════════════════════
# 信用风险（微粒贷+理财通+广告主授信）
# ═══════════════════════════════════════════════

CREDIT_BORROWERS = [
    {
        "borrower": "微粒贷用户(聚合/优质)",
        "pd": 0.018,
        "lgd": 0.22,
        "ead": 45_000_000_000,  # ¥450亿
        "rating": "AA-",
        "raroc": 0.28,
        "sentiment": 3,
        "category": "消费金融",
    },
    {
        "borrower": "微粒贷用户(聚合/次优)",
        "pd": 0.055,
        "lgd": 0.35,
        "ead": 25_000_000_000,  # ¥250亿
        "rating": "BBB+",
        "raroc": 0.18,
        "sentiment": 0,
        "category": "消费金融",
    },
    {
        "borrower": "微信支付商户(聚合)",
        "pd": 0.025,
        "lgd": 0.28,
        "ead": 18_000_000_000,  # ¥180亿
        "rating": "A",
        "raroc": 0.22,
        "sentiment": 2,
        "category": "商户金融服务",
    },
    {
        "borrower": "广告主授信(品牌大客户)",
        "pd": 0.035,
        "lgd": 0.30,
        "ead": 12_000_000_000,  # ¥120亿
        "rating": "A-",
        "raroc": 0.20,
        "sentiment": 1,
        "category": "广告主授信",
    },
    {
        "borrower": "广告主授信(中小/游戏)",
        "pd": 0.072,
        "lgd": 0.38,
        "ead": 8_000_000_000,   # ¥80亿
        "rating": "BBB",
        "raroc": 0.14,
        "sentiment": -1,
        "category": "广告主授信",
    },
    {
        "borrower": "被投企业关联信贷(聚合)",
        "pd": 0.048,
        "lgd": 0.42,
        "ead": 10_000_000_000,  # ¥100亿
        "rating": "BB+",
        "raroc": 0.12,
        "sentiment": -2,
        "category": "投资组合信贷",
    },
]

TOTAL_CREDIT_EXPOSURE_CNY = 118_000_000_000  # ¥1,180亿

# ═══════════════════════════════════════════════
# KPI监控指标（腾讯定制）
# ═══════════════════════════════════════════════

KPI_TARGETS = {
    "game_revenue_growth": {
        "name": "游戏收入增速",
        "actual": 0.22,
        "target": 0.15,
        "threshold": 0.05,
        "unit": "%",
        "note": "2025年国内+18%/国际+33%，合计+22%。远超15%目标。长青游戏从12款扩至14款。",
    },
    "ad_revenue_growth": {
        "name": "广告收入增速",
        "actual": 0.19,
        "target": 0.15,
        "threshold": 0.08,
        "unit": "%",
        "note": "视频号+小程序+搜一搜驱动，AI广告技术平台提升点击率。",
    },
    "ai_capex_ratio": {
        "name": "AI资本开支占营收比",
        "actual": 0.105,
        "target": 0.12,
        "threshold": 0.08,
        "unit": "%",
        "note": "2025 年资本开支约 ¥768 亿，占营收约一成，反映腾讯持续加大云与 AI 基础设施投入。",
    },
    "gross_margin": {
        "name": "毛利率",
        "actual": 0.56,
        "target": 0.53,
        "threshold": 0.48,
        "unit": "%",
        "note": "连续9季度提升创历史新高56%。高毛利业务(游戏/广告)占比提升。",
    },
    "regulatory_incident_count": {
        "name": "重大监管事件数",
        "actual": 2,
        "target": 0,
        "threshold": 3,
        "unit": "次",
        "note": "2024年被列入CMC黑名单+游戏版号审查趋严。",
    },
    "user_time_share": {
        "name": "用户时长占比",
        "actual": 0.30,
        "target": 0.32,
        "threshold": 0.28,
        "unit": "%",
        "note": "视频号、小程序、小游戏与社交流量场景仍需持续提升时长与商业化效率。",
    },
}

# ═══════════════════════════════════════════════
# 腾讯公司基本面（2025年年报）
# ═══════════════════════════════════════════════

TENCENT_COMPANY = {
    "name": "腾讯控股有限公司",
    "name_en": "Tencent Holdings Limited",
    "ticker": "0700.HK",
    "industry": "游戏/社交/广告/金融科技/云与企业服务",
    "fiscal_year": 2025,
    # 利润表(IFRS)
    "total_revenue_cny": 751_766_000_000,          # ¥7,517.66亿
    "revenue_yoy_growth": 0.14,                     # +14%
    "gross_profit_cny": 422_593_000_000,            # ¥4,225.93亿
    "gross_margin": 0.56,                           # 56%
    "operating_profit_cny": 241_562_000_000,        # ¥2,415.62亿
    "net_profit_parent_cny": 224_842_000_000,       # ¥2,248.42亿
    "net_profit_yoy_growth": 0.16,                  # +16%
    "non_ifrs_net_profit_cny": 259_626_000_000,     # ¥2,596.26亿
    "eps": 24.749,
    # 业务分部收入
    "vas_revenue_cny": 369_281_000_000,             # 增值服务¥3,692.81亿
    "domestic_games_cny": 164_200_000_000,          # 国内游戏¥1,642亿
    "international_games_cny": 77_400_000_000,       # 国际游戏¥774亿($100亿+)
    "social_network_cny": 127_700_000_000,          # 社交网络¥1,277亿
    "marketing_revenue_cny": 144_973_000_000,       # 营销服务¥1,449.73亿
    "fintech_cloud_revenue_cny": 229_435_000_000,   # 金融科技及企业服务¥2,294.35亿
    # 用户数据
    "wechat_mau": 1_418_000_000,                    # 14.18亿
    # 研发与投资
    "rd_expense_cny": 85_747_000_000,               # ¥857.47亿
    "capex_cny": 76_800_000_000,                    # ¥768亿
    "free_cashflow_cny": 155_000_000_000,           # ~¥1,550亿
    # 市场数据
    "market_cap_hkd": 4_500_000_000_000,            # ~HK$4.5万亿
    "pe_ttm": 22.0,
    "dividend_per_share_hkd": 5.30,
    "share_buyback_hkd": 80_000_000_000,            # ¥800亿港元
    # 员工
    "employee_count": 105_000,
}

STRATEGY_CONTEXT = {
    "revenue_display": "¥7,518亿",
    "net_profit_display": "¥2,248亿",
    "gross_margin_display": "56%",
    "international_games_display": "$100亿+",
    "pe_display": "22x",
    "market_cap_display": "HK$4.5万亿",
}


def format_cny(value: float) -> str:
    yi = value / 100_000_000
    if yi >= 1:
        if yi >= 100:
            return f"¥{yi:.0f}亿"
        return f"¥{yi:.2f}亿"
    wan = value / 10_000
    return f"¥{wan:.0f}万"


def get_company_context() -> dict:
    return {
        "company": TENCENT_COMPANY["name"],
        "ticker": TENCENT_COMPANY["ticker"],
        "fiscal_year": TENCENT_COMPANY["fiscal_year"],
        "headline": f"基于腾讯控股(0700.HK) {TENCENT_COMPANY['fiscal_year']}年经审核综合业绩公告",
        "key_metrics": {
            "营收": format_cny(TENCENT_COMPANY["total_revenue_cny"]),
            "归母净利润": format_cny(TENCENT_COMPANY["net_profit_parent_cny"]),
            "毛利率": f"{TENCENT_COMPANY['gross_margin']:.0%}",
            "国际游戏收入": f"¥{TENCENT_COMPANY['international_games_cny']/1e8:.0f}亿($100亿+)",
            "微信MAU": f"{TENCENT_COMPANY['wechat_mau']/1e8:.2f}亿",
            "PE(TTM)": TENCENT_COMPANY["pe_ttm"],
        },
        "data_source": "腾讯控股2025年经审核综合业绩公告（2026年3月18日发布，港交所0700.HK）",
        "disclaimer": "部分参数（币种敞口分布、供应商中断概率、借款方PD/LGD等）基于公开信息的合理估算，仅供参考",
    }
