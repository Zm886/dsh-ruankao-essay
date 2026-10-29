# 更新日志

本项目的所有重要变更都记录在此文件，格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 界面重构（本轮）

- **题库面板改为模态卡**：原先在 `conversation.composer.dock`（宿主语义是「composer 卡片下方的环境小条目」）里内联展开，既撑高输入区、又与宿主视觉不一致。现改为：入口是 `conversation.input.left` 工具行左侧的 28px 图标按钮，题库本体是 `shell.overlay` 里的居中模态卡（点遮罩或按 Esc 关闭，打开后自动聚焦搜索框）。
- **改用宿主主题 token**：样式从写死的灰色 `rgba(127,127,127,…)` 改为 `--dsh-alias-*`（bg-overlay／bg-layer-1／border-l1／brand-primary／label-primary…），亮暗主题自动跟随。
- **内容可扫读 + 可检索**：真题按场次分卡片、试题编号化，理论骨架按卡片分组；新增跨页签搜索框与空结果提示，替代原先「年份 + 顿号连排」的整段文本。
- **交互细节**：下划线式页签、hover 态、`aria-label`／`aria-expanded`／`aria-modal`、Esc 关闭；`shell.overlay` 整层是 click-through，故遮罩与卡片显式 `pointerEvents: 'auto'` opt-in。

### 单一来源与清理（本轮）

- **题库数据单一来源**：新增 `assets/ruankao-essay-bank/references/topic-index.json`（真题题名／理论骨架／写作规格的唯一数据源）与生成器 `scripts/build-client-data.mjs`，`topic-index-lite.md` 与 Client 面板的对应内容改为从它生成。此前两份内容各写一遍，已经漂移过。
- **技能描述单一来源**：新增 `scripts/build-skill-descriptions.mjs`，`index.js` 里的技能描述改为从各 `SKILL.md` 的 YAML frontmatter 生成。此前描述手写两份（插件方式与文件系统方式看到的文案不同）。
- **CI 守卫**：两个生成器都支持 `--check`，`verify-manifest.mjs` 与 CI 会在生成区块与数据源不一致时失败，避免手改生成区块或忘记重新生成。
- **清理机器专属路径**：移除巡检脚本里写死的 node 兜底路径与默认成稿目录、去掉写死的 Windows 绝对路径与用户名、把踩坑笔记里的个人产物路径改成通用占位；巡检脚本在找不到 `node`／`git` 时改为跳过而不是中断。
- **成稿入库可用性**：`ingest-essay.ps1` 在本地私有题库文件缺失时自动创建最小模板，不再直接报错退出，新环境开箱可用。
- **.doc HTML 转义**：生成 Word 时对正文中的 `& < >` 做转义，避免破坏 HTML 结构；`.mjs` 与 `.ps1` 两版口径一致。

### 跨平台与口径统一（本轮）

- **门禁与文档生成新增 Node 版**：新增 `assets/ruankao-essay-writing/scripts/check-essay.mjs` 与 `make-essay-doc.mjs`（Node ≥ 20，ESM，零依赖），macOS / Linux / Windows 通用；`.ps1` 版保留给 Windows PowerShell 5.1，两版口径一致。原先整套流程只在 Windows 上可跑。
- **统一 10 段基准**：以 `ruankao-essay-review` 的段位表为唯一口径（摘要 → 缘由 → 概况与技术 → 回应子题目 2 → 正文 3 段 → 问题与效果 → 收尾（不足与改进）→ 结论），并同步修正写作技能、写作规则、题型索引与 Client 面板此前写成 9 段的地方。此前按写作技能的流程产稿会被门禁判段数不符。
- **修正三处口径矛盾**：
  ① 段数改按**空行切块**统计（一段折行不再被算成多段），源稿与 `.doc` 生成共用同一套段落口径；
  ② 正文直引号由「必须改」降为**提示**——生成 `.doc` 时会自动转成中文引号，此前门禁与转换脚本互相矛盾；
  ③ 第一人称统计排除「我国」「忘我」等固定搭配，首段「本人作为……」的身份交代不受影响。
- **门禁纳入 CI**：新增合规样例 `tests/fixtures/sample-essay-valid.md` 与负例 `tests/fixtures/sample-essay-invalid.md`，CI 增加门禁正负例断言（此前门禁脚本本身从未被测试过）。
- **`files` 白名单补齐**：`package.json` 纳入 `check-essay.ps1`、`ingest-essay.ps1`、`scripts/health-check.ps1`、两个 `.mjs` 与测试样例，避免打包漏文件。
- **文档同步**：README 目录树、校验项数量、技能数量（两个 → 三个）、安装路径示例与已知限制按现状更新；`verify-manifest.mjs` 增加「Node 版脚本齐全且已进 files 白名单」断言。

### 新增

- **成稿门禁 `assets/ruankao-essay-writing/scripts/check-essay.ps1`**：一条命令核对段数（必须 10）、含标点字数（2500~2800）、第一人称、禁写字眼与分点标号、Markdown 粗体、标题、直引号；未输出 PASS 不得交付。已写入写作技能第 7 步，成为规范的一部分。
- **成稿入库 `assets/ruankao-essay-writing/scripts/ingest-essay.ps1`**：先跑门禁（未 PASS 拒绝入库），再统计段数／含标点／纯汉字，更新本地题库一览表（同题名更新、新题追加）、按模板追加逐题记录小节，并可同步成稿索引；支持重复执行（幂等）。
- **仓库巡检 `scripts/health-check.ps1`**：一次跑完①清单校验 12 项②6 份本地资料是否泄漏进版本库③题库与成稿数量一致性④最近一次 CI 结论，输出简报并以退出码表示是否需要处理。
- **Client 面板**：`client.js` 在 `conversation.composer.dock` 注册「题库速查」面板，含「历年真题／题型骨架／写作规格」三个页签；数据与仓库内公开版索引一致。
- **明确不发布 npm**：`package.json` 保持 `private: true`（防止误发布），并移除了 npm 发布流程；新增 `.github/workflows/github-release.yml`，打 tag 时只创建 GitHub Release。原因是 npm 打包只看 `files` 白名单、不看 `.gitignore`，写目录会把本机资料一起发出去。
- **仓库文档**：新增 `SECURITY.md`（安全策略与私密漏洞报告方式）与 `CONTRIBUTING.md`（开发流程、内容边界、PR 检查表、发布步骤）。
- `verify-manifest.mjs` 增加 Client 半校验（模块 id 必须等于包名、必须声明槽位与 `dsh.client.inject`、必须在 `files` 白名单内），共 8 项。

### 新增

- 技能 `ruankao-essay-review`：交稿前的逐段自评——先用脚本量段数与字数，再按 10 段逐段体检（子题目覆盖、实例落地、量化效果），输出「必须改／建议改」清单与逐条改写建议。
- Client 面板接入 Client locale 服务：文案走命名空间字典（zh／en 键集一致），语言切换即时生效；`dsh.client.inject` 补齐 `@deepseek-ai/dsh-client-ui-slots` 与 `@deepseek-ai/dsh-client-locale`。
- Client 面板新增「按年份筛选真题」。

### 修复

- **巡检脚本三处缺陷**（2026-10-19 巡检发现）：①成稿扫描只覆盖 `extract\parts` 根目录，漏掉 `2610预测_范文\` 等子目录，导致误报“题库与成稿数量不一致” → 改为递归扫描并按文件路径去重；②“题库行数与成稿篇数不一致”原先只记为备注，结论仍打印“全部正常” → 改为问题项并以退出码反映；③判重逻辑细化：同标题同文件视为重复行（报错），同标题不同成稿视为不同版本（提示，建议在表中区分）。
- **新增隐私守卫**：`assets/*/references/` 下若有未纳入版本控制、又未被忽略规则覆盖的文件即报警。本次巡检据此发现 63KB 的考前预测资料未加忽略规则（一次 `git add -A` 即会进公开仓库），已补入 `.git/info/exclude`。
- 撤回公开 `assets/ruankao-essay-bank/SKILL.md` 中对私有预测资料的描述，仅保留“本地参考资料不随仓库分发”的通用表述。

### 验证

- 已在 DSH **V0.2.0-rc.2** 上完成安装验证：桌面端 Web 侧边栏 Plugins → Add plugin → 粘贴本目录绝对路径；
  三个技能均可加载，输入区上方的「题库速查」面板正常显示。
- 结论：desktop profile 只能由应用安装（手工写 profile 会被应用重新生成时剔除），README 已按此更新安装说明。
### 计划中

- 本地参考资料缺失时的补齐指引与降级说明。
- 面板支持按题型关键词搜索。

## [0.1.0] - 2026-09-30

首个公开版本。

### 新增

- **Host-only bundle 插件**：向当前 profile 插入 `id: ruankao-essay` 的 Host 插件行，通过 `ctx.skills.registerProvider()` 注册两个技能。
- **技能 `ruankao-essay-writing`**：软考系统分析师论文写作与改写总纲——严格 10 段结构、含标点字数口径、禁用标题／分点标号／第一人称、子题目 1/2/3 的回应规则、Word 交付流程。
- **技能 `ruankao-essay-bank`**：题库与写作规范——历年真题题名（2016—2026）、通用理论骨架、写作规格速览、项目背景写法要点。
- **`references/topic-index-lite.md`**：公开安全版题型索引（仅含公开试题题名、教科书层面的理论骨架与作者自有素材）。
- **`scripts/make-essay-doc.ps1`**：把论文 Markdown 源稿转成 Word 可直接打开的 `.doc`（A4／宋体小四／首行缩进 2 字符／行距 1.5），并输出段数与含标点字数用于自检；已处理中文引号与破折号在 PowerShell 命令行下的丢失问题。
- **`scripts/verify-manifest.mjs`**：校验清单字段、加载器补丁、技能资产、frontmatter、脚本 BOM 与私有文件隔离。
- **GitHub Actions CI**：Linux 侧做语法与清单校验，Windows 侧用 Windows PowerShell 5.1 跑生成脚本端到端测试。
- 展示元数据：`icon.svg`、`locale/zh.json`、`locale/en.json`；`LICENSE`（MIT）、`.gitignore`、`.gitattributes`、README。

### 修复

- `make-essay-doc.ps1` 的相对输出路径：`[System.IO.File]` 使用 .NET 当前目录而 PowerShell 位置可能不同，导致相对 `-OutPath` 写到错误位置；现统一转绝对路径并自动创建输出目录。
- CI 的 Windows 作业：GitHub 会把 `run:` 脚本写成无 BOM 的临时 .ps1，Windows PowerShell 5.1 按 ANSI 误读其中的中文而报语法错误；现驱动脚本只用 ASCII 报错信息，并显式用 `powershell.exe`（5.1）执行被测脚本，全部改用绝对路径。
- CI 断言原先误把 HTML 属性里的直引号当成正文直引号，现只检查 `<body>` 内的文本。

### 变更

- 作者自备的本地参考资料不再随仓库分发：从仓库移除，改用 `.git/info/exclude` 本地忽略（`.gitignore` 不再点名任何本地资料）。
- 写作技能改为**自带通用默写检查表**，不再依赖本地参考资料；题库技能先列目录确认本地资料是否存在，再按需读取。
- `scripts/verify-manifest.mjs` 与 CI 改为**白名单式**校验：`references/` 下只允许公开文件被跟踪，不再点名任何本地文件。

### 说明

- 本仓库只包含插件代码、技能骨架、写作规范、公开的历年真题题名与通用理论骨架。
