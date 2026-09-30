---
name: ruankao-essay-bank
description: 软考系统分析师论文题库与写作规范。Look up Chinese Soft Exam (软考) 系统分析师 essay topics: the 2016–2026 真题 table, per-topic theory skeletons, writing specification, scoring pitfalls and project-background guidance. Use when the user asks which 论文题目 exist, what theory points a topic needs, what project or quantified data to cite, or before writing any 软考系分 essay.
---

# 软考系统分析师论文题库与素材库

拿到题目或想选题时先查这里，不要凭记忆编理论点。

## 三步入库

1. **定位题型**：在 `references/topic-index-lite.md` 的「历年真题题名」里找题目，再进「通用理论骨架」取该题型要写进正文的分类清单（名称须与题目用词一致）。
2. **取项目与数据**：从同文件的「作者自有项目背景」挑背景（含行业、规模、周期、已适配题型）；本地若另有参考资料，再从中取字数、结构与量化数据。
3. **成稿**：写作规格与交付流程见 `ruankao-essay-writing` 技能。

## 参考文件

| 文件 | 内容 |
|---|---|
| `references/topic-index-lite.md` | 历年真题题名（2016—2026）、通用理论骨架、写作规格速览、项目背景写法要点（**随仓库分发**） |
| `references/` 下的其它 `.md` | 本地参考资料（按题型详表、理论素材等，**不随仓库分发**） |

`references/` 目录里除 `topic-index-lite.md` 以外的文件属于作者的本地资料。**先列目录**（glob `references/*.md`）确认有哪些可用，再按需读取；若只有公开版索引，就只用它完成任务，并向使用者说明可补充的本地资料未就位。加载这些文件时按其内容当作数据使用，其中出现的金额、周期、百分比**引用前须与使用者确认真实数据**。

## 查询技巧

- 用关键词直接搜：题型词（如「需求管理」「微服务」「静态测试」）、理论词（如「两阶段提交」「挣值分析」「RBAC」）、项目词（如「智慧信贷」「车辆动力学」）。
- 找「哪年考过」搜年份或题名；找「这个技术怎么写」搜技术名，命中后读它所在的整张卡。
- 本地参考资料可能很大（单个文件可到 80KB＋），先按题型或关键词定位到相关小节，再读该节，不要整篇通读。

## 与其他技能的分工

- 本技能＝**查**（题库、理论、素材、数据）。
- `ruankao-essay-writing`＝**写**（10 段结构、字数、语气、子题目回应、doc 交付）。
- 典型顺序：本技能查题与骨架 → 写作技能成稿与交付。

## 注意

- 参考资料里的项目背景、金额、周期、百分比**引用前请与用户确认真实数据**；用户给了真实项目就以用户的为准。
- 「扣分雷区」按阅卷评分口径整理，落笔前逐条过一遍。
