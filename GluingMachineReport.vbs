' This script checks if the dashboard is already running on port 3000.
' If it is running, it exits silently.
' If it is NOT running, it starts it silently in the background.

Set objHTTP = CreateObject("MSXML2.ServerXMLHTTP")
On Error Resume Next

' Try to connect to the dashboard
objHTTP.Open "GET", "http://localhost:3000", False
objHTTP.Send

' Err.Number will be 0 if the server responded. It will be non-zero if the server is offline.
If Err.Number <> 0 Then
    ' The server is offline, start it silently (0 means hidden window)
    Set WshShell = CreateObject("WScript.Shell")
    WshShell.Run chr(34) & "C:\Gluing Machine Report\start-dashboard.bat" & Chr(34), 0
    Set WshShell = Nothing
End If

On Error GoTo 0
