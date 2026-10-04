# TradePath IL — install agent skills into this project for Claude Code.
# Run from the project root in PowerShell:   .\scripts\install-skills.ps1
# Add -Optional to also install the optional set.
# Skills are copied to .claude\skills\ . Read each SKILL.md before first use
# (skills run with the agent's full permissions) and commit them to Git.

param([switch]$Optional)

$ErrorActionPreference = "Stop"

function Add-Skills($repo, [string[]]$skills) {
    Write-Host "`n== $repo : $($skills -join ', ')" -ForegroundColor Cyan
    npx -y skills add $repo -s @skills -a claude-code -y
    if ($LASTEXITCODE -ne 0) { throw "Failed to install from $repo" }
}

# --- Core -------------------------------------------------------------------
Add-Skills "supabase/agent-skills"        @("supabase", "supabase-postgres-best-practices")
Add-Skills "vercel-labs/agent-skills"     @("vercel-react-best-practices", "web-design-guidelines")
Add-Skills "shadcn-ui/ui"                 @("shadcn")
Add-Skills "anthropics/skills"            @("frontend-design", "webapp-testing")
Add-Skills "tradingview/lightweight-charts" @("lightweight-charts")
Add-Skills "obra/superpowers"             @("test-driven-development", "verification-before-completion", "systematic-debugging")

# --- Optional ---------------------------------------------------------------
if ($Optional) {
    Add-Skills "anthropics/skills"        @("claude-api")                 # Phase 8: AI tutor
    Add-Skills "vercel-labs/agent-skills" @("deploy-to-vercel")           # Phase 8: deployment
    Add-Skills "wshobson/agents"          @("nextjs-app-router-patterns", "wcag-audit-patterns",
                                            "risk-metrics-calculation", "backtesting-frameworks")
    Add-Skills "microsoft/playwright-cli" @("playwright-cli")
}

Write-Host "`nInstalled skills:" -ForegroundColor Green
Get-ChildItem .claude\skills -Directory | ForEach-Object { " - $($_.Name)" }
