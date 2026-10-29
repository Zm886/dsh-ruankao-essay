#!/usr/bin/env node
/**
 * 题库数据生成器：把 topic-index.json（唯一数据源）写进 client.js 与 topic-index-lite.md。
 *
 * 用法：
 *   node scripts/build-client-data.mjs           # 生成（写入）
 *   node scripts/build-client-data.mjs --check   # 只校验是否与数据源一致，不一致则 exit 1
 *
 * 生成区块（人眼可见，请勿手改；改数据请改 topic-index.json 后重新生成）：
 *   client.js            // >>> BEGIN generated: client-data ... // <<< END generated: client-data
 *   topic-index-lite.md  <!-- BEGIN generated: exams --> ... <!-- END generated: exams -->
 *                         <!-- BEGIN generated: skeletons --> ... <!-- END generated: skeletons -->
 *                         <!-- BEGIN generated: rules --> ... <!-- END generated: rules -->
 *
 * 退出码：0 一致/已生成；1 --check 发现不一致；2 参数或文件错误
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = resolve(root, "assets/ruankao-essay-bank/references/topic-index.json");
const CLIENT_PATH = resolve(root, "client.js");
const MD_PATH = resolve(root, "assets/ruankao-essay-bank/references/topic-index-lite.md");

const USAGE = "用法：node scripts/build-client-data.mjs [--check]";

/**
 * 读取数据源。
 * @returns {{exams: object[], skeletons: object[], rules: string[]}}
 */
function loadData() {
  const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  for (const key of ["exams", "skeletons", "rules"]) {
    if (!Array.isArray(data[key]) || data[key].length === 0) {
      throw new Error(`topic-index.json 缺少非空的 ${key} 数组`);
    }
  }
  return data;
}

/**
 * 替换标记区块内的内容。
 * @param {string} content 文件内容
 * @param {string} beginMarker 起始标记（整行）
 * @param {string} endMarker 结束标记（整行）
 * @param {string[]} body 新的区块正文行
 * @returns {string}
 */
function replaceRegion(content, beginMarker, endMarker, body) {
  const start = content.indexOf(beginMarker);
  if (start === -1) throw new Error(`找不到起始标记：${beginMarker.trim()}`);
  const end = content.indexOf(endMarker, start);
  if (end === -1) throw new Error(`找不到结束标记：${endMarker.trim()}`);
  const head = content.slice(0, start + beginMarker.length);
  const tail = content.slice(end);
  const indent = beginMarker.match(/^\s*/)[0];
  const rendered = body.map((line) => `${indent}${line}`).join("\n");
  return `${head}\n${rendered}\n${tail}`;
}

/** 生成 client.js 的数据段（EXAMS / SKELETONS / RULES）。 */
function renderClientBlock(data) {
  const lines = [];
  lines.push("");
  lines.push("const EXAMS = " + JSON.stringify(data.exams, null, 2).split("\n").join("\n") + ";");
  lines.push("");
  lines.push("const SKELETONS = " + JSON.stringify(data.skeletons, null, 2).split("\n").join("\n") + ";");
  lines.push("");
  lines.push("const RULES = " + JSON.stringify(data.rules, null, 2).split("\n").join("\n") + ";");
  return lines;
}

/** 生成真题题名表格（Markdown）。 */
function renderExamsTable(data) {
  const lines = ["| 年份 | 试题一 | 试题二 | 试题三 | 试题四 |", "|---|---|---|---|---|"];
  for (const exam of data.exams) {
    const cells = [exam.year];
    for (let i = 0; i < 4; i += 1) cells.push(exam.titles[i] ?? "—");
    lines.push(`| ${cells.join(" | ")} |`);
  }
  return lines;
}

/** 生成通用理论骨架列表（Markdown）。 */
function renderSkeletonList(data) {
  return data.skeletons.map((skeleton) => `- **${skeleton.name}**：${skeleton.points.join("；")}。`);
}

/** 生成写作规格速览列表（Markdown）。 */
function renderRuleList(data) {
  return data.rules.map((rule) => `- ${rule}。`);
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

  const data = loadData();
  const targets = [
    {
      path: CLIENT_PATH,
      begin: "    // >>> BEGIN generated: client-data",
      end: "    // <<< END generated: client-data",
      body: renderClientBlock(data),
    },
    {
      path: MD_PATH,
      begin: "<!-- BEGIN generated: exams -->",
      end: "<!-- END generated: exams -->",
      body: renderExamsTable(data),
    },
    {
      path: MD_PATH,
      begin: "<!-- BEGIN generated: skeletons -->",
      end: "<!-- END generated: skeletons -->",
      body: renderSkeletonList(data),
    },
    {
      path: MD_PATH,
      begin: "<!-- BEGIN generated: rules -->",
      end: "<!-- END generated: rules -->",
      body: renderRuleList(data),
    },
  ];

  // 同一文件可能有多个区块：按出现顺序依次替换
  const byFile = new Map();
  for (const target of targets) {
    if (!byFile.has(target.path)) byFile.set(target.path, []);
    byFile.get(target.path).push(target);
  }

  let changed = 0;
  for (const [path, list] of byFile) {
    if (!existsSync(path)) {
      console.error(`找不到文件：${path}`);
      process.exit(2);
    }
    let content = readFileSync(path, "utf8");
    const original = content;
    for (const target of list) {
      content = replaceRegion(content, target.begin, target.end, target.body);
    }
    if (content === original) continue;
    changed += 1;
    if (check) {
      console.error(`✗ 生成区块与 topic-index.json 不一致：${path.replace(`${root}/`, "")}`);
      console.error("  请运行：node scripts/build-client-data.mjs");
      process.exitCode = 1;
    } else {
      writeFileSync(path, content, "utf8");
      console.log(`已更新：${path.replace(`${root}/`, "")}`);
    }
  }

  if (check) {
    if (changed === 0) {
      console.log("生成区块与 topic-index.json 一致。");
    } else {
      console.error(`共 ${changed} 个文件需要重新生成。`);
    }
  } else if (changed === 0) {
    console.log("生成区块已是最新，无需改动。");
  }
}

main();
