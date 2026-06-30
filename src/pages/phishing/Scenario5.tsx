import { useState } from "react"
import { AntiPhishingModal } from "./AntiPhishingModal"

/* ================================================================
   情景五：校园与教务系统通知 — 利用"真实信息"
   红队线索（Red Flags）：
   1. 发件邮箱非官方（admin@szu-jwc.com）
   2. 链接文字与 href 不符
   3. "击点"而非"点击"——繁体残留
   4. 校徽占位符而非真实图片
   5. 要求输入密码以"验证身份"
   6. 联系电话为个人手机号
   7. ICP 备案号为编造
=============================================================== */

const redFlags = [
  {
    icon: "1",
    title: "发件邮箱域名可疑",
    detail: "邮件显示的发件人为 admin@szu-jwc.com，而深圳大学教务部官方邮箱域名为 szu.edu.cn。正规教务通知一定使用学校官方邮箱。",
  },
  {
    icon: "2",
    title: "链接文字与实际 URL 不符",
    detail: "页面上的链接显示「教务管理系统」，但鼠标悬停后浏览器状态栏显示的实际地址是 szu-jwc.com/verify——链接显示文本与真实地址不一致，是最经典的钓鱼手法之一。",
  },
  {
    icon: "3",
    title: "文字细节异常",
    detail: "页面上出现了「击点此处」这种不自然的表达（正常应为「点击此处」），这是繁体中文「點擊此處」转简体后的残留痕迹——说明页面可能来自非大陆地区的诈骗团伙。",
  },
  {
    icon: "4",
    title: "要求输入密码以「验证身份」",
    detail: "正常的学籍/选课确认只需登录教务系统查看即可，系统不会额外弹出一个页面要求你「输入密码确认身份」——这是在试图窃取你的统一认证密码。",
  },
  {
    icon: "5",
    title: "联系电话为个人手机号",
    detail: "页面底部留的咨询电话是一个 11 位手机号而非学校固话。深圳大学教务部固话为 0755-2653XXXX 格式，不会使用个人手机号。",
  },
  {
    icon: "6",
    title: "校徽为占位符而非真实图片",
    detail: "页面顶部的校徽位置仅显示「[深圳大学校徽]」文字占位，真正的高校官网使用矢量 SVG 或高清 PNG 校徽。这暗示页面是截图拼凑的仿冒品。",
  },
]

const preventionTips = [
  "收到任何要求填写个人信息的通知，先不要点击邮件/短信里的链接，而是直接打开浏览器输入学校官网地址登录查看。",
  "鼠标悬停在链接上（不要点击），浏览器左下角会显示真实目标 URL。如果显示文本和实际地址不一致，100% 是钓鱼。",
  "正规高校的教务通知从来不需要你在邮件链接里「确认信息」或「验证身份」——登录统一认证系统后一切都在那里。",
  "注意文字质量：正规高校官网经过反复校对，不会出现「击点」「登入」等港台用语残留或错别字。",
  "核对发件人完整邮箱地址（不是显示名称，是实际地址）：深圳大学教务邮箱是 jwb@szu.edu.cn，不是任何其他域名。",
  "遇到可疑页面，查看页面底部 ICP 备案号，去工信部 ICP 查询系统验证是否与主办单位一致。",
]

export function Scenario5() {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ studentId: "", password: "", idCard: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowModal(true)
  }

  return (
    <div className="phish-page phish-s5">
      <div className="s5-email-banner">
        <div className="s5-email-meta">
          <span className="s5-email-label">发件人：</span>
          <span className="s5-email-from">深圳大学教务部 &lt;admin@szu-jwc.com&gt;</span>
          <span className="s5-email-label" style={{ marginLeft: 24 }}>日期：</span>
          <span>2026年6月12日</span>
        </div>
        <p className="s5-email-subject"><strong>主题：【重要】关于2025-2026学年第二学期选课确认与学籍信息核实通知</strong></p>
        <div className="s5-email-body">
          <p>各位同学：</p>
          <p>根据学校教务工作安排，现对<strong>2025-2026学年第二学期</strong>选课结果进行最终确认。经系统比对，你的学籍信息存在<strong style={{ color: "#c0392b" }}>异常项</strong>（详细见下文），请你务必在<strong>6月14日前</strong>完成信息核实，逾期将影响本学期成绩录入。</p>
          <p>请击点以下链接进入确认页面：<br />
            <a href="#" className="s5-fake-link"
              onMouseEnter={(e) => { (e.target as HTMLElement).title = "实际地址：http://szu-jwc.com/verify?token=abc123" }}>
              深圳大学教务管理系统 —— 选课确认
            </a>
          </p>
          <p style={{ color: "#888", fontSize: 13 }}>此邮件由教务系统自动发送，请勿回复。</p>
        </div>
      </div>

      <div className="s5-page">
        <div className="s5-page-header">
          <div className="s5-fake-logo">[深圳大学校徽]</div>
          <div className="s5-page-title">
            <h2>深圳大学教务部</h2>
            <p>Office of Academic Affairs, Shen Zhen University</p>
          </div>
        </div>

        <div className="s5-alert">
          <span className="s5-alert-icon">!</span>
          <div>
            <strong>学籍信息异常提醒</strong>
            <p>你的学籍档案中存在未核实的身份信息项。根据《深圳大学学籍管理规定》第二十一条，你需要在 48 小时内完成身份核实，否则相关选课记录将被标记为「待审核」状态。</p>
          </div>
        </div>

        <div className="s5-info-table">
          <h3>你的学籍信息（部分已脱敏）</h3>
          <table>
            <tbody>
              <tr><td className="s5-td-label">姓名</td><td>张*明</td></tr>
              <tr><td className="s5-td-label">学号</td><td>2023****4832</td></tr>
              <tr><td className="s5-td-label">学院</td><td>计算机与软件学院</td></tr>
              <tr><td className="s5-td-label">专业</td><td>计算机科学与技术</td></tr>
              <tr><td className="s5-td-label">入学年份</td><td>2023</td></tr>
              <tr><td className="s5-td-label">异常项</td><td><span style={{ color: "#c0392b", fontWeight: 600 }}>身份证信息未验证</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="s5-form-section">
          <h3>身份核实验证</h3>
          <p className="s5-form-hint">请输入你的统一认证信息以完成身份核实：</p>
          <form className="s5-form" onSubmit={handleSubmit}>
            <div className="s5-field">
              <label>学号</label>
              <input
                type="text"
                placeholder="请输入完整学号"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>
            <div className="s5-field">
              <label>统一认证密码</label>
              <input
                type="password"
                placeholder="请输入密码"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="s5-field">
              <label>身份证号 <span className="s5-field-note">（用于身份核验）</span></label>
              <input
                type="text"
                placeholder="请输入18位身份证号"
                required
                value={formData.idCard}
                onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
              />
            </div>
            <button type="submit" className="s5-submit">
              确认提交，完成验证
            </button>
          </form>
        </div>

        <div className="s5-footer">
          <p>咨询电话：138-8888-6688（李老师）</p>
          <p>&copy; 2023 深圳大学教务部 &middot; 粤ICP备2023100000号-1</p>
        </div>
      </div>

      <AntiPhishingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        scenario="情景五：校园教务通知（利用真实信息）"
        redFlags={redFlags}
        preventionTips={preventionTips}
      />
    </div>
  )
}
