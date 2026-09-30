# 成稿入库：把一篇已完成的论文成稿收进本地题库，并同步成稿索引
# 用法示例：
#   & .\ingest-essay.ps1 -MdPath 'D:\...\论xxx.md' -Source '2024/05 试题一' `
#       -Background '某省电网调度自动化系统（1600 万／12 个月）' `
#       -SubQuestions '①项目与工作；②六阶段；③项目如何设计' `
#       -Landing '段1 ①；段4 六阶段；段5~7 三段实例；段9 成效与不足' `
#       -Reusable '六阶段名称、两条回路、量化数据（3 人天→半天）'
#
# 行为：①先跑门禁 check-essay.ps1，未 PASS 拒绝入库；②统计段数/含标点/纯汉字；
#       ③题库一览表：同题名则更新该行，否则追加；④逐题记录：不存在则按模板追加；
#       ⑤若给了 -IndexPath，同步成稿索引表；⑥打印本次改动摘要。

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$MdPath,
  [string]$Source = '本次输入',
  [string]$Background = '（待补项目背景）',
  [string]$SubQuestions = '（待补子题目要点）',
  [string]$Landing = '（待补段落落点）',
  [string]$Reusable = '（待补可复用点）',
  [string]$BankPath,
  [string]$IndexPath,
  [string]$GatePath
)

$ErrorActionPreference = 'Stop'
$pluginRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))   # scripts -> ruankao-essay-writing -> assets -> 插件根

if (-not $BankPath)  { $BankPath  = Join-Path $pluginRoot 'assets\ruankao-essay-bank\references\finished-essays.md' }
if (-not $GatePath)  { $GatePath  = Join-Path $PSScriptRoot 'check-essay.ps1' }

if (-not (Test-Path $MdPath))   { Write-Output ("[错误] 找不到成稿：" + $MdPath); exit 2 }
if (-not (Test-Path $BankPath)) { Write-Output ("[错误] 找不到题库：" + $BankPath); exit 2 }

# ① 门禁
Write-Output '---- 门禁校验 ----'
$gateOut = & $GatePath -MdPath $MdPath 2>&1
$gateCode = $LASTEXITCODE
$gateOut | ForEach-Object { Write-Output ('  ' + $_) }
if ($gateCode -ne 0) { Write-Output '[拒绝入库] 成稿未通过门禁，请先按上面的失败项修改。'; exit 1 }

# ② 统计
$rawLines = Get-Content $MdPath -Encoding UTF8
$lines = $rawLines | Where-Object { $_.Trim() -ne '' -and $_ -notmatch '^<!--' }
$body = ($lines -join '')
$chars = ($body -replace '\s', '').Length
$hanzi = ($body.ToCharArray() | Where-Object { [int]$_ -ge 0x4E00 -and [int]$_ -le 0x9FA5 }).Count
$title = [System.IO.Path]::GetFileNameWithoutExtension($MdPath)
$paras = $lines.Count

$bank = [System.IO.File]::ReadAllText($BankPath, [System.Text.Encoding]::UTF8)
$rowPattern = '(?m)^\| (\d+) \| ' + [regex]::Escape($title) + ' \|.*$'

$changed = @()
if ($bank -match $rowPattern) {
  $existing = [regex]::Match($bank, $rowPattern).Value
  $num = [regex]::Match($existing, '^\| (\d+) \|').Groups[1].Value
  $newRow = "| $num | $title | $Source | $paras／$chars | $Background | ``$title`` |"
  $bank = [regex]::Replace($bank, $rowPattern, { param($m) $newRow }, 1)
  $changed += "题库一览表已更新第 $num 行（段数／字数刷新）"
} else {
  $nums = [regex]::Matches($bank, '(?m)^\| (\d+) \| 论') | ForEach-Object { [int]$_.Groups[1].Value }
  $num = if ($nums.Count -gt 0) { ($nums | Measure-Object -Maximum).Maximum + 1 } else { 1 }
  $newRow = "| $num | $title | $Source | $paras／$chars | $Background | ``$title`` |"
  $lastRow = [regex]::Matches($bank, '(?m)^\| \d+ \| 论.*$')
  if ($lastRow.Count -eq 0) { Write-Output '[错误] 题库里找不到一览表数据行，无法定位插入点'; exit 3 }
  $anchor = $lastRow[$lastRow.Count - 1].Value
  $bank = $bank.Replace($anchor, $anchor + "`n" + $newRow)
  $changed += "题库一览表已追加第 $num 行"
}

# ④ 逐题记录
$sectionHeader = "### $num. $title"
if ($bank -match ('(?m)^' + [regex]::Escape($sectionHeader))) {
  $changed += "逐题记录小节已存在（$sectionHeader），未覆盖"
} else {
  $section = @"
$sectionHeader
- **子题目**：$SubQuestions
- **落点**：$Landing
- **可复用**：$Reusable

"@
  $anchor = '## 三、跨题复用与选题建议'
  if ($bank.Contains($anchor)) {
    $bank = $bank.Replace($anchor, $section + $anchor)
    $changed += "逐题记录已追加小节：$sectionHeader"
  } else {
    $changed += "未找到『## 三、跨题复用与选题建议』锚点，逐题记录未追加（请手工补）"
  }
}

[System.IO.File]::WriteAllText($BankPath, $bank, (New-Object System.Text.UTF8Encoding $false))

# ⑤ 索引同步
if ($IndexPath -and (Test-Path $IndexPath)) {
  $idx = [System.IO.File]::ReadAllText($IndexPath, [System.Text.Encoding]::UTF8)
  $idxRow = "| $num | $title | **$Source** | $paras | $chars | $hanzi | $Background |"
  $pat = '(?m)^\| \d+ \| ' + [regex]::Escape($title) + ' \|.*$'
  if ($idx -match $pat) {
    $idx = [regex]::Replace($idx, $pat, { param($m) $idxRow }, 1)
    $changed += '成稿索引行已更新'
  } else {
    $rows = [regex]::Matches($idx, '(?m)^\| \d+ \| 论.*$')
    if ($rows.Count -gt 0) {
      $a = $rows[$rows.Count - 1].Value
      $idx = $idx.Replace($a, $a + "`n" + $idxRow)
      $changed += '成稿索引已追加行'
    }
  }
  $idx = $idx -replace '· \d+ 篇）', ('· ' + ([regex]::Matches($idx, '(?m)^\| \d+ \| 论').Count) + ' 篇）')
  [System.IO.File]::WriteAllText($IndexPath, $idx, (New-Object System.Text.UTF8Encoding $false))
}

Write-Output '---- 入库结果 ----'
Write-Output ("  题目：$title")
Write-Output ("  出处：$Source    段数=$paras    含标点=$chars    纯汉字=$hanzi")
$changed | ForEach-Object { Write-Output ('  · ' + $_) }
Write-Output '  完成。'
