@echo off
:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin
) else (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit /b
)

:admin
:: Change directory to where the batch file is located
cd /d "%~dp0"

echo ========================================================
echo Initializing Gluing Machine Reporting Software
echo ========================================================
echo.
echo This script will install all required dependencies.
echo It only needs to be run ONCE on a new machine.
echo.

echo [1/2] Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo [2/2] Syncing Database Schema with Prisma...
call npx prisma db push

echo.
echo ========================================================
echo Initialization complete! 
echo You can now use run.bat to start the software normally.
echo ========================================================
pause
