import { Link } from "react-router-dom"

const scenarios = [
  {
    path: "/phishing/scenario-4",
    label: "情景四",
    title: "热门活动/讲座抢票通知",
    hook: "利用好奇与稀缺性",
    desc: "你收到一条「知名教授讲座最后 3 个名额」的推送，要求填写个人信息报名……",
    accent: "#c0392b",
  },
  {
    path: "/phishing/scenario-5",
    label: "情景五",
    title: "校园与教务系统通知",
    hook: "利用真实信息",
    desc: "一封看起来完全正常的「教务处选课确认通知」，包含了你的真实姓名和学号，要求你登录验证……",
    accent: "#4834d4",
  },
  {
    path: "/phishing/scenario-6",
    label: "情景六",
    title: "课程/教务系统通知",
    hook: "利用权威与服从",
    desc: "「深圳大学教务处」发来红头文件：「依据深大教第 XX 号文件，请在 24 小时内完成信息核实，否则将影响毕业审核」……",
    accent: "#c44569",
  },
  {
    path: "/phishing/scenario-7",
    label: "情景七",
    title: "来自「同学」的文档共享",
    hook: "利用社交关系与信任",
    desc: "微信收到「同学」发来的腾讯文档链接：「期末复习资料.zip」，需要登录才能查看完整内容……",
    accent: "#20bf6b",
  },
]

export function PhishingIndex() {
  return (
    <div className="phishing-index">
      <div className="phishing-index-hero">
        <h1>反钓鱼安全意识实训</h1>
        <p>
          以下四个场景模拟了大学生最常遇到的钓鱼攻击手段。<br />
          每个页面都<strong>高度仿真</strong>真实钓鱼页面，但<strong>故意留有破绽</strong>供你甄别。
        </p>
        <p className="phishing-index-hint">
          <strong>训练说明：</strong>仔细浏览每个页面，尝试找出其中的 Red Flags（可疑迹象）。如你输入了隐私信息并提交，数据不会被保存——页面将弹出该情景的防钓鱼知识讲解。
        </p>
      </div>

      <div className="phishing-index-grid">
        {scenarios.map((s) => (
          <Link to={s.path} key={s.path} className="phishing-scenario-card">
            <div className="phishing-scenario-badge" style={{ background: s.accent }}>
              <span className="phishing-scenario-label">{s.label}</span>
            </div>
            <h3>{s.title}</h3>
            <span className="phishing-scenario-hook">{s.hook}</span>
            <p>{s.desc}</p>
            <span className="phishing-scenario-link">进入场景 &rarr;</span>
          </Link>
        ))}
      </div>

      <div className="phishing-index-footer">
        <p>本实训内容仅供反钓鱼安全意识教育使用。</p>
      </div>
    </div>
  )
}
