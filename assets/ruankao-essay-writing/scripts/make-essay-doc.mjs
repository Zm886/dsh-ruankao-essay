#!/usr/bin/env node
/**
 * 把软考论文的 Markdown 源稿转成 Word 可直接打开的 .doc（HTML 型），
 * 并输出段数与含标点字数用于自检。
 *
 * 用法：
 *   node make-essay-doc.mjs --md <成稿.md>
 *   node make-essay-doc.mjs --md <成稿.md> --out <输出.doc>
 *
 * 退出码：0 = 成功；2 = 输入文件缺失（或参数错误）
 *
 * 要点（踩过的坑）：
 *   1) 中文引号与破折号必须用码点构造（0x201C / 0x201D / 0x2014），不要直接写字面量。
 *   2) 输出用带 BOM 的 UTF-8，Word 打开不乱码。
 *   3) 段落口径与 check-essay.ps1 / check-essay.mjs 完全一致（见下方说明）。
 *
 * 段落切分口径（与 check-essay.ps1 / check-essay.mjs 完全一致）：
 *   1) 先整体剥掉 HTML 注释 <!-- ... -->（含多行）
 *   2) 按空行切块：连续的空行/仅空白行作为分隔，每个非空块 = 一段
 *   3) 块内的换行直接拼接（不插空格）；去掉每行行首的 Markdown 标题标记 # 与粗体标记 ** 后再拼接
 *   4) 段数 = 块数；每段生成一个 <p>（不是一行一个 <p>）
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, parse, resolve } from "node:path";

const LEFT_QUOTE = String.fromCodePoint(0x201c); // “ 左双引号
const RIGHT_QUOTE = String.fromCodePoint(0x201d); // ” 右双引号
const EM_DASH = String.fromCodePoint(0x2014); // — 破折号
const CRLF = "\r\n";

const USAGE = `用法：
  node make-essay-doc.mjs --md <成稿.md> [--out <输出.doc>]`;

/**
 * 解析命令行参数。
 * @returns {{ok: true, opts: object} | {ok: false, message: string}}
 */
function parseArgs(argv) {
  const opts = { md: null, out: null };
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
      case "--out":
      case "--out-path": {
        const value = takeValue();
        if (value === null) return { ok: false, message: "缺少 --out 的取值" };
        opts.out = value;
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
 * @returns {string[]}
 */
export function splitParagraphs(text) {
  const rawLines = stripHtmlComments(text).split(/\r?\n/);
  const blocks = [];
  let current = [];
  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (line === "") {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    current.push(line);
  }
  if (current.length > 0) blocks.push(current);

  return blocks.map((block) => {
    let joined = "";
    for (const line of block) {
      joined += line.replace(/^#{1,6}\s*/, "").replace(/\*\*/g, "");
    }
    return joined;
  });
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
 * HTML 转义：正文若含 & < > 会破坏生成的 .doc 结构，必须转义。
 * 顺序：先 & 再 < >，避免二次转义。
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * 正文润色：成对直引号 -> 中文引号；破折号 -> 破折号对。
 * @param {string} text
 * @returns {string}
 */
function polish(text) {
  let out = text.replace(/"([^"]*)"/g, `${LEFT_QUOTE}$1${RIGHT_QUOTE}`);
  out = out.replace(new RegExp(`${EM_DASH}+`, "g"), `${EM_DASH}${EM_DASH}`);
  return out;
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed.ok) {
    console.error(parsed.message);
    process.exit(2);
  }
  const opts = parsed.opts;

  if (!existsSync(opts.md)) {
    console.error(`找不到 Markdown 文件：${opts.md}`);
    process.exit(2);
  }
  const mdPath = resolve(opts.md);
  // 缺省输出：源 md 同目录同名 .doc
  const defaultOut = join(dirname(mdPath), `${parse(mdPath).name}.doc`);
  const outPath = resolve(opts.out ?? defaultOut);

  const outDir = dirname(outPath);
  if (outDir && !existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const rawText = readFileSync(mdPath, "utf8");
  const paragraphs = splitParagraphs(rawText);

  const parts = [];
  parts.push(
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">',
  );
  parts.push(
    '<head><meta charset=utf-8><meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
  );
  parts.push("<title>Document</title>");
  parts.push(
    "<style>@page{size:A4;margin:2.54cm 3.17cm;} body{line-height:1.5;} p{font-family:SimSun;font-size:12.0pt;line-height:1.5;text-indent:24.0pt;margin:0;text-align:justify;}</style></head><body>",
  );
  for (const paragraph of paragraphs) {
    parts.push(`<p>${escapeHtml(polish(paragraph))}</p>`);
  }
  parts.push("</body></html>");

  const html = `${parts.join(CRLF)}${CRLF}`;

  // 段数与含标点字数（自检用）
  const body = paragraphs.join("");
  const chars = body.replace(/\s/g, "").length;
  const hanzi = countHanzi(body);

  // 带 BOM 的 UTF-8：Word 打开不乱码
  const payload = Buffer.concat([
    Buffer.from([0xef, 0xbb, 0xbf]),
    Buffer.from(html, "utf8"),
  ]);
  try {
    writeFileSync(outPath, payload);
  } catch (error) {
    console.error(`写入失败：${outPath}（${error.message}）`);
    process.exit(1);
  }

  console.log(`段落数: ${paragraphs.length}  含标点字数: ${chars}  纯汉字: ${hanzi}`);
  console.log(`已生成: ${outPath}`);
}

main();
