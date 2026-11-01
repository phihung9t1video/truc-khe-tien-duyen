# Phát hành Trúc Khê Tiên Duyên: build APK + gói cập nhật, đăng lên GitHub Releases, đẩy mã lên GitHub (bản web + version.json).
# Dùng: release.ps1 -Version 1.0.0 -Notes "ghi chú"   (bỏ trống thì script sẽ hỏi)
#       thêm -NeedApk khi bản mới đổi phần lõi Android (plugin, quyền...) để app bảo người chơi cài lại APK.
param([string]$Version, [string]$Notes, [switch]$NoPause, [switch]$NeedApk)
$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot
Set-Location $Root
$Repo = 'phihung9t1video/truc-khe-tien-duyen'
function Fail([string]$m) { Write-Host "LOI: $m" -ForegroundColor Red; if (-not $NoPause) { Read-Host 'Bam Enter de dong' }; exit 1 }
function Step([string]$m) { Write-Host ''; Write-Host "==> $m" -ForegroundColor Cyan }

& gh auth status *> $null; if ($LASTEXITCODE -ne 0) { Fail 'Chua dang nhap GitHub. Chay: gh auth login' }
$cur = (Get-Content package.json -Raw | ConvertFrom-Json).version
Write-Host "Phien ban hien tai: $cur"
if (-not $Version) { $Version = "$(Read-Host 'Nhap phien ban moi (vi du 1.0.1), Enter de giu nguyen')".Trim(); if (-not $Version) { $Version = $cur } }
if ($Version -notmatch '^\d+\.\d+\.\d+$') { Fail 'Phien ban phai co dang so.so.so' }
if (-not $Notes) { $Notes = "$(Read-Host 'Ghi chu thay doi')".Trim() ; if (-not $Notes) { $Notes = "Ban $Version" } }

$env:APP_NOTES = $Notes
if ($NeedApk) { $env:APP_NEED_APK = '1' } else { $env:APP_NEED_APK = '' }
Step "Build APK va goi cap nhat $Version"
try { & "$PSScriptRoot\build-apk.ps1" -Version $Version } catch { Fail $_.Exception.Message }
if (-not (Test-Path 'dist\www.zip')) { Fail 'Khong tao duoc goi cap nhat dist\www.zip' }
# Tu day chi goi git/gh va tu kiem tra ma loi; PowerShell 5.1 coi dong loi cua chuong trinh ngoai la loi dung han neu de 'Stop'
$ErrorActionPreference = 'Continue'

Step 'Luu phien ban vao Git'
& node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.version='$Version';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n')"
& git add -A
& git commit -q -m "Phat hanh v$Version" -m "$Notes" 2>$null
& git tag -f "v$Version" | Out-Null

$hasRemote = (& git remote) -contains 'origin'
if (-not $hasRemote) {
  & gh repo view $Repo *> $null
  if ($LASTEXITCODE -ne 0) {
    & gh repo create $Repo --public --description 'Game kiem hiep - tien hiep 2D chay tren web va Android'
    if ($LASTEXITCODE -ne 0) { Fail 'Khong tao duoc repo tren GitHub' }
  }
  & git remote add origin "https://github.com/$Repo.git"
}

# Dang goi cap nhat + APK truoc, roi moi day ma (version.json) len: app chi thay ban moi khi goi da san sang
Step 'Dang APK va goi cap nhat len GitHub Releases'
& git push -q -f origin "v$Version"
if ($LASTEXITCODE -ne 0) { Fail 'Day tag len GitHub bi loi' }
$notesFile = Join-Path $env:TEMP 'tk-notes.txt'
[IO.File]::WriteAllText($notesFile, $Notes, (New-Object Text.UTF8Encoding $false))
& gh release view "v$Version" -R $Repo *> $null
if ($LASTEXITCODE -eq 0) { & gh release upload "v$Version" -R $Repo 'dist\truc-khe-tien-duyen.apk' 'dist\www.zip' --clobber }
else { & gh release create "v$Version" -R $Repo --latest --title "Truc Khe Tien Duyen $Version" --notes-file $notesFile 'dist\truc-khe-tien-duyen.apk' 'dist\www.zip' }
if ($LASTEXITCODE -ne 0) { Fail 'Dang APK len GitHub bi loi' }

Step 'Day ma len GitHub (ban web va thong bao cap nhat)'
& git push -q -u origin main
if ($LASTEXITCODE -ne 0) { Fail 'Day ma len GitHub bi loi' }
& gh api "repos/$Repo/pages" *> $null
if ($LASTEXITCODE -ne 0) { & gh api -X POST "repos/$Repo/pages" -f 'source[branch]=main' -f 'source[path]=/' *> $null }

Write-Host ''
Write-Host "XONG: da phat hanh ban $Version" -ForegroundColor Green
Write-Host "Choi tren web (sau 1-2 phut): https://phihung9t1video.github.io/truc-khe-tien-duyen/"
Write-Host "Tai APK: https://github.com/$Repo/releases/latest/download/truc-khe-tien-duyen.apk"
if ($NeedApk) { Write-Host "Ban nay can cai lai APK: app se bao nguoi choi tai APK." -ForegroundColor Yellow }
else { Write-Host "App Android (tu ban co cap nhat truc tiep) se tu cap nhat khi bam 'Cap nhat ngay'." }
if (-not $NoPause) { Read-Host 'Bam Enter de dong' }
