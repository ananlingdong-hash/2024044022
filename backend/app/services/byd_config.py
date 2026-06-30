"""
比亚迪(BYD) 2024年真实财务数据配置

数据来源：比亚迪2024年度报告（002594.SZ / 1211.HK）
部分参数基于公开信息的合理估算，已在注释中标注。

用于 AstraQuant AI 风险分析平台的风险模拟场景：
- 汇率风险：币种敞口基于境外营收地区分布估算
- 信用风险：借方数据基于比亚迪汽车金融业务特征估算
- 供应链风险：供应商数据基于公开供应链信息推定
"""

# ═══════════════════════════════════════════════
# 币种敞口估算（基于已知地区分布的合理估算）
# ═══════════════════════════════════════════════

CURRENCY_EXPOSURES = {
    "USD": {
        "exposure_cny": 48_000_000_000,  # 480亿人民币
        "hedge_ratio": 0.38,
        "note": "美洲+部分亚洲市场",
    },
    "EUR": {
        "exposure_cny": 32_000_000_000,  # 320亿人民币
        "hedge_ratio": 0.42,
        "note": "欧洲市场",
    },
    "BRL": {
        "exposure_cny": 18_000_000_000,  # 180亿人民币
        "hedge_ratio": 0.25,
        "note": "巴西工厂+销售",
    },
    "JPY": {
        "exposure_cny": 8_000_000_000,   # 80亿人民币
        "hedge_ratio": 0.55,
        "note": "日本市场",
    },
    "Others": {
        "exposure_cny": 12_000_000_000,  # 120亿人民币（覆盖HKD、KRW、THB、INR等）
        "hedge_ratio": 0.30,
        "note": "其他地区（含东南亚、南亚、中东等）",
    },
}

# 总境外敞口（与财报境外营收¥2,218.84亿联动校验）
TOTAL_FX_EXPOSURE_CNY = 118_000_000_000  # 1,180亿（敞口覆盖境外营收的约53%部分）

# 基于财报的汇率风险量化参数
FX_RISK_PARAMS = {
    "overseas_revenue_ratio": 0.2855,        # 境外营收占比28.55%（财报精确值）
    "accounts_receivable_cny": 62_299_000_000,  # 应收账款¥622.99亿（VaR计算基础）
    "annual_fx_volatility_estimate": 0.065,     # 年化汇率波动率约6.5%（基于CNY/USD 2024历史）
    "avg_hedge_cost_bps": 85,                    # 平均对冲成本约85bps（基于公开信息的合理估算）
}

# ═══════════════════════════════════════════════
# 供应链供应商（基于公开信息的合理推断，标注为估算）
# ═══════════════════════════════════════════════

SUPPLIERS = [
    {
        "name": "智利SQM(锂)",
        "disruption_prob": 0.18,
        "lead_time_days": 45,
        "region": "南美",
        "category": "锂矿",
        "annual_spend_estimate": 8_500_000_000,  # 约85亿人民币（基于公开信息的合理估算）
        "is_alternative": False,
        "geo_score": 0.45,  # 地理分散度较低（南美单一来源）
        "switching_cost": 0,
        "note": "2024年锂价下跌40%+，SQM扩产计划推迟，供应稳定性存疑",
    },
    {
        "name": "澳洲Pilbara(锂)",
        "disruption_prob": 0.12,
        "lead_time_days": 30,
        "region": "大洋洲",
        "category": "锂矿",
        "annual_spend_estimate": 6_200_000_000,  # 约62亿人民币（基于公开信息的合理估算）
        "is_alternative": False,
        "geo_score": 0.65,
        "switching_cost": 0,
        "note": "Pilbara Minerals为比亚迪锂精矿长协供应商",
    },
    {
        "name": "自产磷酸铁锂",
        "disruption_prob": 0.03,
        "lead_time_days": 7,
        "region": "中国",
        "category": "正极材料",
        "annual_spend_estimate": 0,  # 自产自用
        "is_alternative": False,
        "geo_score": 0.95,
        "switching_cost": 0,
        "note": "比亚迪自建磷酸铁锂产能，供应链自主可控",
    },
    {
        "name": "台积电/中芯(芯片)",
        "disruption_prob": 0.22,
        "lead_time_days": 60,
        "region": "台湾/中国",
        "category": "半导体",
        "annual_spend_estimate": 3_800_000_000,  # 约38亿人民币（基于公开信息的合理估算）
        "is_alternative": False,
        "geo_score": 0.35,  # 台积电台湾产线地缘风险
        "switching_cost": 0,
        "note": "车规级芯片仍依赖外部代工，地缘政治风险显著",
    },
    {
        "name": "自产IGBT(半导体)",
        "disruption_prob": 0.05,
        "lead_time_days": 14,
        "region": "中国",
        "category": "半导体",
        "annual_spend_estimate": 0,  # 自产自用
        "is_alternative": False,
        "geo_score": 0.90,
        "switching_cost": 0,
        "note": "比亚迪半导体自研IGBT/SiC模块，产线位于宁波/长沙",
    },
    {
        "name": "北方稀土(永磁)",
        "disruption_prob": 0.08,
        "lead_time_days": 21,
        "region": "中国",
        "category": "稀土永磁",
        "annual_spend_estimate": 2_100_000_000,  # 约21亿人民币（基于公开信息的合理估算）
        "is_alternative": False,
        "geo_score": 0.85,
        "switching_cost": 0,
        "note": "北方稀土为中国最大稀土供应商，供应相对稳定",
    },
    {
        "name": "刚果金(钴)",
        "disruption_prob": 0.25,
        "lead_time_days": 50,
        "region": "非洲",
        "category": "钴矿",
        "annual_spend_estimate": 1_500_000_000,  # 约15亿人民币（基于公开信息的合理估算）
        "is_alternative": False,
        "geo_score": 0.30,  # 刚果金政局不稳、物流受限
        "switching_cost": 0,
        "note": "钴供应链存在ESG和人权风险，刚果金占全球钴产量70%+",
    },
    # 备选供应商
    {
        "name": "赣锋锂业(锂-备选)",
        "disruption_prob": 0.10,
        "lead_time_days": 25,
        "region": "中国",
        "category": "锂矿",
        "annual_spend_estimate": 0,  # 备选，暂未采购
        "is_alternative": True,
        "geo_score": 0.80,
        "switching_cost": 450_000_000,  # 约4.5亿切换成本（基于公开信息的合理估算）
        "note": "赣锋锂业拥有阿根廷/澳洲/中国多地产能，地理分散度好",
    },
    {
        "name": "恩智浦/英飞凌(芯片-备选)",
        "disruption_prob": 0.28,
        "lead_time_days": 55,
        "region": "欧洲/东南亚",
        "category": "半导体",
        "annual_spend_estimate": 0,  # 备选
        "is_alternative": True,
        "geo_score": 0.50,
        "switching_cost": 680_000_000,  # 约6.8亿切换成本（芯片认证+重新设计适配）
        "note": "欧洲半导体供应商切换涉及车规认证重做，周期长且成本高",
    },
    {
        "name": "华友钴业(钴-备选)",
        "disruption_prob": 0.15,
        "lead_time_days": 35,
        "region": "中国/印尼",
        "category": "钴矿",
        "annual_spend_estimate": 0,  # 备选
        "is_alternative": True,
        "geo_score": 0.60,
        "switching_cost": 120_000_000,  # 约1.2亿（基于公开信息的合理估算）
        "note": "华友钴业印尼镍钴项目可降低刚果金依赖",
    },
]

# ═══════════════════════════════════════════════
# 信用风险借款方（基于比亚迪金融业务特征的合理估算）
# ═══════════════════════════════════════════════

CREDIT_BORROWERS = [
    {
        "borrower": "经销商A(华南)",
        "pd": 0.08,
        "lgd": 0.35,
        "ead": 1_500_000_000,  # 15亿人民币
        "rating": "AA-",
        "raroc": 0.18,
        "sentiment": 1,
        "category": "经销商",
    },
    {
        "borrower": "经销商B(华北)",
        "pd": 0.06,
        "lgd": 0.30,
        "ead": 1_200_000_000,  # 12亿人民币
        "rating": "AA",
        "raroc": 0.20,
        "sentiment": 2,
        "category": "经销商",
    },
    {
        "borrower": "经销商C(海外)",
        "pd": 0.15,
        "lgd": 0.45,
        "ead": 800_000_000,  # 8亿人民币
        "rating": "A-",
        "raroc": 0.12,
        "sentiment": -2,
        "category": "经销商",
    },
    {
        "borrower": "供应商融资A",
        "pd": 0.10,
        "lgd": 0.40,
        "ead": 500_000_000,  # 5亿人民币
        "rating": "BBB+",
        "raroc": 0.14,
        "sentiment": 0,
        "category": "供应链金融",
    },
    {
        "borrower": "供应商融资B",
        "pd": 0.12,
        "lgd": 0.38,
        "ead": 450_000_000,  # 4.5亿人民币
        "rating": "BBB",
        "raroc": 0.11,
        "sentiment": -1,
        "category": "供应链金融",
    },
    {
        "borrower": "终端客户消费贷(聚合)",
        "pd": 0.04,
        "lgd": 0.25,
        "ead": 2_000_000_000,  # 20亿人民币
        "rating": "AA+",
        "raroc": 0.24,
        "sentiment": 3,
        "category": "消费金融",
    },
]

# 总信用敞口（基于比亚迪金融业务估测）
TOTAL_CREDIT_EXPOSURE_CNY = 6_450_000_000  # 64.5亿
# 基于财报：短期借款¥121.03亿中，汽车金融相关约占20-25%

# ═══════════════════════════════════════════════
# KPI监控指标（基于财报数据的合理目标值）
# ═══════════════════════════════════════════════

KPI_TARGETS = {
    "hedge_deviation_rate": {
        "name": "对冲偏差率",
        "actual": 0.038,
        "target": 0.05,
        "threshold": 0.08,
        "unit": "%",
        "note": "对冲组合实际执行与目标对冲比率的偏差（基于公开信息的合理估算）",
    },
    "default_trigger_rate": {
        "name": "违约触发率",
        "actual": 0.022,
        "target": 0.03,
        "threshold": 0.05,
        "unit": "%",
        "note": "触发信用预警的客户占全部授信客户的比例（基于公开信息的合理估算）",
    },
    "delivery_rate": {
        "name": "供应链交付率",
        "actual": 0.94,
        "target": 0.95,
        "threshold": 0.90,
        "unit": "%",
        "note": "关键物料按时交付率，基于比亚迪供应链管理能力估测",
    },
    "cost_overrun_rate": {
        "name": "成本超支率",
        "actual": 0.052,
        "target": 0.05,
        "threshold": 0.10,
        "unit": "%",
        "note": "对冲/风控成本占预算的超支比例（基于公开信息的合理估算）",
    },
    "liquidity_coverage": {
        "name": "流动性覆盖率",
        "actual": 1.62,
        "target": 1.50,
        "threshold": 1.00,
        "unit": "倍",
        "note": f"基于总负债¥5,846.68亿与流动资产匹配度估测",
    },
    "var_breach_count": {
        "name": "VaR突破次数",
        "actual": 1,
        "target": 0,
        "threshold": 5,
        "unit": "次",
        "note": "过去30个交易日VaR被实际波动突破的次数",
    },
}

# ═══════════════════════════════════════════════
# 比亚迪公司基本面数据（2024年年报）
# ═══════════════════════════════════════════════

BYD_COMPANY = {
    "name": "比亚迪股份有限公司",
    "name_en": "BYD Company Limited",
    "ticker": "002594.SZ / 1211.HK",
    "industry": "新能源汽车/电池/电子",
    "fiscal_year": 2024,
    # 利润表
    "total_revenue_cny": 777_102_000_000,         # ¥7,771.02亿
    "revenue_yoy_growth": 0.2902,                  # +29.02%
    "overseas_revenue_cny": 221_884_000_000,       # ¥2,218.84亿
    "overseas_revenue_ratio": 0.2855,              # 28.55%
    "net_profit_parent_cny": 40_254_000_000,       # ¥402.54亿
    "net_profit_yoy_growth": 0.34,                 # +34.00%
    # 资产负债表
    "total_assets_cny": 783_300_000_000,           # ¥7,833亿（基于资产负债率反推）
    "total_liabilities_cny": 584_668_000_000,      # ¥5,846.68亿
    "asset_liability_ratio": 0.7464,               # 74.64%
    "interest_bearing_debt_cny": 28_580_000_000,   # ~¥285.8亿
    "accounts_receivable_cny": 62_299_000_000,     # ¥622.99亿
    "accounts_receivable_within_1yr_pct": 0.8017,  # 80.17%
    "accounts_payable_cny": 241_643_000_000,       # ¥2,416.43亿
    "accounts_payable_turnover_days": 127,          # 周转天数127天
    "short_term_borrowing_cny": 12_103_000_000,    # ¥121.03亿
    # 市场数据
    "market_cap_cny": 874_100_000_000,             # ~¥8,741亿
    "stock_price_cny": 95.88,                       # ¥95.88
    "pe_ttm": 31.73,
    "eps": 3.02,
    # 经营数据
    "employee_count": 900_000,                      # 约90万人
    "credit_line_max_cny": 60_000_000_000,         # 单笔≤600亿
    "annual_vehicle_sales": 4_272_145,             # 2024年新能源汽车销量427.21万辆（全球第一）
}

# ═══════════════════════════════════════════════
# 策略优化方案中的比亚迪定制化描述
# ═══════════════════════════════════════════════

# 三套方案中嵌入的真实财务数字
STRATEGY_CONTEXT = {
    "revenue_display": "¥7,771亿",
    "net_profit_display": "¥402.54亿",
    "debt_display": "¥5,846.68亿",
    "receivable_display": "¥622.99亿",
    "overseas_pct": "28.55%",
    "pe_display": "31.73x",
}

# ═══════════════════════════════════════════════
# 辅助函数：格式化中文金额
# ═══════════════════════════════════════════════

def format_cny(value: float) -> str:
    """将人民币数值格式化为中文读法。"""
    yi = value / 100_000_000
    if yi >= 1:
        if yi >= 100:
            return f"¥{yi:.0f}亿"
        return f"¥{yi:.2f}亿"
    wan = value / 10_000
    return f"¥{wan:.0f}万"


def get_byd_company_context() -> dict:
    """返回比亚迪公司背景信息，用于API响应中的company_context字段。"""
    return {
        "company": BYD_COMPANY["name"],
        "ticker": BYD_COMPANY["ticker"],
        "fiscal_year": BYD_COMPANY["fiscal_year"],
        "headline": f"基于比亚迪(BYD) {BYD_COMPANY['fiscal_year']}年年报数据",
        "key_metrics": {
            "营收": format_cny(BYD_COMPANY["total_revenue_cny"]),
            "归母净利润": format_cny(BYD_COMPANY["net_profit_parent_cny"]),
            "境外营收占比": f"{BYD_COMPANY['overseas_revenue_ratio']:.1%}",
            "资产负债率": f"{BYD_COMPANY['asset_liability_ratio']:.1%}",
            "应收账款": format_cny(BYD_COMPANY["accounts_receivable_cny"]),
            "PE(TTM)": BYD_COMPANY["pe_ttm"],
        },
        "data_source": "比亚迪2024年度报告（002594.SZ / 1211.HK）",
        "disclaimer": "部分参数（币种敞口分布、供应商中断概率、借款方PD/LGD等）基于公开信息的合理估算，仅供参考",
    }
