# 成稿门禁自检（评分口径）：格式硬约束 + 段落职能 + 实例密度 + 子题目术语覆盖
# 用法：
#   & .\check-essay.ps1 -MdPath 'D:\path\论xxx.md'
#   & .\check-essay.ps1 -MdPath 'D:\path\论xxx.md' -RequireTerms '架构需求','架构设计','架构文档化','架构复审','架构实现','架构演化'
# 退出码：0 = PASS；1 = 不达标（详见输出）；2 = 文件缺失
#
# 检查项：
#   A 格式：段数=10、含标点 2500~2800、无第一人称、无禁写字眼与分点标号、无粗体、无标题、无直引号
#   B 段落职能：首段含身份/金额/周期；建设期（年+月）只出现在首段；第 9 段含量化效果与不足改进
#   C 实例密度：正文三段（第 5~7 段）每段至少一处数字（金额/规模/指标/时长等具体信息）
#   D 术语覆盖：-RequireTerms 给出的分类名称必须全部命中（对应子题目 2 的显性点题）

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$MdPath,
  [int]$MinChars = 2500,
  [int]$MaxChars = 2800,
  [string[]]$RequireTerms = @()
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $MdPath)) { Write-Output ('[缺失] ' + $MdPath); exit 2 }

# 整块剥掉 HTML 注释（含多行元数据注释），避免注释里的引号/字眼被误判
$rawText = [System.IO.File]::ReadAllText($MdPath, [System.Text.Encoding]::UTF8)
$textNoComment = [regex]::Replace($rawText, '(?s)<!--.*?-->', '')
$rawLines = @($textNoComment -split "\r?\n")
$lines = @($rawLines | Where-Object { $_.Trim() -ne '' })
$body = ($lines -join '')
$paras = $lines.Count

$chars    = ($body -replace '\s', '').Length
$hanzi    = ($body.ToCharArray() | Where-Object { [int]$_ -ge 0x4E00 -and [int]$_ -le 0x9FA5 }).Count
$firstMe  = ([regex]::Matches($body, '我|咱')).Count
# 禁写字眼：标题式字眼只在段首/带冒号时算，避免"摘要算法""专业背景"这类正常用词误报
$banned = 0
foreach ($ln in $lines) {
  if ($ln -match '^摘要|^背景|摘要[：:]|背景[：:]|摘要段|背景段') { $banned++ }
  $banned += ([regex]::Matches($ln, '子题目|第一，|第二，|首先|一是|二是|三是')).Count
}
$bold     = ([regex]::Matches($body, '\*\*')).Count
$titles   = @($rawLines | Where-Object { $_ -match '^#{1,6}\s' }).Count
$straight = ([regex]::Matches($body, '"')).Count

$problems = @()

# A 格式
if ($paras -ne 10) { $problems += "A 段数应为 10，实际 $paras" }
if ($chars -lt $MinChars -or $chars -gt $MaxChars) { $problems += "A 含标点字数应在 $MinChars~$MaxChars，实际 $chars" }
if ($firstMe -ne 0) { $problems += "A 正文出现第一人称 $firstMe 处" }
if ($banned -ne 0) { $problems += "A 出现禁写字眼/分点标号 $banned 处" }
if ($bold -ne 0) { $problems += "A 出现 Markdown 粗体 $bold 处" }
if ($titles -ne 0) { $problems += "A 出现 Markdown 标题 $titles 行" }
if ($straight -ne 0) { $problems += "A 出现直引号 $straight 处" }

# B 段落职能
if ($paras -ge 1) {
  $p1 = $lines[0]
  if ($p1 -notmatch '本人') { $problems += 'B 首段未见身份交代（本人作为……）' }
  if ($p1 -notmatch '万') { $problems += 'B 首段未见金额（万元）' }
  if ($p1 -notmatch '月') { $problems += 'B 首段未见周期（月）' }
}
if ($paras -gt 1) {
  $laterText = ($lines[1..($paras - 1)] -join '')
  $periodHits = ([regex]::Matches($laterText, '\d{4}\s*年\s*\d{1,2}\s*月')).Count
  if ($periodHits -gt 0) { $problems += "B 建设期（年+月）在首段之后出现 $periodHits 次，应只写在首段" }
}
if ($paras -ge 8) {
  $tailText = ($lines[7..($paras - 1)] -join '')
  if ($tailText -notmatch '%|百分之|成|倍') { $problems += 'B 末三段未见量化效果（%，或"成/倍"等量化表述）' }
  if ($tailText -notmatch '不足|改进|局限|反思|有待|尚需') { $problems += 'B 末三段未见不足与改进（或反思/局限）' }
}

# C 实例密度：第 4~8 段（回应+正文区）中至少 3 段带具体数字（允许一段为分类/理论段）
if ($paras -ge 8) {
  $numPattern = '\d|[一二三四五六七八九十百千万亿两]+(个|余|类|项|天|小时|分钟|秒|次|成|倍|年|月|日|人|台|套|层|条|万|亿)'
  $withNum = 0
  for ($i = 4; $i -le 8; $i++) { if ($lines[$i - 1] -match $numPattern) { $withNum++ } }
  if ($withNum -lt 3) { $problems += "C 第 4~8 段中仅 $withNum 段含具体数字（应≥3，实例密度不足）" }
}

# D 术语覆盖
$missing = @()
foreach ($t in $RequireTerms) {
  if ($t -and -not $body.Contains($t)) { $missing += $t }
}
if ($missing.Count -gt 0) { $problems += ('D 子题目术语未命中：' + ($missing -join '、')) }

Write-Output ('文件: ' + $MdPath)
Write-Output ("A 格式: 段数={0} 含标点={1} 汉字={2} 第一人称={3} 禁写={4} 粗体={5} 标题={6} 直引号={7}" -f $paras, $chars, $hanzi, $firstMe, $banned, $bold, $titles, $straight)
if ($RequireTerms.Count -gt 0) { Write-Output ('D 术语: 要求 ' + $RequireTerms.Count + ' 项，未命中 ' + $missing.Count + ' 项') }

if ($problems.Count -eq 0) {
  Write-Output '结论: PASS —— 满足 10 段式交付规格与评分口径检查'
  exit 0
}
Write-Output '结论: 不达标，需修改：'
$problems | ForEach-Object { Write-Output ('  - ' + $_) }
exit 1
