Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "launcher\kill.bat", 0, True
WshShell.Run "launcher\launch.bat", 0, True