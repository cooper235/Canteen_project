$files = @(
    "src\app\(main)\announcements\page.tsx",
    "src\app\(main)\checkout\page.tsx",
    "src\app\(main)\manage\canteen\page.tsx",
    "src\app\(main)\manage\dashboard\page.tsx",
    "src\app\(main)\manage\menu\page.tsx",
    "src\app\(main)\manage\orders\page.tsx",
    "src\app\(main)\orders\page.tsx",
    "src\app\(main)\profile\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content -LiteralPath $file | Out-String
        $modified = $false
        
        # Check if missing useState import
        if ($content -match "useState" -and $content -notmatch "import.*useState") {
            if ($content -match "^import { useState") {
                # Already has it at the start (shouldn't happen but check)
            } elseif ($content -match "^import .* from 'react';") {
                # Add useState to existing react import
                $content = $content -replace "^(import .*)( from 'react';)", '$1, useState$2'
            } else {
                # Add new react import after 'use client'
                $content = $content -replace "('use client';[\r\n]+)", "$1import { useState } from 'react';`n"
            }
            $modified = $true
        }
        
        # Check if missing themeClasses
        if ($content -match "themeClasses" -and $content -notmatch "import.*themeClasses") {
            $content = $content -replace "('use client';[\r\n]+)", "$1import { themeClasses, animations } from '@/lib/theme';`n"
            $modified = $true
        }
        
        # Check if missing useToast
        if ($content -match "useToast" -and $content -notmatch "import.*useToast") {
            $content = $content -replace "('use client';[\r\n]+)", "$1import { useToast } from '@/contexts/ToastContext';`n"
            $modified = $true
        }
        
        # Check if missing useSocket
        if ($content -match "useSocket" -and $content -notmatch "import.*useSocket") {
            $content = $content -replace "('use client';[\r\n]+)", "$1import { useSocket } from '@/contexts/SocketContext';`n"
            $modified = $true
        }
        
        if ($modified) {
            $content | Set-Content -LiteralPath $file -NoNewline
            Write-Host "Fixed imports in: $file"
        }
    }
}
