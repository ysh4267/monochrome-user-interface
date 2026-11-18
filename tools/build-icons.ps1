# Builds css/icons.css from icons/*.svg.  Each file becomes a class: icons/gear.svg -> .rr-icon--gear
# Usage (from anywhere):  powershell -ExecutionPolicy Bypass -File tools\build-icons.ps1
# Keep this script ASCII-only so Windows PowerShell 5.1 reads it correctly.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'icons'
$out = Join-Path $root 'css\icons.css'
$head = Join-Path $PSScriptRoot 'icons.head.css'
$utf8 = New-Object System.Text.UTF8Encoding $false

$sb = New-Object System.Text.StringBuilder
[void]$sb.Append([IO.File]::ReadAllText($head, $utf8))

$files = Get-ChildItem $src -Filter *.svg | Sort-Object Name
foreach ($f in $files) {
  $name = $f.BaseName.ToLowerInvariant()
  if ($name -notmatch '^[a-z0-9][a-z0-9-]*$') { Write-Warning "skipped (use lowercase letters, digits and hyphens): $($f.Name)"; continue }
  $svg = [IO.File]::ReadAllText($f.FullName, $utf8)
  $svg = $svg -replace '<\?xml[^>]*\?>', ''
  $svg = $svg -replace '(?s)<!--.*?-->', ''
  $svg = $svg -replace '\s+', ' '
  $svg = $svg -replace '> <', '><'
  $svg = $svg.Trim().Replace('"', "'").Replace('%', '%25').Replace('#', '%23').Replace('<', '%3C').Replace('>', '%3E')
  [void]$sb.AppendLine(".rr-icon--$name { --rr-i: url(`"data:image/svg+xml,$svg`"); }")
}

[IO.File]::WriteAllText($out, $sb.ToString(), $utf8)
"icons.css: $($files.Count) icons -> $out"
