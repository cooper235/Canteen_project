$files = Get-ChildItem -Path "src" -Include "*.tsx","*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName | Out-String
    $modified = $content -replace 'http://localhost:5000/api', '${API_URL}' -replace 'http://localhost:5000', '${BASE_URL}'
    
    if ($content -ne $modified) {
        # Check if import needs to be added
        if ($modified -notmatch "import.*API_URL") {
            # Add import after the last import or at the top
            if ($modified -match "import") {
                $modified = $modified -replace "(import.*(\r?\n|$))(?!(import))", "$1import { API_URL, BASE_URL } from '@/lib/config';`n"
            } else {
                $modified = "import { API_URL, BASE_URL } from '@/lib/config';`n" + $modified
            }
        }
        
        $modified | Set-Content -LiteralPath $file.FullName -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}
