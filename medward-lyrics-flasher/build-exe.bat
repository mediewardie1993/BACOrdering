@echo off
cd /d "%~dp0"
call npm install
if errorlevel 1 goto fail
call npm run dist
if errorlevel 1 goto fail
echo.
echo Done! Your exe is in the "dist" folder: Medward-Lyrics-Flasher.exe
pause
exit /b 0
:fail
echo Build failed. Make sure Node.js (nodejs.org) is installed.
pause
