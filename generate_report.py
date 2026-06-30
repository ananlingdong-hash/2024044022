#!/usr/bin/env python3
"""
生成《股指期货跨期套利策略深度分析报告》Word 文档
"""

from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import datetime

# ──────────────────────────────────────────────
# 辅助函数
# ──────────────────────────────────────────────

def set_cell_shading(cell, color):
    """设置单元格底色"""
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color}"/>')
    cell._tc.get_or_add_tcPr().append(shading)


def add_table_of_contents(doc):
    """插入目录域（需在 Word 中右键更新域）"""
    paragraph = doc.add_paragraph()
    run = paragraph.add_run()
    fldChar_begin = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
    run._r.append(fldChar_begin)

    run2 = paragraph.add_run()
    instrText = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> TOC \\o "1-3" \\h \\z </w:instrText>')
    run2._r.append(instrText)

    run3 = paragraph.add_run()
    fldChar_separate = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
    run3._r.append(fldChar_separate)

    run4 = paragraph.add_run('[请在 Word 中右键此处 → 更新域，以生成目录]')
    run4.font.size = Pt(12)
    run4.font.name = '宋体'
    run4._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')

    run5 = paragraph.add_run()
    fldChar_end = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
    run5._r.append(fldChar_end)


def add_heading_styled(doc, text, level):
    """添加标题（黑体）"""
    heading = doc.add_heading(text, level=level)
    for run in heading.runs:
        run.font.name = '黑体'
        run._element.rPr.rFonts.set(qn('w:eastAsia'), '黑体')
        if level == 0:
            run.font.size = Pt(22)
        elif level == 1:
            run.font.size = Pt(16)
        elif level == 2:
            run.font.size = Pt(14)
        elif level == 3:
            run.font.size = Pt(13)
    return heading


def add_body_para(doc, text, bold=False, indent=True):
    """添加正文段落（宋体）"""
    para = doc.add_paragraph()
    para.paragraph_format.line_spacing = 1.5
    para.paragraph_format.space_after = Pt(6)
    if indent:
        para.paragraph_format.first_line_indent = Cm(0.75)
    run = para.add_run(text)
    run.font.name = '宋体'
    run._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
    run.font.size = Pt(12)
    run.bold = bold
    return para


def add_formula(doc, text):
    """添加公式行（居中）"""
    para = doc.add_paragraph()
    para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    para.paragraph_format.space_before = Pt(8)
    para.paragraph_format.space_after = Pt(8)
    run = para.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.italic = True
    return para


def format_table(table):
    """设置表格样式：居中、边框"""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for row in table.rows:
        for cell in row.cells:
            for para in cell.paragraphs:
                para.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in para.runs:
                    run.font.size = Pt(10.5)
                    run.font.name = '宋体'
                    run._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')


def add_table_header(table, row_idx, texts, bg_color="1F4E79"):
    """设置表头样式"""
    for i, text in enumerate(texts):
        cell = table.rows[row_idx].cells[i]
        set_cell_shading(cell, bg_color)
        for para in cell.paragraphs:
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in para.runs:
                run.font.name = '黑体'
                run._element.rPr.rFonts.set(qn('w:eastAsia'), '黑体')
                run.font.size = Pt(10.5)
                run.font.color.rgb = RGBColor(255, 255, 255)
                run.bold = True


# ──────────────────────────────────────────────
# 主函数：构建报告
# ──────────────────────────────────────────────

def build_report():
    doc = Document()

    # ── 页面设置 ──
    for section in doc.sections:
        section.top_margin = Cm(2.54)
        section.bottom_margin = Cm(2.54)
        section.left_margin = Cm(3.18)
        section.right_margin = Cm(3.18)

    # ── 默认样式 ──
    style = doc.styles['Normal']
    style.font.name = '宋体'
    style.font.size = Pt(12)
    style.element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')

    # ==============================================
    # 封面
    # ==============================================
    for _ in range(6):
        doc.add_paragraph()

    # 主标题
    title_para = doc.add_paragraph()
    title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_para.add_run('股指期货跨期套利策略')
    title_run.font.name = '黑体'
    title_run._element.rPr.rFonts.set(qn('w:eastAsia'), '黑体')
    title_run.font.size = Pt(32)
    title_run.font.color.rgb = RGBColor(31, 78, 121)
    title_run.bold = True

    # 副标题
    sub_para = doc.add_paragraph()
    sub_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_para.add_run('——底层算法与盈利逻辑深度分析报告')
    sub_run.font.name = '黑体'
    sub_run._element.rPr.rFonts.set(qn('w:eastAsia'), '黑体')
    sub_run.font.size = Pt(18)
    sub_run.font.color.rgb = RGBColor(89, 89, 89)

    doc.add_paragraph()
    doc.add_paragraph()

    # 分隔线
    line_para = doc.add_paragraph()
    line_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    line_run = line_para.add_run('━' * 40)
    line_run.font.color.rgb = RGBColor(31, 78, 121)
    line_run.font.size = Pt(10)

    doc.add_paragraph()

    # 封面信息
    info_items = [
        ('策略来源', 'JoinQuant 聚宽量化课堂（文章编号：4296）'),
        ('分析日期', datetime.date.today().strftime('%Y年%m月%d日')),
        ('文档版本', 'V1.0'),
    ]
    for label, value in info_items:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r1 = p.add_run(f'{label}：')
        r1.font.name = '黑体'
        r1._element.rPr.rFonts.set(qn('w:eastAsia'), '黑体')
        r1.font.size = Pt(12)
        r2 = p.add_run(value)
        r2.font.name = '宋体'
        r2._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
        r2.font.size = Pt(12)

    # ── 分页 ──
    doc.add_page_break()

    # ==============================================
    # 摘要
    # ==============================================
    add_heading_styled(doc, '摘  要', 1)

    abstract_text = (
        '本文对基于协整关系的股指期货跨期套利策略进行了深入的系统性分析。该策略以沪深300股指期货（IF）的当月连续合约和次月连续合约为交易标的，'
        '运用普通最小二乘法（OLS）建立两合约对数价格之间的长期均衡关系，通过ADF单位根检验验证价差序列的平稳性（均值回复性），并以标准化残差（Z-Score）'
        '作为交易信号触发多头 / 空头对冲组合的建仓与平仓操作。本文从统计学基础、计量经济学方法、风险控制机制三个层面完整拆解了策略的底层算法逻辑，'
        '阐明了"市场中性的统计套利"这一核心盈利原理，并客观评价了策略的优势与潜在风险。分析表明，该策略在价差平稳波动的市场环境中能够稳定获取Alpha收益，'
        '但在市场结构突变、流动性枯竭或协整关系破裂的场景下存在显著尾部风险。最后，本文提出了动态回归窗口、多品种扩展、机器学习增强等改进方向。'
    )
    add_body_para(doc, abstract_text)

    doc.add_paragraph()

    # 关键词
    kw_para = doc.add_paragraph()
    kw_para.paragraph_format.first_line_indent = Cm(0.75)
    r1 = kw_para.add_run('关键词：')
    r1.font.name = '黑体'
    r1._element.rPr.rFonts.set(qn('w:eastAsia'), '黑体')
    r1.font.size = Pt(12)
    r1.bold = True
    r2 = kw_para.add_run('跨期套利；协整理论；OLS回归；ADF检验；Z-Score；股指期货；统计套利')
    r2.font.name = '宋体'
    r2._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
    r2.font.size = Pt(12)

    doc.add_page_break()

    # ==============================================
    # 目录
    # ==============================================
    add_heading_styled(doc, '目  录', 1)
    add_table_of_contents(doc)
    doc.add_page_break()

    # ==============================================
    # 第一章 策略概述
    # ==============================================
    add_heading_styled(doc, '第一章  策略概述', 1)

    add_heading_styled(doc, '1.1  跨期套利的基本概念', 2)
    add_body_para(doc,
        '跨期套利（Calendar Spread Arbitrage）是期货市场中最为经典的套利策略之一。其基本原理是：同一标的资产的不同到期月份期货合约之间存在理论上'
        '的合理价差（主要由持有成本决定），当实际价差由于市场短期供需失衡、流动性冲击或非理性交易行为而发生暂时性偏离时，套利者通过同时构建方向相反的头寸'
        '——买入被低估合约、卖出被高估合约——来捕捉价差向均衡水平回归过程中的收益。'
    )
    add_body_para(doc,
        '与方向性投机不同，跨期套利策略的核心优势在于其市场中性（Market Neutral）特征：由于同时持有多头和空头头寸，市场整体涨跌对组合净值的影响被大幅对冲，'
        '策略收益的来源是"相对价差的变化"而非"绝对价格的走向"。这使得策略在牛、熊、震荡市中均有可能获得正向收益。'
    )

    add_heading_styled(doc, '1.2  策略背景与适用标的', 2)
    add_body_para(doc,
        '本策略来源于聚宽（JoinQuant）量化交易平台的官方教学文章（编号4296），原始作者为JoinQuant量化课堂团队。策略以中国金融期货交易所（CFFEX）上市的'
        '沪深300股指期货（交易代码：IF）为交易标的，具体操作对象为当月连续合约和次月连续合约。策略回测时间跨度覆盖2010年至2016年，包含了完整的单边上涨、'
        '急速下跌、区间震荡等多种市场环境，具备较高的实证参考价值。'
    )
    add_body_para(doc,
        '沪深300股指期货合约乘数为每点300元人民币，采用保证金交易制度。策略根据中国金融期货交易所历史上保证金率和交易手续费率的多次调整（如2015年股灾期间的'
        '严厉限制措施），设定了分段的手续费和保证金参数，体现了较高的工程实现成熟度。'
    )

    # 表1：合约基本信息
    add_body_para(doc, '表1  沪深300股指期货合约核心参数', bold=True, indent=False)
    table1 = doc.add_table(rows=7, cols=2, style='Table Grid')
    t1_data = [
        ('参数项', '说明'),
        ('合约标的', '沪深300指数'),
        ('合约乘数', '每点300元人民币'),
        ('最小变动价位', '0.2点'),
        ('合约月份', '当月、下月及随后两个季月'),
        ('交易时间', '上午9:30-11:30，下午13:00-15:00'),
        ('最后交易日', '合约到期月份的第三个星期五'),
    ]
    for i, (k, v) in enumerate(t1_data):
        table1.rows[i].cells[0].text = k
        table1.rows[i].cells[1].text = v
    add_table_header(table1, 0, t1_data[0], bg_color="1F4E79")
    format_table(table1)
    # 表头底色已在 add_table_header 中处理，不再重复覆盖
    doc.add_paragraph()

    # ==============================================
    # 第二章 底层算法详解
    # ==============================================
    add_heading_styled(doc, '第二章  底层算法详解', 1)

    add_body_para(doc,
        '本策略的算法架构可以清晰地划分为四个层次：（1）OLS线性回归建模——建立两合约对数价格的协整方程；（2）ADF平稳性检验——验证残差序列是否具备均值回复'
        '特性；（3）Z-Score标准化转换——将残差映射为标准正态度量下的交易信号；（4）合约月份识别——准确识别当月与次月期货合约代码。以下逐层详细分析。'
    )

    # 2.1
    add_heading_styled(doc, '2.1  OLS线性回归建模', 2)

    add_heading_styled(doc, '2.1.1  数学原理', 3)
    add_body_para(doc,
        '普通最小二乘法（Ordinary Least Squares, OLS）是计量经济学中最基础的参数估计方法。其目标是在给定解释变量X和被解释变量Y的情况下，找到一组回归系数'
        '使得残差平方和（Residual Sum of Squares, RSS）最小化。在本策略的语境下，回归模型的具体形式为：'
    )
    add_formula(doc, 'ln(P_next,t) = α + β · ln(P_current,t) + ε_t')
    add_body_para(doc,
        '其中：ln(P_next,t) 为次月合约在时刻 t 的对数价格（作为被解释变量）；ln(P_current,t) 为当月合约在时刻 t 的对数价格（作为解释变量）；'
        'α 为截距项（Intercept），表示当月合约对数值为零时次月合约对数值的基准水平；β 为斜率系数（Slope），衡量次月合约对数价格对当月合约对数价格的弹性；'
        'ε_t 则为残差项，代表次月合约实际价格与根据当月合约"预测"的均衡价格之间的偏差，即套利者所关注的"非均衡程度"。'
    )

    add_heading_styled(doc, '2.1.2  为何对价格取对数', 3)
    add_body_para(doc,
        '策略在回归前将原始价格转换为对数价格，这种处理在金融时间序列分析中极为普遍，背后有三重考量：'
    )
    add_body_para(doc,
        '第一，消除趋势效应。金融资产价格通常呈现指数增长趋势，取对数后增长曲线被线性化，有助于OLS模型更好地拟合长期关系。'
    )
    add_body_para(doc,
        '第二，降低异方差性。原始价格水平越高，其波动幅度通常也越大（方差与价格水平正相关），这种异方差性会降低OLS估计的有效性。对数变换使价格序列的'
        '方差更加稳定（方差稳定化变换）。'
    )
    add_body_para(doc,
        '第三，赋予经济含义。在对数-对数模型中，斜率系数 β 直接解读为弹性——即当月合约价格每变动1%，次月合约价格平均变动 β%。在期货跨期关系中，'
        'β 的值通常非常接近于1（因为两个合约跟踪同一标的指数），一旦显著偏离1则提示市场结构可能发生了异常变化。'
    )

    add_heading_styled(doc, '2.1.3  OLS估计量的数学表达', 3)
    add_body_para(doc,
        'OLS问题的解析解为：'
    )
    add_formula(doc, 'β̂ = (XᵀX)⁻¹Xᵀy')
    add_body_para(doc,
        '其中 X 是 n×2 的设计矩阵（第一列为全1向量，对应截距项；第二列为当月合约对数价格向量），y 是次月合约对数价格向量。这一闭式解无需迭代优化，'
        '计算效率极高，在量化交易这种对延迟敏感的场景中具有天然的工程优势。'
    )
    add_body_para(doc,
        '策略在代码中使用了 statsmodels 库的 OLS 类进行回归，回归系数通过 results.params[0]（截距 α）和 results.params[1]（斜率 β）提取。'
        '回归的样本窗口设定为过去 240 分钟（即 4 小时的1分钟级别K线数据），每1分钟滚动更新一次回归参数，以捕捉价差结构的最新动态。'
    )

    # 表2：OLS回归关键要素
    add_body_para(doc, '表2  OLS回归模型的关键参数', bold=True, indent=False)
    table2 = doc.add_table(rows=6, cols=3, style='Table Grid')
    t2_data = [
        ('变量 / 参数', '含义', '取值 / 来源'),
        ('被解释变量 Y', '次月合约对数价格 ln(P_next)', '行情数据实时计算'),
        ('解释变量 X', '当月合约对数价格 ln(P_current)', '行情数据实时计算'),
        ('回归窗口', '用于参数估计的样本长度', '过去240分钟（1分钟K线）'),
        ('截距项 α', 'Y轴基准水平', 'OLS估计 results.params[0]'),
        ('斜率 β', '价格弹性系数', 'OLS估计 results.params[1]'),
    ]
    for i, row in enumerate(t2_data):
        for j, val in enumerate(row):
            table2.rows[i].cells[j].text = val
    add_table_header(table2, 0, t2_data[0], bg_color="1F4E79")
    format_table(table2)
    doc.add_paragraph()

    # 2.2
    add_heading_styled(doc, '2.2  ADF平稳性检验', 2)

    add_heading_styled(doc, '2.2.1  平稳性与协整的理论基础', 3)
    add_body_para(doc,
        '平稳性（Stationarity）是时间序列分析中最为核心的概念之一。一个协方差平稳的时间序列满足三个条件：均值恒定、方差不随时间变化、协方差仅取决于时间间隔'
        '而非时间点位。两个或多个非平稳的一阶单整序列 I(1)，如果它们的某个线性组合是平稳的 I(0)，则称这些序列之间存在协整关系（Cointegration）。'
    )
    add_body_para(doc,
        '在本策略中，当月合约和次月合约的对数价格序列各自可能是不平稳的（通常为 I(1) 过程），但由于它们跟踪的是同一标的指数（沪深300），持有成本使得二者之间'
        '存在理论上稳定的价差结构，因此它们的线性组合——即OLS回归的残差序列——应当是一个平稳过程。'
    )
    add_body_para(doc,
        '残差的平稳性是整个策略逻辑闭环中最为关键的数学前提：只有残差是平稳的，"价差会回归均值"这一统计规律才具有严格的数学基础；如果残差为非平稳的随机游走过程，'
        '则价差可能无限发散，套利交易面临无上限的亏损风险。'
    )

    add_heading_styled(doc, '2.2.2  ADF检验的统计学机制', 3)
    add_body_para(doc,
        'ADF检验（Augmented Dickey-Fuller Test）是检验时间序列是否存在单位根的最常用方法。其检验模型为：'
    )
    add_formula(doc, 'Δε_t = γ · ε_{t-1} + Σ_{i=1}^{p} δ_i · Δε_{t-i} + u_t')
    add_body_para(doc,
        '其中 Δ 表示一阶差分，p 为滞后阶数以控制残差的自相关性，u_t 为白噪声。检验的零假设 H₀ 为 γ = 0（序列存在单位根，非平稳），备择假设 H₁ 为 γ < 0'
        '（序列平稳）。策略中设置的显著性水平 α = 0.01，即只有当 p-value < 0.01 时才以99%的置信度拒绝零假设，认定残差序列平稳。'
    )
    add_body_para(doc,
        '这一阈值设定极为严格（常见的学术研究多用 0.05），体现了策略设计者对统计审慎性的高度重视——宁可放弃部分潜在交易机会，也要确保交易的协整基础真实可靠。'
    )

    # 表3：ADF检验关键阈值
    add_body_para(doc, '表3  ADF检验的决策规则', bold=True, indent=False)
    table3 = doc.add_table(rows=5, cols=3, style='Table Grid')
    t3_data = [
        ('检验结果', '统计含义', '策略操作'),
        ('p-value < 0.01', '拒绝H₀，残差平稳（置信度99%）', '计算Z-Score，准备交易'),
        ('p-value ≥ 0.01', '不能拒绝H₀，残差可能非平稳', '返回信号值100（不交易）'),
        ('残差长度=0', '数据不足', '返回信号值100（不交易）'),
        ('ADF统计量 < 临界值', '序列均值回复性强', '套利安全边际充足'),
    ]
    for i, row in enumerate(t3_data):
        for j, val in enumerate(row):
            table3.rows[i].cells[j].text = val
    add_table_header(table3, 0, t3_data[0], bg_color="1F4E79")
    format_table(table3)
    doc.add_paragraph()

    # 2.3
    add_heading_styled(doc, '2.3  Z-Score标准化与交易信号生成', 2)

    add_heading_styled(doc, '2.3.1  标准化处理', 3)
    add_body_para(doc,
        '在通过协整检验后，策略将最新一分钟的当月与次月合约对数价格代入已估计的回归方程，计算当前残差，并除以历史残差的标准差，得到标准化残差（Z-Score）：'
    )
    add_formula(doc, 'Z_t = ε_t / σ_ε = [ln(P_next,t) − (α + β · ln(P_current,t))] / σ_ε')
    add_body_para(doc,
        'Z-Score的经济含义非常直观：它衡量了当前价差偏离均衡值多少个标准差。根据正态分布的性质，Z-Score的绝对值在不同区间内的出现概率如下：'
    )
    add_body_para(doc, '|Z| < 1.0：概率约 68.3%，属于正常波动范围；1.0 ≤ |Z| < 2.0：概率约 27.2%，属于边缘区间；|Z| ≥ 2.0：概率约 4.5%，属于极端偏离。',
                  indent=False)

    add_heading_styled(doc, '2.3.2  交易信号映射', 3)
    add_body_para(doc,
        '策略将Z-Score映射为双向交易信号，形成完整的开仓、持仓与平仓逻辑闭环，具体规则如以下两表所示。'
    )

    add_body_para(doc, '表4  开仓信号规则', bold=True, indent=False)
    table4 = doc.add_table(rows=3, cols=4, style='Table Grid')
    t4_data = [
        ('Z-Score区间', '市场状态解读', '当月合约操作', '次月合约操作'),
        ('1.0 < Z < 2.0', '次月相对高估', '做多（Long）', '做空（Short）'),
        ('−2.0 < Z < −1.0', '次月相对低估', '做空（Short）', '做多（Long）'),
    ]
    for i, row in enumerate(t4_data):
        for j, val in enumerate(row):
            table4.rows[i].cells[j].text = val
    add_table_header(table4, 0, t4_data[0], bg_color="1F4E79")
    format_table(table4)

    doc.add_paragraph()

    add_body_para(doc, '表5  平仓信号规则', bold=True, indent=False)
    table5 = doc.add_table(rows=3, cols=3, style='Table Grid')
    t5_data = [
        ('触发条件', '操作', '逻辑解释'),
        ('|Z| < 1.0', '平掉全部持仓', '价差已回归均值，获利了结或止损出场'),
        ('|Z| > 2.0', '平掉全部持仓', '价差异常扩大，风险超出容忍范围，强制止损'),
    ]
    for i, row in enumerate(t5_data):
        for j, val in enumerate(row):
            table5.rows[i].cells[j].text = val
    add_table_header(table5, 0, t5_data[0], bg_color="1F4E79")
    format_table(table5)

    doc.add_paragraph()

    add_body_para(doc,
        '值得特别关注的是，策略在两个方向上均采用了对称的阈值设计（±1.0和±2.0），这背后隐含了残差分布近似对称的假设。如果实际的残差分布呈现明显的偏态'
        '或厚尾特征，对称阈值可能不是最优选择——这为后续优化留下了空间。'
    )

    # 2.4
    add_heading_styled(doc, '2.4  合约月份识别机制', 2)
    add_body_para(doc,
        '策略中的 get_current_month_future() 和 get_next_month_future() 两个函数负责准确识别当月和次月的期货合约代码。其核心逻辑基于中国金融期货交易所'
        '的交割规则：每个合约月的最后交易日为该月的第三个星期五。策略通过 datetime 模块计算当前日期所在月份的第三个星期五，并据此判断应交易的合约月份。'
    )
    add_body_para(doc,
        '这一机制对策略的实盘运行至关重要——如果合约代码识别错误，策略实际上交易的是错误月份之间的价差，整个协整关系的前提将不复存在，套利逻辑彻底瓦解。'
        '策略还充分考虑了节假日导致的连续停盘情况：当第三个星期五及其后续日期均非交易日时，仍以当月合约作为"当月"进行交割日前过渡期的处理。'
    )

    # ==============================================
    # 第三章 盈利逻辑分析
    # ==============================================
    add_heading_styled(doc, '第三章  盈利逻辑分析', 1)

    add_heading_styled(doc, '3.1  协整关系与均值回复', 2)
    add_body_para(doc,
        '策略盈利的第一性原理是协整理论所保证的均值回复性（Mean Reversion）。在统计学意义上，"两个I(1)序列的线性组合是I(0)"意味着：无论当月合约和次月合约'
        '各自的价格随机漂流到何种水平，它们之间的对数价格比值（即价差）始终在一个有界区间内波动，存在长期的引力中心。'
    )
    add_body_para(doc,
        '这种引力中心的来源是基本面因素——两个合约都代表对同一标的指数（沪深300）在未来不同时间点的交割义务，因此二者的价格比值本质上由无风险利率和股息率决定'
        '的持有成本模型所锚定。套利者的持续存在本身也是维持这一关系的市场微观结构力量：一旦价差偏离过大，套利行为将产生反向压力，推动价差回归。'
    )
    add_body_para(doc,
        '从博弈论视角看，该策略实际上是在与市场中非理性交易者（噪音交易者）进行交易：当噪音交易者的买卖行为将两个合约的价差暂时推向极端时，理性的统计套利者'
        '扮演了市场"纠偏者"的角色，通过反向操作获取流动性溢价。'
    )

    add_heading_styled(doc, '3.2  市场中性的收益结构', 2)
    add_body_para(doc,
        '策略的收益结构与传统的趋势跟踪策略有着本质区别。它不押注于沪深300指数的涨跌方向，而是通过精确匹配多头和空头的市值暴露（Dollar-Neutral），'
        '将组合的Beta（市场系统性风险）对冲至接近零的水平。其收益的数学分解如下：'
    )
    add_formula(doc, 'R_portfolio = (α + β_market · R_market) − (α + β_market · R_market) + R_spread = R_spread')
    add_body_para(doc,
        '由于两个合约高度正相关（均跟踪沪深300指数），多空组合自然消除了市场方向性波动对净值的影响，策略净值的驱动因素唯一地归结为价差的变化路径：'
        '只要价差在开仓后向均值方向回归（收敛），策略就盈利；如果价差继续扩大（发散），策略就亏损。'
    )

    add_heading_styled(doc, '3.3  具体的盈利路径推演', 2)

    add_heading_styled(doc, '3.3.1  情景一：次月高估', 3)
    add_body_para(doc,
        '当 Z > 1.0 时，意味着次月合约相对于当月合约被高估（即次月价格"偏高"）。策略操作：做多当月合约 + 做空次月合约。在价差回归的过程中：'
    )
    add_body_para(doc,
        '（1）当月合约相对走强（价格上升）→多头盈利；'
        '（2）次月合约相对走弱（价格下降）→空头盈利；'
        '（3）即使市场整体下跌，只要当月合约下跌幅度小于次月合约，组合仍然盈利（因为空头盈利大于多头亏损）。'
    )

    add_heading_styled(doc, '3.3.2  情景二：次月低估', 3)
    add_body_para(doc,
        '当 Z < −1.0 时，意味着次月合约相对于当月合约被低估。策略操作：做空当月合约 + 做多次月合约。在价差回归的过程中：'
    )
    add_body_para(doc,
        '（1）当月合约相对走弱（价格下降）→空头盈利；'
        '（2）次月合约相对走强（价格上升）→多头盈利；'
        '（3）即使市场整体上涨，只要当月合约上涨幅度小于次月合约，组合仍然盈利。'
    )

    add_heading_styled(doc, '3.4  交易频次与资金周转', 2)
    add_body_para(doc,
        '策略采用分钟级别的滚动判断，在Z-Score触及阈值的第一时间执行交易。由于期货市场价差的均值回复通常在短时间内完成（从几分钟到几小时不等），'
        '策略的资金利用率较高。但由于引入了 g.count_1 / g.count_2 标志位（禁止在已持仓的情况下加仓），策略的日内开仓次数受到严格限制，每对信号最多开仓一次。'
        '这种设计虽然放弃了部分收益增厚的机会，但也有效防止了策略在价差持续扩大的不利情形中不断加仓导致风险暴露失控。'
    )

    # 表6
    add_body_para(doc, '表6  盈亏情景汇总表', bold=True, indent=False)
    table6 = doc.add_table(rows=5, cols=4, style='Table Grid')
    t6_data = [
        ('情景', '开仓状态', '价差变化', '盈亏结果'),
        ('次月高估回归', '多当月 / 空次月', '价差收敛', '盈利'),
        ('次月高估发散', '多当月 / 空次月', '价差扩大', '亏损（触发|Z|>2止损）'),
        ('次月低估回归', '空当月 / 多次月', '价差收敛', '盈利'),
        ('次月低估发散', '空当月 / 多次月', '价差扩大', '亏损（触发|Z|>2止损）'),
    ]
    for i, row in enumerate(t6_data):
        for j, val in enumerate(row):
            table6.rows[i].cells[j].text = val
    add_table_header(table6, 0, t6_data[0], bg_color="1F4E79")
    format_table(table6)
    doc.add_paragraph()

    # ==============================================
    # 第四章 策略优点
    # ==============================================
    add_heading_styled(doc, '第四章  策略优点', 1)

    add_heading_styled(doc, '4.1  严格的市场中性特征', 2)
    add_body_para(doc,
        '如前所述，策略通过精确匹配多空市值，将投资组合的Beta（系统性风险暴露）对冲至接近零的水平。这意味着策略的净值曲线不会跟随沪深300指数的牛熊波动而'
        '大幅起伏，适合作为绝对收益型产品的策略组件。在大盘暴跌期间（如2015年股灾），趋势跟踪和纯多头策略遭受重创时，市场中性套利策略往往能保持相对稳健的表现。'
    )

    add_heading_styled(doc, '4.2  坚实的统计学基础', 2)
    add_body_para(doc,
        '与许多仅依赖技术指标"金叉死叉"的交易策略不同，本策略的每一个交易决策都有严格的统计学依据。OLS回归提供变量间长期均衡关系的量化模型，ADF检验给出'
        '"均值回复性是否真实存在"的严格判断，Z-Score将偏离程度映射为标准概率空间下的决策阈值。这种建立在计量经济学基石之上的策略方法论，'
        '赋予了策略较强的理论基础和可解释性。'
    )

    add_heading_styled(doc, '4.3  多层风险过滤', 2)
    add_body_para(doc,
        '策略设计了多重风险控制机制，形成了纵深防御：第一层——协整检验不通过则完全不参与交易（ADF p-value < 0.01）；第二层——偏离幅度不够大不入场'
        '（|Z| < 1.0 时按兵不动）；第三层——极端偏离时强制止损（|Z| > 2.0 时立即平仓）；第四层——仓位手数受成交量、保证金和每日开仓上限五重约束；'
        '第五层——在14:59之后的尾盘时段不开新仓，避免隔夜跳空风险。'
    )

    add_heading_styled(doc, '4.4  良好的程序化实现', 2)
    add_body_para(doc,
        '策略代码结构清晰、注释完整、模块化程度高。设置参数、设置中间变量、设置回测条件在 initialize() 中分层调用；手续费和保证金根据监管政策的历史变更'
        '分段处理；合约月份识别逻辑独立封装为两个纯函数。这些工程实践特点使得策略的可维护性和可扩展性较高。'
    )

    add_heading_styled(doc, '4.5  策略可扩展性强', 2)
    add_body_para(doc,
        '虽然当前策略仅交易沪深300股指期货（IF），但核心算法框架完全适用于中证500股指期货（IC）和上证50股指期货（IH），仅需修改传入的 symbol 参数即可。'
        '此外，回归窗口长度、Z-Score阈值、ADF显著性水平等关键参数均为可调节变量，便于针对不同品种和市场环境进行个性化调优。'
    )

    # ==============================================
    # 第五章 策略缺点与风险
    # ==============================================
    add_heading_styled(doc, '第五章  策略缺点与风险', 1)

    add_heading_styled(doc, '5.1  协整关系破灭的尾部风险', 2)
    add_body_para(doc,
        '策略盈利的全部前提是"价差平稳且会均值回复"。然而，协整关系并非物理定律——它在统计意义上成立，不代表未来必然延续。当市场发生结构性变化（如交易规则'
        '变更、成分股大规模调整、宏观经济政策突变、极端流动性危机），两个合约之间的长期均衡关系可能突然瓦解。此时，Z-Score可能持续单向发散至远超2.0的水平，'
        '策略将一次又一次地被止损出局，遭受连续亏损。这正是统计套利策略最为致命的风险——"尾部事件中协整关系崩溃"。'
    )

    add_heading_styled(doc, '5.2  潜在的未来函数问题', 2)
    add_body_para(doc,
        '在代码的 rebalance() 函数中，策略使用 get_price() 获取"当前分钟"的成交量数据来计算可交易手数。然而，在真实的回测或实盘环境中，'
        '当前分钟的K线在各个时刻的收盘价、成交量都是随着时间变化。如果回测引擎在分钟开始时（即分钟数据尚未实际产生完毕时）就返回了该分钟的完整成交量数据，'
        '则产生了"未来函数"偏差——策略利用到了当时不可知的信息。这将导致回测收益率系统性高估，实盘表现劣于回测表现。'
    )

    add_heading_styled(doc, '5.3  参数固化的适应性风险', 2)
    add_body_para(doc,
        '策略的三个核心参数——回归窗口（240分钟）、ADF显著性阈值（0.01）、Z-Score开平仓阈值（±1.0 / ±2.0）——均设置为固定常量。然而，市场的波动率'
        '环境、微观结构特征以及投资者结构都随时间不断变迁。固定参数在回测区间内表现良好，可能恰恰是其在该特定历史样本上"过拟合"的结果。'
        '当市场进入新的波动率区间时（例如从低波动切换至高波动），原有的Z-Score阈值可能过于狭窄或过于宽松，导致过度交易或错失机会。'
    )

    add_heading_styled(doc, '5.4  流动性风险', 2)
    add_body_para(doc,
        '策略通过成交量的十分之一来约束单笔交易规模（volume / 10），但这一规则隐含了"剩余90%的流动性可由其他市场参与者提供"的假设。在市场极端波动、'
        '流动性急遽枯竭的情形下（如2015年股灾），即使策略发出的订单规模小于市场成交量的十分之一，也可能因对手盘不足而无法成交，或需承受巨大的滑点成本。'
        '此外，2015年9月之后中金所将股指期货每日开仓限制为10手（策略中设为5手），进一步压缩了策略的资金容量和收益空间。'
    )

    add_heading_styled(doc, '5.5  单品种集中度风险', 2)
    add_body_para(doc,
        '策略仅交易沪深300股指期货（IF）一个品种。尽管策略本身是市场中性，但品种集中度风险不容忽视：如果IF合约出现异常波动（如交割日效应、成分股突发事件、'
        '交易所临时调整保证金规则等），策略没有任何跨品种分散保护，全部资金将同时受到影响。'
    )

    # ==============================================
    # 第六章 改进建议
    # ==============================================
    add_heading_styled(doc, '第六章  策略改进与优化方向', 1)

    add_heading_styled(doc, '6.1  引入自适应参数机制', 2)
    add_body_para(doc,
        '将固定的回归窗口（240分钟）改造为基于市场波动率动态调整的自适应窗口。例如，当市场处于高波动状态时，使用更长的窗口以降低噪声干扰；在低波动状态下，'
        '缩短窗口以提高对短期结构变化的响应速度。同样，Z-Score的开平仓阈值可以根据残差分布的历史滚动分位数进行动态标定，而非固守 ±1.0 / ±2.0 的固定值。'
    )

    add_heading_styled(doc, '6.2  多品种分散化', 2)
    add_body_para(doc,
        '将策略框架同时应用于IF（沪深300）、IC（中证500）、IH（上证50）三个品种，形成跨品种的套利组合。由于三个品种的成分股结构差异较大，'
        '它们各自的跨期价差时间序列之间相关性有限，组合后的夏普比率和最大回撤有望显著改善。'
    )

    add_heading_styled(doc, '6.3  引入卡尔曼滤波替代固定参数OLS', 2)
    add_body_para(doc,
        '当前OLS回归在每次滚动时使用的是等权重的过去240分钟数据，这意味着所有历史观测值的重要性被认为是等同的。卡尔曼滤波（Kalman Filter）允许模型的'
        '回归系数（α 和 β）随时间平滑演变，通过状态方程和观测方程的联合估计，对新近数据的敏感度高于远期数据。这在市场结构缓慢漂移的情境中能够更精准地'
        '捕捉时变协整关系，减少因参数惰性导致的信号失真。'
    )

    add_heading_styled(doc, '6.4  增加半群效应与波动率过滤器', 2)
    add_body_para(doc,
        '在ADF检验之外，可以增加辅助过滤器以进一步提高信号质量：如波动率过滤器（在VIX或ATR异常飙升时暂停交易，规避恐慌性价差异常发散）、'
        '成交量异常检测（在交易量突增或突降时调整仓位规模）、持仓时间限制（若持仓超过一定时间仍未回归，主动平仓以避免"僵尸仓位"）。'
    )

    add_heading_styled(doc, '6.5  加强回测稳健性', 2)
    add_body_para(doc,
        '为排除未来函数和数据窥探偏差，建议在回测框架中增加以下检查：使用延迟一秒或下一根K线的收盘价和成交量数据替代"当前分钟"数据；在样本外数据'
        '（回测区间之后的数据）上进行至少12个月的验证；将固定参数在合理范围内随机扰动，观察策略净值曲线的敏感程度（参数敏感性分析）。'
    )

    # ==============================================
    # 第七章 总结
    # ==============================================
    add_heading_styled(doc, '第七章  总结与展望', 1)

    add_body_para(doc,
        '本文对聚宽量化课堂的股指期货跨期套利策略进行了系统性的深度分析。策略以OLS回归建立当月与次月合约的协整方程，以ADF检验验证均值回复性，'
        '以Z-Score标准化残差作为交易信号，构建了一套逻辑闭环完整、统计学基础扎实的统计套利交易系统。其核心理念——利用协整关系的均值回复特性，在价差偏离'
        '均衡水平时建仓、在回归时获利了结——是量化交易领域最为经典和持久有效的策略范式之一。'
    )
    add_body_para(doc,
        '策略的优势在于市场中性特征、坚实的计量经济学基础、多层风险过滤机制以及良好的代码工程化水平。同时，策略也面临协整关系破灭的尾部风险、未来函数嫌疑、'
        '参数固化导致的适应性不足、流动性风险以及单品种集中度风险等问题。文中提出的自适应参数、多品种分散、卡尔曼滤波等改进方向，为策略的进一步优化提供了'
        '清晰的路线图。'
    )
    add_body_para(doc,
        '总体而言，该策略是一份质量较高的量化交易学习范本，其核心方法论在当前的期货市场中仍然具有实战价值和学术参考意义。对于希望在统计套利领域构建自己'
        '交易系统的量化从业者而言，深入理解并改进这一经典策略，将是一次极具价值的学习实践。'
    )

    doc.add_paragraph()
    doc.add_paragraph()

    # 结尾线
    end_para = doc.add_paragraph()
    end_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    end_run = end_para.add_run('━' * 40)
    end_run.font.color.rgb = RGBColor(31, 78, 121)
    end_run.font.size = Pt(10)

    add_body_para(doc, '（报告完）', indent=False)

    # ── 保存 ──
    output_path = r'c:\Users\id_30\ai-stock-platform.backup-2026-06-12\股指期货跨期套利策略深度分析报告.docx'
    doc.save(output_path)
    print(f'Report saved: {output_path}')
    return output_path


if __name__ == '__main__':
    build_report()
