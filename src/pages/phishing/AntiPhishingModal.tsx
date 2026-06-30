import { useState } from "react"

interface AntiPhishingModalProps {
  open: boolean
  onClose: () => void
  scenario: string
  redFlags: { icon: string; title: string; detail: string }[]
  preventionTips: string[]
}

export function AntiPhishingModal({ open, onClose, scenario, redFlags, preventionTips }: AntiPhishingModalProps) {
  const [currentTip, setCurrentTip] = useState(0)

  if (!open) return null

  return (
    <div className="phish-modal-overlay" onClick={onClose}>
      <div className="phish-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phish-modal-header">
          <h2>你差点上当了</h2>
          <p className="phish-modal-subtitle">
            你刚刚输入的隐私信息如果真的提交，可能已被不法分子获取。<br />
            <strong>这只是一个反钓鱼安全意识教育页面——你的数据没有被保存。</strong>
          </p>
          <span className="phish-modal-badge">{scenario}</span>
        </div>

        <div className="phish-modal-section">
          <h3>你应该发现的疑点（Red Flags）</h3>
          <div className="phish-redflags">
            {redFlags.map((f, i) => (
              <div key={i} className="phish-redflag-item">
                <span className="phish-redflag-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="phish-modal-section">
          <h3>防钓鱼知识点</h3>
          <div className="phish-tips-carousel">
            <div className="phish-tip-card">
              <span className="phish-tip-number">{currentTip + 1} / {preventionTips.length}</span>
              <p>{preventionTips[currentTip]}</p>
            </div>
            <div className="phish-tips-nav">
              <button
                disabled={currentTip === 0}
                onClick={() => setCurrentTip((t) => t - 1)}
                className="phish-tip-btn"
              >
                上一条
              </button>
              <button
                disabled={currentTip === preventionTips.length - 1}
                onClick={() => setCurrentTip((t) => t + 1)}
                className="phish-tip-btn"
              >
                下一条
              </button>
            </div>
          </div>
        </div>

        <div className="phish-modal-section phish-prevention-box">
          <h3>通用防钓鱼守则</h3>
          <ul>
            <li><strong>核对域名：</strong>在输入任何敏感信息前，先看浏览器地址栏的域名是否为官方域名</li>
            <li><strong>不点来路不明的链接：</strong>邮件、短信、社交软件里的链接要格外警惕</li>
            <li><strong>官方渠道验证：</strong>收到「紧急通知」先通过学校官网、官方公众号核实</li>
            <li><strong>不轻易输入密码：</strong>被要求输入账号密码才能查看内容时，停下来想一想</li>
            <li><strong>注意 HTTPS：</strong>正规网站地址栏有锁标志（但钓鱼网站也可能有，不能只看这个）</li>
          </ul>
        </div>

        <button className="phish-modal-close" onClick={onClose}>
          我已了解，关闭
        </button>
      </div>
    </div>
  )
}
