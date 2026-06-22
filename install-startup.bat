@echo off
set "VBS_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\GluingMachineReport.vbs"
set "BAT_PATH=%~dp0start-dashboard.bat"

echo Set WshShell = CreateObject("WScript.Shell") > "%VBS_PATH%"
echo WshShell.Run chr(34) ^& "%BAT_PATH%" ^& Chr(34), 0 >> "%VBS_PATH%"
echo Set WshShell = Nothing >> "%VBS_PATH%"

echo Startup script installed successfully!
echo The dashboard will now start silently in the background when this computer turns on.
pause
