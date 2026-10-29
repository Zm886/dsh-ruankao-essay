#!/usr/bin/env bash
# 从 GitHub 拉取 dsh-ruankao-essay 最新代码（main 分支）
#
# 背景：部分环境里 git 不可用（macOS 未接受 Xcode 许可时 /usr/bin/git 是 Xcode shim，
# 会报 "You have not agreed to the Xcode license agreements"），且 brew 同样被
# 该许可挡住，因此这里用 codeload.github.com 的 tarball 做"整目录覆盖式更新"。
#
# 用法：bash update-from-github.sh [目标目录]
#   目标目录默认是本脚本所在目录；也可以传 DSH profile 里以 link: 方式装入的插件目录，
#   例如 bash update-from-github.sh /path/to/dsh-plugins/dsh-ruankao-essay
#   来同步已安装的插件。
set -euo pipefail

OWNER="Zm886"
REPO="dsh-ruankao-essay"
BRANCH="main"
TARGET="${1:-$(cd "$(dirname "$0")" && pwd)}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> 拉取 $OWNER/$REPO@$BRANCH (tarball)"
curl -fsSL -m 120 "https://codeload.github.com/$OWNER/$REPO/tar.gz/refs/heads/$BRANCH" -o "$TMP/repo.tar.gz"
tar -xzf "$TMP/repo.tar.gz" -C "$TMP"
SRC="$TMP/$REPO-$BRANCH"

SHA="$(curl -fsSL -m 30 "https://api.github.com/repos/$OWNER/$REPO/commits/$BRANCH" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const c=JSON.parse(s);console.log(c.sha+" "+c.commit.committer.date)})')"
echo "==> 上游提交: $SHA"

echo "==> 备份现有目录到 $TARGET.bak.$(date +%Y%m%d%H%M%S)"
cp -R "$TARGET" "$TARGET.bak.$(date +%Y%m%d%H%M%S)"

echo "==> 覆盖更新 $TARGET"
# 只保留 tarball 内容，不删除 .git（本机无 git，仅作占位说明）
find "$TARGET" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -R "$SRC"/. "$TARGET"/

echo "==> 完成。上游提交 $SHA"
echo "    提示：更新 DSH 已装的插件目录后需重启 DSH 才生效。"
