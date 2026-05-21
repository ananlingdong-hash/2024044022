$prompt = Get-Content -Path "C:\Users\id_30\ai-stock-platform\.task-ui-redesign.md" -Raw
Set-Location "C:\Users\id_30\ai-stock-platform"
& claude --permission-mode bypassPermissions --print $prompt
