# 插件健康巡检：清单校验 + 隐私边界 + 题库一致性 + CI 状态
# 用法：& .\scripts\health-check.ps1 [-SkipCi] [-EssaysDir <路径>]
# 退出码：0 全部通过；1 有需要处理的问题

[CmdletBinding()]
param(
  [switch]$SkipCi,
  [string]$EssaysDir = 'D:\project\deeepseek\extract\parts'
)

$root = Split-Path -Parent $PSScriptRoot
$bank = Join-Path $root 'assets\ruankao-essay-bank\references\finished-essays.md'
$problems = @()
$notes = @()

Write-Output ('=== 插件健康巡检 ' + (Get-Date -Format 'yyyy-MM-dd HH:mm') + ' ===')
Write-Output ('仓库：' + $root)

# 1) 清单校验
Write-Output ''
Write-Output '--- 1/4 清单校验（verify-manifest.mjs）---'
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { $node = 'C:\Users\18814\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe' }
$verify = & $node (Join-Path $root 'scripts\verify-manifest.mjs') 2>&1
$verifyCode = $LASTEXITCODE
$verify | Select-Object -Last 2 | ForEach-Object { Write-Output ('  ' + $_) }
if ($verifyCode -ne 0) { $problems += '清单校验未通过' } else { $notes += '清单校验 12 项通过' }

# 2) 隐私边界：本地资料不得入库
Write-Output ''
Write-Output '--- 2/4 隐私边界（本地资料是否泄漏进版本库）---'
Push-Location $root
$tracked = git ls-files
$private = @('courseware-3-4.md','exam-points.md','essay-bank.md','type-index.md','finished-essays.md','quick-cards.md')
$leaked = @()
foreach ($f in $private) {
  $hit = $tracked | Where-Object { $_ -like ('*' + $f) }
  if ($hit) { $leaked += ($f + ' -> ' + ($hit -join ',')) }
}
if ($leaked.Count -gt 0) { $problems += ('本地资料被跟踪：' + ($leaked -join '; ')) } else { $notes += ('6 份本地资料均未被跟踪') }

# references 下新增的本地文件必须已被忽略，否则一次 git add -A 就会泄漏
$unguarded = @()
$refFiles = Get-ChildItem (Join-Path $root 'assets') -Recurse -Filter '*.md' -ErrorAction SilentlyContinue | Where-Object { $_.FullName -like '*\references\*' }
foreach ($rf in $refFiles) {
  $rel = $rf.FullName.Substring($root.Length + 1).Replace('\', '/')
  if ($tracked -notcontains $rel) {
    git check-ignore -q -- $rel
    if ($LASTEXITCODE -ne 0) { $unguarded += $rel }
  }
}
if ($unguarded.Count -gt 0) { $problems += ('本地资料未加忽略规则（有泄漏风险）：' + ($unguarded -join '、')) } else { $notes += 'references 下无未忽略的本地文件' }

$dirty = git status --porcelain
if ($dirty) { $notes += ('工作区有未提交改动 ' + (@($dirty).Count) + ' 项（发布前请提交）') } else { $notes += '工作区干净' }

$trackedCount = @($tracked).Count
$notes += ('版本库跟踪文件 ' + $trackedCount + ' 个')
Pop-Location

# 3) 题库一致性：成稿篇数 vs 题库一览行数
Write-Output ''
Write-Output '--- 3/4 题库一致性（成稿 vs 一览表）---'
if (-not (Test-Path $bank)) {
  $problems += ('找不到题库：' + $bank)
} else {
  $rows = @(Select-String -Path $bank -Pattern '^\| \d+ \| 论' -Encoding UTF8).Count
  $essays = @()
  if (Test-Path $EssaysDir) {
    $essays = Get-ChildItem $EssaysDir -Filter '论*.md' -Recurse | Where-Object { $_.BaseName -notmatch '速记卡|索引|改进点|课件' } | Sort-Object FullName -Unique
  }
  Write-Output ('  题库一览行：' + $rows + '    成稿文件：' + $essays.Count)
  if ($rows -ne $essays.Count) {
    $names = ($essays | ForEach-Object { $_.BaseName })
    $missing = @()
    foreach ($n in $names) { if (-not (Select-String -Path $bank -Pattern ([regex]::Escape($n)) -Quiet -Encoding UTF8)) { $missing += $n } }
    $bankRows = Select-String -Path $bank -Pattern '^\| \d+ \| 论' -Encoding UTF8 | ForEach-Object {
      $cells = ($_.Line -split '\|')
      [pscustomobject]@{ Title = $cells[2].Trim(); File = $cells[6].Trim() }
    }
    $dupSameFile = @($bankRows | Group-Object Title | Where-Object { $_.Count -gt 1 -and @($_.Group | Select-Object -ExpandProperty File -Unique).Count -eq 1 })
    $dupDiffFile = @($bankRows | Group-Object Title | Where-Object { $_.Count -gt 1 -and @($_.Group | Select-Object -ExpandProperty File -Unique).Count -gt 1 })
    $dup = $dupSameFile
    if ($missing.Count -gt 0) { $problems += ('成稿未入库：' + ($missing -join '、')) }
    if ($dup.Count -gt 0) { $problems += ('题库出现重复行（同题同文件）：' + (($dup | ForEach-Object { $_.Name + '×' + $_.Count }) -join '、')) }
    if ($dupDiffFile.Count -gt 0) { $notes += ('同标题不同成稿（建议在表中区分）：' + (($dupDiffFile | ForEach-Object { $_.Name }) -join '、')) }
    if ($missing.Count -eq 0 -and $dup.Count -eq 0) { $problems += ('题库行数与成稿篇数不一致（行 ' + $rows + ' vs 篇 ' + $essays.Count + '）') }
  } else {
    $notes += '题库与成稿数量一致'
  }
}

# 4) CI 状态
Write-Output ''
Write-Output '--- 4/4 最近一次 CI ---'
if ($SkipCi) {
  Write-Output '  （已跳过）'
} else {
  try {
    $raw = "protocol=https`nhost=github.com`n`n" | git credential fill 2>$null
    $tok = ($raw | Where-Object { $_ -match '^password=' }) -replace '^password=',''
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $H = @{ 'User-Agent'='dsh-health'; 'Authorization'="token $tok"; 'Accept'='application/vnd.github+json' }
    $runs = Invoke-RestMethod -Uri 'https://api.github.com/repos/Zm886/dsh-ruankao-essay/actions/runs?per_page=1' -Headers $H -TimeoutSec 40
    if ($runs.workflow_runs.Count -gt 0) {
      $r = $runs.workflow_runs[0]
      Write-Output ('  ' + $r.name + ' #' + $r.run_number + '  ' + $r.status + '/' + $r.conclusion + '  ' + $r.head_sha.Substring(0,7) + '  ' + $r.created_at)
      if ($r.conclusion -ne 'success') { $problems += ('最近一次 CI 结论：' + $r.conclusion) } else { $notes += '最近一次 CI 成功' }
    } else { Write-Output '  暂无运行记录'; $notes += 'CI 无记录' }
  } catch {
    Write-Output ('  查询失败（可能离线）：' + $_.Exception.Message)
    $notes += 'CI 状态未取到'
  }
}

Write-Output ''
Write-Output '=== 结论 ==='
$notes | ForEach-Object { Write-Output ('  · ' + $_) }
if ($problems.Count -gt 0) {
  Write-Output '  需要处理：'
  $problems | ForEach-Object { Write-Output ('  ! ' + $_) }
  exit 1
}
Write-Output '  全部正常，无需处理。'
exit 0
