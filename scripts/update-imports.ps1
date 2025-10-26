# Update all imports to new structure

$files = Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx -Recurse | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and 
    $_.FullName -notmatch '\\.next\\' -and 
    $_.FullName -notmatch '\\out\\' -and
    (Test-Path $_.FullName)
}

$count = 0
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $original = $content
        
        # Auth imports
        $content = $content -replace 'from ["'']@/lib/auth["'']', 'from "@/lib/auth"'
        $content = $content -replace 'from ["'']@/lib/auth-client["'']', 'from "@/lib/auth/client"'
        $content = $content -replace 'from ["'']@/lib/auth-utils["'']', 'from "@/lib/auth/utils"'
        $content = $content -replace 'from ["'']@/lib/validations/auth["'']', 'from "@/lib/auth/validations"'
        
        # Media imports
        $content = $content -replace 'from ["'']@/lib/media-config["'']', 'from "@/lib/media/config"'
        $content = $content -replace 'from ["'']@/lib/media-types["'']', 'from "@/lib/media/types"'
        $content = $content -replace 'from ["'']@/lib/media-utils["'']', 'from "@/lib/media/utils"'
        
        # Service imports  
        $content = $content -replace 'from ["'']@/lib/qstash["'']', 'from "@/services/qstash"'
        $content = $content -replace 'from ["'']@/lib/redis["'']', 'from "@/services/redis"'
        $content = $content -replace 'from ["'']@/lib/rate-limit["'']', 'from "@/services/rate-limit"'
        $content = $content -replace 'from ["'']@/lib/realtime["'']', 'from "@/services/realtime"'
        $content = $content -replace 'from ["'']@/lib/global-update-service["'']', 'from "@/services/global-update"'
        $content = $content -replace 'from ["'']@/lib/email["'']', 'from "@/services/email"'
        
        # Utility imports (rename)
        $content = $content -replace 'from ["'']@/lib/stats-utils["'']', 'from "@/lib/stats"'
        $content = $content -replace 'from ["'']@/lib/leaderboard-utils["'']', 'from "@/lib/leaderboard"'
        $content = $content -replace 'from ["'']@/lib/time-utils["'']', 'from "@/lib/time"'
        $content = $content -replace 'from ["'']@/lib/timezone-utils["'']', 'from "@/lib/timezone"'
        
        # Scripts relative imports
        $content = $content -replace 'from ["'']\.\./lib/qstash["'']', 'from "../services/qstash"'
        $content = $content -replace 'from ["'']\.\./lib/email["'']', 'from "../services/email"'
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content
            $count++
            Write-Host "Updated: $($file.FullName)"
        }
    } catch {
        Write-Warning "Skipped: $($file.FullName)"
    }
}

Write-Host "`nImport updates complete! Updated $count files."
