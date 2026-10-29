#!/usr/bin/env node
/**
 * 技能描述生成器：把各 SKILL.md 的 YAML frontmatter 描述写进 index.js。
 *
 * 背景：每个技能的 description 过去手写两份——index.js 的 SKILLS 数组一份、
 * assets/<name>/SKILL.md 的 frontmatter 一份，两份已漂移（插件方式看到的描述与
 * 文件系统方式看到的描述不一致）。现在 frontmatter 是唯一来源，index.js 里的
 * 描述由本脚本生成。
 *
 * 用法：
 *   node scripts/build-skill-descriptions.mjs           # 生成（写入）
 *   node scripts/build-skill-descriptions.mjs --check   # 只校验，不一致则 exit 1
 *
 * 退出码：0 一致/已生成；1 --check 发现不一致；2 参数或文件错误
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_PATH = resolve(root, "index.js");
const ASSETS_DIR = resolve(root, "assets");

const BEGIN = "// >>> BEGIN generated: skill-descriptions";
const END = "// <<< END generated: skill-descriptions";

/** 与 index.js 的登记顺序一致。 */
const ORDER = ["ruankao-essay-writing", "ruankao-essay-review", "ruankao-essay-bank"];

const USAGE = "用法：node scripts/build-skill-descriptions.mjs [--check]";

/**
 * 解析 SKILL.md 的 YAML frontmatter，取出 name 与 description。
 * @param {string} text
 * @returns {{name: string, description: string}}
 */
function parseFrontmatter(text) {
  if (!text.startsWith("---")) throw new Error("缺少 YAML frontmatter");
  const end = text.indexOf("\n---", 3);
  if (end === -1) throw new Error("frontmatter 未闭合");
  const frontmatter = text.slice(3, end);
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (!name) throw new Error("frontmatter 缺少 name");
  if (!description) throw new Error("frontmatter 缺少 description");
  return { name, description };
}

/**
 * 收集 assets/ 下每个技能的描述（按 ORDER 排序）。
 * @returns {{name: string, description: string}[]}
 */
function collectSkills() {
  const skills = [];
  for (const entry of readdirSync(ASSETS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = resolve(ASSETS_DIR, entry.name, "SKILL.md");
    if (!existsSync(skillFile)) continue;
    skills.push(parseFrontmatter(readFileSync(skillFile, "utf8")));
  }
  if (skills.length === 0) throw new Error("assets/ 下没有找到任何 SKILL.md");
  skills.sort((a, b) => {
    const ia = ORDER.indexOf(a.name);
    const ib = ORDER.indexOf(b.name);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return skills;
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  for (const arg of args) {
    if (arg !== "--check" && arg !== "--help" && arg !== "-h") {
      console.error(`未知参数：${arg}\n${USAGE}`);
      process.exit(2);
    }
  }
  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    process.exit(2);
  }

  const skills = collectSkills();
  const lines = ["const SKILL_DESCRIPTIONS = {"];
  for (const skill of skills) {
    lines.push(`  ${JSON.stringify(skill.name)}: ${JSON.stringify(skill.description)},`);
  }
  lines.push("};");

  const content = readFileSync(INDEX_PATH, "utf8");
  const start = content.indexOf(BEGIN);
  const end = content.indexOf(END, start === -1 ? 0 : start);
  if (start === -1 || end === -1) {
    console.error(`index.js 里找不到生成标记（${BEGIN}）`);
    process.exit(2);
  }
  // 保留起始标记所在行的缩进
  const lineStart = content.lastIndexOf("\n", start) + 1;
  const indent = content.slice(lineStart, start);
  const endLineStart = content.lastIndexOf("\n", end) + 1;
  const head = content.slice(0, lineStart) + indent + BEGIN;
  const tail = content.slice(endLineStart);
  const updated = `${head}\n${lines.join("\n")}\n${tail}`;

  if (updated === content) {
    console.log("index.js 的技能描述已是最新。");
    return;
  }
  if (check) {
    console.error("✗ index.js 的技能描述与 SKILL.md 的 frontmatter 不一致");
    console.error("  请运行：node scripts/build-skill-descriptions.mjs");
    process.exit(1);
  }
  writeFileSync(INDEX_PATH, updated, "utf8");
  console.log(`已更新：index.js（${skills.length} 个技能描述）`);
}

main();
