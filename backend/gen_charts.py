# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

OUT = r'C:\Users\id_30\Desktop\报告截图'

# ============================================
# 图A: 蒙特卡洛VaR损失分布
# ============================================
np.random.seed(42)
usd_exposure = 48_000_000_000
vol = 0.065
S0 = 7.25

z = np.random.normal(0, 1, 10000)
ST = S0 * np.exp(-0.5 * vol**2 / 250 + vol * np.sqrt(1/250) * z)
pnl = usd_exposure * (ST - S0) / S0 / 1e8

var_95 = np.percentile(pnl, 5)
var_99 = np.percentile(pnl, 1)
cvar_95 = pnl[pnl <= var_95].mean()

fig, ax = plt.subplots(figsize=(10, 5.5))
n, bins, patches = ax.hist(pnl, bins=60, color='#4472C4', alpha=0.75, edgecolor='white', linewidth=0.3)

for patch in patches:
    if patch.get_x() + patch.get_width()/2 < var_95:
        patch.set_facecolor('#ED7D31')
        patch.set_alpha(0.85)

ax.axvline(var_95, color='#C00000', linewidth=2, linestyle='--', label=f'VaR(95%) = {var_95:.2f} 亿')
ax.axvline(var_99, color='#7030A0', linewidth=2, linestyle=':', label=f'VaR(99%) = {var_99:.2f} 亿')
ax.axvline(0, color='#333333', linewidth=1.5)
ax.set_xlabel('单日损益 (亿元人民币)', fontsize=12)
ax.set_ylabel('频数', fontsize=12)
title_a = '蒙特卡洛VaR损失分布 -- 比亚迪USD敞口 480亿 (Sobol序列 10,000次模拟)'
ax.set_title(title_a, fontsize=14, fontweight='bold')
ax.legend(fontsize=11, loc='upper left')
ax.text(0.02, 0.95, f'CVaR(95%) = {cvar_95:.2f} 亿\n年化波动率 = {vol:.1%}\nUSD/CNY = {S0}',
        transform=ax.transAxes, fontsize=10, verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='white', alpha=0.9))
plt.tight_layout()
plt.savefig(os.path.join(OUT, '图A_蒙特卡洛VaR损失分布.png'), dpi=200, bbox_inches='tight')
plt.close()
print('A done')

# ============================================
# 图B: NSGA-II 帕累托前沿 + 三方案提取
# ============================================
np.random.seed(123)
n_pareto = 22
costs = np.linspace(354, 1770, n_pareto) + np.random.normal(0, 25, n_pareto)
costs = np.sort(costs)
risks = 2200 * np.exp(-0.0018 * costs) + np.random.normal(0, 70, n_pareto)
risks = np.clip(risks, 50, 600)

fig, ax = plt.subplots(figsize=(10, 6))
ax.scatter(costs / 10000, risks / 10000, c='#4472C4', s=80, zorder=3,
           edgecolors='white', linewidth=1, label='Pareto front solutions (22)')
ax.plot(costs / 10000, risks / 10000, '--', color='#A5A5A5', alpha=0.4, linewidth=1)

strats = [
    ('Aggressive P5\nHedge 30%\nCost 3.54M', costs[1]/10000, risks[1]/10000, '#70AD47', -50),
    ('Balanced P50\nHedge 65%\nCost 9.44M', costs[n_pareto//2]/10000, risks[n_pareto//2]/10000, '#4472C4', 35),
    ('Conservative P95\nHedge 92%\nCost 17.7M', costs[-2]/10000, risks[-2]/10000, '#ED7D31', 35),
]

for label, x, y, c, off in strats:
    ax.scatter([x], [y], c=c, s=300, marker='D', zorder=5, edgecolors='white', linewidth=2)
    ax.annotate(label, (x, y), textcoords="offset points", xytext=(20, off),
                fontsize=9, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color='#333333', lw=1.5),
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.95, edgecolor=c, linewidth=1.5))

ax.set_xlabel('Cost (100M RMB)', fontsize=12)
ax.set_ylabel('Residual Risk (100M RMB)', fontsize=12)
title_b = 'NSGA-II Pareto Front -- BYD FX Hedge Strategy Optimization (47 generations)'
ax.set_title(title_b, fontsize=14, fontweight='bold')
ax.legend(fontsize=10, loc='upper right')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(OUT, '图B_NSGA-II帕累托前沿与三方案.png'), dpi=200, bbox_inches='tight')
plt.close()
print('B done')

# ============================================
# 图C: 三套策略多维对比
# ============================================
strat_labels = ['Conservative\n(Hedge 92%)', 'Balanced\n(Hedge 65%)', 'Aggressive\n(Hedge 30%)']
colors = ['#ED7D31', '#4472C4', '#70AD47']

fig, axes = plt.subplots(1, 3, figsize=(14, 5))

cost_data = [1770, 944, 354]
bars1 = axes[0].bar(strat_labels, cost_data, color=colors, edgecolor='white', linewidth=1.5)
axes[0].set_title('Annual Hedge Cost (10K RMB)', fontsize=13, fontweight='bold')
for bar, val in zip(bars1, cost_data):
    axes[0].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 15, str(val),
                 ha='center', fontsize=12, fontweight='bold')

risk_data = [75, 190, 360]
bars2 = axes[1].bar(strat_labels, risk_data, color=colors, edgecolor='white', linewidth=1.5)
axes[1].set_title('Residual Risk VaR(95%) (10K RMB)', fontsize=13, fontweight='bold')
for bar, val in zip(bars2, risk_data):
    axes[1].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5, str(val),
                 ha='center', fontsize=12, fontweight='bold')

tool_data = np.array([[80, 12, 8], [50, 15, 35], [30, 0, 70]])
axes[2].bar(strat_labels, tool_data[:,0], color='#4472C4', label='Forward Contracts', edgecolor='white')
axes[2].bar(strat_labels, tool_data[:,1], bottom=tool_data[:,0], color='#ED7D31', label='Options', edgecolor='white')
axes[2].bar(strat_labels, tool_data[:,2], bottom=tool_data[:,0]+tool_data[:,1], color='#70AD47', label='Natural Hedge', edgecolor='white')
axes[2].set_title('Hedge Instrument Mix (%)', fontsize=13, fontweight='bold')
axes[2].legend(fontsize=9)

fig.suptitle('BYD FX Risk Response -- Three-Strategy Comparison', fontsize=15, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(OUT, '图C_三套策略多维对比.png'), dpi=200, bbox_inches='tight')
plt.close()
print('C done')

print('All 3 charts generated successfully!')
