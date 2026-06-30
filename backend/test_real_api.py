"""测试真实数据API"""
import json, urllib.request

# Test 1: Tencent stock API
url = 'https://qt.gtimg.cn/q=sz002594'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=5)
text = resp.read().decode('gbk')
parts = text.split('~')
price = float(parts[3])
prev = float(parts[4])
print('=== 腾讯行情API ===')
print(f'BYD 002594: {parts[1]}')
print(f'Price: {price}, Change: {price-prev:.2f} ({(price/prev-1)*100:.2f}%)')

# Test 2: East Money FX
url = 'https://push2.eastmoney.com/api/qt/stock/get?secid=133.USDCNH&fields=f43,f44,f57,f58'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=5)
data = json.loads(resp.read())
fx_price = data['data']['f43'] / 100
print(f'\n=== 东方财富外汇 ===')
print(f'USD/CNH: {fx_price}')

# Test 3: BYD K-line history
url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=0.002594&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57&klt=101&fqt=1&end=20500101&lmt=3'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=5)
data = json.loads(resp.read())
print(f'\n=== 东方财富K线 (BYD近3天) ===')
for line in data['data']['klines']:
    print(line)

print('\n✅ 所有真实数据API正常！')
