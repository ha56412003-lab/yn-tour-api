# MEMORY.md - 铁律与长期记忆

## 执行铁律

**需求确认规则：** 浩哥分段发送需求时，必须等全部说完再执行。执行前主动确认：「需求说完了吗？」，未经确认不抢跑。

## 语言规则（铁律）

- **代码部分**：英文（变量/函数/注释）
- **与浩哥聊天**：中文，不允许中英混杂
- 技术术语可保留英文，但必须配中文解释

## 安全趋势 (2026-03-31更新)

- AI Agent身份安全成新战场，核心从"被动验证"转向"主动建立信任"，需构建"数字身份+行为基线"双重认证
- API攻击升级为"规模轰炸"，AI加持下从精准试探到规模化打击，需全生命周期防护+AI审计+动态权限管理
- 前置式主动网络安全是未来方向（Gartner预测2030年占50%支出），核心是预测-破坏-拦截
- 勒索软件进入自动化2.0时代，AI驱动目标筛选→漏洞扫描→攻击实施→赎金谈判全流程自动化，效率从天级压缩至分钟级
- 量子"先采集后解密"威胁迫在眉睫，高风险：政府/国防/医疗/金融
- 非人类身份（NHI）攻击激增：服务账号/API密钥/机器身份普遍过度授权+缺乏MFA，需自动化持续监控+生命周期治理
- 适应型身份（Adaptive Identity）：AI代理每分钟做出数千决策，需即时权限控制+身份图谱可视化+治理嵌入工作流；82%企业已用AI代理，仅40%能有效治理NHI

## Check Point《2026年网络安全报告》关键数据

- **MCP服务器安全堪忧**：40%的组织发现MCP服务器存在安全漏洞（⚠️公司MCP服务需立即排查）
- 90%的组织曾遭遇AI相关钓鱼/恶意提示攻击
- 勒索软件同比增长53%，进入自动化2.0时代（AI驱动目标筛选→漏洞扫描→攻击实施→赎金谈判全流程自动化）
- 82%的恶意文件攻击源于电子邮件（邮件安全是头号防线）
- 来源：Check Point 2026网络安全报告

## 2026 Q1 重点漏洞情报（2026-04-07更新）

**Chrome零日激增**：2026年Q1已有4个Chrome零日被在野利用（CVE-2026-5281等），Dawn（WebGPU实现）释放后重用是新型利用路径；浏览器安全不容忽视

**漏洞窗口压缩**：Google Cloud报告显示漏洞公开到被利用时间已从数周压缩至**数天**，补丁自动化是必选项

**TrueConf TrueChaos供应链攻击**：CVE-2026-3502 — 更新机制缺少完整性检查 → 篡改更新包 → 部署Havoc C2；针对东南亚政府

**Citrix NetScaler CVE-2026-3055**：与CitrixBleed相似，/saml/login越界读取 → 窃取会话ID → 设备完全控制；29,000+暴露实例

**Vim CVE-2026-34982/34714**：PoC已公开，选项缺少P_MLE安全标志 → 打开特制文件即执行任意代码；⚠️高危

**SAP Log4j老旧漏洞**：CVE-2019-17571（CVSS 9.8），影响1.2-1.2.17版（2012年老旧版本），企业老旧组件是定时炸弹

**FortiGate SSO签名验证漏洞**：CVE-2025-59718/59719 — FortiOS配置可逆加密储存，导出后可解析服务账号密码 → 横向移动至AD

**微软2月Patch Tuesday**：修复59漏洞，含6个已遭利用零日漏洞（微软首次确认），SQL Server CVE-2026-21262可启用xp_cmdshell

## Black Hat Asia 2026 重点攻击手法

- **DNS缓存重生日攻击**：生日悖论+DNS漏洞可污染全球流量；防御：打补丁+DNSSEC
- **智能手机ROM漏洞**：单个启动ROM漏洞可跨制造商解密固件；防御：及时更新固件
- **LLM钓鱼/恶意代码生成**：AI让社工攻击自动化、规模化；防御：AI异常检测+自动响应
- **供应链攻击**：npm恶意包是主要入口；推荐检测工具：`vet`（AI SDLC时代供应链安全工具）

## MCPHub 高危漏洞（2026-03-13，蚁景网安实验室）

**身份认证绕过（三层缺陷）：**
1. validateBearerAuth 未配置 keys 时默认放行（`{ valid: true }`）
2. SSE URL 直接取 username 创建用户上下文，无校验
3. session 不绑定 userId，只验证存在性不验证归属

**命令执行：** stdio 类型 MCP 服务器添加时 command/args 无校验

**防御要点：** MCP 中间层上线前必须专项审计；SSE 传输层 URL 参数→用户上下文信任链需严格校验

## OpenClaw CVE-2026-33579（2026-04-05 情报）
- 权限提升漏洞，CVSS 8.1-9.8，/pair approve 路径绕过作用域检查
- 影响：持有最低 pairing 权限即可接管完整实例
- 修复：升级至 2026.3.28+，管理端口禁暴露公网
- ⚠️ 公司网关（18789/18790）需立即确认已升级并网络隔离

## 公司安全建设原则

- ⚠️ **MCP服务器安全**：每季度专项审计，重点查身份校验、session绑定、command注入（公司douyin-mcp-server需优先排查）
- 第三方API/SDK引入前必须通过安全检测，npm包引入前用`vet`扫描
- AI工具链需防范提示注入，对AI Agent执行权限最小化+全操作审计
- 旅游业务涉及的支付/地图/预订第三方接口纳入主动安全检测范围
- 数据备份策略：本地+离线，防范勒索软件自动化攻击

## Rule 1 — 双层记忆存储（铁律）

Every pitfall/lesson learned → IMMEDIATELY store TWO memories to LanceDB before moving on:

- **Technical layer**: Pitfall: [symptom]. Cause: [root cause]. Fix: [solution]. Prevention: [how to avoid]
 (category: fact, importance ≥ 0.8)
- **Principle layer**: Decision principle ([tag]): [behavioral rule]. Trigger: [when it applies]. Action: [what to do]
 (category: decision, importance ≥ 0.85)
- After each store, immediately `memory_recall` with anchor keywords to verify retrieval.
 If not found, rewrite and re-store.
- Missing either layer = incomplete.
 Do NOT proceed to next topic until both are stored and verified.
- Also update relevant SKILL.md files to prevent recurrence.

## Rule 2 — LanceDB 卫生

Entries must be short and atomic (< 500 chars). Never store raw conversation summaries, large blobs, or duplicates.
Prefer structured format with keywords for retrieval.

## Rule 3 — Recall before retry

On ANY tool failure, repeated error, or unexpected behavior, ALWAYS `memory_recall` with relevant keywords
(error message, tool name, symptom) BEFORE retrying. LanceDB likely already has the fix.
Blind retries waste time and repeat known mistakes.

## Rule 4 — 编辑前确认目标代码库

When working on memory plugins, confirm you are editing the intended package
(e.g., `memory-lancedb-pro` vs built-in `memory-lancedb`) before making changes;
use `memory_recall` + filesystem search to avoid patching the wrong repo.

## Rule 5 — 插件代码变更必须清 jiti 缓存（MANDATORY）

After modifying ANY `.ts` file under `plugins/`, MUST run `rm -rf /tmp/jiti/` BEFORE `openclaw gateway restart`.
jiti caches compiled TS; restart alone loads STALE code. This has caused silent bugs multiple times.
Config-only changes do NOT need cache clearing.

## UniApp + 微信小程序开发经验（2026-04-18沉淀）

### 微信小程序质量扫描通过要点
1. **图片总大小 ≤ 200KB**（用 `sips` 压缩）
2. **JS压缩**：`manifest.json` + `vite.config.ts` 配置好即可
3. **组件懒加载**：`manifest.json` → `mp-weixin.setting.lazyCodeLoading: "requiredComponents"`
4. **缓存清理**：修改配置后必须 `rm -rf dist` 重新编译

### 图片压缩命令（macOS）
```bash
sips -s format jpeg -s formatOptions 50 --resampleHeight 300 input.jpg --out output.jpg
```

### 重建编译标准流程
```bash
cd yn-tour-distribution
rm -rf dist
npm run build:mp-weixin
# 微信开发者工具重新导入 dist/build/mp-weixin
```

### 调试用户状态
直接MongoDB修改：`User.findOneAndUpdate({phone}, {isDistributor: false})`
或添加后端调试接口 `POST /user/debug-toggle-distributor`

### 项目路径
`~/.openclaw/workspace-fengxi/yn-tour-miniprogram/`
- `server/` - Node.js后端
- `yn-tour-distribution/` - UniApp小程序前端

