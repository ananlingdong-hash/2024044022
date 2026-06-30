import { useState } from "react"
import { AntiPhishingModal } from "./AntiPhishingModal"

/* ================================================================
   情景六：课程/教务系统通知 — 利用"权威"与"服从"
   红队线索（Red Flags）：
   1. 引用不存在的文件号（深大教〔2026〕188号）
   2. 威胁性措辞："后果自负""影响毕业审核"
   3. 域名 jw-szu.edu.cn 是独立域名，非子域
   4. "登入"而非"登录"——繁体残留
   5. 辅导员签字确认流程不存在
   6. 红色印章为图片而非 CA 电子签名
=============================================================== */

const redFlags = [
  {
    icon: "1",
    title: "伪造的公文编号",
    detail: "通知中引用的「深大教〔2026〕188号文件」是编造的——你可以去深圳大学官网搜索该文号，会发现根本不存在。钓鱼者利用人们对「红头文件」的敬畏心理，编一个看起来正式的文件号。",
  },
  {
    icon: "2",
    title: "制造恐惧和服从压力",
    detail: "「逾期后果自负」「将影响正常毕业审核」——这些威胁性措辞是典型的社交工程手法，目的就是让你害怕而不敢质疑。正规学校通知会留充足的办理时间，不会使用这种恐吓语气。",
  },
  {
    icon: "3",
    title: "虚假子域名混淆",
    detail: "域名「jw-szu.edu.cn」看起来像「深圳大学教务」的缩写，但它是一个独立注册的 .edu.cn 域名，并非 szu.edu.cn 的子域。真正的深大域名结构是 jw.szu.edu.cn（注意中间是点号而非连字符）。",
  },
  {
    icon: "4",
    title: "繁体转换残留",
    detail: "通知正文中出现「登入系統」等港台用语（正常应为「登录系统」），这说明页面模板来自港澳台诈骗团伙，只是简单做了简体字转换。正规大陆高校公文不会出现这种用词。",
  },
  {
    icon: "5",
    title: "PS 制作的电子印章",
    detail: "页面底部的「深圳大学教务处」红色圆形印章与文字排版不对齐，边缘有白色锯齿——这是用图片编辑软件直接贴上去的。真正的电子公文使用 CA 数字证书签名，不是图片印章。",
  },
  {
    icon: "6",
    title: "编造的行政流程",
    detail: "通知要求的「辅导员签字确认」流程在真实的学籍核查中根本不存在。钓鱼者添加这一步骤是为了让你觉得流程很「正式」，从而放松警惕。",
  },
]

const preventionTips = [
  "收到带「红头文件」编号的通知，先去学校官网搜索该文件号是否存在——不存在就是钓鱼。",
  "任何以「后果自负」「影响毕业」等威胁语气催促你操作的邮件/短信，大概率是诈骗。正规通知会告知事由和办理方式，不会恐吓。",
  "留意域名结构：深圳大学子域名为「xxx.szu.edu.cn」（点号连接），而「xxx-szu.edu.cn」或「szu-xxx.cn」（连字符）是独立注册的域名。",
  "国内正规高校的公文使用 CA 数字证书电子签名，不是图片印章。如果你能右键保存「公章」为 PNG 图片，那一定是假的。",
  "养成良好的验证习惯：收到通知后关闭邮件/短信，自己打开浏览器输入官网地址登录，而不是点击通知里的链接。",
  "文字质量检查：正规公文不会出现「登入」「點擊」等港台用语或明显错别字，这些都是钓鱼页面的常见破绽。",
]

export function Scenario6() {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ studentId: "", password: "", phone: "", guardian: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowModal(true)
  }

  return (
    <div className="phish-page phish-s6">
      <div className="s6-doc">
        <div className="s6-red-header">
          <div className="s6-red-line1">深圳大学教务处文件</div>
          <div className="s6-red-line2">深大教〔2026〕188号</div>
        </div>

        <div className="s6-doc-title">
          <h1>关于开展2025-2026学年第二学期<br/>学生学籍信息专项核查工作的紧急通知</h1>
        </div>

        <div className="s6-doc-body">
          <p><strong>各学院、全体本科生：</strong></p>
          <p>根据教育部《高等学校学生学籍学历电子注册办法》（教学〔2014〕11号）及<strong>《深圳大学学生学籍管理规定》（深大教〔2026〕188号）</strong>的要求，为进一步加强学生学籍信息管理，保障学生合法权益，现决定开展2025-2026学年第二学期学生学籍信息专项核查工作。</p>

          <div className="s6-deadline-box">
            <p className="s6-deadline-text">本次核查截止时间为<strong>2026年6月14日 24:00</strong>。逾期未完成者，<strong>后果自负</strong>，将影响正常毕业审核流程。</p>
          </div>

          <h3>一、核查对象</h3>
          <p>全校在读本科生（含交换生、休学复学学生）。</p>

          <h3>二、核查内容</h3>
          <ul>
            <li>个人基本信息（姓名、身份证号、民族、出生日期）</li>
            <li>学籍状态信息（学院、专业、班级、学制）</li>
            <li>联系方式（手机号、紧急联系人）</li>
          </ul>

          <h3>三、核查方式</h3>
          <p>请登入下方系统进行在线核实。需要完成以下步骤：</p>
          <ol className="s6-steps">
            <li>输入学号及统一认证密码登入系统</li>
            <li>确认及修改个人信息</li>
            <li>填写紧急联系人及监护人信息</li>
            <li>电子签名确认（辅导员签字确认）</li>
          </ol>

          <div className="s6-warning">
            <strong>特别提醒：</strong>本次核查与你的毕业资格审查直接关联，请务必在规定时间内完成。各学院辅导员将逐一核实完成情况，未完成者按学籍管理规定处理。
          </div>

          <div className="s6-form-wrapper">
            <h3 className="s6-form-title">学籍信息核查系统</h3>
            <form className="s6-form" onSubmit={handleSubmit}>
              <div className="s6-field">
                <label>学号</label>
                <input type="text" placeholder="请输入学号" required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>
              <div className="s6-field">
                <label>统一认证密码</label>
                <input type="password" placeholder="请输入密码" required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="s6-field">
                <label>手机号码</label>
                <input type="tel" placeholder="用于接收核查结果" required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="s6-field">
                <label>监护人姓名及联系方式</label>
                <input type="text" placeholder="姓名 / 电话" required
                  value={formData.guardian}
                  onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
                />
              </div>

              <div className="s6-checkbox-group">
                <label className="s6-checkbox">
                  <input type="checkbox" required />
                  <span>本人承诺以上信息真实有效，如有虚假自愿承担一切后果</span>
                </label>
              </div>

              <button type="submit" className="s6-submit">
                提交核查，完成确认
              </button>
            </form>
          </div>
        </div>

        <div className="s6-stamp-area">
          <div className="s6-stamp-text">深圳大学教务处</div>
          <div className="s6-stamp-date">2026年6月13日</div>
        </div>

        <div className="s6-url-hint">
          当前页面：<span className="s6-url-red">http://jw-szu.edu.cn/notice/verify-2026</span>
        </div>
      </div>

      <AntiPhishingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        scenario="情景六：教务系统通知（利用权威与服从）"
        redFlags={redFlags}
        preventionTips={preventionTips}
      />
    </div>
  )
}
