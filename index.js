import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { BUNDLED_SKILL_RANK } from "@deepseek-ai/dsh-skill";

/**
 * 软考系统分析师论文助手 —— 技能提供者插件。
 *
 * 把一个 workspace 目录里的 SKILL.md 目录树注册成两个技能：
 * - ruankao-essay-writing：写作与改写总纲
 * - ruankao-essay-bank：题库、理论骨架、项目素材
 *
 * 技能正文与其 references/ 都在包的 assets/ 下，按目录资源基（resourceBase）
 * 暴露，模型可用 file 工具按相对路径读取。
 *
 * @module dsh-ruankao-essay
 */

const PROVIDER_NAME = "ruankao-essay";
const ASSETS_BASE = new URL("../assets/", import.meta.url);

/** 本插件提供的技能清单（目录名＝技能名）。 */
const SKILLS = [
  {
    dir: "ruankao-essay-writing",
    name: "ruankao-essay-writing",
    description:
      "软考系统分析师论文写作与改写总纲。Write or rewrite a Chinese Soft Exam (软考) 系统分析师 essay from a 论文题目 (with its 三个子题目) or from the user's draft: forces a strict 10-paragraph structure, exact word-count band, no titles/no sub-headings/no first person, explicit sub-question coverage, at least one real project instance per argument, and delivery as a Word .doc plus .md. Use whenever the task is 软考系分论文, 论文改写, 论文押题, or 考场论文成稿.",
  },
  {
    dir: "ruankao-essay-bank",
    name: "ruankao-essay-bank",
    description:
      "软考系统分析师论文题库与素材库。Look up Chinese Soft Exam (软考) 系统分析师 essay topics and reusable material: the 2016–2026 真题 table, per-topic theory skeletons and 扣分雷区, 29 knowledge cards distilled from sample essays, 24 reusable project backgrounds with 规模/周期, and the 10 finished essays in this workspace. Use when the user asks which 论文题目 exist, what theory points a topic needs, what project or quantified data to cite, or before writing any 软考系分 essay.",
  },
];

/** 去掉 YAML frontmatter，只把正文交给 harness（frontmatter 供文件系统方式复用）。 */
function stripFrontmatter(text) {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return text;
  const bodyStart = text.indexOf("\n", end + 1);
  if (bodyStart === -1) return "";
  return text.slice(bodyStart + 1).replace(/^[\r\n]+/, "");
}

/** 由清单项构造技能候选（含资源基与 locator，load 时复用）。 */
function candidateOf(entry) {
  const dir = new URL(`${entry.dir}/`, ASSETS_BASE);
  return {
    name: entry.name,
    description: entry.description,
    invocation: { modelInvocable: true, userInvocable: true },
    provider: PROVIDER_NAME,
    source: "plugin",
    resourceBase: { kind: "directory", path: fileURLToPath(dir) },
    rank: BUNDLED_SKILL_RANK,
    locator: new URL("SKILL.md", dir),
  };
}

/** 提供者实现：list 返回全部候选，get 读取并返回技能定义。 */
const provider = {
  name: PROVIDER_NAME,
  list() {
    return Promise.resolve(SKILLS.map(candidateOf));
  },
  async get(candidate) {
    const wanted = typeof candidate === "string" ? candidate : candidate && candidate.name;
    const entry = SKILLS.find((skill) => skill.name === wanted);
    if (entry === undefined) throw new Error(`ruankao-essay: unknown skill "${String(wanted)}"`);
    const resolved = candidateOf(entry);
    const raw = await readFile(resolved.locator, "utf8");
    return {
      name: resolved.name,
      description: resolved.description,
      invocation: resolved.invocation,
      provider: resolved.provider,
      source: resolved.source,
      resourceBase: resolved.resourceBase,
      content: stripFrontmatter(raw),
    };
  },
};

/** Cordis 插件名。 */
const name = "ruankao-essay";
/** 依赖技能服务。 */
const inject = ["skills"];

/** 在 ctx.skills 上注册提供者。 */
function apply(ctx) {
  ctx.skills.registerProvider(() => provider);
}

export { apply, inject, name };
