$files = Get-ChildItem -Path "src" -Include "*.tsx","*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName | Out-String
    $modified = $content -replace 'http://localhost:5000/api', '${API_URL}' -replace 'http://localhost:5000', '${BASE_URL}'
    
    if ($content -ne $modified) {
        $modified | Set-Content $file.FullName -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "`nDone! Remember to add import { API_URL, BASE_URL } from '@/lib/config'; to files that use these variables."
