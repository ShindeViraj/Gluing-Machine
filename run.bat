@echo off
:: Change directory to where the batch file is located
cd /d "%~dp0"

echo ========================================================
echo Starting Gluing Machine Reporting Software...
echo ========================================================

echo The application will be available at http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.
call npm run dev

pause
