$files = Get-ChildItem -Path "src" -Include "*.tsx","*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName | Out-String
    $originalContent = $content
    
    # Fix 1: Missing import keyword
    # Matches " { API_URL } from" at start of line
    $content = $content -replace "(?m)^\s*\{ API_URL \} from", "import { API_URL } from"
    
    # Fix 2: Broken fetch syntax
    # Current state: fetch(${API_URL}/path/to/resource',
    # Desired state: fetch(`${API_URL}/path/to/resource`,
    
    # We use [Regex]::Replace to handle the capture group $1 correctly
    # Pattern matches: fetch(${API_URL} ... '
    $content = [Regex]::Replace($content, "fetch\(\$\{API_URL\}(.*?)'", 'fetch(`${API_URL}$1`')
    
    if ($content -ne $originalContent) {
        $content | Set-Content -LiteralPath $file.FullName -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}
