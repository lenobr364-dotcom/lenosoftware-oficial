<#
.SYNOPSIS
  Backup rápido do SQLite ChemVault + ficheiros principais do projeto.
  Não copia .env / .env.local (segredos). Use exportação manual se precisar de variáveis.
#>
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Dest = Join-Path $Root "backups\chemvault-$Stamp"
New-Item -ItemType Directory -Force -Path $Dest | Out-Null

Write-Host "Backup -> $Dest"

# Base de dados SQLite (caminho habitual do repo)
$dbCandidates = @(
  (Join-Path $Root "prisma\dev.db"),
  (Join-Path $Root "dev.db")
)
foreach ($db in $dbCandidates) {
  if (Test-Path -LiteralPath $db) {
    Copy-Item -LiteralPath $db -Destination (Join-Path $Dest "dev.db") -Force
    Write-Host "  + DB: $db"
    break
  }
}

# Prisma (schema + migrações)
$prismaDir = Join-Path $Root "prisma"
if (Test-Path -LiteralPath $prismaDir) {
  $prismaDest = Join-Path $Dest "prisma"
  New-Item -ItemType Directory -Force -Path $prismaDest | Out-Null
  Copy-Item (Join-Path $prismaDir "schema.prisma") $prismaDest -Force -ErrorAction SilentlyContinue
  $mig = Join-Path $prismaDir "migrations"
  if (Test-Path -LiteralPath $mig) {
    Copy-Item -LiteralPath $mig -Destination (Join-Path $prismaDest "migrations") -Recurse -Force
  }
  Write-Host "  + prisma/schema.prisma (+ migrations se existirem)"
}

# Ficheiros de configuração e i18n (sem segredos)
$extras = @(
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tsconfig.json",
  ".env.example",
  "middleware.ts"
)
foreach ($rel in $extras) {
  $src = Join-Path $Root $rel
  if (Test-Path -LiteralPath $src) {
    Copy-Item -LiteralPath $src -Destination (Join-Path $Dest (Split-Path $rel -Leaf)) -Force
    Write-Host "  + $rel"
  }
}

$messages = Join-Path $Root "messages"
if (Test-Path -LiteralPath $messages) {
  Copy-Item -LiteralPath $messages -Destination (Join-Path $Dest "messages") -Recurse -Force
  Write-Host "  + messages/"
}

Write-Host "Done."
