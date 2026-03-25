$ErrorActionPreference = "Stop"

$repoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoPath

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$status = git status --porcelain

if (-not $status) {
  Write-Host "No changes to push." -ForegroundColor Yellow
  Read-Host "Press Enter to close"
  exit 0
}

git add .
git commit -m "Refresh update $timestamp"
git push

Write-Host ""
Write-Host "GitHub refresh complete." -ForegroundColor Green
Read-Host "Press Enter to close"
