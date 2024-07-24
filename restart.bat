@echo off
REM Reiniciar procesos Node.js y Python y volver a ejecutar run.bat

echo Shutting down python...
taskkill /F /IM python.exe

echo Shutting down the UI...
taskkill /F /IM node.exe

timeout /T 2

REM Ejecutar run.bat
echo Restarting...
call run.bat