$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$backupName = "1380_Yedek_$timestamp.zip"

Write-Host "Creating backup: $backupName"
tar.exe -a -c -f $backupName --exclude=node_modules --exclude=dist --exclude=.git --exclude=.gemini --exclude=.agents --exclude=*.zip *

attrib +R $backupName
Write-Host "Backup created and locked: $backupName"

# Retention logic: keep last 5 backups
$backups = Get-ChildItem -Filter "1380_Yedek_*.zip" | Sort-Object LastWriteTime -Descending
$count = $backups.Count

Write-Host "Total backups found: $count"

if ($count -gt 5) {
    for ($i = 5; $i -lt $count; $i++) {
        $fileToDelete = $backups[$i]
        Write-Host "Removing old backup: $($fileToDelete.Name)"
        attrib -R $fileToDelete.FullName
        Remove-Item -Force $fileToDelete.FullName
    }
} else {
    Write-Host "No old backups to remove. Retention limit not reached."
}
