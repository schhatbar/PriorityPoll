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
@"
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/priority_poll_db

# Session Secret (automatically generated)
SESSION_SECRET=$SESSION_SECRET

# Node Environment
NODE_ENV=production

# For Neon Database - forces standard connection mode instead of WebSocket
NEON_CONNECTION_TYPE=standard
"@ | Out-File -FilePath ".env" -Encoding utf8

Write-Host "Secrets generated successfully!" -ForegroundColor Green
Write-Host "SESSION_SECRET has been set to a secure random value."
Write-Host "Environment file (.env) has been created."