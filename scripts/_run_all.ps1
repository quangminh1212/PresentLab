$ErrorActionPreference = "Continue"
$root = "C:\Dev\PresentLab"
$logdir = "$root\fetch-logs"
New-Item -ItemType Directory -Force -Path $logdir | Out-Null
$slugs = @("leonardo-da-vinci","michelangelo","raphael","botticelli","titian","duerer")
$procs = @()
foreach ($s in $slugs) {
    $log = "$logdir\$s.log"
    $p = Start-Process -FilePath "python" -WorkingDirectory $root `
        -ArgumentList "scripts/fetch-artwork.py","scripts/specs/$s.json" `
        -RedirectStandardOutput $log -RedirectStandardError "$logdir\$s.err" `
        -PassThru -WindowStyle Hidden
    $procs += $p
    Write-Output "started $s pid=$($p.Id)"
}
Write-Output "waiting for $($procs.Count) fetches..."
$procs | ForEach-Object { $_.WaitForExit() }
Write-Output "ALL DONE"
foreach ($p in $procs) { Write-Output "pid $($p.Id) exit=$($p.ExitCode)" }
