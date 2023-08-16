Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "kill.bat", 0, True
WshShell.Run "launch.bat", 0, True