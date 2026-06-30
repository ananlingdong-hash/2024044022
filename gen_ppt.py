from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Colors
DARK_BG = RGBColor(0x0A, 0x0E, 0x1A)
CARD_BG = RGBColor(0x14, 0x1A, 0x2E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GOLD = RGBColor(0xF0, 0xC0, 0x40)
BLUE = RGBColor(0x4A, 0x7C, 0xF7)
PURPLE = RGBColor(0x8B, 0x5C, 0xF6)
TEAL = RGBColor(0x2D, 0xD4, 0xBF)
RED = RGBColor(0xF8, 0x71, 0x71)
GRAY = RGBColor(0x9C, 0xA3, 0xAF)
DARK_GRAY = RGBColor(0x6B, 0x72, 0x80)
ORANGE = RGBColor(0xFB, 0x92, 0x3C)

def add_slide():
    layout = prs.slide_layouts[6]  # blank
    slide = prs.slides.add_slide(layout)
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = DARK_BG
    return slide

def add_rect(slide, left, top, width, height, fill_color=CARD_BG, border=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border:
        shape.line.color.rgb = border
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    shape.shadow.inherit = False
    return shape

def add_text_box(slide, left, top, width, height, text, font_size=18, color=WHITE, bold=False, alignment=PP_ALIGN.LEFT, font_name='Microsoft YaHei'):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    return txBox

def add_multiline(slide, left, top, width, height, lines, font_name='Microsoft YaHei'):
    """lines is list of (text, font_size, color, bold, alignment)"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, line_data in enumerate(lines):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        text, fs, color, bold, align = line_data
        p.text = text
        p.font.size = Pt(fs)
        p.font.color.rgb = color
        p.font.bold = bold
        p.font.name = font_name
        p.alignment = align
        p.space_after = Pt(4)
    return txBox

def add_card(slide, left, top, width, height, title, value, title_color=GOLD):
    add_rect(slide, left, top, width, height)
    add_text_box(slide, left, top + Inches(0.15), width, Inches(0.5), value,
                 36, WHITE, True, PP_ALIGN.CENTER)
    add_text_box(slide, left, top + height - Inches(0.5), width, Inches(0.4), title,
                 12, title_color, False, PP_ALIGN.CENTER)

def add_bottom_bar(slide, text):
    add_text_box(slide, Inches(0.5), Inches(7.0), Inches(12), Inches(0.4), text,
                 10, DARK_GRAY, False, PP_ALIGN.CENTER)

# ============================================================
# SLIDE 1: Cover
# ============================================================
s = add_slide()
add_text_box(s, Inches(1), Inches(1.5), Inches(11), Inches(1.2),
             '深圳大学', 72, WHITE, True, PP_ALIGN.CENTER)
add_text_box(s, Inches(1), Inches(2.8), Inches(11), Inches(0.8),
             '优势与劣势 · 深度分析', 32, GOLD, False, PP_ALIGN.CENTER)
# Decorative line
line = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.5), Inches(3.8), Inches(2.3), Pt(3))
line.fill.solid()
line.fill.fore_color.rgb = GOLD
line.line.fill.background()
add_text_box(s, Inches(1), Inches(4.2), Inches(11), Inches(0.6),
             'SHENZHEN UNIVERSITY', 18, DARK_GRAY, False, PP_ALIGN.CENTER, 'Arial')
add_text_box(s, Inches(1), Inches(5.2), Inches(11), Inches(0.5),
             '一座城市 · 一所大学 · 一种速度', 16, GRAY, False, PP_ALIGN.CENTER)

# ============================================================
# SLIDE 2: School Overview
# ============================================================
s = add_slide()
add_text_box(s, Inches(0.8), Inches(0.4), Inches(11), Inches(0.6),
             '学校概览', 36, WHITE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(1.0), Inches(11), Inches(0.4),
             '深圳大学于1983年经国务院批准创办，伴随深圳经济特区共同成长，已发展为学科门类齐全的综合性大学', 14, GRAY, False, PP_ALIGN.LEFT)

cards = [
    ('建校年份', '1983'), ('在校生', '45,000+'), ('ESI前1%', '14个'),
    ('本科专业', '103个'), ('博士后站', '27个'), ('一级硕点', '39个'),
    ('专任教师', '3,000+'), ('校园面积', '2.72km²')
]
for i, (title, val) in enumerate(cards):
    col = i % 4
    row = i // 4
    add_card(s, Inches(0.8 + col * 3.1), Inches(1.8 + row * 2.3), Inches(2.8), Inches(1.8), title, val)

# Tags
add_text_box(s, Inches(0.8), Inches(6.3), Inches(11), Inches(0.5),
             '🌊 特区大学    ⚡ 窗口大学    🌐 实验大学    🤖 创新创业    🏙️ 大湾区核心',
             13, BLUE, False, PP_ALIGN.LEFT)
add_bottom_bar(s, '2 / 11')

# ============================================================
# SLIDE 3: Advantage - Location
# ============================================================
s = add_slide()
add_text_box(s, Inches(0.8), Inches(0.3), Inches(2), Inches(0.4),
             '核心优势 01', 13, BLUE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(0.9), Inches(11), Inches(0.8),
             '📍 被科技巨头包围的大学', 40, WHITE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(1.8), Inches(11), Inches(0.5),
             '坐落于粤港澳大湾区核心引擎城市，周边环绕世界级科技企业，形成独特的产学研生态', 16, GRAY, False, PP_ALIGN.LEFT)

add_card(s, Inches(0.8), Inches(2.8), Inches(2.8), Inches(1.6), '距腾讯总部', '1.5 km', BLUE)
add_card(s, Inches(4.0), Inches(2.8), Inches(2.8), Inches(1.6), '距深圳科技园', '3 km', BLUE)
add_card(s, Inches(7.2), Inches(2.8), Inches(2.8), Inches(1.6), '到前海自贸区', '15 min', BLUE)
add_card(s, Inches(10.4), Inches(2.8), Inches(2.5), Inches(1.6), '直达香港', '30 min', BLUE)

# Company tags
add_rect(s, Inches(0.8), Inches(4.9), Inches(2.2), Inches(0.5), RGBColor(0x1A, 0x25, 0x3A), BLUE)
add_text_box(s, Inches(0.8), Inches(4.9), Inches(2.2), Inches(0.5), '🐧 腾讯', 13, BLUE, True, PP_ALIGN.CENTER)
add_rect(s, Inches(3.3), Inches(4.9), Inches(2.2), Inches(0.5), RGBColor(0x1A, 0x25, 0x3A), BLUE)
add_text_box(s, Inches(3.3), Inches(4.9), Inches(2.2), Inches(0.5), '📱 华为', 13, BLUE, True, PP_ALIGN.CENTER)
add_rect(s, Inches(5.8), Inches(4.9), Inches(2.2), Inches(0.5), RGBColor(0x1A, 0x25, 0x3A), BLUE)
add_text_box(s, Inches(5.8), Inches(4.9), Inches(2.2), Inches(0.5), '🔋 比亚迪', 13, BLUE, True, PP_ALIGN.CENTER)
add_rect(s, Inches(8.3), Inches(4.9), Inches(2.2), Inches(0.5), RGBColor(0x1A, 0x25, 0x3A), BLUE)
add_text_box(s, Inches(8.3), Inches(4.9), Inches(2.2), Inches(0.5), '🎮 大疆', 13, BLUE, True, PP_ALIGN.CENTER)
add_rect(s, Inches(10.8), Inches(4.9), Inches(2.0), Inches(0.5), RGBColor(0x1A, 0x25, 0x3A), BLUE)
add_text_box(s, Inches(10.8), Inches(4.9), Inches(2.0), Inches(0.5), '📦 顺丰', 13, BLUE, True, PP_ALIGN.CENTER)

add_text_box(s, Inches(0.8), Inches(5.8), Inches(11), Inches(0.5),
             '"没有围墙的大学，被科技企业包围的创新生态系统"', 14, GRAY, False, PP_ALIGN.CENTER)
add_bottom_bar(s, '3 / 11')

# ============================================================
# SLIDE 4: Advantage - Academic
# ============================================================
s = add_slide()
add_text_box(s, Inches(0.8), Inches(0.3), Inches(2), Inches(0.4),
             '核心优势 02', 13, BLUE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(0.9), Inches(11), Inches(0.8),
             '📊 14个学科打入全球前1%', 40, WHITE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(1.8), Inches(11), Inches(0.4),
             '近年来学科实力快速攀升，多学科进入国际高水平行列', 15, GRAY, False, PP_ALIGN.LEFT)

add_card(s, Inches(0.8), Inches(2.5), Inches(2.8), Inches(1.6), 'ESI全球前1%', '14个', BLUE)
add_card(s, Inches(4.0), Inches(2.5), Inches(2.8), Inches(1.6), 'ESI全球前1‰', '4个', PURPLE)
add_card(s, Inches(7.2), Inches(2.5), Inches(2.8), Inches(1.6), '国家一流本科', '12个', TEAL)
add_card(s, Inches(10.4), Inches(2.5), Inches(2.5), Inches(1.6), 'THE世界排名', 'Top 200', ORANGE)

# Bar chart - simplified with shapes
bars = [('计算机科学', 0.92, BLUE), ('光学工程', 0.90, PURPLE),
        ('材料科学', 0.85, TEAL), ('工程学', 0.82, ORANGE)]
for i, (name, pct, color) in enumerate(bars):
    y = Inches(4.6 + i * 0.6)
    add_text_box(s, Inches(0.8), y, Inches(1.6), Inches(0.4), name, 13, GRAY, False, PP_ALIGN.RIGHT)
    # Track
    track = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.6), y + Inches(0.08), Inches(8), Inches(0.25))
    track.fill.solid(); track.fill.fore_color.rgb = RGBColor(0x1E, 0x28, 0x3D); track.line.fill.background()
    # Fill
    bar = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.6), y + Inches(0.08), Inches(8 * pct), Inches(0.25))
    bar.fill.solid(); bar.fill.fore_color.rgb = color; bar.line.fill.background()
    # Value label
    label = 'A+' if pct >= 0.9 else ('A' if pct >= 0.85 else 'A-')
    add_text_box(s, Inches(10.8), y, Inches(1.5), Inches(0.4), label, 14, color, True, PP_ALIGN.LEFT)

add_bottom_bar(s, '4 / 11')

# ============================================================
# SLIDE 5: Advantage - Employment
# ============================================================
s = add_slide()
add_text_box(s, Inches(0.8), Inches(0.3), Inches(2), Inches(0.4),
             '核心优势 03', 13, BLUE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(0.9), Inches(11), Inches(0.8),
             '🚀 应届薪资超越半数985', 40, WHITE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(1.8), Inches(11), Inches(0.4),
             '深大毕业生在粤港澳大湾区具有极强就业竞争力，创业氛围浓厚', 15, GRAY, False, PP_ALIGN.LEFT)

add_card(s, Inches(0.8), Inches(2.5), Inches(2.8), Inches(1.6), '深大平均起薪', '¥12,500', GOLD)
add_card(s, Inches(4.0), Inches(2.5), Inches(2.8), Inches(1.6), '985 平均', '¥10,800', BLUE)
add_card(s, Inches(7.2), Inches(2.5), Inches(2.8), Inches(1.6), '211 平均', '¥9,500', PURPLE)
add_card(s, Inches(10.4), Inches(2.5), Inches(2.5), Inches(1.6), '全国平均', '¥8,000', DARK_GRAY)

add_card(s, Inches(0.8), Inches(4.5), Inches(2.8), Inches(1.6), '就业率', '92%+', TEAL)
add_card(s, Inches(4.0), Inches(4.5), Inches(2.8), Inches(1.6), '创业率', '5.2%', ORANGE)
add_card(s, Inches(7.2), Inches(4.5), Inches(2.8), Inches(1.6), '校友企业', '300+', BLUE)
add_card(s, Inches(10.4), Inches(4.5), Inches(2.5), Inches(1.6), '创投基金', '50亿+', GOLD)

add_text_box(s, Inches(0.8), Inches(6.5), Inches(11), Inches(0.4),
             '数据来源: 2025年各校就业质量报告', 11, DARK_GRAY, False, PP_ALIGN.CENTER)
add_bottom_bar(s, '5 / 11')

# ============================================================
# SLIDE 6: Disadvantage - History
# ============================================================
s = add_slide()
add_text_box(s, Inches(0.8), Inches(0.3), Inches(2), Inches(0.4),
             '主要劣势 01', 13, RED, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(0.9), Inches(11), Inches(0.8),
             '⏳ 40年 vs 百年 — 时间的差距', 40, WHITE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(1.8), Inches(11), Inches(0.4),
             '1983年建校，仅40余年历史，学术传承与文化底蕴尚显不足', 15, GRAY, False, PP_ALIGN.LEFT)

bars_data = [('北京大学', 126, RED), ('浙江大学', 115, RED), ('清华大学', 114, RED),
             ('复旦大学', 110, RED), ('深圳大学', 40, GOLD)]
for i, (name, years, color) in enumerate(bars_data):
    y = Inches(2.5 + i * 0.85)
    add_text_box(s, Inches(0.8), y + Inches(0.1), Inches(1.8), Inches(0.5), name, 16, GRAY if name != '深圳大学' else GOLD,
                 True if name == '深圳大学' else False, PP_ALIGN.RIGHT)
    max_w = 10.0
    pct = years / 126
    bar = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.8), y + Inches(0.1), Inches(max_w * pct), Inches(0.45))
    bar.fill.solid(); bar.fill.fore_color.rgb = color; bar.line.fill.background()
    add_text_box(s, Inches(3.0 + max_w * pct), y + Inches(0.05), Inches(2), Inches(0.5),
                 f'{years}年', 16, color, True, PP_ALIGN.LEFT)

add_text_box(s, Inches(0.8), Inches(6.5), Inches(11), Inches(0.4),
             '学术积淀 · 校友网络 · 文化传统 — 都需要时间', 14, GRAY, False, PP_ALIGN.CENTER)
add_bottom_bar(s, '6 / 11')

# ============================================================
# SLIDE 7: Disadvantage - Ranking
# ============================================================
s = add_slide()
add_text_box(s, Inches(0.8), Inches(0.3), Inches(2), Inches(0.4),
             '主要劣势 02', 13, RED, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(0.9), Inches(11), Inches(0.8),
             '🏅 全国第28名 — 够不够？', 40, WHITE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(1.8), Inches(11), Inches(0.4),
             '虽近年排名飞速上升，但与C9及老牌985仍有较大差距', 15, GRAY, False, PP_ALIGN.LEFT)

ranking = [('清华大学', 1, BLUE), ('北京大学', 2, BLUE), ('复旦大学', 6, PURPLE),
           ('中山大学', 12, TEAL), ('深圳大学', 28, GOLD), ('暨南大学', 45, DARK_GRAY)]
for i, (name, rank, color) in enumerate(ranking):
    y = Inches(2.5 + i * 0.75)
    is_h = (name == '深圳大学')
    add_text_box(s, Inches(0.8), y + Inches(0.05), Inches(2.0), Inches(0.5), name, 16, color if is_h else GRAY,
                 True, PP_ALIGN.RIGHT)
    max_w = 8.0
    pct = 1 - (rank / 50)  # higher rank = longer bar
    bar = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.0), y + Inches(0.08), Inches(max_w * pct), Inches(0.35))
    bar.fill.solid(); bar.fill.fore_color.rgb = color; bar.line.fill.background()
    add_text_box(s, Inches(3.2 + max_w * pct), y + Inches(0.02), Inches(1.5), Inches(0.5),
                 f'#{rank}', 18, color, True, PP_ALIGN.LEFT)

add_bottom_bar(s, '7 / 11')

# ============================================================
# SLIDE 8: Disadvantage - Imbalance
# ============================================================
s = add_slide()
add_text_box(s, Inches(0.8), Inches(0.3), Inches(2), Inches(0.4),
             '主要劣势 03', 13, RED, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(0.9), Inches(11), Inches(0.8),
             '⚖️ 工科A+ — 文科呢？', 40, WHITE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(1.8), Inches(11), Inches(0.4),
             '深大工科商科发展迅速，但人文社科与基础理学相对薄弱', 15, GRAY, False, PP_ALIGN.LEFT)

# Strong side
add_rect(s, Inches(0.8), Inches(2.5), Inches(5.5), Inches(3.8), RGBColor(0x0D, 0x2B, 0x1A), TEAL)
add_text_box(s, Inches(0.8), Inches(2.6), Inches(5.5), Inches(0.5), '✅ 强势学科', 20, TEAL, True, PP_ALIGN.CENTER)
strong = [('计算机科学', 'A+'), ('光学工程', 'A'), ('材料科学', 'A-'), ('电子信息', 'B+'), ('土木工程', 'B+')]
for i, (name, grade) in enumerate(strong):
    y = Inches(3.3 + i * 0.55)
    add_text_box(s, Inches(1.2), y, Inches(3.5), Inches(0.4), name, 15, WHITE, False, PP_ALIGN.LEFT)
    add_text_box(s, Inches(4.8), y, Inches(1.2), Inches(0.4), grade, 15, TEAL, True, PP_ALIGN.RIGHT)

# Weak side
add_rect(s, Inches(6.8), Inches(2.5), Inches(5.5), Inches(3.8), RGBColor(0x2B, 0x0D, 0x0D), RED)
add_text_box(s, Inches(6.8), Inches(2.6), Inches(5.5), Inches(0.5), '⚠️ 薄弱学科', 20, RED, True, PP_ALIGN.CENTER)
weak = [('哲学', 'C+'), ('历史学', 'C'), ('法学', 'C+'), ('社会学', 'C'), ('政治学', 'C-')]
for i, (name, grade) in enumerate(weak):
    y = Inches(3.3 + i * 0.55)
    add_text_box(s, Inches(7.2), y, Inches(3.5), Inches(0.4), name, 15, WHITE, False, PP_ALIGN.LEFT)
    add_text_box(s, Inches(10.8), y, Inches(1.2), Inches(0.4), grade, 15, RED, True, PP_ALIGN.RIGHT)

add_text_box(s, Inches(0.8), Inches(6.5), Inches(11), Inches(0.4),
             '工强文弱 — 学科发展严重不均衡', 14, GRAY, False, PP_ALIGN.CENTER)
add_bottom_bar(s, '8 / 11')

# ============================================================
# SLIDE 9: Opportunities & Challenges
# ============================================================
s = add_slide()
add_text_box(s, Inches(0.8), Inches(0.3), Inches(2), Inches(0.4),
             '机遇与挑战', 13, TEAL, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(0.9), Inches(11), Inches(0.8),
             '🔮 大湾区红利 vs 名校围剿', 40, WHITE, True, PP_ALIGN.LEFT)
add_text_box(s, Inches(0.8), Inches(1.8), Inches(11), Inches(0.4),
             '窗口期不等人 — 机遇与挑战并存的关键时刻', 15, GRAY, False, PP_ALIGN.LEFT)

# Opportunities
add_rect(s, Inches(0.8), Inches(2.5), Inches(5.5), Inches(3.5), RGBColor(0x0D, 0x2B, 0x1A), TEAL)
add_text_box(s, Inches(0.8), Inches(2.6), Inches(5.5), Inches(0.5), '📈 机遇', 22, TEAL, True, PP_ALIGN.CENTER)
opps = ['大湾区国家战略', '深圳GDP超香港', '科技企业持续扩张', '国际学术合作深化', '人才引进政策红利']
for i, text in enumerate(opps):
    add_text_box(s, Inches(1.5), Inches(3.3 + i * 0.5), Inches(4.5), Inches(0.4), f'✦ {text}', 14, WHITE, False, PP_ALIGN.LEFT)

# Challenges
add_rect(s, Inches(6.8), Inches(2.5), Inches(5.5), Inches(3.5), RGBColor(0x2B, 0x0D, 0x0D), RED)
add_text_box(s, Inches(6.8), Inches(2.6), Inches(5.5), Inches(0.5), '📉 挑战', 22, RED, True, PP_ALIGN.CENTER)
challs = ['港校北上办学竞争', '南科大快速崛起', '985名牌深圳办学', '生源质量争夺加剧', '学科建设追赶压力']
for i, text in enumerate(challs):
    add_text_box(s, Inches(7.5), Inches(3.3 + i * 0.5), Inches(4.5), Inches(0.4), f'▲ {text}', 14, WHITE, False, PP_ALIGN.LEFT)

add_bottom_bar(s, '9 / 11')

# ============================================================
# SLIDE 10: Motto
# ============================================================
s = add_slide()
add_text_box(s, Inches(1), Inches(1.5), Inches(11), Inches(1.5),
             '"', 96, GOLD, True, PP_ALIGN.CENTER)
add_text_box(s, Inches(1), Inches(2.8), Inches(11), Inches(1.0),
             '自立  自律  自强', 48, WHITE, True, PP_ALIGN.CENTER)
add_text_box(s, Inches(1), Inches(3.8), Inches(11), Inches(0.5),
             '— 深圳大学校训', 20, GRAY, False, PP_ALIGN.CENTER)
# Decorative line
line = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.5), Inches(4.6), Inches(2.3), Pt(3))
line.fill.solid(); line.fill.fore_color.rgb = GOLD; line.line.fill.background()
add_text_box(s, Inches(1), Inches(5.0), Inches(11), Inches(0.6),
             '没有百年积淀，但有深圳速度', 18, GRAY, False, PP_ALIGN.CENTER)
add_bottom_bar(s, '10 / 11')

# ============================================================
# SLIDE 11: Ending
# ============================================================
s = add_slide()
add_text_box(s, Inches(1), Inches(1.2), Inches(11), Inches(1.2),
             '深圳速度 · 未来可期', 54, WHITE, True, PP_ALIGN.CENTER)
add_text_box(s, Inches(1), Inches(2.5), Inches(11), Inches(0.5),
             '一所与城市共生长的大学', 20, GRAY, False, PP_ALIGN.CENTER)

# Key points
add_card(s, Inches(1.0), Inches(3.5), Inches(3.5), Inches(1.8), '最快', '上升速度', BLUE)
add_card(s, Inches(5.0), Inches(3.5), Inches(3.5), Inches(1.8), '最敢', '创新精神', PURPLE)
add_card(s, Inches(9.0), Inches(3.5), Inches(3.5), Inches(1.8), '最近', '产业距离', TEAL)

add_text_box(s, Inches(1), Inches(5.8), Inches(11), Inches(0.5),
             '在深圳，一切皆有可能', 18, GOLD, False, PP_ALIGN.CENTER)
add_text_box(s, Inches(1), Inches(6.3), Inches(11), Inches(0.5),
             'THANK YOU', 14, DARK_GRAY, False, PP_ALIGN.CENTER, 'Arial')
add_bottom_bar(s, '11 / 11')

# Save
output = r'C:\Users\id_30\Desktop\深圳大学codex.pptx'
prs.save(output)
print(f'Done: {output}')
print(f'Size: {os.path.getsize(output)} bytes')
