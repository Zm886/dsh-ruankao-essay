# 更新日志

本项目的所有重要变更都记录在此文件，格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 计划中

- 可选的 Client 面板：在 DSH Web UI 侧边栏可视化浏览题库（基于 `templates/decoration` 起步）。
- 技能三 `ruankao-essay-review`：按课件批改口径对成稿逐段自评并给出修改建议。
- 本地私有题库的加载引导：当 `references/` 下缺少完整题库时，给出补齐指引与降级说明。

## [0.1.0] - 2026-09-30

首个公开版本。

### 新增

- **Host-only bundle 插件**：向当前 profile 插入 `id: ruankao-essay` 的 Host 插件行，通过 `ctx.skills.registerProvider()` 注册两个技能。
- **技能 `ruankao-essay-writing`**：软考系统分析师论文写作与改写总纲——严格 10 段结构、含标点字数口径、禁用标题／分点标号／第一人称、子题目 1/2/3 的回应规则、Word 交付流程。
- **技能 `ruankao-essay-bank`**：题库与素材库——历年真题题名（2016—2026）、通用理论骨架、写作规格速览、作者自有项目背景，以及成稿索引。
- **`references/topic-index-lite.md`**：公开安全版题型索引（仅含公开试题题名、教科书层面的理论骨架与作者自有素材）。
- **`scripts/make-essay-doc.ps1`**：把论文 Markdown 源稿转成 Word 可直接打开的 `.doc`（A4／宋体小四／首行缩进 2 字符／行距 1.5），并输出段数与含标点字数用于自检；已处理中文引号与破折号在 PowerShell 命令行下的丢失问题。
- **`scripts/verify-manifest.mjs`**：校验清单字段、加载器补丁、技能资产、frontmatter、脚本 BOM 与私有文件隔离。
- **GitHub Actions CI**：Linux 侧做语法与清单校验，Windows 侧用 Windows PowerShell 5.1 跑生成脚本端到端测试。
- 展示元数据：`icon.svg`、`locale/zh.json`、`locale/en.json`；`LICENSE`（MIT）、`.gitignore`、`.gitattributes`、README。

### 修复

- `make-essay-doc.ps1` 的相对输出路径：`[System.IO.File]` 使用 .NET 当前目录而 PowerShell 位置可能不同，导致相对 `-OutPath` 写到错误位置；现统一转绝对路径并自动创建输出目录。
- CI 的 Windows 作业：GitHub 会把 `run:` 脚本写成无 BOM 的临时 .ps1，Windows PowerShell 5.1 按 ANSI 误读其中的中文而报语法错误；现驱动脚本只用 ASCII 报错信息，并显式用 `powershell.exe`（5.1）执行被测脚本，全部改用绝对路径。
- CI 断言原先误把 HTML 属性里的直引号当成正文直引号，现只检查 `<body>` 内的文本。

### 说明

- 本仓库为**公开安全版**：第三方课件与他人范文提炼出的 4 份题库文件（`type-index.md`、`essay-bank.md`、`exam-points.md`、`courseware-3-4.md`）留在本地，已写入 `.gitignore`，且不在 git 历史与对象库中。
- 作者自有的项目素材与成稿（`finished-essays.md`、`quick-cards.md`、`writing-rules.md`）随仓库分发。
