# 软考系分论文助手 · DSH 插件

[![CI](https://github.com/Zm886/dsh-ruankao-essay/actions/workflows/ci.yml/badge.svg)](https://github.com/Zm886/dsh-ruankao-essay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-4D6BFE.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-7A5CFF.svg)](CHANGELOG.md)
[![DSH](https://img.shields.io/badge/DSH-Host%20bundle-000000.svg)](https://github.com/deepseek-ai/deepseek-harness)

把「软考系统分析师论文」的题库、写作规范与交付流程打包成 DSH 插件，装上以后在任意会话里都能直接调用；另附一个 Web UI 里的题库速查面板。

- **插件名（包名）**：`dsh-ruankao-essay`
- **Host 插件行 id**：`ruankao-essay`
- **提供的技能**：`ruankao-essay-writing`（写作／改写总纲）、`ruankao-essay-bank`（题库与写作规范）
- **Client 半**：`client.js`，在 `conversation.composer.dock` 注册「题库速查」面板
- **形态**：Host 半纯 JS 无依赖、无构建步骤；Client 半是单文件浏览器模块
- **版本**：0.1.0，变更见 [CHANGELOG.md](CHANGELOG.md)　·　安全策略见 [SECURITY.md](SECURITY.md)　·　贡献指南见 [CONTRIBUTING.md](CONTRIBUTING.md)

## 一、它解决什么问题

写软考系分论文的痛点不是「不会写」，而是每次都要重新回忆：这篇题目的子题目有哪几块、该配哪个项目、理论点怎么写全、字数与结构怎么卡、成稿怎么变成 Word。本插件把这些固化成两个技能：

| 技能 | 干什么 | 何时加载 |
|---|---|---|
| `ruankao-essay-bank` | 查：真题表（2016—2026）、按题型的理论骨架、写作规格与扣分雷区 | 拿到题目先查它 |
| `ruankao-essay-writing` | 写：10 段式结构、字数口径、语气禁忌、子题目回应规则、Word 交付脚本 | 动笔与交付时 |

两者配合的完整链路：**查题 → 定骨架 → 配实例 → 成稿 → 自检 → 生成 .doc**。

此外，插件在 DSH Web UI 的对话输入区上方提供一个**题库速查面板**：点开后可切换「历年真题 / 题型骨架 / 写作规格」三个页签，用于在写之前快速定位题目与要点（内容与仓库内的公开版索引一致）。

## 二、安装

### 方式 A：作为 bundle 安装（推荐，装一次全局可用）

在安装了本插件的 DSH 里让 Agent 调用 `plugin_manager`：

```jsonc
// action: install_bundle, target: 本目录绝对路径
{ "action": "install_bundle", "target": "D:\\project\\deeepseek\\dsh-plugins\\dsh-ruankao-essay" }
```

也可以在 DSH 桌面端的 **插件管理 / Plugin Manager** 里选择「安装本地 bundle」，指向本目录。安装后插件会出现在插件清单与设置页，行 id 为 `ruankao-essay`；改动用 HMR 生效，替换已装包需重启 DSH。

> 注意：Agent 每次调用 `plugin_manager` 都需要授权；本插件目录请保留在磁盘上（不要打进 `app.asar`），技能里的 references 需要模型直接读文件。

### 方式 B：免安装（只想要技能，不想改 profile）

技能目录就是标准布局，直接拷到技能根目录即可被自动发现：

```powershell
# 只对本项目生效
New-Item -ItemType Directory -Force -Path "D:\project\deeepseek\.dsh\skills" | Out-Null
Copy-Item "D:\project\deeepseek\dsh-plugins\dsh-ruankao-essay\assets\*" "D:\project\deeepseek\.dsh\skills" -Recurse

# 或对所有项目生效
Copy-Item "D:\project\deeepseek\dsh-plugins\dsh-ruankao-essay\assets\*" "$env:USERPROFILE\.dsh\skills" -Recurse
```

两种方式的资产完全一致：`SKILL.md` 带 YAML frontmatter（供文件系统发现），插件提供者读取时会自动剥掉 frontmatter。

> 本插件**不发布到 npm**：`package.json` 保持 `private: true`，防止误发布；请用方式 A（本地 bundle）或方式 B（技能目录），或直接克隆本仓库。
>
> 这样做的原因：npm 打包只看 `package.json` 的 `files` 白名单，不看 `.gitignore`，一旦白名单写成目录就可能把本机资料一起发出去；仓库分发没有这条通道。

## 三、目录结构

```
dsh-ruankao-essay/
├─ package.json          # dsh.bundle.patch、meta、icon、files、repository
├─ cordis.patch.yml      # 向 profile 插入 id: ruankao-essay 的 Host 插件行
├─ index.js              # Cordis 插件：ctx.skills.registerProvider(...) 注册两个技能
├─ client.js             # Client 半：在 Web UI 注册题库速查面板
├─ icon.svg              # 插件卡片图标
├─ locale/{zh,en}.json   # 插件卡片标题与描述
├─ CHANGELOG.md          # 版本变更记录
├─ SECURITY.md           # 安全策略与漏洞报告方式
├─ CONTRIBUTING.md       # 贡献指南与内容边界
├─ scripts/
│  └─ verify-manifest.mjs        # 清单／技能资产／脚本 BOM／Client 半 校验
├─ .github/workflows/
│  ├─ ci.yml                     # CI：Linux 校验 + Windows 端到端测试
│  └─ github-release.yml         # 打 tag 时只创建 GitHub Release（不发 npm）
├─ tests/
│  ├─ fixtures/sample-essay.md   # 公开的 10 段测试样例
│  └─ out/                       # 测试产物（已 gitignore）
└─ assets/
   ├─ ruankao-essay-writing/          # 技能一：写
   │  ├─ SKILL.md
   │  ├─ references/writing-rules.md
   │  └─ scripts/make-essay-doc.ps1   # Markdown → Word 可打开的 .doc（含段数与字数自检）
   └─ ruankao-essay-bank/             # 技能二：查
      ├─ SKILL.md
      └─ references/topic-index-lite.md
```

脚本放在写作技能目录内，因此无论是「插件资源基」还是「技能目录」安装，`<skill-directory>/scripts/make-essay-doc.ps1` 都能正确定位。

## 四、用起来是什么样

会话里出现「写软考系分论文 / 这个论文题目怎么写 / 押题」之类需求时，Agent 会加载技能，然后：

1. 在 `references/topic-index-lite.md` 里定位题目（真题题名、通用理论骨架、写作规格、可选项目）；若本地 `references/` 下另有参考资料，优先按需读取；
2. 按 10 段式规格成稿：**严格 10 段、含标点 2500~2800、无标题、无分点标号、无第一人称、周期只写首段**；
3. 每个论点配一条项目业务实例，效果给量化数据，收尾写 2~3 条不足与改进；
4. 用脚本产出 Word（用调用运算符，不要套 `pwsh -File`——本机 shell 里没有 `pwsh` 命令）：

```powershell
& "<skill-directory>\scripts\make-essay-doc.ps1" -MdPath "D:\out\论微服务架构及其应用.md"
# 段落数: 10  含标点字数: 2534  纯汉字: 2116
# 已生成: D:\out\论微服务架构及其应用.doc
```

脚本会剥掉 `**` 粗体标记并统计真实字数，段数应为 10、含标点字数落在 2500~2800。

## 五、自制／扩展

- **加题型**：往 `assets/ruankao-essay-bank/references/topic-index-lite.md` 追加真题题名与理论骨架；本地另有参考资料时同步维护即可。
- **加技能**：在 `assets/` 下新建 `<kebab-case-name>/SKILL.md`（带 frontmatter），再到 `index.js` 的 `SKILLS` 数组登记一条，最后跑 `node scripts/verify-manifest.mjs` 确认资产齐全。
- **改交付格式**：`assets/ruankao-essay-writing/scripts/make-essay-doc.ps1` 里的 `@page`／字体／字号／行距都可调；中文标点务必用 `[char]` 码点构造，脚本必须保存为**带 BOM 的 UTF-8**（Windows PowerShell 5.1 下无 BOM 会按 ANSI 误读中文，CI 会拦截）。

## 六、验证与已知限制

### 本地一条命令跑全部校验

```powershell
node --check index.js
node --check client.js
node scripts/verify-manifest.mjs
# 校验清单字段、加载器补丁、技能资产与 frontmatter、脚本 BOM、Client 半
```

它检查 9 项：`package.json` 的 `dsh.bundle.patch`／`manifestVersion`／`meta`／`icon`／`main` 与依赖声明、`cordis.patch.yml` 的 id 与包名、每个技能都有对应 `assets/<name>/SKILL.md` 且 frontmatter 的 `name` 与目录一致、生成脚本存在且带 UTF-8 BOM、`dsh.client` 声明与 `client.js` 的模块 id／槽位一致、必备文件齐全、`references/` 下只有公开文件被跟踪、以及**发布白名单只包含仓库已跟踪的文件**（防止把本机资料打包出去）。

### 端到端测试生成脚本

```powershell
& .\assets\ruankao-essay-writing\scripts\make-essay-doc.ps1 -MdPath .\tests\fixtures\sample-essay.md -OutPath .\tests\out\sample.doc
# 段落数: 10  含标点字数: 1012  纯汉字: 870
```

### CI（GitHub Actions）

`.github/workflows/ci.yml` 在 push／PR 时跑两个作业：

| 作业 | 运行环境 | 内容 |
|---|---|---|
| 清单与技能资产校验 | ubuntu-latest | `node --check index.js`、解析 JSON、跑 `verify-manifest.mjs`、确认 `references/` 下只有公开文件被跟踪 |
| 生成脚本端到端测试 | windows-latest | 校验脚本保留 UTF-8 BOM，用 `tests/fixtures/sample-essay.md` 生成 `.doc`，断言段数为 10、正文无直引号且有中文引号 |

另有 `.github/workflows/github-release.yml`：推送 `v*` tag 时先跑校验，再创建一个 GitHub Release（仅源码快照，不发布到 npm）。

### 已知限制

- 技能是否生效：装好后新开会话，用 `skill` 工具按名字加载 `ruankao-essay-bank`，能返回目录即成功；或在设置页插件清单里看到「软考系分论文助手」。
- 插件只提供写作规范、公开考题信息与理论骨架；**项目与数据请使用你自己的真实项目**。
- 本插件只提供技能与脚本，不含 UI 面板；若想要侧边栏可视化题库，需要再加 Client 插件（可用 `templates/decoration` 起步）。
- `make-essay-doc.ps1` 在 Windows PowerShell 5.1 与 PowerShell 7 上均可用；脚本必须保持带 BOM 的 UTF-8，CI 会拦截丢失 BOM 的提交。

## 七、从 GitHub 安装

```powershell
git clone https://github.com/Zm886/dsh-ruankao-essay.git
# 然后按「二、安装」的方式 A 或方式 B 安装
```

## 八、许可

MIT（见 `LICENSE`）。仅供个人备考使用，请勿将仓库内容用于商业用途。

