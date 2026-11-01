# Build APK đã ký cho Trúc Khê Tiên Duyên. Dùng: build-apk.ps1 -Version 1.0.0
param([string]$Version = '1.0.0')
$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot
Set-Location $Root
$jdk = Get-ChildItem (Join-Path $env:USERPROFILE '.jdks') -Directory -Filter 'temurin-21*' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $jdk) { throw 'Khong tim thay JDK 21 trong thu muc .jdks' }
$env:JAVA_HOME = $jdk.FullName
$sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
if (-not (Test-Path 'android\local.properties')) { "sdk.dir=$($sdk -replace '\\','/')" | Out-File -Encoding ascii 'android\local.properties' }
$keyTxt = Join-Path $Root 'android-keys\MAT-KHAU-KHOA-KY.txt'
if (-not (Test-Path $keyTxt)) { throw 'Khong thay khoa ky APK trong thu muc android-keys' }
$pw = ((Get-Content $keyTxt | Select-String 'Mat khau').ToString() -split ':', 2)[1].Trim()
& node tools\build-web.mjs
& npx cap sync android | Out-Null
$p = $Version.Split('.') | ForEach-Object { [int]$_ }
$env:APP_VERSION_CODE = $p[0] * 10000 + $p[1] * 100 + $p[2]
$env:APP_VERSION_NAME = $Version
$env:KEYSTORE_FILE = Join-Path $Root 'android-keys\truckhe.jks'
$env:KEYSTORE_PASSWORD = $pw; $env:KEY_PASSWORD = $pw; $env:KEY_ALIAS = 'truckhe'
Push-Location android
$ErrorActionPreference = 'Continue'
& .\gradlew.bat assembleRelease --no-daemon -q 2>&1 | Where-Object { "$_" -match 'error|FAIL' } | ForEach-Object { Write-Host $_ }
$ok = $LASTEXITCODE -eq 0
Pop-Location
if (-not $ok) { throw 'Build APK bi loi' }
New-Item -ItemType Directory -Force dist | Out-Null
Copy-Item 'android\app\build\outputs\apk\release\app-release.apk' 'dist\truc-khe-tien-duyen.apk' -Force
Write-Host "Da build APK $Version -> dist\truc-khe-tien-duyen.apk"
