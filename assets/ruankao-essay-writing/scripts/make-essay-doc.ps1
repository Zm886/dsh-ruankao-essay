# 把软考论文的 Markdown 源稿转成 Word 可直接打开的 .doc（HTML 型），
# 并输出段数与含标点字数用于自检。
#
# 用法：
#   pwsh -File make-essay-doc.ps1 -MdPath "D:\path\论题目.md"
#   pwsh -File make-essay-doc.ps1 -MdPath "D:\path\论题目.md" -OutPath "D:\path\论题目.doc"
#
# 要点（踩过的坑）：
#   1) 中文引号与破折号必须用 [char] 码点构造，直接写字面量在部分调用方式下会被吞掉。
#   2) 输出用带 BOM 的 UTF-8，Word 打开不乱码。
#   3) 目标文件被 Word 占用时自动重试，仍失败则另存 *_v2.doc。

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$MdPath,
  [string]$OutPath
)

$ErrorActionPreference = 'Stop'

# 相对路径必须基于 PowerShell 的当前位置解析：
# .NET 的当前目录与 PowerShell 位置可能不同（[System.IO.File] 用的是前者），
# 因此这里统一转成绝对路径，并确保输出目录存在。
function Resolve-FullPath([string]$Path) {
  if ([System.IO.Path]::IsPathRooted($Path)) { return [System.IO.Path]::GetFullPath($Path) }
  return [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $Path))
}

if (-not (Test-Path -LiteralPath $MdPath)) { throw "找不到 Markdown 文件：$MdPath" }
$MdPath = (Resolve-Path -LiteralPath $MdPath).Path
if (-not $OutPath) { $OutPath = [System.IO.Path]::ChangeExtension($MdPath, '.doc') }
$OutPath = Resolve-FullPath $OutPath
$outDir = Split-Path -Parent $OutPath
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

# 读源稿：跳过 HTML 注释行，去掉空行与行首标记
$lines = Get-Content -LiteralPath $MdPath -Encoding UTF8 |
  ForEach-Object { $_.Trim() } |
  Where-Object { $_ -ne '' -and $_ -notmatch '^<!--' }

$q1 = ([char]0x201C).ToString()   # 左双引号
$q2 = ([char]0x201D).ToString()   # 右双引号
$dash = ([char]0x2014).ToString() # 破折号

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">')
[void]$sb.AppendLine('<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">')
[void]$sb.AppendLine('<title>Document</title>')
[void]$sb.AppendLine('<style>@page{size:A4;margin:2.54cm 3.17cm;} body{line-height:1.5;} p{font-family:SimSun;font-size:12.0pt;line-height:1.5;text-indent:24.0pt;margin:0;text-align:justify;}</style></head><body>')

foreach ($line in $lines) {
  $text = $line -replace '^#+\s*', '' -replace '\*\*', ''
  $text = [regex]::Replace($text, '"([^"]*)"', ($q1 + '$1' + $q2))
  $text = $text.Replace($dash, ($dash + $dash))
  [void]$sb.AppendLine('<p>' + $text + '</p>')
}
[void]$sb.AppendLine('</body></html>')

# 段数与含标点字数（自检用）
$body = ($lines -join '')
$chars = ($body -replace '\s', '').Length
$hanzi = ($body.ToCharArray() | Where-Object { [int]$_ -ge 0x4E00 -and [int]$_ -le 0x9FA5 }).Count

$target = $OutPath
try {
  [System.IO.File]::WriteAllText($target, $sb.ToString(), (New-Object System.Text.UTF8Encoding $true))
} catch {
  # 被 Word/WPS 占用：重试三次，再失败则另存
  $ok = $false
  for ($i = 1; $i -le 3; $i++) {
    Start-Sleep -Seconds 2
    try { [System.IO.File]::WriteAllText($target, $sb.ToString(), (New-Object System.Text.UTF8Encoding $true)); $ok = $true; break } catch { }
  }
  if (-not $ok) {
    $target = [System.IO.Path]::ChangeExtension($OutPath, $null) + '_v2.doc'
    [System.IO.File]::WriteAllText($target, $sb.ToString(), (New-Object System.Text.UTF8Encoding $true))
    Write-Warning "原文件被占用，已另存：$target"
  }
}

Write-Output ("段落数: {0}  含标点字数: {1}  纯汉字: {2}" -f $lines.Count, $chars, $hanzi)
Write-Output ("已生成: {0}" -f $target)
