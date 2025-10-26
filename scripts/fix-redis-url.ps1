#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Fix Upstash Redis URL in .env.local

.DESCRIPTION
    This script helps identify and fix the incorrect Redis URL format.
    The UPSTASH_REDIS_REST_URL should use HTTPS, not the Redis protocol.

.NOTES
    The Upstash Redis REST client requires the REST API URL (https://...),
    not the direct Redis connection URL (rediss://...).
#>

$envFile = ".env.local"

Write-Host "`n=== Upstash Redis URL Fix ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    exit 1
}

$content = Get-Content $envFile -Raw

# Check current Redis URL
if ($content -match 'UPSTASH_REDIS_REST_URL="([^"]+)"') {
    $currentUrl = $matches[1]
    
    Write-Host "Current URL:" -ForegroundColor Yellow
    Write-Host "  $currentUrl" -ForegroundColor White
    Write-Host ""
    
    if ($currentUrl -match '^rediss://') {
        Write-Host "❌ PROBLEM DETECTED!" -ForegroundColor Red
        Write-Host "   The URL is using the Redis protocol (rediss://)" -ForegroundColor Red
        Write-Host "   It should use HTTPS for the REST API" -ForegroundColor Red
        Write-Host ""
        
        # Extract the host
        if ($currentUrl -match '@([^:]+):') {
            $redisHost = $matches[1]
            $suggestedUrl = "https://$redisHost"
            
            Write-Host "✅ SUGGESTED FIX:" -ForegroundColor Green
            Write-Host "   $suggestedUrl" -ForegroundColor Green
            Write-Host ""
            
            Write-Host "To fix this:" -ForegroundColor Cyan
            Write-Host "1. Go to https://console.upstash.com/" -ForegroundColor White
            Write-Host "2. Select your Redis database: $redisHost" -ForegroundColor White
            Write-Host "3. Look for 'REST URL' (not 'Endpoint')" -ForegroundColor White
            Write-Host "4. Copy that URL (should start with https://)" -ForegroundColor White
            Write-Host "5. Update UPSTASH_REDIS_REST_URL in .env.local" -ForegroundColor White
            Write-Host ""
            
            Write-Host "Expected format:" -ForegroundColor Yellow
            Write-Host "  UPSTASH_REDIS_REST_URL=`"$suggestedUrl`"" -ForegroundColor White
            Write-Host ""
            
            $response = Read-Host "Would you like me to update it automatically? (y/N)"
            
            if ($response -eq 'y' -or $response -eq 'Y') {
                $newContent = $content -replace 'UPSTASH_REDIS_REST_URL="rediss://[^"]+?"', "UPSTASH_REDIS_REST_URL=`"$suggestedUrl`""
                Set-Content -Path $envFile -Value $newContent -NoNewline
                
                Write-Host ""
                Write-Host "✅ Updated $envFile!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Next steps:" -ForegroundColor Cyan
                Write-Host "1. Verify the URL is correct in your Upstash dashboard" -ForegroundColor White
                Write-Host "2. Run: bun run build" -ForegroundColor White
                Write-Host ""
            } else {
                Write-Host ""
                Write-Host "Please update .env.local manually with the correct REST URL" -ForegroundColor Yellow
                Write-Host ""
            }
        }
    } elseif ($currentUrl -match '^https://') {
        Write-Host "✅ URL format is correct!" -ForegroundColor Green
        Write-Host "   Using HTTPS REST API endpoint" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠️  Unknown URL format" -ForegroundColor Yellow
        Write-Host "   Expected: https://your-redis-instance.upstash.io" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "❌ UPSTASH_REDIS_REST_URL not found in .env.local!" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  See docs/UPSTASH_INTEGRATION.md for more details" -ForegroundColor White
Write-Host ""
