# 成稿门禁自检：核对一篇软考系分论文是否满足交付规格
# 用法：& .\check-essay.ps1 -MdPath 'D:\path\论xxx.md'
# 输出：段数 / 含标点字数 / 纯汉字 / 第一人称 / 禁写字眼 / 粗体 / 标题，并给出 PASS 或失败项
# 说明：本脚本把"写完必过门禁"固化为可执行检查，所有判据与 SKILL.md 的硬约束一致。

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$MdPath,
  [int]$MinChars = 2500,
  [int]$MaxChars = 2800
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $MdPath)) { Write-Output ("[缺失] " + $MdPath); exit 2 }

$rawLines = Get-Content $MdPath -Encoding UTF8
$lines = $rawLines | Where-Object { $_.Trim() -ne '' -and $_ -notmatch '^<!--' }
$body = ($lines -join '')

$paras   = $lines.Count
$chars   = ($body -replace '\s', '').Length
$hanzi   = ($body.ToCharArray() | Where-Object { [int]$_ -ge 0x4E00 -and [int]$_ -le 0x9FA5 }).Count
$firstMe = ([regex]::Matches($body, '我|咱')).Count
$banned  = ([regex]::Matches($body, '摘要|背景|子题目|第一，|第二，|首先|一是|二是|三是')).Count
$bold    = ([regex]::Matches($body, '\*\*')).Count
$titles  = ($rawLines | Where-Object { $_ -match '^#{1,6}\s' } | Measure-Object).Count
$straight = ([regex]::Matches($body, '"')).Count

$problems = @()
if ($paras -ne 10) { $problems += "段数应为 10，实际 $paras" }
if ($chars -lt $MinChars -or $chars -gt $MaxChars) { $problems += "含标点字数应在 $MinChars~$MaxChars，实际 $chars" }
if ($firstMe -ne 0) { $problems += "正文出现第一人称，共 $firstMe 处" }
if ($banned -ne 0) { $problems += "出现禁写字眼/分点标号，共 $banned 处" }
if ($bold -ne 0) { $problems += "出现 Markdown 粗体 **，共 $bold 处" }
if ($titles -ne 0) { $problems += "出现 Markdown 标题，共 $titles 行" }
if ($straight -ne 0) { $problems += "出现直引号，共 $straight 处" }

Write-Output ("文件: " + $MdPath)
Write-Output ("段数: {0}   含标点: {1}   纯汉字: {2}   第一人称: {3}   禁写字眼: {4}   粗体: {5}   标题: {6}   直引号: {7}" -f $paras, $chars, $hanzi, $firstMe, $banned, $bold, $titles, $straight)
if ($problems.Count -eq 0) {
  Write-Output '结论: PASS —— 满足 10 段式交付规格'
  exit 0
}
Write-Output '结论: 不达标，需修改：'
$problems | ForEach-Object { Write-Output ('  - ' + $_) }
exit 1
