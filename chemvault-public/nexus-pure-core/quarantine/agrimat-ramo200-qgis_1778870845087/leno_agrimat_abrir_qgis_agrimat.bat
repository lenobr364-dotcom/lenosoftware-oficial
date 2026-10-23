@echo off
setlocal EnableDelayedExpansion
REM Leno.Software — QGIS + camadas Agrimat RAMO 200 (EPSG:31981).
set "LENO_AGRIMAT_DIR=%~dp0"
set "LENO_AGRIMAT_DIR=!LENO_AGRIMAT_DIR:~0,-1!"

set "QGIS_BIN="
for /f "delims=" %%i in ('where /R "%ProgramFiles%" qgis-bin-ltr.exe 2^>nul ^| findstr /i "\\bin\\"') do (
  set "QGIS_BIN=%%i"
  goto :run
)
for /f "delims=" %%i in ('where /R "%ProgramFiles%" qgis-bin.exe 2^>nul ^| findstr /i "\\bin\\"') do (
  set "QGIS_BIN=%%i"
  goto :run
)
for /f "delims=" %%i in ('where /R "%ProgramFiles(x86)%" qgis-bin-ltr.exe 2^>nul ^| findstr /i "\\bin\\"') do (
  set "QGIS_BIN=%%i"
  goto :run
)

echo Nao foi encontrado qgis-bin-ltr.exe nem qgis-bin.exe sob Program Files.
echo Ajuste manualmente a variavel QGIS_BIN neste ficheiro para o seu QGIS.
pause
exit /b 1

:run
echo LENO_AGRIMAT_DIR=!LENO_AGRIMAT_DIR!
echo QGIS=!QGIS_BIN!
start "" "!QGIS_BIN!" --code "%~dp0leno_agrimat_qgis_carregar_agrimat.py"
endlocal
exit /b 0
