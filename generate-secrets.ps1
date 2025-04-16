# PowerShell script to generate secure secrets for deployment

# Generate a random 64-character string for SESSION_SECRET
function Get-RandomSecret {
    $bytes = New-Object Byte[] 48
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [System.Convert]::ToBase64String($bytes)
}

$SESSION_SECRET = Get-RandomSecret

# Create .env file with the generated secrets
Set-Content -Path ".env" -Value "# Database Configuration" -Encoding utf8
Add-Content -Path ".env" -Value "DATABASE_URL=postgresql://postgres:postgres@db:5432/priority_poll_db" -Encoding utf8
Add-Content -Path ".env" -Value ""
Add-Content -Path ".env" -Value "# Session Secret (automatically generated)" -Encoding utf8
Add-Content -Path ".env" -Value "SESSION_SECRET=$SESSION_SECRET" -Encoding utf8
Add-Content -Path ".env" -Value ""
Add-Content -Path ".env" -Value "# Node Environment" -Encoding utf8
Add-Content -Path ".env" -Value "NODE_ENV=production" -Encoding utf8
Add-Content -Path ".env" -Value ""
Add-Content -Path ".env" -Value "# For Neon Database - forces standard connection mode instead of WebSocket" -Encoding utf8
Add-Content -Path ".env" -Value "NEON_CONNECTION_TYPE=standard" -Encoding utf8
Add-Content -Path ".env" -Value "# Server configuration" -Encoding utf8
Add-Content -Path ".env" -Value "PORT=5000" -Encoding utf8
Add-Content -Path ".env" -Value "HOST=0.0.0.0" -Encoding utf8

Write-Host "Secrets generated successfully!" -ForegroundColor Green
Write-Host "SESSION_SECRET has been set to a secure random value."
Write-Host "Environment file (.env) has been created."