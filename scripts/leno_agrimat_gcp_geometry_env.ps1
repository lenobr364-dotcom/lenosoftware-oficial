#Requires -Version 5.1
<#
.SYNOPSIS
  Leno.Software — Ativa ferramentas GCP para pipeline de geometrias (RAMO 200 / Agrimat).
.DESCRIPTION
  Usa gcloud SDK (conta já autenticada, ex. lenobr364@gmail.com).
  Defina $env:LENO_GCP_PROJECT ao ID do projeto antes de executar, ou passe -ProjectId.
#>
param(
    [string]$ProjectId = $env:LENO_GCP_PROJECT
)

$ErrorActionPreference = "Stop"
$Gcloud = Join-Path $env:LOCALAPPDATA "Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
if (-not (Test-Path $Gcloud)) {
    $Gcloud = "${env:ProgramFiles}\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
}
if (-not (Test-Path $Gcloud)) {
    Write-Error "gcloud.cmd não encontrado. Instale o Google Cloud SDK."
}

Write-Host "=== Leno.Software - GCP geometrias ===" -ForegroundColor Cyan
& $Gcloud auth list --filter=status:ACTIVE --format="value(account)"
if (-not $ProjectId) {
    Write-Host 'Defina: $env:LENO_GCP_PROJECT ou -ProjectId' -ForegroundColor Yellow
    & $Gcloud projects list '--format=table(projectId,name)' --limit=10
    exit 0
}
Write-Host "Projeto ativo: $ProjectId" -ForegroundColor Green
& $Gcloud config set project $ProjectId
$prevEA = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& $Gcloud services enable storage.googleapis.com --project=$ProjectId 2>&1 | Out-Null
$ErrorActionPreference = $prevEA
Write-Host "OK. Proximo passo - criar bucket, ex.:" -ForegroundColor Cyan
Write-Host '  gsutil mb -l southamerica-east1 gs://leno-software-agrimat-dados' -ForegroundColor Gray
