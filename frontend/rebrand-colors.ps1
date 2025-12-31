# Color Rebranding Script - Replace Indigo with Green
# Brand Colors: Green #098827, Gold #E9BE25

$componentsPath = "c:\Users\niyon\OneDrive\Desktop\MyGF AI App\components"

# Color mappings from indigo to green (using Tailwind classes)
$colorMappings = @{
    'bg-indigo-600' = 'bg-green-600'
    'bg-indigo-700' = 'bg-green-700'
    'bg-indigo-500' = 'bg-green-500'
    'bg-indigo-400' = 'bg-green-400'
    'bg-indigo-100' = 'bg-green-100'
    'bg-indigo-50' = 'bg-green-50'
    'bg-indigo-900' = 'bg-green-900'
    
    'hover:bg-indigo-600' = 'hover:bg-green-600'
    'hover:bg-indigo-700' = 'hover:bg-green-700'
    'hover:bg-indigo-500' = 'hover:bg-green-500'
    'hover:bg-indigo-200' = 'hover:bg-green-200'
    'hover:bg-indigo-50' = 'hover:bg-green-50'
    'hover:bg-indigo-900' = 'hover:bg-green-900'
    
    'text-indigo-600' = 'text-green-600'
    'text-indigo-700' = 'text-green-700'
    'text-indigo-500' = 'text-green-500'
    'text-indigo-400' = 'text-green-400'
    'text-indigo-300' = 'text-green-300'
    
    'dark:text-indigo-600' = 'dark:text-green-600'
    'dark:text-indigo-400' = 'dark:text-green-400'
    'dark:text-indigo-300' = 'dark:text-green-300'
    
    'border-indigo-600' = 'border-green-600'
    'border-indigo-500' = 'border-green-500'
    'border-indigo-400' = 'border-green-400'
    'border-indigo-200' = 'border-green-200'
    'border-indigo-100' = 'border-green-100'
    'border-indigo-800' = 'border-green-800'
    'border-indigo-900' = 'border-green-900'
    
    'dark:border-indigo-500' = 'dark:border-green-500'
    'dark:border-indigo-800' = 'dark:border-green-800'
    'dark:border-indigo-900' = 'dark:border-green-900'
    
    'focus:ring-indigo-500' = 'focus:ring-green-500'
    'focus:border-indigo-500' = 'focus:border-indigo-500'
    
    'disabled:bg-indigo-400' = 'disabled:bg-green-400'
    
    'dark:bg-indigo-900' = 'dark:bg-green-900'
    'dark:bg-indigo-50' = 'dark:bg-green-50'
    'dark:hover:bg-indigo-900' = 'dark:hover:bg-green-900'
    'dark:hover:bg-indigo-50' = 'dark:hover:bg-green-50'
    
    'hover:shadow-indigo-500' = 'hover:shadow-green-500'
    'shadow-indigo-500' = 'shadow-green-500'
    
    'from-indigo-600' = 'from-green-600'
    'to-purple-600' = 'to-teal-600'
    
    'accent-indigo-600' = 'accent-green-600'
}

# Get all .tsx and .ts files
$files = Get-ChildItem -Path $componentsPath -Recurse -Include *.tsx,*.ts

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($old in $colorMappings.Keys) {
        $new = $colorMappings[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $fileReplacements++
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalFiles++
        $totalReplacements += $fileReplacements
        Write-Host "Updated: $($file.Name) - $fileReplacements replacements"
    }
}

Write-Host "`nTotal files updated: $totalFiles"
Write-Host "Total replacements made: $totalReplacements"
