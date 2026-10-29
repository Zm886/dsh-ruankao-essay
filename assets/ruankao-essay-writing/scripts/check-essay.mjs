#!/usr/bin/env node
/**
 * 成稿门禁自检（评分口径）：格式硬约束 + 段落职能 + 实例密度 + 子题目术语覆盖
 *
 * 用法：
 *   node check-essay.mjs --md <成稿.md>
 *   node check-essay.mjs --md <成稿.md> --min 2500 --max 2800
 *   node check-essay.mjs --md <成稿.md> --require-terms "架构需求,架构设计,架构文档化"
 *
 * 退出码：0 = PASS；1 = 不达标（详见输出）；2 = 文件缺失 / 参数错误
 *
 * 检查项：
 *   A 格式：段数=10、含标点 2500~2800、无第一人称、无禁写字眼与分点标号、无粗体、无标题
 *            （直引号只作提示，不计入不达标项——生成 .doc 时会自动转为中文引号）
 *   B 段落职能：首段含身份/金额/周期；建设期（年+月）只允许出现在首段；末三段含量化效果与不足改进
 *   C 实例密度：第 4~8 段（回应段＋正文区）中至少 3 段含具体数字（阿拉伯数字或中文数字+单位）
 *   D 术语覆盖：--require-terms 给出的分类名称必须全部命中（对应子题目 2 的显性点题）
 *
 * 段落切分口径（与 make-essay-doc.ps1 / make-essay-doc.mjs 完全一致）：
 *   1) 先整体剥掉 HTML 注释 <!-- ... -->（含多行）
 *   2) 按空行切块：连续的空行/仅空白行作为分隔，每个非空块 = 一段
 *   3) 块内的换行直接拼接（不插空格）；去掉每行行首的 Markdown 标题标记 # 与粗体标记 ** 后再拼接
 *   4) 段数 = 块数，必须 = 10
 */

import { existsSync, readFileSync } from "node:fs";

const DEFAULT_MIN = 2500;
const DEFAULT_MAX = 2800;

// 禁写字眼：标题式字眼只在段首/带冒号时算，避免“摘要算法”“专业背景”这类正常用词误报
const BANNED_HEAD = /^(摘要|背景)|摘要[：:]|背景[：:]|摘要段|背景段/;
const BANNED_ANY = /子题目|第一，|第二，|首先|一是|二是|三是/g;
// 建设期（年 + 月）
const BUILD_PERIOD = /\d{4}\s*年\s*\d{1,2}\s*月/g;
// 实例密度：中文数字 + 单位
const NUM_UNIT = /[一二三四五六七八九十百千万亿两]+(个|余|类|项|天|小时|分钟|秒|次|成|倍|年|月|日|人|台|套|层|条|万|亿)/;

const USAGE = `用法：
  node check-essay.mjs --md <成稿.md> [--min 2500] [--max 2800] [--require-terms "词1,词2,词3"]`;

/**
 * 解析命令行参数。
 * @returns {{ok: true, opts: object} | {ok: false, message: string}}
 */
function parseArgs(argv) {
  const opts = { md: null, min: DEFAULT_MIN, max: DEFAULT_MAX, requireTerms: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const eq = arg.indexOf("=");
    const flag = eq === -1 ? arg : arg.slice(0, eq);
    const inlineValue = eq === -1 ? null : arg.slice(eq + 1);
    const takeValue = () => {
      if (inlineValue !== null) return inlineValue;
      i += 1;
      if (i >= argv.length) return null;
      return argv[i];
    };

    switch (flag) {
      case "--md":
      case "--md-path": {
        const value = takeValue();
        if (value === null) return { ok: false, message: "缺少 --md 的取值" };
        opts.md = value;
        break;
      }
      case "--min": {
        const value = takeValue();
        const num = Number(value);
        if (value === null || !Number.isFinite(num)) return { ok: false, message: "--min 需要一个整数" };
        opts.min = Math.trunc(num);
        break;
      }
      case "--max": {
        const value = takeValue();
        const num = Number(value);
        if (value === null || !Number.isFinite(num)) return { ok: false, message: "--max 需要一个整数" };
        opts.max = Math.trunc(num);
        break;
      }
      case "--require-terms": {
        const value = takeValue();
        if (value === null) return { ok: false, message: "--require-terms 需要一个取值" };
        for (const term of value.split(",")) {
          const trimmed = term.trim();
          if (trimmed !== "") opts.requireTerms.push(trimmed);
        }
        break;
      }
      case "-h":
      case "--help":
        return { ok: false, message: USAGE };
      default:
        return { ok: false, message: `未知参数：${arg}\n${USAGE}` };
    }
  }
  if (!opts.md) return { ok: false, message: `缺少必填参数 --md\n${USAGE}` };
  return { ok: true, opts };
}

/**
 * 剥掉 HTML 注释（含多行）。
 * @param {string} text
 * @returns {string}
 */
function stripHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * 按统一口径切段：空行分隔，块内换行直接拼接，去掉行首 # 与 ** 标记。
 * @param {string} text 原始 Markdown 全文
 * @returns {{paragraphs: string[], rawBlocks: string[][], rawJoined: string}}
 */
export function splitParagraphs(text) {
  const rawLines = stripHtmlComments(text).split(/\r?\n/);
  const rawBlocks = [];
  let current = [];
  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (line === "") {
      if (current.length > 0) {
        rawBlocks.push(current);
        current = [];
      }
      continue;
    }
    current.push(line);
  }
  if (current.length > 0) rawBlocks.push(current);

  const paragraphs = [];
  let rawJoined = "";
  for (const block of rawBlocks) {
    rawJoined += block.join("");
    let joined = "";
    for (const line of block) {
      joined += line.replace(/^#{1,6}\s*/, "").replace(/\*\*/g, "");
    }
    paragraphs.push(joined);
  }
  return { paragraphs, rawBlocks, rawJoined };
}

/**
 * 统计纯汉字（统一汉字区 0x4E00-0x9FA5）。
 * @param {string} text
 * @returns {number}
 */
function countHanzi(text) {
  let count = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 0x4e00 && code <= 0x9fa5) count += 1;
  }
  return count;
}

/**
 * 第一人称计数：匹配 我|咱，但固定搭配 我国 / 忘我 不计。
 * @param {string} text
 * @returns {number}
 */
function countFirstPerson(text) {
  const cleaned = text.replace(/我国|忘我/g, "");
  return (cleaned.match(/我|咱/g) ?? []).length;
}

/**
 * 禁写字眼计数：段首式标题字眼（命中记 1）+ 任意位置的分点标号（按出现次数记）。
 * @param {string[]} paragraphs
 * @returns {number}
 */
function countBanned(paragraphs) {
  let banned = 0;
  for (const paragraph of paragraphs) {
    if (BANNED_HEAD.test(paragraph)) banned += 1;
    banned += (paragraph.match(BANNED_ANY) ?? []).length;
  }
  return banned;
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed.ok) {
    console.error(parsed.message);
    process.exit(2);
  }
  const opts = parsed.opts;

  if (!existsSync(opts.md)) {
    console.log(`[缺失] ${opts.md}`);
    process.exit(2);
  }

  const rawText = readFileSync(opts.md, "utf8");
  const { paragraphs, rawBlocks, rawJoined } = splitParagraphs(rawText);
  const paras = paragraphs.length;
  const body = paragraphs.join("");

  const chars = body.replace(/\s/g, "").length;
  const hanzi = countHanzi(body);
  const firstMe = countFirstPerson(body);
  const banned = countBanned(paragraphs);
  const bold = (rawJoined.match(/\*\*/g) ?? []).length;
  const titles = rawBlocks.reduce(
    (sum, block) => sum + block.filter((line) => /^#{1,6}\s/.test(line)).length,
    0,
  );
  const straight = (body.match(/"/g) ?? []).length;

  const problems = [];

  // A 格式
  if (paras !== 10) problems.push(`A 段数应为 10，实际 ${paras}`);
  if (chars < opts.min || chars > opts.max) {
    problems.push(`A 含标点字数应在 ${opts.min}~${opts.max}，实际 ${chars}`);
  }
  if (firstMe !== 0) problems.push(`A 正文出现第一人称 ${firstMe} 处`);
  if (banned !== 0) problems.push(`A 出现禁写字眼/分点标号 ${banned} 处`);
  if (bold !== 0) problems.push(`A 出现 Markdown 粗体 ${bold} 处`);
  if (titles !== 0) problems.push(`A 出现 Markdown 标题 ${titles} 行`);
  // 直引号只作提示，不计入不达标项（生成 .doc 时会自动转为中文引号）

  // B 段落职能
  if (paras >= 1) {
    const p1 = paragraphs[0];
    if (!p1.includes("本人")) problems.push("B 首段未见身份交代（本人作为……）");
    if (!p1.includes("万")) problems.push("B 首段未见金额（万元）");
    if (!p1.includes("月")) problems.push("B 首段未见周期（月）");
  }
  if (paras > 1) {
    const laterText = paragraphs.slice(1).join("");
    const periodHits = (laterText.match(BUILD_PERIOD) ?? []).length;
    if (periodHits > 0) {
      problems.push(`B 建设期（年+月）在首段之后出现 ${periodHits} 次，应只写在首段`);
    }
  }
  if (paras >= 3) {
    const tailText = paragraphs.slice(-3).join("");
    if (!/%|百分之|成|倍/.test(tailText)) {
      problems.push('B 末三段未见量化效果（%，或"成/倍"等量化表述）');
    }
    if (!/不足|改进|局限|反思|有待|尚需/.test(tailText)) {
      problems.push("B 末三段未见不足与改进（或反思/局限）");
    }
  }

  // C 实例密度：第 4~8 段（回应 + 正文区）中至少 3 段带具体数字（允许一段为分类/理论段）
  if (paras >= 8) {
    let withNum = 0;
    for (let i = 4; i <= 8; i += 1) {
      if (/\d/.test(paragraphs[i - 1]) || NUM_UNIT.test(paragraphs[i - 1])) withNum += 1;
    }
    if (withNum < 3) {
      problems.push(`C 第 4~8 段中仅 ${withNum} 段含具体数字（应≥3，实例密度不足）`);
    }
  }

  // D 术语覆盖
  const missing = opts.requireTerms.filter((term) => !body.includes(term));
  if (missing.length > 0) {
    problems.push(`D 子题目术语未命中：${missing.join("、")}`);
  }

  console.log(`文件: ${opts.md}`);
  console.log(
    `A 格式: 段数=${paras} 含标点=${chars} 汉字=${hanzi} 第一人称=${firstMe} 禁写=${banned} 粗体=${bold} 标题=${titles} 直引号=${straight}`,
  );
  if (opts.requireTerms.length > 0) {
    console.log(`D 术语: 要求 ${opts.requireTerms.length} 项，未命中 ${missing.length} 项`);
  }
  if (straight > 0) {
    console.log(`提示: 正文出现直引号 ${straight} 处，生成 .doc 时会自动转为中文引号`);
  }

  if (problems.length === 0) {
    console.log("结论: PASS —— 满足 10 段式交付规格与评分口径检查");
    process.exit(0);
  }
  console.log("结论: 不达标，需修改：");
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exit(1);
}

main();
