import { useState } from "react"
import { AntiPhishingModal } from "./AntiPhishingModal"

/* ================================================================
   情景四：热门活动/讲座抢票 — 利用"好奇"与"稀缺性"
   红队线索（Red Flags）：
   1. 域名非 szu.edu.cn
   2. 没有 HTTPS
   3. "深圳大学"英文名拼写错误
   4. 要求填写支付密码
   5. 讲座日期在过去
   6. 联系邮箱非官方（gmail.com）
   7. footer 版权年份（2023）
   8. "Lectrue Hall" 拼写错误
=============================================================== */

const redFlags = [
  {
    icon: "1",
    title: "域名异常",
    detail: "浏览器地址栏显示的是「szu-lecture.cn」而非深圳大学官网「szu.edu.cn」。所有深圳大学官方活动都在 szu.edu.cn 域名下。钓鱼者常用含有「szu」的虚假域名混淆视听。",
  },
  {
    icon: "2",
    title: "支付密码要求",
    detail: "任何正规的讲座抢票都不需要你输入支付密码。这是钓鱼页面在尝试获取你的支付凭证，一旦输入，攻击者可以用它在其他平台尝试撞库。",
  },
  {
    icon: "3",
    title: "讲座日期已过",
    detail: "讲座通知显示的日期是 2024 年 3 月 15 日——早已过去。忙于抢票的人往往不会注意这个细节。",
  },
  {
    icon: "4",
    title: "细节拼写错误",
    detail: "页面上「Shenzhen」被拼成「Shen Zhen」、「Lecture Hall」写成「Lectrue Hall」、联系方式为 Gmail 邮箱而非官方邮箱——正规大学官网不会出现这种低级错误。",
  },
  {
    icon: "5",
    title: "稀缺性操纵",
    detail: "「仅剩 3 个名额」「已有 97 人报名」通常是虚假的统计数字，目的是制造焦虑让你来不及思考。正规活动会提供充足的报名时间窗口。",
  },
]

const preventionTips = [
  "看到「限时抢票」「最后 3 个名额」等紧迫性话术时，先冷静——这是最常见的钓鱼操纵手法之一。",
  "核实域名：深圳大学所有官方服务都在 szu.edu.cn 子域名下，不存在 szu-lecture.cn 这种独立域名。",
  "永远不要在任何抢票/报名页面输入支付密码或银行卡信息——这些信息只应在支付平台官方页面输入。",
  "查看活动主办方联系方式：如果是官方活动，联系邮箱一定是 @szu.edu.cn 结尾，不会用 Gmail / QQ 邮箱。",
  "用浏览器开发者工具（F12）检查表单提交的 action URL——它会告诉你数据实际发往哪里。",
  "遇到可疑链接，先在深圳大学官网或官方公众号搜索该活动，从官方入口进入。",
]

export function Scenario4() {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: "", studentId: "", phone: "", payPassword: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowModal(true)
  }

  return (
    <div className="phish-page phish-s4">
      <header className="s4-header">
        <div className="s4-header-top">
          <div className="s4-logo">
            <span className="s4-logo-cn">深圳大学</span>
            <span className="s4-logo-en">Shen Zhen University</span>
          </div>
          <nav className="s4-nav">
            <a href="#">学校概况</a>
            <a href="#">院系设置</a>
            <a href="#">教育教学</a>
            <a href="#">科学研究</a>
            <a href="#" className="active">校园活动</a>
            <a href="#">招生就业</a>
          </nav>
        </div>
        <div className="s4-url-bar">
          <span className="s4-fake-lock">&#128274;</span>
          <span className="s4-url-text">szu-lecture.cn / activities / vip-ticket</span>
        </div>
      </header>

      <div className="s4-banner">
        <div className="s4-banner-badge">学术讲座 · 限量报名</div>
        <h1>诺贝尔经济学奖得主 <strong>Prof. James Heckman</strong></h1>
        <p className="s4-banner-subtitle">中国经济发展与人力资本投资 —— 深圳大学荣誉讲座系列</p>
      </div>

      <div className="s4-main">
        <div className="s4-content">
          <div className="s4-info">
            <h2>讲座详情</h2>
            <div className="s4-info-grid">
              <div className="s4-info-item">
                <span className="s4-info-label">主讲人</span>
                <span className="s4-info-value">Prof. James J. Heckman</span>
              </div>
              <div className="s4-info-item">
                <span className="s4-info-label">时间</span>
                <span className="s4-info-value">2024年3月15日 14:00-16:00</span>
              </div>
              <div className="s4-info-item">
                <span className="s4-info-label">地点</span>
                <span className="s4-info-value">深圳大学粤海校区 · Lectrue Hall A301</span>
              </div>
              <div className="s4-info-item">
                <span className="s4-info-label">主办单位</span>
                <span className="s4-info-value">深圳大学经济学院</span>
              </div>
              <div className="s4-info-item">
                <span className="s4-info-label">联系邮箱</span>
                <span className="s4-info-value">szu-economics@gmail.com</span>
              </div>
            </div>
            <div className="s4-description">
              <p>本次讲座将探讨中国人力资本投资的前沿问题，包括教育回报率、技能形成与劳动力市场政策。Heckman 教授是微观计量经济学领域的权威学者，其研究成果对全球教育政策产生了深远影响。</p>
            </div>
          </div>

          <div className="s4-form-wrapper">
            <div className="s4-form-card">
              <div className="s4-availability">
                <div className="s4-availability-header">报名状态</div>
                <div className="s4-tickets-bar">
                  <div className="s4-tickets-fill" style={{ width: "4%" }} />
                </div>
                <span className="s4-availability-text">当前剩余名额：<strong>3</strong> / 总名额 100（已报名 <strong>97</strong> 人）</span>
              </div>

              <form className="s4-form" onSubmit={handleSubmit}>
                <h3>活动报名登记</h3>
                <div className="s4-field">
                  <label>姓名</label>
                  <input
                    type="text"
                    placeholder="请输入真实姓名"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="s4-field">
                  <label>学号</label>
                  <input
                    type="text"
                    placeholder="请输入学号"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
                <div className="s4-field">
                  <label>手机号</label>
                  <input
                    type="tel"
                    placeholder="用于接收报名确认通知"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="s4-field s4-field-danger">
                  <label>支付密码 <span className="s4-field-hint">（用于验证身份，本次不产生费用）</span></label>
                  <input
                    type="password"
                    placeholder="请输入支付密码"
                    required
                    value={formData.payPassword}
                    onChange={(e) => setFormData({ ...formData, payPassword: e.target.value })}
                  />
                </div>
                <button type="submit" className="s4-submit">
                  提交报名
                </button>
                <p className="s4-form-disclaimer">
                  点击「提交报名」即表示您同意<u>服务条款</u>和<u>隐私政策</u>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <footer className="s4-footer">
        <p>&copy; 2023 Shen Zhen University. All Rights Reserved.</p>
        <p className="s4-footer-links">
          <a href="#">关于我们</a>&nbsp;&middot;&nbsp;<a href="#">联系方式</a>&nbsp;&middot;&nbsp;<a href="#">版权声明</a>
        </p>
      </footer>

      <AntiPhishingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        scenario="情景四：热门活动/讲座抢票（利用好奇与稀缺性）"
        redFlags={redFlags}
        preventionTips={preventionTips}
      />
    </div>
  )
}
