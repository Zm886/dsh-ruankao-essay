# 安全策略

## 适用范围

`dsh-ruankao-essay` 是一个 **Host-only 的 DSH 插件包**，由两部分组成：

- Host 半：`index.js`，仅向 `ctx.skills` 注册两个技能，不联网、不收集数据、不启动服务；
- 技能资源：`assets/` 下的 Markdown 说明与一个本地 PowerShell 脚本 `make-essay-doc.ps1`。

因此本项目的攻击面很小，但仍欢迎报告任何与下列情形有关的问题。

## 支持版本

| 版本 | 支持 |
|---|---|
| 0.1.x | ✅ |
| 更早 | ❌（未发布） |

## 请报告的问题类型

- `index.js` 中可能导致任意代码执行、路径穿越或权限提升的写法；
- `make-essay-doc.ps1` 中的命令注入、任意文件写入、路径穿越（例如 `-MdPath` / `-OutPath` 指向敏感位置）；
- 技能说明会诱导模型读取或外传本机敏感文件的内容（提示注入类问题）；
- 仓库中意外包含了不应公开的内容（第三方课程资料、他人作品、个人资料、令牌或密钥）。

## 如何报告

- 一般问题：在本仓库开 Issue；
- **敏感问题**（可利用细节、泄露内容、密钥）：请勿开公开 Issue，改用 GitHub 的
  [私密漏洞报告](https://docs.github.com/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  功能，或通过仓库所有者主页上的联系方式直接告知。

请附上：受影响版本、复现步骤或最小示例、影响范围，以及你建议的修复方向（如有）。

## 处理承诺

- 确认收到：3 个工作日内；
- 初步评估与修复计划：7 个工作日内；
- 修复后会在 `CHANGELOG.md` 中记录，并在必要时发布补丁版本。

## 使用者须知

- 本插件只提供**写作规范、公开考题信息与理论骨架**，不含任何第三方课程资料；
- 脚本会把 Markdown 转成 Word 可打开的 `.doc`，请在**你自己的项目目录**内指定输出路径；
- 不要把本仓库用于商业用途或再分发他人资料，详见 `LICENSE`。
