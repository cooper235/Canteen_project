$files = Get-ChildItem -Path "src" -Include "*.tsx","*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName | Out-String
    $originalContent = $content
    
    # Replace /api/ with ${API_URL}/
    # Matches fetch('/api/ or fetch("/api/
    $content = $content -replace "fetch\(['`"]/api/", "fetch(`${API_URL}/"
    
    # Replace / with ${API_URL}/ (excluding /api/)
    # Matches fetch('/ or fetch("/
    $content = $content -replace "fetch\(['`"]/(?!api/)", "fetch(`${API_URL}/"
    
    if ($content -ne $originalContent) {
        # Add import if missing
        if ($content -notmatch "import.*API_URL") {
            if ($content -match "import") {
                $content = $content -replace "(import.*(\r?\n|$))(?!(import))", "$1import { API_URL } from '@/lib/config';`n"
            } else {
                $content = "import { API_URL } from '@/lib/config';`n" + $content
            }
        }
        
        $content | Set-Content -LiteralPath $file.FullName -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}
