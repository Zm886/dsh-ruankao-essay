# 更新日志

本项目的所有重要变更都记录在此文件，格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

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
