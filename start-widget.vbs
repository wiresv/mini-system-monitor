Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d C:\Users\wires\Tools\sysmon-widget && npm start", 0, False
