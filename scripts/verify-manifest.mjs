#!/usr/bin/env node
/**
 * 校验插件清单与技能资产的一致性（CI 与本地共用）。
 *
 * 检查项：
 *  1. package.json 具备 dsh.bundle.patch / manifestVersion / meta / icon / main
 *  2. cordis.patch.yml 声明的插件 id 与包名正确
 *  3. index.js 登记的每个技能都有 assets/<name>/SKILL.md，且 frontmatter 的 name 与目录名一致、description 非空
 *  4. 写作技能引用的生成脚本存在，且为带 BOM 的 UTF-8
 *  5. 私有题库文件未被纳入版本控制（git 可用时）
 *
 * 用法：node scripts/verify-manifest.mjs
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const notes = [];

const fail = (message) => problems.push(message);
const ok = (message) => notes.push(message);
const read = (relative) => readFileSync(join(root, relative), "utf8");

// 1) package.json
let pkg;
try {
  pkg = JSON.parse(read("package.json"));
} catch (error) {
  fail(`package.json 无法解析：${error.message}`);
  report();
}

if (pkg.dsh?.bundle?.patch !== "./cordis.patch.yml") fail("package.json 缺少 dsh.bundle.patch 或指向不正确");
if (pkg.dsh?.manifestVersion !== 1) fail("package.json 缺少 dsh.manifestVersion: 1");
if (!pkg.meta?.title || !pkg.meta?.description) fail("package.json 缺少 meta.title 或 meta.description");
if (!pkg.icon) fail("package.json 缺少 icon");
else if (!existsSync(join(root, pkg.icon))) fail(`icon 文件不存在：${pkg.icon}`);
if (!pkg.main) fail("package.json 缺少 main");
if (!pkg.peerDependencies?.["@deepseek-ai/dsh-skill"]) fail("package.json 缺少 @deepseek-ai/dsh-skill 依赖声明");
ok(`manifest: ${pkg.name}@${pkg.version}`);

// 2) cordis.patch.yml
const patch = read("cordis.patch.yml");
const patchId = patch.match(/^\s*-?\s*id:\s*([a-z0-9-]+)\s*$/m)?.[1];
const patchName = patch.match(/name:\s*'([^']+)'/)?.[1];
if (!patch.includes("insert:")) fail("cordis.patch.yml 缺少 insert 段");
if (patchId !== "ruankao-essay") fail(`cordis.patch.yml 的插件 id 应为 ruankao-essay，实际为 ${patchId}`);
if (patchName !== pkg.name) fail(`cordis.patch.yml 的 name 应为 ${pkg.name}，实际为 ${patchName}`);
ok(`patch: id=${patchId} name=${patchName}`);

// 3) index.js 登记的技能与资产
const index = read("index.js");
const skillNames = [...index.matchAll(/dir:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]);
if (skillNames.length === 0) fail("index.js 未登记任何技能");
for (const name of skillNames) {
  const skillPath = `assets/${name}/SKILL.md`;
  if (!existsSync(join(root, skillPath))) {
    fail(`技能 ${name} 缺少 ${skillPath}`);
    continue;
  }
  const body = read(skillPath);
  const frontmatter = body.startsWith("---") ? body.split("\n---")[0] : undefined;
  if (!frontmatter) {
    fail(`${skillPath} 缺少 YAML frontmatter（文件系统方式发现技能时需要）`);
    continue;
  }
  const declared = frontmatter.match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? "";
  if (declared !== name) fail(`${skillPath} 的 frontmatter name=${declared}，与目录名 ${name} 不一致`);
  if (description.length < 40) fail(`${skillPath} 的 description 过短，模型难以判断何时加载`);
  ok(`skill: ${name}（frontmatter 正确，description ${description.length} 字符）`);
}

// 4) 生成脚本存在且带 BOM
const scriptPath = "assets/ruankao-essay-writing/scripts/make-essay-doc.ps1";
if (!existsSync(join(root, scriptPath))) {
  fail(`生成脚本缺失：${scriptPath}`);
} else {
  const bytes = readFileSync(join(root, scriptPath));
  const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  if (!hasBom) fail(`${scriptPath} 必须保存为带 BOM 的 UTF-8（Windows PowerShell 5.1 会按 ANSI 误读中文）`);
  else ok(`script: ${scriptPath}（${bytes.length} 字节，BOM 正确）`);
  if (!read("assets/ruankao-essay-writing/SKILL.md").includes("make-essay-doc.ps1")) {
    fail("写作技能未引用生成脚本");
  }
}

// 5) 技能引用的公开索引必须存在
for (const required of [
  "assets/ruankao-essay-bank/references/topic-index-lite.md",
  "assets/ruankao-essay-writing/references/writing-rules.md",
  "LICENSE",
  "README.md",
  "CHANGELOG.md",
]) {
  if (!existsSync(join(root, required))) fail(`缺少必备文件：${required}`);
}
ok(`必备文件齐全（${statSync(join(root, "README.md")).size} 字节 README 等）`);

// 6) references/ 下只允许公开文件进入版本控制（本地资料用 .git/info/exclude 忽略）
const PUBLIC_REFERENCES = new Set([
  "assets/ruankao-essay-bank/references/topic-index-lite.md",
  "assets/ruankao-essay-writing/references/writing-rules.md",
]);
try {
  const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const unexpected = tracked.filter(
    (file) => file.includes("/references/") && !PUBLIC_REFERENCES.has(file),
  );
  if (unexpected.length > 0) {
    fail(`references/ 下出现了不应入库的文件：${unexpected.join(", ")}`);
  } else {
    ok("references/ 下只有公开文件被跟踪（本地资料未入库）");
  }
} catch {
  ok("未检测到 git 环境，跳过版本控制检查");
}

report();

function report() {
  for (const note of notes) console.log(`  ok  ${note}`);
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  !!  ${problem}`);
    console.error(`\n清单校验失败：${problems.length} 项`);
    process.exit(1);
  }
  console.log(`\n清单校验通过：${notes.length} 项`);
}
