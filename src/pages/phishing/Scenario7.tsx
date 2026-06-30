import { useState } from "react"
import { AntiPhishingModal } from "./AntiPhishingModal"

/* ================================================================
   情景七：来自"同学"的文档共享 — 利用"社交关系"与"信任"
   红队线索（Red Flags）：
   1. 域名 docs-qq.com（假）vs docs.qq.com（真）
   2. .zip 文件不可能在线预览
   3. 分享者名不一致（王小明 vs wangxm_2023）
   4. 分享时间在未来
   5. 公开分享不需要登录查看
   6. 除登录外所有按钮为死链接
=============================================================== */

const redFlags = [
  {
    icon: "1",
    title: "域名细微差异（Typosquatting）",
    detail: "当前域名是「docs-qq.com」（连字符），而真正的腾讯文档域名是「docs.qq.com」（点号）。这种利用用户对品牌域名的视觉惯性来注册相似域名的攻击手法叫 Typosquatting。仅一个字符之差，肉眼极易忽略。",
  },
  {
    icon: "2",
    title: "文件类型与预览逻辑矛盾",
    detail: "文件名是「期末复习资料.zip」，但页面却显示出了文档内容预览。.zip 是压缩包格式，在线文档平台无法直接预览压缩包内容——这说明页面根本没有真实文件，只是截取了一些文字当作诱饵。",
  },
  {
    icon: "3",
    title: "分享者身份不一致",
    detail: "页面标题显示分享者是「王小明」，但右上角用户区域显示的用户名是「wangxm_2023」。真正的文档分享功能会显示一致的分享者信息，这种不一致说明页面是拼凑而成的。",
  },
  {
    icon: "4",
    title: "时间戳异常",
    detail: "分享时间显示为未来的时间（比当前时间晚若干小时），这是因为钓鱼页面没有动态更新时间戳，而是硬编码了一个固定的时间。",
  },
  {
    icon: "5",
    title: "不必要的登录要求",
    detail: "腾讯文档的公开分享链接可以直接在浏览器中查看而不需要登录，只有需要编辑权限时才需要登录。钓鱼页面故意把「查看」也设置成需要登录，目的是窃取你的微信/QQ 账号密码。",
  },
  {
    icon: "6",
    title: "页面功能残缺",
    detail: "除了登录表单外，页面上的下载、转发、收藏、举报等按钮点击后都没有任何反应——因为钓鱼者只关心窃取登录凭证，其他功能只是装饰性的死链接。",
  },
]

const preventionTips = [
  "收到同学/朋友发来的文档链接，先确认是本人发送：微信上直接问一句「这是你发的吗？」——10 秒钟能避免 90% 的钓鱼。",
  "仔细看域名：腾讯文档是 docs.qq.com（点号），不是 docs-qq.com 或其他变体。养成每次输入密码前看域名的习惯。",
  "如果一个公开分享的文档非要你登录才能看——停下来，这大概率是钓鱼。正常的文档分享链接，查看是不需要登录的。",
  "通过官方入口验证：不点击收到的链接，而是自己在浏览器输入 docs.qq.com，在首页搜索文件名，看它是否真的存在。",
  "注意页面时间戳是否正常——如果显示的时间在你当前时间之后（未来时间），说明是钓鱼页面的硬编码内容。",
  "试试页面上的其他按钮是否正常工作——钓鱼页面通常只有登录/提交按钮是真的，其他功能都是死链接。",
]

export function Scenario7() {
  const [showModal, setShowModal] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"wechat" | "qq">("wechat")
  const [formData, setFormData] = useState({ account: "", password: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowModal(true)
  }

  return (
    <div className="phish-page phish-s7">
      <div className="s7-context-banner">
        来自聊天：<strong>王小明</strong>
      </div>

      <div className="s7-page">
        <header className="s7-header">
          <div className="s7-logo">
            <span className="s7-logo-icon">TD</span>
            <span className="s7-logo-text">腾讯文档</span>
          </div>
          <div className="s7-header-right">
            <span className="s7-user-hint">wangxm_2023</span>
            <button className="s7-btn-outline" disabled>登录</button>
          </div>
        </header>

        <div className="s7-main">
          <div className="s7-file-info">
            <div className="s7-file-icon">
              <div className="s7-file-icon-zip">ZIP</div>
            </div>
            <div className="s7-file-meta">
              <h2>期末复习资料.zip</h2>
              <div className="s7-file-details">
                <span>分享者：王小明</span>
                <span className="s7-dot">·</span>
                <span>分享于：2026年6月14日 20:30</span>
                <span className="s7-dot">·</span>
                <span>大小：2.4 MB</span>
                <span className="s7-dot">·</span>
                <span>有效期：7天</span>
              </div>
            </div>
          </div>

          <div className="s7-preview">
            <div className="s7-preview-blur">
              <div className="s7-preview-content">
                <h3>计算机网络 期末重点整理</h3>
                <p><strong>第一章 概述</strong></p>
                <p>1. 计算机网络的定义与分类</p>
                <p>2. OSI 七层模型与 TCP/IP 四层模型</p>
                <p>3. 电路交换、报文交换、分组交换</p>
                <p>4. 时延 = 发送时延 + 传播时延 + 处理时延 + 排队时延</p>
                <p>...</p>
                <div className="s7-preview-mask" />
              </div>
            </div>
            <div className="s7-login-prompt">
              <div className="s7-login-card">
                <h4>登录后查看完整内容</h4>
                <p>该文档设置了访问权限，请使用微信或 QQ 登录</p>

                <div className="s7-login-tabs">
                  <button
                    className={loginMethod === "wechat" ? "active" : ""}
                    onClick={() => setLoginMethod("wechat")}
                  >
                    微信登录
                  </button>
                  <button
                    className={loginMethod === "qq" ? "active" : ""}
                    onClick={() => setLoginMethod("qq")}
                  >
                    QQ 登录
                  </button>
                </div>

                <form className="s7-form" onSubmit={handleSubmit}>
                  <div className="s7-field">
                    <label>{loginMethod === "wechat" ? "微信号/手机号" : "QQ号"}</label>
                    <input type="text" placeholder={loginMethod === "wechat" ? "请输入微信号或手机号" : "请输入QQ号"} required
                      value={formData.account}
                      onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    />
                  </div>
                  <div className="s7-field">
                    <label>{loginMethod === "wechat" ? "微信密码" : "QQ密码"}</label>
                    <input type="password" placeholder="请输入密码" required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="s7-submit">
                    登录并查看文档
                  </button>
                </form>

                <div className="s7-login-footer">
                  <a href="#" onClick={(e) => e.preventDefault()}>忘记密码？</a>
                  <span>&middot;</span>
                  <a href="#" onClick={(e) => e.preventDefault()}>注册新账号</a>
                </div>
              </div>
            </div>
          </div>

          <div className="s7-actions">
            <button disabled className="s7-action-btn">下载</button>
            <button disabled className="s7-action-btn">转发给朋友</button>
            <button disabled className="s7-action-btn">收藏</button>
            <button disabled className="s7-action-btn">举报</button>
          </div>
        </div>

        <footer className="s7-footer">
          <p>&copy; 2024 Tencent. 腾讯文档 &middot; 粤B2-20090059</p>
          <p className="s7-footer-url">
            <span className="s7-url-display">docs-qq.com / share / dHVhbmd4aW5nemlfeXVhbmppYW5n</span>
          </p>
        </footer>
      </div>

      <AntiPhishingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        scenario="情景七：来自「同学」的文档共享（利用社交关系与信任）"
        redFlags={redFlags}
        preventionTips={preventionTips}
      />
    </div>
  )
}
