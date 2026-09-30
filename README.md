# 软考系分论文助手 · DSH 插件

把「软考系统分析师论文」的题库、写作规则、范文精华与成稿模板打包成 DSH 插件，装上以后在任意会话里都能直接调用。

- **插件名（包名）**：`dsh-ruankao-essay`
- **Host 插件行 id**：`ruankao-essay`
- **提供的技能**：`ruankao-essay-writing`（写作／改写总纲）、`ruankao-essay-bank`（题库与素材库）
- **形态**：Host-only bundle（纯 JS，无构建步骤、无第三方依赖）

## 一、它解决什么问题

写软考系分论文的痛点不是「不会写」，而是每次都要重新回忆：这篇题目的子题目有哪几块、该配哪个项目、理论点怎么写全、字数与结构怎么卡、成稿怎么变成 Word。本插件把这些固化成两个技能：

| 技能 | 干什么 | 何时加载 |
|---|---|---|
| `ruankao-essay-bank` | 查：真题表（2016—2026）、按题型的理论骨架与扣分雷区、29 张范文精华卡、24 个可复用项目背景、10 篇本工作区成稿 | 拿到题目先查它 |
| `ruankao-essay-writing` | 写：10 段式结构、字数口径、语气禁忌、子题目回应规则、Word 交付脚本 | 动笔与交付时 |

两者配合的完整链路：**查题 → 定骨架 → 配实例 → 成稿 → 自检 → 生成 .doc**。

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

## 三、目录结构

```
dsh-ruankao-essay/
├─ package.json          # dsh.bundle.patch、meta、icon、files
├─ cordis.patch.yml      # 向 profile 插入 id: ruankao-essay 的 Host 插件行
├─ index.js              # Cordis 插件：ctx.skills.registerProvider(...) 注册两个技能
├─ icon.svg              # 插件卡片图标
├─ locale/{zh,en}.json   # 插件卡片标题与描述
└─ assets/
   ├─ ruankao-essay-writing/          # 技能一：写
   │  ├─ SKILL.md
   │  ├─ references/{writing-rules.md, quick-cards.md}
   │  └─ scripts/make-essay-doc.ps1   # Markdown → Word 可打开的 .doc（含段数与字数自检）
   └─ ruankao-essay-bank/             # 技能二：查
      ├─ SKILL.md
      └─ references/{topic-index-lite.md, finished-essays.md, 以及本地私有的 4 份题库文件}
```

脚本放在写作技能目录内，因此无论是「插件资源基」还是「技能目录」安装，`<skill-directory>/scripts/make-essay-doc.ps1` 都能正确定位。

## 四、用起来是什么样

会话里出现「写软考系分论文 / 这个论文题目怎么写 / 押题」之类需求时，Agent 会加载技能，然后：

1. 在 `references/topic-index-lite.md` 里定位题目（真题题名、通用理论骨架、写作规格、可选项目），若本地放了完整题库则改用 `type-index.md`（含扣分雷区与范文素材）；
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

- **加题型**：往 `assets/ruankao-essay-bank/references/type-index.md` 增加题型条目，或往 `essay-bank.md` 追加精华卡。
- **加技能**：在 `assets/` 下新建 `<kebab-case-name>/SKILL.md`（带 frontmatter），再到 `index.js` 的 `SKILLS` 数组登记一条即可。
- **改交付格式**：`scripts/make-essay-doc.ps1` 里的 `@page`／字体／字号／行距都可调；中文标点务必用 `[char]` 码点构造，脚本必须保存为**带 BOM 的 UTF-8**（本机是 Windows PowerShell 5.1，无 BOM 会按 ANSI 误读中文）。

## 六、验证与已知限制

- 语法自检：`node --check index.js`；清单自检：`node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"`。
- 技能是否生效：装好后新开会话，用 `skill` 工具按名字加载 `ruankao-essay-bank`，能返回目录即成功；或在设置页插件清单里看到「软考系分论文助手」。
- 库内的项目金额、周期、百分比多取自范文与素材池，**正式提交前请与自己的真实项目数据核对**。
- 本插件只提供技能与脚本，不含 UI 面板；若想要侧边栏可视化题库，需要再加 Client 插件（可用 `templates/decoration` 起步）。

## 七、公开版与本地私有内容

本仓库是**公开安全版**：只包含插件代码、两个技能的骨架、写作规格、公开的历年真题题名、通用理论骨架，以及作者自有的项目素材。

以下 4 份文件由第三方课件与他人范文提炼而来，**留在本地、不随仓库分发**（已写入 `.gitignore`，且不在 git 历史中）：

| 本地文件 | 内容 |
|---|---|
| `assets/ruankao-essay-bank/references/type-index.md` | 按题型详表与项目素材池 |
| `assets/ruankao-essay-bank/references/essay-bank.md` | 范文精华卡（九项式） |
| `assets/ruankao-essay-bank/references/exam-points.md` | 考点速记与评分标准 |
| `assets/ruankao-essay-bank/references/courseware-3-4.md` | 课件整理与批改口径 |

克隆本仓库后，若需要完整题库，把这 4 份文件放回 `assets/ruankao-essay-bank/references/` 即可；缺失时技能会自动退化为只用公开版索引，并在回答中说明完整题库未就位。

## 八、从 GitHub 安装

```powershell
git clone https://github.com/Zm886/dsh-ruankao-essay.git
# 然后按「二、安装」的方式 A 或方式 B 安装
```

## 九、许可

MIT（见 `LICENSE`）。仓库内不含第三方课件与范文内容；若你在本地补入这类资料，请自行确认其使用范围，仅供个人备考，勿再分发或商用。

