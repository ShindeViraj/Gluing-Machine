@echo off
cd /d "%~dp0"
echo Building application for production...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Build failed! Please fix the errors above.
    pause
    exit /b %ERRORLEVEL%
)
echo Starting production server...
npm run start
pause
