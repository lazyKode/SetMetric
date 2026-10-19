@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo ==========================================
echo  SETMETRIC 1.4 - GITHUB DESKTOP UPDATE
 echo ==========================================
echo.
echo This copies the updated app SOURCE into your local SetMetric repository.
echo It does not publish anything until you commit and push in GitHub Desktop.
echo.
set "TARGET=%USERPROFILE%\Documents\GitHub\SetMetric"
if not exist "%TARGET%\.git" (
  echo Default folder not found: %TARGET%
  set /p "TARGET=Paste the local SetMetric repository folder path: "
)
if not exist "%TARGET%\.git" (
  echo ERROR: Not a cloned GitHub repository. Use GitHub Desktop ^> Clone repository.
  pause
  exit /b 1
)
findstr /I /C:"SetMetric" "%TARGET%\.git\config" >nul
if errorlevel 1 (
 echo ERROR: The selected folder does not appear to be the SetMetric GitHub repository.
 pause
 exit /b 1
)
echo Updating %TARGET%
for %%F in ("App.tsx" "app.json" "package.json" "tsconfig.core.json" "TRAINING_RESEARCH_AND_RULES.md" "WHATS_NEW_v1.4.md") do copy /Y "%%~fF" "%TARGET%\%%~nxF" >nul
xcopy /E /I /Y "src" "%TARGET%\src" >nul
xcopy /E /I /Y "tests" "%TARGET%\tests" >nul
xcopy /E /I /Y "scripts" "%TARGET%\scripts" >nul
xcopy /E /I /Y ".github" "%TARGET%\.github" >nul
if errorlevel 1 (echo Some files could not be copied.& pause & exit /b 1)
echo.
echo Source updated. Next: GitHub Desktop - SetMetric - Commit to main - Push origin.
echo Then GitHub Actions - Build SetMetric iPhone and Android Apps - Run workflow.
echo.
pause
