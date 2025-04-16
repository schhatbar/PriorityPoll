Write-Host "Starting Priority Polling Application..." -ForegroundColor Cyan
node run-local.js
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")